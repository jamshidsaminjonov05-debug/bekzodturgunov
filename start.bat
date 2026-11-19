@echo off
cd /d %~dp0
if not exist backend\.venv (
  python -m venv backend\.venv
  backend\.venv\Scripts\pip install -r backend\requirements.txt
)
if not exist backend\.env copy backend\.env.example backend\.env
if not exist frontend\node_modules (cd frontend && npm install && cd ..)
start "Backend" cmd /k "cd backend && .venv\Scripts\python -m uvicorn app.main:app --reload --port 8000"
start "Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 3 >nul
start http://localhost:5173
