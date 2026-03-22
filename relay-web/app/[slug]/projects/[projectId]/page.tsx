import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import NotificationBell from "@/components/notifications/NotificationBell";
import KanbanBoard from "@/components/task/KanbanBoard";
import CreateTaskModal from "@/components/task/CreateTaskModal";
import AITaskGenerator from "@/components/task/AITaskGenerator";
import ProjectActionsWrapper from "@/components/project/ProjectActionsWrapper";
import { TaskProvider } from "@/context/TaskContext";
import WorkspaceSwitcher from "@/components/workspace/WorkspaceSwitcher";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string; projectId: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { slug, projectId } = await params;

  const workspaceRows = await sql`
    SELECT w.*, wm.role FROM workspaces w
    JOIN workspace_members wm ON wm.workspace_id = w.id
    WHERE w.slug = ${slug} AND wm.user_id = ${session.user.id}
  `;

  if (!workspaceRows.length) redirect("/dashboard");
  const workspace = workspaceRows[0];
  const canEdit = ["owner", "admin"].includes(workspace.role as string);

  const projectRows = await sql`
    SELECT * FROM projects
    WHERE id = ${projectId} AND workspace_id = ${workspace.id}
  `;

  if (!projectRows.length) redirect(`/${slug}`);
  const project = projectRows[0];
  const projectArchived = project.status === "archived";

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

  const labels = await sql`
  SELECT * FROM labels
  WHERE workspace_id = ${workspace.id}
  ORDER BY name ASC
`;

  return (
    <TaskProvider workspaceId={workspace.id} initialTasks={tasks as any[]}>
      <main className="min-h-screen overflow-x-hidden bg-gray-50 dark:bg-gray-950">
        <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              Dashboard
            </Link>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <WorkspaceSwitcher
              currentSlug={slug}
              currentName={workspace.name as string}
              variant="breadcrumb"
            />
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">{project.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <span className="text-sm text-gray-500 dark:text-gray-400">{session.user?.email}</span>
            <LogoutButton />
          </div>
        </nav>

        <div className="max-w-7xl mx-auto mt-8 px-6 overflow-x-clip">
          {projectArchived && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
              This project is <strong>archived</strong>. You can view tasks, but
              editing and new work are disabled until you restore it.
            </div>
          )}
          <div className="flex items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {project.name}
              </h1>
              {project.description && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {project.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {canEdit && (
                <ProjectActionsWrapper
                  project={{
                    id: project.id,
                    name: project.name,
                    description: project.description,
                    status: project.status,
                  }}
                  slug={slug}
                  canEdit={canEdit}
                />
              )}
              {!projectArchived && (
                <>
                  <AITaskGenerator
                    projectId={projectId}
                    workspaceSlug={slug}
                  />
                  <CreateTaskModal
                    projectId={projectId}
                    workspaceSlug={slug}
                    members={members as any[]}
                  />
                </>
              )}
            </div>
          </div>

          <KanbanBoard
            projectId={projectId}
            workspaceSlug={slug}
            members={members as any[]}
            labels={labels as any[]}
            readOnly={projectArchived}
          />
        </div>
      </main>
    </TaskProvider>
  );
}
