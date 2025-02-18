@echo off
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Asking permissions...
    powershell -Command "Start-Process cmd -ArgumentList '/c %~s0' -Verb RunAs"
    exit /b
)

SET "INSTALL_DIR=C:\Vanusa"
SET "SERVICE_NAME=VANUSA_PowerMonitorService"

echo Trying to stop Vanusa...
cmd /c pm2 stop Vanusa-main 
cmd /c pm2 stop V-node-red 
cmd /c pm2 stop Vanusa-monitor
cmd /c sc stop %SERVICE_NAME%
cmd /c sc delete %SERVICE_NAME%

cd /d "%INSTALL_DIR%"

git stash push --keep-index --include-untracked

git stash push --keep-index -- "assets\models"
git checkout stash -- "assets\models\wake_word1_en.ppn"
git checkout stash -- "assets\models\wake_word1_pt.ppn"
git checkout stash -- "assets\models\wake_word2_en.ppn"
git checkout stash -- "assets\models\wake_word2_pt.ppn"
git checkout stash -- "assets\models\wake_word3_en.ppn"
git checkout stash -- "assets\models\wake_word3_pt.ppn"

git stash push --keep-index -- "assets\templates"

git pull origin main

git stash pop

echo restarting Vanusa...
copy "PowerMonitorService\bin\Release\net8.0\win-x64\publish\PowerMonitorService.exe" "%INSTALL_DIR%"
cmd /c sc create %SERVICE_NAME% binPath= "\"%INSTALL_DIR%\PowerMonitorService.exe\"" start= auto
cmd /c sc description %SERVICE_NAME% "Monitor suspension and resume events to send to Vanusa"
cmd /c sc privs %SERVICE_NAME% SeShutdownPrivilege/SeChangeNotifyPrivilege/SeUndockPrivilege/SeIncreaseWorkingSetPrivilege/SeTimeZonePrivilege
cmd /c sc start %SERVICE_NAME%
rd /s /q PowerMonitorService

node ./dist/safe-index.js

echo Update completed successfully!
pause
