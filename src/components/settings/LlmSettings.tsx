import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Edit, Star, Brain, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LlmConfig } from '@/types/settings'
import { cn } from '@/lib/utils'

interface LlmSettingsProps {
  onSettingsChange: () => void
}

const sampleLlmConfigs: LlmConfig[] = [
  {
    id: '1',
    provider: 'openai',
    name: 'GPT-4 Turbo',
    model: 'gpt-4-turbo-preview',
    apiKey: 'sk-****-****-****',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1.0,
    frequencyPenalty: 0,
    presencePenalty: 0,
    systemPrompt: '你是一個專業的 Tekla Structures 助手...',
    enabled: true,
    isDefault: true
  },
  {
    id: '2',
    provider: 'anthropic',
    name: 'Claude 3 Sonnet',
    model: 'claude-3-sonnet-20240229',
    apiKey: 'sk-ant-****-****',
    temperature: 0.5,
    maxTokens: 8192,
    topP: 1.0,
    frequencyPenalty: 0,
    presencePenalty: 0,
    enabled: true,
    isDefault: false
  },
  {
    id: '3',
    provider: 'local',
    name: 'Local Llama 3',
    model: 'llama3-8b-instruct',
    baseUrl: 'http://localhost:11434',
    temperature: 0.8,
    maxTokens: 2048,
    topP: 0.9,
    frequencyPenalty: 0,
    presencePenalty: 0,
    enabled: false,
    isDefault: false
  }
]

export function LlmSettings({ onSettingsChange }: LlmSettingsProps) {
  const [llmConfigs, setLlmConfigs] = useState<LlmConfig[]>(sampleLlmConfigs)

  const getProviderIcon = (provider: LlmConfig['provider']) => {
    switch (provider) {
      case 'openai':
        return <div className="w-4 h-4 bg-green-500 rounded" />
      case 'anthropic':
        return <div className="w-4 h-4 bg-orange-500 rounded" />
      case 'google':
        return <div className="w-4 h-4 bg-blue-500 rounded" />
      case 'local':
        return <Zap className="h-4 w-4 text-purple-500" />
      case 'azure':
        return <div className="w-4 h-4 bg-blue-600 rounded" />
      default:
        return <Brain className="h-4 w-4 text-gray-500" />
    }
  }

  const getProviderLabel = (provider: LlmConfig['provider']) => {
    switch (provider) {
      case 'openai':
        return 'OpenAI'
      case 'anthropic':
        return 'Anthropic'
      case 'google':
        return 'Google'
      case 'local':
        return '本地模型'
      case 'azure':
        return 'Azure OpenAI'
      default:
        return '未知'
    }
  }

  const handleToggleLlm = (llmId: string) => {
    setLlmConfigs(prev => prev.map(llm => 
      llm.id === llmId 
        ? { ...llm, enabled: !llm.enabled }
        : llm
    ))
    onSettingsChange()
  }

  const handleSetDefault = (llmId: string) => {
    setLlmConfigs(prev => prev.map(llm => ({
      ...llm,
      isDefault: llm.id === llmId
    })))
    onSettingsChange()
  }

  const handleDeleteLlm = (llmId: string) => {
    setLlmConfigs(prev => prev.filter(llm => llm.id !== llmId))
    onSettingsChange()
  }

  const handleAddLlm = () => {
    const newLlm: LlmConfig = {
      id: Date.now().toString(),
      provider: 'openai',
      name: '新 LLM 配置',
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 2048,
      topP: 1.0,
      frequencyPenalty: 0,
      presencePenalty: 0,
      enabled: false,
      isDefault: false
    }
    setLlmConfigs(prev => [...prev, newLlm])
    onSettingsChange()
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>LLM 模型設定</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                配置大語言模型連接與參數
              </p>
            </div>
            <Button onClick={handleAddLlm}>
              <Plus className="h-4 w-4 mr-1" />
              新增模型
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-3">
        {llmConfigs.map((llm, index) => (
          <motion.div
            key={llm.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={cn(
              "transition-all",
              llm.enabled ? "border-primary/20 bg-primary/5" : "border-muted",
              llm.isDefault && "ring-2 ring-yellow-200"
            )}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium">{llm.name}</h3>
                      {llm.isDefault && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                          <Star className="h-3 w-3" />
                          <span>預設</span>
                        </div>
                      )}
                      <div className={cn(
                        "px-2 py-1 rounded-full text-xs",
                        llm.enabled 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      )}>
                        {llm.enabled ? '啟用' : '停用'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center space-x-1">
                        {getProviderIcon(llm.provider)}
                        <span className="font-medium">提供商:</span>
                        <span>{getProviderLabel(llm.provider)}</span>
                      </div>
                      <div>
                        <span className="font-medium">模型:</span> {llm.model}
                      </div>
                      <div>
                        <span className="font-medium">溫度:</span> {llm.temperature}
                      </div>
                      <div>
                        <span className="font-medium">最大 Token:</span> {llm.maxTokens}
                      </div>
                    </div>

                    {/* Model Parameters */}
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="bg-muted/50 p-2 rounded">
                        <div className="font-medium">Top P</div>
                        <div>{llm.topP}</div>
                      </div>
                      <div className="bg-muted/50 p-2 rounded">
                        <div className="font-medium">頻率懲罰</div>
                        <div>{llm.frequencyPenalty}</div>
                      </div>
                      <div className="bg-muted/50 p-2 rounded">
                        <div className="font-medium">存在懲罰</div>
                        <div>{llm.presencePenalty}</div>
                      </div>
                      <div className="bg-muted/50 p-2 rounded">
                        <div className="font-medium">API Key</div>
                        <div>{llm.apiKey ? '已設定' : '未設定'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    {!llm.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(llm.id)}
                      >
                        <Star className="h-3 w-3 mr-1" />
                        設為預設
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleLlm(llm.id)}
                    >
                      {llm.enabled ? '停用' : '啟用'}
                    </Button>
                    
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteLlm(llm.id)}
                      className="text-destructive hover:text-destructive"
                      disabled={llm.isDefault}
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

      {llmConfigs.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              <p>尚未設定任何 LLM 模型</p>
              <p className="text-sm mt-1">點擊「新增模型」開始設定</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Model Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">模型統計</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-lg font-semibold">{llmConfigs.length}</p>
              <p className="text-xs text-muted-foreground">總模型</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-green-600">
                {llmConfigs.filter(l => l.enabled).length}
              </p>
              <p className="text-xs text-muted-foreground">已啟用</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-blue-600">
                {llmConfigs.filter(l => l.provider === 'local').length}
              </p>
              <p className="text-xs text-muted-foreground">本地模型</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-yellow-600">
                {llmConfigs.filter(l => l.isDefault).length}
              </p>
              <p className="text-xs text-muted-foreground">預設模型</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
