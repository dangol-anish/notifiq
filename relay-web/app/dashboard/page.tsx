import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/auth/LogoutButton'
import NotificationBell from '@/components/notifications/NotificationBell'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <span className="font-semibold text-gray-900">Notifiq</span>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <span className="text-sm text-gray-500">{session.user?.email}</span>
          <LogoutButton />
        </div>
      </nav>
      <div className="max-w-4xl mx-auto mt-12 px-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome, {session.user?.name || session.user?.email}</p>
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No workspaces yet.</p>
          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Create Workspace
          </button>
        </div>
      </div>
    </main>
  )
}