#!/bin/sh
set -e

echo "🚀 Starting Strapi server script..."

# Check if node_modules exists, if not install
if [ ! -d "node_modules" ]; then
    echo "📦 node_modules not found, installing..."
    npm install
fi

echo "Current NODE_ENV: ${NODE_ENV:-development (defaulted)}"

if [ "${NODE_ENV:-development}" = "production" ]; then
    echo "✅ Starting Strapi in production mode..."
    npm run build
    npm run start
else
    echo "✅ Starting Strapi in development mode..."
    # Ensure admin is built if not present
    if [ ! -d ".cache" ] || [ ! -d "build" ]; then
         echo "🏗️ Building Strapi admin..."
         npm run build
    fi
    npm run develop
fi
