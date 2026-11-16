@echo off
setlocal
cd /d "%~dp0"
echo.
echo ==================================================
echo TRACK DUEL 5.3 - RADMIN VPN LAN SERVER
echo ==================================================
echo.
echo 1. Connect Radmin VPN on both computers.
echo 2. Copy YOUR OWN IPv4 from Radmin VPN (usually 26.x.x.x).
echo 3. Do NOT enter your friend's IP or your public ISP IP.
echo.
set /p "RADMIN_IP=Enter YOUR Radmin VPN IPv4: "
if "%RADMIN_IP%"=="" (
  echo Missing IP address.
  pause
  exit /b 1
)
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Install Node.js 20 or newer from https://nodejs.org/
  pause
  exit /b 1
)
if not exist "node_modules\ws\package.json" (
  echo Installing WebSocket dependency...
  call npm install --omit=dev --no-audit --no-fund
  if errorlevel 1 (pause & exit /b 1)
)
set "PORT=10000"
set "LAN_MODE=1"
set "BIND_HOST=%RADMIN_IP%"
set "ALLOWED_ORIGIN=http://%RADMIN_IP%:10000"
set "NODE_ENV=production"
echo.
echo ============================================
echo LAN GAME ADDRESS:
echo http://%RADMIN_IP%:10000/play
echo.
echo Share this URL with your friend in Radmin VPN.
echo If asked by Windows Firewall, allow Node.js inbound
echo on the Radmin VPN network only.
echo Keep this window open while playing.
echo ============================================
echo.
node index.mjs
if errorlevel 1 (
  echo Server failed. Verify your IP in Radmin VPN and restart.
)
pause
