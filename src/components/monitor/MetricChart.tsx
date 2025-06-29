import React, { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ChartData {
  name: string
  data: number[]
  color: string
}

interface MetricChartProps {
  title: string
  data: ChartData[]
  timestamps: Date[]
  height?: number
  className?: string
}

export function MetricChart({ 
  title, 
  data, 
  timestamps, 
  height = 200, 
  className 
}: MetricChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || data.length === 0 || data[0].data.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    const padding = 20
    const chartWidth = rect.width - padding * 2
    const chartHeight = rect.height - padding * 2

    // Draw grid
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1
    
    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(rect.width - padding, y)
      ctx.stroke()
    }

    // Vertical grid lines
    const maxDataPoints = Math.max(...data.map(d => d.data.length))
    if (maxDataPoints > 1) {
      for (let i = 0; i <= 6; i++) {
        const x = padding + (chartWidth / 6) * i
        ctx.beginPath()
        ctx.moveTo(x, padding)
        ctx.lineTo(x, rect.height - padding)
        ctx.stroke()
      }
    }

    // Draw data lines
    data.forEach((series, seriesIndex) => {
      if (series.data.length < 2) return

      ctx.strokeStyle = series.color
      ctx.lineWidth = 2
      ctx.beginPath()

      series.data.forEach((value, index) => {
        const x = padding + (chartWidth / (series.data.length - 1)) * index
        const y = padding + chartHeight - (value / 100) * chartHeight

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()

      // Draw area fill
      ctx.globalAlpha = 0.1
      ctx.fillStyle = series.color
      ctx.lineTo(padding + chartWidth, rect.height - padding)
      ctx.lineTo(padding, rect.height - padding)
      ctx.closePath()
      ctx.fill()
      ctx.globalAlpha = 1

      // Draw points
      ctx.fillStyle = series.color
      series.data.forEach((value, index) => {
        const x = padding + (chartWidth / (series.data.length - 1)) * index
        const y = padding + chartHeight - (value / 100) * chartHeight

        ctx.beginPath()
        ctx.arc(x, y, 2, 0, Math.PI * 2)
        ctx.fill()
      })
    })

    // Draw Y-axis labels
    ctx.fillStyle = '#6b7280'
    ctx.font = '10px sans-serif'
    ctx.textAlign = 'right'
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i
      const value = 100 - (i * 25)
      ctx.fillText(`${value}%`, padding - 5, y + 3)
    }

    // Draw current values
    ctx.textAlign = 'left'
    data.forEach((series, index) => {
      const lastValue = series.data[series.data.length - 1]
      if (lastValue !== undefined) {
        ctx.fillStyle = series.color
        ctx.fillText(
          `${series.name}: ${Math.round(lastValue)}%`,
          padding + 10,
          padding + 15 + index * 15
        )
      }
    })

  }, [data, timestamps, height])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative" style={{ height }}>
            <canvas
              ref={canvasRef}
              className="w-full h-full"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-2">
            {data.map((series, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: series.color }}
                />
                <span className="text-xs text-muted-foreground">
                  {series.name}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
