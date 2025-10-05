#!/bin/bash

echo "🚀 Starting AWS EC2 Dashboard - Full Stack Application"
echo "=================================================="

# Kill any existing processes on the ports we need
echo "🔄 Checking for existing processes..."
pkill -f "uvicorn.*8001" 2>/dev/null || true
pkill -f "next.*3001" 2>/dev/null || true
pkill -f "node.*3001" 2>/dev/null || true

# Wait a moment for processes to stop
sleep 2

# Make scripts executable
chmod +x start_backend.sh
chmod +x start_frontend.sh

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
echo "📡 Backend API: http://localhost:8001"
echo "🌐 Frontend UI: http://localhost:3001"
echo "📚 API Docs: http://localhost:8001/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    
    # Also kill any processes that might still be running
    pkill -f "uvicorn.*8001" 2>/dev/null || true
    pkill -f "next.*3001" 2>/dev/null || true
    pkill -f "node.*3001" 2>/dev/null || true
    
    echo "✅ All services stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
