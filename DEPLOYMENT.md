# MANGANEX — Production & Prototype Deployment Guide

## 1. Quickstart: Full Stack via Docker Compose (Recommended for Judges)

MANGANEX can be run locally in a single command with zero API keys or external secrets required:

```bash
docker compose up --build
```

- **Frontend UI (Nginx SPA)**: `http://localhost:3000`
- **FastAPI ML Backend**: `http://localhost:8000`
- **Interactive OpenAPI Documentation**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/health`

The container automatically seeds the local SQLite database with MOIL mines cadastre, historical weather telemetry, and precomputed prospectivity grids.

---

## 2. Cloud Architecture (Vercel / Cloudflare Pages + Render)

- **Frontend SPA**: Vercel / Cloudflare Pages (`https://manganex-three.vercel.app`)
- **FastAPI Backend**: Render Web Service (`https://manganex-api.onrender.com` or custom domain)
- **Database**: SQLite (`backend/manganex.db`) with automatic seeded fallback

---

## 3. Keep-Alive Ping to `/health` (Preventing Cold Starts)

Free-tier cloud hosts (e.g., Render, Railway) spin down idle backend web services after 15 minutes of inactivity. When a judge opens the landing page, a cold start might cause a 40–50 second delay.

### Mitigation in Code
The MANGANEX landing page ([LandingPage.tsx](file:///c:/Users/Yashraj%20Jadhav/OneDrive/Desktop/MANGANEX-main/src/components/landing/LandingPage.tsx)) automatically pings `/health` upon initial render and displays a subtle banner:
`"Warming up analytics engine..."`
until the server responds, ensuring the UI never looks broken to judges.

### Automated Keep-Alive Setup (Zero Downtime)

#### Option A: UptimeRobot (Free HTTP Monitor)
1. Create a free account at [UptimeRobot.com](https://uptimerobot.com).
2. Click **Add New Monitor**:
   - **Monitor Type**: `HTTP(s)`
   - **Friendly Name**: `MANGANEX Backend Health`
   - **URL (or IP)**: `https://<YOUR-RENDER-BACKEND>.onrender.com/health`
   - **Monitoring Interval**: Every `5 minutes`
3. Save the monitor. UptimeRobot will ping `/health` continuously, keeping the Python process and scikit-learn ML models hot in RAM.

#### Option B: Crontab (Any Linux / VPS / Raspberry Pi)
Add the following entry to your crontab (`crontab -e`):
```bash
*/5 * * * * curl -fsS https://<YOUR-RENDER-BACKEND>.onrender.com/health > /dev/null 2>&1
```

#### Option C: GitHub Actions Scheduled Keep-Alive
A GitHub Actions workflow can ping the `/health` endpoint every 10 minutes:
```yaml
name: Backend Keep-Alive Ping
on:
  schedule:
    - cron: '*/10 * * * *'
  workflow_dispatch:
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping /health
        run: curl -fsS https://<YOUR-RENDER-BACKEND>.onrender.com/health || exit 0
```

---

## 4. Production Environment Configuration

Create a `.env` in the root (matching `.env.example`):
```bash
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=replace-with-a-long-random-secret
VITE_API_BASE_URL=https://<YOUR-BACKEND-URL>/api/v1
BACKEND_CORS_ORIGINS=https://manganex-three.vercel.app,http://localhost:3000
```
