#!/usr/bin/env python3
"""
MCP Tekla+ 伺服器端主程式
運行 DeepSeek-Coder-v2 16B 和 RAG 系統
"""

import asyncio
import logging
import os
from contextlib import asynccontextmanager
from typing import Dict, List, Optional

import torch
import uvicorn
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from services.ai_service import AIService
from services.rag_service import RAGService
from services.tekla_knowledge import TeklaKnowledgeBase
from utils.gpu_monitor import GPUMonitor
from utils.logger import setup_logger

# 設置日誌
logger = setup_logger(__name__)

# 全域服務實例
ai_service: Optional[AIService] = None
rag_service: Optional[RAGService] = None
tekla_kb: Optional[TeklaKnowledgeBase] = None
gpu_monitor: Optional[GPUMonitor] = None

# WebSocket 連接管理
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket 連接建立，當前連接數: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"WebSocket 連接斷開，當前連接數: {len(self.active_connections)}")
    
    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"廣播訊息失敗: {e}")

manager = ConnectionManager()

# 請求模型
class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None
    use_rag: bool = True
    temperature: float = 0.7
    max_tokens: int = 2048

class RAGQueryRequest(BaseModel):
    query: str
    top_k: int = 5
    threshold: float = 0.7

class TeklaCommandRequest(BaseModel):
    command: str
    parameters: Optional[Dict] = None
    context: Optional[str] = None

# 應用程式生命週期管理
@asynccontextmanager
async def lifespan(app: FastAPI):
    """應用程式啟動和關閉時的處理"""
    global ai_service, rag_service, tekla_kb, gpu_monitor
    
    logger.info("🚀 啟動 MCP Tekla+ 伺服器...")
    
    try:
        # 初始化 GPU 監控
        gpu_monitor = GPUMonitor()
        logger.info(f"GPU 監控已啟動，檢測到 {gpu_monitor.get_gpu_count()} 個 GPU")
        
        # 初始化 Tekla 知識庫
        logger.info("📚 初始化 Tekla 知識庫...")
        tekla_kb = TeklaKnowledgeBase()
        await tekla_kb.initialize()
        
        # 初始化 RAG 服務
        logger.info("🔍 初始化 RAG 服務...")
        rag_service = RAGService(tekla_kb)
        await rag_service.initialize()
        
        # 初始化 AI 服務
        logger.info("🤖 載入 DeepSeek-Coder-v2 16B 模型...")
        ai_service = AIService(
            model_name="deepseek-ai/deepseek-coder-6.7b-instruct",  # 可調整為 16B 版本
            device_map="auto",
            torch_dtype=torch.float16
        )
        await ai_service.initialize()
        
        logger.info("✅ 所有服務初始化完成")
        
        yield
        
    except Exception as e:
        logger.error(f"❌ 服務初始化失敗: {e}")
        raise
    finally:
        logger.info("🔄 關閉服務...")
        if ai_service:
            await ai_service.cleanup()
        if rag_service:
            await rag_service.cleanup()
        if tekla_kb:
            await tekla_kb.cleanup()
        logger.info("✅ 服務關閉完成")

# 創建 FastAPI 應用程式
app = FastAPI(
    title="MCP Tekla+ AI 伺服器",
    description="DeepSeek-Coder-v2 16B + RAG 系統",
    version="1.0.0",
    lifespan=lifespan
)

# CORS 設置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生產環境應限制來源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 健康檢查端點
@app.get("/health")
async def health_check():
    """健康檢查端點"""
    gpu_info = gpu_monitor.get_gpu_status() if gpu_monitor else {}
    
    return {
        "status": "healthy",
        "services": {
            "ai_service": ai_service is not None and ai_service.is_ready(),
            "rag_service": rag_service is not None and rag_service.is_ready(),
            "tekla_kb": tekla_kb is not None and tekla_kb.is_ready()
        },
        "gpu_status": gpu_info,
        "timestamp": asyncio.get_event_loop().time()
    }

