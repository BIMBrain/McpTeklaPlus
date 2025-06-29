@echo off
echo ========================================
echo   MCP Tekla+ GitHub 推送腳本
echo ========================================
echo.

REM 檢查是否在正確的目錄
if not exist "package.json" (
    echo 錯誤：請確保在 McpTeklaPlus 專案目錄中執行此腳本
    pause
    exit /b 1
)

echo 1. 檢查 Git 狀態...
git status

echo.
echo 2. 請先在 GitHub 上創建新倉庫：
echo    - 前往 https://github.com/new
echo    - 倉庫名稱：mcp-tekla-plus
echo    - 設為公開或私人（您的選擇）
echo    - 不要初始化 README、.gitignore 或 license
echo    - 點擊 "Create repository"
echo.

echo 您的 GitHub 倉庫：https://github.com/BIMBrain/McpTeklaPlus
echo.

echo 3. 配置 Git 用戶資訊...
git config user.name "BIMBrain"
git config user.email "ppson0@gmail.com"

echo.
echo 4. 添加遠程倉庫...
git remote add origin https://github.com/BIMBrain/McpTeklaPlus.git

echo.
echo 5. 設定主分支...
git branch -M main

echo.
echo 6. 推送到 GitHub...
echo 注意：當提示輸入密碼時，請使用您的 Personal Access Token
echo.

git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   🎉 成功推送到 GitHub！
    echo ========================================
    echo.
    echo 您的專案現在可以在以下網址查看：
    echo https://github.com/BIMBrain/McpTeklaPlus
    echo.
) else (
    echo.
    echo ========================================
    echo   ❌ 推送失敗
    echo ========================================
    echo.
    echo 可能的解決方案：
    echo 1. 檢查網路連接
    echo 2. 確認 GitHub 用戶名正確
    echo 3. 確認 Personal Access Token 有效
    echo 4. 確認倉庫已在 GitHub 上創建
    echo.
)

pause
