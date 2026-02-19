# Vercel Deployment Checklist

## Pre-Deployment

- [ ] Commit all changes including `vercel.json`, `api/index.py`, updated `requirements.txt`
- [ ] Ensure `backend/ml_outputs/` CSV files are committed to git
- [ ] Test locally: Backend on port 8000, Frontend on port 5173
- [ ] Run `npm run build` in frontend directory to ensure no build errors

## Vercel Setup

- [ ] Connect GitHub repository to Vercel
- [ ] Configure build:
  - Framework: Other
  - Build Command: `cd frontend && npm install && npm run build`
  - Output Directory: `frontend/dist`

## Environment Variables (Optional)

Set in Vercel Dashboard → Settings → Environment Variables:

```
# For production with PostgreSQL
DATABASE_URL=postgresql://user:password@host:port/dbname

# For development (in-memory or SQLite - default)
# (leave empty, app will use defaults)
```

## After Deployment

- [ ] Visit `https://your-project.vercel.app`
- [ ] Check that:
  - ✅ Frontend loads (no 404)
  - ✅ Dashboard displays data
  - ✅ API calls succeed (check browser console)
  - ✅ Simulation works
  
## Monitoring

- View logs: Vercel Dashboard → Deployments → [Latest] → Logs
- Check Function Logs for Python errors
- Monitor Network tab in browser DevTools for API errors

## Fixing Issues

### "Cannot find module" errors
- Run: `git add -A && git commit -m "fix: add missing files"`
- Redeploy from Vercel dashboard

### API returns 500 errors
- Check Vercel Function Logs
- Ensure `backend/ml_outputs/*.csv` exists
- Check Python version (should be 3.11+)

### Frontend shows "Cannot find /api/v1"
- The frontend is correctly trying to use `/api/v1`
- Check that backend is responding at `https://your-domain.vercel.app/` (should show status)
- Verify CORS headers in browser Network tab

