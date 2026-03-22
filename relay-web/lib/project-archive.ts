import { sql } from "@/lib/db";

const ARCHIVED = "archived";

export function isProjectArchived(status: string | null | undefined): boolean {
  return status === ARCHIVED;
}

/** Returns ok unless project is missing or archived (403-style for mutations). */
export async function assertProjectNotArchivedByProjectId(
  projectId: string,
): Promise<
  { ok: true } | { ok: false; status: 404 | 403; message: string }
> {
  const rows = await sql`
    SELECT status FROM projects WHERE id = ${projectId}
  `;
  if (!rows.length)
    return { ok: false, status: 404, message: "Project not found" };
  if (isProjectArchived(rows[0].status as string | null))
    return {
      ok: false,
      status: 403,
      message: "This project is archived",
    };
  return { ok: true };
}

export async function assertProjectNotArchivedByTaskId(
  taskId: string,
): Promise<
  { ok: true } | { ok: false; status: 404 | 403; message: string }
> {
  const rows = await sql`
    SELECT p.status FROM tasks t
    JOIN projects p ON p.id = t.project_id
    WHERE t.id = ${taskId}
  `;
  if (!rows.length)
    return { ok: false, status: 404, message: "Task not found" };
  if (isProjectArchived(rows[0].status as string | null))
    return {
      ok: false,
      status: 403,
      message: "This project is archived",
    };
  return { ok: true };
}
