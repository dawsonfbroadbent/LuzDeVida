# Project Overview

## Purpose
Secure nonprofit operations platform for Lighthouse Sanctuary — an organization operating safehouses for girls who are survivors of sexual abuse or sex trafficking in the Philippines. Supports donor operations, case management, reporting, outreach analysis, and decision support over highly sensitive data.

## Reading Order
Read in this order before making structural changes:
1. `security.md` — security and privacy requirements
2. `requirements.md` — functional requirements, tech stack, acceptance checklist
3. `database-schema.md` — entity, field, and relationship definitions
4. `api.md` — API contract and coding standards
5. `ml.md` — ML pipeline definitions

## Project Goals
- Improve donor retention and growth; identify lapse and upgrade opportunities
- Connect donations to resident outcomes
- Manage residents across the full case lifecycle
- Identify residents who are progressing, struggling, or at risk
- Document counseling, visitation, intervention, and reintegration work
- Analyze social media outreach effectiveness
- Operate efficiently with limited staff
- Protect privacy and safety of victims, employees, donors, and partners

## Product Surfaces

**Public** — trust, communication, donor engagement:
landing page, public impact dashboard (aggregated/anonymized data only), login, privacy policy, cookie consent

**Authenticated** — staff and admin operations:
admin dashboard, donors & contributions, caseload inventory, process recordings, home visitation & case conferences, reports & analytics, supporting security/accessibility pages

## Business Domains

### Donor and Support
Entities: safehouses, partners, partner assignments, supporters, donations, in-kind donation items, donation allocations
Use for: donor management, contribution tracking, campaign analysis, allocation reporting, impact communication

### Case Management
Entities: residents, process recordings, home visitations, education records, health/wellbeing records, intervention plans, incident reports
Use for: resident lifecycle management, counseling documentation, risk tracking, intervention planning, reintegration workflows

### Outreach and Communication
Entities: social media posts, public impact snapshots
Use for: outreach analysis, campaign attribution, public impact reporting

## System Intent
This is not a generic CRUD project. Build around operational decisions:
- Which donors are likely to lapse or may give more if asked?
- Which campaigns produce meaningful results?
- Which residents are improving or at risk of regression?
- Which interventions appear effective?
- Which outreach content drives donations?

## Implementation Priorities
- Privacy and safety first — resident data is highly sensitive
- Operational clarity for small teams
- Robust validation and error handling
- Decision-relevant dashboards and reports
- Responsive, accessible UI (Lighthouse >= 90%)
- Maintainable, strictly typed code

## Data Sensitivity Rules
- Resident data: apply maximum restriction by default
- Public analytics: must be aggregated and anonymized — never expose individual records
- Deletion, access, and visibility rules are security-sensitive
- Donor, resident, and partner data have different visibility requirements
- Never expose sensitive data in public experiences

## Machine Learning
ML is a product requirement, not an add-on. Outputs must connect to dashboards, workflows, or user-facing decision support — a standalone notebook is not sufficient. See `ml.md` for pipeline definitions.

## Agent Rules
- Source of truth: `security.md` → `requirements.md` → `database-schema.md` → `api.md`
- Do not invent business rules that conflict with those files
- Do not invent schema fields when `database-schema.md` covers the area
- Do not expose sensitive data in public experiences
- Pages that overlap security or ML concerns still belong in `requirements.md` scope
- This file provides context only — implementation details are in the files above
