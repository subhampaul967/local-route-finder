#!/bin/sh

# Log startup
echo "🚀 Starting Local Route Finder Backend..."
echo "📋 Environment variables:"
echo "DATABASE_URL: ${DATABASE_URL:+SET}"
echo "JWT_SECRET: ${JWT_SECRET:+SET}"
echo "ADMIN_USERNAME: ${ADMIN_USERNAME:+SET}"
echo "ADMIN_PASSWORD: ${ADMIN_PASSWORD:+SET}"
echo "PORT: ${PORT:-4000}"
echo "NODE_ENV: ${NODE_ENV:-development}"

# Wait for database to be ready (if needed)
echo "⏳ Waiting for application to start..."

# Start the application
exec npm start
