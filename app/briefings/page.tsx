"use client";

import React, { useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { Sparkles, Calendar } from "lucide-react";

const briefingTypes = [
  {
    id: "daily",
    title: "Daily Founder Briefing",
    description: "What to focus on today",
    icon: "📅",
  },
  {
    id: "weekly",
    title: "Weekly Strategy Review",
    description: "Execution review and next-week plan",
    icon: "📊",
  },
  {
    id: "investor_prep",
    title: "Investor Meeting Prep",
    description: "Background, likely questions, pitch angles",
    icon: "💼",
  },
  {
    id: "recruiter_prep",
    title: "Recruiter Meeting Prep",
    description: "Background, pain points, meeting strategy",
    icon: "👥",
  },
  {
    id: "finance",
    title: "Finance Health Report",
    description: "Burn, runway, cost drivers, risks",
    icon: "💰",
  },
  {
    id: "outreach",
    title: "Outreach Performance Review",
    description: "Leads, pipeline, reply rates, next actions",
    icon: "📧",
  },
];

const sampleBriefings: Record<string, string> = {
  daily: `DAILY BRIEFING - June 8, 2024

Follow-ups Due Today:
• Alex Park (Accel) - Follow up on investor intro
• Sarah Chen (TechCorp) - Connection request follow-up
• Jordan Lee (Startup Interview) - Reschedule call

Meetings Today:
• 2:00 PM: Recruiter Call - TechCorp with Sarah Chen
• 4:30 PM: Slack sync with engineering on blockers

High-Priority Leads:
• Morgan Lee (Angel, 88/100 score) - Just replied to email
• Jamie Rodriguez (Recruiter, 72/100 score) - Ready to send message

Finance Alerts:
• Current runway: 8.2 months (watch if burn exceeds $8.7K this month)
• No budget warnings

Top Tasks:
1. Finalize portfolio verification feature (critical blocker)
2. Prepare investor data room (due by Friday)
3. Complete 1 recruiter validation call (target: 5 this week)

Recommended Actions:
→ Start day with Alex Park follow-up (highest priority lead)
→ Prep for 2 PM call with Sarah Chen (recruiter validation)
→ Unblock engineering on verification feature
→ Generate investor update for Morgan Lee`,

  weekly: `WEEKLY STRATEGY REVIEW - Week of June 1-7

What Moved:
✓ Portfolio UI redesign shipped (40% faster student signup)
✓ 4 recruiter validation calls completed (95% positive feedback)
✓ Investor intro pipeline expanded (8 targets identified)
✓ AI message generation system working well (80% copy rate)

What Didn't Move:
✗ Project verification feature still blocked (engineering capacity)
✗ Student onboarding emails not prioritized
✗ Accelerator outreach stalled (no one assigned)

Execution Weak Points:
- Too many parallel initiatives (unfocused effort)
- Engineering capacity fully saturated
- Communication delays on blocker resolution

Highest-Leverage Next Actions:
1. Unblock verification feature (engineering pairing session today)
2. Close 2 pending investor meetings (already scheduled)
3. Push recruiter activation to 40% (currently 35%)
4. Kill non-essential initiatives

Strategic Recommendation:
Kill all secondary work. Focus singularly on: (1) unblocking verification feature, (2) recruiter validation, (3) investor meetings. You have the momentum. Don't dilute it.`,

  investor_prep: `INVESTOR MEETING PREP - Alex Park (Accel Partners)

About Alex:
- Partner at Accel, focuses on Future of Work and HR Tech
- Invested in Notion, Figma, Retool - infrastructure-level companies
- Active in student/early talent ecosystem
- Previous founder (sold to Salesforce)

Why They're Relevant:
- Accel thesis aligns with "proof-of-ability infrastructure"
- Their portfolio shows infrastructure and platform bets
- Founder background means they understand founding pain
- HR tech focus = recruiter evaluation is strategic

Likely Questions:
Q: How is Merit different from LinkedIn, Indeed, Handshake?
→ Merit is proof-of-ability, not a job board. Students build portfolios of real work. Recruiters evaluate ability directly.

Q: What's your unit economics?
→ Early stage, validating recruiter willingness to pay. Currently focus on product-market fit.

Q: How will you distribute to recruiters?
→ Direct outreach to tech companies hiring early talent. Focus on startups first (higher hiring velocity).

Q: Why now?
→ Recruiting is broken. Traditional resumes are weak signals. Students want to prove ability. Recruiters want real signal.

Your Strongest Angles:
1. Recruiter pain is real and acute (validation from 4 calls)
2. Students are ready to build (200+ early signups)
3. Infrastructure thesis (Accel loves this): you're enabling a new way to discover talent
4. Founder-friendly positioning (merit, not credentials)

Risks They May Challenge:
- Competition from LinkedIn/Indeed
- Unit economics on a free network
- Recruiter retention and willingness to pay

Suggested Answers:
→ We're not a job board, we're infrastructure for ability evaluation
→ Freemium model first (product-market fit), then monetize via recruiter tools
→ Early validation shows 85%+ recruiter engagement in pilots

The Ask:
Series Seed lead $500K - $1M

Follow-up Ask:
Warm intros to 3-5 recruiting leaders at tech companies`,

  recruiter_prep: `RECRUITER MEETING PREP - Sarah Chen (Head of Talent, TechCorp)

About Sarah:
- Head of Talent at TechCorp (500-person tech company)
- Responsible for hiring 50+ engineers and designers this year
- LinkedIn mentions focus on "early career development"
- Previous HR Manager at Fortune 500

Why She's Relevant:
- TechCorp actively hires entry-level talent
- Complaining about resume-spam and poor signal from junior candidates
- Has budget authority (hiring manager)

Hiring Pain Points (Based on Research):
- Resume screening takes 15+ hours per week
- Can't distinguish real ability from resume exaggeration
- "Fresh grad portfolios aren't representative of actual skill"
- Tech hiring is competitive, needs advantage in sourcing

Merit's Angle for Sarah:
"Merit helps you find students with proof of ability. Real projects, real code, real outcomes. No resume exaggeration. 40% faster screening time."

Questions to Ask Sarah:
1. "How much time do you spend screening entry-level resumes weekly?"
2. "What signals make you confident a candidate can actually code?"
3. "How would you use a portfolio of verified student projects?"
4. "What would save your team the most time in hiring?"

What to Show:
- 2-3 real student projects from Merit platform
- Show how recruiters filter by real skills (not degree)
- Demo the "verify project" feature
- Timeline to hire is typically 30% faster with Merit

The Ask:
"Can we try a 4-week pilot with your team? Send us your open roles, and we'll source 10-15 pre-vetted candidates with verified project work."

Follow-up:
- Weekly sync on pipeline quality
- Monthly ROI calculation (time saved, quality hires)
- Expand to other hiring managers if working well`,

  finance: `FINANCE HEALTH REPORT - June 8, 2024

Current Financial Position:
- Cash Balance: $68,000
- Monthly Recurring: $1,030
- Monthly Revenue: $2,000 (pilot partnerships)
- Net Burn: $1,030/month (actually cash positive!)
- Estimated Runway: 66 months (if no changes)

Wait, We're Actually Positive?
Yes! Revenue from pilot partnerships is covering recurring costs. One-time contractor costs ($3,000 in May) created burn, but baseline is positive.

Monthly Cost Breakdown:
- Hosting (Supabase + Vercel): $400
- AI/API (OpenAI): $500
- Design tools: $80
- Software subscriptions: $100
- Contractor work: $500/mo average

Biggest Cost Drivers:
1. OpenAI API ($500) - Can optimize with better prompting
2. Contractor design work ($500) - Consider bringing in-house or reducing scope
3. Hosting ($400) - Well-optimized already

Budget Risks:
- If hiring engineers: +$10K-15K/month
- If scaling support: +$3K-5K/month
- Accelerator programs cost: varies

Financial Priorities:
1. Maintain current efficiency (you're doing well)
2. Focus on revenue growth (even $500 MRR more = 10% of runway)
3. Only hire if fundraising is imminent
4. Keep burn rate discussion visible in investor meetings (shows discipline)

Suggested Cost Optimization:
- Audit AI API usage (can batch requests, reduce redundant calls)
- Consider design contractor vs. in-house (trade-off analysis)
- Negotiate annual commitments for savings`,

  outreach: `OUTREACH PERFORMANCE REVIEW - Week of June 1-7

Overall Pipeline Health:
Total Leads: 38
├─ Recruiters: 24 (63%)
├─ Investors: 8 (21%)
└─ Other: 6 (16%)

By Status:
- New: 8 leads (21%)
- Researched: 5 leads (13%)
- Message Generated: 12 leads (32%)
- Connected: 10 leads (26%)
- Replied: 2 leads (5%)
- Meeting Booked: 1 lead (3%)

Performance Metrics:
- Connection acceptance rate: 62%
- First DM open rate (estimated): 78%
- Reply rate (so far): 8% (small sample, watch this)
- Meeting booking rate: 3% of contacted

By Lead Type:
Recruiter Performance:
- 24 leads, 15 connected, 2 replied, 1 meeting booked
- Top performers: TechCorp (Sarah), FinanceHub (Jamie)
- Signal: Recruiter messaging is resonating

Investor Performance:
- 8 leads, 4 connected, 1 replied
- Messaging needs work (too formal, less personal)
- Suggest: Founder-to-founder angle stronger

High-Priority Leads Needing Action:
1. Morgan Lee (Angel, 88/100 score) - Just replied, message follow-up needed
2. Alex Park (Startup founder, 85/100 score) - Ready to send first DM
3. Sarah Chen (TechCorp, 90/100 score) - Already connected, schedule meeting

Overdue Follow-ups:
- 5 leads due for follow-up today
- Jamie Rodriguez (recruiter) - 7 days since connection, no reply

Recommended Next Actions:
→ Increase messaging volume (currently 2-3 per day, target 5-6)
→ Personalize investor messaging (too templated right now)
→ Focus on top 10 leads (80/20 rule)
→ Schedule 3 recruiter meetings for next week
→ Create follow-up sequence for non-responders`,
};

export default function BriefingsPage() {
  const [selectedBriefing, setSelectedBriefing] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerateBriefing = (briefingId: string) => {
    setGenerating(true);
    // Simulate API call
    setTimeout(() => {
      setSelectedBriefing(briefingId);
      setGenerating(false);
    }, 1000);
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">AI Briefings</h1>
        <p className="text-slate-600 mt-1">
          Generate AI-powered briefings for founders, meetings, and reviews
        </p>
      </div>

      {/* Briefing Types Grid */}
      {!selectedBriefing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {briefingTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleGenerateBriefing(type.id)}
              disabled={generating}
              className="bg-white rounded-lg border border-slate-200 p-6 text-left hover:border-blue-400 hover:shadow-md transition-all disabled:opacity-50"
            >
              <div className="text-3xl mb-3">{type.icon}</div>
              <h3 className="text-lg font-bold text-slate-900">{type.title}</h3>
              <p className="text-sm text-slate-600 mt-1">{type.description}</p>
              <div className="mt-4 inline-flex items-center gap-2 text-blue-600 font-medium text-sm">
                <Sparkles size={16} />
                Generate
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200">
          {/* Briefing Header */}
          <div className="border-b border-slate-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {briefingTypes.find((b) => b.id === selectedBriefing)?.title}
                </h2>
                <p className="text-slate-600 mt-1">
                  Generated at {new Date().toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedBriefing(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
            </div>
          </div>

          {/* Briefing Content */}
          <div className="p-6">
            <div className="bg-slate-50 rounded-lg p-6 mb-6 border border-slate-200 max-h-96 overflow-auto">
              <p className="text-slate-700 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                {sampleBriefings[selectedBriefing] ||
                  "Briefing content loading..."}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4 flex-wrap">
              <CopyButton
                text={sampleBriefings[selectedBriefing] || ""}
                label="Copy Briefing"
              />
              <button
                onClick={() => setSelectedBriefing(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-2">ℹ️ About AI Briefings</h3>
        <p className="text-blue-800">
          AI Briefings generate concise, actionable summaries of your Merit data.
          They pull from your outreach pipeline, investor tracking, finance data,
          and weekly execution board to provide real-time insights. All generated
          text can be edited and copied to your preferred format.
        </p>
      </div>
    </div>
  );
}
