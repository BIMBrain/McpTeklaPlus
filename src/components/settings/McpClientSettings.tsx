import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Edit, Key, Globe, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { McpClientConfig } from '@/types/settings'
import { cn } from '@/lib/utils'

interface McpClientSettingsProps {
  onSettingsChange: () => void
}

const sampleClients: McpClientConfig[] = [
  {
    id: '1',
    name: 'Primary MCP Client',
    serverUrl: 'http://localhost:8080',
    authentication: {
      type: 'apikey',
      credentials: { apiKey: 'sk-****-****-****' }
    },
    requestTimeout: 30000,
    maxRetries: 3,
    enabled: true
  },
  {
    id: '2',
    name: 'Backup MCP Client',
    serverUrl: 'https://backup.example.com:9090',
    authentication: {
      type: 'basic',
      credentials: { username: 'admin', password: '****' }
    },
    requestTimeout: 15000,
    maxRetries: 2,
    enabled: false
  }
]

export function McpClientSettings({ onSettingsChange }: McpClientSettingsProps) {
  const [clients, setClients] = useState<McpClientConfig[]>(sampleClients)

  const getAuthIcon = (type: McpClientConfig['authentication']['type']) => {
    switch (type) {
      case 'apikey':
        return <Key className="h-4 w-4 text-blue-500" />
      case 'oauth':
        return <Globe className="h-4 w-4 text-green-500" />
      case 'basic':
        return <Key className="h-4 w-4 text-orange-500" />
      default:
        return <Globe className="h-4 w-4 text-gray-500" />
    }
  }

  const getAuthLabel = (type: McpClientConfig['authentication']['type']) => {
    switch (type) {
      case 'apikey':
        return 'API Key'
      case 'oauth':
        return 'OAuth'
      case 'basic':
        return 'Basic Auth'
      default:
        return '無認證'
    }
  }

  const handleToggleClient = (clientId: string) => {
    setClients(prev => prev.map(client => 
      client.id === clientId 
        ? { ...client, enabled: !client.enabled }
        : client
    ))
    onSettingsChange()
  }

  const handleDeleteClient = (clientId: string) => {
    setClients(prev => prev.filter(client => client.id !== clientId))
    onSettingsChange()
  }

  const handleAddClient = () => {
    const newClient: McpClientConfig = {
      id: Date.now().toString(),
      name: '新 MCP Client',
      serverUrl: 'http://localhost:8080',
      authentication: { type: 'none' },
      requestTimeout: 30000,
      maxRetries: 3,
      enabled: false
    }
    setClients(prev => [...prev, newClient])
    onSettingsChange()
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>MCP Client 設定</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                配置 MCP 客戶端連接參數
              </p>
            </div>
            <Button onClick={handleAddClient}>
              <Plus className="h-4 w-4 mr-1" />
              新增客戶端
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-3">
        {clients.map((client, index) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={cn(
              "transition-all",
              client.enabled ? "border-primary/20 bg-primary/5" : "border-muted"
            )}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium">{client.name}</h3>
                      <div className={cn(
                        "px-2 py-1 rounded-full text-xs",
                        client.enabled 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      )}>
                        {client.enabled ? '啟用' : '停用'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">伺服器 URL:</span> {client.serverUrl}
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">認證:</span>
                        {getAuthIcon(client.authentication.type)}
                        <span>{getAuthLabel(client.authentication.type)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span className="font-medium">超時:</span> {client.requestTimeout}ms
                      </div>
                      <div>
                        <span className="font-medium">最大重試:</span> {client.maxRetries} 次
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleClient(client.id)}
                    >
                      {client.enabled ? '停用' : '啟用'}
                    </Button>
                    
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClient(client.id)}
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

      {clients.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              <p>尚未設定任何 MCP Client</p>
              <p className="text-sm mt-1">點擊「新增客戶端」開始設定</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
