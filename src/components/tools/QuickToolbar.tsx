import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Wrench, 
  Search, 
  Edit, 
  Download, 
  Upload,
  BarChart3,
  Settings,
  ChevronDown,
  Star,
  Clock,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Command } from '@/types/commands'
import { getPopularTools, ToolCategory } from '@/utils/commandClassifier'
import { sampleCommands } from '@/data/sampleCommands'
import { cn } from '@/lib/utils'

interface QuickToolbarProps {
  onCommandSelect: (command: Command) => void
  className?: string
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Wrench,
  Search,
  Edit,
  Download,
  Upload,
  BarChart3,
  Settings
}

export function QuickToolbar({ onCommandSelect, className }: QuickToolbarProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [showFavorites, setShowFavorites] = useState(true)
  
  const toolCategories = getPopularTools(sampleCommands)
  const favoriteCommands = sampleCommands.filter(cmd => cmd.isFavorite).slice(0, 6)
  const recentCommands = sampleCommands
    .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
    .slice(0, 4)

  const handleCategoryToggle = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId)
  }

  const renderCommand = (command: Command, size: 'sm' | 'md' = 'sm') => (
    <motion.div
      key={command.id}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button
        variant="outline"
        size={size}
        onClick={() => onCommandSelect(command)}
        className={cn(
          "justify-start text-left h-auto p-3",
          size === 'md' && "h-16"
        )}
        title={command.description}
      >
        <div className="flex items-center space-x-2 w-full">
          {command.isFavorite && (
            <Star className="h-3 w-3 text-yellow-500 fill-current flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className={cn(
              "font-medium truncate",
              size === 'sm' ? "text-xs" : "text-sm"
            )}>
              {command.title}
            </p>
            {size === 'md' && (
              <p className="text-xs text-muted-foreground truncate">
                {command.description}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <span>{command.usage}</span>
          </div>
        </div>
      </Button>
    </motion.div>
  )

  const renderToolCategory = (category: ToolCategory) => {
    const IconComponent = iconMap[category.icon] || Wrench
    const isExpanded = expandedCategory === category.id

    return (
      <Card key={category.id} className="overflow-hidden">
        <CardHeader 
          className="pb-2 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => handleCategoryToggle(category.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn(
                "p-2 rounded-lg text-white",
                category.color
              )}>
                <IconComponent className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm">{category.name}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {category.description}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">
                {category.commands.length}
              </span>
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform",
                isExpanded && "rotate-180"
              )} />
            </div>
          </div>
        </CardHeader>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="pt-0 space-y-2">
                {category.commands.map(command => renderCommand(command))}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">快速工具</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant={showFavorites ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFavorites(!showFavorites)}
          >
            <Star className="h-3 w-3 mr-1" />
            我的最愛
          </Button>
        </div>
      </div>

      {/* Favorites Section */}
      <AnimatePresence>
        {showFavorites && favoriteCommands.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <CardTitle className="text-sm">常用指令</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-2">
                {favoriteCommands.map(command => renderCommand(command, 'md'))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Commands */}
      {recentCommands.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <CardTitle className="text-sm">最近使用</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentCommands.map(command => renderCommand(command))}
          </CardContent>
        </Card>
      )}

      {/* Tool Categories */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Zap className="h-4 w-4 text-primary" />
          <h3 className="font-medium">工具分類</h3>
        </div>
        {toolCategories.map(renderToolCategory)}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-lg font-semibold text-primary">
                {sampleCommands.length}
              </p>
              <p className="text-xs text-muted-foreground">可用指令</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-green-600">
                {favoriteCommands.length}
              </p>
              <p className="text-xs text-muted-foreground">我的最愛</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
