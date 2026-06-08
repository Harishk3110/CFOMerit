# Merit Command Center

Internal founder operating system for Merit: outreach tracking, investor relations, finance/runway visibility, weekly execution, and AI briefings.

This is not the main Merit product. It is an internal CFO/founder command center for daily operating decisions.

## Stack

- Next.js 16, React 19, TypeScript
- Tailwind CSS
- Supabase schema and seed migrations
- OpenAI API route with deterministic local fallback drafts
- Recharts
- lucide-react icons

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

The app works without environment variables by using browser localStorage and bundled seed data.

## Environment Variables

Create `.env.local` when you want Supabase and OpenAI-backed behavior:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-...
```

If `OPENAI_API_KEY` is missing, the AI route returns local placeholder drafts and reports so the UI does not break.

## Supabase

Run the migrations in Supabase SQL Editor or through the Supabase CLI:

- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_seed_command_center_data.sql`

Tables included:

- `command_center_profiles`
- `outreach_leads`
- `outreach_messages`
- `outreach_events`
- `investors`
- `investor_interactions`
- `investor_updates`
- `costs`
- `finance_settings`
- `weekly_plans`
- `tasks`
- `ai_briefings`

RLS statements are prepared as comments in the initial migration. Enable them when Supabase auth is configured.

## MVP Pages

- Dashboard: today follow-ups, pipeline status, finance snapshot, weekly priorities, risks.
- Outreach: manual lead creation, filters/search, reusable scoring, editable generated drafts, Copy Message buttons, manual sent status, follow-up dates.
- Investors: pipeline board, investor creation, status/notes/concerns/follow-up edits, copyable outreach, investor update generator.
- Finance: cost creation/deletion, category/vendor filters, runway and burn calculations, charts, CSV export.
- Weekly Execution: editable weekly plan, kanban task board, task creation, status movement, copyable weekly review.
- AI Briefings: daily, weekly, investor prep, recruiter prep, finance health, and outreach performance briefings stored locally.
- Settings: Merit context, environment variable guide, compliance notes, local seed reset.

## Compliance

- No LinkedIn auto-DM.
- No LinkedIn auto-connect.
- No LinkedIn scraping.
- No LinkedIn passwords, cookies, sessions, tokens, or account access.
- Every outreach draft uses Copy Message, not Send.
- Founders manually send all LinkedIn messages.
- Personalization is based only on professional context entered by the user.
- No fake integrations or broken external-send buttons.

## Verification

```bash
npm run lint
npm run build
```
