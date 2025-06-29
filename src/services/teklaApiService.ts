/**
 * Tekla API 服務
 * 提供與後端 Tekla API 的通訊功能
 */

const API_BASE_URL = import.meta.env.VITE_TEKLA_API_URL || 'https://localhost:5000/api/tekla';

// 類型定義
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface BeamRequest {
  startX: number;
  startY: number;
  startZ: number;
  endX: number;
  endY: number;
  endZ: number;
  profile: string;
  material: string;
  class?: string;
  name?: string;
  position?: {
    depth: number;
    plane: number;
    rotation: number;
  };
}

export interface BeamInfo {
  id: number;
  profile: string;
  material: string;
  startPoint: Point3D;
  endPoint: Point3D;
  class: string;
  name: string;
  length: number;
}

export interface DrawingRequest {
  name: string;
  layout?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  timestamp?: string;
}

export interface ConnectionStatus {
  isConnected: boolean;
  message: string;
  timestamp: string;
}

class TeklaApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * 發送 HTTP 請求的通用方法
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
      };
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 檢查 Tekla Structures 連接狀態
   */
  async checkConnection(): Promise<ApiResponse<ConnectionStatus>> {
    return this.request<ConnectionStatus>('/connection-status');
  }

  /**
   * 創建鋼樑
   */
  async createBeam(beamData: BeamRequest): Promise<ApiResponse<{ beamId: number; message: string }>> {
    return this.request('/create-beam', {
      method: 'POST',
      body: JSON.stringify(beamData),
    });
  }

  /**
   * 獲取所有樑
   */
  async getBeams(): Promise<ApiResponse<{ beams: BeamInfo[]; count: number }>> {
    return this.request('/beams');
  }

  /**
   * 獲取材料目錄
   */
  async getMaterials(): Promise<ApiResponse<{ materials: string[]; count: number }>> {
    return this.request('/materials');
  }

  /**
   * 獲取截面目錄
   */
  async getProfiles(): Promise<ApiResponse<{ profiles: string[]; count: number }>> {
    return this.request('/profiles');
  }

  /**
   * 創建圖紙
   */
  async createDrawing(drawingData: DrawingRequest): Promise<ApiResponse<{ drawingId: string; name: string }>> {
    return this.request('/create-drawing', {
      method: 'POST',
      body: JSON.stringify(drawingData),
    });
  }

  /**
   * 健康檢查
   */
  async healthCheck(): Promise<ApiResponse<{ status: string; version: string }>> {
    return this.request('/health');
  }

  /**
   * 批量創建樑
   */
  async createMultipleBeams(beams: BeamRequest[]): Promise<ApiResponse<{ results: any[] }>> {
    const results = [];
    
    for (const beam of beams) {
      const result = await this.createBeam(beam);
      results.push(result);
    }

    return {
      success: true,
      data: { results },
      message: `批量創建完成，共處理 ${beams.length} 個樑`,
    };
  }

  /**
   * 創建標準鋼結構框架
   */
  async createStandardFrame(
    width: number,
    height: number,
    length: number,
    columnProfile: string = 'HEA300',
    beamProfile: string = 'IPE300',
    material: string = 'S355'
  ): Promise<ApiResponse<{ message: string; elementsCreated: number }>> {
    const beams: BeamRequest[] = [];

    // 創建柱子
    const columns = [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: 0, y: length },
      { x: width, y: length },
    ];

    columns.forEach((pos, index) => {
      beams.push({
        startX: pos.x,
        startY: pos.y,
        startZ: 0,
        endX: pos.x,
        endY: pos.y,
        endZ: height,
        profile: columnProfile,
        material,
        class: '2',
        name: `柱-${index + 1}`,
      });
    });

    // 創建樑
    const frameBeams = [
      // X 方向樑
      { startX: 0, startY: 0, startZ: height, endX: width, endY: 0, endZ: height },
      { startX: 0, startY: length, startZ: height, endX: width, endY: length, endZ: height },
      // Y 方向樑
      { startX: 0, startY: 0, startZ: height, endX: 0, endY: length, endZ: height },
      { startX: width, startY: 0, startZ: height, endX: width, endY: length, endZ: height },
    ];

    frameBeams.forEach((beam, index) => {
      beams.push({
        startX: beam.startX,
        startY: beam.startY,
        startZ: beam.startZ,
        endX: beam.endX,
        endY: beam.endY,
        endZ: beam.endZ,
        profile: beamProfile,
        material,
        class: '1',
        name: `樑-${index + 1}`,
      });
    });

    const result = await this.createMultipleBeams(beams);
    
    return {
      success: result.success,
      data: {
        message: `標準框架創建完成`,
        elementsCreated: beams.length,
      },
      message: result.message,
    };
  }
}

// 創建單例實例
export const teklaApiService = new TeklaApiService();

// 導出類型和服務
export default TeklaApiService;
export { TeklaApiService };
