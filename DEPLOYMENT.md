# 🚀 MCP Tekla+ 部署指南

## 📋 專案概述

MCP Tekla+ 是一個基於 AI 的 Tekla Structures 2025 整合平台，提供完整的響應式 WebUI 和智能建模功能。

## ✨ 核心功能

### 📱 響應式 WebUI
- **移動端優化**: 完美適配手機和平板設備
- **桌面端完整功能**: 支援多視窗和複雜操作
- **自動適配**: 根據設備自動切換最佳顯示模式

### 🤖 AI 智能助手
1. **導入建築平面圖並生成格子線**
2. **導入結構平面圖規格參數表並生成斷面規格參數表**
3. **導入結構平面圖表並生成樑位規格選用表，並生成梁**
4. **導入結構立面圖表並生成柱位規格選用表，並生成柱**
5. **導入結構平面圖表並生成版規格選用表，並生成版**

### 🏗️ Tekla API 整合
- **Tekla.Structures.Model** 2025.0.0 - 3D模型操作
- **Tekla.Structures.Catalogs** 2025.0.0 - 目錄管理
- **Tekla.Structures.Dialog** 2025.0.0 - 對話框
- **Tekla.Structures.Drawing** 2025.0.0 - 圖紙生成
- **Tekla.Application.Library** 2025.0.0 - 整合庫

## 🛠️ 技術架構

### 前端技術棧
- **React 18** + **TypeScript**
- **Vite** 開發環境
- **Framer Motion** 動畫效果
- **Tailwind CSS** 樣式框架
- **Lucide React** 圖標庫

### 後端技術棧
- **.NET 6/8** API 服務
- **.NET Framework 4.8** Tekla API 整合
- **RESTful API** 架構
- **WebSocket** 即時通訊

## 📦 安裝與部署

### 1. 環境要求
```bash
Node.js >= 18.0.0
.NET 6 SDK
.NET Framework 4.8
Tekla Structures 2025
```

### 2. 安裝依賴
```bash
# 安裝前端依賴
npm install

# 安裝 .NET 依賴
dotnet restore TeklaApiService/
```

### 3. 啟動開發環境
```bash
# 啟動前端開發伺服器
npm run dev

# 啟動 Tekla API 服務
cd TeklaApiService
dotnet run
```

### 4. 訪問應用程式
- **主應用程式**: http://localhost:5173
- **WebUI 檢查工具**: http://localhost:5173/webui-check.html
- **API 服務**: http://localhost:5000

## 🧪 測試與驗證

### 自動化檢查
```bash
# 運行完整健康檢查
node scripts/check-app.js
```

### 手動測試
1. 訪問 WebUI 檢查工具
2. 執行所有測試模組
3. 驗證多設備響應式設計
4. 測試 AI 功能流程

## 📱 設備支援

### 移動端 (< 768px)
- 觸控優化界面
- 垂直佈局設計
- 大按鈕和清晰層次

### 平板端 (768px - 1024px)
- 混合佈局模式
- 適中的組件尺寸
- 觸控和滑鼠雙重支援

### 桌面端 (> 1024px)
- 完整功能界面
- 多欄位佈局
- 鍵盤快捷鍵支援

## 🔧 配置選項

### 環境變數
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_TEKLA_API_URL=http://localhost:5001
VITE_ENABLE_DEBUG=true
```

### 功能開關
- 語音輸入: 預設啟用
- AI 助手: 預設啟用
- Tekla 整合: 需要 Tekla Structures 2025
- 系統監控: 預設啟用

## 📊 性能指標

### 載入性能
- 首次載入: < 3秒
- 路由切換: < 500ms
- API 響應: < 100ms

### 資源使用
- 記憶體使用: < 100MB
- CPU 使用: < 5%
- 網路流量: 最小化

## 🚀 生產部署

### 建置應用程式
```bash
# 建置前端
npm run build

# 建置 API 服務
dotnet publish TeklaApiService/ -c Release
```

### 部署選項
1. **本地部署**: 直接在 Windows 機器上運行
2. **容器化部署**: 使用 Docker 容器
3. **雲端部署**: Azure 或 AWS 雲端服務

## 📞 支援與維護

### 故障排除
1. 檢查開發伺服器狀態
2. 驗證 Tekla Structures 安裝
3. 確認網路連接
4. 查看瀏覽器控制台錯誤

### 更新流程
1. 備份當前配置
2. 拉取最新代碼
3. 更新依賴套件
4. 運行測試驗證
5. 重新啟動服務

## 📈 未來發展

### 計劃功能
- 多語言支援擴展
- 更多 AI 建模功能
- 雲端協作功能
- 行動應用程式

### 技術升級
- React 19 升級
- .NET 9 支援
- WebAssembly 整合
- PWA 功能

---

**版本**: 1.0.0  
**最後更新**: 2025-01-29  
**維護者**: BIMBrain Team
