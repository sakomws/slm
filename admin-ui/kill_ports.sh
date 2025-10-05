#!/bin/bash

echo "🛑 Killing processes on ports 3000 and 8000..."

# Kill processes on port 3000
echo "Killing processes on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "No processes found on port 3000"

# Kill processes on port 8000
echo "Killing processes on port 8000..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || echo "No processes found on port 8000"

# Kill by process patterns
echo "Killing by process patterns..."
pkill -f "uvicorn.*8000" 2>/dev/null || true
pkill -f "next.*3000" 2>/dev/null || true
pkill -f "node.*3000" 2>/dev/null || true

echo "✅ Port cleanup complete!"
echo "You can now run ./start_all.sh"
