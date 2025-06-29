@echo off
chcp 65001 >nul
cls
echo ========================================
echo   MCP Tekla+ GitHub 推送工具
echo ========================================
echo.

cd /d "C:\Users\ppson0\Documents\augment-projects\McpTeklaPlus"

echo 步驟 1: 檢查 Git 狀態
git status
echo.

echo 步驟 2: 配置用戶資訊
git config user.name "BIMBrain"
git config user.email "ppson0@gmail.com"
echo 用戶資訊配置完成
echo.

echo 步驟 3: 提交文件
git add .
git commit -m "Update project files"
echo.

echo 步驟 4: 設定遠程倉庫
git remote remove origin 2>nul
git remote add origin https://github.com/BIMBrain/McpTeklaPlus.git
echo 遠程倉庫設定完成
echo.

echo 步驟 5: 設定分支
git branch -M main
echo.

echo 步驟 6: 推送到 GitHub
echo ----------------------------------------
echo 即將推送到 GitHub
echo 當提示輸入認證資訊時：
echo 用戶名: BIMBrain
echo 密碼: [請使用您的 Personal Access Token]
echo ----------------------------------------
echo.

git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   🎉 推送成功！
    echo ========================================
    echo.
    echo 專案地址: https://github.com/BIMBrain/McpTeklaPlus
    echo.
) else (
    echo.
    echo ========================================
    echo   ❌ 推送失敗
    echo ========================================
    echo 請檢查網路連接和認證資訊
    echo.
)

echo 按任意鍵關閉...
pause >nul
