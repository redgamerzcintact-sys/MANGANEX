# MANGANEX — Security & Cloudflare Readiness Audit Report

**Audit Date:** 2026-11-11  
**Workspace:** `MANGANEX-main`  
**Target Repository:** `https://github.com/redgamerzcintact-sys/MANGANEX.git`

---

## 1. Executive Summary

This report documents the security findings, remediations implemented across the React/Vite frontend, FastAPI Python backend, Java Spring Boot backend, startup scripts, and repository hygiene, plus the Cloudflare Pages & edge security readiness configuration added prior to making the GitHub repository public.

### Verification Status (Latest Observed Runs)
- **Frontend Production Build (`npm run build`)**: **Passed** (`tsc -b && vite build`, exit code 0, `2532 modules transformed`).
- **Python Backend Suite (`pytest backend/tests -q`)**: **Passed** (`10 passed` across `backend/tests/test_api.py` and `backend/tests/test_security_auth.py`).
- **Workspace Secret & Path Scan**: Zero remaining exposed API keys, hardcoded personal developer paths, hardcoded demo passwords, or static JWT secrets in tracked source files. Only gitignored local files (`.env`, `backend/.env`, `*.db`, `*.trace.db`) and the UI placeholder string `VITE_GOOGLE_MAPS_API_KEY=AIzaSy...` remain.
- **Java Backend (`java-backend/`)**: Source code hardened cleanly; **not compiled/runtime-tested in this workspace** because Maven (`mvn`) and `java-backend/target/manganex-backend-1.0.0.jar` are not installed locally. Run `mvn clean package` and full Java integration tests before deploying the Java service.

---

## 2. Immediate Actions Required Before Making GitHub Repo Public

1. **Rotate Exposed Google Maps API Key (`CRITICAL`)**
   - A live Google Maps API key (prefix `AIzaSy...`, ending `...5w-Ncc`) was discovered inside legacy Git commit history and local `.env` / `backend/.env`.
   - Even after purging `.env` and `backend/.env` from Git history and keeping them gitignored locally, treat the prior key as compromised and **revoke/rotate it immediately in Google Cloud Console**.
   - Restrict the newly generated key by **HTTP Referrer** (your Cloudflare Pages / custom domain) and **API restrictions** (Maps JavaScript API only).
2. **Scrub Remote GitHub History & Force-Push Clean History (`CRITICAL`)**
   - Legacy root commit `e8a7103` on `https://github.com/redgamerzcintact-sys/MANGANEX.git` originally committed `.env`, `backend/.env`, `manganex.db`, `backend/manganex.db`, `manganex-java-db.mv.db`, `java-backend/manganex-java-db.mv.db`, and `java-backend/manganex-java-db.trace.db`, leaving them reachable in history even after later deletion commits.
   - Purge all sensitive files across all refs before toggling repository visibility to **Public**, force-push clean history, and rotate any credentials that ever appeared in prior commits.
3. **Configure Demo Seed Credentials Safely for Development vs. Production (`HIGH`)**
   - Showcase demo accounts (`admin`, `geologist`, `engineer`, `analyst`, `viewer`) no longer carry hardcoded passwords in source code, `LoginPage.tsx`, `README.md`, or test suites.
   - Both FastAPI (`backend/app/api/v1/endpoints/auth.py`) and Spring Boot (`java-backend/src/main/java/com/manganex/config/DatabaseSeeder.java`) read `MANGANEX_DEMO_*_PASSWORD` environment variables at startup and generate cryptographically random per-process passwords (`secrets.token_urlsafe(32)` / `UUID.randomUUID()`) when unset so demo login is disabled by default.
   - Before deploying to an internet-facing production environment:
     - Keep all `MANGANEX_DEMO_*_PASSWORD` variables unset (or replace demo accounts with real SSO/IdP provisioned credentials), set `ENVIRONMENT=production`, and keep `ALLOW_DEMO_AUTH_TOKENS=false`.
     - Inject strong random secrets: `SECRET_KEY` (>= 32 chars) and `MANGANEX_JWT_SECRET` (>= 64 bytes).

---

## 3. Security Audit Findings & Remediations

