# Requirements

## Tech Stack
- Backend: .NET 10 / C#
- Frontend: React / TypeScript (Vite)
- Database: Azure SQL, MySQL, or PostgreSQL (both operational and identity DBs must be deployed)
- Deployment: app and database must be cloud-deployed and publicly accessible

---

## Required Public Pages

### 1. Home / Landing Page
- Modern, professional design
- Introduction to organization and mission
- Clear calls to action for visitors to engage or donate

### 2. Public Impact Dashboard
- Aggregated, anonymized data only — no individual records
- Show outcomes, progress, and resource use
- Visually clear presentation

### 3. Login Page
- Username and password authentication
- Proper validation and error handling

### 4. Privacy Policy + Cookie Consent
- GDPR-compliant privacy policy tailored to the site
- GDPR-compliant cookie consent notification (functional, not cosmetic)

---

## Required Authenticated Pages

### 5. Admin Dashboard
High-level overview for staff:
- Active residents across safehouses
- Recent donations
- Upcoming case conferences
- Summarized progress data

### 6. Donors & Contributions
Supporter profile management (view, create, update):
- Classify by type: monetary donor, volunteer, skills contributor, etc.
- Classify by status: active / inactive
- Track contribution types: monetary, in-kind, time, skills, social media
- Record and review donation activity
- View donation allocations across safehouses and program areas

### 7. Caseload Inventory
Core case management page. Maintain resident records following Philippine social welfare agency structure.

Staff can view, create, and update resident profiles including:
- Demographics
- Case category and sub-categories (trafficked, physical abuse, neglected, etc.)
- Disability information
- Family socio-demographic profile (4Ps beneficiary, solo parent, indigenous group, informal settler, etc.)
- Admission details and referral information
- Assigned social workers
- Reintegration tracking

Support filtering and search by: case status, safehouse, case category, and other key fields.

### 8. Process Recording
Counseling session documentation for each resident.

Each entry captures:
- Session date and social worker
- Session type: individual or group
- Emotional state observed
- Narrative summary
- Interventions applied
- Follow-up actions

Staff can view full chronological history of process recordings per resident.

### 9. Home Visitation & Case Conferences
Log home and field visits with:
- Visit type: initial assessment, routine follow-up, reintegration assessment, post-placement monitoring, emergency
- Home environment observations
- Family cooperation level
- Safety concerns
- Follow-up actions

Also display: case conference history and upcoming conferences per resident.

### 10. Reports & Analytics
Aggregated decision-support insights:
- Donation trends over time
- Resident outcome metrics (education progress, health improvements)
- Safehouse performance comparisons
- Reintegration success rates

Structure reports to align with the Philippine Annual Accomplishment Report format:
- Services provided (caring, healing, teaching)
- Beneficiary counts
- Program outcomes

### 11. Additional Supporting Pages
Implement any pages required to support: security features, social media features, accessibility features, partner features.

---

## Cross-Cutting Requirements

### Validation and Error Handling
- Validate all data inputs
- Handle errors robustly — no silent failures
- See `api.md` for response envelope and status code standards

### Code Quality and UI Finish
- Consistent look and feel, titles, icons, logos
- Pagination for lists
- Performance-conscious implementation

### OKR Metric
Track and display one meaningful metric that represents the most important measure of success for the product. Explain why it was chosen.

### Accessibility
Every page must achieve a Lighthouse accessibility score >= 90%.

### Responsiveness
Every page must resize correctly for desktop and mobile views.

---

## Acceptance Checklist

- [ ] Backend: .NET 10 / C#
- [ ] Frontend: React / TypeScript (Vite)
- [ ] Database: Azure SQL, MySQL, or PostgreSQL
- [ ] App deployed to cloud
- [ ] Database deployed to cloud
- [ ] Public home/landing page
- [ ] Public impact dashboard (aggregated/anonymized only)
- [ ] Login page with validation and error handling
- [ ] Privacy policy page linked from footer
- [ ] GDPR cookie consent present and functional
- [ ] Admin dashboard with required metrics
- [ ] Donors & Contributions page with full data management
- [ ] Caseload Inventory with required fields, filtering, and search
- [ ] Process Recording with required fields and chronological history
- [ ] Home Visitation & Case Conferences with logging and history views
- [ ] Reports & Analytics with required trends and outcome metrics
- [ ] Supporting pages for security, social media, accessibility, partners
- [ ] One OKR metric tracked and displayed with rationale
- [ ] All pages responsive for desktop and mobile
- [ ] All pages achieve Lighthouse accessibility >= 90%
- [ ] At least one deployed page persists data to the database
- [ ] Data validation and error handling throughout
- [ ] Professional UI finish: titles, icons, logos, consistency, pagination, performance
