import React, { useState } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Command, CommandCategory } from '@/types/commands'

interface LayoutProps {
  children: React.ReactNode
  onCommandSelect?: (command: Command) => void
  onCommandRerun?: (command: string) => void
  onTagClick?: (tag: string) => void
  onCategorySelect?: (category: CommandCategory) => void
  currentInput?: string
  currentPage?: 'chat' | 'tekla' | 'dashboard'
  onPageChange?: (page: 'chat' | 'tekla' | 'dashboard') => void
}

export function Layout({
  children,
  onCommandSelect,
  onCommandRerun,
  onTagClick,
  onCategorySelect,
  currentInput,
  currentPage = 'chat',
  onPageChange
}: LayoutProps) {
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('chat')
  const [systemStatus, setSystemStatus] = useState<'online' | 'offline' | 'connecting'>('online')

  const handleVoiceToggle = () => {
    setIsVoiceActive(!isVoiceActive)
    // TODO: Implement voice recognition logic
  }

  const handleSettingsClick = () => {
    setActiveTab('settings')
    setIsSidebarOpen(true)
  }

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  const handleSidebarClose = () => {
    setIsSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        isVoiceActive={isVoiceActive}
        onVoiceToggle={handleVoiceToggle}
        onSettingsClick={handleSettingsClick}
        onMenuToggle={handleMenuToggle}
        isMenuOpen={isSidebarOpen}
        systemStatus={systemStatus}
        currentPage={currentPage}
        onPageChange={onPageChange}
      />
      
      <div className="flex">
        <Sidebar
          isOpen={isSidebarOpen}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onClose={handleSidebarClose}
          onCommandSelect={onCommandSelect}
          onCommandRerun={onCommandRerun}
          onTagClick={onTagClick}
          onCategorySelect={onCategorySelect}
          currentInput={currentInput}
        />
        
        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  )
}
