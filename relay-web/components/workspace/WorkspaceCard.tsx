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
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
            {workspace.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
            {workspace.role}
          </span>
        </div>
        <h3 className="font-semibold text-gray-900 mt-3">{workspace.name}</h3>
        <p className="text-xs text-gray-400 mt-1">
          Created {new Date(workspace.created_at).toLocaleDateString()}
        </p>
      </div>
    </Link>
  )
}