"""
AI 服務模組
處理 DeepSeek-Coder-v2 模型的載入和推理
"""

import asyncio
import logging
import torch
from typing import Optional, Dict, Any, List
from transformers import (
    AutoTokenizer, 
    AutoModelForCausalLM, 
    GenerationConfig,
    BitsAndBytesConfig
)
import gc

logger = logging.getLogger(__name__)

class AIService:
    """AI 服務類別，管理 DeepSeek-Coder 模型"""
    
    def __init__(
        self, 
        model_name: str = "deepseek-ai/deepseek-coder-6.7b-instruct",
        device_map: str = "auto",
        torch_dtype: torch.dtype = torch.float16,
        load_in_8bit: bool = False,
        load_in_4bit: bool = False
    ):
        self.model_name = model_name
        self.device_map = device_map
        self.torch_dtype = torch_dtype
        self.load_in_8bit = load_in_8bit
        self.load_in_4bit = load_in_4bit
        
        self.tokenizer: Optional[AutoTokenizer] = None
        self.model: Optional[AutoModelForCausalLM] = None
        self.generation_config: Optional[GenerationConfig] = None
        self.is_initialized = False
        
        # 設定量化配置
        self.quantization_config = None
        if load_in_4bit:
            self.quantization_config = BitsAndBytesConfig(
                load_in_4bit=True,
                bnb_4bit_compute_dtype=torch_dtype,
                bnb_4bit_use_double_quant=True,
                bnb_4bit_quant_type="nf4"
            )
        elif load_in_8bit:
            self.quantization_config = BitsAndBytesConfig(
                load_in_8bit=True
            )
    
    async def initialize(self):
        """初始化 AI 模型"""
        try:
            logger.info(f"開始載入 AI 模型: {self.model_name}")
            
            # 載入 tokenizer
            logger.info("載入 tokenizer...")
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_name,
                trust_remote_code=True,
                padding_side="left"
            )
            
            # 設定 pad_token
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
            
            # 載入模型
            logger.info("載入模型...")
            model_kwargs = {
                "pretrained_model_name_or_path": self.model_name,
                "torch_dtype": self.torch_dtype,
                "device_map": self.device_map,
                "trust_remote_code": True,
                "low_cpu_mem_usage": True
            }
            
            if self.quantization_config:
                model_kwargs["quantization_config"] = self.quantization_config
            
            self.model = AutoModelForCausalLM.from_pretrained(**model_kwargs)
            
            # 設定生成配置
            self.generation_config = GenerationConfig(
                do_sample=True,
                temperature=0.7,
                top_p=0.95,
                top_k=50,
                max_new_tokens=2048,
                repetition_penalty=1.1,
                pad_token_id=self.tokenizer.pad_token_id,
                eos_token_id=self.tokenizer.eos_token_id
            )
            
            self.is_initialized = True
            logger.info("✅ AI 模型載入完成")
            
            # 記錄模型資訊
            if hasattr(self.model, 'get_memory_footprint'):
                memory_mb = self.model.get_memory_footprint() / 1024 / 1024
                logger.info(f"模型記憶體使用: {memory_mb:.2f} MB")
            
        except Exception as e:
            logger.error(f"❌ AI 模型載入失敗: {e}")
            raise
    
    async def generate_response(
        self,
        message: str,
        context: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048,
        system_prompt: Optional[str] = None
    ) -> str:
        """生成 AI 回應"""
        if not self.is_ready():
            raise RuntimeError("AI 服務未就緒")
        
        try:
            # 構建提示詞
            prompt = self._build_prompt(message, context, system_prompt)
            
            # 編碼輸入
            inputs = self.tokenizer.encode(prompt, return_tensors="pt")
            
            # 移動到正確的設備
            if torch.cuda.is_available():
                inputs = inputs.to(self.model.device)
            
            # 更新生成配置
            generation_config = GenerationConfig(
                **self.generation_config.to_dict(),
                temperature=temperature,
                max_new_tokens=min(max_tokens, 2048)
            )
            
            # 生成回應
            with torch.no_grad():
                outputs = self.model.generate(
                    inputs,
                    generation_config=generation_config,
                    pad_token_id=self.tokenizer.pad_token_id,
                    do_sample=True
                )
            
            # 解碼回應
            response = self.tokenizer.decode(
                outputs[0][inputs.shape[1]:], 
                skip_special_tokens=True
            )
            
            # 清理記憶體
            del inputs, outputs
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            
            return response.strip()
            
        except Exception as e:
            logger.error(f"生成回應時發生錯誤: {e}")
            raise
    
    def _build_prompt(
        self, 
        message: str, 
        context: Optional[str] = None,
        system_prompt: Optional[str] = None
    ) -> str:
        """構建提示詞"""
        
        # 預設系統提示詞
        default_system = """你是一個專業的 Tekla Structures 建模助手，具備以下能力：
1. 理解建築和結構工程概念
2. 熟悉 Tekla Structures 2025 Open API
3. 能夠生成準確的 C# 代碼
4. 提供詳細的技術說明

請用繁體中文回答，並確保代碼的正確性和實用性。"""
        
        system = system_prompt or default_system
        
        # 構建對話格式
        prompt_parts = [
            f"### 系統\n{system}\n",
            f"### 用戶\n{message}\n"
        ]
        
        # 添加上下文
        if context:
            prompt_parts.insert(-1, f"### 相關資訊\n{context}\n")
        
        prompt_parts.append("### 助手\n")
        
        return "\n".join(prompt_parts)
    
    async def generate_tekla_code(
        self,
        description: str,
        context: Optional[str] = None,
        api_references: Optional[List[str]] = None
    ) -> str:
        """生成 Tekla API 代碼"""
        
        # 構建 Tekla 專用系統提示詞
        system_prompt = """你是一個 Tekla Structures 2025 Open API 專家。請根據用戶需求生成準確的 C# 代碼。

要求：
1. 使用正確的 Tekla API 命名空間
2. 包含必要的 using 語句
3. 添加適當的錯誤處理
4. 提供清晰的註解
5. 確保代碼可以直接在 Tekla 中執行

可用的主要命名空間：
- Tekla.Structures.Model
- Tekla.Structures.Geometry3d
- Tekla.Structures.Catalogs
- Tekla.Structures.Dialog
- Tekla.Structures.Drawing"""
        
        # 添加 API 參考資訊
        if api_references:
            context_parts = [context] if context else []
            context_parts.append("API 參考資訊：")
            context_parts.extend(api_references)
            context = "\n".join(context_parts)
        
        return await self.generate_response(
            message=f"請生成 Tekla Structures API 代碼：{description}",
            context=context,
            system_prompt=system_prompt,
            temperature=0.3  # 較低溫度確保代碼準確性
        )
    
    def is_ready(self) -> bool:
        """檢查服務是否就緒"""
        return (
            self.is_initialized and 
            self.tokenizer is not None and 
            self.model is not None
        )
    
    def get_model_info(self) -> Dict[str, Any]:
        """獲取模型資訊"""
        if not self.is_ready():
            return {"status": "not_ready"}
        
        info = {
            "model_name": self.model_name,
            "device_map": self.device_map,
            "torch_dtype": str(self.torch_dtype),
            "is_quantized": self.quantization_config is not None,
            "status": "ready"
        }
        
        if hasattr(self.model, 'get_memory_footprint'):
            info["memory_footprint_mb"] = self.model.get_memory_footprint() / 1024 / 1024
        
        return info
    
    async def cleanup(self):
        """清理資源"""
        try:
            logger.info("清理 AI 服務資源...")
            
            if self.model is not None:
                del self.model
                self.model = None
            
            if self.tokenizer is not None:
                del self.tokenizer
                self.tokenizer = None
            
            # 清理 GPU 記憶體
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            
            # 強制垃圾回收
            gc.collect()
            
            self.is_initialized = False
            logger.info("✅ AI 服務資源清理完成")
            
        except Exception as e:
            logger.error(f"清理 AI 服務時發生錯誤: {e}")
    
    def get_device_info(self) -> Dict[str, Any]:
        """獲取設備資訊"""
        info = {
            "cuda_available": torch.cuda.is_available(),
            "device_count": torch.cuda.device_count() if torch.cuda.is_available() else 0
        }
        
        if torch.cuda.is_available():
            info["devices"] = []
            for i in range(torch.cuda.device_count()):
                device_info = {
                    "id": i,
                    "name": torch.cuda.get_device_name(i),
                    "memory_total": torch.cuda.get_device_properties(i).total_memory,
                    "memory_allocated": torch.cuda.memory_allocated(i),
                    "memory_cached": torch.cuda.memory_reserved(i)
                }
                info["devices"].append(device_info)
        
        return info
