'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { io, Socket } from 'socket.io-client'
import { Notification } from '@/types/notification'

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  isConnected: boolean
  isLoading: boolean
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [socket, setSocket] = useState<Socket | null>(null)

  const fetchNotifications = useCallback(async (unseenOnly = false) => {
    try {
      const url = unseenOnly
        ? '/api/notifications?unseen=true'
        : '/api/notifications'
      const res = await fetch(url)
      const data = await res.json()

      if (unseenOnly) {
        setNotifications((prev) => {
          const existingIds = new Set(prev.map((n) => n.id))
          const newOnes = data.notifications.filter((n: Notification) => !existingIds.has(n.id))
          return [...newOnes, ...prev]
        })
        setUnreadCount((prev) => prev + data.notifications.length)
      } else {
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (err) {
      console.error('[notifications] fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))

    try {
      await fetch(`/api/notifications/${id}`, { method: 'PATCH' })
    } catch (err) {
      console.error('[notifications] markRead error:', err)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: false } : n))
      )
      setUnreadCount((prev) => prev + 1)
    }
  }, [])

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)

    try {
      await fetch('/api/notifications/read-all', { method: 'PATCH' })
    } catch (err) {
      console.error('[notifications] markAllRead error:', err)
      fetchNotifications()
    }
  }, [fetchNotifications])

  useEffect(() => {
    // Don't connect until we have a session
    if (!session?.user?.id) return

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001'

    const newSocket = io(wsUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
    })

    newSocket.on('connect', () => {
      console.log('[ws] connected')
      setIsConnected(true)

      newSocket.emit('auth', {
        userId: session.user.id,
        token: session.user.id,
      })
    })

    newSocket.on('disconnect', () => {
      console.log('[ws] disconnected')
      setIsConnected(false)
    })

    newSocket.on('notification:new', (notification: Notification) => {
      console.log('[ws] notification:new', notification)
      setNotifications((prev) => [notification, ...prev])
      setUnreadCount((prev) => prev + 1)
    })

    newSocket.on('notification:read', ({ notificationId, action }: { notificationId?: string; action?: string }) => {
      if (action === 'read-all') {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        setUnreadCount(0)
      } else if (notificationId) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    })

    newSocket.on('reconnect', () => {
      console.log('[ws] reconnected — fetching unseen')
      fetchNotifications(true)
    })

    setSocket(newSocket)
    fetchNotifications()

    return () => {
      newSocket.disconnect()
    }
  }, [fetchNotifications, session?.user?.id])

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, isConnected, isLoading, markRead, markAllRead }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}