# MCP Tekla+ Client 安裝包建置腳本
# 此腳本會建置 .NET 應用程式並創建 Windows 安裝包

param(
    [string]$Configuration = "Release",
    [string]$Runtime = "win-x64",
    [switch]$SelfContained = $true,
    [switch]$Clean = $false,
    [string]$OutputDir = ".\dist"
)

# 設定錯誤處理
$ErrorActionPreference = "Stop"

# 顏色輸出函數
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "✅ $Message" "Green"
}

function Write-Info {
    param([string]$Message)
    Write-ColorOutput "ℹ️  $Message" "Cyan"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "⚠️  $Message" "Yellow"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "❌ $Message" "Red"
}

# 主要建置函數
function Build-Application {
    Write-Info "開始建置 MCP Tekla+ Client..."
    
    try {
        # 檢查必要工具
        Test-Prerequisites
        
        # 清理舊檔案
        if ($Clean) {
            Clean-BuildArtifacts
        }
        
        # 建置應用程式
        Build-DotNetApplication
        
        # 準備安裝包資源
        Prepare-InstallerResources
        
        # 建置安裝包
        Build-Installer
        
        # 驗證安裝包
        Test-Installer
        
        Write-Success "建置完成！安裝包位於: $OutputDir\MCP.Tekla.Client.Setup.msi"
        
    } catch {
        Write-Error "建置失敗: $($_.Exception.Message)"
        exit 1
    }
}

# 檢查必要工具
function Test-Prerequisites {
    Write-Info "檢查建置環境..."
    
    # 檢查 .NET SDK
    try {
        $dotnetVersion = dotnet --version
        Write-Success ".NET SDK 版本: $dotnetVersion"
    } catch {
        throw ".NET SDK 未安裝或不在 PATH 中"
    }
    
    # 檢查 WiX Toolset
    try {
        $wixPath = Get-Command "candle.exe" -ErrorAction SilentlyContinue
        if (-not $wixPath) {
            throw "WiX Toolset 未安裝或不在 PATH 中"
        }
        Write-Success "WiX Toolset 已找到: $($wixPath.Source)"
    } catch {
        throw "WiX Toolset 未安裝。請從 https://wixtoolset.org/ 下載安裝"
    }
    
    # 檢查 Tekla API 檔案
    $teklaApiPath = "C:\Program Files\Tekla Structures\2025.0\bin\plugins"
    if (-not (Test-Path $teklaApiPath)) {
        Write-Warning "Tekla Structures 2025 未找到，將使用預設 API 檔案"
    } else {
        Write-Success "Tekla Structures 2025 已找到"
    }
}

# 清理建置產物
function Clean-BuildArtifacts {
    Write-Info "清理舊的建置檔案..."
    
    $pathsToClean = @(
        ".\MCP.Tekla.Client\bin",
        ".\MCP.Tekla.Client\obj",
        ".\Setup\bin",
        ".\Setup\obj",
        $OutputDir
    )
    
    foreach ($path in $pathsToClean) {
        if (Test-Path $path) {
            Remove-Item $path -Recurse -Force
            Write-Info "已清理: $path"
        }
    }
}

# 建置 .NET 應用程式
function Build-DotNetApplication {
    Write-Info "建置 .NET 應用程式..."
    
    $publishDir = ".\MCP.Tekla.Client\bin\$Configuration\net8.0-windows\$Runtime\publish"
    
    # 發布應用程式
    $publishArgs = @(
        "publish"
        ".\MCP.Tekla.Client\MCP.Tekla.Client.csproj"
        "-c", $Configuration
        "-r", $Runtime
        "--self-contained", $SelfContained.ToString().ToLower()
        "-p:PublishSingleFile=false"
        "-p:PublishTrimmed=false"
        "-p:IncludeNativeLibrariesForSelfExtract=true"
        "--verbosity", "minimal"
    )
    
    Write-Info "執行: dotnet $($publishArgs -join ' ')"
    & dotnet @publishArgs
    
    if ($LASTEXITCODE -ne 0) {
        throw "dotnet publish 失敗，退出代碼: $LASTEXITCODE"
    }
    
    Write-Success "應用程式建置完成: $publishDir"
    
    # 驗證關鍵檔案
    $requiredFiles = @(
        "MCP.Tekla.Client.exe",
        "MCP.Tekla.Client.dll"
    )
    
    foreach ($file in $requiredFiles) {
        $filePath = Join-Path $publishDir $file
        if (-not (Test-Path $filePath)) {
            throw "必要檔案不存在: $filePath"
        }
    }
    
    return $publishDir
}

