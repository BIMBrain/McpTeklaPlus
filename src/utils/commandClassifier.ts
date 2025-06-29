import { Command, CommandCategory } from '@/types/commands'

// Keywords for automatic classification
const categoryKeywords: Record<CommandCategory, string[]> = {
  modeling: [
    '建立', '創建', '新增', '產生', '建造', '構建',
    '鋼樑', '鋼柱', '板', '樑', '柱', '結構', '零件',
    'H型鋼', '型鋼', '混凝土', '鋼筋'
  ],
  query: [
    '查詢', '取得', '顯示', '檢視', '列出', '搜尋',
    '資訊', '狀態', '屬性', '統計', '清單', '報告'
  ],
  modification: [
    '修改', '變更', '調整', '編輯', '更新', '設定',
    '批次', '材質', '尺寸', '位置', '角度', 'Phase'
  ],
  export: [
    '匯出', '輸出', '產生', '下載', '儲存',
    '報表', '清單', 'Excel', 'PDF', 'CSV', 'DWG'
  ],
  import: [
    '匯入', '載入', '讀取', '開啟',
    'DWG', 'DXF', 'IFC', 'SKP', '檔案'
  ],
  analysis: [
    '分析', '檢查', '計算', '驗證', '檢驗',
    '碰撞', '干涉', '重量', '應力', '結構分析'
  ],
  automation: [
    '自動', '批次', '腳本', '巨集', '流程',
    '排程', '重複', '循環'
  ],
  settings: [
    '設定', '配置', '選項', '參數', '偏好',
    '環境', '系統', '連接'
  ]
}

// Tool categories for quick access
export interface ToolCategory {
  id: string
  name: string
  description: string
  icon: string
  commands: Command[]
  color: string
}

export function classifyCommand(command: string): CommandCategory {
  const normalizedCommand = command.toLowerCase()
  
  let bestMatch: CommandCategory = 'modeling'
  let maxScore = 0
  
  Object.entries(categoryKeywords).forEach(([category, keywords]) => {
    let score = 0
    keywords.forEach(keyword => {
      if (normalizedCommand.includes(keyword.toLowerCase())) {
        score += keyword.length // Longer keywords get higher weight
      }
    })
    
    if (score > maxScore) {
      maxScore = score
      bestMatch = category as CommandCategory
    }
  })
  
  return bestMatch
}

export function extractParameters(command: string): Record<string, string> {
  const parameters: Record<string, string> = {}
  
  // Extract numbers with units
  const numberMatches = command.match(/(\d+(?:\.\d+)?)\s*(公尺|米|m|公分|cm|mm)/g)
  if (numberMatches) {
    numberMatches.forEach((match, index) => {
      const [, value, unit] = match.match(/(\d+(?:\.\d+)?)\s*(公尺|米|m|公分|cm|mm)/) || []
      if (value && unit) {
        parameters[`dimension_${index + 1}`] = `${value}${unit}`
      }
    })
  }
  
  // Extract material types
  const materialMatches = command.match(/(SN\d+[AB]?|SS\d+|SM\d+|Q\d+)/g)
  if (materialMatches) {
    parameters.material = materialMatches[0]
  }
  
  // Extract profile types
  const profileMatches = command.match(/(H\d+x\d+|C\d+x\d+|L\d+x\d+)/g)
  if (profileMatches) {
    parameters.profile = profileMatches[0]
  }
  
  // Extract file paths
  const pathMatches = command.match(/[A-Za-z]:\\[^\\/:*?"<>|]+(?:\\[^\\/:*?"<>|]+)*\.\w+/g)
  if (pathMatches) {
    parameters.filePath = pathMatches[0]
  }
  
  return parameters
}

export function generateTags(command: string, category: CommandCategory): string[] {
  const tags: string[] = []
  const normalizedCommand = command.toLowerCase()
  
  // Add category-specific tags
  const categoryTags = categoryKeywords[category]
  categoryTags.forEach(keyword => {
    if (normalizedCommand.includes(keyword.toLowerCase())) {
      tags.push(keyword)
    }
  })
  
  // Add parameter-based tags
  const parameters = extractParameters(command)
  Object.values(parameters).forEach(value => {
    if (value.length < 20) { // Avoid very long values
      tags.push(value)
    }
  })
  
  // Remove duplicates and limit to 5 tags
  return [...new Set(tags)].slice(0, 5)
}

export function getPopularTools(commands: Command[]): ToolCategory[] {
  const categories: Record<CommandCategory, Command[]> = {
    modeling: [],
    query: [],
    modification: [],
    export: [],
    import: [],
    analysis: [],
    automation: [],
    settings: []
  }
  
  // Group commands by category
  commands.forEach(command => {
    categories[command.category].push(command)
  })
  
  // Create tool categories with most popular commands
  const toolCategories: ToolCategory[] = [
    {
      id: 'modeling',
      name: '建模工具',
      description: '建立結構零件',
      icon: 'Wrench',
      commands: categories.modeling
        .sort((a, b) => b.usage - a.usage)
        .slice(0, 5),
      color: 'bg-blue-500'
    },
    {
      id: 'query',
      name: '查詢工具',
      description: '取得模型資訊',
      icon: 'Search',
      commands: categories.query
        .sort((a, b) => b.usage - a.usage)
        .slice(0, 3),
      color: 'bg-green-500'
    },
    {
      id: 'modification',
      name: '修改工具',
      description: '編輯零件屬性',
      icon: 'Edit',
      commands: categories.modification
        .sort((a, b) => b.usage - a.usage)
        .slice(0, 4),
      color: 'bg-yellow-500'
    },
    {
      id: 'export',
      name: '匯出工具',
      description: '產生報表檔案',
      icon: 'Download',
      commands: categories.export
        .sort((a, b) => b.usage - a.usage)
        .slice(0, 3),
      color: 'bg-purple-500'
    }
  ]
  
  return toolCategories.filter(category => category.commands.length > 0)
}
