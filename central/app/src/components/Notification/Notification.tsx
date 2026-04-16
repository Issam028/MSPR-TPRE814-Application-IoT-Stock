import { useEffect } from 'react'
import './Notification.css'

export interface NotificationMessage {
  id: string
  type: 'success' | 'error'
  message: string
}

interface NotificationProps {
  notifications: NotificationMessage[]
  onRemove: (id: string) => void
}

export function Notification({ notifications, onRemove }: NotificationProps) {
  useEffect(() => {
    notifications.forEach(notification => {
      const timer = setTimeout(() => {
        onRemove(notification.id)
      }, 3000)

      return () => clearTimeout(timer)
    })
  }, [notifications, onRemove])

  return (
    <div className="notifications-container">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type}`}
        >
          <div className="notification-content">
            <span className="notification-icon">
              {notification.type === 'success' ? '✓' : '✕'}
            </span>
            <span className="notification-message">{notification.message}</span>
          </div>
          <button
            className="notification-close"
            onClick={() => onRemove(notification.id)}
            aria-label="Fermer la notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
