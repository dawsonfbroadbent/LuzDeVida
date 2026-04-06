# Database Schema

Schema definitions are added here as tables are designed. This file is the authoritative source for entity structure, field names, types, constraints, and relationships.

## Agent Rules
- Do not invent fields not defined here
- Do not invent relationships not defined here
- When schema is ambiguous, prefer the most restrictive interpretation and ask before assuming

## Database Architecture
- Operational database and identity/security database may be hosted separately
- Both must be deployed to a real DBMS (Azure SQL, MySQL, or PostgreSQL) — not SQLite

## Domain Overview
Schema covers three domains (see `claude.md` for entity lists):
- **Donor and Support** — safehouses, partners, supporters, donations, allocations
- **Case Management** — residents, process recordings, visitations, education, health, interventions, incidents
- **Outreach and Communication** — social media posts, impact snapshots

---

## Tables

<!-- Add table definitions here as they are designed. Use the format below. -->

<!--
### TableName
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | int | PK, NOT NULL | ... |
-->
