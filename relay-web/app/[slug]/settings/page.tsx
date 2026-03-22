import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import NotificationBell from "@/components/notifications/NotificationBell";
import InviteMemberModal from "@/components/workspace/InviteMemberModal";
import ManageLabels from "@/components/workspace/ManageLabels";
import WorkspaceSettingsForm from "@/components/workspace/WorkspaceSettingsForm";
import MemberListWithActions from "@/components/workspace/MemberListWithActions";
import DeleteWorkspaceButton from "@/components/workspace/DeleteWorkspaceButton";
import WorkspaceSwitcher from "@/components/workspace/WorkspaceSwitcher";

export default async function WorkspaceSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { slug } = await params;

  const workspaceRows = await sql`
    SELECT w.*, wm.role
    FROM workspaces w
    JOIN workspace_members wm ON wm.workspace_id = w.id
    WHERE w.slug = ${slug} AND wm.user_id = ${session.user.id}
  `;

  if (!workspaceRows.length) redirect("/dashboard");
  const workspace = workspaceRows[0];

  const members = await sql`
    SELECT u.id, u.name, u.email, u.image, wm.role, wm.joined_at
    FROM workspace_members wm
    JOIN users u ON u.id = wm.user_id
    WHERE wm.workspace_id = ${workspace.id}
    ORDER BY wm.joined_at ASC
  `;

  const isOwner = workspace.role === "owner";
  const isAdmin = workspace.role === "admin";

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-3 text-sm">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
            Dashboard
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <WorkspaceSwitcher
            currentSlug={slug}
            currentName={workspace.name}
            variant="breadcrumb"
          />
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">Settings</span>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <LogoutButton />
        </div>
      </nav>

      <div className="max-w-3xl mx-auto mt-8 px-6 pb-12 space-y-6">
        {/* Workspace info + rename */}
        <WorkspaceSettingsForm
          slug={slug}
          currentName={workspace.name}
          isOwner={isOwner}
          isAdmin={isAdmin}
        />

        {/* Members */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Members ({members.length})
            </h2>
            {(isOwner || isAdmin) && <InviteMemberModal slug={slug} />}
          </div>
          <MemberListWithActions
            members={members as any[]}
            slug={slug}
            currentUserId={session.user.id}
            isOwner={isOwner}
          />
        </div>

        {/* Labels */}
        <ManageLabels slug={slug} />

        {/* Danger zone */}
        {isOwner && (
          <div className="rounded-xl border border-red-200 bg-white p-6 dark:border-red-900/60 dark:bg-red-950/20">
            <h2 className="mb-2 text-sm font-semibold text-red-600 dark:text-red-400">
              Danger zone
            </h2>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Deleting this workspace is permanent. All projects, tasks, and
              data will be lost.
            </p>
            <DeleteWorkspaceButton slug={slug} workspaceName={workspace.name} />
          </div>
        )}
      </div>
    </main>
  );
}

// Inline server-compatible import workaround
