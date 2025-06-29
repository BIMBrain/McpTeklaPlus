@echo off
chcp 65001 >nul
echo ========================================
echo   MCP Tekla+ 快速推送到 GitHub
echo ========================================
echo.

echo 1. 檢查當前狀態...
git status

echo.
echo 2. 配置 Git 用戶資訊...
git config user.name "BIMBrain"
git config user.email "ppson0@gmail.com"

echo.
echo 3. 提交新增的文件...
git commit -m "Add README and GitHub push script"

echo.
echo 4. 檢查是否已有遠程倉庫...
git remote -v

echo.
echo 5. 添加遠程倉庫...
git remote add origin https://github.com/BIMBrain/McpTeklaPlus.git 2>nul || echo 遠程倉庫已存在

echo.
echo 6. 設定主分支...
git branch -M main

echo.
echo 7. 推送到 GitHub...
echo 當提示輸入認證資訊時：
echo 用戶名: BIMBrain
echo 密碼: [請使用您的 Personal Access Token]
echo.

git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   🎉 成功推送到 GitHub！
    echo ========================================
    echo.
    echo 專案地址: https://github.com/BIMBrain/McpTeklaPlus
    echo.
) else (
    echo.
    echo ========================================
    echo   ❌ 推送失敗
    echo ========================================
    echo.
    echo 可能需要先刪除現有的 origin：
    echo git remote remove origin
    echo 然後重新執行此腳本
    echo.
)

pause
