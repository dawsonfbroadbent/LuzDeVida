# ML Pipelines

This file defines ML pipelines once they are implemented. Each entry covers: business purpose, input data, model approach, output format, and how it integrates into the application.

## Requirements for All Pipelines
- Address a meaningful nonprofit business problem
- Distinguish prediction from explanation where relevant
- Use reproducible data preparation
- Evaluate models with appropriate metrics
- Integrate outputs into dashboards, workflows, or user-facing decision support — not standalone notebooks

## Planned Pipelines

| Pipeline | Business Purpose | Output |
|----------|-----------------|--------|
| Donor lapse prediction | Identify donors at risk of not renewing | Risk score per donor -> admin dashboard |
| Donor upgrade scoring | Identify donors likely to give more if asked | Propensity score -> staff workflow |
| Resident risk assessment | Flag residents showing regression indicators | Risk flag -> caseload inventory |
| Social media optimization | Identify content decisions that drive donation conversions | Conversion probability per post -> analytics page |
| Campaign effectiveness | Attribute outcomes to fundraising efforts | Attribution report -> analytics page |
| Outreach attribution | Connect social media activity to donation events | Attribution metrics -> reports page |

## Adding a Pipeline
When implementing a pipeline, populate this file with:
- **Name**: identifier used in code and API
- **Business question**: the operational decision this supports
- **Input features**: data sources and fields consumed
- **Model type**: algorithm and rationale
- **Output**: field name, type, and range
- **Integration point**: which page/API endpoint surfaces the output
- **Schedule**: batch cadence or on-demand trigger
- **Evaluation**: metric(s) used to validate model quality

## Implemented Pipelines

### Donor Lapse Prediction

- **Name**: donor_lapse_prediction
- **Business question**: Which donors are at risk of not renewing their support in the next 6 months?
- **Input features**: Donation recency, frequency, average amount, number of program areas, in-kind donation history, social media engagement; demographic attributes from supporters table
- **Model type**: Gradient Boosting Classifier (predictive track); Logistic Regression (explanatory track). Dual-track approach: GB selected by CV AUC-ROC, LR for odds-ratio interpretation.
- **Output**: `churn_risk_score` (float, 0-1); `risk_tier` (Low/Medium/High, binned at 0.3/0.6)
- **Integration point**: Admin dashboard donor management page; staff outreach workflow
- **Schedule**: Batch, monthly or on-demand
- **Evaluation**: CV AUC-ROC 0.875 (pruned GB); F1 reported alongside. Stratified 5-fold CV on 51-donor dataset.
- **Artifacts**: `models/donor_churn_model.joblib`, `models/feature_config.joblib`

### Resident Risk Assessment

- **Name**: resident_risk_assessment
- **Business question**: Which residents are showing signs of regression or stagnation and need immediate caseworker attention?
- **Input features**: Health scores (mean), visit count and cooperation trend, nutrition scores, safety concern proportion, energy level, physical measurements; derived from health_wellbeing_records, home_visitations, process_recordings, and residents tables
- **Model type**: Gradient Boosting Classifier (predictive track); Logistic Regression (explanatory track). GB selected by CV AUC-ROC after VIF pruning and Gini importance feature selection. Final model uses 7 features.
- **Output**: `risk_score` (float, 0-1); `risk_tier` (Low/Medium/High, binned at 0.3/0.6); `at_risk` binary flag
- **Integration point**: Caseload inventory / resident management dashboard; caseworker check-in workflow
- **Schedule**: Batch, weekly or on-demand when new records are entered
- **Evaluation**: CV AUC-ROC 0.940 (pruned GB, 7 features); test set AUC 0.844, F1 0.857, 92% accuracy on 12-resident held-out set. Stratified 5-fold CV on 60-resident dataset.
- **Artifacts**: `models/resident_risk_model.joblib`, `models/resident_risk_feature_config.joblib`
- **Key explanatory findings**: visit_count (high visit frequency strongly protective), general_health_score_mean (poor health increases risk), cooperation_slope (declining cooperation signals regression). These support targeted caseworker intervention strategies.

### Social Media Content Optimization

- **Name**: social_media_optimization
- **Business question**: Which content decisions -- platform, post type, media format, topic, sentiment, timing, and call to action -- actually lead to donation conversions, and which only generate engagement?
- **Input features**: Platform, post type, media type, content topic, sentiment tone, call-to-action presence and type, resident story flag, hashtag count, caption length, mention count, boost flag and budget, post hour, day of week, campaign presence, follower count; derived from social_media_posts table with referral quality enrichment from donations table
- **Model type**: Gradient Boosting Classifier (predictive track); Logistic Regression (explanatory track). Three-way comparison: Logistic Regression, Random Forest, and Gradient Boosting via GridSearchCV. GB selected by CV AUC-ROC. Proper 80/20 holdout split used in addition to 5-fold CV (viable at n=812).
- **Output**: `conversion_probability` (float, 0-1); `conversion_tier` (Low/Medium/High, binned at 0.3/0.6)
- **Integration point**: Admin dashboard social media analytics page; pre-publish post evaluation workflow
- **Schedule**: Batch, monthly or on-demand when new post data is available
- **Evaluation**: CV AUC-ROC 0.907 (GB, post-VIF pruning); test set AUC 0.909 on 163-post held-out set. Stratified 5-fold CV on 649-post training set (80/20 split of 812 posts).
- **Artifacts**: `models/social_media_model.joblib`, `models/social_media_feature_config.joblib`
- **Key explanatory findings**: features_resident_story (strongest conversion driver, ~41pp lift), post_hour (later posting hours associated with higher conversion), is_boosted and has_call_to_action (~13-14pp lift each). Odds ratios from LR track give per-feature directional guidance the founders can apply before each post.

## Text requirements
When outputting content, use only ASCII characters. Previous iterations of code broke because it tried to add Unicode characters like em-dashes and arrows.