import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { VoiceInput } from '@/components/voice/VoiceInput'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  isVoice?: boolean
}

export interface ChatInterfaceRef {
  sendMessage: (message: string) => void
}

interface ChatInterfaceProps {
  onInputChange?: (input: string) => void
}

export const ChatInterface = forwardRef<ChatInterfaceRef, ChatInterfaceProps>(({ onInputChange }, ref) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: '您好！我是 MCP Tekla+ AI 助手。我可以幫助您進行 Tekla Structures 建模、查詢和自動化操作。請告訴我您需要什麼協助？',
      timestamp: new Date(),
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `我收到您的指令：「${message}」。正在處理中，請稍候...`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return
    await sendMessage(inputValue)
    setInputValue('')
  }

  // Expose sendMessage function through ref
  useImperativeHandle(ref, () => ({
    sendMessage: (message: string) => {
      setInputValue(message)
      setTimeout(() => {
        sendMessage(message)
        setInputValue('')
      }, 100)
    }
  }))

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleVoice = () => {
    setIsVoiceActive(!isVoiceActive)
  }

  const handleVoiceTranscript = (transcript: string) => {
    setInputValue(prev => prev + transcript)
    // Auto-focus the input after voice input
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto p-4">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Card className="glass figma-shadow bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <motion.div
                className="float"
                transition={{ delay: 0.5 }}
              >
                <Sparkles className="h-8 w-8 text-primary" />
              </motion.div>
              <div>
                <h2 className="text-xl font-semibold">MCP Tekla+ AI 助手</h2>
                <p className="text-muted-foreground">
                  使用自然語言控制 Tekla Structures，支援語音輸入與智能建議
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                "flex",
                message.type === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <Card className={cn(
                "max-w-[80%] md:max-w-[70%] figma-shadow transition-all hover:figma-shadow-lg",
                message.type === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'glass'
              )}>
                <CardContent className="p-4">
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={cn(
                    "text-xs mt-2 opacity-70",
                    message.type === 'user' ? 'text-primary-foreground' : 'text-muted-foreground'
                  )}>
                    {message.timestamp.toLocaleTimeString()}
                    {message.isVoice && ' • 語音輸入'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <Card className="bg-muted">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">AI 正在思考中...</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-t pt-4"
      >
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                onInputChange?.(e.target.value)
              }}
              onKeyPress={handleKeyPress}
              placeholder="輸入您的指令，例如：建立一條 12 公尺長的 H400x200 鋼樑..."
              className="w-full min-h-[60px] max-h-32 p-3 pr-12 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              disabled={isLoading}
            />
            <div className="absolute right-2 top-2">
              <VoiceInput
                onTranscript={handleVoiceTranscript}
                isActive={isVoiceActive}
                onToggle={toggleVoice}
              />
            </div>
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="h-[60px] px-6"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  )
})