| Severity | Finding | Remediation Implemented |
| :--- | :--- | :--- |
| **Critical** | **Forged / Bypassable FastAPI Auth & Default Admin Fallback** (`auth.py` `/me`, `/refresh`) | Replaced fake `manganex_jwt_*` strings and `"admin"` fallback with HMAC-SHA256 signed JWTs (`create_access_token`, `decode_access_token`) verified with `hmac.compare_digest`, `exp` validation, and `REVOKED_TOKENS` enforcement. Unauthenticated calls now return HTTP `401`. |
| **Critical** | **Weak Password Hashing & Plaintext Seed Passwords** (`auth.py`) | Migrated pre-seeded demo accounts and user password storage from static-salt SHA-256 + plaintext fields to per-user 16-byte salted `PBKDF2-HMAC-SHA256` (`310,000` iterations) via `hash_pw()` and `verify_pw()`. |
| **Critical** | **Hardcoded JWT Signing Secrets in Source** (`config.py`, `application.yml`, `JwtService.java`) | Removed static fallback signing secrets. Both Python (`Settings.effective_secret_key`) and Java (`JwtService`) now require env secrets (`SECRET_KEY` / `MANGANEX_JWT_SECRET`) in production and generate strong per-process ephemeral random keys only in development. |
| **Critical** | **Sensitive Local Files & DB Artifacts Risking Public Leak** | Updated `.gitignore` to exclude `.env`, `.env.*`, `backend/.env*`, `.dev.vars*`, `*.db`, `*.sqlite*`, `*.mv.db`, `*.trace.db`, keystores/certs, `.wrangler/`, and logs; expanded `.env.example` and `backend/.env.example` with safe placeholder keys. |
| **High** | **Privilege Escalation via Self-Registration (`ROLE_ADMIN`)** (`auth.py` `/register`) | Blocked `ROLE_ADMIN` self-registration with HTTP `403`, and added username, `EMAIL_REGEX`, and `_validate_password_strength` enforcement. |
| **High** | **Password Reset / Verification Token Leak in API Responses** (`auth.py`, Java `AuthController.java`) | Gated inline token responses behind `allow_demo_tokens_in_response` (Python) and `manganex.security.allow-demo-reset-token` (Java, default `false`), returning generic messages in production and adding rate limiting on `/login` and `/forgot-password`. |
| **High** | **Unauthenticated Mutating Endpoints & Permissive Java Routes** (`ai.py`, `data_hub.py`, `nexus.py`, `SecurityConfig.java`) | Required authentication on document ingestion (`POST /api/v1/ai/documents`), dataset uploads (`POST /api/v1/datasets/upload`), and NEXUS session edits/deletes; restricted `DELETE /api/v1/ai/documents/{id}` to `ROLE_ADMIN`/`ROLE_ANALYST`; restricted Java `/actuator/**` (except `/actuator/health`) to `ROLE_ADMIN` and limited public `/operations/**`, `/optimization/**`, `/nexus/**` matchers to `HttpMethod.GET`. |
| **High** | **DOM XSS Sink in Global Command Palette** (`CommandPalette.tsx`) | Replaced `dangerouslySetInnerHTML={{ __html: item.subtitle }}` with safe React text rendering and replaced `&bull;` HTML entities in `search.py` with literal Unicode `•`. |
| **High** | **Unprotected Workspace Routes in Frontend Router** (`App.tsx`) | Wrapped workspace routes (`/command-center`, `/exploration`, `/prospectivity`, `/subsurface`, `/satellite`, `/environmental`, `/production`, `/equipment`, `/risk-center`, `/scenario-lab`, `/optimization`, `/intelligence`, `/models`, `/nexus`, `/reports`, `/data-hub`, `/settings`) inside `<ProtectedRoute>`. |
| **Medium** | **Missing Security Headers, Open Swagger in Prod, Overbroad CORS** (`main.py`, `config.py`, `SecurityConfig.java`) | Added HTTP security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, plus `Cache-Control: no-store` on `/api/v1/auth/*`), disabled `/docs`, `/redoc`, and `/openapi.json` when `ENVIRONMENT=production`, and narrowed CORS methods/headers with `BACKEND_CORS_ORIGIN_REGEX` / `manganex.cors.allowed-origins`. |
| **Medium** | **External Stylesheet CDN Without Complete SRI** (`index.html`, `App.tsx`) | Removed external `unpkg.com` stylesheets for MapLibre GL and Leaflet from `index.html` and bundled local `maplibre-gl/dist/maplibre-gl.css` and `leaflet/dist/leaflet.css` directly in `src/App.tsx`. |
| **Medium** | **React Hooks Violation & Stale Token Retention** (`NexusDrawer.tsx`, `api.ts`) | Moved `useState` hooks above the early `if (!isNexusOpen) return null;` guard in `NexusDrawer.tsx` (fixing runtime crash risk when opening drawer), made `API_BASE` configurable via `VITE_API_BASE_URL`, and cleared stored `manganex_token` / `manganex_auth_user` on `401` responses. |
| **Low** | **Non-Portable Hardcoded Developer Machine Paths** (`backend/run_server.py`, `launch_servers.ps1`, `start_manganex.bat`, `start_services_background.ps1`, `start_silent.vbs`, `backend/start_python.ps1`, `GeologyController.java`) | Replaced hardcoded author machine paths (`C:\Users\...\MANGANEX-main`) with script-relative directories and `PATH` tools, and injected `pythonAiServiceBaseUrl` in `GeologyController.java`. |

