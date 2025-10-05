#!/bin/bash

echo "🚀 Starting GitHub Security Alerts Dashboard with Tunnel..."

# Check if required tools are available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    cd frontend
    npm install
    cd ..
fi

if ! python3 -c "import fastapi" 2>/dev/null; then
    echo "📦 Installing Python dependencies..."
    cd backend
    pip install -r requirements.txt
    cd ..
fi

echo "🔧 Starting FastAPI backend on port 8000..."
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

echo "🌐 Starting tunnel service..."

# Try different tunnel services in order of preference
if command -v ngrok &> /dev/null; then
    echo "📡 Using ngrok..."
    ngrok http 8000 &
    TUNNEL_PID=$!
    sleep 5
    
    # Get ngrok URL
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for tunnel in data.get('tunnels', []):
        if tunnel.get('proto') == 'https':
            print(tunnel.get('public_url', ''))
            break
except:
    pass
" 2>/dev/null)
    
    if [ -n "$NGROK_URL" ]; then
        WEBHOOK_URL="$NGROK_URL/webhook/github/security-alert"
        echo "✅ ngrok tunnel active: $NGROK_URL"
    else
        echo "⚠️  Could not get ngrok URL. Please check ngrok authentication."
        echo "💡 Sign up at: https://dashboard.ngrok.com/signup"
        echo "💡 Get authtoken: https://dashboard.ngrok.com/get-started/your-authtoken"
        echo "💡 Configure: ngrok config add-authtoken YOUR_AUTHTOKEN"
    fi

elif command -v cloudflared &> /dev/null; then
    echo "📡 Using Cloudflare Tunnel..."
    cloudflared tunnel --url http://localhost:8000 &
    TUNNEL_PID=$!
    sleep 5
    echo "✅ Cloudflare tunnel started"
    echo "💡 Check the output above for your tunnel URL"

elif command -v lt &> /dev/null; then
    echo "📡 Using localtunnel..."
    lt --port 8000 &
    TUNNEL_PID=$!
    sleep 5
    echo "✅ localtunnel started"
    echo "💡 Check the output above for your tunnel URL"

else
    echo "❌ No tunnel service found. Please install one of:"
    echo "   - ngrok: brew install ngrok/ngrok/ngrok"
    echo "   - cloudflared: brew install cloudflared"
    echo "   - localtunnel: npm install -g localtunnel"
    echo ""
    echo "🔄 Starting without tunnel (localhost only)..."
fi

echo ""
echo "🎨 Starting Next.js frontend on port 3000..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Application started successfully!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"

if [ -n "$WEBHOOK_URL" ]; then
    echo ""
    echo "🔗 GitHub Webhook URL:"
    echo "$WEBHOOK_URL"
    echo ""
    echo "📋 GitHub Webhook Setup:"
    echo "1. Go to your GitHub repository"
    echo "2. Navigate to Settings → Webhooks"
    echo "3. Click 'Add webhook'"
    echo "4. Set Payload URL to: $WEBHOOK_URL"
    echo "5. Select 'Security alerts' events"
    echo "6. Click 'Add webhook'"
fi

echo ""
echo "🧪 Test your webhook:"
echo "curl -X POST http://localhost:8000/webhook/github/test"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    kill $TUNNEL_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for processes
wait

