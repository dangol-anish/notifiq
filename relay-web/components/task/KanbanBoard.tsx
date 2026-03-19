'use client'

import KanbanColumn from './KanbanColumn'

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
  tasks: any[]
  projectId: string
  workspaceSlug: string
}

const columns = [
  { title: 'To Do', status: 'todo', color: 'bg-gray-400' },
  { title: 'In Progress', status: 'in_progress', color: 'bg-blue-400' },
  { title: 'In Review', status: 'in_review', color: 'bg-yellow-400' },
  { title: 'Done', status: 'done', color: 'bg-green-400' },
]

export default function KanbanBoard({ tasks, projectId, workspaceSlug }: Props) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-6">
      {columns.map((col) => (
        <KanbanColumn
          key={col.status}
          title={col.title}
          status={col.status}
          tasks={tasks.filter((t) => t.status === col.status)}
          workspaceSlug={workspaceSlug}
          projectId={projectId}
          color={col.color}
        />
      ))}
    </div>
  )
}