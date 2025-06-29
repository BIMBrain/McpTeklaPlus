import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wrench, FolderOpen, CheckCircle } from 'lucide-react'

interface TeklaSettingsProps {
  onSettingsChange: () => void
}

export function TeklaSettings({ onSettingsChange }: TeklaSettingsProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Tekla Structures 整合設定</CardTitle>
          <p className="text-sm text-muted-foreground">
            配置 Tekla Structures 連接與路徑
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Tekla 安裝路徑</label>
            <div className="flex mt-1">
              <input 
                type="text" 
                defaultValue="C:\Program Files\Tekla Structures\2025.0"
                className="flex-1 p-2 border rounded-l"
                onChange={onSettingsChange}
              />
              <Button variant="outline" className="rounded-l-none">
                <FolderOpen className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">模型備份路徑</label>
            <div className="flex mt-1">
              <input 
                type="text" 
                defaultValue="C:\TeklaStructuresModels\Backup"
                className="flex-1 p-2 border rounded-l"
                onChange={onSettingsChange}
              />
              <Button variant="outline" className="rounded-l-none">
                <FolderOpen className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="autoConnect"
              defaultChecked
              onChange={onSettingsChange}
            />
            <label htmlFor="autoConnect" className="text-sm">自動連接 Tekla</label>
          </div>

          <div className="flex items-center space-x-2 p-3 bg-green-50 rounded">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-700">Tekla Structures 2025 已連接</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
