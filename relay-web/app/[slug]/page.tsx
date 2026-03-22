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
import SearchBar from "@/components/workspace/SearchBar";
import WorkspaceSwitcher from "@/components/workspace/WorkspaceSwitcher";

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
  SELECT 
    p.*,
    COUNT(t.id) as total_tasks,
    COUNT(t.id) FILTER (WHERE t.status = 'done') as completed_tasks,
    COUNT(t.id) FILTER (WHERE t.status = 'in_progress') as in_progress_tasks,
    COUNT(t.id) FILTER (WHERE t.status = 'todo') as todo_tasks
  FROM projects p
  LEFT JOIN tasks t ON t.project_id = p.id
  WHERE p.workspace_id = ${workspace.id}
  GROUP BY p.id
  ORDER BY p.created_at DESC
`;
  const members = await sql`
    SELECT u.id, u.name, u.email, u.image, wm.role
    FROM workspace_members wm
    JOIN users u ON u.id = wm.user_id
    WHERE wm.workspace_id = ${workspace.id}
  `;

  const canEdit = ["owner", "admin"].includes(workspace.role);

  const activeProjects = projects.filter((p: { status?: string }) => p.status !== "archived");
  const archivedProjects = projects.filter(
    (p: { status?: string }) => p.status === "archived",
  );

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            ← Dashboard
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <WorkspaceSwitcher
            currentSlug={slug}
            currentName={workspace.name}
          />
        </div>
        <div className="flex items-center gap-4">
          <SearchBar slug={slug} />
          <NotificationBell />
          <span className="text-sm text-gray-500 dark:text-gray-400">{session.user?.email}</span>
          <LogoutButton />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto mt-12 px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {workspace.name}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {members.length} member{members.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/${slug}/settings`}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Settings
            </Link>
            {canEdit && <CreateProjectModal slug={slug} />}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {activeProjects.length === 0 && archivedProjects.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
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
                      d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  No projects yet
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Create a project to start managing tasks with your team.
                </p>
                {canEdit && <CreateProjectModal slug={slug} />}
              </div>
            ) : (
              <div className="space-y-8">
                {activeProjects.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-900">
                    <p className="text-sm text-gray-500">
                      No active projects. Restore one from archived or create a
                      new project.
                    </p>
                    {canEdit && (
                      <div className="mt-4 flex justify-center">
                        <CreateProjectModal slug={slug} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeProjects.map((p: any) => (
                      <ProjectCard
                        key={p.id}
                        project={p}
                        slug={slug}
                        canEdit={canEdit}
                      />
                    ))}
                  </div>
                )}

                {archivedProjects.length > 0 && (
                  <details className="group rounded-xl border border-gray-200 bg-gray-50/80 dark:border-gray-800 dark:bg-gray-900/50">
                    <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-gray-600 flex items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
                      <span>
                        Archived projects
                        <span className="ml-2 text-gray-400 font-normal">
                          ({archivedProjects.length})
                        </span>
                      </span>
                      <span className="text-gray-400 text-xs group-open:rotate-180 transition-transform">
                        ▼
                      </span>
                    </summary>
                    <div className="border-t border-gray-100 px-4 pb-4 pt-0 dark:border-gray-800">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                        {archivedProjects.map((p: any) => (
                          <ProjectCard
                            key={p.id}
                            project={p}
                            slug={slug}
                            canEdit={canEdit}
                          />
                        ))}
                      </div>
                    </div>
                  </details>
                )}
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
