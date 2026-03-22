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
  const initials = (user.name || user.email).charAt(0).toUpperCase();

  return (
    <main className="min-h-screen bg-[#f8faf8] text-[#191c1b] font-['Public_Sans',sans-serif]">
      {/* ── Nav (unchanged) ── */}
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

      {/* ── Main content ── */}
      <div className="flex justify-center items-start p-8 md:p-16">
        <div className="w-full max-w-3xl">
          {/* Page header */}
          <div className="mb-12">
            <h1
              className="text-4xl font-bold text-[#163328] mb-2"
              style={{ fontFamily: "'Noto Serif', serif" }}
            >
              Your Profile
            </h1>
            <div className="h-1 w-12 bg-[#43270b]" />
          </div>

          {/* Profile card */}
          <section
            className="bg-white p-8 md:p-12 border border-[#c1c8c3]/20"
            style={{ boxShadow: "12px 12px 32px -4px rgba(25,28,27,0.06)" }}
          >
            {/* Avatar + identity */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
              <div className="relative group">
                <div
                  className="w-24 h-24 rounded-full bg-[#2d4a3e] flex items-center justify-center text-white text-3xl font-bold transition-transform duration-300 group-hover:scale-105"
                  style={{ fontFamily: "'Noto Serif', serif" }}
                >
                  {initials}
                </div>
                {/* Edit button overlay */}
              </div>

              <div className="text-center md:text-left pt-2">
                <h2
                  className="text-2xl font-bold text-[#163328] mb-1"
                  style={{ fontFamily: "'Noto Serif', serif" }}
                >
                  {user.name || "No name set"}
                </h2>
                <p className="text-[#47645a] font-medium tracking-tight">
                  {user.email}
                </p>
                <div className="mt-3 flex gap-2 justify-center md:justify-start">
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-[#eceeec] px-2 py-0.5 text-[#424844]">
                    Member
                  </span>
                </div>
              </div>
            </div>

            {/* Form section */}
            <div className="space-y-8 max-w-xl">
              <div className="space-y-2">
                <label
                  htmlFor="display-name"
                  className="block text-xs font-bold uppercase tracking-widest text-[#604021]"
                >
                  Display name
                </label>
                <div className="relative">
                  {/* ProfileForm renders the actual input + save logic */}
                  <ProfileForm currentName={user.name || ""} />
                </div>
              </div>

              <div className="pt-6 border-t border-[#c1c8c3]/20">
                <p className="text-sm text-[#424844]/80 max-w-md italic">
                  Changes will be reflected across your profile and workspace.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
