import NotificationBell from '@/components/notifications/NotificationBell'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <span className="font-semibold text-gray-900">Notifiq</span>
        <NotificationBell />
      </nav>
      <div className="max-w-2xl mx-auto mt-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Notification System Demo</h1>
        <p className="text-gray-500 mt-2">Click the bell icon in the top right to see your notifications.</p>
      </div>
    </main>
  )
}