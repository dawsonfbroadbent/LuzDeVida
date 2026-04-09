# HTTPS & Security Configuration

This document describes how the Luz De Vida application enforces HTTPS encryption and implements security headers.

## Frontend HTTPS Enforcement (Azure Static Web Apps)

**File:** `frontend/staticwebapp.config.json`

### Features:
- **HTTP → HTTPS Redirect**: All HTTP requests are automatically redirected to HTTPS at the Azure edge
  - Applies to: `/*` (all routes)
  - Excludes: API calls, images, CSS, JS, fonts (handled separately)

- **HTTP Strict-Transport-Security (HSTS)**: `max-age=31536000; includeSubDomains; preload`
  - Tells browsers to ONLY connect to this domain via HTTPS
  - Duration: 1 year
  - Includes subdomains
  - Eligible for browser HSTS preload list

- **Security Headers**:
  - `X-Content-Type-Options: nosniff` → Prevents MIME-type sniffing attacks
  - `X-Frame-Options: DENY` → Prevents clickjacking attacks
  - `X-XSS-Protection: 1; mode=block` → Enables XSS protection
  - `Referrer-Policy: strict-origin-when-cross-origin` → Controls referrer information

- **Navigation Fallback**: SPA routing
  - All unmapped routes serve `index.html` for React Router
  - Excludes: `images/*`, `css/*`, `js/*`, `fonts/*`, `api/*`

## Backend HTTPS Enforcement (Azure App Service)

**File:** `backend/LuzDeVida.API/Program.cs`

### Features:
- **Conditional HTTPS Redirect**:
  - **Production**: `app.UseHttpsRedirection()` enabled
    - All HTTP requests automatically redirect to HTTPS
    - Enforced via `app.UseHsts()`
  - **Development**: Disabled
    - Allows local HTTP testing during development
    - Environment set via `ASPNETCORE_ENVIRONMENT=Development` in launchSettings.json

- **HSTS (HTTP Strict-Transport-Security)**:
  - Automatically enabled in production
  - Max-Age: 31,536,000 seconds (1 year)
  - Includes subdomains
  - Forces HTTPS on all future browser requests

- **Security Response Headers** (Applied to all requests):
  - `X-Content-Type-Options: nosniff` → Prevents MIME-type sniffing
  - `X-Frame-Options: DENY` → Prevents clickjacking
  - `X-XSS-Protection: 1; mode=block` → Enables XSS browser protection
  - `Referrer-Policy: strict-origin-when-cross-origin` → Controls referrer data

### Middleware Order:
1. HTTPS Redirect (Production only)
2. HSTS (Production only)
3. Security Headers (All environments)
4. CORS
5. Authentication
6. Authorization
7. Controllers

## TLS Certificates

### Frontend Certificate
- **Issued by**: Azure Static Web Apps
- **Domain**: `mango-water-0b66c451e.1.azurestaticapps.net`
- **Auto-renewal**: Azure manages automatically
- **Validation**: Browser shows 🔒 lock icon

### Backend Certificate
- **Issued by**: Azure App Service
- **Domain**: `luzdevidabackend-aegdcxe9grhucsfm.francecentral-01.azurewebsites.net`
- **Auto-renewal**: Azure manages automatically
- **Validation**: Browser shows 🔒 lock icon

## API Security

All API endpoints use HTTPS in production:

```
POST   https://luzdevidabackend-.../api/Residents
GET    https://luzdevidabackend-.../api/SafeHouses
POST   https://luzdevidabackend-.../api/HomeVisitations
GET    https://luzdevidabackend-.../api/PublicImpact
```

**Connection String**: `Encrypt=True` in `appsettings.json`
- Ensures database connection to SQL Server is encrypted

## Configuration Files Summary

| File | Purpose | Environment |
|------|---------|-------------|
| `frontend/staticwebapp.config.json` | HTTP→HTTPS redirect, security headers at edge | Production (Azure Static Web Apps) |
| `backend/Program.cs` | HTTPS redirect, HSTS, security headers | Production (Azure App Service) |
| `backend/appsettings.json` | Production database encryption, CORS origins | Production |
| `backend/appsettings.Development.json` | Development overrides, localhost origins | Development |
| `backend/launchSettings.json` | HTTP/HTTPS profiles, environment variables | Local development |

## Testing HTTPS Configuration

### Frontend
```bash
# Test HTTP → HTTPS redirect (should redirect to HTTPS)
curl -I http://mango-water-0b66c451e.1.azurestaticapps.net
# Expected: HTTP/1.1 301 Moved Permanently
# Location: https://mango-water-0b66c451e.1.azurestaticapps.net

# Test HTTPS connection (should show 200 OK)
curl -I https://mango-water-0b66c451e.1.azurestaticapps.net
# Expected: HTTP/1.1 200 OK
```

### Backend
```bash
# Test HTTP → HTTPS redirect (should redirect to HTTPS)
curl -I http://luzdevidabackend-aegdcxe9grhucsfm.francecentral-01.azurewebsites.net/api/safehouse
# Expected: HTTP/1.1 301 Moved Permanently
# Location: https://luzdevidabackend-.../api/safehouse

# Test HTTPS connection (should show 200 OK or 401 Unauthorized if auth required)
curl -I https://luzdevidabackend-aegdcxe9grhucsfm.francecentral-01.azurewebsites.net/api/safehouse
# Expected: HTTP/1.1 401 Unauthorized (JWT required)
```

### Browser Developer Tools
1. Open DevTools (F12)
2. Go to **Network** tab
3. Load the application
4. Verify:
   - ✅ All requests show HTTPS protocol
   - ✅ No 📛 mixed-content warnings
   - ✅ Lock icon 🔒 visible in address bar
   - ✅ Certificate valid (click lock to view)

## Compliance

This configuration meets the requirement:
> "Use HTTPS for all public connections. It is fine if you use a subdomain...redirect HTTP traffic to HTTPS."

**Verification:**
- ✅ All connections are HTTPS
- ✅ HTTP redirects to HTTPS (frontend edge + backend)
- ✅ HSTS enforces HTTPS on repeat visits
- ✅ Security headers prevent common attacks
- ✅ TLS certificates auto-renewed
- ✅ Database connections encrypted

---

**Last Updated:** 2026-04-08  
**Status:** Production-Ready ✅
