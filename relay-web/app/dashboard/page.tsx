import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { sql } from '@/lib/db'
import LogoutButton from '@/components/auth/LogoutButton'
import NotificationBell from '@/components/notifications/NotificationBell'
import CreateWorkspaceModal from '@/components/workspace/CreateWorkspaceModal'
import WorkspaceCard from '@/components/workspace/WorkspaceCard'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const workspaces = await sql`
    SELECT w.*, wm.role
    FROM workspaces w
    JOIN workspace_members wm ON wm.workspace_id = w.id
    WHERE wm.user_id = ${session.user.id}
    ORDER BY w.created_at DESC
  `

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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Workspaces</h1>
            <p className="text-gray-500 mt-1">Welcome back, {session.user?.name || session.user?.email}</p>
          </div>
          <CreateWorkspaceModal />
        </div>

        {workspaces.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No workspaces yet.</p>
            <p className="text-gray-400 text-sm mt-1">Create one to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaces.map((w: any) => (
              <WorkspaceCard key={w.id} workspace={w} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}