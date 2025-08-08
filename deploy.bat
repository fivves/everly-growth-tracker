@echo off
setlocal ENABLEDELAYEDEXPANSION
echo 🚀 Deploying Everly Growth Tracker...

REM Detect docker compose command (v2 preferred)
for /f "tokens=*" %%i in ('where docker 2^>nul') do set DOCKER=%%i
if not defined DOCKER (
  echo ❌ Docker is not installed or not in PATH.
  exit /b 1
)

docker compose version >nul 2>&1
if %errorlevel% equ 0 (
  set COMPOSE=docker compose
) else (
  docker-compose version >nul 2>&1
  if %errorlevel% equ 0 (
    set COMPOSE=docker-compose
  ) else (
    echo ❌ Neither "docker compose" nor "docker-compose" is available. Please install Docker Desktop.
    exit /b 1
  )
)

REM Stop existing containers
echo 📦 Stopping existing containers...
%COMPOSE% down

REM Build and start the application
echo 🔨 Building and starting the application...
%COMPOSE% up -d --build

REM Wait a moment for the container to start
echo ⏳ Waiting for application to start...
timeout /t 10 /nobreak >nul

REM Check if the application is running
%COMPOSE% ps | findstr "Up" >nul
if %errorlevel% equ 0 (
    echo ✅ Everly Growth Tracker is now running!
    echo 🌐 Access your application at: http://localhost:9378
    echo 📊 Container status:
    %COMPOSE% ps
) else (
    echo ❌ Failed to start the application
    echo 📋 Container logs:
    %COMPOSE% logs
    exit /b 1
)
endlocal
