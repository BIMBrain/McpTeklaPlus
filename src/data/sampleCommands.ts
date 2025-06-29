import { Command } from '@/types/commands'

export const sampleCommands: Command[] = [
  {
    id: '1',
    title: '建立鋼樑',
    description: '建立指定尺寸和材質的鋼樑',
    content: '建立一條長度 {length} 公尺的 {profile} 鋼樑，材質 {material}',
    category: 'modeling',
    tags: ['鋼樑', '建立', '結構', 'H型鋼'],
    usage: 156,
    lastUsed: new Date('2024-06-20'),
    isFavorite: true,
    examples: [
      '建立一條長度 12 公尺的 H400x200 鋼樑，材質 SN400B',
      '建立一條長度 8 公尺的 H300x150 鋼樑，材質 SS400'
    ],
    parameters: [
      { name: 'length', type: 'number', description: '樑長度（公尺）', required: true },
      { name: 'profile', type: 'select', description: '型鋼規格', required: true, options: ['H400x200', 'H300x150', 'H500x200'] },
      { name: 'material', type: 'select', description: '材質', required: true, options: ['SN400B', 'SS400', 'SM490'] }
    ]
  },
  {
    id: '2',
    title: '建立鋼柱',
    description: '建立指定高度和斷面的鋼柱',
    content: '建立一根高度 {height} 公尺的 {profile} 鋼柱，材質 {material}',
    category: 'modeling',
    tags: ['鋼柱', '建立', '結構', 'H型鋼'],
    usage: 134,
    lastUsed: new Date('2024-06-19'),
    isFavorite: true,
    examples: [
      '建立一根高度 4 公尺的 H400x400 鋼柱，材質 SN400B',
      '建立一根高度 3.5 公尺的 H300x300 鋼柱，材質 SS400'
    ],
    parameters: [
      { name: 'height', type: 'number', description: '柱高度（公尺）', required: true },
      { name: 'profile', type: 'select', description: '型鋼規格', required: true, options: ['H400x400', 'H300x300', 'H500x500'] },
      { name: 'material', type: 'select', description: '材質', required: true, options: ['SN400B', 'SS400', 'SM490'] }
    ]
  },
  {
    id: '3',
    title: '查詢模型資訊',
    description: '取得當前模型的基本資訊',
    content: '查詢當前模型資訊',
    category: 'query',
    tags: ['查詢', '模型', '資訊', '統計'],
    usage: 89,
    lastUsed: new Date('2024-06-18'),
    isFavorite: false,
    examples: [
      '查詢當前模型資訊',
      '顯示模型統計資料'
    ]
  },
  {
    id: '4',
    title: '批次修改材質',
    description: '批次修改選中零件的材質',
    content: '將選中的零件材質修改為 {material}',
    category: 'modification',
    tags: ['批次', '修改', '材質', '零件'],
    usage: 67,
    lastUsed: new Date('2024-06-17'),
    isFavorite: false,
    examples: [
      '將選中的零件材質修改為 SN400B',
      '將選中的零件材質修改為 SS400'
    ],
    parameters: [
      { name: 'material', type: 'select', description: '新材質', required: true, options: ['SN400B', 'SS400', 'SM490', 'SN490B'] }
    ]
  },
  {
    id: '5',
    title: '匯出結構報表',
    description: '產生並匯出結構零件清單報表',
    content: '匯出 {reportType} 報表到 {format} 格式',
    category: 'export',
    tags: ['匯出', '報表', '清單', '統計'],
    usage: 45,
    lastUsed: new Date('2024-06-16'),
    isFavorite: true,
    examples: [
      '匯出零件清單報表到 Excel 格式',
      '匯出材料統計報表到 PDF 格式'
    ],
    parameters: [
      { name: 'reportType', type: 'select', description: '報表類型', required: true, options: ['零件清單', '材料統計', '重量統計'] },
      { name: 'format', type: 'select', description: '匯出格式', required: true, options: ['Excel', 'PDF', 'CSV'] }
    ]
  },
  {
    id: '6',
    title: '匯入 DWG 檔案',
    description: '匯入 AutoCAD DWG 檔案到模型',
    content: '匯入 DWG 檔案 {filePath}',
    category: 'import',
    tags: ['匯入', 'DWG', 'AutoCAD', '檔案'],
    usage: 32,
    lastUsed: new Date('2024-06-15'),
    isFavorite: false,
    examples: [
      '匯入 DWG 檔案 C:\\drawings\\plan.dwg',
      '匯入 DWG 檔案並設定比例'
    ],
    parameters: [
      { name: 'filePath', type: 'string', description: '檔案路徑', required: true }
    ]
  },
  {
    id: '7',
    title: '設定 Phase',
    description: '設定選中零件的施工階段',
    content: '將選中零件設定為 Phase {phaseNumber}',
    category: 'modification',
    tags: ['Phase', '階段', '施工', '設定'],
    usage: 28,
    lastUsed: new Date('2024-06-14'),
    isFavorite: false,
    examples: [
      '將選中零件設定為 Phase 1',
      '將選中零件設定為 Phase 2'
    ],
    parameters: [
      { name: 'phaseNumber', type: 'number', description: 'Phase 編號', required: true }
    ]
  },
  {
    id: '8',
    title: '自動檢查碰撞',
    description: '執行模型碰撞檢查',
    content: '執行碰撞檢查，檢查範圍 {scope}',
    category: 'analysis',
    tags: ['碰撞', '檢查', '分析', '自動'],
    usage: 21,
    lastUsed: new Date('2024-06-13'),
    isFavorite: false,
    examples: [
      '執行碰撞檢查，檢查範圍全部零件',
      '執行碰撞檢查，檢查範圍選中零件'
    ],
    parameters: [
      { name: 'scope', type: 'select', description: '檢查範圍', required: true, options: ['全部零件', '選中零件', '當前視圖'] }
    ]
  }
]
