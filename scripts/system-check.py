#!/usr/bin/env python3
"""
MCP Tekla+ 系統連接檢查工具
檢查前端、後端、LLM、MCP、API 各項程式功能間的連結
"""

import asyncio
import aiohttp
import json
import logging
import sys
import time
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum

# 設置日誌
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ComponentStatus(Enum):
    """組件狀態枚舉"""
    UNKNOWN = "unknown"
    HEALTHY = "healthy"
    WARNING = "warning"
    ERROR = "error"
    OFFLINE = "offline"

@dataclass
class CheckResult:
    """檢查結果"""
    component: str
    status: ComponentStatus
    message: str
    details: Optional[Dict[str, Any]] = None
    response_time: Optional[float] = None

class SystemChecker:
    """系統檢查器"""
    
    def __init__(self):
        self.results: List[CheckResult] = []
        self.session: Optional[aiohttp.ClientSession] = None
        
        # 配置端點
        self.endpoints = {
            "frontend": "http://localhost:5173",
            "server": "http://localhost:8000",
            "tekla_bridge": "http://localhost:5000",
            "websocket": "ws://localhost:8000/ws"
        }
    
    async def __aenter__(self):
        """異步上下文管理器入口"""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=10)
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """異步上下文管理器出口"""
        if self.session:
            await self.session.close()
    
    async def check_http_endpoint(
        self, 
        name: str, 
        url: str, 
        expected_status: int = 200,
        check_json: bool = False
    ) -> CheckResult:
        """檢查 HTTP 端點"""
        start_time = time.time()
        
        try:
            async with self.session.get(url) as response:
                response_time = time.time() - start_time
                
                if response.status == expected_status:
                    details = {
                        "status_code": response.status,
                        "headers": dict(response.headers),
                        "url": url
                    }
                    
                    if check_json:
                        try:
                            data = await response.json()
                            details["response_data"] = data
                        except Exception as e:
                            return CheckResult(
                                component=name,
                                status=ComponentStatus.WARNING,
                                message=f"端點可達但回應非 JSON: {e}",
                                response_time=response_time
                            )
                    
                    return CheckResult(
                        component=name,
                        status=ComponentStatus.HEALTHY,
                        message=f"端點正常 ({response_time:.3f}s)",
                        details=details,
                        response_time=response_time
                    )
                else:
                    return CheckResult(
                        component=name,
                        status=ComponentStatus.ERROR,
                        message=f"HTTP {response.status}",
                        response_time=response_time
                    )
                    
        except aiohttp.ClientConnectorError:
            return CheckResult(
                component=name,
                status=ComponentStatus.OFFLINE,
                message="無法連接到端點",
                response_time=time.time() - start_time
            )
        except asyncio.TimeoutError:
            return CheckResult(
                component=name,
                status=ComponentStatus.ERROR,
                message="請求超時",
                response_time=time.time() - start_time
            )
        except Exception as e:
            return CheckResult(
                component=name,
                status=ComponentStatus.ERROR,
                message=f"未知錯誤: {e}",
                response_time=time.time() - start_time
            )
    
    async def check_websocket(self, name: str, url: str) -> CheckResult:
        """檢查 WebSocket 連接"""
        start_time = time.time()
        
        try:
            async with self.session.ws_connect(url) as ws:
                # 發送 ping 訊息
                await ws.send_str(json.dumps({"type": "ping"}))
                
                # 等待回應
                async for msg in ws:
                    if msg.type == aiohttp.WSMsgType.TEXT:
                        data = json.loads(msg.data)
                        if data.get("type") == "pong":
                            response_time = time.time() - start_time
                            return CheckResult(
                                component=name,
                                status=ComponentStatus.HEALTHY,
                                message=f"WebSocket 連接正常 ({response_time:.3f}s)",
                                response_time=response_time
                            )
                    elif msg.type == aiohttp.WSMsgType.ERROR:
                        break
                
                return CheckResult(
                    component=name,
                    status=ComponentStatus.WARNING,
                    message="WebSocket 連接但無回應",
                    response_time=time.time() - start_time
                )
                
        except Exception as e:
            return CheckResult(
                component=name,
                status=ComponentStatus.ERROR,
                message=f"WebSocket 錯誤: {e}",
                response_time=time.time() - start_time
            )
    
    async def check_api_functionality(self) -> List[CheckResult]:
        """檢查 API 功能性"""
        results = []
        
        # 檢查健康端點
        result = await self.check_http_endpoint(
            "Server Health Check",
            f"{self.endpoints['server']}/health",
            check_json=True
        )
        results.append(result)
        
        if result.status == ComponentStatus.HEALTHY:
            # 檢查 AI 聊天端點
            try:
                chat_data = {
                    "message": "Hello, this is a test message",
                    "use_rag": False,
                    "temperature": 0.7,
                    "max_tokens": 100
                }
                
                start_time = time.time()
                async with self.session.post(
                    f"{self.endpoints['server']}/api/chat",
                    json=chat_data
                ) as response:
                    response_time = time.time() - start_time
                    
                    if response.status == 200:
                        data = await response.json()
                        results.append(CheckResult(
                            component="AI Chat API",
                            status=ComponentStatus.HEALTHY,
                            message=f"AI 聊天功能正常 ({response_time:.3f}s)",
                            response_time=response_time
                        ))
                    else:
                        results.append(CheckResult(
                            component="AI Chat API",
                            status=ComponentStatus.ERROR,
                            message=f"AI 聊天 API 錯誤: HTTP {response.status}",
                            response_time=response_time
                        ))
                        
            except Exception as e:
                results.append(CheckResult(
                    component="AI Chat API",
                    status=ComponentStatus.ERROR,
                    message=f"AI 聊天 API 測試失敗: {e}"
                ))
            
            # 檢查 RAG 查詢端點
            try:
                rag_data = {
                    "query": "Tekla Structures beam creation",
                    "top_k": 3,
                    "threshold": 0.7
                }
                
                start_time = time.time()
                async with self.session.post(
                    f"{self.endpoints['server']}/api/rag/query",
                    json=rag_data
                ) as response:
                    response_time = time.time() - start_time
                    
                    if response.status == 200:
                        data = await response.json()
                        results.append(CheckResult(
                            component="RAG Query API",
                            status=ComponentStatus.HEALTHY,
                            message=f"RAG 查詢功能正常 ({response_time:.3f}s)",
                            details={"result_count": len(data.get("results", []))},
                            response_time=response_time
                        ))
                    else:
                        results.append(CheckResult(
                            component="RAG Query API",
                            status=ComponentStatus.ERROR,
                            message=f"RAG 查詢 API 錯誤: HTTP {response.status}",
                            response_time=response_time
                        ))
                        
            except Exception as e:
                results.append(CheckResult(
                    component="RAG Query API",
                    status=ComponentStatus.ERROR,
                    message=f"RAG 查詢 API 測試失敗: {e}"
                ))
            
            # 檢查 Tekla 命令端點
            try:
                tekla_data = {
                    "command": "create beam",
                    "parameters": {
                        "profile": "HEA300",
                        "material": "S355"
                    }
                }
                
                start_time = time.time()
                async with self.session.post(
                    f"{self.endpoints['server']}/api/tekla/command",
                    json=tekla_data
                ) as response:
                    response_time = time.time() - start_time
                    
                    if response.status == 200:
                        data = await response.json()
                        results.append(CheckResult(
                            component="Tekla Command API",
                            status=ComponentStatus.HEALTHY,
                            message=f"Tekla 命令功能正常 ({response_time:.3f}s)",
                            response_time=response_time
                        ))
                    else:
                        results.append(CheckResult(
                            component="Tekla Command API",
                            status=ComponentStatus.ERROR,
                            message=f"Tekla 命令 API 錯誤: HTTP {response.status}",
                            response_time=response_time
                        ))
                        
            except Exception as e:
                results.append(CheckResult(
                    component="Tekla Command API",
                    status=ComponentStatus.ERROR,
                    message=f"Tekla 命令 API 測試失敗: {e}"
                ))
        
        return results
    
    async def run_all_checks(self) -> List[CheckResult]:
        """運行所有檢查"""
        logger.info("🔍 開始系統連接檢查...")
        
        # 基礎連接檢查
        basic_checks = [
            self.check_http_endpoint("Frontend", self.endpoints["frontend"]),
            self.check_http_endpoint("Server", self.endpoints["server"]),
            self.check_http_endpoint("Tekla Bridge", self.endpoints["tekla_bridge"]),
            self.check_websocket("WebSocket", self.endpoints["websocket"])
        ]
        
        # 並行執行基礎檢查
        basic_results = await asyncio.gather(*basic_checks, return_exceptions=True)
        
        # 處理異常結果
        for i, result in enumerate(basic_results):
            if isinstance(result, Exception):
                component_names = ["Frontend", "Server", "Tekla Bridge", "WebSocket"]
                self.results.append(CheckResult(
                    component=component_names[i],
                    status=ComponentStatus.ERROR,
                    message=f"檢查異常: {result}"
                ))
            else:
                self.results.append(result)
        
        # API 功能性檢查
        api_results = await self.check_api_functionality()
        self.results.extend(api_results)
        
        return self.results
    
    def print_results(self):
        """打印檢查結果"""
        print("\n" + "="*80)
        print("🚀 MCP Tekla+ 系統連接檢查報告")
        print("="*80)
        
        status_counts = {status: 0 for status in ComponentStatus}
        
        for result in self.results:
            status_counts[result.status] += 1
            
            # 狀態圖標
            icons = {
                ComponentStatus.HEALTHY: "✅",
                ComponentStatus.WARNING: "⚠️",
                ComponentStatus.ERROR: "❌",
                ComponentStatus.OFFLINE: "🔌",
                ComponentStatus.UNKNOWN: "❓"
            }
            
            icon = icons.get(result.status, "❓")
            
            print(f"\n{icon} {result.component}")
            print(f"   狀態: {result.status.value}")
            print(f"   訊息: {result.message}")
            
            if result.response_time:
                print(f"   響應時間: {result.response_time:.3f}s")
            
            if result.details:
                print(f"   詳細資訊: {json.dumps(result.details, indent=2, ensure_ascii=False)}")
        
        # 總結
        print("\n" + "-"*80)
        print("📊 檢查總結:")
        print(f"   ✅ 正常: {status_counts[ComponentStatus.HEALTHY]}")
        print(f"   ⚠️  警告: {status_counts[ComponentStatus.WARNING]}")
        print(f"   ❌ 錯誤: {status_counts[ComponentStatus.ERROR]}")
        print(f"   🔌 離線: {status_counts[ComponentStatus.OFFLINE]}")
        
        # 整體狀態
        if status_counts[ComponentStatus.ERROR] > 0 or status_counts[ComponentStatus.OFFLINE] > 0:
            print("\n🔴 系統狀態: 有問題需要修復")
            return False
        elif status_counts[ComponentStatus.WARNING] > 0:
            print("\n🟡 系統狀態: 基本正常，有警告")
            return True
        else:
            print("\n🟢 系統狀態: 完全正常")
            return True

async def main():
    """主函數"""
    try:
        async with SystemChecker() as checker:
            await checker.run_all_checks()
            success = checker.print_results()
            
            if success:
                sys.exit(0)
            else:
                sys.exit(1)
                
    except KeyboardInterrupt:
        print("\n\n⏹️  檢查被用戶中斷")
        sys.exit(1)
    except Exception as e:
        logger.error(f"系統檢查失敗: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
