export interface SystemMetrics {
  timestamp: Date
  cpu: CPUMetrics
  memory: MemoryMetrics
  gpu?: GPUMetrics[]
  network: NetworkMetrics
  processes: ProcessInfo[]
}

export interface CPUMetrics {
  usage: number // 0-100
  cores: number
  frequency: number // MHz
  temperature: number // Celsius
  loadAverage: number[]
}

export interface MemoryMetrics {
  total: number // bytes
  used: number // bytes
  available: number // bytes
  usage: number // 0-100
  swap: {
    total: number
    used: number
    usage: number
  }
}

export interface GPUMetrics {
  id: number
  name: string
  usage: number // 0-100
  memory: {
    total: number // bytes
    used: number // bytes
    usage: number // 0-100
  }
  temperature: number // Celsius
  powerDraw: number // watts
  fanSpeed: number // 0-100
}

export interface NetworkMetrics {
  bytesReceived: number
  bytesSent: number
  packetsReceived: number
  packetsSent: number
  downloadSpeed: number // bytes/sec
  uploadSpeed: number // bytes/sec
}

export interface ProcessInfo {
  pid: number
  name: string
  cpuUsage: number
  memoryUsage: number // bytes
  status: 'running' | 'sleeping' | 'stopped' | 'zombie'
}

export interface PerformanceHistory {
  cpu: number[]
  memory: number[]
  gpu: number[][]
  network: {
    download: number[]
    upload: number[]
  }
  timestamps: Date[]
}
