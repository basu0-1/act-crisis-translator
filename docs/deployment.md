# Production Deployment Guide — ACT Platform

This guide outlines deploying the ACT monorepo to production using modern cloud infrastructure:
- **Database**: Managed PostgreSQL 16 (Neon / Supabase / AWS RDS)
- **Backend**: Render / Railway / Fly.io / Docker
- **Frontend**: Vercel / Cloudflare Pages

---

## 1. Managed Database Setup (Neon / Supabase)

1. Provision a PostgreSQL 16 instance on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
2. Retrieve the pooled connection string:
   ```env
   DATABASE_URL="postgresql://username:password@ep-sample-12345.us-east-2.aws.neon.tech/act_db?sslmode=require"
   ```
3. The SQLAlchemy models will automatically initialize tables on first backend boot.

---

## 2. Backend Deployment (Render / Railway)

### Using Docker or Python Environment:
1. Connect your GitHub repository to Render or Railway.
2. Select root directory: `backend/` (or use root Dockerfile `Dockerfile.backend`).
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Configure Environment Variables:
   - `DATABASE_URL`: Your managed PostgreSQL connection URL.
   - `SECRET_KEY`: High-entropy cryptographic string (e.g. generated via `openssl rand -hex 32`).
   - `ENVIRONMENT`: `production`
   - `DEMO_MODE`: `true` (or `false` when connecting to live civil protection ingestion).
   - `BACKEND_CORS_ORIGINS`: `["https://your-frontend.vercel.app"]`
6. Verify Deployment:
   Send a GET request to `https://your-backend.onrender.com/health` and verify `{"status": "healthy"}`.

---

## 3. Frontend Deployment (Vercel)

1. Import the repository into [Vercel](https://vercel.com).
2. Configure Project Settings:
   - Framework Preset: **Next.js**
   - Root Directory: `frontend`
   - Build Command: `next build`
   - Output Directory: `.next`
3. Configure Environment Variables:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend.onrender.com/api`
   - `BACKEND_API_URL`: `https://your-backend.onrender.com/api`
4. Click **Deploy**. Vercel will build the production Next.js application and deploy it to a global edge network.

---

## 4. Local Deployment with Docker Compose

To run the full stack locally with PostgreSQL:
```bash
# 1. Copy environment variables
cp .env.example .env

# 2. Launch multi-container orchestration
docker compose up --build

# 3. Access applications:
# Frontend: http://localhost:3000
# Backend API & Swagger: http://localhost:8000/docs
# PostgreSQL Database: localhost:5432
```

---

## 5. Post-Deployment Verification Checklist

- [ ] `/health` returns 200 OK.
- [ ] Landing page loads at root `/` with working theme toggle and language selector.
- [ ] Citizen registration creates account and redirects to `/dashboard`.
- [ ] Emergency alert renders with `SIMULATED / DEMO SCENARIO` watermark.
- [ ] Clicking "Simulate Riverside Road Blockage" triggers dynamic route recalculation.
- [ ] Disconnecting internet displays offline cached plan banner.
- [ ] Admin login allows managing alerts and viewing security audit trail.
- [ ] Regular citizen login gets 403 Forbidden when attempting to access `/admin/dashboard`.
