# Resident Risk Assessment Pipeline — Steps 1 & 2 Prompt
## Business Problem Framing + Data Acquisition and Preparation

---

## Context

You are building a machine learning pipeline for a nonprofit organization called Luz de Vida that operates safehouses for at-risk girls in the Philippines. The organization's leadership is worried about girls "falling through the cracks" — residents who are struggling or stagnating without staff noticing in time. With limited staff managing multiple safehouses, they need a data-driven system to help them manage cases across the full lifecycle: from intake and case assessment through counseling, education, health services, and ultimately reintegration or placement.

This notebook covers **Step 1 (Business Problem Framing)** and **Step 2 (Data Acquisition and Preparation)** of the ML pipeline. Later notebooks will handle exploration, modeling, evaluation, feature selection, and deployment. The output of this notebook should be a clean, flat, per-resident CSV file ready for use in the next steps.

The dataset lives in the `dataset/` folder relative to this notebook.

---

## Step 1 — Business Problem Framing

Begin the notebook with a markdown cell covering each of the following. This section should be written clearly enough that a non-technical stakeholder could read it and understand what is being built and why.

### 1.1 Business Question

The core question is: **Which residents are at risk of regression or stagnation, and which are progressing toward successful reintegration?**

This pipeline produces a per-resident risk score that social workers and program managers can use to prioritize attention, allocate resources, and flag girls who may be falling through the cracks before their situation deteriorates further.

### 1.2 Prediction vs. Explanation

This pipeline serves **both goals** and must produce **two distinct models**:

- **Predictive model**: Optimize for out-of-sample performance. The goal is an accurate risk score per resident. Interpretability is secondary. Ensemble methods (random forest, gradient boosting) are appropriate here.
- **Explanatory model**: A carefully specified logistic regression where coefficient interpretability matters. This model answers the question: "What factors most drive a girl being at risk?" Coefficients should be interpretable in business terms (e.g., "each additional self-harm incident in the past 6 months is associated with X% higher odds of stagnation").

State clearly in the notebook which model is which and why each modeling choice is appropriate for its goal.

### 1.3 Target Variable

The target variable is derived from `reintegration_status` in the `residents` table:

- **At-risk (1)**: `reintegration_status` is `On Hold` or `Not Started`
- **Progressing (0)**: `reintegration_status` is `In Progress` or `Completed`

Justify this choice in a markdown cell. Note that `case_status` was considered but rejected because it conflates program exit reasons (successful reintegration vs. transfer vs. dropout) without encoding progression quality. Note also that `current_risk_level` was considered but rejected as a target because it is a subjective social worker assessment — the goal of this model is to surface girls whose objective indicators don't match their assigned risk level.

### 1.4 Success Metrics

Define the following upfront and reference them during evaluation:

- **Primary metric**: AUC-ROC (appropriate for imbalanced binary classification and for producing a ranked risk score rather than just a label)
- **Secondary metric**: Recall on the at-risk class — missing a girl who is actually at risk is a more costly error than a false alarm, so the model should be tuned to minimize false negatives
- **Baseline**: A naive classifier that labels every resident as "progressing" (the majority class) — the model must meaningfully outperform this

### 1.5 Dataset Feasibility Note

Acknowledge the small dataset size (60 residents) in the notebook. This has two implications that shape every downstream decision:
1. Stratified k-fold cross-validation (5-fold or 10-fold) must be used instead of a single train/test split
2. Feature selection is especially important to prevent overfitting on a high-dimensional, low-row dataset

---

## Step 2 — Data Acquisition and Preparation

Follow the **Chapter 7 two-tier pipeline structure**:
- A dataset-specific `wrangle_residents()` function for hard-coded, project-specific cleaning
- Generalizable functions (`missing_fill()`, `skew_correct()`, `encode_categoricals()`, etc.) that can be reused across pipelines and live in or can be saved to `functions.py`

### 2.1 Configuration Block

Start with a configuration cell at the top containing all tunable parameters:

```python
TODAY = pd.Timestamp("2026-04-07")   # reference date for recency calculations
WINDOW_MONTHS = 6                     # lookback window for longitudinal features
DATA_DIR = Path("dataset")

# Target encoding
AT_RISK_STATUSES = ["On Hold", "Not Started"]

# Columns to drop immediately due to data leakage
LEAKAGE_COLS = [
    "current_risk_level",      # social worker's own risk assessment — proxy for target
    "date_closed",             # only populated for closed/exited cases — leakage
    "initial_case_assessment", # early proxy that encodes expected outcome
    "reintegration_type",      # downstream outcome, not an input feature
    "date_enrolled",           # administrative, not predictive
    "notes_restricted",        # free text flag, no predictive value
    "internal_code",           # administrative ID
    "case_control_no",         # administrative ID
]
```

### 2.2 Tables to Load

Load the following tables. Include a comment explaining why each is included:

