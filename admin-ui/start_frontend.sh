#!/bin/bash

echo "🎨 Starting GitHub Security Alerts Dashboard Frontend..."

# Kill any existing processes on port 3000
echo "🔄 Checking for existing processes on port 3000..."

# Find and kill processes using port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
pkill -f "next.*3000" 2>/dev/null || true
pkill -f "node.*3000" 2>/dev/null || true

# Wait a moment for processes to stop
sleep 2

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed."
    exit 1
fi

# Navigate to frontend directory
cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

echo "🎨 Starting Next.js frontend on port 3000..."
PORT=3000 npm run dev
