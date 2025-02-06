@echo off
SETLOCAL

SET "INSTALL_DIR=%ProgramFiles%\Vanusa"
SET "SERVICE_NAME=VANUSA_PowerMonitorService"
SET "REPO_URL=https://github.com/Igor-Mac-Dev/Vanusa-Voice_Assistant"

node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed. Installing Node.js...
    curl -o nodejs.msi https://nodejs.org/dist/v18.17.0/node-v18.17.0-x64.msi
    msiexec /i nodejs.msi /quiet
)

git --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Git is not installed. Installing Git...
    curl -o git.msi https://github.com/git-for-windows/git/releases/download/v2.41.0.windows.1/Git-2.41.0-64-bit.exe
    msiexec /i git.msi /quiet
)

IF NOT EXIST "%INSTALL_DIR%" (
    mkdir "%INSTALL_DIR%"
    echo Created installation directory: %INSTALL_DIR%
)

cd /d "%INSTALL_DIR%"

IF NOT EXIST "%INSTALL_DIR%\.git" (
    echo Cloning repository...
    git clone %REPO_URL% .
) ELSE (
    echo Repository already exists. Pulling the latest updates...
    git stash
    git pull
    git stash apply
    )

npm install --omit=dev --yes

if not exist ".\logs" (
    echo Creating dir ./log...
    mkdir .\logs
) 

if not exist ".\dist\process-files" (
    echo Creating dir ./dist/process-files...
    mkdir .\dist\process-files
) 

set "targetDir=%USERPROFILE%\Documents\process-files"

if not exist "%targetDir%" (
    echo Creating directory: %targetDir%...
    mkdir "%targetDir%"
    echo Directory created successfully.
)

copy "PowerMonitorService\bin\Release\netX\win-x64\publish\PowerMonitorService.exe" "%INSTALL_DIR%"
sc stop %SERVICE_NAME%
sc delete %SERVICE_NAME%
sc create %SERVICE_NAME% binPath= "%INSTALL_DIR%\PowerMonitorService.exe"
sc description %SERVICE_NAME% "Monit suspension and resume events to send to Vanusa"
sc privs %SERVICE_NAME% SeShutdownPrivilege/SeChangeNotifyPrivilege/SeUndockPrivilege/SeIncreaseWorkingSetPrivilege/SeTimeZonePrivilege

set "startupFolder=%appdata%\Microsoft\Windows\Start Menu\Programs\Startup"
echo @echo off > "%startupFolder%\pm2_resurrect.bat"
echo call pm2 resurrect >> "%startupFolder%\pm2_resurrect.bat"

echo File pm2_resurrect.bat created.

echo Installation complete!
echo Starting the app...
npm safe-start

pause
ENDLOCAL
