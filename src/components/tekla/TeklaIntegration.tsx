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
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* 標題區域 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Building className="w-12 h-12 text-blue-600" />
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Tekla Structures 2025 整合
              </h1>
              <p className="text-gray-600">透過 Open API 直接操作 Tekla Structures 模型</p>
            </div>
          </div>
        </div>

        {/* 連接狀態和快速操作 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* 連接狀態卡片 */}
          <Card className="p-6 glass figma-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                連接狀態
              </h3>
              <Button
                onClick={checkConnection}
                disabled={isLoading}
                size="sm"
                variant="outline"
              >
                檢查連接
              </Button>
            </div>

            {connectionStatus && (
              <div className={`flex items-center gap-2 p-4 rounded-lg border-2 ${
                connectionStatus.isConnected
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                {connectionStatus.isConnected ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <div>
                  <p className="font-medium">{connectionStatus.message}</p>
                  <p className="text-xs opacity-75">
                    {new Date(connectionStatus.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* 快速統計 */}
          <Card className="p-6 glass figma-shadow">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-green-600" />
              模型統計
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">樑數量</span>
                <span className="font-semibold">{beams.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">材料種類</span>
                <span className="font-semibold">{materials.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">截面種類</span>
                <span className="font-semibold">{profiles.length}</span>
              </div>
            </div>
          </Card>

          {/* 快速操作 */}
          <Card className="p-6 glass figma-shadow">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Building className="w-5 h-5 text-purple-600" />
              快速操作
            </h3>
            <div className="space-y-2">
              <Button
                onClick={createSampleBeam}
                disabled={isLoading || !connectionStatus?.isConnected}
                className="w-full justify-start"
                variant="outline"
                size="sm"
              >
                <Building className="w-4 h-4 mr-2" />
                創建示例樑
              </Button>

              <Button
                onClick={createStandardFrame}
                disabled={isLoading || !connectionStatus?.isConnected}
                className="w-full justify-start"
                variant="outline"
                size="sm"
              >
                <Building className="w-4 h-4 mr-2" />
                創建標準框架
              </Button>
            </div>
          </Card>
        </div>

        {/* 目錄管理 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 glass figma-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Database className="w-5 h-5 text-orange-600" />
                材料目錄管理
              </h3>
              <Button
                onClick={loadMaterials}
                disabled={isLoading}
                size="sm"
                variant="outline"
              >
                載入目錄
              </Button>
            </div>
            <p className="text-gray-600 text-sm mb-3">
              管理和瀏覽 Tekla 材料庫
            </p>
            <div className="text-2xl font-bold text-orange-600">
              {materials.length} 種材料
            </div>
          </Card>

          <Card className="p-6 glass figma-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                截面目錄管理
              </h3>
              <Button
                onClick={loadProfiles}
                disabled={isLoading}
                size="sm"
                variant="outline"
              >
                載入目錄
              </Button>
            </div>
            <p className="text-gray-600 text-sm mb-3">
              管理和瀏覽 Tekla 截面庫
            </p>
            <div className="text-2xl font-bold text-indigo-600">
              {profiles.length} 種截面
            </div>
          </Card>
        </div>

        {/* 訊息顯示 */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="p-4 border-l-4 border-l-blue-500 bg-blue-50">
              <div className="flex items-center gap-2 text-blue-800">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">{message}</span>
              </div>
            </Card>
          </motion.div>
        )}

        {/* 樑列表 */}
        {beams.length > 0 && (
          <Card className="p-6 glass figma-shadow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Building className="w-6 h-6 text-blue-600" />
                模型中的樑
              </h3>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {beams.length} 個構件
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-3 font-semibold text-gray-700">ID</th>
                    <th className="text-left p-3 font-semibold text-gray-700">名稱</th>
                    <th className="text-left p-3 font-semibold text-gray-700">截面</th>
                    <th className="text-left p-3 font-semibold text-gray-700">材料</th>
                    <th className="text-left p-3 font-semibold text-gray-700">長度 (mm)</th>
                  </tr>
                </thead>
                <tbody>
                  {beams.slice(0, 10).map((beam, index) => (
                    <motion.tr
                      key={beam.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-100 hover:bg-blue-50 transition-colors"
                    >
                      <td className="p-3">
                        <span className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {beam.id}
                        </span>
                      </td>
                      <td className="p-3 font-medium">{beam.name}</td>
                      <td className="p-3">
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
                          {beam.profile}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                          {beam.material}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-gray-600">
                        {Math.round(beam.length).toLocaleString()}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {beams.length > 10 && (
                <div className="mt-4 text-center">
                  <p className="text-gray-500 text-sm">
                    顯示前 10 個構件，共 {beams.length} 個樑
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    查看全部
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* 材料和截面目錄詳細顯示 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {materials.length > 0 && (
            <Card className="p-6 glass figma-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Database className="w-5 h-5 text-orange-600" />
                  材料目錄
                </h3>
                <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                  {materials.length} 種
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto">
                <div className="grid grid-cols-1 gap-2">
                  {materials.slice(0, 20).map((material, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                    >
                      <span className="font-medium text-orange-800">{material}</span>
                    </motion.div>
                  ))}
                </div>

                {materials.length > 20 && (
                  <div className="mt-4 text-center">
                    <p className="text-gray-500 text-sm mb-2">
                      顯示前 20 種，共 {materials.length} 種材料
                    </p>
                    <Button variant="outline" size="sm">
                      查看全部材料
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}

          {profiles.length > 0 && (
            <Card className="p-6 glass figma-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  截面目錄
                </h3>
                <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                  {profiles.length} 種
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto">
                <div className="grid grid-cols-1 gap-2">
                  {profiles.slice(0, 20).map((profile, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      <span className="font-medium text-indigo-800">{profile}</span>
                    </motion.div>
                  ))}
                </div>

                {profiles.length > 20 && (
                  <div className="mt-4 text-center">
                    <p className="text-gray-500 text-sm mb-2">
                      顯示前 20 種，共 {profiles.length} 種截面
                    </p>
                    <Button variant="outline" size="sm">
                      查看全部截面
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
