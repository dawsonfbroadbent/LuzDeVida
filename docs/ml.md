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
| Donor lapse prediction | Identify donors at risk of not renewing | Risk score per donor → admin dashboard |
| Donor upgrade scoring | Identify donors likely to give more if asked | Propensity score → staff workflow |
| Resident risk assessment | Flag residents showing regression indicators | Risk flag → caseload inventory |
| Campaign effectiveness | Attribute outcomes to fundraising efforts | Attribution report → analytics page |
| Outreach attribution | Connect social media activity to donation events | Attribution metrics → reports page |

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
