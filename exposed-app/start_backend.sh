#!/bin/bash

echo "🚀 Starting AWS EC2 Dashboard Backend..."

# Navigate to backend directory
cd backend

# Install dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "📦 Installing Python dependencies..."
    pip install -r requirements.txt
fi

# Start the FastAPI backend
echo "🔧 Starting FastAPI backend on port 8001..."
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload &

BACKEND_PID=$!

echo "✅ Backend started with PID: $BACKEND_PID"
echo "📡 Backend API available at: http://localhost:8001"
echo "📚 API documentation at: http://localhost:8001/docs"

# Keep the script running
wait $BACKEND_PID