# AI 聊天端點
@app.post("/api/chat")
async def chat(request: ChatRequest):
    """AI 聊天端點"""
    if not ai_service or not ai_service.is_ready():
        raise HTTPException(status_code=503, detail="AI 服務未就緒")
    
    try:
        # 如果啟用 RAG，先檢索相關知識
        context = request.context or ""
        if request.use_rag and rag_service and rag_service.is_ready():
            rag_results = await rag_service.query(
                request.message, 
                top_k=5, 
                threshold=0.7
            )
            if rag_results:
                context += "\n\n相關 Tekla 知識:\n" + "\n".join([
                    f"- {result['content']}" for result in rag_results
                ])
        
        # 生成回應
        response = await ai_service.generate_response(
            message=request.message,
            context=context,
            temperature=request.temperature,
            max_tokens=request.max_tokens
        )
        
        # 廣播到所有連接的客戶端
        await manager.broadcast({
            "type": "chat_response",
            "message": request.message,
            "response": response,
            "timestamp": asyncio.get_event_loop().time()
        })
        
        return {
            "response": response,
            "context_used": bool(context),
            "rag_enabled": request.use_rag
        }
        
    except Exception as e:
        logger.error(f"聊天處理錯誤: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# RAG 查詢端點
@app.post("/api/rag/query")
async def rag_query(request: RAGQueryRequest):
    """RAG 知識查詢端點"""
    if not rag_service or not rag_service.is_ready():
        raise HTTPException(status_code=503, detail="RAG 服務未就緒")
    
    try:
        results = await rag_service.query(
            request.query,
            top_k=request.top_k,
            threshold=request.threshold
        )
        
        return {
            "query": request.query,
            "results": results,
            "count": len(results)
        }
        
    except Exception as e:
        logger.error(f"RAG 查詢錯誤: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Tekla 命令端點
@app.post("/api/tekla/command")
async def tekla_command(request: TeklaCommandRequest):
    """Tekla 命令處理端點"""
    if not ai_service or not ai_service.is_ready():
        raise HTTPException(status_code=503, detail="AI 服務未就緒")
    
    try:
        # 使用 RAG 獲取相關 Tekla 知識
        context = request.context or ""
        if rag_service and rag_service.is_ready():
            rag_results = await rag_service.query(
                f"Tekla {request.command}",
                top_k=3,
                threshold=0.8
            )
            if rag_results:
                context += "\n\nTekla API 參考:\n" + "\n".join([
                    f"- {result['content']}" for result in rag_results
                ])
        
        # 生成 Tekla 命令代碼
        prompt = f"""
        根據以下要求生成 Tekla Structures 2025 API 代碼:
        
        命令: {request.command}
        參數: {request.parameters or '無'}
        
        {context}
        
        請生成完整的 C# 代碼，包含必要的 using 語句和錯誤處理。
        """
        
        response = await ai_service.generate_response(
            message=prompt,
            temperature=0.3,  # 較低溫度確保代碼準確性
            max_tokens=1024
        )
        
        return {
            "command": request.command,
            "parameters": request.parameters,
            "generated_code": response,
            "context_used": bool(context)
        }
        
    except Exception as e:
        logger.error(f"Tekla 命令處理錯誤: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# GPU 狀態端點
@app.get("/api/gpu/status")
async def gpu_status():
    """GPU 狀態查詢端點"""
    if not gpu_monitor:
        raise HTTPException(status_code=503, detail="GPU 監控未啟動")
    
    return gpu_monitor.get_detailed_status()

# WebSocket 端點
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket 連接端點"""
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            
            # 處理不同類型的 WebSocket 訊息
            if data.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
            elif data.get("type") == "gpu_status":
                if gpu_monitor:
                    status = gpu_monitor.get_gpu_status()
                    await websocket.send_json({
                        "type": "gpu_status",
                        "data": status
                    })
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket 錯誤: {e}")
        manager.disconnect(websocket)

if __name__ == "__main__":
    # 檢查 GPU 可用性
    if not torch.cuda.is_available():
        logger.warning("⚠️ 未檢測到 CUDA GPU，將使用 CPU 運行")
    else:
        gpu_count = torch.cuda.device_count()
        logger.info(f"🎮 檢測到 {gpu_count} 個 GPU")
        for i in range(gpu_count):
            gpu_name = torch.cuda.get_device_name(i)
            logger.info(f"  GPU {i}: {gpu_name}")
    
    # 啟動伺服器
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,  # 生產環境關閉自動重載
        workers=1,     # 由於模型載入，使用單一 worker
        log_level="info"
    )
