# VectorShield Vercel Deployment Guide

## Prerequisites
- GitHub repository with VectorShield code
- Vercel account (free tier works)
- Optional: PostgreSQL database for production (Vercel Storage or external)

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "VectorShield deployment ready"
git push origin main
```

### 2. Deploy to Vercel
- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Select your GitHub repository
- Configure:
  - **Framework Preset**: Other
  - **Build Command**: `cd frontend && npm install && npm run build`
  - **Output Directory**: `frontend/dist`
  - **Install Command**: `npm install` (for backend dependencies)

### 3. Environment Variables (Optional but Recommended)
Set these in Vercel Project Settings → Environment Variables:

**For Production Database** (PostgreSQL recommended):
```
DATABASE_URL=postgresql://user:password@host:port/database_name
```

If not set, the app will use in-memory SQLite (data resets on each deployment).

### 4. Deployment
Vercel will automatically:
- Install Python dependencies from `backend/requirements.txt`
- Build the React frontend
- Deploy both as a unified application

## What was fixed for Vercel compatibility:

✅ **vercel.json** - Updated Python runtime configuration
✅ **api/index.py** - Created proper ASGI entry point
✅ **database.py** - Added fallback for serverless filesystem
✅ **requirements.txt** - Added missing dependencies
✅ **.vercelignore** - Configured to exclude unnecessary files

## Troubleshooting

### "500 Error" responses
1. Check Vercel Function Logs in dashboard
2. Verify `DATABASE_URL` environment variable if using external DB
3. Ensure `backend/ml_outputs/` CSV files are committed to git

### Frontend CSS/JS issues
- Clear browser cache (Cmd/Ctrl + Shift + R)
- Check that frontend built successfully (see Vercel build logs)

### Data not loading
- ML output files must be in `backend/ml_outputs/`
- Ensure CSV files are committed to git
- Check `backend/requirements.txt` has all dependencies

## Local Development

```bash
# Backend
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload --port 8000

# Frontend (in separate terminal)
cd frontend && npm run dev
```

Then open: `http://localhost:5173`

## API Base URL

- **Local**: `http://localhost:8000/api/v1`
- **Vercel**: `https://your-vercel-domain.vercel.app/api/v1`

The frontend automatically detects and uses the correct URL.
