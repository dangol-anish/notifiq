'use client'

import TaskCard from './TaskCard'

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
  title: string
  status: string
  tasks: Task[]
  workspaceSlug: string
  projectId: string
  color: string
}

export default function KanbanColumn({ title, status, tasks, workspaceSlug, projectId, color }: Props) {
  return (
    <div className="flex-1 min-w-[240px] max-w-[320px]">
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2 h-2 rounded-full ${color}`} />
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      <div className="space-y-2 min-h-[100px]">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            workspaceSlug={workspaceSlug}
            projectId={projectId}
          />
        ))}
        {tasks.length === 0 && (
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-400">No tasks</p>
          </div>
        )}
      </div>
    </div>
  )
}