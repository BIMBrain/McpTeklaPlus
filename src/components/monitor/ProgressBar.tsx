import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number // 0-100
  max?: number
  className?: string
  showValue?: boolean
  animated?: boolean
  height?: 'sm' | 'md' | 'lg'
}

export function ProgressBar({ 
  value, 
  max = 100, 
  className, 
  showValue = false,
  animated = true,
  height = 'sm'
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  
  const heightClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  return (
    <div className="w-full">
      <div className={cn(
        "relative bg-muted rounded-full overflow-hidden",
        heightClasses[height]
      )}>
        <motion.div
          className={cn(
            "h-full rounded-full transition-colors",
            className || "bg-primary"
          )}
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: animated ? 0.5 : 0,
            ease: "easeOut" 
          }}
        />
        
        {/* Animated shimmer effect for high usage */}
        {percentage > 80 && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          />
        )}
      </div>
      
      {showValue && (
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{Math.round(value)}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  )
}