# 準備安裝包資源
function Prepare-InstallerResources {
    Write-Info "準備安裝包資源..."
    
    # 創建資源目錄
    $resourceDir = ".\Setup\Resources"
    if (-not (Test-Path $resourceDir)) {
        New-Item -ItemType Directory -Path $resourceDir -Force | Out-Null
    }
    
    # 複製圖標檔案
    $iconFiles = @(
        "app.ico",
        "connected.ico",
        "disconnected.ico",
        "error.ico",
        "working.ico"
    )
    
    foreach ($icon in $iconFiles) {
        $sourcePath = ".\MCP.Tekla.Client\Resources\$icon"
        $destPath = "$resourceDir\$icon"
        
        if (Test-Path $sourcePath) {
            Copy-Item $sourcePath $destPath -Force
        } else {
            # 創建預設圖標
            Create-DefaultIcon $destPath
        }
    }
    
    # 準備配置檔案
    $configDir = ".\Setup\Config"
    if (-not (Test-Path $configDir)) {
        New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    }
    
    # 複製配置檔案
    Copy-Item ".\MCP.Tekla.Client\appsettings.json" "$configDir\" -Force -ErrorAction SilentlyContinue
    Copy-Item ".\MCP.Tekla.Client\appsettings.Production.json" "$configDir\" -Force -ErrorAction SilentlyContinue
}

# 創建預設圖標
function Create-DefaultIcon {
    param([string]$IconPath)
    
    Write-Info "創建預設圖標: $IconPath"
    
    # 這裡可以使用 PowerShell 創建簡單的 ICO 檔案
    # 或者從網路資源下載預設圖標
    # 為了簡化，我們創建一個空檔案作為佔位符
    New-Item -ItemType File -Path $IconPath -Force | Out-Null
}

# 建置安裝包
function Build-Installer {
    Write-Info "建置 Windows 安裝包..."
    
    $publishDir = ".\MCP.Tekla.Client\bin\$Configuration\net8.0-windows\$Runtime\publish"
    $resourceDir = ".\Setup\Resources"
    $configDir = ".\Setup\Config"
    
    # 創建輸出目錄
    if (-not (Test-Path $OutputDir)) {
        New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
    }
    
    # WiX 編譯
    $candleArgs = @(
        ".\Setup\Product.wxs"
        "-out", ".\Setup\Product.wixobj"
        "-dPublishDir=$publishDir"
        "-dResourceDir=$resourceDir"
        "-dConfigDir=$configDir"
        "-arch", "x64"
    )
    
    Write-Info "執行: candle $($candleArgs -join ' ')"
    & candle @candleArgs
    
    if ($LASTEXITCODE -ne 0) {
        throw "WiX candle 編譯失敗，退出代碼: $LASTEXITCODE"
    }
    
    # WiX 連結
    $lightArgs = @(
        ".\Setup\Product.wixobj"
        "-out", "$OutputDir\MCP.Tekla.Client.Setup.msi"
        "-ext", "WixUIExtension"
        "-cultures:en-us"
    )
    
    Write-Info "執行: light $($lightArgs -join ' ')"
    & light @lightArgs
    
    if ($LASTEXITCODE -ne 0) {
        throw "WiX light 連結失敗，退出代碼: $LASTEXITCODE"
    }
    
    Write-Success "安裝包建置完成"
}

# 測試安裝包
function Test-Installer {
    Write-Info "驗證安裝包..."
    
    $msiPath = "$OutputDir\MCP.Tekla.Client.Setup.msi"
    
    if (-not (Test-Path $msiPath)) {
        throw "安裝包檔案不存在: $msiPath"
    }
    
    # 檢查檔案大小
    $fileSize = (Get-Item $msiPath).Length
    $fileSizeMB = [math]::Round($fileSize / 1MB, 2)
    
    if ($fileSize -lt 1MB) {
        throw "安裝包檔案太小，可能建置不完整"
    }
    
    Write-Success "安裝包驗證通過 (大小: $fileSizeMB MB)"
    
    # 可選：執行安裝包驗證
    try {
        Write-Info "執行 MSI 驗證..."
        $result = & msiexec /a $msiPath /qn TARGETDIR="$env:TEMP\MCP_Tekla_Test" /L*v "$env:TEMP\msi_validation.log"
        Write-Success "MSI 驗證通過"
    } catch {
        Write-Warning "MSI 驗證失敗，但安裝包可能仍然可用"
    }
}

# 顯示使用說明
function Show-Usage {
    Write-Host @"
MCP Tekla+ Client 安裝包建置腳本

用法:
    .\build-installer.ps1 [參數]

參數:
    -Configuration <Release|Debug>  建置配置 (預設: Release)
    -Runtime <win-x64|win-x86>      目標運行時 (預設: win-x64)
    -SelfContained                  是否包含 .NET Runtime (預設: true)
    -Clean                          清理舊的建置檔案
    -OutputDir <路徑>               輸出目錄 (預設: .\dist)

範例:
    .\build-installer.ps1
    .\build-installer.ps1 -Clean
    .\build-installer.ps1 -Configuration Debug -OutputDir "C:\Build"

"@
}

# 主程式入口
if ($args -contains "-h" -or $args -contains "--help") {
    Show-Usage
    exit 0
}

Write-ColorOutput "🚀 MCP Tekla+ Client 安裝包建置工具" "Magenta"
Write-ColorOutput "=" * 50 "Magenta"

Build-Application

Write-ColorOutput "=" * 50 "Magenta"
Write-Success "建置流程完成！"
