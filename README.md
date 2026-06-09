# Merit Command Center

Private founder command center for Merit: KPIs, notes, outreach, investors, finance, weekly execution, and AI briefings.

The app is empty by default. It does not auto-load fake sample leads, investors, costs, tasks, or briefings into the live UI.

## Stack

- Next.js 16, React 19, TypeScript
- Tailwind CSS dark UI
- Local browser storage fallback for MVP use
- Supabase schema migrations for persistence
- OpenAI API route with local fallback generation
- Recharts and lucide-react

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` or the alternate port printed by Next.js.

## Data Storage

Without Supabase, records are stored in browser localStorage under `merit.v2.*`.

Optional environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-...
```

If `OPENAI_API_KEY` is missing, the UI still works and uses deterministic local drafts/briefings.

## Modules

- Dashboard: action list, KPI snapshot, follow-ups, finance, weekly execution, important notes, risks.
- KPIs: add/edit/delete KPIs, progress bars, filters, search, priority/status sorting.
- Operating Tracks: add/edit/delete Merit workstreams, load optional Merit track templates, track health and linked KPIs/tasks/notes.
- Outreach: add/edit/delete leads, notes, statuses, follow-up dates, editable message drafts, Copy Message only.
- Investors: add/edit/delete investors, meeting notes, concerns, next steps, outreach draft, meeting brief.
- Finance: add/edit/delete costs, editable finance settings, quality labels, renewal warnings, burn/runway calculations, CSV export.
- Weekly Execution: create/edit/delete weekly plan, add/edit/delete tasks, move statuses, leverage scoring, optional Merit task templates.
- AI Briefings: generate/add/edit/delete/copy briefings from current local data.
- Notes: add/edit/delete/pin founder notes plus a decision log.
- Risks: add/edit/delete risks and blockers with severity scoring and operating-track links.
- Settings: editable company context and local data reset.

## Supabase Migrations

Run these migrations in order:

- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/003_kpis_notes_company_settings.sql`
- `supabase/migrations/004_founder_operating_system.sql`

There is no live seed migration. The app starts empty unless you add data manually.

## Compliance

- No LinkedIn auto-DM.
- No LinkedIn auto-connect.
- No LinkedIn scraping.
- No LinkedIn passwords, cookies, sessions, tokens, or account access.
- Outreach uses Copy Message buttons only.
- Founder manually sends every LinkedIn message.
- No fake external integrations.

## Verification

```bash
npm run lint
npx tsc --noEmit
npm run build
```
