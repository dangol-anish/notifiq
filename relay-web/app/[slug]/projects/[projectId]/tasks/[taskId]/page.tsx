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
import WorkspaceSwitcher from "@/components/workspace/WorkspaceSwitcher";
import AISummary from "@/components/task/AISummary";
import { truncate } from "fs";
import { truncateWords } from "@/lib/truncate";

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

  const projectRows = await sql`
    SELECT status FROM projects
    WHERE id = ${projectId} AND workspace_id = ${workspace.id}
  `;
  const projectArchived =
    projectRows.length > 0 && projectRows[0].status === "archived";

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
    urgent: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
    high: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
    medium:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400",
    low: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
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
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-3 text-sm">
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
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
          <Link
            href={`/${slug}/projects/${projectId}`}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            Project
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="line-clamp-1 font-semibold text-gray-900 dark:text-gray-100">
            {task.title}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <LogoutButton />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto mt-8 px-6 pb-12">
        {projectArchived && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
            This project is archived. Task details are read-only until the
            project is restored.
          </div>
        )}
        <div className=" border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-start justify-between gap-4">
            <h2 className="mb-4 text-lg font-semibold text-primary font-serif dark:text-gray-100">
              {task.title}
            </h2>
            <div className="flex items-center gap-2">
              <TaskStatusSelect
                taskId={taskId}
                currentStatus={task.status}
                readOnly={projectArchived}
              />
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
                canEdit={canEdit && !projectArchived}
              />
            </div>
          </div>

          {task.description && (
            <p className=" text-sm text-gray-600 dark:text-gray-300">
              {truncateWords(task.description, 70)}
            </p>
          )}

          <AISummary taskId={taskId} readOnly={projectArchived} />

          <div className=" flex flex-wrap gap-4 border-t border-gray-100 pt-4 dark:border-gray-800">
            <div>
              <p className="block text-xs font-semibold uppercase tracking-widest text-[#604021] mb-2">
                Priority
              </p>
              <span
                className={`text-xs px-2 py-1 rounded-sm font-medium first-letter:uppercase ${priorityColors[task.priority]}`}
              >
                {task.priority}
              </span>
            </div>

            {task.assignee_name && (
              <div>
                <p className="block text-xs font-semibold uppercase tracking-widest text-[#604021] mb-2">
                  Assignee
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
                    {task.assignee_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {task.assignee_name}
                  </span>
                </div>
              </div>
            )}

            {task.due_date && (
              <div>
                <p className="block text-xs font-semibold uppercase tracking-widest text-[#604021] mb-2">
                  Due date
                </p>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {new Date(task.due_date).toLocaleDateString()}
                </span>
              </div>
            )}

            <div>
              <TaskLabels
                taskId={taskId}
                workspaceSlug={slug}
                initialLabels={taskLabels as any[]}
                readOnly={projectArchived}
              />
            </div>

            <div>
              <p className="block text-xs font-semibold uppercase tracking-widest text-[#604021] mb-2">
                Created by
              </p>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {task.creator_name}
              </span>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="mt-3">
          <CommentThread
            taskId={taskId}
            initialComments={comments}
            currentUserId={session.user.id}
            currentUserName={session.user.name || session.user.email || ""}
            readOnly={projectArchived}
          />
        </div>

        {/* Attachments */}
        <div className="mt-3">
          <AttachmentsSection
            taskId={taskId}
            initialAttachments={attachments as any[]}
            readOnly={projectArchived}
          />
        </div>
      </div>
    </main>
  );
}
