"""
RAG (Retrieval-Augmented Generation) 服務
整合向量資料庫和 Tekla 知識庫
"""

import asyncio
import logging
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings
import json

logger = logging.getLogger(__name__)

class RAGService:
    """RAG 服務類別"""
    
    def __init__(
        self, 
        tekla_kb,
        embedding_model_name: str = "all-MiniLM-L6-v2",
        vector_db_path: str = "./data/vectordb",
        collection_name: str = "tekla_knowledge"
    ):
        self.tekla_kb = tekla_kb
        self.embedding_model_name = embedding_model_name
        self.vector_db_path = vector_db_path
        self.collection_name = collection_name
        
        self.embedding_model: Optional[SentenceTransformer] = None
        self.chroma_client: Optional[chromadb.Client] = None
        self.collection: Optional[chromadb.Collection] = None
        self.is_initialized = False
    
    async def initialize(self):
        """初始化 RAG 服務"""
        try:
            logger.info("初始化 RAG 服務...")
            
            # 載入嵌入模型
            logger.info(f"載入嵌入模型: {self.embedding_model_name}")
            self.embedding_model = SentenceTransformer(self.embedding_model_name)
            
            # 初始化 ChromaDB
            logger.info("初始化向量資料庫...")
            self.chroma_client = chromadb.PersistentClient(
                path=self.vector_db_path,
                settings=Settings(
                    anonymized_telemetry=False,
                    allow_reset=True
                )
            )
            
            # 獲取或創建集合
            try:
                self.collection = self.chroma_client.get_collection(
                    name=self.collection_name
                )
                logger.info(f"載入現有集合: {self.collection_name}")
            except Exception:
                self.collection = self.chroma_client.create_collection(
                    name=self.collection_name,
                    metadata={"description": "Tekla Structures 知識庫"}
                )
                logger.info(f"創建新集合: {self.collection_name}")
            
            # 檢查是否需要建立索引
            count = self.collection.count()
            if count == 0:
                logger.info("集合為空，開始建立索引...")
                await self._build_index()
            else:
                logger.info(f"集合已包含 {count} 個文檔")
            
            self.is_initialized = True
            logger.info("✅ RAG 服務初始化完成")
            
        except Exception as e:
            logger.error(f"❌ RAG 服務初始化失敗: {e}")
            raise
    
    async def _build_index(self):
        """建立向量索引"""
        try:
            if not self.tekla_kb or not self.tekla_kb.is_ready():
                logger.warning("Tekla 知識庫未就緒，跳過索引建立")
                return
            
            documents = self.tekla_kb.get_documents()
            if not documents:
                logger.warning("沒有找到文檔，跳過索引建立")
                return
            
            logger.info(f"開始為 {len(documents)} 個文檔建立向量索引...")
            
            # 批次處理文檔
            batch_size = 100
            for i in range(0, len(documents), batch_size):
                batch = documents[i:i + batch_size]
                await self._process_document_batch(batch)
                logger.info(f"已處理 {min(i + batch_size, len(documents))}/{len(documents)} 個文檔")
            
            logger.info("✅ 向量索引建立完成")
            
        except Exception as e:
            logger.error(f"建立向量索引失敗: {e}")
            raise
    
    async def _process_document_batch(self, documents: List[Dict]):
        """處理文檔批次"""
        try:
            # 準備數據
            ids = []
            texts = []
            metadatas = []
            
            for doc in documents:
                ids.append(doc["id"])
                texts.append(doc["content"])
                
                # 準備元數據
                metadata = {
                    "type": doc.get("type", "unknown"),
                    "title": doc.get("title", ""),
                    "source": doc.get("metadata", {}).get("source", ""),
                }
                
                # 添加額外的元數據
                if "namespace" in doc:
                    metadata["namespace"] = doc["namespace"]
                if "class_name" in doc:
                    metadata["class_name"] = doc["class_name"]
                
                metadatas.append(metadata)
            
            # 生成嵌入向量
            embeddings = self.embedding_model.encode(
                texts, 
                convert_to_numpy=True,
                show_progress_bar=False
            )
            
            # 添加到集合
            self.collection.add(
                ids=ids,
                documents=texts,
                metadatas=metadatas,
                embeddings=embeddings.tolist()
            )
            
        except Exception as e:
            logger.error(f"處理文檔批次失敗: {e}")
            raise
    
    async def query(
        self, 
        query: str, 
        top_k: int = 5, 
        threshold: float = 0.7,
        filter_metadata: Optional[Dict] = None
    ) -> List[Dict[str, Any]]:
        """查詢相關文檔"""
        if not self.is_ready():
            logger.warning("RAG 服務未就緒")
            return []
        
        try:
            # 生成查詢向量
            query_embedding = self.embedding_model.encode([query])
            
            # 準備查詢參數
            query_params = {
                "query_embeddings": query_embedding.tolist(),
                "n_results": top_k
            }
            
            # 添加過濾條件
            if filter_metadata:
                query_params["where"] = filter_metadata
            
            # 執行查詢
            results = self.collection.query(**query_params)
            
            # 處理結果
            formatted_results = []
            if results["documents"] and results["documents"][0]:
                for i, (doc, metadata, distance) in enumerate(zip(
                    results["documents"][0],
                    results["metadatas"][0],
                    results["distances"][0]
                )):
                    # 計算相似度分數 (1 - distance)
                    score = 1 - distance
                    
                    # 過濾低分結果
                    if score >= threshold:
                        formatted_results.append({
                            "content": doc,
                            "score": score,
                            "source": metadata.get("source", "unknown"),
                            "type": metadata.get("type", "unknown"),
                            "title": metadata.get("title", ""),
                            "metadata": metadata
                        })
            
            # 按分數排序
            formatted_results.sort(key=lambda x: x["score"], reverse=True)
            
            logger.info(f"查詢 '{query}' 返回 {len(formatted_results)} 個結果")
            return formatted_results
            
        except Exception as e:
            logger.error(f"RAG 查詢失敗: {e}")
            return []
    
    async def query_by_type(
        self, 
        query: str, 
        doc_type: str, 
        top_k: int = 5, 
        threshold: float = 0.7
    ) -> List[Dict[str, Any]]:
        """按文檔類型查詢"""
        return await self.query(
            query=query,
            top_k=top_k,
            threshold=threshold,
            filter_metadata={"type": doc_type}
        )
    
    async def query_tekla_api(
        self, 
        query: str, 
        namespace: Optional[str] = None,
        top_k: int = 3,
        threshold: float = 0.8
    ) -> List[Dict[str, Any]]:
        """查詢 Tekla API 相關文檔"""
        filter_metadata = {"type": {"$in": ["namespace", "class"]}}
        
        if namespace:
            filter_metadata["namespace"] = namespace
        
        return await self.query(
            query=query,
            top_k=top_k,
            threshold=threshold,
            filter_metadata=filter_metadata
        )
    
    async def add_document(
        self, 
        doc_id: str, 
        content: str, 
        metadata: Dict[str, Any]
    ) -> bool:
        """添加新文檔"""
        if not self.is_ready():
            return False
        
        try:
            # 生成嵌入向量
            embedding = self.embedding_model.encode([content])
            
            # 添加到集合
            self.collection.add(
                ids=[doc_id],
                documents=[content],
                metadatas=[metadata],
                embeddings=embedding.tolist()
            )
            
            logger.info(f"已添加文檔: {doc_id}")
            return True
            
        except Exception as e:
            logger.error(f"添加文檔失敗: {e}")
            return False
    
    async def update_document(
        self, 
        doc_id: str, 
        content: str, 
        metadata: Dict[str, Any]
    ) -> bool:
        """更新文檔"""
        if not self.is_ready():
            return False
        
        try:
            # 生成新的嵌入向量
            embedding = self.embedding_model.encode([content])
            
            # 更新集合
            self.collection.update(
                ids=[doc_id],
                documents=[content],
                metadatas=[metadata],
                embeddings=embedding.tolist()
            )
            
            logger.info(f"已更新文檔: {doc_id}")
            return True
            
        except Exception as e:
            logger.error(f"更新文檔失敗: {e}")
            return False
    
    async def delete_document(self, doc_id: str) -> bool:
        """刪除文檔"""
        if not self.is_ready():
            return False
        
        try:
            self.collection.delete(ids=[doc_id])
            logger.info(f"已刪除文檔: {doc_id}")
            return True
            
        except Exception as e:
            logger.error(f"刪除文檔失敗: {e}")
            return False
    
    def get_collection_stats(self) -> Dict[str, Any]:
        """獲取集合統計資訊"""
        if not self.is_ready():
            return {"status": "not_ready"}
        
        try:
            count = self.collection.count()
            return {
                "status": "ready",
                "document_count": count,
                "collection_name": self.collection_name,
                "embedding_model": self.embedding_model_name
            }
        except Exception as e:
            logger.error(f"獲取集合統計失敗: {e}")
            return {"status": "error", "error": str(e)}
    
    def is_ready(self) -> bool:
        """檢查服務是否就緒"""
        return (
            self.is_initialized and
            self.embedding_model is not None and
            self.collection is not None
        )
    
    async def cleanup(self):
        """清理資源"""
        try:
            logger.info("清理 RAG 服務資源...")
            
            if self.embedding_model is not None:
                del self.embedding_model
                self.embedding_model = None
            
            if self.chroma_client is not None:
                # ChromaDB 會自動處理連接關閉
                self.chroma_client = None
                self.collection = None
            
            self.is_initialized = False
            logger.info("✅ RAG 服務資源清理完成")
            
        except Exception as e:
            logger.error(f"清理 RAG 服務時發生錯誤: {e}")
    
    async def rebuild_index(self):
        """重建索引"""
        try:
            logger.info("開始重建 RAG 索引...")
            
            # 清空現有集合
            if self.collection:
                self.chroma_client.delete_collection(self.collection_name)
            
            # 重新創建集合
            self.collection = self.chroma_client.create_collection(
                name=self.collection_name,
                metadata={"description": "Tekla Structures 知識庫"}
            )
            
            # 重建索引
            await self._build_index()
            
            logger.info("✅ RAG 索引重建完成")
            
        except Exception as e:
            logger.error(f"重建 RAG 索引失敗: {e}")
            raise
