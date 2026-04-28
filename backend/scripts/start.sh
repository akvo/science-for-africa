#!/bin/sh
set -eu

echo "📦 Checking/Installing dependencies..."
npm install --no-audit --no-fund --prefer-offline

echo "🚀 Starting Strapi server..."

# Configuration Synchronization
# We run this before the server starts to ensure permissions are restored
# This is especially useful for fresh database environments (dev/mimic-prod)
echo "🔄 Importing configuration..."
npm run config-sync -- import --yes

if [ "${NODE_ENV:-development}" = "production" ]; then
    echo "🏗️ Building admin panel with URL: ${BACKEND_URL:-http://localhost/cms}..."
    npm run build
    echo "✅ Starting Strapi in production mode..."
    npm run start
else
    echo "✅ Starting Strapi in development mode..."
    npm run develop
fi
