-- One-time reminder per task (day before due date). Reset when due_date changes.
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_reminder_sent_at timestamptz;
