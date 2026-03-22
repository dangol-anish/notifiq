import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import LogoutButton from "@/components/auth/LogoutButton";
import NotificationBell from "@/components/notifications/NotificationBell";
import CreateWorkspaceModal from "@/components/workspace/CreateWorkspaceModal";
import WorkspaceCard from "@/components/workspace/WorkspaceCard";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const workspaces = await sql`
    SELECT w.*, wm.role
    FROM workspaces w
    JOIN workspace_members wm ON wm.workspace_id = w.id
    WHERE wm.user_id = ${session.user.id}
    ORDER BY w.created_at DESC
  `;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 dark:border-gray-800 dark:bg-gray-900">
        <h1 className="text-xl font-bold font-serif text-emerald-900 dark:text-emerald-50">
          Notifiq
        </h1>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <Link
            href="/profile"
            className="text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            {session.user?.name || session.user?.email}
          </Link>
          <LogoutButton />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto mt-12 px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary dark:text-gray-100">
              Workspaces
            </h1>
            <p className="mt-1 text-primary-container/70 text-sm dark:text-gray-400 flex">
              Welcome back,{" "}
              <p className="font-semibold ml-0.5">
                {session.user?.name || session.user?.email}
              </p>
              !
            </p>
          </div>
          <CreateWorkspaceModal />
        </div>

        {workspaces.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-primary mb-1">
              No workspaces yet
            </h3>
            <p className="text-secondary text-sm mb-4">
              Create a workspace to start collaborating with your team.
            </p>
            <CreateWorkspaceModal />
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
  );
}
