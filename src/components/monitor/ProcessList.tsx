import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Circle,
  Square,
  Play,
  Pause
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProcessInfo } from '@/types/system'
import { cn } from '@/lib/utils'

interface ProcessListProps {
  processes: ProcessInfo[]
  formatBytes: (bytes: number) => string
  className?: string
}

type SortField = 'name' | 'cpuUsage' | 'memoryUsage' | 'pid'
type SortDirection = 'asc' | 'desc'

export function ProcessList({ processes, formatBytes, className }: ProcessListProps) {
  const [sortField, setSortField] = useState<SortField>('cpuUsage')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [showAll, setShowAll] = useState(false)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const sortedProcesses = [...processes].sort((a, b) => {
    let aValue: string | number
    let bValue: string | number

    switch (sortField) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'cpuUsage':
        aValue = a.cpuUsage
        bValue = b.cpuUsage
        break
      case 'memoryUsage':
        aValue = a.memoryUsage
        bValue = b.memoryUsage
        break
      case 'pid':
        aValue = a.pid
        bValue = b.pid
        break
      default:
        return 0
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    } else {
      return sortDirection === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number)
    }
  })

  const displayedProcesses = showAll ? sortedProcesses : sortedProcesses.slice(0, 5)

  const getStatusIcon = (status: ProcessInfo['status']) => {
    switch (status) {
      case 'running':
        return <Play className="h-3 w-3 text-green-500" />
      case 'sleeping':
        return <Pause className="h-3 w-3 text-yellow-500" />
      case 'stopped':
        return <Square className="h-3 w-3 text-red-500" />
      case 'zombie':
        return <Circle className="h-3 w-3 text-gray-500" />
      default:
        return <Circle className="h-3 w-3 text-gray-500" />
    }
  }

  const getStatusColor = (status: ProcessInfo['status']) => {
    switch (status) {
      case 'running':
        return 'text-green-600'
      case 'sleeping':
        return 'text-yellow-600'
      case 'stopped':
        return 'text-red-600'
      case 'zombie':
        return 'text-gray-600'
      default:
        return 'text-gray-600'
    }
  }

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-auto p-1 font-medium text-xs"
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field ? (
          sortDirection === 'asc' ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-50" />
        )}
      </div>
    </Button>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className={className}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">進程列表</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? '顯示前 5 個' : '顯示全部'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground border-b pb-2">
              <div className="col-span-1">
                <SortButton field="pid">PID</SortButton>
              </div>
              <div className="col-span-5">
                <SortButton field="name">進程名稱</SortButton>
              </div>
              <div className="col-span-2">
                <SortButton field="cpuUsage">CPU</SortButton>
              </div>
              <div className="col-span-2">
                <SortButton field="memoryUsage">記憶體</SortButton>
              </div>
              <div className="col-span-2">狀態</div>
            </div>

            {/* Process Rows */}
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {displayedProcesses.map((process, index) => (
                <motion.div
                  key={process.pid}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="grid grid-cols-12 gap-2 text-xs py-2 px-2 rounded hover:bg-muted/50 transition-colors"
                >
                  <div className="col-span-1 font-mono">
                    {process.pid}
                  </div>
                  <div className="col-span-5 truncate font-medium">
                    {process.name}
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center space-x-1">
                      <span className={cn(
                        "font-medium",
                        process.cpuUsage > 50 ? "text-red-600" :
                        process.cpuUsage > 20 ? "text-yellow-600" : "text-green-600"
                      )}>
                        {Math.round(process.cpuUsage)}%
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">
                      {formatBytes(process.memoryUsage)}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(process.status)}
                      <span className={cn("capitalize", getStatusColor(process.status))}>
                        {process.status === 'running' ? '運行' :
                         process.status === 'sleeping' ? '休眠' :
                         process.status === 'stopped' ? '停止' : '殭屍'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Summary */}
            <div className="border-t pt-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>總進程數: {processes.length}</span>
                <span>
                  運行中: {processes.filter(p => p.status === 'running').length}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
