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
      className={`cursor-pointer border-b border-gray-100 px-4 py-3 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/80 ${
        !notification.read
          ? "bg-blue-50 dark:bg-blue-950/40"
          : "bg-white dark:bg-gray-900"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          {!notification.read && (
            <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
          )}
          <div>
            <p
              className={`text-sm ${
                !notification.read
                  ? "font-semibold text-gray-900 dark:text-gray-100"
                  : "font-normal text-gray-600 dark:text-gray-400"
              }`}
            >
              {notification.title}
            </p>
            {notification.body && (
              <p className="mt-0.5 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                {notification.body}
              </p>
            )}
          </div>
        </div>
        <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
          {timeAgo}
        </span>
      </div>
    </div>
  )
}