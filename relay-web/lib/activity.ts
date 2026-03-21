import { sql } from "@/lib/db";

export async function logActivity({
  workspaceId,
  actorId,
  type,
  entityType,
  entityId,
  payload,
}: {
  workspaceId: string;
  actorId: string;
  type: string;
  entityType: string;
  entityId: string;
  payload?: Record<string, unknown>;
}) {
  try {
    await sql`
      INSERT INTO activity_events (workspace_id, actor_id, type, entity_type, entity_id, payload)
      VALUES (${workspaceId}, ${actorId}, ${type}, ${entityType}, ${entityId}, ${JSON.stringify(payload ?? {})})
    `;
  } catch (err) {
    console.error("[activity] failed to log:", err);
  }
}
