import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { teklaApiService, BeamRequest, BeamInfo, ConnectionStatus } from '../../services/teklaApiService';
import { Building, Zap, Database, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface TeklaIntegrationProps {
  className?: string;
}

export function TeklaIntegration({ className }: TeklaIntegrationProps) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [beams, setBeams] = useState<BeamInfo[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [profiles, setProfiles] = useState<string[]>([]);
  const [message, setMessage] = useState<string>('');

  // 檢查連接狀態
  const checkConnection = async () => {
    setIsLoading(true);
    try {
      const result = await teklaApiService.checkConnection();
      if (result.success && result.data) {
        setConnectionStatus(result.data);
        setMessage('連接狀態檢查完成');
      } else {
        setMessage(`連接檢查失敗: ${result.message}`);
      }
    } catch (error) {
      setMessage(`連接檢查錯誤: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 創建示例鋼樑
  const createSampleBeam = async () => {
    setIsLoading(true);
    try {
      const beamData: BeamRequest = {
        startX: 0,
        startY: 0,
        startZ: 0,
        endX: 5000,
        endY: 0,
        endZ: 0,
        profile: 'HEA300',
        material: 'S355',
        class: '1',
        name: '示例樑'
      };

      const result = await teklaApiService.createBeam(beamData);
      if (result.success) {
        setMessage(`樑創建成功! ID: ${result.data?.beamId}`);
        await loadBeams(); // 重新載入樑列表
      } else {
        setMessage(`樑創建失敗: ${result.message}`);
      }
    } catch (error) {
      setMessage(`創建樑錯誤: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 創建標準框架
  const createStandardFrame = async () => {
    setIsLoading(true);
    try {
      const result = await teklaApiService.createStandardFrame(
        10000, // 寬度 10m
        4000,  // 高度 4m
        15000, // 長度 15m
        'HEA300', // 柱截面
        'IPE300', // 樑截面
        'S355'    // 材料
      );

      if (result.success) {
        setMessage(`標準框架創建成功! 共創建 ${result.data?.elementsCreated} 個構件`);
        await loadBeams();
      } else {
        setMessage(`框架創建失敗: ${result.message}`);
      }
    } catch (error) {
      setMessage(`創建框架錯誤: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 載入樑列表
  const loadBeams = async () => {
    try {
      const result = await teklaApiService.getBeams();
      if (result.success && result.data) {
        setBeams(result.data.beams);
        setMessage(`載入了 ${result.data.count} 個樑`);
      }
    } catch (error) {
      setMessage(`載入樑列表錯誤: ${error}`);
    }
  };

  // 載入材料目錄
  const loadMaterials = async () => {
    try {
      const result = await teklaApiService.getMaterials();
      if (result.success && result.data) {
        setMaterials(result.data.materials);
        setMessage(`載入了 ${result.data.count} 種材料`);
      }
    } catch (error) {
      setMessage(`載入材料目錄錯誤: ${error}`);
    }
  };

  // 載入截面目錄
  const loadProfiles = async () => {
    try {
      const result = await teklaApiService.getProfiles();
      if (result.success && result.data) {
        setProfiles(result.data.profiles);
        setMessage(`載入了 ${result.data.count} 種截面`);
      }
    } catch (error) {
      setMessage(`載入截面目錄錯誤: ${error}`);
    }
  };

  // 組件載入時檢查連接
  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 標題 */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          🏗️ Tekla Structures 2025 整合
        </h2>
        <p className="text-gray-600">
          透過 Open API 直接操作 Tekla Structures 模型
        </p>
      </div>

      {/* 連接狀態卡片 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5" />
            連接狀態
          </h3>
          <Button onClick={checkConnection} disabled={isLoading}>
            檢查連接
          </Button>
        </div>
        
        {connectionStatus && (
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            connectionStatus.isConnected 
              ? 'bg-green-50 text-green-800' 
              : 'bg-red-50 text-red-800'
          }`}>
            {connectionStatus.isConnected ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{connectionStatus.message}</span>
          </div>
        )}
      </Card>

      {/* 操作按鈕 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button 
          onClick={createSampleBeam} 
          disabled={isLoading || !connectionStatus?.isConnected}
          className="flex items-center gap-2"
        >
          <Building className="w-4 h-4" />
          創建示例樑
        </Button>
        
        <Button 
          onClick={createStandardFrame} 
          disabled={isLoading || !connectionStatus?.isConnected}
          className="flex items-center gap-2"
        >
          <Building className="w-4 h-4" />
          創建標準框架
        </Button>
        
        <Button 
          onClick={loadMaterials} 
          disabled={isLoading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Database className="w-4 h-4" />
          載入材料目錄
        </Button>
        
        <Button 
          onClick={loadProfiles} 
          disabled={isLoading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          載入截面目錄
        </Button>
      </div>

      {/* 訊息顯示 */}
      {message && (
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <AlertCircle className="w-4 h-4" />
            {message}
          </div>
        </Card>
      )}

      {/* 樑列表 */}
      {beams.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Building className="w-5 h-5" />
            模型中的樑 ({beams.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">名稱</th>
                  <th className="text-left p-2">截面</th>
                  <th className="text-left p-2">材料</th>
                  <th className="text-left p-2">長度 (mm)</th>
                </tr>
              </thead>
              <tbody>
                {beams.slice(0, 10).map((beam) => (
                  <tr key={beam.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{beam.id}</td>
                    <td className="p-2">{beam.name}</td>
                    <td className="p-2">{beam.profile}</td>
                    <td className="p-2">{beam.material}</td>
                    <td className="p-2">{Math.round(beam.length)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {beams.length > 10 && (
              <p className="text-gray-500 text-center mt-2">
                顯示前 10 個，共 {beams.length} 個樑
              </p>
            )}
          </div>
        </Card>
      )}

      {/* 材料和截面目錄 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {materials.length > 0 && (
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">
              材料目錄 ({materials.length})
            </h3>
            <div className="max-h-40 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2 text-sm">
                {materials.slice(0, 20).map((material, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded">
                    {material}
                  </div>
                ))}
              </div>
              {materials.length > 20 && (
                <p className="text-gray-500 text-center mt-2">
                  顯示前 20 個，共 {materials.length} 種材料
                </p>
              )}
            </div>
          </Card>
        )}

        {profiles.length > 0 && (
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">
              截面目錄 ({profiles.length})
            </h3>
            <div className="max-h-40 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2 text-sm">
                {profiles.slice(0, 20).map((profile, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded">
                    {profile}
                  </div>
                ))}
              </div>
              {profiles.length > 20 && (
                <p className="text-gray-500 text-center mt-2">
                  顯示前 20 個，共 {profiles.length} 種截面
                </p>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
