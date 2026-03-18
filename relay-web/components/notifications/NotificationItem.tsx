'use client'

import { formatDistanceToNow } from 'date-fns'
import { Notification } from '@/types/notification'

interface Props {
  notification: Notification
  onMarkRead: (id: string) => void
}

export default function NotificationItem({ notification, onMarkRead }: Props) {
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })

  return (
    <div
      onClick={() => !notification.read && onMarkRead(notification.id)}
      className={`px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
        !notification.read ? 'bg-blue-50' : 'bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          {!notification.read && (
            <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
          )}
          <div>
            <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'font-normal text-gray-600'}`}>
              {notification.title}
            </p>
            {notification.body && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.body}</p>
            )}
          </div>
        </div>
        <span className="text-xs text-gray-400 shrink-0">{timeAgo}</span>
      </div>
    </div>
  )
}