#!/bin/bash

echo "🚀 Starting GitHub Security Alerts Dashboard - Full Stack"
echo "=================================================="

# Kill any existing processes on the ports we need
echo "🔄 Checking for existing processes..."

# Kill processes using specific ports
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

# Kill processes by pattern
pkill -f "uvicorn.*8000" 2>/dev/null || true
pkill -f "next.*3000" 2>/dev/null || true
pkill -f "node.*3000" 2>/dev/null || true

# Wait a moment for processes to stop
sleep 3

# Make scripts executable
chmod +x start_frontend.sh
chmod +x start_backend.sh

# Start backend in background
echo "🔧 Starting backend..."
./start_backend.sh &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend in background
echo "🎨 Starting frontend..."
./start_frontend.sh &
FRONTEND_PID=$!

echo ""
echo "✅ Both services are starting..."
echo "📡 Backend API: http://localhost:8000"
echo "🌐 Frontend UI: http://localhost:3000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    
    # Also kill any processes that might still be running
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    pkill -f "uvicorn.*8000" 2>/dev/null || true
    pkill -f "next.*3000" 2>/dev/null || true
    pkill -f "node.*3000" 2>/dev/null || true
    
    echo "✅ All services stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
