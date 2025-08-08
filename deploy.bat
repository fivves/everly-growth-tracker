@echo off
echo 🚀 Deploying Everly Growth Tracker...

REM Stop existing containers
echo 📦 Stopping existing containers...
docker-compose down

REM Build and start the application
echo 🔨 Building and starting the application...
docker-compose up -d --build

REM Wait a moment for the container to start
echo ⏳ Waiting for application to start...
timeout /t 10 /nobreak >nul

REM Check if the application is running
docker-compose ps | findstr "Up" >nul
if %errorlevel% equ 0 (
    echo ✅ Everly Growth Tracker is now running!
    echo 🌐 Access your application at: http://localhost:3000
    echo 📊 Container status:
    docker-compose ps
) else (
    echo ❌ Failed to start the application
    echo 📋 Container logs:
    docker-compose logs
    exit /b 1
)
