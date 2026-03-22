import { sql } from "@/lib/db";
import { publishPush } from "@/lib/redis";
import type { CreateEventInput } from "@/types/notification";

/** Insert notifications and push to Redis (same behavior as POST /api/events). */
export async function dispatchNotificationEvent(
  input: CreateEventInput,
): Promise<string[]> {
  const { type, recipientIds, title, body: msgBody, payload } = input;

  const inserted = await Promise.all(
    recipientIds.map((userId) =>
      sql`
        INSERT INTO notifications (user_id, type, title, body, payload)
        VALUES (${userId}, ${type}, ${title}, ${msgBody ?? null}, ${JSON.stringify(payload ?? {})})
        RETURNING *
      `,
    ),
  );

  for (let i = 0; i < recipientIds.length; i++) {
    const userId = recipientIds[i];
    const notification = inserted[i][0];
    await publishPush(userId, notification);
  }

  return inserted.map((rows) => rows[0].id as string);
}
