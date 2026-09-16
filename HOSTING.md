# Hosting VectorShield (free tier)

## Architecture

```
Browser
  │
  ▼
Vercel (frontend)  ──────►  Render (backend, Docker)  ──────►  Neon (Postgres)
  static Vite build           FastAPI + JWT auth               hospital accounts,
  no sleep, free               free web service                 admin approvals
                                sleeps after 15 min idle,
                                wakes on next request
```

- **Frontend → Vercel.** Static Vite build, deploys from `frontend/`. Free, no card, never sleeps.
- **Backend → Render.** Deploys from `backend/Dockerfile` via `render.yaml`. Free web service — the only real cost is a ~30–50s cold start after 15 minutes of no traffic.
- **Database → Neon (or Supabase).** Render's free tier has an ephemeral filesystem — a SQLite file gets wiped on every redeploy and periodic restart. Since the app now has real hospital signups and admin approvals that must survive restarts, it needs a real hosted Postgres, not SQLite. `backend/database.py` already supports this — it just needs a `DATABASE_URL` env var pointing at Postgres instead of a local file.

## What I've already done

- Added `psycopg2-binary` to `backend/requirements.txt` (Postgres driver)
- `render.yaml` — backend-only Docker blueprint, with `DATABASE_URL` / `JWT_SECRET_KEY` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` marked as secrets you enter in Render's dashboard (never committed)
- `frontend/vercel.json` — zero-config Vite build for Vercel
- Removed everything not needed to deploy: the old PyInstaller desktop-exe build tooling, the abandoned Vercel-serverless-Python attempt, duplicate/dead scripts, and stale docs from earlier deployment attempts

## What you'll need to do tonight

### 1. Push to GitHub
```bash
git add -A
git commit -m "Clean up repo, prep for hosting"
git push
```

### 2. Create the database — [neon.tech](https://neon.tech) (free, no card)
1. Sign up, create a project (any region close to you).
2. Copy the connection string it gives you — looks like:
   `postgresql://user:password@ep-xxxx.neon.tech/dbname?sslmode=require`
3. Keep this tab open, you'll paste it into Render next.

*(Supabase is a fine alternative if you'd rather use that — same idea, copy its Postgres connection string instead.)*

### 3. Deploy the backend — [render.com](https://render.com) (free, no card)
1. Sign up, connect your GitHub account, select this repo.
2. Render should detect `render.yaml` automatically and offer to create the `vectorshield-backend` service — accept it (or create a new Web Service manually pointing at `backend/Dockerfile` if it doesn't).
3. In the service's **Environment** tab, fill in the 4 secret values `render.yaml` left blank:
   | Key | Value |
   |---|---|
   | `DATABASE_URL` | the Neon connection string from step 2 |
   | `JWT_SECRET_KEY` | any long random string — e.g. run `openssl rand -hex 32` locally, or use a password generator |
   | `ADMIN_EMAIL` | the email you want to log into the admin dashboard with |
   | `ADMIN_PASSWORD` | the password for that admin account |
4. Deploy. Once live, copy the service's public URL (`https://vectorshield-backend-xxxx.onrender.com`).
5. Sanity check: visit `<that URL>/docs` — you should see the FastAPI docs page.

### 4. Deploy the frontend — [vercel.com](https://vercel.com) (free, no card)
1. Sign up, import this GitHub repo as a new project.
2. Set **Root Directory** to `frontend` (Vercel should then auto-detect Vite via `frontend/vercel.json`).
3. Add one environment variable:
   | Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `<your Render backend URL>/api/v1` |
4. Deploy. Vercel gives you a URL like `https://vectorshield.vercel.app`.

### 5. Test it end to end
1. Open the Vercel URL → sign up a test hospital, picking a plan and hospital count.
2. Log in as the admin (the email/password you set in step 3) at the same URL → you should land on `/admin` and see the pending hospital.
3. Approve it, confirm the plan/count.
4. Log back in as the test hospital → should reach the dashboard with live data.

If step 1's first request feels slow, that's Render's free tier waking up from sleep — normal, only happens after idle periods.

## Notes for later (not tonight)

- Render's free web service sleeps after 15 min idle. If that cold-start delay becomes annoying, upgrading just the backend to Render's paid tier (~$7/mo) removes it — the frontend on Vercel is already always-on for free either way.
- `JWT_SECRET_KEY` and the admin password are only as safe as who has access to the Render dashboard — treat them like any other production secret.
- CORS is currently wide open (`allow_origins=["*"]`) in `backend/main.py`. Fine for getting this live; worth narrowing to just your Vercel domain once things are stable.
