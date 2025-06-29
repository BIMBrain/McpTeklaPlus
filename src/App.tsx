import React, { useRef, useState } from 'react'
import { Layout } from './components/layout/Layout'
import { ChatInterface } from './components/chat/ChatInterface'
import { WelcomePage } from './components/welcome/WelcomePage'
import { TeklaIntegration } from './components/tekla/TeklaIntegration'
import { Command, CommandCategory } from './types/commands'

function App() {
  const chatRef = useRef<{ sendMessage: (message: string) => void }>(null)
  const [currentInput, setCurrentInput] = useState('')
  const [showWelcome, setShowWelcome] = useState(true)
  const [currentPage, setCurrentPage] = useState<'chat' | 'tekla'>('chat')

  const handleCommandSelect = (command: Command) => {
    // Fill the first example or the command content into chat
    const message = command.examples?.[0] || command.content
    chatRef.current?.sendMessage(message)
  }

  const handleCommandRerun = (command: string) => {
    chatRef.current?.sendMessage(command)
  }

  const handleTagClick = (tag: string) => {
    // Add tag to current input or create new message
    const message = currentInput ? `${currentInput} #${tag}` : `#${tag}`
    chatRef.current?.sendMessage(message)
  }

  const handleCategorySelect = (category: CommandCategory) => {
    // You could filter commands by category or add category context
    console.log('Selected category:', category)
  }

  const handleGetStarted = () => {
    setShowWelcome(false)
  }

  if (showWelcome) {
    return <WelcomePage onGetStarted={handleGetStarted} />
  }

  return (
    <Layout
      onCommandSelect={handleCommandSelect}
      onCommandRerun={handleCommandRerun}
      onTagClick={handleTagClick}
      onCategorySelect={handleCategorySelect}
      currentInput={currentInput}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
    >
      {currentPage === 'chat' ? (
        <ChatInterface
          ref={chatRef}
          onInputChange={setCurrentInput}
        />
      ) : (
        <TeklaIntegration />
      )}
    </Layout>
  )
}

export default App
