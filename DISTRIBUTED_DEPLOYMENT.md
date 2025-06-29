# 🚀 MCP Tekla+ 分佈式部署指南

## 📋 系統架構概述

### 🖥️ 伺服器 (RTX 5090 32GB×4)
- **角色**: AI 推理引擎 + RAG 知識庫
- **主要服務**: DeepSeek-Coder-v2 16B, 向量資料庫, API 服務
- **硬體需求**: 高效能 GPU 運算

### 💻 工作站 (RTX 5090 32GB×1)  
- **角色**: MCP 客戶端 + Tekla 整合
- **主要服務**: 系統托盤服務, WebUI, Tekla API 橋接
- **硬體需求**: Tekla Structures 2025 運行環境

## 🛠️ 伺服器端部署

### 環境要求
```bash
# 作業系統
Ubuntu 22.04 LTS 或 Windows Server 2022

# Python 環境
Python 3.10+
CUDA 12.1+
cuDNN 8.9+

# 硬體要求
RTX 5090 32GB × 4
RAM: 128GB+
SSD: 2TB+
```

### 安裝步驟

#### 1. 系統準備
```bash
# Ubuntu
sudo apt update && sudo apt upgrade -y
sudo apt install python3.10 python3.10-venv python3-pip git -y

# 安裝 NVIDIA 驅動和 CUDA
sudo apt install nvidia-driver-535 nvidia-cuda-toolkit -y

# Windows
# 安裝 Python 3.10+
# 安裝 CUDA Toolkit 12.1+
# 安裝 Git
```

#### 2. 克隆專案
```bash
git clone https://github.com/BIMBrain/McpTeklaPlus.git
cd McpTeklaPlus/server
```

#### 3. 創建虛擬環境
```bash
# Linux
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

#### 4. 安裝依賴
```bash
pip install -r requirements.txt
```

#### 5. 配置環境變數
```bash
# 創建 .env 檔案
cat > .env << EOF
# AI 模型配置
MODEL_NAME=deepseek-ai/deepseek-coder-6.7b-instruct
MODEL_CACHE_DIR=./models
TORCH_DTYPE=float16
DEVICE_MAP=auto

# RAG 配置
VECTOR_DB_TYPE=chromadb
VECTOR_DB_PATH=./data/vectordb
EMBEDDING_MODEL=all-MiniLM-L6-v2

# API 配置
API_HOST=0.0.0.0
API_PORT=8000
WEBSOCKET_PORT=8001

# 安全配置
JWT_SECRET_KEY=your-secret-key-here
ALLOWED_ORIGINS=*

# GPU 配置
CUDA_VISIBLE_DEVICES=0,1,2,3
GPU_MEMORY_FRACTION=0.9
EOF
```

#### 6. 初始化資料庫
```bash
python scripts/init_database.py
python scripts/load_tekla_docs.py
```

#### 7. 啟動服務
```bash
# 開發模式
python main.py

# 生產模式
gunicorn main:app -w 1 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

#### 8. 設置系統服務 (Linux)
```bash
sudo tee /etc/systemd/system/mcp-tekla-server.service > /dev/null << EOF
[Unit]
Description=MCP Tekla+ AI Server
After=network.target

[Service]
Type=simple
User=mcpuser
WorkingDirectory=/opt/mcp-tekla-plus/server
Environment=PATH=/opt/mcp-tekla-plus/server/venv/bin
ExecStart=/opt/mcp-tekla-plus/server/venv/bin/python main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable mcp-tekla-server
sudo systemctl start mcp-tekla-server
```

## 💻 工作站端部署

### 環境要求
```
# 作業系統
Windows 11 Pro (推薦)
Windows 10 Pro (最低)

# .NET 環境
.NET 8.0 Runtime
.NET Framework 4.8

# Tekla 軟體
Tekla Structures 2025
Tekla Open API 2025

# 硬體要求
RTX 5090 32GB × 1
RAM: 64GB+
SSD: 1TB+
```

### 安裝步驟

#### 1. 安裝 Tekla Structures 2025
```
1. 從 Tekla 官網下載 Tekla Structures 2025
2. 安裝 Tekla Structures 2025
3. 安裝 Tekla Open API 2025
4. 確認 Tekla 正常運行
```

#### 2. 安裝 .NET 環境
```powershell
# 下載並安裝 .NET 8.0 Runtime
# https://dotnet.microsoft.com/download/dotnet/8.0

# 驗證安裝
dotnet --version
```

#### 3. 下載 MCP 客戶端安裝包
```
從 GitHub Releases 下載:
https://github.com/BIMBrain/McpTeklaPlus/releases/latest

檔案: MCP.Tekla.Client.Setup.msi
```

#### 4. 安裝 MCP 客戶端
```
1. 執行 MCP.Tekla.Client.Setup.msi
2. 選擇安裝路徑 (預設: C:\Program Files\MCP Tekla+)
3. 完成安裝
4. 客戶端會自動啟動並顯示在系統托盤
```

#### 5. 配置連接設定
```
1. 右鍵點擊系統托盤圖標
2. 選擇「設定」
3. 輸入伺服器 IP 地址
4. 測試連接
5. 儲存設定
```

