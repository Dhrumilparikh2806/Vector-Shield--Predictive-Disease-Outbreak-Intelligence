# VectorShield - Local Deployment with Public Access

This guide explains how to run VectorShield on your personal computer and make it accessible to anyone via a public link.

## Overview

You'll use:
- **Local Services**: Backend (FastAPI) + Frontend (React) running on your PC
- **ngrok Tunnel**: Creates a public URL that anyone can access
- **Public Link**: Share one URL to give anyone access to your VectorShield instance

## Prerequisites

1. **Python 3.11+** - Already installed ✓
2. **Node.js** - For frontend (already installed) ✓
3. **ngrok** - For creating public tunnels

## Step 1: Download and Install ngrok

### Option A: Download from Website (Easiest)
1. Go to https://ngrok.com/download
2. Download the Windows version
3. Extract the `ngrok.exe` file
4. Move it to a folder in your PATH or note its location

### Option B: Install via Chocolatey (if you have admin)
```powershell
choco install ngrok
```

### Option C: Manual Setup
- Download from https://ngrok.com/download
- Extract to `C:\Program Files\ngrok\`
- Add to PATH or use full path when running

## Step 2: Set Up ngrok Account (Free)

1. Go to https://ngrok.com/signup (sign up for free)
2. Verify your email
3. Go to Dashboard → Auth → Copy your auth token
4. Run this once to authenticate:
```powershell
ngrok authtoken your_token_here
```

Replace `your_token_here` with your actual auth token.

## Step 3: Run VectorShield Locally

### Quick Start (PowerShell - Recommended for Windows)

```powershell
# Navigate to project
cd "c:\Users\Hp\OneDrive\Desktop\vectorshield 2.0\vectorshield"

# Run the convenience script
.\run-local.ps1
```

### Manual Start (if script doesn't work)

**Terminal 1 - Backend:**
```powershell
cd "c:\Users\Hp\OneDrive\Desktop\vectorshield 2.0\vectorshield"
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```powershell
cd "c:\Users\Hp\OneDrive\Desktop\vectorshield 2.0\vectorshield\frontend"
npm run dev
```

**Terminal 3 - ngrok Tunnel:**
```powershell
ngrok http 8000
```

## Step 4: Access Your Application

### Local Access (Only you on your network)
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Public Access (Anyone with the link)

When you run ngrok, you'll see output like:
```
ngrok by @inconshreveable

Session Status                online
Account                       your-email@gmail.com
Version                       3.0.0
Region                        United States (us)
Forwarding                    https://abc123def456.ngrok.io -> http://localhost:8000

Connections                   ttl     opn     rt1     rt5     p50     p95
                              0       0       0.00    0.00    0.00    0.00
```

**The public URL is**: `https://abc123def456.ngrok.io`

### Accessing Frontend Publicly

Since ngrok tunnels port 8000 (backend), you need to:

1. **Update frontend to use the ngrok URL:**
   - Open browser DevTools (F12)
   - Check Console for the public URL
   - The frontend will automatically use `/api/v1` on the same domain

2. **Or access through backend:**
   - Frontend is running on localhost:5173
   - Backend API is at: `https://abc123def456.ngrok.io/api/v1`
   - Manually point frontend to public backend URL

### Better Solution: Tunnel Both Services

To make everything accessible publicly:

**Terminal with both services:**
```powershell
# Terminal 1 - Backend
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload --port 8000

# Terminal 2 - Frontend
cd frontend && npm run dev  # runs on 5173

# Terminal 3 - Tunnel Backend
ngrok http 8000

# Terminal 4 - Tunnel Frontend (if using ngrok free plan separately)
ngrok http 5173
```

Then you'll have two public URLs:
- **Frontend Public**: `https://abc123def456.ngrok.io` (from Terminal 4)
- **Backend Public**: `https://def456ghi789.ngrok.io` (from Terminal 3)

## Step 5: Share the Link

Send anyone this link:
```
https://abc123def456.ngrok.io  (or your actual ngrok URL)
```

They can now access your VectorShield instance in their browser!

## Advanced: Using Cloudflare Tunnel (Better for Production)

ngrok free tier has limitations. For better reliability:

1. Install Cloudflare Tunnel:
   ```powershell
   choco install cloudflare-warp
   ```

2. Authenticate:
   ```powershell
   cloudflared login
   ```

3. Create tunnel:
   ```powershell
   cloudflared tunnel run vectorshield
   ```

4. Get public URL from Cloudflare dashboard

## Troubleshooting

### "Port already in use"
```powershell
# Kill process using port
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### ngrok command not found
- Either add ngrok to PATH
- Or use full path: `C:\path\to\ngrok http 8000`

### "ERR_NGROK_224 - Authentication failed"
- Your auth token is invalid or expired
- Visit https://ngrok.com/dashboard and get a new token
- Run: `ngrok authtoken new_token`

### Frontend shows blank page
- Check console (F12) for API errors
- Make sure backend is running
- Check that frontend is pointing to correct API URL

### ngrok tunnel keeps disconnecting
- Free ngrok has limitations
- Use Cloudflare Tunnel for better stability
- Or get ngrok Pro plan

## Best Practices

1. **Security Note**: 
   - ngrok tunnels are public - anyone with the link can access
   - Consider adding password protection if needed
   - Don't expose sensitive data

2. **Uptime**: 
   - Your PC must stay running and connected to internet
   - ngrok session expires after 2 hours (free plan)

3. **Performance**: 
   - Local PC access is faster than remote
   - Public access goes through ngrok's servers (slight latency)

4. **Production Alternative**:
   - For permanent public access, deploy to cloud (Vercel, AWS, Google Cloud, etc.)
   - Using Vercel is recommended (already configured in this project)

## Sharing with Your Team

Send them:
1. The public ngrok URL
2. Instructions on how to use the app
3. Expected runtime (when your PC will be running it)

Example message:
```
VectorShield Demo: https://abc123def456.ngrok.io
Available: Until 6 PM tomorrow
Access: Open the link in any browser
Support: Contact me if issues
```

## Stopping Services

To stop everything:
1. Press `Ctrl+C` in each terminal
2. ngrok will also stop
3. Public link will no longer work

## Creating a Quick Batch Script (Windows Only)

Save as `start-vectorshield.bat`:
```batch
@echo off
cd "c:\Users\Hp\OneDrive\Desktop\vectorshield 2.0\vectorshield"
start "Backend" cmd /k ".\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload --port 8000"
cd frontend
start "Frontend" cmd /k "npm run dev"
cd ..
start "Tunnel" cmd /k "ngrok http 8000"
```

Then just double-click to start everything!

## Next Steps

1. Install ngrok
2. Get auth token from ngrok.com
3. Run local services
4. Get public link from ngrok output
5. Share link with others
6. Your VectorShield is now publicly accessible! 🎉

## Comparison: Local vs Vercel

| Feature | Local (ngrok) | Vercel |
|---------|---------------|--------|
| Setup Time | 5 minutes | 2 minutes |
| Uptime | When PC is on | 24/7 |
| Speed | Fast (local) | Very fast (CDN) |
| Cost | Free | Free |
| Ease | Medium | Easy |
| Best For | Demos, testing | Production |

For demos and testing with ngrok, for permanent deployment use Vercel (already configured). 🚀
