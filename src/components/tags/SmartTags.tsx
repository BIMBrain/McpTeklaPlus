import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Tag, 
  TrendingUp, 
  Hash, 
  Filter,
  X,
  Plus,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { classifyCommand, generateTags, extractParameters } from '@/utils/commandClassifier'
import { Command, CommandCategory } from '@/types/commands'
import { sampleCommands } from '@/data/sampleCommands'
import { cn } from '@/lib/utils'

interface SmartTagsProps {
  currentInput?: string
  onTagClick: (tag: string) => void
  onCategorySelect: (category: CommandCategory) => void
  className?: string
}

interface TagInfo {
  name: string
  count: number
  category: CommandCategory
  trending: boolean
}

const categoryColors: Record<CommandCategory, string> = {
  modeling: 'bg-blue-100 text-blue-800 border-blue-200',
  query: 'bg-green-100 text-green-800 border-green-200',
  modification: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  export: 'bg-purple-100 text-purple-800 border-purple-200',
  import: 'bg-orange-100 text-orange-800 border-orange-200',
  analysis: 'bg-red-100 text-red-800 border-red-200',
  automation: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  settings: 'bg-gray-100 text-gray-800 border-gray-200'
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

export function SmartTags({ currentInput, onTagClick, onCategorySelect, className }: SmartTagsProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [suggestedCategory, setSuggestedCategory] = useState<CommandCategory | null>(null)
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])
  const [parameters, setParameters] = useState<Record<string, string>>({})

  // Analyze current input
  useEffect(() => {
    if (currentInput && currentInput.trim()) {
      const category = classifyCommand(currentInput)
      const tags = generateTags(currentInput, category)
      const params = extractParameters(currentInput)
      
      setSuggestedCategory(category)
      setSuggestedTags(tags)
      setParameters(params)
    } else {
      setSuggestedCategory(null)
      setSuggestedTags([])
      setParameters({})
    }
  }, [currentInput])

  // Get popular tags from commands
  const getPopularTags = (): TagInfo[] => {
    const tagCounts: Record<string, { count: number; categories: Set<CommandCategory> }> = {}
    
    sampleCommands.forEach(command => {
      command.tags.forEach(tag => {
        if (!tagCounts[tag]) {
          tagCounts[tag] = { count: 0, categories: new Set() }
        }
        tagCounts[tag].count += command.usage
        tagCounts[tag].categories.add(command.category)
      })
    })

    return Object.entries(tagCounts)
      .map(([tag, data]) => ({
        name: tag,
        count: data.count,
        category: Array.from(data.categories)[0], // Primary category
        trending: data.count > 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)
  }

  const popularTags = getPopularTags()

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
    onTagClick(tag)
  }

  const clearSelectedTags = () => {
    setSelectedTags([])
  }

  const renderTag = (tag: string, category?: CommandCategory, trending?: boolean, suggested?: boolean) => (
    <motion.div
      key={tag}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleTagClick(tag)}
        className={cn(
          "h-7 px-2 text-xs border transition-all",
          selectedTags.includes(tag) && "bg-primary text-primary-foreground border-primary",
          suggested && "ring-2 ring-primary/20",
          category && !selectedTags.includes(tag) && categoryColors[category]
        )}
      >
        <div className="flex items-center space-x-1">
          {trending && <TrendingUp className="h-3 w-3" />}
          {suggested && <Sparkles className="h-3 w-3" />}
          <Hash className="h-3 w-3" />
          <span>{tag}</span>
        </div>
      </Button>
    </motion.div>
  )

  return (
    <div className={cn("space-y-4", className)}>
      {/* Smart Analysis */}
      <AnimatePresence>
        {(suggestedCategory || suggestedTags.length > 0 || Object.keys(parameters).length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm">智能分析</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Suggested Category */}
                {suggestedCategory && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">建議分類：</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCategorySelect(suggestedCategory)}
                      className={cn(
                        "h-8",
                        categoryColors[suggestedCategory]
                      )}
                    >
                      {categoryLabels[suggestedCategory]}
                    </Button>
                  </div>
                )}

                {/* Suggested Tags */}
                {suggestedTags.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">建議標籤：</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedTags.map(tag => renderTag(tag, undefined, false, true))}
                    </div>
                  </div>
                )}

                {/* Extracted Parameters */}
                {Object.keys(parameters).length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">識別參數：</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(parameters).map(([key, value]) => (
                        <div key={key} className="flex justify-between p-2 bg-muted rounded">
                          <span className="text-muted-foreground">{key}:</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Tags */}
      <AnimatePresence>
        {selectedTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4" />
                    <CardTitle className="text-sm">已選標籤</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSelectedTags}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map(tag => renderTag(tag))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popular Tags */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Tag className="h-4 w-4" />
            <CardTitle className="text-sm">熱門標籤</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {popularTags.map(tagInfo => 
              renderTag(tagInfo.name, tagInfo.category, tagInfo.trending)
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tag Statistics */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-semibold">{popularTags.length}</p>
              <p className="text-xs text-muted-foreground">可用標籤</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-orange-600">
                {popularTags.filter(t => t.trending).length}
              </p>
              <p className="text-xs text-muted-foreground">熱門標籤</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-primary">
                {selectedTags.length}
              </p>
              <p className="text-xs text-muted-foreground">已選標籤</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
