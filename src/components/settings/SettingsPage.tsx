import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Settings, 
  Server, 
  Cpu, 
  Brain, 
  Wrench,
  Palette,
  Bell,
  Shield,
  Save,
  RotateCcw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { McpServerSettings } from './McpServerSettings'
import { McpClientSettings } from './McpClientSettings'
import { LlmSettings } from './LlmSettings'
import { LmStudioSettings } from './LmStudioSettings'
import { TeklaSettings } from './TeklaSettings'
import { AppearanceSettings } from './AppearanceSettings'
import { NotificationSettings } from './NotificationSettings'
import { SecuritySettings } from './SecuritySettings'
import { cn } from '@/lib/utils'

interface SettingsPageProps {
  className?: string
}

type SettingsTab = 
  | 'mcp-server' 
  | 'mcp-client' 
  | 'llm' 
  | 'lm-studio' 
  | 'tekla' 
  | 'appearance' 
  | 'notifications' 
  | 'security'

const settingsTabs = [
  { 
    id: 'mcp-server', 
    label: 'MCP Server', 
    icon: Server, 
    description: 'MCP 伺服器連接設定' 
  },
  { 
    id: 'mcp-client', 
    label: 'MCP Client', 
    icon: Cpu, 
    description: 'MCP 客戶端配置' 
  },
  { 
    id: 'llm', 
    label: 'LLM 模型', 
    icon: Brain, 
    description: '大語言模型設定' 
  },
  { 
    id: 'lm-studio', 
    label: 'LM Studio', 
    icon: Cpu, 
    description: '本地模型服務設定' 
  },
  { 
    id: 'tekla', 
    label: 'Tekla 整合', 
    icon: Wrench, 
    description: 'Tekla Structures 連接設定' 
  },
  { 
    id: 'appearance', 
    label: '外觀設定', 
    icon: Palette, 
    description: '主題與介面設定' 
  },
  { 
    id: 'notifications', 
    label: '通知設定', 
    icon: Bell, 
    description: '通知與提醒設定' 
  },
  { 
    id: 'security', 
    label: '安全設定', 
    icon: Shield, 
    description: '安全與隱私設定' 
  }
] as const

export function SettingsPage({ className }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('mcp-server')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving settings...')
    setHasUnsavedChanges(false)
  }

  const handleReset = () => {
    // TODO: Implement reset functionality
    console.log('Resetting settings...')
    setHasUnsavedChanges(false)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'mcp-server':
        return <McpServerSettings onSettingsChange={() => setHasUnsavedChanges(true)} />
      case 'mcp-client':
        return <McpClientSettings onSettingsChange={() => setHasUnsavedChanges(true)} />
      case 'llm':
        return <LlmSettings onSettingsChange={() => setHasUnsavedChanges(true)} />
      case 'lm-studio':
        return <LmStudioSettings onSettingsChange={() => setHasUnsavedChanges(true)} />
      case 'tekla':
        return <TeklaSettings onSettingsChange={() => setHasUnsavedChanges(true)} />
      case 'appearance':
        return <AppearanceSettings onSettingsChange={() => setHasUnsavedChanges(true)} />
      case 'notifications':
        return <NotificationSettings onSettingsChange={() => setHasUnsavedChanges(true)} />
      case 'security':
        return <SecuritySettings onSettingsChange={() => setHasUnsavedChanges(true)} />
      default:
        return null
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <h2 className="text-lg font-semibold">系統設定</h2>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {hasUnsavedChanges && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center space-x-2"
            >
              <span className="text-sm text-orange-600">有未儲存的變更</span>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-3 w-3 mr-1" />
                重置
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-3 w-3 mr-1" />
                儲存
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">設定分類</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {settingsTabs.map((tab, index) => (
                <motion.div
                  key={tab.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Button
                    variant={activeTab === tab.id ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start h-auto p-3",
                      activeTab === tab.id && "bg-primary/10 text-primary border-r-2 border-primary"
                    )}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <tab.icon className="h-4 w-4 flex-shrink-0" />
                      <div className="flex flex-col items-start text-left">
                        <span className="text-sm font-medium">{tab.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {tab.description}
                        </span>
                      </div>
                    </div>
                  </Button>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