| Table | Role |
|-------|------|
| `residents.csv` | Core table; source of target variable and static resident features |
| `education_records.csv` | Monthly education snapshots — attendance, progress, enrollment |
| `health_wellbeing_records.csv` | Monthly health snapshots — physical and psychological scores |
| `incident_reports.csv` | Irregular incident events — type, severity, resolution |
| `intervention_plans.csv` | One row per plan per resident — plan status and category |
| `home_visitations.csv` | Family visit records — cooperation, safety concerns, outcomes |
| `process_recordings.csv` | Counseling session records — emotional state, concerns, referrals |
| `safehouses.csv` | Safehouse metadata — region, capacity (for contextual join only) |

**Do not load**: `safehouse_monthly_metrics.csv` (derived from the same data used for features — leakage risk), `public_impact_snapshots.csv`, `social_media_posts.csv`, `partners.csv`, `partner_assignments.csv`, or any donation-related tables.

### 2.3 Target Variable Construction

After dropping leakage columns, construct the binary target from `reintegration_status`:

```python
residents["at_risk"] = residents["reintegration_status"].isin(AT_RISK_STATUSES).astype(int)
```

Print the class distribution and note the imbalance ratio. Flag that class weighting or SMOTE will be applied at modeling time.

Then drop `reintegration_status` from the residents DataFrame so it cannot leak into features.

### 2.4 Longitudinal Window Filter

For each of the three rolling tables (education, health, process_recordings), filter records to the 6-month lookback window before aggregating:

```python
window_start = TODAY - pd.DateOffset(months=WINDOW_MONTHS)
# filter record_date >= window_start
```

For `home_visitations` and `incident_reports`, apply the same window to `visit_date` and `incident_date` respectively.

For `intervention_plans`, do not apply a date filter — use the full plan history since plans are not time-stamped the same way. Use `status` and `plan_category` as aggregation dimensions.

### 2.5 Feature Engineering

Build a separate function for each source table that returns a flat, one-row-per-resident DataFrame. Merge all feature tables onto the residents spine at the end. Follow the engineering rules below for each column type.

Apply these rules **consistently across all tables**:

#### Column Type → Feature Engineering Rules

| Column Type | Engineering Approach |
|-------------|---------------------|
| **Rate / Percent** (e.g., `attendance_rate`, `progress_percent`) | 6-month **slope** (linear trend) + 6-month **mean** |
| **Score** (e.g., `general_health_score`, `nutrition_score`, `sleep_quality_score`, `energy_level_score`, `bmi`) | 6-month **slope** + 6-month **mean** + **standard deviation** (volatility signal) |
| **Physical measurable** (e.g., `height_cm`, `weight_kg`, `bmi`) | 6-month **slope** + most recent value |
| **Boolean** (e.g., `medical_checkup_done`, `dental_checkup_done`, `psychological_checkup_done`, `concerns_flagged`, `safety_concerns_noted`, `follow_up_needed`, `referral_made`, `progress_noted`) | **Proportion of True** values in window + **days since last True** (recency) |
| **Ordered categorical** (e.g., `family_cooperation_level`, `visit_outcome`, `severity`, `emotional_state_end`) | Encode numerically (see encoding map below), then compute **mean** and **slope** over window |
| **Unordered categorical / status** (e.g., `enrollment_status`, `completion_status`, `incident_type`, `session_type`, `plan_category`) | **Proportion of each category** in window (one column per category value) |
| **Date** | **Count of records** in window; **days since most recent record** (recency) |
| **Free text / notes** | Drop entirely |
| **Administrative name/ID** | Drop entirely |

#### Ordinal Encoding Maps

Use these specific mappings when encoding ordered categoricals:

```python
COOPERATION_MAP = {"Uncooperative": 1, "Neutral": 2, "Cooperative": 3, "Highly Cooperative": 4}
VISIT_OUTCOME_MAP = {"Unfavorable": 1, "Inconclusive": 2, "Needs Improvement": 3, "Favorable": 4}
SEVERITY_MAP = {"Low": 1, "Medium": 2, "High": 3}
EMOTIONAL_STATE_MAP = {"Withdrawn": 1, "Distressed": 1, "Angry": 2, "Sad": 2, "Anxious": 3, "Calm": 4, "Hopeful": 5, "Happy": 5}
PLAN_STATUS_MAP = {"Closed": 1, "On Hold": 2, "Open": 3, "In Progress": 4, "Achieved": 5}
```

#### Slope Calculation

Use a reusable helper for computing slope — do not hardcode per-column:

```python
def compute_slope(series: pd.Series) -> float:
    """Return OLS slope of series values over index positions. Returns NaN if fewer than 2 points."""
    if series.dropna().__len__() < 2:
        return np.nan
    x = np.arange(len(series))
    mask = ~series.isna()
    return np.polyfit(x[mask], series[mask], 1)[0]
```

#### Special Engineering for Specific Tables

