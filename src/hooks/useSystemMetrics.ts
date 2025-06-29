import { useState, useEffect, useCallback } from 'react'
import { SystemMetrics, PerformanceHistory } from '@/types/system'

// Simulate system metrics for demo purposes
function generateMockMetrics(): SystemMetrics {
  const now = new Date()
  
  return {
    timestamp: now,
    cpu: {
      usage: Math.random() * 80 + 10, // 10-90%
      cores: 8,
      frequency: 3200 + Math.random() * 800, // 3.2-4.0 GHz
      temperature: 45 + Math.random() * 25, // 45-70°C
      loadAverage: [
        Math.random() * 2,
        Math.random() * 2,
        Math.random() * 2
      ]
    },
    memory: {
      total: 32 * 1024 * 1024 * 1024, // 32GB
      used: (16 + Math.random() * 8) * 1024 * 1024 * 1024, // 16-24GB
      available: 0,
      usage: 0,
      swap: {
        total: 8 * 1024 * 1024 * 1024, // 8GB
        used: Math.random() * 2 * 1024 * 1024 * 1024, // 0-2GB
        usage: 0
      }
    },
    gpu: [
      {
        id: 0,
        name: 'NVIDIA RTX 4090',
        usage: Math.random() * 90 + 5, // 5-95%
        memory: {
          total: 24 * 1024 * 1024 * 1024, // 24GB
          used: (8 + Math.random() * 12) * 1024 * 1024 * 1024, // 8-20GB
          usage: 0
        },
        temperature: 60 + Math.random() * 20, // 60-80°C
        powerDraw: 200 + Math.random() * 250, // 200-450W
        fanSpeed: 30 + Math.random() * 50 // 30-80%
      }
    ],
    network: {
      bytesReceived: Math.random() * 1000000,
      bytesSent: Math.random() * 1000000,
      packetsReceived: Math.random() * 10000,
      packetsSent: Math.random() * 10000,
      downloadSpeed: Math.random() * 100 * 1024 * 1024, // 0-100 MB/s
      uploadSpeed: Math.random() * 50 * 1024 * 1024 // 0-50 MB/s
    },
    processes: [
      {
        pid: 1234,
        name: 'TeklaStructures.exe',
        cpuUsage: Math.random() * 30,
        memoryUsage: (2 + Math.random() * 4) * 1024 * 1024 * 1024,
        status: 'running'
      },
      {
        pid: 5678,
        name: 'chrome.exe',
        cpuUsage: Math.random() * 20,
        memoryUsage: (1 + Math.random() * 2) * 1024 * 1024 * 1024,
        status: 'running'
      },
      {
        pid: 9012,
        name: 'node.exe',
        cpuUsage: Math.random() * 15,
        memoryUsage: (0.5 + Math.random() * 1) * 1024 * 1024 * 1024,
        status: 'running'
      }
    ]
  }
}

export function useSystemMetrics(updateInterval: number = 1000) {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [history, setHistory] = useState<PerformanceHistory>({
    cpu: [],
    memory: [],
    gpu: [[]],
    network: {
      download: [],
      upload: []
    },
    timestamps: []
  })
  const [isConnected, setIsConnected] = useState(true)

  const updateMetrics = useCallback(() => {
    try {
      const newMetrics = generateMockMetrics()
      
      // Calculate derived values
      newMetrics.memory.available = newMetrics.memory.total - newMetrics.memory.used
      newMetrics.memory.usage = (newMetrics.memory.used / newMetrics.memory.total) * 100
      newMetrics.memory.swap.usage = (newMetrics.memory.swap.used / newMetrics.memory.swap.total) * 100
      
      if (newMetrics.gpu) {
        newMetrics.gpu.forEach(gpu => {
          gpu.memory.usage = (gpu.memory.used / gpu.memory.total) * 100
        })
      }

      setMetrics(newMetrics)

      // Update history (keep last 60 data points)
      setHistory(prev => {
        const maxPoints = 60
        const newHistory = { ...prev }
        
        newHistory.cpu = [...prev.cpu, newMetrics.cpu.usage].slice(-maxPoints)
        newHistory.memory = [...prev.memory, newMetrics.memory.usage].slice(-maxPoints)
        
        if (newMetrics.gpu && newMetrics.gpu.length > 0) {
          newHistory.gpu = [
            [...(prev.gpu[0] || []), newMetrics.gpu[0].usage].slice(-maxPoints)
          ]
        }
        
        newHistory.network.download = [
          ...prev.network.download, 
          newMetrics.network.downloadSpeed
        ].slice(-maxPoints)
        
        newHistory.network.upload = [
          ...prev.network.upload, 
          newMetrics.network.uploadSpeed
        ].slice(-maxPoints)
        
        newHistory.timestamps = [
          ...prev.timestamps, 
          newMetrics.timestamp
        ].slice(-maxPoints)

        return newHistory
      })

      setIsConnected(true)
    } catch (error) {
      console.error('Failed to update metrics:', error)
      setIsConnected(false)
    }
  }, [])

  useEffect(() => {
    // Initial update
    updateMetrics()

    // Set up interval
    const interval = setInterval(updateMetrics, updateInterval)

    return () => clearInterval(interval)
  }, [updateMetrics, updateInterval])

  const formatBytes = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatSpeed = (bytesPerSecond: number): string => {
    return formatBytes(bytesPerSecond) + '/s'
  }

  return {
    metrics,
    history,
    isConnected,
    formatBytes,
    formatSpeed,
    refresh: updateMetrics
  }
}
