# 🏗️ MCP Tekla+ API Service

> Tekla Structures 2025 Open API 整合服務

## 📋 概述

這是 MCP Tekla+ 專案的後端 API 服務，提供與 Tekla Structures 2025 的完整整合。透過 RESTful API 接口，前端 React 應用程式可以直接操作 Tekla 模型、管理材料目錄、創建圖紙等。

## 🔧 技術棧

- **.NET Framework 4.8** - 支援 Tekla Open API
- **ASP.NET Core Web API** - RESTful API 服務
- **Swagger/OpenAPI** - API 文檔與測試
- **Tekla Structures 2025 Open API** - 核心建模功能

## 📦 NuGet 套件

### 核心 Tekla 套件
```xml
<PackageReference Include="Tekla.Structures.Model" Version="2025.0.0" />
<PackageReference Include="Tekla.Structures.Catalogs" Version="2025.0.0" />
<PackageReference Include="Tekla.Structures.Dialog" Version="2025.0.0" />
<PackageReference Include="Tekla.Structures.Drawing" Version="2025.0.0" />
<PackageReference Include="Tekla.Application.Library" Version="2025.0.0" />
```

### 相依套件
```xml
<PackageReference Include="Tekla.Structures" Version="2025.0.0" />
<PackageReference Include="Tekla.Structures.Datatype" Version="2025.0.0" />
<PackageReference Include="Tekla.Common.Geometry" Version="4.6.4" />
```

## 🚀 快速開始

### 1. 環境要求
- Windows 10/11
- .NET Framework 4.8 或更高版本
- Tekla Structures 2025 已安裝並運行
- Visual Studio 2022 或 Visual Studio Code

### 2. 安裝步驟

```bash
# 克隆專案
git clone https://github.com/BIMBrain/McpTeklaPlus.git
cd McpTeklaPlus/TeklaApiService

# 還原 NuGet 套件
dotnet restore

# 建置專案
dotnet build

# 運行服務
dotnet run
```

### 3. 訪問 API

- **API 基礎 URL**: `https://localhost:7000`
- **Swagger UI**: `https://localhost:7000/swagger`
- **健康檢查**: `https://localhost:7000/health`

## 📚 API 端點

### 🔗 連接管理

#### 檢查連接狀態
```http
GET /api/tekla/connection-status
```

**回應範例:**
```json
{
  "isConnected": true,
  "message": "已連接到 Tekla Structures",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### 🏗️ 模型操作

#### 創建鋼樑
```http
POST /api/tekla/create-beam
Content-Type: application/json

{
  "startX": 0,
  "startY": 0,
  "startZ": 0,
  "endX": 5000,
  "endY": 0,
  "endZ": 0,
  "profile": "HEA300",
  "material": "S355",
  "class": "1",
  "name": "主樑"
}
```

#### 獲取所有樑
```http
GET /api/tekla/beams
```

### 📚 目錄管理

#### 獲取材料目錄
```http
GET /api/tekla/materials
```

#### 獲取截面目錄
```http
GET /api/tekla/profiles
```

### 📋 圖紙管理

#### 創建圖紙
```http
POST /api/tekla/create-drawing
Content-Type: application/json

{
  "name": "總平面圖",
  "layout": "A1"
}
```

## 🔧 配置

### appsettings.json
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "Cors": {
    "AllowedOrigins": [
      "http://localhost:5173",
      "http://localhost:3000"
    ]
  }
}
```

## 🧪 測試

### 使用 Swagger UI
1. 啟動 API 服務
2. 開啟瀏覽器訪問 `https://localhost:7000/swagger`
3. 測試各個 API 端點

### 使用 curl
```bash
# 檢查連接狀態
curl -X GET "https://localhost:7000/api/tekla/connection-status"

# 創建鋼樑
curl -X POST "https://localhost:7000/api/tekla/create-beam" \
  -H "Content-Type: application/json" \
  -d '{
    "startX": 0, "startY": 0, "startZ": 0,
    "endX": 5000, "endY": 0, "endZ": 0,
    "profile": "HEA300",
    "material": "S355"
  }'
```

## 🔒 安全性

- CORS 設定限制前端訪問來源
- API 金鑰驗證（可選）
- 請求速率限制（可選）
- 輸入驗證與清理

## 📝 日誌

API 服務使用 Microsoft.Extensions.Logging 進行日誌記錄：

- **Information**: 正常操作記錄
- **Warning**: 警告信息
- **Error**: 錯誤信息與異常

## 🚨 錯誤處理

所有 API 端點都包含完整的錯誤處理：

```json
{
  "error": "錯誤描述",
  "timestamp": "2025-01-15T10:30:00Z",
  "path": "/api/tekla/create-beam"
}
```

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 授權

MIT License - 查看 [LICENSE](../LICENSE) 文件了解詳情。
