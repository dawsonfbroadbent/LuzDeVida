"""
Score all records using the trained ML models and write predictions
to the Azure SQL prediction tables.

Usage:
    python score_and_upload.py --connection-string "Server=...;Database=...;..."

Or set the CONNECTION_STRING environment variable.

This script:
  1. Connects to the Azure SQL database
  2. Loads the saved .joblib models
  3. Scores all relevant records (supporters, residents, social media posts)
  4. Writes predictions to ml_donor_churn_predictions,
     ml_resident_risk_predictions, and ml_social_media_predictions
"""

import os
import sys
import argparse
from datetime import datetime, timezone

import joblib
import numpy as np
import pandas as pd
import pyodbc

# ---------------------------------------------------------------------------
#  Paths
# ---------------------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(SCRIPT_DIR, "models")


def get_connection(conn_str: str):
    """Open a pyodbc connection to Azure SQL."""
    return pyodbc.connect(conn_str)


# =========================================================================
#  Donor Churn
# =========================================================================
def score_donor_churn(conn):
    print("Scoring donor churn...")
    model = joblib.load(os.path.join(MODELS_DIR, "donor_churn_model.joblib"))
    config = joblib.load(os.path.join(MODELS_DIR, "feature_config.joblib"))
    numeric_features = config["numeric_features"]
    categorical_features = config["categorical_features"]

    supporters = pd.read_sql("SELECT * FROM supporters WHERE status = 'active'", conn)
    donations = pd.read_sql("SELECT * FROM donations", conn)
    allocations = pd.read_sql("SELECT * FROM donation_allocations", conn)
    social_posts = pd.read_sql("SELECT post_id, engagement_rate FROM social_media_posts", conn)

    rows = []
    for _, s in supporters.iterrows():
        sid = s["supporter_id"]
        s_don = donations[donations["supporter_id"] == sid].sort_values("donation_date")
        if len(s_don) == 0:
            continue

        # avg_days_between_donations
        dates = pd.to_datetime(s_don["donation_date"].dropna()).sort_values()
        avg_days = float(dates.diff().dt.days.mean()) if len(dates) > 1 else 0.0

        monetary = s_don[s_don["donation_type"] == "monetary"]
        avg_amount = float(monetary["amount"].fillna(0).mean()) if len(monetary) > 0 else 0.0

        num_campaigns = s_don["campaign_name"].dropna().nunique()
        num_channels = s_don["channel_source"].nunique()

        don_ids = set(s_don["donation_id"])
        s_alloc = allocations[allocations["donation_id"].isin(don_ids)]
        num_program_areas = s_alloc["program_area"].nunique()

        inkind = s_don[s_don["donation_type"] == "in-kind"]

        ref_ids = s_don["referral_post_id"].dropna().astype(int).tolist()
        avg_ref_eng = 0.0
        if ref_ids:
            ref_posts = social_posts[social_posts["post_id"].isin(ref_ids)]
            if len(ref_posts) > 0:
                avg_ref_eng = float(ref_posts["engagement_rate"].fillna(0).mean())

        preferred_channel = (
            s_don["channel_source"].dropna()
            .value_counts().index[0]
            if s_don["channel_source"].notna().any() else "unknown"
        )

        preferred_program = (
            s_alloc["program_area"].dropna()
            .value_counts().index[0]
            if len(s_alloc) > 0 and s_alloc["program_area"].notna().any() else "unknown"
        )

        rows.append({
            "supporter_id": sid,
            "display_name": s.get("display_name"),
            "email": s.get("email"),
            # numeric
            "avg_days_between_donations": avg_days,
            "avg_donation_amount": avg_amount,
            "num_campaigns": num_campaigns,
            "num_channels": num_channels,
            "num_program_areas": num_program_areas,
            "inkind_donation_count": len(inkind),
            "has_inkind": 1.0 if len(inkind) > 0 else 0.0,
            "num_social_referrals": len(ref_ids),
            "avg_referral_post_engagement": avg_ref_eng,
            # categorical
            "supporter_type": s.get("supporter_type") or "unknown",
            "acquisition_channel": s.get("acquisition_channel") or "unknown",
            "region": s.get("region") or "unknown",
            "relationship_type": s.get("relationship_type") or "unknown",
            "preferred_channel": preferred_channel,
            "preferred_program_area": preferred_program,
        })

    if not rows:
        print("  No active supporters with donations found.")
        return

    df = pd.DataFrame(rows)
    X = df[numeric_features + categorical_features]
    probas = model.predict_proba(X)[:, 1]

    df["churn_risk_score"] = np.round(probas, 4)
    df["risk_tier"] = df["churn_risk_score"].apply(
        lambda s: "High" if s >= 0.6 else "Medium" if s >= 0.3 else "Low"
    )

    now = datetime.now(timezone.utc)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM ml_donor_churn_predictions")
    for _, r in df.iterrows():
        cursor.execute(
            """INSERT INTO ml_donor_churn_predictions
               (supporter_id, display_name, email, churn_risk_score, risk_tier, scored_at)
               VALUES (?, ?, ?, ?, ?, ?)""",
            int(r["supporter_id"]), r["display_name"], r["email"],
            float(r["churn_risk_score"]), r["risk_tier"], now,
        )
    conn.commit()
    print(f"  Wrote {len(df)} donor churn predictions.")


