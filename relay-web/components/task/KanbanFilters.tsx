"use client";

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
}

export default function KanbanFilters({
  members,
  labels,
  filters,
  onChange,
}: Props) {
  function update(key: string, value: string) {
    onChange({ ...filters, [key]: value });
  }

  const hasFilters = filters.assigneeId || filters.priority || filters.labelId;

  return (
    <div className="flex items-center gap-3 flex-wrap mb-4">
      <span className="text-xs text-gray-500 font-medium">Filter:</span>

      {/* Assignee */}
      <select
        value={filters.assigneeId}
        onChange={(e) => update("assigneeId", e.target.value)}
        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
          className="text-xs text-red-400 hover:text-red-600 transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
