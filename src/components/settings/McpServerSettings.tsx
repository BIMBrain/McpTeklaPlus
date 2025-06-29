import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Trash2, 
  Edit, 
  Play, 
  Square, 
  CheckCircle, 
  XCircle,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { McpServerConfig } from '@/types/settings'
import { cn } from '@/lib/utils'

interface McpServerSettingsProps {
  onSettingsChange: () => void
}

// Sample MCP server configurations
const sampleServers: McpServerConfig[] = [
  {
    id: '1',
    name: 'Tekla MCP Server',
    host: 'localhost',
    port: 8080,
    protocol: 'http',
    timeout: 30000,
    retryAttempts: 3,
    enabled: true,
    status: 'connected',
    lastConnected: new Date()
  },
  {
    id: '2',
    name: 'PowerFab API Server',
    host: '192.168.1.100',
    port: 9090,
    protocol: 'https',
    apiKey: '****-****-****-****',
    timeout: 15000,
    retryAttempts: 2,
    enabled: false,
    status: 'disconnected'
  }
]

export function McpServerSettings({ onSettingsChange }: McpServerSettingsProps) {
  const [servers, setServers] = useState<McpServerConfig[]>(sampleServers)
  const [editingServer, setEditingServer] = useState<string | null>(null)

  const getStatusIcon = (status: McpServerConfig['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'connecting':
        return <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = (status: McpServerConfig['status']) => {
    switch (status) {
      case 'connected':
        return '已連接'
      case 'disconnected':
        return '未連接'
      case 'error':
        return '連接錯誤'
      case 'connecting':
        return '連接中...'
      default:
        return '未知狀態'
    }
  }

  const handleToggleServer = (serverId: string) => {
    setServers(prev => prev.map(server => 
      server.id === serverId 
        ? { ...server, enabled: !server.enabled }
        : server
    ))
    onSettingsChange()
  }

  const handleTestConnection = (serverId: string) => {
    setServers(prev => prev.map(server => 
      server.id === serverId 
        ? { ...server, status: 'connecting' }
        : server
    ))

    // Simulate connection test
    setTimeout(() => {
      setServers(prev => prev.map(server => 
        server.id === serverId 
          ? { 
              ...server, 
              status: Math.random() > 0.3 ? 'connected' : 'error',
              lastConnected: new Date()
            }
          : server
      ))
    }, 2000)
  }

  const handleDeleteServer = (serverId: string) => {
    setServers(prev => prev.filter(server => server.id !== serverId))
    onSettingsChange()
  }

  const handleAddServer = () => {
    const newServer: McpServerConfig = {
      id: Date.now().toString(),
      name: '新 MCP Server',
      host: 'localhost',
      port: 8080,
      protocol: 'http',
      timeout: 30000,
      retryAttempts: 3,
      enabled: false,
      status: 'disconnected'
    }
    setServers(prev => [...prev, newServer])
    setEditingServer(newServer.id)
    onSettingsChange()
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>MCP Server 設定</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                管理 Model Context Protocol 伺服器連接
              </p>
            </div>
            <Button onClick={handleAddServer}>
              <Plus className="h-4 w-4 mr-1" />
              新增伺服器
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Server List */}
      <div className="space-y-3">
        {servers.map((server, index) => (
          <motion.div
            key={server.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={cn(
              "transition-all",
              server.enabled ? "border-primary/20 bg-primary/5" : "border-muted"
            )}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium">{server.name}</h3>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(server.status)}
                        <span className="text-sm text-muted-foreground">
                          {getStatusText(server.status)}
                        </span>
                      </div>
                      <div className={cn(
                        "px-2 py-1 rounded-full text-xs",
                        server.enabled 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      )}>
                        {server.enabled ? '啟用' : '停用'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">地址:</span> {server.protocol}://{server.host}:{server.port}
                      </div>
                      <div>
                        <span className="font-medium">超時:</span> {server.timeout}ms
                      </div>
                      <div>
                        <span className="font-medium">重試次數:</span> {server.retryAttempts}
                      </div>
                      {server.lastConnected && (
                        <div>
                          <span className="font-medium">最後連接:</span> {server.lastConnected.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestConnection(server.id)}
                      disabled={server.status === 'connecting'}
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleServer(server.id)}
                    >
                      {server.enabled ? (
                        <Square className="h-3 w-3" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingServer(server.id)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteServer(server.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {servers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              <p>尚未設定任何 MCP Server</p>
              <p className="text-sm mt-1">點擊「新增伺服器」開始設定</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connection Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">連接統計</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-lg font-semibold">{servers.length}</p>
              <p className="text-xs text-muted-foreground">總伺服器</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-green-600">
                {servers.filter(s => s.status === 'connected').length}
              </p>
              <p className="text-xs text-muted-foreground">已連接</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-blue-600">
                {servers.filter(s => s.enabled).length}
              </p>
              <p className="text-xs text-muted-foreground">已啟用</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-red-600">
                {servers.filter(s => s.status === 'error').length}
              </p>
              <p className="text-xs text-muted-foreground">錯誤</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
