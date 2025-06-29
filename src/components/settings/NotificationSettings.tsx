import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, Mail, Volume2 } from 'lucide-react'

interface NotificationSettingsProps {
  onSettingsChange: () => void
}

export function NotificationSettings({ onSettingsChange }: NotificationSettingsProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>通知設定</CardTitle>
          <p className="text-sm text-muted-foreground">
            管理系統通知與提醒
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center space-x-3">
                <Bell className="h-4 w-4" />
                <div>
                  <div className="font-medium">桌面通知</div>
                  <div className="text-sm text-muted-foreground">顯示系統桌面通知</div>
                </div>
              </div>
              <input type="checkbox" defaultChecked onChange={onSettingsChange} />
            </div>

            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center space-x-3">
                <Volume2 className="h-4 w-4" />
                <div>
                  <div className="font-medium">聲音提醒</div>
                  <div className="text-sm text-muted-foreground">播放通知聲音</div>
                </div>
              </div>
              <input type="checkbox" onChange={onSettingsChange} />
            </div>

            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4" />
                <div>
                  <div className="font-medium">電子郵件通知</div>
                  <div className="text-sm text-muted-foreground">重要事件郵件提醒</div>
                </div>
              </div>
              <input type="checkbox" onChange={onSettingsChange} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
