#!/bin/bash

echo "🎨 Starting AWS EC2 Dashboard Frontend..."

# Navigate to frontend directory
cd frontend

# Install dependencies if package.json exists
if [ -f "package.json" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Start the Next.js frontend
echo "🔧 Starting Next.js frontend on port 3001..."
npm run dev -- --port 3001 &

FRONTEND_PID=$!

echo "✅ Frontend started with PID: $FRONTEND_PID"
echo "🌐 Frontend available at: http://localhost:3001"

# Keep the script running
wait $FRONTEND_PID
