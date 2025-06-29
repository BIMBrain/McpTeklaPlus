/**
 * MCP 客戶端服務
 * 處理與 MCP 伺服器的通訊
 */

export interface MCPConnectionStatus {
  isConnected: boolean;
  serverAddress?: string;
  connectedSince?: Date;
  lastPing?: Date;
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  context?: string;
}

export interface ChatRequest {
  message: string;
  context?: string;
  useRAG?: boolean;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponse {
  response: string;
  contextUsed: boolean;
  ragEnabled: boolean;
  timestamp: Date;
}

export interface RAGQueryRequest {
  query: string;
  topK?: number;
  threshold?: number;
}

export interface RAGResult {
  content: string;
  score: number;
  source: string;
  metadata?: Record<string, any>;
}

export interface TeklaCommandRequest {
  command: string;
  parameters?: Record<string, any>;
  context?: string;
}

export interface TeklaCommandResponse {
  command: string;
  parameters?: Record<string, any>;
  generatedCode: string;
  contextUsed: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  timestamp?: string;
}

class MCPClientService {
  private baseUrl: string;
  private websocket: WebSocket | null = null;
  private connectionStatus: MCPConnectionStatus = { isConnected: false };
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.baseUrl = import.meta.env.VITE_MCP_SERVER_URL || 'http://localhost:8000';
    this.initializeWebSocket();
  }

  /**
   * 初始化 WebSocket 連接
   */
  private initializeWebSocket() {
    try {
      const wsUrl = this.baseUrl.replace('http', 'ws') + '/ws';
      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = () => {
        console.log('🔗 MCP WebSocket 連接已建立');
        this.connectionStatus = {
          isConnected: true,
          serverAddress: this.baseUrl,
          connectedSince: new Date(),
          lastPing: new Date()
        };
        this.reconnectAttempts = 0;
        this.emit('connectionStatusChanged', this.connectionStatus);
      };

      this.websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('WebSocket 訊息解析錯誤:', error);
        }
      };

      this.websocket.onclose = () => {
        console.log('🔌 MCP WebSocket 連接已關閉');
        this.connectionStatus = { isConnected: false };
        this.emit('connectionStatusChanged', this.connectionStatus);
        this.scheduleReconnect();
      };

      this.websocket.onerror = (error) => {
        console.error('WebSocket 錯誤:', error);
        this.connectionStatus = { 
          isConnected: false, 
          error: 'WebSocket 連接錯誤' 
        };
        this.emit('connectionStatusChanged', this.connectionStatus);
      };

    } catch (error) {
      console.error('初始化 WebSocket 失敗:', error);
    }
  }

  /**
   * 處理 WebSocket 訊息
   */
  private handleWebSocketMessage(data: any) {
    switch (data.type) {
      case 'pong':
        this.connectionStatus.lastPing = new Date();
        break;
      case 'chat_response':
        this.emit('chatResponse', data);
        break;
      case 'gpu_status':
        this.emit('gpuStatus', data.data);
        break;
      case 'system_status':
        this.emit('systemStatus', data.data);
        break;
      default:
        console.log('未知的 WebSocket 訊息類型:', data.type);
    }
  }

  /**
   * 排程重新連接
   */
  private scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`🔄 ${delay}ms 後嘗試重新連接 (第 ${this.reconnectAttempts} 次)`);
      
      setTimeout(() => {
        this.initializeWebSocket();
      }, delay);
    } else {
      console.error('❌ 達到最大重連次數，停止重連');
    }
  }

  /**
   * 發送 HTTP 請求
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
        message: 'Request successful',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`MCP API 請求失敗: ${endpoint}`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 發送 WebSocket 訊息
   */
  private sendWebSocketMessage(message: any) {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket 未連接，無法發送訊息');
    }
  }

  /**
   * 事件監聽器管理
   */
  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  /**
   * 獲取連接狀態
   */
  getConnectionStatus(): MCPConnectionStatus {
    return { ...this.connectionStatus };
  }

  /**
   * 檢查連接狀態
   */
  async checkConnection(): Promise<ApiResponse<MCPConnectionStatus>> {
    const result = await this.request<any>('/health');
    if (result.success) {
      this.connectionStatus.isConnected = true;
      this.connectionStatus.lastPing = new Date();
    }
    return {
      ...result,
      data: this.connectionStatus
    };
  }

  /**
   * 發送聊天訊息
   */
  async sendChatMessage(request: ChatRequest): Promise<ApiResponse<ChatResponse>> {
    return this.request<ChatResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: request.message,
        context: request.context,
        use_rag: request.useRAG ?? true,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 2048
      })
    });
  }

  /**
   * RAG 查詢
   */
  async queryRAG(request: RAGQueryRequest): Promise<ApiResponse<{ results: RAGResult[]; count: number }>> {
    return this.request('/api/rag/query', {
      method: 'POST',
      body: JSON.stringify({
        query: request.query,
        top_k: request.topK ?? 5,
        threshold: request.threshold ?? 0.7
      })
    });
  }

  /**
   * Tekla 命令處理
   */
  async processTeklaCommand(request: TeklaCommandRequest): Promise<ApiResponse<TeklaCommandResponse>> {
    return this.request('/api/tekla/command', {
      method: 'POST',
      body: JSON.stringify({
        command: request.command,
        parameters: request.parameters,
        context: request.context
      })
    });
  }

  /**
   * 獲取 GPU 狀態
   */
  async getGPUStatus(): Promise<ApiResponse<any>> {
    return this.request('/api/gpu/status');
  }

  /**
   * 發送 ping
   */
  ping() {
    this.sendWebSocketMessage({ type: 'ping' });
  }

  /**
   * 手動重新連接
   */
  async reconnect() {
    if (this.websocket) {
      this.websocket.close();
    }
    this.reconnectAttempts = 0;
    this.initializeWebSocket();
  }

  /**
   * 關閉連接
   */
  disconnect() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    this.connectionStatus = { isConnected: false };
  }
}

// 創建單例實例
export const mcpClientService = new MCPClientService();
export default mcpClientService;
