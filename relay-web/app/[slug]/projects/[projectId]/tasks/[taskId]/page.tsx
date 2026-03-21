import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import NotificationBell from "@/components/notifications/NotificationBell";
import CommentThread from "@/components/comment/CommentThread";
import TaskStatusSelect from "@/components/task/TaskStatusSelect";
import AttachmentsSection from "@/components/attachment/AttachmentsSection";
import TaskLabels from "@/components/task/TaskLabels";
import TaskActions from "@/components/task/TaskActions";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ slug: string; projectId: string; taskId: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { slug, projectId, taskId } = await params;

  const workspaceRows = await sql`
    SELECT w.* FROM workspaces w
    JOIN workspace_members wm ON wm.workspace_id = w.id
    WHERE w.slug = ${slug} AND wm.user_id = ${session.user.id}
  `;
  if (!workspaceRows.length) redirect("/dashboard");
  const workspace = workspaceRows[0];

  const taskRows = await sql`
    SELECT t.*,
      u.name as assignee_name,
      u.email as assignee_email,
      c.name as creator_name
    FROM tasks t
    LEFT JOIN users u ON u.id = t.assignee_id
    LEFT JOIN users c ON c.id = t.created_by
    WHERE t.id = ${taskId} AND t.workspace_id = ${workspace.id}
  `;
  if (!taskRows.length) redirect(`/${slug}/projects/${projectId}`);
  const task = taskRows[0];

  const comments = await sql`
    SELECT cm.*, u.name as author_name, u.image as author_image
    FROM comments cm
    JOIN users u ON u.id = cm.author_id
    WHERE cm.task_id = ${taskId}
    ORDER BY cm.created_at ASC
  `;

  const attachments = await sql`
    SELECT a.*, u.name as uploader_name
    FROM attachments a
    JOIN users u ON u.id = a.uploaded_by
    WHERE a.task_id = ${taskId}
    ORDER BY a.created_at DESC
  `;

  const taskLabels = await sql`
  SELECT l.* FROM task_labels tl
  JOIN labels l ON l.id = tl.label_id
  WHERE tl.task_id = ${taskId}
`;

  const priorityColors: Record<string, string> = {
    urgent: "bg-red-100 text-red-700",
    high: "bg-orange-100 text-orange-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-gray-100 text-gray-600",
  };

  const members = await sql`
  SELECT u.id, u.name, u.email
  FROM workspace_members wm
  JOIN users u ON u.id = wm.user_id
  WHERE wm.workspace_id = ${workspace.id}
`;

  const userRole = await sql`
  SELECT wm.role FROM workspace_members wm
  WHERE wm.workspace_id = ${workspace.id} AND wm.user_id = ${session.user.id}
`;

  const canEdit = userRole.length > 0;

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
            Dashboard
          </Link>
          <span className="text-gray-300">/</span>
          <Link href={`/${slug}`} className="text-gray-400 hover:text-gray-600">
            {workspace.name}
          </Link>
          <span className="text-gray-300">/</span>
          <Link
            href={`/${slug}/projects/${projectId}`}
            className="text-gray-400 hover:text-gray-600"
          >
            Project
          </Link>
          <span className="text-gray-300">/</span>
          <span className="font-semibold text-gray-900 line-clamp-1">
            {task.title}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <LogoutButton />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto mt-8 px-6 pb-12">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-xl font-bold text-gray-900">{task.title}</h1>
            <div className="flex items-center gap-2">
              <TaskStatusSelect taskId={taskId} currentStatus={task.status} />
              <TaskActions
                taskId={taskId}
                projectId={projectId}
                workspaceSlug={slug}
                currentTitle={task.title}
                currentDescription={task.description}
                currentPriority={task.priority}
                currentDueDate={task.due_date}
                currentAssigneeId={task.assignee_id}
                members={members as any[]}
                canEdit={canEdit}
              />
            </div>
          </div>

          {task.description && (
            <p className="text-gray-600 text-sm mt-3">{task.description}</p>
          )}

          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-400 mb-1">Priority</p>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[task.priority]}`}
              >
                {task.priority}
              </span>
            </div>

            {task.assignee_name && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Assignee</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                    {task.assignee_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700">
                    {task.assignee_name}
                  </span>
                </div>
              </div>
            )}

            {task.due_date && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Due date</p>
                <span className="text-sm text-gray-700">
                  {new Date(task.due_date).toLocaleDateString()}
                </span>
              </div>
            )}

            <div>
              <TaskLabels
                taskId={taskId}
                workspaceSlug={slug}
                initialLabels={taskLabels as any[]}
              />
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-1">Created by</p>
              <span className="text-sm text-gray-700">{task.creator_name}</span>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="mt-6">
          <CommentThread
            taskId={taskId}
            initialComments={comments}
            currentUserId={session.user.id}
            currentUserName={session.user.name || session.user.email || ""}
          />
        </div>

        {/* Attachments */}
        <div className="mt-6">
          <AttachmentsSection
            taskId={taskId}
            initialAttachments={attachments as any[]}
          />
        </div>
      </div>
    </main>
  );
}
