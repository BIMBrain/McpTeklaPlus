export interface McpServerConfig {
  id: string
  name: string
  host: string
  port: number
  protocol: 'http' | 'https' | 'ws' | 'wss'
  apiKey?: string
  timeout: number
  retryAttempts: number
  enabled: boolean
  lastConnected?: Date
  status: 'connected' | 'disconnected' | 'error' | 'connecting'
}

export interface McpClientConfig {
  id: string
  name: string
  serverUrl: string
  authentication: {
    type: 'none' | 'apikey' | 'oauth' | 'basic'
    credentials?: Record<string, string>
  }
  requestTimeout: number
  maxRetries: number
  enabled: boolean
}

export interface LlmConfig {
  id: string
  provider: 'openai' | 'anthropic' | 'google' | 'local' | 'azure'
  name: string
  model: string
  apiKey?: string
  baseUrl?: string
  temperature: number
  maxTokens: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
  systemPrompt?: string
  enabled: boolean
  isDefault: boolean
}

export interface LmStudioConfig {
  id: string
  name: string
  host: string
  port: number
  modelPath: string
  contextLength: number
  gpuLayers: number
  threads: number
  batchSize: number
  temperature: number
  topK: number
  topP: number
  repeatPenalty: number
  enabled: boolean
  autoStart: boolean
}

export interface TeklaConfig {
  installPath: string
  version: string
  apiVersion: string
  pluginPaths: string[]
  autoConnect: boolean
  connectionTimeout: number
  modelBackupPath: string
  reportOutputPath: string
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  language: 'zh-TW' | 'zh-CN' | 'en-US'
  autoSave: boolean
  autoSaveInterval: number
  voiceSettings: {
    enabled: boolean
    language: 'zh-TW' | 'en-US'
    autoStart: boolean
    sensitivity: number
  }
  notifications: {
    enabled: boolean
    sound: boolean
    desktop: boolean
    email: boolean
  }
  performance: {
    animationsEnabled: boolean
    highRefreshRate: boolean
    gpuAcceleration: boolean
    maxHistoryItems: number
  }
}

export interface SystemSettings {
  mcpServers: McpServerConfig[]
  mcpClients: McpClientConfig[]
  llmConfigs: LlmConfig[]
  lmStudioConfigs: LmStudioConfig[]
  teklaConfig: TeklaConfig
  appSettings: AppSettings
}
