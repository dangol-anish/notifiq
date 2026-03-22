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
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
            Dashboard
          </Link>
          <span className="text-gray-300">/</span>
          <span className="font-semibold text-gray-900">Profile</span>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <LogoutButton />
        </div>
      </nav>

      <div className="max-w-xl mx-auto mt-8 px-6 pb-12">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h1 className="text-lg font-semibold text-gray-900 mb-6">
            Your Profile
          </h1>

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
              {(user.name || user.email).charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {user.name || "No name set"}
              </p>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
          </div>

          <ProfileForm currentName={user.name || ""} />
        </div>
      </div>
    </main>
  );
}
