'use client'

import { useState } from 'react'
import { useNotifications } from '@/hooks/useNotifications'
import NotificationPanel from './NotificationPanel'

export default function NotificationBell() {
  const { unreadCount, isConnected } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Notifications"
      >
        {/* Bell icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}

        {/* Connection indicator */}
        <span
          className={`absolute bottom-1 right-1 w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-400' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        />
      </button>

      {/* Panel */}
      {isOpen && (
        <>
          {/* Backdrop to close on outside click */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <NotificationPanel />
        </>
      )}
    </div>
  )
}