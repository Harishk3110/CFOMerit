# Merit Command Center

An internal founder operating system for early-stage startups. Track outreach pipelines, investor relationships, finance and burn rate, weekly execution, and get AI-powered briefings.

**Built for Merit founders to use immediately.**

## What's Inside

### 📊 Dashboard
- Real-time metrics on recruiter leads, investor leads, active conversations, and follow-ups
- Financial health snapshot (monthly burn, runway, cash balance)
- Upcoming meetings and this week's priorities
- Strategic risks and outreach pipeline overview

### 📧 Outreach Module
- LinkedIn outreach lead tracking (recruiters, founders, investors)
- Lead scoring based on profile and engagement
- AI-generated message drafts (connection requests, first DMs, follow-ups)
- Message copy buttons (never auto-send)
- Status tracking from "new" to "converted"
- Search and filtering by lead type, status, priority

### 💼 Investor CRM
- Investor pipeline board (target → committed)
- Drag-and-drop status tracking
- Meeting notes and follow-up reminders
- AI-generated investor updates
- Warm intro tracking
- Priority scoring

### 💰 Finance Dashboard
- Cost tracking by vendor and category
- Monthly burn rate visualization
- Runway calculation and warnings
- Spend breakdown by category (hosting, AI, design, etc.)
- One-time vs recurring cost separation
- Budget variance analysis

### 🏃 Weekly Execution Board
- Kanban-style task board (backlog → done)
- Weekly theme and top 3 priorities
- Task ownership and priority levels
- Blocker tracking
- Completed this week counter
- AI-generated weekly strategy reviews

### 🤖 AI Briefings
- Daily founder briefing (today's priorities, meetings, risks)
- Weekly strategy review (what moved, what didn't, next actions)
- Investor meeting prep (background, likely questions, pitch angles)
- Recruiter meeting prep (hiring pain, Merit angle, questions to ask)
- Finance health report (burn, runway, cost drivers)
- Outreach performance review (pipeline, conversion rates, actions)

### ⚙️ Settings
- Company information and runway tracking
- Supabase database configuration
- OpenAI API key setup
- Preference management

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI API (for message and briefing generation)
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- OpenAI API key (optional, app works without it)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/harishk3110/CFOmerit.git
cd merit-cfo
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Then edit `.env.local` with your credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=your-openai-api-key
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Usage

### Adding Outreach Leads
1. Go to **Outreach**
2. Click **Add Lead**
3. Enter LinkedIn profile info (URL, screenshot, or paste text)
4. AI extracts profile summary and suggests lead score
5. Generate message drafts using **Generate Message** button
6. Copy and send messages manually on LinkedIn
7. Track status as conversations progress

### Managing Investors
1. Go to **Investors**
2. Drag investors between pipeline stages
3. Click to view investor details and generate updates
4. Store meeting notes and concerns
5. Track warm intros and next steps

### Tracking Finance
1. Go to **Finance**
2. Click **Add Cost** to log new expenses
3. View burn rate, runway, and spend breakdown
4. Alerts trigger if runway < 6 months
5. Export costs for accounting/fundraising

### Weekly Planning
1. Go to **Weekly Execution**
2. Set this week's theme and top 3 priorities
3. Drag tasks between status columns
4. Click **Generate Review** for AI-powered insights
5. Review previous weeks for execution trends

### AI Briefings
1. Go to **AI Briefings**
2. Select briefing type (daily, weekly, investor prep, etc.)
3. Copy briefing content
4. Edit and customize for your context
5. Share with team or use for meeting prep

## Database Schema

The app uses Supabase PostgreSQL with these core tables:

- `command_center_profiles` - User profiles
- `outreach_leads` - LinkedIn outreach leads
- `outreach_messages` - Generated messages
- `investors` - Investor pipeline
- `investor_interactions` - Meeting notes and calls
- `costs` - Finance tracking
- `finance_settings` - Cash balance and revenue
- `weekly_plans` - Weekly planning
- `tasks` - Task tracking
- `ai_briefings` - Saved briefings

See `lib/types.ts` for complete schema definitions.

## Lead Scoring

### Recruiter Score (Max 100)
- Role includes recruiter/HR/talent: +25
- Company hires early talent: +20
- Based in Singapore/target market: +15
- Startup/tech/education industry: +15
- Warm intro/event/school source: +10
- Hiring pain mentioned: +10
- LinkedIn URL present: +5

### Investor Score (Max 100)
- Invests in early-stage startups: +25
- Focus on HR tech/future of work/AI: +20
- Singapore/Southeast Asia based: +15
- Accelerator/university connections: +15
- Warm intro available: +10
- Portfolio company relevance: +10
- LinkedIn/website present: +5

## Deployment

### Deploy to Vercel (Recommended)

```bash
# Push to GitHub
git add .
git commit -m "Initial commit"
git push origin main

# Then in Vercel dashboard:
# 1. Import from GitHub
# 2. Add environment variables
# 3. Deploy
```

## Environment Variables

```
# Supabase (Optional - app works without database)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenAI (Optional - app works without AI)
OPENAI_API_KEY=sk-...

# App Config
NEXT_PUBLIC_APP_NAME=Merit Command Center
```

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

## Features

### MVP (Current)
✅ Dashboard overview with real metrics
✅ Outreach lead tracking and management
✅ LinkedIn message generation (AI-powered)
✅ Investor pipeline tracking
✅ Finance and runway calculation
✅ Weekly execution board (kanban)
✅ AI briefing generation (6 types)
✅ Sample data and mock responses
✅ Responsive design (mobile-friendly)
✅ Clean, founder-focused UI

### Future Features
- Supabase authentication and multi-user support
- Real database persistence
- Email notifications and reminders
- Calendar integration for meetings
- Slack integration for daily briefings
- Custom AI prompt templates
- Analytics and historical trending
- Bulk lead import (CSV/JSON)
- Investment tracking and cap table
- Pitch deck version control

## Compliance

Merit Command Center complies with all usage policies:

- ✅ No LinkedIn automation or scraping
- ✅ No LinkedIn passwords, sessions, or tokens stored
- ✅ All messages use "Copy" buttons - founder sends manually
- ✅ No fake integrations or broken features
- ✅ No inferred sensitive data from profile images
- ✅ Personalization only from visible professional context

## Support

- Questions? Check the [GitHub Issues](https://github.com/harishk3110/CFOmerit/issues)
- Bugs? Create an issue with steps to reproduce
- Features? Open a discussion or issue

## License

MIT - Feel free to use and modify for your startup.

---

**Built for Merit founders. Command your company's growth.**

v1.0 | June 2024
