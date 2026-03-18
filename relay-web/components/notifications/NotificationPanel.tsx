'use client'

import { useNotifications } from '@/hooks/useNotifications'
import NotificationItem from './NotificationItem'

export default function NotificationPanel() {
  const { notifications, isLoading, markRead, markAllRead } = useNotifications()

  return (
    <div className="absolute right-0 top-10 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
        <button
          onClick={markAllRead}
          className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
        >
          Mark all read
        </button>
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            No notifications yet
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onMarkRead={markRead}
            />
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100 text-center">
          <span className="text-xs text-gray-400">
            {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  )
}