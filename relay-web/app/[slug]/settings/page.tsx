import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import NotificationBell from "@/components/notifications/NotificationBell";
import InviteMemberModal from "@/components/workspace/InviteMemberModal";
import ManageLabels from "@/components/workspace/ManageLabels";

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
        {/* Workspace info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Workspace
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
              {workspace.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{workspace.name}</p>
              <p className="text-sm text-gray-400">/{workspace.slug}</p>
            </div>
          </div>
        </div>

        {/* Members */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Members ({members.length})
            </h2>
            {isOwner && <InviteMemberModal slug={slug} />}
          </div>

          {/* Labels */}
          <ManageLabels slug={slug} />

          <div className="space-y-3">
            {members.map((m: any) => (
              <div key={m.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                    {(m.name || m.email).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {m.name || m.email}
                    </p>
                    <p className="text-xs text-gray-400">{m.email}</p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    m.role === "owner"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
