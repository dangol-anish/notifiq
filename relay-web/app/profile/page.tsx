import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import NotificationBell from "@/components/notifications/NotificationBell";
import ProfileForm from "@/components/auth/ProfileForm";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const rows = await sql`
    SELECT id, name, email, image FROM users WHERE id = ${session.user.id}
  `;

  const user = rows[0];

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
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            Profile
          </span>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <LogoutButton />
        </div>
      </nav>

      <div className="max-w-xl mx-auto mt-8 px-6 pb-12">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h1 className="mb-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Your Profile
          </h1>

          {/* Avatar */}
          <div className="mb-6 flex items-center gap-4 border-b border-gray-100 pb-6 dark:border-gray-800">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 text-2xl font-bold text-white">
              {(user.name || user.email).charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {user.name || "No name set"}
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {user.email}
              </p>
            </div>
          </div>

          <ProfileForm currentName={user.name || ""} />
        </div>
      </div>
    </main>
  );
}
