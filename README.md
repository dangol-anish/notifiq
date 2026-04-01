# Notifiq

Notifiq is a workspace-based project and task tracker with real-time notifications, activity logging, and optional AI-assisted planning and summaries.

This repository contains two applications:

- `relay-web/`: Next.js web app (UI + API routes)
- `relay-ws/`: Socket.IO relay server (real-time fanout)

## Features

- Workspaces with members and roles (owner/admin/member)
- Projects and tasks with status, priority, assignees, due dates
- Comments, attachments, and labels on tasks
- Notification inbox with read state + real-time delivery
- Activity feed and a weekly digest (Gemini-powered)
- Email: workspace invites and signup verification codes
- Daily due-date reminders via Vercel Cron

## Tech stack

- Web: Next.js (App Router), TypeScript, Tailwind CSS
- Auth: NextAuth (GitHub, Google, credentials)
- Database: Neon Postgres (`@neondatabase/serverless`)
- Realtime: Socket.IO (`relay-ws` + `socket.io-client`)
- Email: SMTP (Nodemailer) or Resend
- AI: Google Gemini (`@google/generative-ai`)
- Uploads: UploadThing

## Repository structure

```
notifiq/
  relay-web/   # Next.js app + API routes
  relay-ws/    # Express + Socket.IO relay server
```

## Prerequisites

- Node.js 20+
- A Postgres database (Neon recommended)
- (Optional) A running `relay-ws` instance for realtime delivery
- (Optional) Provider credentials for OAuth, email, AI, uploads

## Quickstart (local development)

1) Install dependencies

```bash
cd relay-ws
npm install

cd ../relay-web
npm install
```

2) Configure environment variables

Create `relay-web/.env.local` (see `relay-web/.env.example`) and `relay-ws/.env` (example below).

3) Start the realtime relay server

```bash
cd relay-ws
npm run dev
```

By default, it listens on `http://localhost:3001`.

4) Start the web app

```bash
cd relay-web
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

### `relay-web/.env.local`

See `relay-web/.env.example` for the canonical list. Common variables:

- `DATABASE_URL` (required): Neon/Postgres connection string
- `NEXTAUTH_URL` (required): e.g. `http://localhost:3000`
- `NEXTAUTH_SECRET` (required): NextAuth secret
- OAuth (optional, but recommended if enabled):
  - `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- Realtime relay:
  - `WS_SERVER_URL` (server-to-server delivery URL; default `http://localhost:3001`)
  - `NEXT_PUBLIC_WS_URL` (browser Socket.IO URL; default `http://localhost:3001`)
- Upstash Redis (currently required by `relay-web/lib/redis.ts`):
  - `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- Email providers (one of the following):
  - SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` (or `SMTP_PASSWORD`), `EMAIL_FROM`
  - Resend: `RESEND_API_KEY`, `RESEND_FROM`
- AI (optional):
  - `GEMINI_API_KEY`
  - `GEMINI_MODEL` (optional, defaults to `gemini-2.5-flash`)
- Cron (required for the due-reminder endpoint):
  - `CRON_SECRET`
- UploadThing (optional; required if you use attachments uploads via UploadThing):
  - `UPLOADTHING_SECRET`, `UPLOADTHING_APP_ID`

### `relay-ws/.env`

Minimal example:

```bash
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

## Database and migrations

The web app queries Postgres directly using Neon’s `sql` helper (`relay-web/lib/db.ts`).

This repo contains a small set of incremental migrations in `relay-web/migrations/`:

- `002_projects_status_check.sql`: constrains project status to `active|archived`
- `003_tasks_due_reminder_sent_at.sql`: adds `tasks.due_reminder_sent_at` for reminder dedupe
- `004_signup_verifications.sql`: adds `signup_verifications` table for email verification at signup

Apply these migrations to your database as needed (for example using the Neon SQL editor).

Note: core schema creation (tables like `users`, `workspaces`, `projects`, `tasks`, etc.) is assumed to exist already.

## Realtime architecture

### Delivery path

1) `relay-web` writes to Postgres (e.g. create notification, update task).
2) `relay-web` POSTs a message to the relay server: `POST {WS_SERVER_URL}/deliver` with `{ channel, message }`.
3) `relay-ws` emits Socket.IO events to rooms:
   - `room:<userId>` for user notifications
   - `workspace:<workspaceId>` for workspace task updates

### Channels and events

- `notifications:push` → emits `notification:new`
- `notifications:read` → emits `notification:read`
- `task:updated` → emits `task:updated`
- `task:deleted` → emits `task:deleted`

The browser connects via `socket.io-client` in `relay-web/context/NotificationContext.tsx`.

## API overview (selected)

- Notifications:
  - `POST /api/events` inserts notifications and triggers realtime delivery
  - `GET /api/notifications` fetches inbox + unread count
  - `PATCH /api/notifications/:id` marks one read
  - `PATCH /api/notifications/read-all` marks all read
- Tasks:
  - `POST /api/workspaces/:slug/projects/:projectId/tasks` creates a task
  - `PATCH /api/tasks/:taskId` updates a task (also emits realtime workspace update)
  - `DELETE /api/tasks/:taskId` deletes a task (also emits realtime workspace update)
  - `POST /api/tasks/:taskId/comments` adds a comment (and may notify)
- AI:
  - `POST /api/ai/generate-tasks`
  - `POST /api/ai/summarize-task`
  - `POST /api/ai/weekly-digest`
- Cron:
  - `GET /api/cron/due-reminders` (secured by `Authorization: Bearer $CRON_SECRET`)

## Deployment

- `relay-web` is designed to deploy on Vercel.
  - Cron is configured in `relay-web/vercel.json` (daily `due-reminders`).
- `relay-ws` can run on any Node host (Render/Fly/EC2/etc.).
  - Ensure `CORS_ORIGIN` matches your web app origin.
  - Configure `relay-web` to reach it via `WS_SERVER_URL` and `NEXT_PUBLIC_WS_URL`.

## Security notes

- The current Socket.IO auth flow is intentionally minimal: `relay-ws/src/auth.ts` does not verify JWT signatures yet. For production, replace it with real token verification and avoid using the user id as the token.
- Protect the relay server `/deliver` endpoint (network-level allowlist, auth, or signed requests) before exposing it publicly.

## Troubleshooting

- Realtime not working:
  - Verify `relay-ws` is running and reachable from the browser (`NEXT_PUBLIC_WS_URL`).
  - Verify server-to-server delivery uses the correct `WS_SERVER_URL`.
  - Check the relay logs for room joins (`auth` / `workspace:join`) and `/deliver` calls.
- Signup verification errors:
  - Apply `relay-web/migrations/004_signup_verifications.sql`.
  - Configure an email provider (SMTP or Resend).
- Due reminders not sending:
  - Ensure `CRON_SECRET` is set and Vercel cron is enabled.
  - Apply `relay-web/migrations/003_tasks_due_reminder_sent_at.sql`.

## License

Proprietary / internal (no license specified).