# =========================================================================
#  Resident Risk
# =========================================================================
def score_resident_risk(conn):
    print("Scoring resident risk...")
    model = joblib.load(os.path.join(MODELS_DIR, "resident_risk_model.joblib"))
    config = joblib.load(os.path.join(MODELS_DIR, "resident_risk_feature_config.joblib"))
    numeric_features = config["numeric_features"]

    residents = pd.read_sql(
        """SELECT r.*, s.name AS safehouse_name, s.capacity_girls
           FROM residents r
           LEFT JOIN safehouses s ON s.safehouse_id = r.safehouse_id
           WHERE r.case_status = 'active'""", conn)
    health = pd.read_sql("SELECT * FROM health_wellbeing_records", conn)
    incidents = pd.read_sql("SELECT * FROM incident_reports", conn)
    recordings = pd.read_sql("SELECT * FROM process_recordings", conn)

    rows = []
    for _, r in residents.iterrows():
        rid = r["resident_id"]
        rh = health[health["resident_id"] == rid]
        ri = incidents[incidents["resident_id"] == rid]
        rr = recordings[recordings["resident_id"] == rid]

        health_mean = float(rh["general_health_score"].fillna(0).mean()) if len(rh) > 0 else 0.0
        nutrition_mean = float(rh["nutrition_score"].fillna(0).mean()) if len(rh) > 0 else 0.0
        sleep_mean = float(rh["sleep_score"].fillna(0).mean()) if len(rh) > 0 else 0.0
        bmi_latest = float(rh.sort_values("record_date", ascending=False).iloc[0].get("bmi") or 0) if len(rh) > 0 else 0.0
        medical_prop = float((rh["medical_checkup_done"] == True).sum() / len(rh)) if len(rh) > 0 else 0.0
        dental_prop = float((rh["dental_checkup_done"] == True).sum() / len(rh)) if len(rh) > 0 else 0.0
        psych_prop = float((rh["psychological_checkup_done"] == True).sum() / len(rh)) if len(rh) > 0 else 0.0
        incident_res_rate = float((ri["resolved"] == True).sum() / len(ri)) if len(ri) > 0 else 0.0
        session_dur_mean = float(rr["session_duration_minutes"].fillna(0).mean()) if len(rr) > 0 else 0.0

        admission = pd.to_datetime(r.get("date_of_admission"), errors="coerce")
        los_months = 0.0
        if pd.notna(admission):
            los_months = (datetime.now(timezone.utc) - admission).days / 30.44

        rows.append({
            "resident_id": rid,
            "case_control_no": r.get("case_control_no"),
            "internal_code": r.get("internal_code"),
            "safehouse_name": r.get("safehouse_name"),
            "family_informal_settler": 1.0 if r.get("family_informal_settler") else 0.0,
            "capacity_girls": float(r.get("capacity_girls") or 0),
            "length_of_stay_months": los_months,
            "general_health_score_mean": health_mean,
            "nutrition_score_mean": nutrition_mean,
            "sleep_quality_score_mean": sleep_mean,
            "bmi_latest": bmi_latest,
            "medical_checkup_done_prop": medical_prop,
            "dental_checkup_done_prop": dental_prop,
            "psychological_checkup_done_prop": psych_prop,
            "incident_resolution_rate": incident_res_rate,
            "session_duration_mean": session_dur_mean,
        })

    if not rows:
        print("  No active residents found.")
        return

    df = pd.DataFrame(rows)
    X = df[numeric_features]
    probas = model.predict_proba(X)[:, 1]

    df["risk_score"] = np.round(probas, 4)
    df["risk_tier"] = df["risk_score"].apply(
        lambda s: "Critical" if s >= 0.90 else "High" if s >= 0.75 else "Moderate" if s >= 0.50 else "Low"
    )

    now = datetime.now(timezone.utc)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM ml_resident_risk_predictions")
    for _, r in df.iterrows():
        cursor.execute(
            """INSERT INTO ml_resident_risk_predictions
               (resident_id, case_control_no, internal_code, safehouse_name,
                risk_score, risk_tier, scored_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            int(r["resident_id"]), r["case_control_no"], r["internal_code"],
            r["safehouse_name"], float(r["risk_score"]), r["risk_tier"], now,
        )
    conn.commit()
    print(f"  Wrote {len(df)} resident risk predictions.")


# =========================================================================
#  Social Media
# =========================================================================
def score_social_media(conn):
    print("Scoring social media posts...")
    model = joblib.load(os.path.join(MODELS_DIR, "social_media_model.joblib"))
    config = joblib.load(os.path.join(MODELS_DIR, "social_media_feature_config.joblib"))
    features = config["features"]

    posts = pd.read_sql("SELECT * FROM social_media_posts", conn)
    if len(posts) == 0:
        print("  No social media posts found.")
        return

    encoded = pd.DataFrame()
    encoded["post_hour"] = posts["post_hour"].fillna(12)
    encoded["caption_length"] = posts["caption_length"].fillna(0)
    encoded["features_resident_story"] = posts["features_resident_story"].fillna(False).astype(float)
    encoded["is_boosted"] = posts["is_boosted"].fillna(False).astype(float)
    encoded["in_campaign"] = posts["campaign_name"].notna().astype(float)
    encoded["platform_LinkedIn"] = (posts["platform"] == "LinkedIn").astype(float)
    encoded["post_type_EducationalContent"] = (posts["post_type"] == "EducationalContent").astype(float)
    encoded["post_type_EventPromotion"] = (posts["post_type"] == "EventPromotion").astype(float)
    encoded["post_type_ImpactStory"] = (posts["post_type"] == "ImpactStory").astype(float)
    encoded["post_type_ThankYou"] = (posts["post_type"] == "ThankYou").astype(float)
    encoded["media_type_Reel"] = (posts["media_type"] == "Reel").astype(float)
    encoded["media_type_Text"] = (posts["media_type"] == "Text").astype(float)
    encoded["sentiment_tone_Emotional"] = (posts["sentiment_tone"] == "Emotional").astype(float)
    encoded["sentiment_tone_Informative"] = (posts["sentiment_tone"] == "Informative").astype(float)
    encoded["call_to_action_type_None"] = (
        (posts["call_to_action_type"] == "None") | (posts["has_call_to_action"].fillna(False) == False)
    ).astype(float)

    X = encoded[features]
    probas = model.predict_proba(X)[:, 1]

    posts["conversion_probability"] = np.round(probas, 4)
    posts["conversion_tier"] = posts["conversion_probability"].apply(
        lambda s: "High" if s >= 0.6 else "Medium" if s >= 0.3 else "Low"
    )

    now = datetime.now(timezone.utc)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM ml_social_media_predictions")
    for _, p in posts.iterrows():
        cursor.execute(
            """INSERT INTO ml_social_media_predictions
               (post_id, platform, post_type, content_topic,
                conversion_probability, conversion_tier, scored_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            int(p["post_id"]), p.get("platform"), p.get("post_type"),
            p.get("content_topic"), float(p["conversion_probability"]),
            p["conversion_tier"], now,
        )
    conn.commit()
    print(f"  Wrote {len(posts)} social media predictions.")


# =========================================================================
#  Main
# =========================================================================
def main():
    parser = argparse.ArgumentParser(description="Score all records and upload predictions to Azure SQL")
    parser.add_argument("--connection-string", type=str, default=None,
                        help="ODBC connection string for Azure SQL")
    args = parser.parse_args()

    conn_str = args.connection_string or os.environ.get("CONNECTION_STRING")
    if not conn_str:
        print("Error: Provide --connection-string or set CONNECTION_STRING env var.")
        print('Example: python score_and_upload.py --connection-string "Driver={ODBC Driver 18 for SQL Server};Server=your-server.database.windows.net;Database=your-db;Uid=your-user;Pwd=your-password;Encrypt=yes;TrustServerCertificate=no;"')
        sys.exit(1)

    conn = get_connection(conn_str)
    try:
        score_donor_churn(conn)
        score_resident_risk(conn)
        score_social_media(conn)
        print("\nAll predictions uploaded successfully!")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
