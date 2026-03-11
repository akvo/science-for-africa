#!/bin/sh
# set -eu # Disabling -u to avoid exit on unset NODE_ENV

echo "🚀 Starting Strapi server script..."
echo "Current NODE_ENV: ${NODE_ENV:-development (defaulted)}"

if [ "${NODE_ENV:-development}" = "production" ]; then
    echo "✅ Starting Strapi in production mode..."
    npm run start
else
    echo "✅ Starting Strapi in development mode..."
    npm run develop
fi

echo "⚠️ Strapi process exited with code $?"
