-- Pending email-verified signups (credentials provider only).
CREATE TABLE IF NOT EXISTS signup_verifications (
  email_normalized TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  last_sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  attempt_count INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS signup_verifications_expires_at_idx
  ON signup_verifications (expires_at);
