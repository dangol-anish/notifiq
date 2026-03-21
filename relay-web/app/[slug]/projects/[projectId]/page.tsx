import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import NotificationBell from "@/components/notifications/NotificationBell";
import KanbanBoard from "@/components/task/KanbanBoard";
import CreateTaskModal from "@/components/task/CreateTaskModal";
import { TaskProvider } from "@/context/TaskContext";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string; projectId: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { slug, projectId } = await params;

  const workspaceRows = await sql`
    SELECT w.* FROM workspaces w
    JOIN workspace_members wm ON wm.workspace_id = w.id
    WHERE w.slug = ${slug} AND wm.user_id = ${session.user.id}
  `;

  if (!workspaceRows.length) redirect("/dashboard");
  const workspace = workspaceRows[0];

  const projectRows = await sql`
    SELECT * FROM projects
    WHERE id = ${projectId} AND workspace_id = ${workspace.id}
  `;

  if (!projectRows.length) redirect(`/${slug}`);
  const project = projectRows[0];

  const tasks = await sql`
  SELECT t.*,
    u.name as assignee_name,
    u.image as assignee_image,
    COALESCE(
      json_agg(json_build_object('id', l.id, 'name', l.name, 'color', l.color))
      FILTER (WHERE l.id IS NOT NULL), '[]'
    ) as labels
  FROM tasks t
  LEFT JOIN users u ON u.id = t.assignee_id
  LEFT JOIN task_labels tl ON tl.task_id = t.id
  LEFT JOIN labels l ON l.id = tl.label_id
  WHERE t.project_id = ${projectId}
  GROUP BY t.id, u.name, u.image
  ORDER BY t.created_at DESC
`;

  const members = await sql`
    SELECT u.id, u.name, u.email, u.image
    FROM workspace_members wm
    JOIN users u ON u.id = wm.user_id
    WHERE wm.workspace_id = ${workspace.id}
  `;

  return (
    <TaskProvider workspaceId={workspace.id} initialTasks={tasks as any[]}>
      <main className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              Dashboard
            </Link>
            <span className="text-gray-300">/</span>
            <Link
              href={`/${slug}`}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              {workspace.name}
            </Link>
            <span className="text-gray-300">/</span>
            <span className="font-semibold text-gray-900">{project.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <span className="text-sm text-gray-500">{session.user?.email}</span>
            <LogoutButton />
          </div>
        </nav>

        <div className="max-w-7xl mx-auto mt-8 px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {project.name}
              </h1>
              {project.description && (
                <p className="text-gray-500 text-sm mt-1">
                  {project.description}
                </p>
              )}
            </div>
            <CreateTaskModal
              projectId={projectId}
              workspaceSlug={slug}
              members={members as any[]}
            />
          </div>

          <KanbanBoard projectId={projectId} workspaceSlug={slug} />
        </div>
      </main>
    </TaskProvider>
  );
}
