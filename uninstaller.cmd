@echo off
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Asking permissions...
    powershell -Command "Start-Process cmd -ArgumentList '/c %~s0' -Verb RunAs"
    exit /b
)

SETLOCAL
SET "INSTALL_DIR=C:\Vanusa"

echo Stopping the Vanusa...
cmd /c pm2 stop Vanusa-main >nul 2>&1
cmd /c pm2 stop Vanusa-monitor >nul 2>&1
cmd /c pm2 stop V-node-red >nul 2>&1

echo Deleting PM2 processes...
cmd /c pm2 delete Vanusa-main >nul 2>&1
cmd /c pm2 delete Vanusa-monitor >nul 2>&1
cmd /c pm2 delete V-node-red >nul 2>&1

set "startupFolder=%appdata%\Microsoft\Windows\Start Menu\Programs\Startup"
cmd /c del "%startupFolder%\pm2_resurrect.bat" /f
echo File pm2_resurrect.bat removed.

cmd /c sc stop VANUSA_PowerMonitorService >nul 2>&1
cmd /c sc delete VANUSA_PowerMonitorService >nul 2>&1

timeout /t 2 /nobreak >nul

IF EXIST "%INSTALL_DIR%" (
    echo Removing the Vanusa installation directory...
rmdir /s /q "%INSTALL_DIR%"
    echo Vanusa directory removed successfully.
) ELSE (
    echo Vanusa is not installed in %INSTALL_DIR%.
)

set /p confirm="Do you want to uninstall winget, Node.js, and Git? (Y/N): "
IF /I "%confirm%"=="Y" (

echo Checking for Node js...
echo Y | winget list --id OpenJS.NodeJS > nul 2>&1
if %errorlevel% == 0 (
    echo Uninstalling Node.js...
for /f "tokens=2 delims= " %%A in ('winget list --name Node ^| findstr /i "Node"') do (
    winget uninstall --id %%A --silent
)

    echo Node.js has been uninstalled.
) else (
    echo Node.js is not installed.
)
echo Checking for Git...
winget list --id Git.Git > nul 2>&1
if %errorlevel% == 0 (
    echo Uninstalling Git...
    winget uninstall --id Git.Git --silent
    echo Git has been uninstalled.
) else (
    echo Git is not installed.
)

echo Checking for WinGet...
dism /online /get-provisionedappxpackages | findstr /i "Microsoft.DesktopAppInstaller" > nul
if %errorlevel% == 0 (
    echo Uninstalling WinGet...
    powershell -Command "Get-AppxPackage Microsoft.DesktopAppInstaller | Remove-AppxPackage"
    echo WinGet has been uninstalled.
) else (
    echo WinGet is not installed.
)

where node >nul 2>&1 && where git >nul 2>&1 && where winget >nul 2>&1 && (
echo Seems like one of the programs remain installed, please manualy remove it on:
echo Control Panel > Programs > Remove Programs.
)

) ELSE (
    echo winget ^(used to install node and git by Vanusa^), Node.js, and Git will remain installed.
    echo ^(If you didn't installed Node and Git with Vanusa's installer, winget was not installed by it^)
)

echo Uninstallation complete!

pause
ENDLOCAL
