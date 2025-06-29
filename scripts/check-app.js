#!/usr/bin/env node

import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 顏色輸出
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function colorLog(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// 檢查 HTTP 服務
function checkHTTP(url, timeout = 5000) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const client = url.startsWith('https') ? https : http;
        
        const req = client.get(url, (res) => {
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    success: true,
                    status: res.statusCode,
                    responseTime,
                    contentLength: data.length,
                    headers: res.headers
                });
            });
        });
        
        req.on('error', (error) => {
            resolve({
                success: false,
                error: error.message
            });
        });
        
        req.setTimeout(timeout, () => {
            req.destroy();
            resolve({
                success: false,
                error: 'Request timeout'
            });
        });
    });
}

// 檢查檔案是否存在
function checkFile(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return {
            exists: true,
            size: stats.size,
            modified: stats.mtime
        };
    } catch (error) {
        return {
            exists: false,
            error: error.message
        };
    }
}

// 主要檢查函數
async function runChecks() {
    colorLog('cyan', '🚀 MCP Tekla+ WebUI 狀態檢查');
    colorLog('cyan', '='.repeat(50));
    
    // 1. 檢查開發伺服器
    colorLog('blue', '\n📡 檢查開發伺服器...');
    const serverCheck = await checkHTTP('http://localhost:5173');
    
    if (serverCheck.success) {
        colorLog('green', `✅ 開發伺服器運行正常`);
        colorLog('green', `   狀態碼: ${serverCheck.status}`);
        colorLog('green', `   響應時間: ${serverCheck.responseTime}ms`);
        colorLog('green', `   內容大小: ${serverCheck.contentLength} bytes`);
    } else {
        colorLog('red', `❌ 開發伺服器無法連接`);
        colorLog('red', `   錯誤: ${serverCheck.error}`);
        colorLog('yellow', '   請確認是否已執行: npm run dev');
    }
    
    // 2. 檢查關鍵檔案
    colorLog('blue', '\n📁 檢查關鍵檔案...');
    const criticalFiles = [
        'src/App.tsx',
        'src/components/mobile/MobileDashboard.tsx',
        'src/components/dashboard/ResponsiveDashboard.tsx',
        'src/components/ai/AICommandProcessor.tsx',
        'src/components/tekla/TeklaProductSelector.tsx',
        'public/webui-check.html',
        'package.json'
    ];
    
    criticalFiles.forEach(file => {
        const fileCheck = checkFile(file);
        if (fileCheck.exists) {
            colorLog('green', `✅ ${file} (${Math.round(fileCheck.size / 1024)}KB)`);
        } else {
            colorLog('red', `❌ ${file} - 檔案不存在`);
        }
    });
    
    // 3. 檢查 package.json 依賴
    colorLog('blue', '\n📦 檢查套件依賴...');
    try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const dependencies = Object.keys(packageJson.dependencies || {});
        const devDependencies = Object.keys(packageJson.devDependencies || {});
        
        colorLog('green', `✅ 生產依賴: ${dependencies.length} 個套件`);
        colorLog('green', `✅ 開發依賴: ${devDependencies.length} 個套件`);
        
        // 檢查關鍵依賴
        const keyDeps = ['react', 'typescript', 'vite', 'framer-motion', 'lucide-react'];
        keyDeps.forEach(dep => {
            if (dependencies.includes(dep) || devDependencies.includes(dep)) {
                colorLog('green', `✅ ${dep}`);
            } else {
                colorLog('yellow', `⚠️  ${dep} - 可能缺失`);
            }
        });
        
    } catch (error) {
        colorLog('red', `❌ 無法讀取 package.json: ${error.message}`);
    }
    
    // 4. 檢查 Tekla API 服務
    colorLog('blue', '\n🏗️ 檢查 Tekla API 服務...');
    const teklaApiCheck = await checkHTTP('http://localhost:5000/api/health');
    
    if (teklaApiCheck.success) {
        colorLog('green', `✅ Tekla API 服務運行正常`);
    } else {
        colorLog('yellow', `⚠️  Tekla API 服務未運行`);
        colorLog('yellow', '   這是正常的，如需要請啟動 TeklaApiService');
    }
    
    // 5. 檢查測試頁面
    colorLog('blue', '\n🧪 檢查測試頁面...');
    const testPageCheck = await checkHTTP('http://localhost:5173/webui-check.html');
    
    if (testPageCheck.success) {
        colorLog('green', `✅ WebUI 檢查工具可用`);
        colorLog('green', `   訪問: http://localhost:5173/webui-check.html`);
    } else {
        colorLog('yellow', `⚠️  WebUI 檢查工具無法訪問`);
    }
    
    // 6. 系統資訊
    colorLog('blue', '\n💻 系統資訊...');
    colorLog('green', `✅ Node.js 版本: ${process.version}`);
    colorLog('green', `✅ 平台: ${process.platform}`);
    colorLog('green', `✅ 架構: ${process.arch}`);
    colorLog('green', `✅ 記憶體使用: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
    
    // 總結
    colorLog('cyan', '\n📋 檢查總結');
    colorLog('cyan', '='.repeat(50));
    
    if (serverCheck.success) {
        colorLog('green', '🎉 MCP Tekla+ WebUI 運行正常！');
        colorLog('green', '🌐 主應用程式: http://localhost:5173');
        colorLog('green', '🔧 檢查工具: http://localhost:5173/webui-check.html');
        colorLog('green', '📱 支援響應式設計，可在任何設備上使用');
    } else {
        colorLog('red', '❌ 應用程式未運行');
        colorLog('yellow', '請執行以下命令啟動應用程式:');
        colorLog('yellow', '   npm install');
        colorLog('yellow', '   npm run dev');
    }
    
    colorLog('cyan', '\n✨ 檢查完成！');
}

// 執行檢查
if (import.meta.url === `file://${process.argv[1]}`) {
    runChecks().catch(error => {
        colorLog('red', `❌ 檢查過程發生錯誤: ${error.message}`);
        process.exit(1);
    });
}

export { runChecks, checkHTTP, checkFile };
