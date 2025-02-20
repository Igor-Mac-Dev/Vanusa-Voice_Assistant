@echo off
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Asking permissions...
    powershell -Command "Start-Process cmd -ArgumentList '/c %~s0' -Verb RunAs"
    exit /b
)

SETLOCAL
SET "INSTALL_DIR=C:\Vanusa"
SET "SERVICE_NAME=VANUSA_PowerMonitorService"
SET "REPO_URL=https://github.com/Igor-Mac-Dev/Vanusa-Voice_Assistant"
set "STATUS_FILE=%TEMP%\install_status.txt"
setlocal enabledelayedexpansion

where node >nul 2>&1 && where git >nul 2>&1 && (
    echo Node and Git already installed...
    goto VANUSA
)

where winget >nul 2>&1
if %errorLevel% neq 0 (
    echo [Winget] Not found. Installing...
    powershell -Command "Invoke-WebRequest 'https://aka.ms/getwinget' -OutFile '%temp%\winget.msixbundle'"
    powershell -Command "Add-AppxPackage -Path '%temp%\winget.msixbundle'"

    set timeout=30
    :waitLoop
    where winget >nul 2>&1 && (
        echo [OK] Winget installed successfully.
        goto continueScript
    )
    
    set /a timeout-=1
    if !timeout! LEQ 0 (
        echo [ERROR] Winget installation failed or is taking too long.
        echo        Please, try to install it manually from:
        echo        https://learn.microsoft.com/en-us/windows/package-manager/winget/download
        echo        and run this script again. ^(ctrl+click on the link^)
        exit /b 1
    )

    echo [INFO] Waiting for Winget to be available... (!timeout!s left)
    timeout /t 2 >nul
    goto waitLoop
    echo [OK] Winget installed successfully.
) else (
    echo [Winget] Already installed. Skipping...
)

:continueScript

where node >nul 2>&1
if %errorLevel% neq 0 (
    echo [Node.js] Installing via Winget...
    winget install --id OpenJS.NodeJS.LTS -e --source winget --silent --accept-package-agreements --accept-source-agreements

timeout /t 5 /nobreak >nul
reg query "HKLM\SOFTWARE\Node.js" >nul 2>&1 && (
    echo [OK] Node.js installed successfully.
) || (
    echo [ERROR] Node.js installation failed. Please install it manually from:
    echo        https://nodejs.org/en/download/
    echo        and run this script again. ^(ctrl+click on the link^)
    pause
    exit /b 1
)
) else (
    echo [Node.js] Already installed. Skipping...
)

where git >nul 2>nul
if %errorlevel% equ 0 (
    echo Git is already installed. Skipping...
    goto :VANUSA
)

echo Git is not installed. Installing Git with this installer requires the PC to restart.
echo You can also install Git manually from:
echo        https://git-scm.com/download/win
echo        and run this script again, without rebooting. ^(ctrl+click on the link^)
choice /c YN /m "Do you want to install Git now? (Y/N)"
if %errorlevel% neq 1 (
    echo Installation cancelled.
    goto :END
)

if exist "%STATUS_FILE%" (
    echo Checking Git installation after reboot...
    where git >nul 2>nul
    if %errorlevel% equ 0 (
        echo Git installation successful!
        del "%STATUS_FILE%"
        goto :VANUSA
    ) else (
        echo Installation failed. Please install Git manually from:
        echo        https://git-scm.com/download/win
        echo        and run this script again. ^(ctrl+click on the link^)
        pause
        del "%STATUS_FILE%"
        goto :END
    )
)

echo Installing Git...
winget install --id Git.Git -e --source winget --silent --accept-package-agreements --accept-source-agreements --override "/VERYSILENT /NORESTART"
echo REBOOT_REQUIRED > "%STATUS_FILE%"
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\RunOnce" /v "InstallGitAfterReboot" /t REG_SZ /d "\"%~f0\"" /f
echo Git installation completed. A restart is required to finalize the installation.
choice /c YN /m "Do you want to restart now? (Y/N)"
if %errorlevel% equ 1 (
    echo Restarting now...
    shutdown /r /t 0
) else (
    echo Please restart your computer to finish Vanusa's installation.
    echo [INFO] When you restart your PC, this script will run again to finish the installation,
    echo        no panic, it's not a problem.
    goto :END
)

:VANUSA

IF NOT EXIST "%INSTALL_DIR%" (
    mkdir "%INSTALL_DIR%"
    echo Created installation directory: %INSTALL_DIR%
) ELSE (
    echo The installation directory already exists. Cleaning up...
    rmdir /s /q "%INSTALL_DIR%" >nul 2>&1

    IF EXIST "%INSTALL_DIR%" (
        echo Failed to clean the installation directory.
        echo Please manually delete the folder "%INSTALL_DIR%" and restart the installation.
        pause
        exit /b
    ) ELSE (
        echo Installation directory cleaned successfully.
        mkdir "%INSTALL_DIR%"
    )
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

if not exist ".\logs" (
    echo Creating dir ./log...
    mkdir .\logs
) 

if not exist ".\dist\process-files" (
    echo Creating dir ./dist/process-files...
    mkdir .\dist\process-files
) 

set "targetDir=%USERPROFILE%\Documents\Vanusa-files"

if not exist "%targetDir%" (
    echo Creating directory: %targetDir%...
    mkdir "%targetDir%"
    echo Directory created successfully. When you ask Vanusa to generate a file, it will be saved there.
)

rd /s /q tests
cmd /c npm install || echo "There was a problem installing dependencies"

copy "PowerMonitorService\bin\Release\net8.0\win-x64\publish\PowerMonitorService.exe" "%INSTALL_DIR%"
cmd /c sc stop %SERVICE_NAME%
cmd /c sc delete %SERVICE_NAME%
cmd /c sc create %SERVICE_NAME% binPath= "\"%INSTALL_DIR%\PowerMonitorService.exe\"" start= auto
cmd /c sc description %SERVICE_NAME% "Monitor suspension and resume events to send to Vanusa"
cmd /c sc privs %SERVICE_NAME% SeShutdownPrivilege/SeChangeNotifyPrivilege/SeUndockPrivilege/SeIncreaseWorkingSetPrivilege/SeTimeZonePrivilege
cmd /c sc start %SERVICE_NAME%
rd /s /q PowerMonitorService

set "startupFolder=%appdata%\Microsoft\Windows\Start Menu\Programs\Startup"
echo @echo off > "%startupFolder%\pm2_resurrect.bat"
echo call pm2 resurrect >> "%startupFolder%\pm2_resurrect.bat"

echo File pm2_resurrect.bat created.

echo Installation complete!
echo Starting the app...
npx run safe-start

:END

pause
ENDLOCAL
