#!/bin/bash

# Everly Growth Tracker Deployment Script
echo "🚀 Deploying Everly Growth Tracker..."

# Stop existing containers
echo "📦 Stopping existing containers..."
docker-compose down

# Build and start the application
echo "🔨 Building and starting the application..."
docker-compose up -d --build

# Wait a moment for the container to start
echo "⏳ Waiting for application to start..."
sleep 10

# Check if the application is running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Everly Growth Tracker is now running!"
    echo "🌐 Access your application at: http://localhost:9378"
    echo "📊 Container status:"
    docker-compose ps
else
    echo "❌ Failed to start the application"
    echo "📋 Container logs:"
    docker-compose logs
    exit 1
fi
