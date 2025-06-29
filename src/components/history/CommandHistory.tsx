import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  Search,
  Filter,
  Calendar,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CommandHistory as CommandHistoryType } from '@/types/commands'
import { cn } from '@/lib/utils'

interface CommandHistoryProps {
  onCommandRerun: (command: string) => void
  className?: string
}

// Sample history data
const sampleHistory: CommandHistoryType[] = [
  {
    id: '1',
    command: '建立一條長度 12 公尺的 H400x200 鋼樑，材質 SN400B',
    timestamp: new Date('2024-06-28T10:30:00'),
    success: true,
    response: '成功建立鋼樑，ID: B001',
    executionTime: 1.2
  },
  {
    id: '2',
    command: '查詢當前模型資訊',
    timestamp: new Date('2024-06-28T10:25:00'),
    success: true,
    response: '模型包含 45 個零件，總重量 12.5 噸',
    executionTime: 0.8
  },
  {
    id: '3',
    command: '建立一根高度 4 公尺的 H400x400 鋼柱，材質 SN400B',
    timestamp: new Date('2024-06-28T10:20:00'),
    success: false,
    response: '錯誤：無法找到指定的材質規格',
    executionTime: 0.5
  },
  {
    id: '4',
    command: '將選中的零件材質修改為 SS400',
    timestamp: new Date('2024-06-28T10:15:00'),
    success: true,
    response: '成功修改 3 個零件的材質',
    executionTime: 2.1
  },
  {
    id: '5',
    command: '匯出零件清單報表到 Excel 格式',
    timestamp: new Date('2024-06-28T10:10:00'),
    success: true,
    response: '報表已匯出至 C:\\Reports\\parts_list.xlsx',
    executionTime: 3.5
  }
]

export function CommandHistoryComponent({ onCommandRerun, className }: CommandHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failed'>('all')
  const [selectedDate, setSelectedDate] = useState('')

  const filteredHistory = sampleHistory.filter(item => {
    const matchesSearch = !searchQuery || 
      item.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.response && item.response.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'success' && item.success) ||
      (filterStatus === 'failed' && !item.success)
    
    const matchesDate = !selectedDate || 
      item.timestamp.toDateString() === new Date(selectedDate).toDateString()
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const handleRerun = (command: string) => {
    onCommandRerun(command)
  }

  const clearHistory = () => {
    // TODO: Implement clear history
    console.log('Clear history')
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-TW', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">指令歷史</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={clearHistory}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          清除
        </Button>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜尋指令或回應..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Status and Date Filters */}
        <div className="flex space-x-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="flex-1 text-sm border rounded px-3 py-2"
          >
            <option value="all">全部狀態</option>
            <option value="success">成功</option>
            <option value="failed">失敗</option>
          </select>
          
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex-1 text-sm border rounded px-3 py-2"
          />
        </div>
      </div>

      {/* History List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {filteredHistory.length > 0 ? (
            filteredHistory.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {/* Command */}
                        <div className="flex items-center space-x-2 mb-2">
                          {item.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                          )}
                          <p className="text-sm font-medium truncate">
                            {item.command}
                          </p>
                        </div>

                        {/* Response */}
                        {item.response && (
                          <div className={cn(
                            "text-xs p-2 rounded mb-2",
                            item.success 
                              ? "bg-green-50 text-green-700 border border-green-200" 
                              : "bg-red-50 text-red-700 border border-red-200"
                          )}>
                            {item.response}
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(item.timestamp)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(item.timestamp)}</span>
                          </div>
                          {item.executionTime && (
                            <span>{item.executionTime}s</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col space-y-1 ml-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleRerun(item.command)}
                          title="重新執行"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-muted-foreground"
            >
              <Clock className="h-8 w-8 mx-auto mb-2" />
              <p>沒有找到符合條件的歷史記錄</p>
              <p className="text-sm">調整搜尋條件或開始使用指令</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Statistics */}
      {filteredHistory.length > 0 && (
        <div className="border-t pt-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-semibold">{filteredHistory.length}</p>
              <p className="text-xs text-muted-foreground">總計</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-green-600">
                {filteredHistory.filter(item => item.success).length}
              </p>
              <p className="text-xs text-muted-foreground">成功</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-red-600">
                {filteredHistory.filter(item => !item.success).length}
              </p>
              <p className="text-xs text-muted-foreground">失敗</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
