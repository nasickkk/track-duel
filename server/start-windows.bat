@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Install Node.js 20 or newer: https://nodejs.org/
  pause
  exit /b 1
)
if not exist "node_modules\ws\package.json" (
  echo Installing dependencies...
  call npm install --omit=dev --no-audit --no-fund
  if errorlevel 1 (pause & exit /b 1)
)
set "PORT=10000"
set "NODE_ENV=production"
set "ALLOWED_ORIGIN=https://nasickkk.github.io"
echo.
echo TRACK DUEL relay on localhost:%PORT%
echo Local health check: http://127.0.0.1:%PORT%/health
echo This is HTTP/WS only. GitHub Pages players require a PUBLIC HTTPS/WSS URL through Caddy or tunnel.
echo Do not forward port 10000 directly to the internet.
echo.
node index.mjs
pause
