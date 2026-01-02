export class NotificationManager {
  static async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return 'denied'
    }

    return await Notification.requestPermission()
  }

  static async showNotification(title: string, options?: NotificationOptions) {
    const permission = await this.requestPermission()

    if (permission === 'granted') {
      new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        ...options,
      })
    }
  }

  static scheduleHabitReminder(habitName: string, time: string) {
    const targetTime = new Date(time).getTime()
    const now = Date.now()
    const delay = targetTime - now

    if (delay > 0) {
      setTimeout(() => {
        this.showNotification('Habit Reminder', {
          body: `Time to track: ${habitName}`,
          tag: 'habit-reminder',
        })
      }, delay)
    }
  }

  static async checkPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied'
    }
    return Notification.permission
  }
}
