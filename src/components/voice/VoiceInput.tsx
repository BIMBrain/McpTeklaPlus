import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Volume2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { cn } from '@/lib/utils'

interface VoiceInputProps {
  onTranscript: (text: string) => void
  isActive: boolean
  onToggle: () => void
  className?: string
}

export function VoiceInput({ onTranscript, isActive, onToggle, className }: VoiceInputProps) {
  const [showTranscript, setShowTranscript] = useState(false)
  const [language, setLanguage] = useState<'zh-TW' | 'en-US'>('zh-TW')

  const {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition({
    lang: language,
    continuous: true,
    interimResults: true,
    onResult: (text, isFinal) => {
      if (isFinal) {
        onTranscript(text)
        setShowTranscript(false)
      } else {
        setShowTranscript(true)
      }
    },
    onError: (error) => {
      console.error('Speech recognition error:', error)
    },
    onEnd: () => {
      setShowTranscript(false)
    }
  })

  useEffect(() => {
    if (isActive && !isListening) {
      startListening()
    } else if (!isActive && isListening) {
      stopListening()
    }
  }, [isActive, isListening, startListening, stopListening])

  const handleToggle = () => {
    if (isListening) {
      stopListening()
    }
    onToggle()
    resetTranscript()
  }

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'zh-TW' ? 'en-US' : 'zh-TW')
    if (isListening) {
      stopListening()
      setTimeout(() => {
        if (isActive) {
          startListening()
        }
      }, 100)
    }
  }

  if (!isSupported) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <Button variant="outline" size="icon" disabled>
          <AlertCircle className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">
          瀏覽器不支援語音識別
        </span>
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      {/* Voice Control Button */}
      <div className="flex items-center space-x-2">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant={isListening ? "default" : "outline"}
            size="icon"
            onClick={handleToggle}
            className={cn(
              "relative",
              isListening && "pulse-glow"
            )}
          >
            {isListening ? (
              <Mic className="h-4 w-4" />
            ) : (
              <MicOff className="h-4 w-4" />
            )}
            
            {/* Listening Animation */}
            {isListening && (
              <motion.div
                className="absolute inset-0 rounded-md border-2 border-primary"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </Button>
        </motion.div>

        {/* Language Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLanguage}
          className="text-xs"
        >
          {language === 'zh-TW' ? '中文' : 'EN'}
        </Button>

        {/* Voice Indicator */}
        {isListening && (
          <div className="flex items-center space-x-1">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 h-4 bg-primary rounded-full voice-wave"
                animate={{ scaleY: [1, 1.5, 1] }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: i * 0.1
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Transcript Display */}
      <AnimatePresence>
        {showTranscript && (interimTranscript || transcript) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full mt-2 left-0 right-0 z-50"
          >
            <Card className="bg-background/95 backdrop-blur border-primary/20">
              <CardContent className="p-3">
                <div className="flex items-start space-x-2">
                  <Volume2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="text-foreground">
                        {transcript}
                      </span>
                      <span className="text-muted-foreground italic">
                        {interimTranscript}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === 'zh-TW' ? '正在識別中文...' : 'Recognizing English...'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-2 left-0 right-0 z-50"
          >
            <Card className="bg-destructive/10 border-destructive/20">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <p className="text-sm text-destructive">
                    語音識別錯誤: {error}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
