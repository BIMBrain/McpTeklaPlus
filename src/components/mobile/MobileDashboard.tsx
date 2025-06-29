import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { AICommandProcessor } from '../ai/AICommandProcessor';
import {
  Building,
  Database,
  FileText,
  Wrench,
  Zap,
  Bot,
  Monitor,
  Circle,
  ChevronRight,
  ArrowUp
} from 'lucide-react';

interface MobileDashboardProps {
  className?: string;
}

interface TeklaModule {
  name: string;
  version: string;
  description: string;
  color: string;
}

interface AICommand {
  id: string;
  title: string;
  description: string;
}

interface SystemMetric {
  name: string;
  value: number;
  color: string;
  unit: string;
}

export function MobileDashboard({ className }: MobileDashboardProps) {
  const [currentView, setCurrentView] = useState<'dashboard' | 'ai-commands'>('dashboard');
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
    { name: 'GPU', value: 70, color: '#3871F3', unit: '%' },
    { name: 'CPU', value: 40, color: '#27C27B', unit: '%' },
    { name: '記憶體', value: 85, color: '#FAAD14', unit: '%' }
  ]);

  const teklaModules: TeklaModule[] = [
    {
      name: 'Tekla.Structures.Model',
      version: '2025.0.0',
      description: '3D模型操作',
      color: '#3871F3'
    },
    {
      name: 'Tekla.Structures.Catalogs',
      version: '2025.0.0',
      description: '目錄管理',
      color: '#3871F3'
    },
    {
      name: 'Tekla.Structures.Dialog',
      version: '2025.0.0',
      description: '對話框',
      color: '#3871F3'
    },
    {
      name: 'Tekla.Structures.Drawing',
      version: '2025.0.0',
      description: '圖紙生成',
      color: '#3871F3'
    },
    {
      name: 'Tekla.Application.Library',
      version: '2025.0.0',
      description: '整合庫',
      color: '#3871F3'
    }
  ];

  const aiCommands: AICommand[] = [
    {
      id: '1',
      title: '導入建築平面圖並生成格子線',
      description: '自動識別建築圖紙並創建結構格線'
    },
    {
      id: '2',
      title: '導入結構平面圖規格參數表並生成斷面規格參數表',
      description: '解析結構圖紙參數並生成標準化表格'
    },
    {
      id: '3',
      title: '導入結構平面圖表並生成樑位規格選用表，並生成梁',
      description: '自動配置樑構件規格並建立3D模型'
    },
    {
      id: '4',
      title: '導入結構立面圖表並生成柱位規格選用表，並生成柱',
      description: '自動配置柱構件規格並建立3D模型'
    },
    {
      id: '5',
      title: '導入結構平面圖表並生成版規格選用表，並生成版',
      description: '自動配置樓版規格並建立3D模型'
    }
  ];

  // 模擬系統監控數據更新
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics(prev => prev.map(metric => ({
        ...metric,
        value: Math.max(10, Math.min(95, metric.value + (Math.random() - 0.5) * 10))
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (currentView === 'ai-commands') {
    return (
      <div className={`min-h-screen bg-gray-50 ${className}`}>
        {/* 返回按鈕 */}
        <div className="sticky top-0 bg-gray-50 p-4 border-b border-gray-200 z-10">
          <Button
            variant="ghost"
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowUp className="w-4 h-4 rotate-180" />
            返回儀表板
          </Button>
        </div>

        <div className="p-4">
          <AICommandProcessor />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 p-4 ${className}`}>
      <div className="max-w-sm mx-auto space-y-5">
        
        {/* 指令庫區塊 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-5 bg-white shadow-sm border-0">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📚</span>
              <h2 className="text-lg font-bold text-gray-900">指令庫</h2>
            </div>
            
            <div className="space-y-2">
              {teklaModules.map((module, index) => (
                <motion.div
                  key={module.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 bg-blue-50 rounded-lg border border-blue-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-blue-600">
                          {module.name}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {module.version}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {module.description}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* 智能助手區塊 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-5 bg-white shadow-sm border-0">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🤖</span>
              <h2 className="text-lg font-bold text-gray-900">智能助手</h2>
            </div>
            
            <div className="space-y-2">
              {aiCommands.map((command, index) => (
                <motion.div
                  key={command.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentView('ai-commands')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 leading-tight">
                        {command.title}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* 系統監控區塊 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="p-5 bg-white shadow-sm border-0">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🖥️</span>
              <h2 className="text-lg font-bold text-gray-900">系統監控</h2>
            </div>
            
            <div className="space-y-4">
              {systemMetrics.map((metric, index) => (
                <motion.div
                  key={metric.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-sm text-gray-600 w-12 flex-shrink-0">
                    {metric.name}
                  </span>
                  
                  <div className="flex-1 relative">
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: metric.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.value}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      />
                    </div>
                  </div>
                  
                  <span 
                    className="text-sm font-medium w-10 text-right"
                    style={{ color: metric.color }}
                  >
                    {Math.round(metric.value)}{metric.unit}
                  </span>
                </motion.div>
              ))}
              
              {/* 狀態指示器 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Circle className="w-3 h-3 fill-green-500 text-green-500" />
                </motion.div>
                <span className="text-sm text-gray-900">狀態：運作中</span>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
