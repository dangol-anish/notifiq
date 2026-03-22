-- Enforce archive semantics at the database (run once on Neon)
-- Fails if any row has status outside ('active', 'archived') — fix those rows first.
-- First line may log "constraint does not exist, skipping" on first run — that is normal.

ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE projects ADD CONSTRAINT projects_status_check
  CHECK (status IN ('active', 'archived'));
