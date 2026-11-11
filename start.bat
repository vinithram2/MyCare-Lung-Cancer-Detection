@echo off
title MyCare AI Launcher
echo ===================================================
echo             Starting MyCare AI System
echo ===================================================
echo.

echo [1/2] Launching Backend Server (FastAPI on http://localhost:8000)...
start "MyCare AI - Backend" cmd /k "cd backend && python run.py"

timeout /t 2 /nobreak >nul

echo [2/2] Launching Frontend Server (React Vite on http://localhost:5173)...
start "MyCare AI - Frontend" cmd /k "cd frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo Opening MyCare in your browser...
start http://localhost:5173

echo ===================================================
echo  System is running! Keep the terminal windows open.
echo ===================================================
pause
