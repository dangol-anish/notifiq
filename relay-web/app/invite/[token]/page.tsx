import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";

export default async function InvitePage({
  params,
}: {
  params: { token: string };
}) {
  const { token } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(`/login?callbackUrl=/invite/${token}`);
  }

  const rows = await sql`
    SELECT wi.*, w.slug FROM workspace_invites wi
    JOIN workspaces w ON w.id = wi.workspace_id
    WHERE wi.token = ${token}
    AND wi.accepted = false
    AND wi.expires_at > NOW()
  `;

  if (!rows.length) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center max-w-md">
          <h1 className="text-xl font-bold text-gray-900">Invalid invite</h1>
          <p className="text-gray-500 mt-2">
            This invite link has expired or already been used.
          </p>
        </div>
      </main>
    );
  }

  const invite = rows[0];

  if (session.user.email?.toLowerCase() !== invite.email.toLowerCase()) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center max-w-md">
          <h1 className="text-xl font-bold text-gray-900">Wrong account</h1>
          <p className="text-gray-500 mt-2">
            This invite was sent to a different email address. Please sign in
            with the correct account to accept it.
          </p>

          <a
            href="/login"
            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Sign in with correct account
          </a>
        </div>
      </main>
    );
  }

  await sql`
    INSERT INTO workspace_members (workspace_id, user_id, role)
    VALUES (${invite.workspace_id}, ${session.user.id}, 'member')
    ON CONFLICT DO NOTHING
  `;

  await sql`
    UPDATE workspace_invites SET accepted = true WHERE token = ${token}
  `;

  redirect(`/${invite.slug}`);
}
