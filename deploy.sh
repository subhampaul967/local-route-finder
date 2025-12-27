#!/bin/bash

# Deployment script for Local Bus Tracker
echo "Starting deployment process..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Build shared package
echo "Building shared package..."
npm run build --workspace shared

# Build backend
echo "Building backend..."
npm run build --workspace backend

# Run database migrations
echo "Running database migrations..."
cd backend
npm run prisma:deploy
cd ..

# Build frontend
echo "Building frontend..."
npm run build --workspace frontend

echo "Deployment completed successfully!"
echo "Make sure to set up your environment variables before starting the services."
