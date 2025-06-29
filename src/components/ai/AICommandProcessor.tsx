import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { 
  Upload, 
  FileImage, 
  Grid3X3, 
  Building, 
  Columns, 
  Layers,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  Eye
} from 'lucide-react';

interface AICommand {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress: number;
  inputType: string;
  outputType: string;
}

interface AICommandProcessorProps {
  className?: string;
}

export function AICommandProcessor({ className }: AICommandProcessorProps) {
  const [commands, setCommands] = useState<AICommand[]>([
    {
      id: 'grid-generation',
      title: '導入建築平面圖並生成格子線',
      description: '自動識別建築圖紙並創建結構格線系統',
      icon: <Grid3X3 className="w-5 h-5" />,
      status: 'idle',
      progress: 0,
      inputType: '建築平面圖 (DWG/PDF)',
      outputType: 'Tekla 格線系統'
    },
    {
      id: 'section-specs',
      title: '導入結構平面圖規格參數表並生成斷面規格參數表',
      description: '解析結構圖紙參數並生成標準化斷面規格表',
      icon: <FileImage className="w-5 h-5" />,
      status: 'idle',
      progress: 0,
      inputType: '結構規格表 (Excel/PDF)',
      outputType: '斷面規格參數表'
    },
    {
      id: 'beam-generation',
      title: '導入結構平面圖表並生成樑位規格選用表，並生成梁',
      description: '自動配置樑構件規格並建立3D樑模型',
      icon: <Building className="w-5 h-5" />,
      status: 'idle',
      progress: 0,
      inputType: '結構平面圖表',
      outputType: '樑位規格表 + 3D樑模型'
    },
    {
      id: 'column-generation',
      title: '導入結構立面圖表並生成柱位規格選用表，並生成柱',
      description: '自動配置柱構件規格並建立3D柱模型',
      icon: <Columns className="w-5 h-5" />,
      status: 'idle',
      progress: 0,
      inputType: '結構立面圖表',
      outputType: '柱位規格表 + 3D柱模型'
    },
    {
      id: 'slab-generation',
      title: '導入結構平面圖表並生成版規格選用表，並生成版',
      description: '自動配置樓版規格並建立3D樓版模型',
      icon: <Layers className="w-5 h-5" />,
      status: 'idle',
      progress: 0,
      inputType: '結構平面圖表',
      outputType: '版規格表 + 3D樓版模型'
    }
  ]);

  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File | null }>({});

  const handleFileUpload = (commandId: string, file: File) => {
    setSelectedFiles(prev => ({
      ...prev,
      [commandId]: file
    }));
  };

  const executeCommand = async (commandId: string) => {
    const file = selectedFiles[commandId];
    if (!file) {
      alert('請先選擇檔案');
      return;
    }

    // 更新命令狀態為處理中
    setCommands(prev => prev.map(cmd => 
      cmd.id === commandId 
        ? { ...cmd, status: 'processing', progress: 0 }
        : cmd
    ));

    // 模擬處理過程
    const steps = [10, 25, 45, 65, 80, 95, 100];
    
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setCommands(prev => prev.map(cmd => 
        cmd.id === commandId 
          ? { ...cmd, progress: step }
          : cmd
      ));
    }

    // 完成處理
    setCommands(prev => prev.map(cmd => 
      cmd.id === commandId 
        ? { ...cmd, status: 'completed', progress: 100 }
        : cmd
    ));
  };

  const resetCommand = (commandId: string) => {
    setCommands(prev => prev.map(cmd => 
      cmd.id === commandId 
        ? { ...cmd, status: 'idle', progress: 0 }
        : cmd
    ));
    
    setSelectedFiles(prev => ({
      ...prev,
      [commandId]: null
    }));
  };

  const getStatusIcon = (status: AICommand['status']) => {
    switch (status) {
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: AICommand['status']) => {
    switch (status) {
      case 'processing':
        return 'border-blue-200 bg-blue-50';
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🤖 AI 智能助手
        </h2>
        <p className="text-gray-600">
          自動化結構建模工作流程，從圖紙到3D模型一鍵完成
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {commands.map((command, index) => (
          <motion.div
            key={command.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`p-6 transition-all ${getStatusColor(command.status)}`}>
              <div className="flex items-start gap-4">
                {/* 圖示 */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    {command.icon}
                  </div>
                </div>

                {/* 內容 */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {command.title}
                    </h3>
                    {getStatusIcon(command.status)}
                  </div>
                  
                  <p className="text-gray-600 mb-4">
                    {command.description}
                  </p>

                  {/* 輸入輸出類型 */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">輸入：</span>
                      <span className="text-gray-900">{command.inputType}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">輸出：</span>
                      <span className="text-gray-900">{command.outputType}</span>
                    </div>
                  </div>

                  {/* 進度條 */}
                  {command.status === 'processing' && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>處理進度</span>
                        <span>{command.progress}%</span>
                      </div>
                      <Progress value={command.progress} className="h-2" />
                    </div>
                  )}

                  {/* 檔案上傳和操作按鈕 */}
                  <div className="flex items-center gap-3">
                    {command.status === 'idle' && (
                      <>
                        <input
                          type="file"
                          id={`file-${command.id}`}
                          className="hidden"
                          accept=".dwg,.pdf,.xlsx,.xls"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(command.id, file);
                          }}
                        />
                        <label htmlFor={`file-${command.id}`}>
                          <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                            <span>
                              <Upload className="w-4 h-4 mr-2" />
                              選擇檔案
                            </span>
                          </Button>
                        </label>
                        
                        {selectedFiles[command.id] && (
                          <span className="text-sm text-gray-600">
                            已選擇：{selectedFiles[command.id]?.name}
                          </span>
                        )}
                        
                        <Button
                          onClick={() => executeCommand(command.id)}
                          disabled={!selectedFiles[command.id]}
                          size="sm"
                        >
                          開始處理
                        </Button>
                      </>
                    )}

                    {command.status === 'processing' && (
                      <div className="text-sm text-blue-600 font-medium">
                        正在處理中...
                      </div>
                    )}

                    {command.status === 'completed' && (
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-green-600 font-medium">
                          處理完成
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          下載結果
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          預覽
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => resetCommand(command.id)}
                        >
                          重新開始
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
