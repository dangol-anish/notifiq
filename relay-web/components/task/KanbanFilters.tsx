"use client";

import type { TaskSortBy, TaskSortDir } from "./sortTasks";

interface Props {
  members: any[];
  labels: any[];
  filters: {
    assigneeId: string;
    priority: string;
    labelId: string;
  };
  onChange: (filters: {
    assigneeId: string;
    priority: string;
    labelId: string;
  }) => void;
  sortBy: TaskSortBy;
  sortDir: TaskSortDir;
  onSortChange: (sortBy: TaskSortBy, sortDir: TaskSortDir) => void;
}

export default function KanbanFilters({
  members,
  labels,
  filters,
  onChange,
  sortBy,
  sortDir,
  onSortChange,
}: Props) {
  function update(key: string, value: string) {
    onChange({ ...filters, [key]: value });
  }

  const hasFilters = filters.assigneeId || filters.priority || filters.labelId;

  return (
    <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:flex-wrap">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="mb-1 block text-sm font-medium tracking-widest text-on-tertiary-fixed-variant">
          Filter
        </span>

        {/* Assignee */}
        <select
          value={filters.assigneeId}
          onChange={(e) => update("assigneeId", e.target.value)}
          className=" border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#604021]/70 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          <option value="">All assignees</option>
          <option value="unassigned">Unassigned</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name || m.email}
            </option>
          ))}
        </select>

        {/* Priority */}
        <select
          value={filters.priority}
          onChange={(e) => update("priority", e.target.value)}
          className=" border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#604021]/70 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          <option value="">All priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Label */}
        {labels.length > 0 && (
          <select
            value={filters.labelId}
            onChange={(e) => update("labelId", e.target.value)}
            className=" border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#604021]/70 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            <option value="">All labels</option>
            {labels.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        )}

        {/* Clear filters */}
        {hasFilters && (
          <button
            onClick={() =>
              onChange({ assigneeId: "", priority: "", labelId: "" })
            }
            className="mb-1 block text-sm font-medium tracking-widest cursor-pointer text-red-600"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap sm:ml-auto">
        <span className="mb-1 block text-sm font-medium tracking-widest text-on-tertiary-fixed-variant">
          Sort
        </span>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as TaskSortBy, sortDir)}
          className=" border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#604021]/70 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          <option value="created_at">Created date</option>
          <option value="due_date">Due date</option>
          <option value="priority">Priority</option>
          <option value="title">Title</option>
        </select>
        <select
          value={sortDir}
          onChange={(e) => onSortChange(sortBy, e.target.value as TaskSortDir)}
          className=" border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#604021]/70 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          title="Direction depends on sort field (e.g. due date: ascending = soonest first)"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>
    </div>
  );
}
