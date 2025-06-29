#!/usr/bin/env python3
"""
快速連接測試腳本
"""

import requests
import json
import time

def test_connection():
    """測試連接"""
    print("🔍 測試 MCP Tekla+ 系統連接...")
    
    base_url = "http://localhost:8001"
    
    # 測試健康檢查
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ 健康檢查通過")
            data = response.json()
            print(f"   狀態: {data['status']}")
            print(f"   版本: {data['version']}")
        else:
            print(f"❌ 健康檢查失敗: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 無法連接到伺服器: {e}")
        return False
    
    # 測試聊天 API
    try:
        chat_data = {
            "message": "創建一個樑",
            "use_rag": True,
            "temperature": 0.7
        }
        response = requests.post(f"{base_url}/api/chat", json=chat_data, timeout=10)
        if response.status_code == 200:
            print("✅ 聊天 API 測試通過")
            data = response.json()
            print(f"   模型: {data['model']}")
            print(f"   RAG 啟用: {data['rag_enabled']}")
        else:
            print(f"❌ 聊天 API 測試失敗: {response.status_code}")
    except Exception as e:
        print(f"❌ 聊天 API 測試錯誤: {e}")
    
    # 測試 RAG API
    try:
        rag_data = {
            "query": "Tekla beam creation",
            "top_k": 3
        }
        response = requests.post(f"{base_url}/api/rag/query", json=rag_data, timeout=10)
        if response.status_code == 200:
            print("✅ RAG API 測試通過")
            data = response.json()
            print(f"   結果數量: {data['count']}")
        else:
            print(f"❌ RAG API 測試失敗: {response.status_code}")
    except Exception as e:
        print(f"❌ RAG API 測試錯誤: {e}")
    
    # 測試 Tekla 命令 API
    try:
        tekla_data = {
            "command": "create beam",
            "parameters": {
                "profile": "HEA300",
                "material": "S355"
            }
        }
        response = requests.post(f"{base_url}/api/tekla/command", json=tekla_data, timeout=10)
        if response.status_code == 200:
            print("✅ Tekla 命令 API 測試通過")
            data = response.json()
            print(f"   命令: {data['command']}")
            print(f"   代碼長度: {len(data['generated_code'])} 字符")
        else:
            print(f"❌ Tekla 命令 API 測試失敗: {response.status_code}")
    except Exception as e:
        print(f"❌ Tekla 命令 API 測試錯誤: {e}")
    
    # 測試 GPU 狀態 API
    try:
        response = requests.get(f"{base_url}/api/gpu/status", timeout=5)
        if response.status_code == 200:
            print("✅ GPU 狀態 API 測試通過")
            data = response.json()
            print(f"   GPU 數量: {data['count']}")
            print(f"   CPU 使用率: {data['cpu']['usage_percent']}%")
        else:
            print(f"❌ GPU 狀態 API 測試失敗: {response.status_code}")
    except Exception as e:
        print(f"❌ GPU 狀態 API 測試錯誤: {e}")
    
    print("\n🎉 所有 API 測試完成！")
    print("📱 前端地址: http://localhost:5173")
    print("🖥️ 後端地址: http://localhost:8001")
    print("📊 健康檢查: http://localhost:8001/health")
    
    return True

if __name__ == "__main__":
    test_connection()
