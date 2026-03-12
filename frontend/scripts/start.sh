#!/bin/sh
set -e

echo "🚀 Starting Frontend server script..."

# Check if node_modules exists, if not install
if [ ! -d "node_modules" ]; then
    echo "📦 node_modules not found, installing..."
    npm install
fi

echo "✅ Running Next.js in development mode..."
npm run dev
