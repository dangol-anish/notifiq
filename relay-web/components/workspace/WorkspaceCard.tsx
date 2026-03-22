'use client'

import Link from 'next/link'

interface Props {
  workspace: {
    id: string
    name: string
    slug: string
    role: string
    created_at: string
  }
}

export default function WorkspaceCard({ workspace }: Props) {
  return (
    <Link href={`/${workspace.slug}`}>
      <div className="cursor-pointer rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-blue-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-500">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
            {workspace.name.charAt(0).toUpperCase()}
          </div>
          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-400 dark:bg-gray-800 dark:text-gray-400">
            {workspace.role}
          </span>
        </div>
        <h3 className="mt-3 font-semibold text-gray-900 dark:text-gray-100">{workspace.name}</h3>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          Created {new Date(workspace.created_at).toLocaleDateString()}
        </p>
      </div>
    </Link>
  )
}