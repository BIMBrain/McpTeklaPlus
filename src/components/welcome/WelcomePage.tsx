import React from 'react'
import { motion } from 'framer-motion'
import { 
  Zap, 
  Mic, 
  Brain, 
  Wrench, 
  BarChart3, 
  Sparkles,
  ArrowRight,
  Play,
  Star
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface WelcomePageProps {
  onGetStarted: () => void
  className?: string
}

const features = [
  {
    icon: Mic,
    title: '即時語音輸入',
    description: '支援中英文語音識別，自然語言控制 Tekla',
    color: 'bg-blue-500',
    delay: 0.1
  },
  {
    icon: Brain,
    title: 'AI 智能助手',
    description: '基於大語言模型的智能建模助手',
    color: 'bg-purple-500',
    delay: 0.2
  },
  {
    icon: Wrench,
    title: 'Tekla 整合',
    description: '完整的 Tekla Structures API 整合',
    color: 'bg-green-500',
    delay: 0.3
  },
  {
    icon: BarChart3,
    title: '系統監控',
    description: '即時 GPU/CPU 負載監控與分析',
    color: 'bg-orange-500',
    delay: 0.4
  }
]

const stats = [
  { label: '支援指令', value: '50+', icon: Zap },
  { label: '語言支援', value: '3', icon: Brain },
  { label: '整合模組', value: '8', icon: Wrench },
  { label: '用戶滿意度', value: '98%', icon: Star }
]

export function WelcomePage({ onGetStarted, className }: WelcomePageProps) {
  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50", className)}>
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* Logo */}
          <motion.div
            className="flex items-center justify-center mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center figma-shadow-lg">
                <Zap className="h-10 w-10 text-white" />
              </div>
              <motion.div
                className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-3 w-3 text-white" />
              </motion.div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            MCP Tekla+
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            AI 輔助 Tekla Structures 建模全流程平台
            <br />
            <span className="text-lg text-gray-500">
              結合語音輸入、智能助手與系統監控的現代化建模工具
            </span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Button
              size="lg"
              onClick={onGetStarted}
              className="px-8 py-4 text-lg figma-shadow hover:figma-shadow-lg transition-all"
            >
              <Play className="h-5 w-5 mr-2" />
              開始使用
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg glass figma-shadow hover:figma-shadow-lg transition-all"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              查看功能
            </Button>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: feature.delay, duration: 0.5 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card className="h-full glass figma-shadow hover:figma-shadow-lg transition-all cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4",
                    feature.color
                  )}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 figma-shadow"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + index * 0.1, duration: 0.4 }}
              >
                <div className="flex items-center justify-center mb-2">
                  <stat.icon className="h-5 w-5 text-primary mr-2" />
                  <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                </div>
                <p className="text-gray-600 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <p className="text-gray-500 text-sm">
            Made with ❤️ by the MCP Tekla+ Team
          </p>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20"
          animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-20"
          animate={{ y: [0, 20, 0], rotate: [0, -180, -360] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-12 h-12 bg-green-200 rounded-full opacity-20"
          animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  )
}
