# 📁 MCP Tekla+ Project Structure

## 🎯 **Essential Files Only**

This repository has been cleaned up to contain only the necessary files for the MCP Tekla+ system.

### 📂 **Root Directory**
```
McpTeklaPlus/
├── 📄 README.md                    # Project overview and setup guide
├── 📄 RELEASE_NOTES.md             # Version history and changes
├── 📄 DEPLOYMENT.md                # Deployment instructions
├── 📄 DISTRIBUTED_DEPLOYMENT.md    # Distributed system setup
├── 📄 PROJECT_STRUCTURE.md         # This file
├── 📄 LICENSE                      # MIT License
├── 📄 .env                         # Environment configuration
├── 📄 .gitignore                   # Git ignore patterns
├── 📄 package.json                 # Frontend dependencies
├── 📄 package-lock.json            # Locked dependency versions
├── 📄 vite.config.ts               # Vite configuration
├── 📄 tailwind.config.js           # Tailwind CSS configuration
├── 📄 tsconfig.json                # TypeScript configuration
├── 📄 eslint.config.js             # ESLint configuration
└── 📄 index.html                   # Main HTML entry point
```

### 🌐 **Frontend (React + TypeScript)**
```
src/
├── 📄 main.tsx                     # React app entry point
├── 📄 App.tsx                      # Main app component
├── 📄 App.css                      # App styles
├── 📄 index.css                    # Global styles
├── 📄 vite-env.d.ts               # Vite type definitions
├── 📂 components/                  # React components
│   ├── 📂 ai/                     # AI-related components
│   ├── 📂 dashboard/              # Dashboard components
│   ├── 📂 layout/                 # Layout components
│   ├── 📂 tekla/                  # Tekla integration components
│   └── 📂 ui/                     # UI components
├── 📂 services/                   # API services
├── 📂 hooks/                      # Custom React hooks
├── 📂 utils/                      # Utility functions
├── 📂 types/                      # TypeScript type definitions
├── 📂 lib/                        # Library configurations
├── 📂 data/                       # Static data
└── 📂 assets/                     # Static assets
```

### 🖥️ **Backend (Python FastAPI)**
```
server/
├── 📄 simple_server.py            # Main FastAPI server
├── 📄 requirements.txt            # Python dependencies
├── 📂 services/                   # Backend services
│   ├── 📄 ai_service.py          # AI service integration
│   ├── 📄 rag_service.py         # RAG system service
│   └── 📄 tekla_knowledge.py     # Tekla knowledge base
└── 📂 utils/                      # Utility modules
    ├── 📄 logger.py              # Logging configuration
    └── 📄 gpu_monitor.py         # GPU monitoring
```

### 🏗️ **Tekla API Service (.NET C#)**
```
TeklaApiService/
├── 📄 Program.cs                  # Main program entry
├── 📄 TeklaApiService.csproj      # Project configuration
├── 📄 README.md                   # Service documentation
├── 📂 Controllers/                # API controllers
│   └── 📄 TeklaController.cs     # Tekla API controller
└── 📂 Services/                   # Service implementations
    └── 📄 TeklaModelService.cs   # Tekla model service
```

### 💻 **Workstation Client (.NET C#)**
```
workstation/
├── 📂 MCP.Tekla.Client/          # Main client application
│   ├── 📄 Program.cs             # Client entry point
│   ├── 📄 MCP.Tekla.Client.csproj # Project file
│   ├── 📂 Services/              # Client services
│   ├── 📂 Forms/                 # Windows Forms UI
│   └── 📂 Models/                # Data models
├── 📂 Setup/                     # Installer configuration
│   ├── 📄 Product.wxs           # WiX installer config
│   └── 📄 Setup.wixproj         # WiX project file
└── 📄 build-installer.ps1        # Build automation script
```

### 🧪 **Testing & Scripts**
```
scripts/
├── 📄 quick-test.py              # API testing script
├── 📄 system-check.py            # System health check
└── 📄 check-app.js               # Frontend health check
```

### 🌐 **Public Assets**
```
public/
├── 📄 vite.svg                   # Vite logo
└── 📄 webui-check.html           # WebUI testing interface
```

## 🚫 **Removed Files**

The following unnecessary files have been removed:

### ❌ **Batch Scripts**
- `final-push.bat`
- `push-to-github.bat`
- `quick-push.bat`
- `simple-push.bat`

### ❌ **Test Files**
- `public/simple.html`
- `public/test.html`

### ❌ **Build Artifacts**
- `TeklaApiService/bin/`
- `TeklaApiService/obj/`
- `server/__pycache__/`

### ❌ **Unused Files**
- `image.png`
- `server/main.py`
- `McpTeklaPlus.sln`

## 🔧 **Updated .gitignore**

Enhanced `.gitignore` to prevent future commits of:
- Build artifacts (`bin/`, `obj/`, `__pycache__/`)
- Temporary files (`*.tmp`, `*.bak`)
- IDE files (`.vscode/`, `.idea/`)
- OS files (`.DS_Store`, `Thumbs.db`)
- Batch scripts (`*.bat`)
- Test files (`test.html`, `simple.html`)

## 🎯 **Current Repository Status**

- ✅ **Clean and organized**
- ✅ **Only essential files**
- ✅ **Proper .gitignore configuration**
- ✅ **Ready for production use**
- ✅ **Easy to navigate and maintain**

## 🚀 **Quick Start**

```bash
# Clone the repository
git clone https://github.com/BIMBrain/McpTeklaPlus.git
cd McpTeklaPlus

# Install frontend dependencies
npm install

# Install backend dependencies
pip install -r server/requirements.txt

# Start backend server
cd server && python simple_server.py

# Start frontend (in new terminal)
npm run dev

# Test the system
python scripts/quick-test.py
```

The repository is now clean, organized, and ready for development and deployment! 🎉
