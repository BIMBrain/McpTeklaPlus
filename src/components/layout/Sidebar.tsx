import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  History,
  Bookmark,
  Settings,
  Activity,
  Zap,
  Database,
  FileText,
  BarChart3,
  Wrench
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CommandLibrary } from '@/components/shortcuts/CommandLibrary'
import { CommandHistoryComponent } from '@/components/history/CommandHistory'
import { QuickToolbar } from '@/components/tools/QuickToolbar'
import { SmartTags } from '@/components/tags/SmartTags'
import { SystemMonitor } from '@/components/monitor/SystemMonitor'
import { SettingsPage } from '@/components/settings/SettingsPage'
import { Command, CommandCategory } from '@/types/commands'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isOpen: boolean
  activeTab: string
  onTabChange: (tab: string) => void
  onClose: () => void
  onCommandSelect?: (command: Command) => void
  onCommandRerun?: (command: string) => void
  onTagClick?: (tag: string) => void
  onCategorySelect?: (category: CommandCategory) => void
  currentInput?: string
}

const sidebarItems = [
  { id: 'chat', label: '對話', icon: MessageSquare, description: 'AI 助手對話' },
  { id: 'shortcuts', label: '快捷', icon: Bookmark, description: '常用指令庫' },
  { id: 'tools', label: '工具', icon: Wrench, description: '快速工具列表' },
  { id: 'tags', label: '標籤', icon: Database, description: '智能標籤系統' },
  { id: 'history', label: '歷史', icon: History, description: '指令歷史記錄' },
  { id: 'monitor', label: '監控', icon: Activity, description: '系統狀態監控' },
  { id: 'analytics', label: '分析', icon: BarChart3, description: '數據分析' },
  { id: 'settings', label: '設定', icon: Settings, description: '系統設定' },
]

export function Sidebar({
  isOpen,
  activeTab,
  onTabChange,
  onClose,
  onCommandSelect,
  onCommandRerun,
  onTagClick,
  onCategorySelect,
  currentInput
}: SidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile Overlay */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.aside
            className={cn(
              "fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 glass figma-shadow",
              "md:sticky md:top-16 md:z-30"
            )}
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="flex h-full">
              {/* Navigation Tabs */}
              <div className="w-16 border-r bg-muted/30">
                <nav className="flex flex-col space-y-1 p-2">
                  {sidebarItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Button
                        variant={activeTab === item.id ? "default" : "ghost"}
                        size="icon"
                        className={cn(
                          "w-12 h-12",
                          activeTab === item.id && "bg-primary text-primary-foreground"
                        )}
                        onClick={() => onTabChange(item.id)}
                        title={item.label}
                      >
                        <item.icon className="h-5 w-5" />
                      </Button>
                    </motion.div>
                  ))}
                </nav>

                {/* Status Indicator */}
                <div className="absolute bottom-4 left-2">
                  <div className="relative">
                    <Zap className="h-6 w-6 text-primary" />
                    <motion.div
                      className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 flex flex-col">
                <div className="flex-1 p-4 overflow-hidden">
                  <AnimatePresence mode="wait">
                    {activeTab === 'chat' && (
                      <motion.div
                        key="chat"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="h-full"
                      >
                        <div className="text-center py-8 text-muted-foreground">
                          <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                          <p>對話功能</p>
                          <p className="text-sm">主要對話在右側進行</p>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'shortcuts' && (
                      <motion.div
                        key="shortcuts"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="h-full"
                      >
                        <CommandLibrary
                          onCommandSelect={onCommandSelect || (() => {})}
                        />
                      </motion.div>
                    )}

                    {activeTab === 'tools' && (
                      <motion.div
                        key="tools"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="h-full"
                      >
                        <QuickToolbar
                          onCommandSelect={onCommandSelect || (() => {})}
                        />
                      </motion.div>
                    )}

                    {activeTab === 'tags' && (
                      <motion.div
                        key="tags"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="h-full"
                      >
                        <SmartTags
                          currentInput={currentInput}
                          onTagClick={onTagClick || (() => {})}
                          onCategorySelect={onCategorySelect || (() => {})}
                        />
                      </motion.div>
                    )}

                    {activeTab === 'history' && (
                      <motion.div
                        key="history"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="h-full"
                      >
                        <CommandHistoryComponent
                          onCommandRerun={onCommandRerun || (() => {})}
                        />
                      </motion.div>
                    )}

                    {activeTab === 'monitor' && (
                      <motion.div
                        key="monitor"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="h-full"
                      >
                        <SystemMonitor />
                      </motion.div>
                    )}

                    {activeTab === 'settings' && (
                      <motion.div
                        key="settings"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="h-full"
                      >
                        <SettingsPage />
                      </motion.div>
                    )}

                    {activeTab === 'analytics' && (
                      <motion.div
                        key="analytics"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="h-full"
                      >
                        <div className="text-center py-8 text-muted-foreground">
                          <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                          <p>數據分析</p>
                          <p className="text-sm">即將推出...</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
