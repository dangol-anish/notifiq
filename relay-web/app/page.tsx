import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-lg">Notifiq</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              Real-time collaboration
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
              Your team,
              <br />
              <span className="text-blue-600">always in sync.</span>
            </h1>
            <p className="text-xl text-gray-500 mt-6 leading-relaxed max-w-xl">
              Notifiq is a team collaboration platform with live task updates,
              instant notifications, and a Kanban board that reflects reality —
              not a stale refresh.
            </p>
            <div className="flex items-center gap-4 mt-8">
              <Link
                href="/register"
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors text-base"
              >
                Start for free
              </Link>
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 transition-colors text-base font-medium"
              >
                Sign in →
              </Link>
            </div>
          </div>

          {/* App mockup */}
          <div className="mt-16 rounded-2xl border border-gray-200 shadow-2xl shadow-gray-100 overflow-hidden">
            {/* Browser chrome */}
            <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="flex-1 mx-4">
                <div className="bg-white rounded-md px-3 py-1 text-xs text-gray-400 max-w-xs">
                  notifiq.vercel.app
                </div>
              </div>
            </div>

            {/* App UI mockup */}
            <div className="bg-gray-50">
              {/* App nav */}
              <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span>Dashboard</span>
                  <span className="text-gray-300">/</span>
                  <span>Engineering</span>
                  <span className="text-gray-300">/</span>
                  <span className="font-semibold text-gray-900">Sprint 12</span>
                </div>
                <div className="flex items-center gap-3">
                  {/* Notification bell mockup */}
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                    </div>
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      3
                    </span>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                    A
                  </div>
                </div>
              </div>

              {/* Kanban board mockup */}
              <div className="p-6 overflow-x-auto">
                <div className="flex gap-4 min-w-max">
                  {[
                    {
                      title: "To Do",
                      color: "bg-gray-400",
                      tasks: [
                        {
                          title: "Design new onboarding flow",
                          priority: "high",
                          assignee: "S",
                          label: "Feature",
                          labelColor: "#3b82f6",
                        },
                        {
                          title: "Fix mobile nav bug",
                          priority: "urgent",
                          assignee: "A",
                          label: "Bug",
                          labelColor: "#ef4444",
                        },
                      ],
                    },
                    {
                      title: "In Progress",
                      color: "bg-blue-400",
                      tasks: [
                        {
                          title: "Integrate payment gateway",
                          priority: "high",
                          assignee: "M",
                          label: "Feature",
                          labelColor: "#3b82f6",
                        },
                        {
                          title: "Write API documentation",
                          priority: "medium",
                          assignee: "A",
                          label: null,
                          labelColor: null,
                        },
                      ],
                    },
                    {
                      title: "In Review",
                      color: "bg-yellow-400",
                      tasks: [
                        {
                          title: "Update user dashboard",
                          priority: "medium",
                          assignee: "S",
                          label: "Feature",
                          labelColor: "#3b82f6",
                        },
                      ],
                    },
                    {
                      title: "Done",
                      color: "bg-green-400",
                      tasks: [
                        {
                          title: "Set up CI/CD pipeline",
                          priority: "low",
                          assignee: "M",
                          label: null,
                          labelColor: null,
                        },
                        {
                          title: "Database schema migration",
                          priority: "high",
                          assignee: "A",
                          label: null,
                          labelColor: null,
                        },
                      ],
                    },
                  ].map((col) => (
                    <div key={col.title} className="w-56">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`w-2 h-2 rounded-full ${col.color}`} />
                        <span className="text-xs font-semibold text-gray-700">
                          {col.title}
                        </span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                          {col.tasks.length}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {col.tasks.map((task, i) => (
                          <div
                            key={i}
                            className="bg-white rounded-lg border border-gray-200 p-3"
                          >
                            <p className="text-xs font-medium text-gray-900">
                              {task.title}
                            </p>
                            <div className="flex items-center gap-1.5 mt-2">
                              <span
                                className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                                  task.priority === "urgent"
                                    ? "bg-red-100 text-red-700"
                                    : task.priority === "high"
                                      ? "bg-orange-100 text-orange-700"
                                      : task.priority === "medium"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {task.priority}
                              </span>
                              {task.label && (
                                <span
                                  className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                                  style={{
                                    backgroundColor: task.labelColor + "20",
                                    color: task.labelColor ?? undefined,
                                  }}
                                >
                                  {task.label}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-2">
                              <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                                {task.assignee}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Built for real teams
            </h2>
            <p className="text-gray-500 mt-3 text-lg max-w-xl mx-auto">
              Everything your team needs to stay aligned — without the constant
              tab refreshing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                ),
                title: "Live updates",
                description:
                  "Task changes appear instantly on everyone's board. No refreshing, no stale state — powered by WebSockets and Redis Pub/Sub.",
              },
              {
                icon: (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                ),
                title: "Smart notifications",
                description:
                  "Get notified when tasks are assigned, comments are posted, or you're mentioned. Synced across all your devices instantly.",
              },
              {
                icon: (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                ),
                title: "Team workspaces",
                description:
                  "Invite teammates with a secure link, manage roles, and keep work organized across multiple projects.",
              },
              {
                icon: (
                  <svg
                    className="w-6 h-6"
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
                ),
                title: "Kanban board",
                description:
                  "Visualize work across Todo, In Progress, In Review, and Done. Drag tasks, set priorities, assign due dates and labels.",
              },
              {
                icon: (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                ),
                title: "Comments and mentions",
                description:
                  "Discuss work directly on tasks. Use @mentions to loop in teammates — they'll get notified instantly.",
              },
              {
                icon: (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                ),
                title: "File attachments",
                description:
                  "Attach images, PDFs, and documents directly to tasks. Everything your team needs, in one place.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Production-grade architecture
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Built with the same tools used by real engineering teams — not a
              toy project.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Next.js 14", desc: "App Router + API routes" },
              { name: "Socket.io", desc: "WebSocket server on Render" },
              { name: "PostgreSQL", desc: "Neon serverless database" },
              { name: "Upstash QStash", desc: "Queued notification delivery" },
              { name: "Redis Pub/Sub", desc: "Real-time message broker" },
              { name: "NextAuth", desc: "JWT authentication" },
              { name: "Uploadthing", desc: "File storage and delivery" },
              { name: "Vercel", desc: "Edge deployment" },
            ].map((tech) => (
              <div
                key={tech.name}
                className="bg-gray-50 rounded-xl p-4 border border-gray-100"
              >
                <p className="font-semibold text-gray-900 text-sm">
                  {tech.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-blue-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to collaborate in real time?
          </h2>
          <p className="text-blue-100 mt-3 text-lg">
            Free to use. No credit card required.
          </p>
          <Link
            href="/register"
            className="inline-block mt-8 bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold text-base hover:bg-blue-50 transition-colors"
          >
            Get started free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
              <svg
                className="w-3.5 h-3.5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <span className="font-semibold text-gray-900">Notifiq</span>
          </div>
          <p className="text-sm text-gray-400">
            Built with Next.js, Socket.io, and PostgreSQL
          </p>
        </div>
      </footer>
    </main>
  );
}
