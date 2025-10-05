#!/bin/bash

echo "🔧 Starting GitHub Security Alerts Dashboard Backend..."

# Kill any existing processes on port 8000
echo "🔄 Checking for existing processes on port 8000..."

# Find and kill processes using port 8000
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
pkill -f "uvicorn.*8000" 2>/dev/null || true

# Wait a moment for processes to stop
sleep 2

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Navigate to backend directory
cd backend

# Install dependencies if needed
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo "📦 Installing Python dependencies..."
    pip install -r requirements.txt
fi

echo "🔧 Starting FastAPI backend on port 8000..."
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
