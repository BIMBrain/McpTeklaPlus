import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Key, Lock, Eye } from 'lucide-react'

interface SecuritySettingsProps {
  onSettingsChange: () => void
}

export function SecuritySettings({ onSettingsChange }: SecuritySettingsProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>安全設定</CardTitle>
          <p className="text-sm text-muted-foreground">
            管理安全與隱私設定
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center space-x-3">
                <Lock className="h-4 w-4" />
                <div>
                  <div className="font-medium">自動鎖定</div>
                  <div className="text-sm text-muted-foreground">閒置時自動鎖定應用程式</div>
                </div>
              </div>
              <input type="checkbox" onChange={onSettingsChange} />
            </div>

            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center space-x-3">
                <Eye className="h-4 w-4" />
                <div>
                  <div className="font-medium">隱私模式</div>
                  <div className="text-sm text-muted-foreground">隱藏敏感資訊</div>
                </div>
              </div>
              <input type="checkbox" onChange={onSettingsChange} />
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-medium mb-3">API 金鑰管理</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Key className="h-4 w-4 mr-2" />
                管理 API 金鑰
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                清除快取資料
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