## 🔧 安裝包建置

### 建置 Windows 安裝包

#### 1. 安裝建置工具
```powershell
# 安裝 WiX Toolset
winget install WiXToolset.WiXToolset

# 或從官網下載
# https://wixtoolset.org/releases/
```

#### 2. 建置專案
```powershell
cd workstation/MCP.Tekla.Client
dotnet publish -c Release -r win-x64 --self-contained true
```

#### 3. 創建安裝包
```powershell
cd ../Setup
candle Product.wxs -out Product.wixobj
light Product.wixobj -out MCP.Tekla.Client.Setup.msi
```

### WiX 安裝包配置 (Product.wxs)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Wix xmlns="http://schemas.microsoft.com/wix/2006/wi">
  <Product Id="*" 
           Name="MCP Tekla+ Client" 
           Language="1033" 
           Version="1.0.0.0" 
           Manufacturer="BIMBrain" 
           UpgradeCode="12345678-1234-1234-1234-123456789012">
    
    <Package InstallerVersion="200" 
             Compressed="yes" 
             InstallScope="perMachine" 
             Description="MCP Tekla+ 工作站客戶端" />

    <MajorUpgrade DowngradeErrorMessage="已安裝較新版本" />
    <MediaTemplate EmbedCab="yes" />

    <Feature Id="ProductFeature" Title="MCP Tekla+ Client" Level="1">
      <ComponentGroupRef Id="ProductComponents" />
    </Feature>

    <!-- 系統托盤自動啟動 -->
    <Property Id="AUTOSTART" Value="1" />
    
  </Product>

  <Fragment>
    <Directory Id="TARGETDIR" Name="SourceDir">
      <Directory Id="ProgramFilesFolder">
        <Directory Id="INSTALLFOLDER" Name="MCP Tekla+" />
      </Directory>
      <Directory Id="StartupFolder" />
    </Directory>
  </Fragment>

  <Fragment>
    <ComponentGroup Id="ProductComponents" Directory="INSTALLFOLDER">
      <!-- 主程式檔案 -->
      <Component Id="MainExecutable">
        <File Source="$(var.PublishDir)\MCP.Tekla.Client.exe" />
      </Component>
      
      <!-- 系統托盤自動啟動 -->
      <Component Id="AutoStartup">
        <RegistryValue Root="HKCU" 
                       Key="Software\Microsoft\Windows\CurrentVersion\Run" 
                       Name="MCP Tekla+" 
                       Value="[INSTALLFOLDER]MCP.Tekla.Client.exe --minimized" 
                       Type="string" />
      </Component>
    </ComponentGroup>
  </Fragment>
</Wix>
```

## 🌐 網路配置

### 防火牆設定

#### 伺服器端
```bash
# Ubuntu UFW
sudo ufw allow 8000/tcp  # API 服務
sudo ufw allow 8001/tcp  # WebSocket
sudo ufw enable

# Windows Firewall
netsh advfirewall firewall add rule name="MCP Tekla Server" dir=in action=allow protocol=TCP localport=8000
netsh advfirewall firewall add rule name="MCP Tekla WebSocket" dir=in action=allow protocol=TCP localport=8001
```

#### 工作站端
```powershell
# 允許出站連接到伺服器
netsh advfirewall firewall add rule name="MCP Tekla Client" dir=out action=allow protocol=TCP remoteport=8000,8001
```

### VPN 配置 (可選)
```
如果伺服器和工作站不在同一網段:
1. 設置 VPN 連接
2. 確保路由正確
3. 測試網路連通性
```

## 📊 監控和維護

### 伺服器監控
```bash
# 檢查服務狀態
systemctl status mcp-tekla-server

# 查看日誌
journalctl -u mcp-tekla-server -f

# GPU 使用率
nvidia-smi

# 系統資源
htop
```

### 工作站監控
```
1. 系統托盤圖標狀態
2. Windows 事件檢視器
3. 工作管理員資源使用
```

## 🔧 故障排除

### 常見問題

#### 1. 伺服器無法啟動
```bash
# 檢查 GPU 驅動
nvidia-smi

# 檢查 CUDA 版本
nvcc --version

# 檢查 Python 環境
python --version
pip list
```

#### 2. 工作站無法連接
```
1. 檢查網路連通性: ping server_ip
2. 檢查防火牆設定
3. 檢查伺服器服務狀態
4. 查看客戶端日誌
```

#### 3. Tekla 整合問題
```
1. 確認 Tekla Structures 2025 已安裝
2. 檢查 Tekla Open API 版本
3. 確認 .NET Framework 4.8
4. 重新啟動 Tekla 和客戶端
```

## 📈 效能調優

### GPU 記憶體優化
```python
# 在 .env 中調整
GPU_MEMORY_FRACTION=0.8  # 降低記憶體使用
BATCH_SIZE=1             # 減少批次大小
```

### 網路優化
```
1. 使用有線網路連接
2. 確保網路頻寬充足 (建議 1Gbps+)
3. 減少網路延遲
```

---

**部署完成後，您將擁有一個完整的分佈式 MCP Tekla+ 系統！** 🎉
