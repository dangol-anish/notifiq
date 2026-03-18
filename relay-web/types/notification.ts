export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  body?: string
  payload?: Record<string, unknown>
  read: boolean
  delivered: boolean
  createdAt: string
  readAt?: string
}

export interface CreateEventInput {
  type: string
  senderId: string
  recipientIds: string[]
  title: string
  body?: string
  payload?: Record<string, unknown>
}

export interface NotificationsResponse {
  notifications: Notification[]
  unreadCount: number
  hasMore: boolean
}

export interface PushMessage {
  userId: string
  notification: Notification
}

export interface ReadMessage {
  userId: string
  notificationId?: string
  action?: 'read-all'
}