# Luz De Vida

A secure nonprofit operations platform for **Luz De Vida** — an organization operating safehouses for girls who are survivors of sexual abuse or sex trafficking in the Philippines.

## Purpose

Luz De Vida gives staff the tools to manage donor relationships, document resident care, and make data-driven decisions — while keeping highly sensitive victim data private and protected.

## What It Does

### Public-Facing
- **Landing page** — introduces the organization's mission and invites visitors to engage or donate
- **Impact dashboard** — displays aggregated, anonymized outcomes and program metrics (no individual records ever exposed)
- **Login** — secure staff authentication
- **Privacy policy & cookie consent** — GDPR-compliant

### Staff & Admin (Authenticated)
- **Admin dashboard** — at-a-glance view of active residents, recent donations, upcoming case conferences, and progress summaries
- **Donors & Contributions** — manage supporter profiles, track monetary and in-kind contributions, view donation allocations across safehouses
- **Caseload Inventory** — full resident case management following Philippine social welfare agency structure: demographics, case categories, family profiles, admission details, assigned social workers, and reintegration tracking
- **Process Recording** — document counseling sessions per resident, including emotional state, narrative, interventions, and follow-up actions
- **Home Visitation & Case Conferences** — log field visits and conferences with environment observations, safety concerns, and follow-up actions
- **Reports & Analytics** — donation trends, resident outcome metrics, safehouse comparisons, reintegration success rates, aligned with the Philippine Annual Accomplishment Report format

### Machine Learning (Integrated into Workflows)
ML outputs surface directly in dashboards and staff workflows — not as standalone reports:
- **Donor lapse prediction** — flags donors at risk of not renewing
- **Donor upgrade scoring** — identifies donors likely to give more if asked
- **Resident risk assessment** — highlights residents showing regression indicators
- **Campaign effectiveness** — attributes outcomes to fundraising efforts
- **Outreach attribution** — connects social media activity to donation events

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | .NET 10 / C# |
| Frontend | React / TypeScript (Vite) |
| Database | Azure SQL / PostgreSQL / MySQL |
| Deployment | Cloud-hosted, publicly accessible |

## Design Principles

- **Privacy and safety first** — resident data is treated with maximum restriction; public surfaces never expose individual records
- **Operational clarity** — built for small teams making real decisions, not generic data entry
- **Accessibility** — every page targets a Lighthouse accessibility score >= 90%
- **Responsiveness** — all pages support desktop and mobile layouts

## Documentation

Full specification lives in [`docs/`](docs/):
- [`security.md`](docs/security.md) — security and privacy requirements
- [`requirements.md`](docs/requirements.md) — functional requirements and acceptance checklist
- [`database-schema.md`](docs/database-schema.md) — entity, field, and relationship definitions
- [`api.md`](docs/api.md) — API contract and coding standards
- [`ml.md`](docs/ml.md) — ML pipeline definitions
