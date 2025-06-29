import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Cpu, Play, Settings } from 'lucide-react'

interface LmStudioSettingsProps {
  onSettingsChange: () => void
}

export function LmStudioSettings({ onSettingsChange }: LmStudioSettingsProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>LM Studio 設定</CardTitle>
          <p className="text-sm text-muted-foreground">
            配置本地 LM Studio 服務連接
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">主機地址</label>
              <input 
                type="text" 
                defaultValue="localhost"
                className="w-full mt-1 p-2 border rounded"
                onChange={onSettingsChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium">端口</label>
              <input 
                type="number" 
                defaultValue="1234"
                className="w-full mt-1 p-2 border rounded"
                onChange={onSettingsChange}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Play className="h-4 w-4 mr-1" />
              測試連接
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-1" />
              高級設定
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
