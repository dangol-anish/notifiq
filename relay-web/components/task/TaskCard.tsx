'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface Task {
  id: string
  title: string
  priority: string
  status: string
  due_date?: string
  assignee_name?: string
  assignee_image?: string
  created_at: string
}

interface Props {
  task: Task
  workspaceSlug: string
  projectId: string
}

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-600',
}

export default function TaskCard({ task, workspaceSlug, projectId }: Props) {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'

  return (
    <Link href={`/${workspaceSlug}/projects/${projectId}/tasks/${task.id}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-3 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer">
        <p className="text-sm font-medium text-gray-900 line-clamp-2">{task.title}</p>

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority] || priorityColors.medium}`}>
            {task.priority}
          </span>

          {task.due_date && (
            <span className={`text-xs ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
              {isOverdue ? '⚠ ' : ''}
              {new Date(task.due_date).toLocaleDateString()}
            </span>
          )}
        </div>

        {task.assignee_name && (
          <div className="flex items-center gap-1.5 mt-2">
            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
              {task.assignee_name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-gray-500">{task.assignee_name}</span>
          </div>
        )}
      </div>
    </Link>
  )
}