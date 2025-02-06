@echo off
SETLOCAL

:: Define installation path
SET "INSTALL_DIR=%ProgramFiles%\Vanusa"

echo Stopping the Vanusa application...
pm2 stop Vanusa-main >nul 2>&1
pm2 stop Vanusa-safe >nul 2>&1
pm2 stop V-node-red >nul 2>&1

echo Deleting PM2 processes...
pm2 delete Vanusa-main >nul 2>&1
pm2 delete Vanusa-safe >nul 2>&1
pm2 delete V-node-red >nul 2>&1

      npm rm @picovoice/cheetah-node
      npm rm @picovoice/cobra-node
      npm rm @picovoice/leopard-node
      npm rm @picovoice/orca-node
      npm rm @picovoice/porcupine-node
      npm rm @picovoice/pvrecorder-node
      npm rm @picovoice/rhino-node
      npm rm fluent-ffmpeg
      npm rm gtts
      npm rm gtts.js
      npm rm node-red
      npm rm node-wav-player-optimized
      npm rm open
      npm rm openai
      npm rm pm2
      npm rm portfinder
      npm rm wavefile
      npm rm ws
      
set "startupFolder=%appdata%\Microsoft\Windows\Start Menu\Programs\Startup"
del "%startupFolder%\pm2_resurrect.bat" /f
echo File pm2_resurrect.bat removed.

sc stop VANUSA_PowerMonitorService
sc delete VANUSA_PowerMonitorService

IF EXIST "%INSTALL_DIR%" (
    echo Removing the Vanusa installation directory...
    rmdir /s /q "%INSTALL_DIR%"
    echo Vanusa directory removed successfully.
) ELSE (
    echo Vanusa is not installed in %INSTALL_DIR%.
)

echo Uninstallation complete!

pause
ENDLOCAL
