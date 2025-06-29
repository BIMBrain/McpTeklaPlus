"""
Tekla Structures 知識庫管理
處理 Tekla API 文檔和範例代碼的向量化存儲
"""

import asyncio
import json
import logging
import os
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import aiofiles
from langchain.text_splitter import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

class TeklaKnowledgeBase:
    """Tekla 知識庫管理類"""
    
    def __init__(self, data_dir: str = "data/tekla"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # 文本分割器
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", ".", "!", "?", ",", " ", ""]
        )
        
        # 嵌入模型
        self.embedding_model = None
        self.documents: List[Dict] = []
        self.is_initialized = False
        
    async def initialize(self):
        """初始化知識庫"""
        try:
            logger.info("初始化 Tekla 知識庫...")
            
            # 載入嵌入模型
            logger.info("載入嵌入模型...")
            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
            
            # 創建 Tekla API 文檔
            await self._create_tekla_api_docs()
            
            # 載入現有文檔
            await self._load_documents()
            
            self.is_initialized = True
            logger.info(f"✅ Tekla 知識庫初始化完成，載入 {len(self.documents)} 個文檔")
            
        except Exception as e:
            logger.error(f"❌ Tekla 知識庫初始化失敗: {e}")
            raise
    
    async def _create_tekla_api_docs(self):
        """創建 Tekla API 文檔"""
        api_docs = {
            "Tekla.Structures.Model": {
                "description": "Tekla Structures 3D 模型操作核心 API",
                "classes": {
                    "Model": {
                        "description": "表示 Tekla Structures 模型的主要類別",
                        "methods": {
                            "GetConnectionHandler": "獲取連接處理器",
                            "CommitChanges": "提交模型變更",
                            "GetModelInfo": "獲取模型資訊"
                        },
                        "example": """
using Tekla.Structures.Model;

// 獲取當前模型
Model model = new Model();
if (model.GetConnectionStatus())
{
    // 提交變更
    model.CommitChanges();
}
                        """
                    },
                    "Beam": {
                        "description": "樑構件類別",
                        "properties": {
                            "StartPoint": "起始點座標",
                            "EndPoint": "結束點座標",
                            "Profile": "截面規格",
                            "Material": "材料屬性"
                        },
                        "example": """
using Tekla.Structures.Model;
using Tekla.Structures.Geometry3d;

// 創建樑
Beam beam = new Beam();
beam.StartPoint = new Point(0, 0, 0);
beam.EndPoint = new Point(5000, 0, 0);
beam.Profile.ProfileString = "HEA300";
beam.Material.MaterialString = "S355";

// 插入到模型
beam.Insert();
                        """
                    },
                    "Column": {
                        "description": "柱構件類別",
                        "properties": {
                            "StartPoint": "底部點座標",
                            "EndPoint": "頂部點座標",
                            "Profile": "截面規格",
                            "Material": "材料屬性"
                        },
                        "example": """
using Tekla.Structures.Model;
using Tekla.Structures.Geometry3d;

// 創建柱
Column column = new Column();
column.StartPoint = new Point(0, 0, 0);
column.EndPoint = new Point(0, 0, 3000);
column.Profile.ProfileString = "HEB300";
column.Material.MaterialString = "S355";

// 插入到模型
column.Insert();
                        """
                    },
                    "ContourPlate": {
                        "description": "輪廓板類別",
                        "properties": {
                            "Contour": "輪廓定義",
                            "Profile": "板厚規格",
                            "Material": "材料屬性"
                        },
                        "example": """
using Tekla.Structures.Model;
using Tekla.Structures.Geometry3d;

// 創建輪廓板
ContourPlate plate = new ContourPlate();
Contour contour = new Contour();
contour.AddContourPoint(new ContourPoint(new Point(0, 0, 0), null));
contour.AddContourPoint(new ContourPoint(new Point(1000, 0, 0), null));
contour.AddContourPoint(new ContourPoint(new Point(1000, 1000, 0), null));
contour.AddContourPoint(new ContourPoint(new Point(0, 1000, 0), null));

plate.Contour = contour;
plate.Profile.ProfileString = "PL20";
plate.Material.MaterialString = "S355";

// 插入到模型
plate.Insert();
                        """
                    }
                }
            },
            "Tekla.Structures.Catalogs": {
                "description": "Tekla Structures 目錄管理 API",
                "classes": {
                    "CatalogHandler": {
                        "description": "目錄處理器",
                        "methods": {
                            "GetProfileNames": "獲取截面名稱列表",
                            "GetMaterialNames": "獲取材料名稱列表",
                            "GetBoltCatalogs": "獲取螺栓目錄"
                        },
                        "example": """
using Tekla.Structures.Catalogs;

// 獲取截面目錄
CatalogHandler catalogHandler = new CatalogHandler();
StringList profiles = catalogHandler.GetProfileNames();

foreach (string profile in profiles)
{
    Console.WriteLine($"可用截面: {profile}");
}
                        """
                    }
                }
            },
            "Tekla.Structures.Drawing": {
                "description": "Tekla Structures 圖紙生成 API",
                "classes": {
                    "Drawing": {
                        "description": "圖紙基礎類別",
                        "methods": {
                            "Insert": "插入圖紙",
                            "Modify": "修改圖紙",
                            "Delete": "刪除圖紙"
                        }
                    },
                    "GADrawing": {
                        "description": "總圖類別",
                        "example": """
using Tekla.Structures.Drawing;

// 創建總圖
GADrawing gaDrawing = new GADrawing();
gaDrawing.Name = "總圖-1";
gaDrawing.Title1 = "結構總圖";
gaDrawing.Insert();
                        """
                    }
                }
            }
        }
        
        # 保存 API 文檔
        api_file = self.data_dir / "tekla_api_docs.json"
        async with aiofiles.open(api_file, 'w', encoding='utf-8') as f:
            await f.write(json.dumps(api_docs, ensure_ascii=False, indent=2))
        
        logger.info(f"✅ Tekla API 文檔已創建: {api_file}")
    
    async def _load_documents(self):
        """載入文檔到記憶體"""
        try:
            # 載入 API 文檔
            api_file = self.data_dir / "tekla_api_docs.json"
            if api_file.exists():
                async with aiofiles.open(api_file, 'r', encoding='utf-8') as f:
                    content = await f.read()
                    api_docs = json.loads(content)
                    await self._process_api_docs(api_docs)
            
            # 載入其他文檔檔案
            for file_path in self.data_dir.glob("*.txt"):
                await self._load_text_file(file_path)
            
            for file_path in self.data_dir.glob("*.md"):
                await self._load_markdown_file(file_path)
                
        except Exception as e:
            logger.error(f"載入文檔失敗: {e}")
            raise
    
    async def _process_api_docs(self, api_docs: Dict):
        """處理 API 文檔"""
        for namespace, namespace_data in api_docs.items():
            # 添加命名空間文檔
            self.documents.append({
                "id": f"namespace_{namespace}",
                "type": "namespace",
                "namespace": namespace,
                "title": namespace,
                "content": namespace_data.get("description", ""),
                "metadata": {"source": "api_docs"}
            })
            
            # 處理類別
            classes = namespace_data.get("classes", {})
            for class_name, class_data in classes.items():
                # 添加類別文檔
                content = f"{class_data.get('description', '')}\n\n"
                
                # 添加屬性
                if "properties" in class_data:
                    content += "屬性:\n"
                    for prop, desc in class_data["properties"].items():
                        content += f"- {prop}: {desc}\n"
                    content += "\n"
                
                # 添加方法
                if "methods" in class_data:
                    content += "方法:\n"
                    for method, desc in class_data["methods"].items():
                        content += f"- {method}: {desc}\n"
                    content += "\n"
                
                # 添加範例
                if "example" in class_data:
                    content += f"範例代碼:\n{class_data['example']}"
                
                self.documents.append({
                    "id": f"class_{namespace}_{class_name}",
                    "type": "class",
                    "namespace": namespace,
                    "class_name": class_name,
                    "title": f"{namespace}.{class_name}",
                    "content": content.strip(),
                    "metadata": {"source": "api_docs"}
                })
    
    async def _load_text_file(self, file_path: Path):
        """載入文本檔案"""
        try:
            async with aiofiles.open(file_path, 'r', encoding='utf-8') as f:
                content = await f.read()
                
            # 分割文本
            chunks = self.text_splitter.split_text(content)
            
            for i, chunk in enumerate(chunks):
                self.documents.append({
                    "id": f"file_{file_path.stem}_{i}",
                    "type": "text",
                    "title": file_path.name,
                    "content": chunk,
                    "metadata": {"source": str(file_path)}
                })
                
        except Exception as e:
            logger.error(f"載入文本檔案失敗 {file_path}: {e}")
    
    async def _load_markdown_file(self, file_path: Path):
        """載入 Markdown 檔案"""
        try:
            async with aiofiles.open(file_path, 'r', encoding='utf-8') as f:
                content = await f.read()
                
            # 分割文本
            chunks = self.text_splitter.split_text(content)
            
            for i, chunk in enumerate(chunks):
                self.documents.append({
                    "id": f"md_{file_path.stem}_{i}",
                    "type": "markdown",
                    "title": file_path.name,
                    "content": chunk,
                    "metadata": {"source": str(file_path)}
                })
                
        except Exception as e:
            logger.error(f"載入 Markdown 檔案失敗 {file_path}: {e}")
    
    def get_documents(self) -> List[Dict]:
        """獲取所有文檔"""
        return self.documents
    
    def search_documents(self, query: str, doc_type: Optional[str] = None) -> List[Dict]:
        """搜尋文檔"""
        results = []
        query_lower = query.lower()
        
        for doc in self.documents:
            if doc_type and doc.get("type") != doc_type:
                continue
                
            content_lower = doc["content"].lower()
            title_lower = doc["title"].lower()
            
            if query_lower in content_lower or query_lower in title_lower:
                results.append(doc)
        
        return results
    
    def is_ready(self) -> bool:
        """檢查知識庫是否就緒"""
        return self.is_initialized and len(self.documents) > 0
    
    async def cleanup(self):
        """清理資源"""
        self.documents.clear()
        self.is_initialized = False
        logger.info("Tekla 知識庫已清理")
