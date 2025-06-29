"""
GPU 監控工具
"""

import logging
import psutil
from typing import Dict, List, Any, Optional

logger = logging.getLogger(__name__)

class GPUMonitor:
    """GPU 監控類別"""
    
    def __init__(self):
        self.gpu_available = False
        self.gpu_count = 0
        
        try:
            import pynvml
            pynvml.nvmlInit()
            self.gpu_count = pynvml.nvmlDeviceGetCount()
            self.gpu_available = True
            self.pynvml = pynvml
            logger.info(f"檢測到 {self.gpu_count} 個 GPU")
        except ImportError:
            logger.warning("pynvml 未安裝，GPU 監控功能不可用")
        except Exception as e:
            logger.warning(f"GPU 監控初始化失敗: {e}")
    
    def get_gpu_count(self) -> int:
        """獲取 GPU 數量"""
        return self.gpu_count
    
    def get_gpu_status(self) -> Dict[str, Any]:
        """獲取 GPU 狀態"""
        if not self.gpu_available:
            return {
                "available": False,
                "count": 0,
                "message": "GPU 監控不可用"
            }
        
        try:
            gpus = []
            for i in range(self.gpu_count):
                handle = self.pynvml.nvmlDeviceGetHandleByIndex(i)
                
                # 獲取 GPU 資訊
                name = self.pynvml.nvmlDeviceGetName(handle).decode('utf-8')
                
                # 獲取記憶體資訊
                mem_info = self.pynvml.nvmlDeviceGetMemoryInfo(handle)
                
                # 獲取使用率
                try:
                    util = self.pynvml.nvmlDeviceGetUtilizationRates(handle)
                    gpu_util = util.gpu
                    mem_util = util.memory
                except:
                    gpu_util = 0
                    mem_util = 0
                
                # 獲取溫度
                try:
                    temp = self.pynvml.nvmlDeviceGetTemperature(handle, self.pynvml.NVML_TEMPERATURE_GPU)
                except:
                    temp = 0
                
                gpus.append({
                    "id": i,
                    "name": name,
                    "memory_total": mem_info.total,
                    "memory_used": mem_info.used,
                    "memory_free": mem_info.free,
                    "memory_util_percent": mem_util,
                    "gpu_util_percent": gpu_util,
                    "temperature": temp
                })
            
            return {
                "available": True,
                "count": self.gpu_count,
                "gpus": gpus
            }
            
        except Exception as e:
            logger.error(f"獲取 GPU 狀態失敗: {e}")
            return {
                "available": False,
                "count": 0,
                "error": str(e)
            }
    
    def get_detailed_status(self) -> Dict[str, Any]:
        """獲取詳細狀態"""
        gpu_status = self.get_gpu_status()
        
        # 添加系統資訊
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        
        return {
            "gpu": gpu_status,
            "cpu": {
                "usage_percent": cpu_percent,
                "count": psutil.cpu_count()
            },
            "memory": {
                "total": memory.total,
                "used": memory.used,
                "available": memory.available,
                "percent": memory.percent
            },
            "timestamp": psutil.boot_time()
        }