---

## 4. Cloudflare Security & Deployment Readiness Audit

### 4.1 Artifacts Added for Cloudflare Pages
- [`public/_headers`](public/_headers): Enforces `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`, `Cross-Origin-Opener-Policy: same-origin-allow-popups`, and a `Content-Security-Policy` tailored to Vite + WebGL `blob:` workers, Google Fonts, OSM/Carto/ArcGIS map tiles, and Google Maps; configures immutable long-term caching on `/assets/*` and `no-cache, no-store, must-revalidate` on `/index.html`.
- [`public/_redirects`](public/_redirects): Provides SPA fallback `/* /index.html 200` (static assets and Cloudflare Functions take precedence).
- [`wrangler.toml`](wrangler.toml): Configured with `pages_build_output_dir = "dist"` and `compatibility_date = "2026-04-01"`.

### 4.2 Architecture & Edge Security Checklist Before Production Cutover
1. **Frontend Build Configuration on Cloudflare Pages**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variables (Pages Dashboard -> Settings -> Environment Variables):
     - `VITE_API_BASE_URL=https://api.<your-domain>/api/v1` (required so the browser does not fall back to `http://127.0.0.1:8000/api/v1`)
     - `VITE_GOOGLE_MAPS_API_KEY=<rotated-referrer-restricted-key>` (optional if using MapLibre/Leaflet fallback)
   - Tighten `_headers` `connect-src`: once your custom API domain is known, remove `http://127.0.0.1:*`, `http://localhost:*`, and `https://*.trycloudflare.com` from production CSP if you only serve via your dedicated production API domain.
2. **Backend Connectivity via Cloudflare Tunnel / Workers (Never Expose Raw Origin Ports)**
   - Do not expose port `8000` or `8080` directly to the public internet without TLS.
   - Run an outbound-only **Cloudflare Tunnel (`cloudflared`)** routing `https://api.<your-domain>` to the reverse-proxied FastAPI/Spring Boot origin, or terminate behind Cloudflare Workers / Zero Trust.
   - Configure exact production CORS on backends (`BACKEND_CORS_ORIGINS=https://<your-pages-domain>`, `MANGANEX_CORS_ORIGINS=https://<your-pages-domain>`) and restrict or remove broad `*.pages.dev` preview regexes in production if preview branches should not access production data.
3. **Cloudflare SSL/TLS, WAF, Bot Protection & Zero Trust**
   - **SSL/TLS**: Enable **Full (strict)** mode, **Always Use HTTPS**, **Automatic HTTPS Rewrites**, and **Minimum TLS 1.2**; enable **HSTS** only after HTTPS is verified across all subdomains.
   - **WAF & Rate Limiting**: Enable Cloudflare Managed WAF Rules + OWASP Core Ruleset, and configure edge Rate Limiting on `/api/v1/auth/login`, `/api/v1/auth/register`, and `/api/v1/auth/forgot-password` (e.g., 5-10 requests/minute per client IP) to complement backend lockout protections.
   - **Bot Fight / Turnstile**: Add Cloudflare Turnstile CAPTCHA verification to login, registration, and password reset forms before opening registration publicly.
   - **Cloudflare Access**: Protect `*.pages.dev` preview URLs and `/admin/users` behind Cloudflare Zero Trust Access policies for MOIL/internal operators.

