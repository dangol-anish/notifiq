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
      <main className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Invalid invite
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            This invite link has expired or already been used.
          </p>
        </div>
      </main>
    );
  }

  const invite = rows[0];

  if (session.user.email?.toLowerCase() !== invite.email.toLowerCase()) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Wrong account
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
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
