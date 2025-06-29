import React from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  Activity,
  Mic,
  MicOff,
  Zap,
  Menu,
  X,
  MessageCircle,
  Building
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HeaderProps {
  isVoiceActive: boolean
  onVoiceToggle: () => void
  onSettingsClick: () => void
  onMenuToggle: () => void
  isMenuOpen: boolean
  systemStatus: 'online' | 'offline' | 'connecting'
  currentPage?: 'chat' | 'tekla'
  onPageChange?: (page: 'chat' | 'tekla') => void
}

export function Header({
  isVoiceActive,
  onVoiceToggle,
  onSettingsClick,
  onMenuToggle,
  isMenuOpen,
  systemStatus,
  currentPage = 'chat',
  onPageChange
}: HeaderProps) {
  return (
    <motion.header
      className="sticky top-0 z-50 w-full glass figma-shadow"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left section - Logo and Menu */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="md:hidden"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="relative">
              <Zap className="h-8 w-8 text-primary" />
              <motion.div
                className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                MCP Tekla+
              </h1>
              <p className="text-xs text-muted-foreground">AI 輔助建模平台</p>
            </div>
          </motion.div>
        </div>

        {/* Center section - Navigation & System Status */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Page Navigation */}
          <div className="flex items-center space-x-1 bg-muted/50 rounded-lg p-1">
            <Button
              variant={currentPage === 'chat' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onPageChange?.('chat')}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              AI 助手
            </Button>
            <Button
              variant={currentPage === 'tekla' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onPageChange?.('tekla')}
              className="flex items-center gap-2"
            >
              <Building className="h-4 w-4" />
              Tekla 整合
            </Button>
          </div>

          {/* System Status */}
          <div className="flex items-center space-x-2">
            <Activity className={cn(
              "h-4 w-4",
              systemStatus === 'online' && "text-green-500",
              systemStatus === 'offline' && "text-red-500",
              systemStatus === 'connecting' && "text-yellow-500"
            )} />
            <span className="text-sm font-medium">
              {systemStatus === 'online' && '系統正常'}
              {systemStatus === 'offline' && '系統離線'}
              {systemStatus === 'connecting' && '連接中...'}
            </span>
          </div>
        </div>

        {/* Right section - Controls */}
        <div className="flex items-center space-x-2">
          {/* Voice Control Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant={isVoiceActive ? "default" : "outline"}
              size="icon"
              onClick={onVoiceToggle}
              className={cn(
                "relative",
                isVoiceActive && "pulse-glow"
              )}
            >
              {isVoiceActive ? (
                <Mic className="h-4 w-4" />
              ) : (
                <MicOff className="h-4 w-4" />
              )}
              {isVoiceActive && (
                <motion.div
                  className="absolute inset-0 rounded-md border-2 border-primary"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </Button>
          </motion.div>

          {/* Settings Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onSettingsClick}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.header>
  )
}
