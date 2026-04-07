#!/bin/sh
set -eu

echo "🚀 Starting Strapi server..."

if [ "$NODE_ENV" = "production" ]; then
    echo "✅ Starting Strapi in production mode..."
    npm run start
else
    echo "✅ Starting Strapi in development mode..."
    # Give the database a few seconds to fully initialize
    echo "⏳ Waiting for database..."
    sleep 10
    npm run config-sync -- import --yes
    npm run develop
fi
