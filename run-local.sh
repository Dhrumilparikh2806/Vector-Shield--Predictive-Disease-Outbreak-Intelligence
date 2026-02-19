#!/bin/bash
# VectorShield Local Run Script (Mac/Linux)
# This script runs both backend and frontend locally, fully accessible by anyone via ngrok tunnel

echo "================================"
echo "VectorShield Local Deployment"
echo "================================"
echo ""

# Check if ngrok is installed
echo "Checking ngrok installation..."
if command -v ngrok &> /dev/null; then
    echo "✓ ngrok is installed"
else
    echo "✗ ngrok not found. Installing..."
    echo "Download from: https://ngrok.com/download"
    echo "Or install via Homebrew: brew install ngrok"
    read -p "Press Enter after installing ngrok"
fi

# Get ngrok auth token (if needed)
echo ""
echo "Setting up ngrok tunnels..."
ngrok authtoken your_token_here 2>/dev/null

# Start backend
echo ""
echo "Starting Backend (port 8000)..."
cd "$(pwd)"
source .venv/bin/activate
python -m uvicorn backend.main:app --reload --port 8000 &
BACKEND_PID=$!

# Start frontend
echo "Starting Frontend (port 5173)..."
cd frontend
npm run dev &
FRONTEND_PID=$!

cd ..

# Wait for services to start
echo ""
echo "Waiting for services to start..."
sleep 5

# Start ngrok tunnel
echo ""
echo "Starting ngrok tunnel..."
echo ""

ngrok http 8000 --domain=$NGROK_DOMAIN 2>/dev/null &
NGROK_PID=$!

echo ""
echo "✓ Services Started!"
echo ""
echo "Local Access:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo ""
echo "Public Access (via ngrok):"
echo "  Check ngrok dashboard for public URL"
echo ""

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID $NGROK_PID" EXIT
wait
