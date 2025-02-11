@echo off
SETLOCAL

SET "INSTALL_DIR=%ProgramFiles%\Vanusa"

echo Stopping the Vanusa application...
cmd /c pm2 stop Vanusa-main >nul 2>&1
cmd /c pm2 stop Vanusa-safe >nul 2>&1
cmd /c pm2 stop V-node-red >nul 2>&1

echo Deleting PM2 processes...
cmd /c pm2 delete Vanusa-main >nul 2>&1
cmd /c pm2 delete Vanusa-safe >nul 2>&1
cmd /c pm2 delete V-node-red >nul 2>&1

cmd /c pnpm rm --dir "%INSTALL_DIR%" @picovoice/pvrecorder-node
cmd /c pnpm rm --dir "%INSTALL_DIR%" @picovoice/cheetah-node
cmd /c pnpm rm --dir "%INSTALL_DIR%" @picovoice/cobra-node
cmd /c pnpm rm --dir "%INSTALL_DIR%" @picovoice/leopard-node
cmd /c pnpm rm --dir "%INSTALL_DIR%" @picovoice/orca-node
cmd /c pnpm rm --dir "%INSTALL_DIR%" @picovoice/porcupine-node
cmd /c pnpm rm --dir "%INSTALL_DIR%" @picovoice/rhino-node
cmd /c pnpm rm --dir "%INSTALL_DIR%" fluent-ffmpeg
cmd /c pnpm rm --dir "%INSTALL_DIR%" gtts
cmd /c pnpm rm --dir "%INSTALL_DIR%" translate-google
cmd /c pnpm rm --dir "%INSTALL_DIR%" node-red
cmd /c pnpm rm --dir "%INSTALL_DIR%" node-wav-player-optimized
cmd /c pnpm rm --dir "%INSTALL_DIR%" open
cmd /c pnpm rm --dir "%INSTALL_DIR%" openai
cmd /c pnpm rm --dir "%INSTALL_DIR%" pm2
cmd /c pnpm rm --dir "%INSTALL_DIR%" portfinder
cmd /c pnpm rm --dir "%INSTALL_DIR%" wavefile
cmd /c pnpm rm --dir "%INSTALL_DIR%" ws

set "startupFolder=%appdata%\Microsoft\Windows\Start Menu\Programs\Startup"
cmd /c del "%startupFolder%\pm2_resurrect.bat" /f
echo File pm2_resurrect.bat removed.

cmd /c sc stop VANUSA_PowerMonitorService >nul 2>&1
cmd /c sc delete VANUSA_PowerMonitorService >nul 2>&1

IF EXIST "%INSTALL_DIR%" (
    echo Removing the Vanusa installation directory...
    cmd /c rmdir /s /q  "%INSTALL_DIR%"
    echo Vanusa directory removed successfully.
) ELSE (
    echo Vanusa is not installed in %INSTALL_DIR%.
)

set /p confirm="Do you want to uninstall Node.js, pnpm, and Git? (Y/N): "
IF /I "%confirm%"=="Y" (
    echo Uninstalling Node.js...
    cmd /c wmic product where "name like 'Node.js%%'" call uninstall /nointeractive

    echo Uninstalling pnpm...
    cmd /c rd /s /q "%LOCALAPPDATA%\pnpm"

    echo Uninstalling Git...
    cmd /c wmic product where "name like 'Git%%'" call uninstall /nointeractive

    echo Node.js, pnpm, and Git have been uninstalled.
) ELSE (
    echo Node.js, pnpm, and Git will remain installed.
)

echo Uninstallation complete!

pause
ENDLOCAL
