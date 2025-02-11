@echo off

SET "INSTALL_DIR=%ProgramFiles%\Vanusa"

echo Trying to stop Vanusa...
cmd /c pm2 stop Vanusa-main 
cmd /c pm2 stop V-node-red 
cmd /c pm2 stop Vanusa-monitor

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
cmd /c pm2 start Vanusa-main
cmd /c pm2 start V-node-red
cmd /c pm2 start Vanusa-monitor

echo Update completed successfully!
pause
