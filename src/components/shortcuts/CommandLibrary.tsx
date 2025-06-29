import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Star, 
  Clock, 
  TrendingUp, 
  Filter,
  Copy,
  Play,
  Heart,
  Tag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCommandSearch } from '@/hooks/useCommandSearch'
import { sampleCommands } from '@/data/sampleCommands'
import { Command, CommandCategory } from '@/types/commands'
import { cn } from '@/lib/utils'

interface CommandLibraryProps {
  onCommandSelect: (command: Command) => void
  className?: string
}

const categoryLabels: Record<CommandCategory, string> = {
  modeling: '建模',
  query: '查詢',
  modification: '修改',
  export: '匯出',
  import: '匯入',
  analysis: '分析',
  automation: '自動化',
  settings: '設定'
}

const categoryColors: Record<CommandCategory, string> = {
  modeling: 'bg-blue-100 text-blue-800',
  query: 'bg-green-100 text-green-800',
  modification: 'bg-yellow-100 text-yellow-800',
  export: 'bg-purple-100 text-purple-800',
  import: 'bg-orange-100 text-orange-800',
  analysis: 'bg-red-100 text-red-800',
  automation: 'bg-indigo-100 text-indigo-800',
  settings: 'bg-gray-100 text-gray-800'
}

export function CommandLibrary({ onCommandSelect, className }: CommandLibraryProps) {
  const [activeTab, setActiveTab] = useState<'search' | 'popular' | 'recent'>('popular')
  
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    searchResults,
    popularCommands,
    recentCommands
  } = useCommandSearch({
    commands: sampleCommands,
    knowledgeBase: [] // TODO: Add knowledge base
  })

  const handleCommandClick = (command: Command) => {
    onCommandSelect(command)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // TODO: Show toast notification
  }

  const renderCommand = (command: Command, index: number) => (
    <motion.div
      key={command.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="hover:shadow-md transition-shadow cursor-pointer group">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-medium text-sm">{command.title}</h3>
                {command.isFavorite && (
                  <Heart className="h-3 w-3 text-red-500 fill-current" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {command.description}
              </p>
              
              {/* Category and Tags */}
              <div className="flex items-center space-x-2 mb-2">
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  categoryColors[command.category]
                )}>
                  {categoryLabels[command.category]}
                </span>
                {command.tags.slice(0, 2).map(tag => (
                  <span 
                    key={tag}
                    className="px-2 py-1 bg-muted rounded-full text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Usage Stats */}
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>{command.usage} 次使用</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{command.lastUsed.toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation()
                  handleCommandClick(command)
                }}
              >
                <Play className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation()
                  copyToClipboard(command.content)
                }}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Example */}
          {command.examples && command.examples.length > 0 && (
            <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
              <span className="text-muted-foreground">範例：</span>
              <span className="ml-1">{command.examples[0]}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">快捷指令庫</h2>
        <div className="flex items-center space-x-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="all">全部分類</option>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="搜尋指令、描述或標籤..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {[
          { id: 'popular', label: '熱門', icon: TrendingUp },
          { id: 'recent', label: '最近', icon: Clock },
          { id: 'search', label: '搜尋', icon: Search }
        ].map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab(tab.id as any)}
            className="flex-1"
          >
            <tab.icon className="h-4 w-4 mr-1" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'popular' && (
            <motion.div
              key="popular"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {popularCommands.map((command, index) => renderCommand(command, index))}
            </motion.div>
          )}

          {activeTab === 'recent' && (
            <motion.div
              key="recent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {recentCommands.map((command, index) => renderCommand(command, index))}
            </motion.div>
          )}

          {activeTab === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {searchResults.length > 0 ? (
                searchResults.map((result, index) => 
                  result.type === 'command' 
                    ? renderCommand(result.item as Command, index)
                    : null
                )
              ) : searchQuery ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2" />
                  <p>找不到相關指令</p>
                  <p className="text-sm">試試其他關鍵字或瀏覽熱門指令</p>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2" />
                  <p>輸入關鍵字開始搜尋</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
