export interface Command {
  id: string
  title: string
  description: string
  content: string
  category: CommandCategory
  tags: string[]
  usage: number
  lastUsed: Date
  isFavorite: boolean
  examples?: string[]
  parameters?: CommandParameter[]
}

export interface CommandParameter {
  name: string
  type: 'string' | 'number' | 'boolean' | 'select'
  description: string
  required: boolean
  defaultValue?: any
  options?: string[]
}

export type CommandCategory = 
  | 'modeling'      // 建模
  | 'query'         // 查詢
  | 'modification'  // 修改
  | 'export'        // 匯出
  | 'import'        // 匯入
  | 'analysis'      // 分析
  | 'automation'    // 自動化
  | 'settings'      // 設定

export interface CommandHistory {
  id: string
  command: string
  timestamp: Date
  success: boolean
  response?: string
  executionTime?: number
}

export interface KnowledgeItem {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  relevanceScore?: number
  source: 'manual' | 'documentation' | 'examples' | 'history'
}

export interface SearchResult {
  item: Command | KnowledgeItem
  score: number
  type: 'command' | 'knowledge'
  highlights: string[]
}
