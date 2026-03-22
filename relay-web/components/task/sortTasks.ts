import type { Task } from "@/context/TaskContext";

export type TaskSortBy = "created_at" | "due_date" | "priority" | "title";
export type TaskSortDir = "asc" | "desc";

const PRIORITY_ORDER: Record<string, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

/** Sort tasks within a column (stable enough for Kanban display). */
export function sortTasksForKanban(
  tasks: Task[],
  sortBy: TaskSortBy,
  sortDir: TaskSortDir,
): Task[] {
  const mul = sortDir === "asc" ? 1 : -1;
  return [...tasks].sort((a, b) => {
    if (sortBy === "priority") {
      const va = PRIORITY_ORDER[a.priority] ?? 99;
      const vb = PRIORITY_ORDER[b.priority] ?? 99;
      if (va !== vb) return (va - vb) * mul;
      return tieBreak(a, b);
    }

    if (sortBy === "due_date") {
      const na = a.due_date == null;
      const nb = b.due_date == null;
      if (na && nb) return tieBreak(a, b);
      if (na) return 1;
      if (nb) return -1;
      const ta = new Date(a.due_date as string).getTime();
      const tb = new Date(b.due_date as string).getTime();
      if (ta !== tb) return (ta - tb) * mul;
      return tieBreak(a, b);
    }

    if (sortBy === "created_at") {
      const ta = new Date(a.created_at).getTime();
      const tb = new Date(b.created_at).getTime();
      if (ta !== tb) return (ta - tb) * mul;
      return tieBreak(a, b);
    }

    if (sortBy === "title") {
      const c = a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
      if (c !== 0) return c * mul;
      return tieBreak(a, b);
    }

    return tieBreak(a, b);
  });
}

function tieBreak(a: Task, b: Task): number {
  return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
}
