import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <h1 className="text-4xl font-bold text-gray-900">Notifiq</h1>
        <p className="text-gray-500 mt-3 text-lg">
          Real-time team collaboration with live notifications
        </p>
        <div className="flex gap-3 justify-center mt-8">
          <Link
            href="/login"
            className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Get started
          </Link>
        </div>
      </div>
    </main>
  );
}
