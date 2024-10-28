@echo off
SETLOCAL

:: Define installation path
SET "INSTALL_DIR=%ProgramFiles%\Vanusa"

:: Stop running processes related to the app (if managed by PM2)
echo Stopping the Vanusa application...
pm2 stop Vanusa-main >nul 2>&1
pm2 stop Vanusa-safe >nul 2>&1
pm2 stop V-node-red >nul 2>&1

:: Delete processes from PM2 list
echo Deleting PM2 processes...
pm2 delete Vanusa-main >nul 2>&1
pm2 delete Vanusa-safe >nul 2>&1
pm2 delete V-node-red >nul 2>&1

set "startupFolder=%appdata%\Microsoft\Windows\Start Menu\Programs\Startup"
del "%startupFolder%\pm2_resurrect.bat" /f
echo File pm2_resurrect.bat removed.


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
