import React from 'react'
import { motion } from 'framer-motion'
import { 
  Cpu, 
  MemoryStick, 
  HardDrive, 
  Wifi, 
  Thermometer,
  Zap,
  Activity,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSystemMetrics } from '@/hooks/useSystemMetrics'
import { ProgressBar } from './ProgressBar'
import { MetricChart } from './MetricChart'
import { ProcessList } from './ProcessList'
import { cn } from '@/lib/utils'

interface SystemMonitorProps {
  className?: string
}

export function SystemMonitor({ className }: SystemMonitorProps) {
  const { metrics, history, isConnected, formatBytes, formatSpeed, refresh } = useSystemMetrics(2000)

  if (!metrics) {
    return (
      <div className={cn("flex items-center justify-center h-64", className)}>
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">載入系統資訊中...</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (usage: number) => {
    if (usage < 50) return 'text-green-600'
    if (usage < 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getProgressColor = (usage: number) => {
    if (usage < 50) return 'bg-green-500'
    if (usage < 80) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">系統監控</h2>
        <div className="flex items-center space-x-2">
          <div className={cn(
            "flex items-center space-x-1 text-sm",
            isConnected ? "text-green-600" : "text-red-600"
          )}>
            <div className={cn(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-green-500" : "bg-red-500"
            )} />
            <span>{isConnected ? '已連接' : '連接中斷'}</span>
          </div>
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <Cpu className="h-4 w-4 text-blue-500" />
                <CardTitle className="text-sm">CPU</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {Math.round(metrics.cpu.usage)}%
                  </span>
                  <span className={cn("text-sm", getStatusColor(metrics.cpu.usage))}>
                    {metrics.cpu.cores} 核心
                  </span>
                </div>
                <ProgressBar 
                  value={metrics.cpu.usage} 
                  className={getProgressColor(metrics.cpu.usage)}
                />
                <div className="text-xs text-muted-foreground">
                  <div>頻率: {Math.round(metrics.cpu.frequency)} MHz</div>
                  <div>溫度: {Math.round(metrics.cpu.temperature)}°C</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Memory */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <MemoryStick className="h-4 w-4 text-green-500" />
                <CardTitle className="text-sm">記憶體</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {Math.round(metrics.memory.usage)}%
                  </span>
                  <span className={cn("text-sm", getStatusColor(metrics.memory.usage))}>
                    {formatBytes(metrics.memory.used)}
                  </span>
                </div>
                <ProgressBar 
                  value={metrics.memory.usage} 
                  className={getProgressColor(metrics.memory.usage)}
                />
                <div className="text-xs text-muted-foreground">
                  <div>總計: {formatBytes(metrics.memory.total)}</div>
                  <div>可用: {formatBytes(metrics.memory.available)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* GPU */}
        {metrics.gpu && metrics.gpu.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-purple-500" />
                  <CardTitle className="text-sm">GPU</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {Math.round(metrics.gpu[0].usage)}%
                    </span>
                    <span className={cn("text-sm", getStatusColor(metrics.gpu[0].usage))}>
                      {Math.round(metrics.gpu[0].powerDraw)}W
                    </span>
                  </div>
                  <ProgressBar 
                    value={metrics.gpu[0].usage} 
                    className={getProgressColor(metrics.gpu[0].usage)}
                  />
                  <div className="text-xs text-muted-foreground">
                    <div>記憶體: {formatBytes(metrics.gpu[0].memory.used)}</div>
                    <div>溫度: {Math.round(metrics.gpu[0].temperature)}°C</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Network */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <Wifi className="h-4 w-4 text-orange-500" />
                <CardTitle className="text-sm">網路</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>下載:</span>
                    <span className="font-medium">
                      {formatSpeed(metrics.network.downloadSpeed)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>上傳:</span>
                    <span className="font-medium">
                      {formatSpeed(metrics.network.uploadSpeed)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>封包:</span>
                    <span className="font-medium">
                      {metrics.network.packetsReceived.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MetricChart
          title="CPU & 記憶體使用率"
          data={[
            { name: 'CPU', data: history.cpu, color: '#3b82f6' },
            { name: '記憶體', data: history.memory, color: '#10b981' }
          ]}
          timestamps={history.timestamps}
        />
        
        {metrics.gpu && metrics.gpu.length > 0 && (
          <MetricChart
            title="GPU 使用率"
            data={[
              { name: 'GPU', data: history.gpu[0] || [], color: '#8b5cf6' }
            ]}
            timestamps={history.timestamps}
          />
        )}
      </div>

      {/* Process List */}
      <ProcessList processes={metrics.processes} formatBytes={formatBytes} />
    </div>
  )
}
