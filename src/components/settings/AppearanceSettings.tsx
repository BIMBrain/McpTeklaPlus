import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sun, Moon, Monitor, Palette } from 'lucide-react'

interface AppearanceSettingsProps {
  onSettingsChange: () => void
}

export function AppearanceSettings({ onSettingsChange }: AppearanceSettingsProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>外觀設定</CardTitle>
          <p className="text-sm text-muted-foreground">
            自訂介面主題與顯示選項
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-3">主題模式</h3>
            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" className="h-20 flex-col">
                <Sun className="h-6 w-6 mb-2" />
                <span>淺色</span>
              </Button>
              <Button variant="default" className="h-20 flex-col">
                <Moon className="h-6 w-6 mb-2" />
                <span>深色</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Monitor className="h-6 w-6 mb-2" />
                <span>系統</span>
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3">語言設定</h3>
            <select 
              className="w-full p-2 border rounded"
              onChange={onSettingsChange}
            >
              <option value="zh-TW">繁體中文</option>
              <option value="zh-CN">简体中文</option>
              <option value="en-US">English</option>
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">啟用動畫效果</span>
              <input type="checkbox" defaultChecked onChange={onSettingsChange} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">高刷新率模式</span>
              <input type="checkbox" onChange={onSettingsChange} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">GPU 加速</span>
              <input type="checkbox" defaultChecked onChange={onSettingsChange} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
