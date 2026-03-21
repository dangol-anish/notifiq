import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import NotificationBell from "@/components/notifications/NotificationBell";
import CreateProjectModal from "@/components/project/CreateProjectModal";
import ActivityFeed from "@/components/activity/ActivityFeed";
import ProjectCard from "@/components/project/ProjectCard";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { slug } = await params;

  const rows = await sql`
    SELECT w.*, wm.role
    FROM workspaces w
    JOIN workspace_members wm ON wm.workspace_id = w.id
    WHERE w.slug = ${slug} AND wm.user_id = ${session.user.id}
  `;

  if (!rows.length) redirect("/dashboard");

  const workspace = rows[0];

  const projects = await sql`
    SELECT * FROM projects
    WHERE workspace_id = ${workspace.id}
    ORDER BY created_at DESC
  `;

  const members = await sql`
    SELECT u.id, u.name, u.email, u.image, wm.role
    FROM workspace_members wm
    JOIN users u ON u.id = wm.user_id
    WHERE wm.workspace_id = ${workspace.id}
  `;

  const canEdit = ["owner", "admin"].includes(workspace.role);

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            ← Dashboard
          </Link>
          <span className="text-gray-300">/</span>
          <span className="font-semibold text-gray-900">{workspace.name}</span>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <span className="text-sm text-gray-500">{session.user?.email}</span>
          <LogoutButton />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto mt-12 px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {workspace.name}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {members.length} member{members.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/${slug}/settings`}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Settings
            </Link>
            {canEdit && <CreateProjectModal slug={slug} />}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {projects.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-gray-500">No projects yet.</p>
                <p className="text-gray-400 text-sm mt-1">
                  Create a project to start managing tasks.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {projects.map((p: any) => (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    slug={slug}
                    canEdit={canEdit}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <ActivityFeed slug={slug} />
          </div>
        </div>
      </div>
    </main>
  );
}
