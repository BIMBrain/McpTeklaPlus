import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MobileDashboard } from '../mobile/MobileDashboard';
import { TeklaIntegration } from '../tekla/TeklaIntegration';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { 
  Monitor, 
  Smartphone, 
  Tablet,
  RotateCcw,
  Settings,
  Bell,
  User
} from 'lucide-react';

interface ResponsiveDashboardProps {
  className?: string;
}

type ViewMode = 'mobile' | 'desktop' | 'auto';

export function ResponsiveDashboard({ className }: ResponsiveDashboardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('auto');
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // 檢測螢幕尺寸
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // 監聽網路狀態
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 決定顯示模式
  const getDisplayMode = (): 'mobile' | 'desktop' => {
    if (viewMode === 'auto') {
      return screenSize === 'mobile' ? 'mobile' : 'desktop';
    }
    return viewMode === 'mobile' ? 'mobile' : 'desktop';
  };

  const displayMode = getDisplayMode();

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* 頂部控制欄 - 僅在桌面模式顯示 */}
      {displayMode === 'desktop' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-b border-gray-200 px-6 py-3"
        >
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">
                MCP Tekla+ Dashboard
              </h1>
              
              {/* 螢幕尺寸指示器 */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {screenSize === 'mobile' && <Smartphone className="w-4 h-4" />}
                {screenSize === 'tablet' && <Tablet className="w-4 h-4" />}
                {screenSize === 'desktop' && <Monitor className="w-4 h-4" />}
                <span className="capitalize">{screenSize}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* 網路狀態 */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="text-sm text-gray-600">
                  {isOnline ? '線上' : '離線'}
                </span>
              </div>

              {/* 視圖模式切換 */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <Button
                  size="sm"
                  variant={viewMode === 'mobile' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('mobile')}
                  className="h-8 px-3"
                >
                  <Smartphone className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'desktop' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('desktop')}
                  className="h-8 px-3"
                >
                  <Monitor className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'auto' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('auto')}
                  className="h-8 px-3"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              {/* 其他控制項 */}
              <Button size="sm" variant="ghost">
                <Bell className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost">
                <Settings className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost">
                <User className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 主要內容區域 */}
      <div className="relative">
        {displayMode === 'mobile' ? (
          <motion.div
            key="mobile"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <MobileDashboard />
          </motion.div>
        ) : (
          <motion.div
            key="desktop"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            <div className="max-w-7xl mx-auto">
              <TeklaIntegration />
            </div>
          </motion.div>
        )}

        {/* 模式切換提示 - 僅在手動切換時顯示 */}
        {viewMode !== 'auto' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <Card className="p-3 bg-blue-600 text-white border-0 shadow-lg">
              <div className="flex items-center gap-2 text-sm">
                {displayMode === 'mobile' ? (
                  <Smartphone className="w-4 h-4" />
                ) : (
                  <Monitor className="w-4 h-4" />
                )}
                <span>
                  {displayMode === 'mobile' ? '移動端模式' : '桌面端模式'}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setViewMode('auto')}
                  className="h-6 px-2 text-white hover:bg-blue-700"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* 離線提示 */}
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-3 text-center"
        >
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-sm font-medium">
              網路連線中斷，部分功能可能無法使用
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