**`incident_reports`** — beyond the general rules, engineer these specific features:
- `incident_count_6mo`: total incidents in window
- `incident_has_self_harm`: 1 if any `SelfHarm` incident in window, else 0
- `incident_has_runaway`: 1 if any `RunawayAttempt` incident in window, else 0
- `incident_resolution_rate`: proportion of incidents marked `resolved = True`
- `incident_days_since_last`: days since most recent incident (use `TODAY` as reference; `NaN` if no incidents)
- Severity mean using `SEVERITY_MAP`

**`process_recordings`** — beyond the general rules, engineer:
- `sw_distinct_count`: number of distinct social workers who conducted sessions — a proxy for care continuity (high turnover = potential risk signal)
- `session_duration_mean`: average session length in minutes
- Proportions for `session_type` (Individual, Group, Family)

**`intervention_plans`** — do not apply a date window. For each of the 3 plan categories (Safety, Education, Physical Health), create:
- `plan_{category}_status_encoded`: `PLAN_STATUS_MAP` applied to current `status`
- Note: every resident has exactly one plan per category, so no aggregation needed — just pivot

**`residents` static features** — after dropping leakage and target columns, retain and encode:
- All `sub_cat_*` boolean flags: keep as 0/1
- All `family_*` boolean flags: keep as 0/1
- `is_pwd`, `has_special_needs`: keep as 0/1
- `initial_risk_level`: encode as `{"Low": 1, "Medium": 2, "High": 3, "Critical": 4}`
- `referral_source`: one-hot encode
- `religion`: one-hot encode (consolidate categories with fewer than 3 residents into "Other")
- `age_upon_admission`: extract numeric years only
- `length_of_stay`: extract numeric months only
- `safehouse_id`: join to `safehouses.csv` to add `region` as a categorical feature; then drop `safehouse_id`
- Drop: `sex` (dataset is all female), `place_of_birth`, `date_of_birth`, `birth_status`, `assigned_social_worker`, `date_case_study_prepared`, `date_colb_registered`, `date_colb_obtained`, `created_at`

### 2.6 Coverage Flag

After all longitudinal feature tables are built, add a coverage feature to the merged dataset:

```python
# Compute months of education data available per resident (capped at WINDOW_MONTHS)
# Use this as a model feature so the model can account for incomplete windows
merged["months_of_data_available"] = ...  # count of distinct months in education_records within window
```

This is important because newer residents will have fewer months of history, which affects the reliability of slope and mean calculations.

### 2.7 Dataset-Specific Wrangling Function

Write a `wrangle_residents(df)` function that handles all project-specific quirks before the generalizable pipeline runs:
- Drops leakage columns (using `LEAKAGE_COLS`)
- Constructs the `at_risk` target
- Drops `reintegration_status` after target is constructed
- Extracts numeric values from string columns like `age_upon_admission` and `length_of_stay` (e.g., "15 Years 9 months" → numeric months total)
- Consolidates rare religion categories into "Other"
- Joins safehouse region from `safehouses.csv`

### 2.8 Generalizable Pipeline Functions

After `wrangle_residents()`, apply the following generalizable cleaning steps (build these as reusable functions):

1. **`missing_fill(df)`** — For numeric columns with missing values, impute with column median. For categorical columns, impute with "Unknown". Print a summary of columns imputed and how many values filled. Missing values in slope columns (residents with no records in the window) should be imputed with 0 (no trend).

2. **`encode_categoricals(df)`** — One-hot encode any remaining nominal string columns. Drop the first dummy to avoid multicollinearity. Print which columns were encoded.

3. **`skew_correct(df, threshold=1.0)`** — Apply Yeo-Johnson transformation to numeric columns with absolute skewness above the threshold. Print which columns were transformed. Do not transform the target column.

4. **`drop_low_variance(df, threshold=0.01)`** — Drop any numeric column whose variance falls below the threshold after all other transformations. These carry no predictive signal.

### 2.9 Final Dataset Validation

Before saving, print a validation summary:
- Shape of final DataFrame
- Class distribution of `at_risk` (count and percentage)
- Number of features
- Count of any remaining missing values (should be zero)
- Confirm `at_risk` is the only column that is the target — no leakage columns present

Then save:

```python
output_path = DATA_DIR / "resident_risk_df.csv"
final_df.to_csv(output_path, index=False)
print(f"Saved: {output_path} — {final_df.shape[0]} rows × {final_df.shape[1]} columns")
```

---

## Style and Structure Notes

- Match the style of `donor_lapse_prediction.ipynb`: each code cell focused on one logical task, preceded by a markdown cell explaining what it does and why
- All feature engineering logic should live in named functions, not inline code
- Use `print()` statements throughout to confirm shapes, distributions, and column counts at each step
- Every design decision that involved a tradeoff (e.g., why 6 months, why proportion vs. count, why this target variable) should be briefly explained in a markdown cell
- The notebook should be reproducible end-to-end by running all cells top to bottom with no manual steps
- Name the notebook `resident_risk_assessment.ipynb` and save it in the `ml/` folder
