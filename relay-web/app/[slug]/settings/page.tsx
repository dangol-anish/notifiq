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
          <span className="font-semibold text-gray-900">Settings</span>
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
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">
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
          <div className="bg-white rounded-xl border border-red-200 p-6">
            <h2 className="text-sm font-semibold text-red-600 mb-2">
              Danger zone
            </h2>
            <p className="text-sm text-gray-500 mb-4">
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
