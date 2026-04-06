# Security Requirements

The application handles sensitive data involving abuse survivors, donors, staff, and partners. Privacy and data protection are core product requirements, not optional enhancements.

---

## Required Security Features

### 1. HTTPS / TLS
- All public connections must use HTTPS with a valid certificate
- HTTP must redirect to HTTPS

### 2. Authentication
- Username and password authentication required (ASP.NET Identity or equivalent)
- Password policy must be stronger than framework defaults

### 3. Authorization
- **Public**: unauthenticated access to intentionally public pages only
- **Admin role**: required for all create, update, and delete operations
- **Donor role**: required to view own donation history and impact
- **APIs**: CRUD endpoints must be restricted to authenticated, authorized users; when in doubt, be maximally restrictive

### 4. Integrity Controls
- Data changes and deletions require authentication and appropriate role
- Delete operations must require user confirmation

### 5. Credential Handling
- Use secrets manager, uncommitted `.env`, or environment variables
- Credentials must never be committed to source code or public repositories

### 6. Privacy Policy
- GDPR-compliant privacy policy tailored to the site
- Linked from the footer on every page, at minimum on the home page

### 7. Cookie Consent
- GDPR-compliant cookie consent notification
- Must be functionally implemented, not cosmetic-only

### 8. Content Security Policy
- CSP must be delivered as an HTTP response header (not a meta tag)
- Specify only the sources required for the site to function

### 9. Deployment
- Site must be publicly accessible via HTTPS

---

## Additional Features (Extra Credit / Stronger Scoring)
- Third-party authentication
- Two-factor / multi-factor authentication
- HSTS
- Browser-accessible cookie storing a React user setting
- Data sanitization for incoming data; encoding for rendered output
- Both operational and identity databases deployed to real DBMS (not SQLite)
- Docker-based deployment

If MFA is implemented, maintain: one admin account without MFA, one donor account without MFA, one account with MFA enabled (for testing).

---

## Acceptance Checklist
- [ ] HTTPS enabled in deployment
- [ ] HTTP redirects to HTTPS
- [ ] Username/password auth works
- [ ] Public pages accessible without auth
- [ ] Secured pages and APIs require auth
- [ ] Admin-only CUD restrictions enforced in UI and backend
- [ ] Donor-only access enforced where required
- [ ] Delete flows require confirmation
- [ ] Secrets not committed to source
- [ ] Privacy policy exists and is linked from footer
- [ ] Cookie consent is present and functional
- [ ] CSP header set in deployment responses
- [ ] Deployed site is publicly reachable
