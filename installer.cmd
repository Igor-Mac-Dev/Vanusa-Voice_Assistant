@echo off
SETLOCAL

SET "INSTALL_DIR=%ProgramFiles%\Vanusa"

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

pnpm -v >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo pnpm is not installed. Installing pnpm...
    npm install -g pnpm
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
    git pull
)

npm install

echo Installation complete!
echo Starting the app...
npm safe-start

pause
ENDLOCAL
