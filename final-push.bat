@echo off
echo MCP Tekla+ GitHub Push
echo ========================

cd /d C:\Users\ppson0\Documents\augment-projects\McpTeklaPlus

echo Step 1: Configure Git
git config user.name BIMBrain
git config user.email ppson0@gmail.com

echo Step 2: Add files
git add .

echo Step 3: Commit
git commit -m "Final commit"

echo Step 4: Remove existing remote
git remote remove origin

echo Step 5: Add remote
git remote add origin https://github.com/BIMBrain/McpTeklaPlus.git

echo Step 6: Set branch
git branch -M main

echo Step 7: Push to GitHub
echo Username: BIMBrain
echo Password: Use your token
git push -u origin main

echo Done!
pause
