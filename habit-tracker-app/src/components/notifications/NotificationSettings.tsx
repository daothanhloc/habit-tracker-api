import React, { useState, useEffect } from 'react'
import { Bell, BellOff } from 'lucide-react'
import { NotificationManager } from '../../utils/notifications'
import { Button } from '../common/Button'
import { Card } from '../common/Card'

export const NotificationSettings: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkPermissionStatus()
  }, [])

  const checkPermissionStatus = async () => {
    const status = await NotificationManager.checkPermission()
    setPermission(status)
  }

  const handleRequestPermission = async () => {
    setLoading(true)
    const status = await NotificationManager.requestPermission()
    setPermission(status)
    setLoading(false)

    if (status === 'granted') {
      NotificationManager.showNotification('Notifications Enabled', {
        body: 'You will now receive habit reminders!',
      })
    }
  }

  const handleTestNotification = () => {
    NotificationManager.showNotification('Test Notification', {
      body: 'This is a test notification from Habit Tracker',
    })
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          {permission === 'granted' ? (
            <Bell className="text-green-600" size={24} />
          ) : (
            <BellOff className="text-gray-400" size={24} />
          )}
          <div>
            <h3 className="text-lg font-semibold">Notification Settings</h3>
            <p className="text-sm text-gray-600">
              {permission === 'granted'
                ? 'Notifications are enabled'
                : permission === 'denied'
                ? 'Notifications are blocked'
                : 'Enable notifications to receive habit reminders'}
            </p>
          </div>
        </div>

        {permission === 'default' && (
          <Button onClick={handleRequestPermission} disabled={loading}>
            {loading ? 'Requesting...' : 'Enable Notifications'}
          </Button>
        )}

        {permission === 'granted' && (
          <Button onClick={handleTestNotification} variant="secondary">
            Send Test Notification
          </Button>
        )}

        {permission === 'denied' && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Notifications are blocked. Please enable them in your browser settings.
            </p>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-2">About Notifications</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Get reminders to track your habits</li>
          <li>• Stay consistent with your goals</li>
          <li>• Notifications work even when the app is closed (on supported browsers)</li>
          <li>• You can customize notification times for each habit</li>
        </ul>
      </Card>
    </div>
  )
}
