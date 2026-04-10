-- Migration 002: Create ML prediction tables
-- Run this against LuzDeVidaDB to enable ML prediction endpoints.
-- These tables are populated by the Python scoring pipeline (ml-pipelines/score_and_upload.py).

CREATE TABLE ml_donor_churn_predictions (
    supporter_id      INT            NOT NULL,
    display_name      NVARCHAR(255)  NULL,
    email             NVARCHAR(255)  NULL,
    churn_risk_score  FLOAT          NOT NULL,
    risk_tier         NVARCHAR(50)   NOT NULL,
    scored_at         DATETIME       NOT NULL,

    CONSTRAINT PK_ml_donor_churn_predictions PRIMARY KEY (supporter_id)
);

CREATE TABLE ml_resident_risk_predictions (
    resident_id       INT            NOT NULL,
    case_control_no   NVARCHAR(50)   NULL,
    internal_code     NVARCHAR(50)   NULL,
    safehouse_name    NVARCHAR(255)  NULL,
    risk_score        FLOAT          NOT NULL,
    risk_tier         NVARCHAR(50)   NOT NULL,
    scored_at         DATETIME       NOT NULL,

    CONSTRAINT PK_ml_resident_risk_predictions PRIMARY KEY (resident_id)
);

CREATE TABLE ml_social_media_predictions (
    post_id                INT            NOT NULL,
    platform               NVARCHAR(50)   NULL,
    post_type              NVARCHAR(100)  NULL,
    content_topic          NVARCHAR(100)  NULL,
    conversion_probability FLOAT          NOT NULL,
    conversion_tier        NVARCHAR(50)   NOT NULL,
    scored_at              DATETIME       NOT NULL,

    CONSTRAINT PK_ml_social_media_predictions PRIMARY KEY (post_id)
);
