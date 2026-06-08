"use client";

import { useState } from "react";
import { Calendar, Copy, DollarSign, MessageSquare, Sparkles, TrendingUp, Users } from "lucide-react";
import { CopyButton } from "@/components/CopyButton";
import { financeMetrics, formatMoney, generatedWeeklyReview, isDueTodayOrEarlier } from "@/lib/command-center";
import {
  seedBriefings,
  seedCosts,
  seedFinanceSettings,
  seedInvestors,
  seedOutreachLeads,
  seedTasks,
} from "@/lib/seed-data";
import type { AIBriefing } from "@/lib/types";
import { useLocalRecords } from "@/lib/use-local-records";

const briefingTypes: Array<{ id: AIBriefing["briefing_type"]; title: string; description: string; icon: typeof Calendar }> = [
  { id: "daily_founder", title: "Daily Founder Briefing", description: "Follow-ups, meetings, finance warnings, and top actions.", icon: Calendar },
  { id: "weekly_strategy", title: "Weekly Strategy Review", description: "What moved, what did not, and next-week priorities.", icon: TrendingUp },
  { id: "investor_meeting_prep", title: "Investor Meeting Prep", description: "Investor context, likely questions, risk answers, and ask.", icon: Users },
  { id: "recruiter_meeting_prep", title: "Recruiter Meeting Prep", description: "Hiring pain, Merit angle, questions, and follow-up.", icon: MessageSquare },
  { id: "finance_health", title: "Finance Health Report", description: "Burn, runway, cost drivers, and budget risks.", icon: DollarSign },
  { id: "outreach_performance", title: "Outreach Performance Review", description: "Pipeline state, overdue follow-ups, and next actions.", icon: Copy },
];

export default function BriefingsPage() {
  const briefingsStore = useLocalRecords("merit.ai_briefings", seedBriefings);
  const leads = useLocalRecords("merit.outreach_leads", seedOutreachLeads).records;
  const investors = useLocalRecords("merit.investors", seedInvestors).records;
  const costs = useLocalRecords("merit.costs", seedCosts).records;
  const tasks = useLocalRecords("merit.tasks", seedTasks).records;
  const [selected, setSelected] = useState<AIBriefing | null>(briefingsStore.records[0] || null);

  const metrics = financeMetrics(costs, seedFinanceSettings);

  const generate = (type: AIBriefing["briefing_type"]) => {
    const overdueLeads = leads.filter((lead) => isDueTodayOrEarlier(lead.next_follow_up_at));
    const overdueInvestors = investors.filter((investor) => isDueTodayOrEarlier(investor.next_follow_up_at));
    const topTasks = tasks.filter((task) => ["this_week", "in_progress", "blocked"].includes(task.status)).slice(0, 5);
    const highPriorityLeads = leads.filter((lead) => lead.priority_score >= 85).slice(0, 5);
    const meetingInvestor = investors.find((investor) => investor.status === "meeting_booked") || investors[0];
    const recruiterLead = leads.find((lead) => lead.lead_type === "recruiter") || leads[0];

    const templates: Record<AIBriefing["briefing_type"], string> = {
      daily_founder: `Daily Founder Briefing

Follow-ups Due:
${[...overdueLeads.map((lead) => `- ${lead.first_name} ${lead.last_name}: ${lead.status}`), ...overdueInvestors.map((investor) => `- ${investor.investor_name}: ${investor.status}`)].join("\n") || "- None due today."}

High-Priority Leads:
${highPriorityLeads.map((lead) => `- ${lead.first_name} ${lead.last_name}, ${lead.company_name}, score ${lead.priority_score}`).join("\n") || "- No high-priority leads yet."}

Finance:
- Monthly burn: ${formatMoney(metrics.monthlyBurn)}
- Runway: ${metrics.isCashflowPositive ? "cashflow positive" : `${metrics.runwayMonths.toFixed(1)} months`}

Top Tasks:
${topTasks.map((task) => `- ${task.title} (${task.status})`).join("\n") || "- No active tasks."}

Recommended Actions:
- Clear overdue follow-ups first.
- Keep recruiter validation as the highest-leverage operating priority.
- Do not add spend unless it improves validation, product quality, or fundraising readiness.`,
      weekly_strategy: generatedWeeklyReview(tasks),
      investor_meeting_prep: `Investor Meeting Prep: ${meetingInvestor?.investor_name || "Investor"}

Background:
${meetingInvestor?.firm_name || "Unknown firm"} focuses on ${meetingInvestor?.thesis || meetingInvestor?.sector_focus || "early-stage companies"}.

Why Relevant:
Merit is building proof-of-ability infrastructure for early talent. This fits investors interested in future of work, education, HR tech, SaaS, or marketplace infrastructure.

Likely Questions:
- How is Merit different from LinkedIn, Handshake, or job boards?
- What evidence shows recruiters will change workflow?
- What is the wedge and monetization path?
- What makes the student supply defensible?

Strongest Pitch Angle:
Merit gives recruiters real project evidence and outcomes instead of weak resume signals.

Risks They May Challenge:
${meetingInvestor?.concerns || "Distribution, willingness to pay, and defensibility."}

Suggested Answers:
- Merit is not a job board. It is structured proof of ability.
- The first wedge is recruiter validation around interns and junior roles.
- Monetization follows from recruiter workflow value after pilot validation.

Follow-up Ask:
Ask for warm intros to recruiters hiring interns, juniors, students, or fresh graduates.`,
      recruiter_meeting_prep: `Recruiter Meeting Prep: ${recruiterLead?.first_name || "Recruiter"} ${recruiterLead?.last_name || ""}

Background:
${recruiterLead?.role_title || "Recruiter"} at ${recruiterLead?.company_name || "target company"}.

Likely Hiring Pain:
${recruiterLead?.pain_angle || "Resume screening is low-signal for early talent and takes too much time."}

Merit Pitch Angle:
Merit helps recruiters evaluate students through real projects, evidence, outcomes, and proof of ability instead of relying only on resumes.

Questions to Ask:
- How do you screen junior candidates today?
- What makes a student candidate credible?
- Where do resumes fail in your workflow?
- Would verified project evidence save time?

Suggested Follow-up:
Offer a short pilot using current open intern or junior roles.`,
      finance_health: `Finance Health Report

Current Position:
- Cash balance: ${formatMoney(seedFinanceSettings.current_cash_balance)}
- Monthly revenue: ${formatMoney(seedFinanceSettings.monthly_revenue)}
- Monthly burn: ${formatMoney(metrics.monthlyBurn)}
- Net burn: ${metrics.isCashflowPositive ? "cashflow positive" : formatMoney(metrics.netBurn)}
- Runway: ${metrics.isCashflowPositive ? "cashflow positive" : `${metrics.runwayMonths.toFixed(1)} months`}

Biggest Cost Drivers:
${costs.sort((a, b) => b.amount - a.amount).slice(0, 5).map((cost) => `- ${cost.vendor}: ${formatMoney(cost.amount)} (${cost.category})`).join("\n")}

Budget Risks:
- AI/API spend can scale quietly if generation volume grows.
- Contractor spend should stay tied to recruiter-facing product progress.

Suggested Cost Cuts:
- Batch or reduce low-value AI generations.
- Delay non-critical design and event costs until recruiter demand improves.

Financial Priorities:
Keep spend pointed at recruiter validation, proof-of-ability UX, and investor readiness.`,
      outreach_performance: `Outreach Performance Review

Total Leads: ${leads.length}
High-Priority Leads: ${highPriorityLeads.length}
Overdue Follow-ups: ${overdueLeads.length}

By Status:
${Object.entries(leads.reduce<Record<string, number>>((acc, lead) => {
  acc[lead.status] = (acc[lead.status] || 0) + 1;
  return acc;
}, {})).map(([status, count]) => `- ${status}: ${count}`).join("\n")}

Recommended Next Actions:
- Work overdue follow-ups before adding new leads.
- Generate drafts for new or researched leads.
- Prioritize recruiter and investor leads scoring 85+.
- Keep all sending manual and use Copy Message only.`,
    };

    const record: AIBriefing = {
      id: `briefing-${crypto.randomUUID()}`,
      briefing_type: type,
      briefing_text: templates[type],
      related_data: { generated_from: "local_records" },
      created_at: new Date().toISOString(),
      created_by: "",
    };
    briefingsStore.addRecord(record);
    setSelected(record);
  };

  return (
    <div className="max-w-7xl p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-950">AI Briefings</h1>
        <p className="mt-1 text-slate-600">Generate and store copyable operating briefings from current Merit data.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="lg:col-span-1">
          <div className="grid gap-3">
            {briefingTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button key={type.id} onClick={() => generate(type.id)} className="rounded-lg border border-slate-200 bg-white p-4 text-left hover:border-blue-400 hover:bg-blue-50">
                  <div className="mb-2 flex items-center gap-3">
                    <Icon size={18} className="text-blue-700" />
                    <h2 className="font-bold text-slate-950">{type.title}</h2>
                  </div>
                  <p className="text-sm text-slate-600">{type.description}</p>
                  <div className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-blue-700"><Sparkles size={16} /> Generate</div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white lg:col-span-2">
          {selected ? (
            <>
              <div className="border-b border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-950">{briefingTypes.find((type) => type.id === selected.briefing_type)?.title}</h2>
                <p className="mt-1 text-sm text-slate-600">Saved {new Date(selected.created_at).toLocaleString()}</p>
              </div>
              <div className="p-6">
                <textarea value={selected.briefing_text} onChange={(event) => setSelected({ ...selected, briefing_text: event.target.value })} rows={22} className="mb-4 w-full rounded-lg border border-slate-300 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800" />
                <CopyButton text={selected.briefing_text} label="Copy Briefing" />
              </div>
            </>
          ) : (
            <p className="p-8 text-center text-sm text-slate-600">Generate a briefing to view it here.</p>
          )}
        </section>
      </div>

      <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-slate-950">Saved Briefings</h2>
        <div className="grid gap-2">
          {briefingsStore.records.map((briefing) => (
            <button key={briefing.id} onClick={() => setSelected(briefing)} className="flex items-center justify-between rounded-md border border-slate-100 p-3 text-left hover:bg-slate-50">
              <span className="font-medium text-slate-900">{briefing.briefing_type.replace(/_/g, " ")}</span>
              <span className="text-xs text-slate-500">{new Date(briefing.created_at).toLocaleDateString()}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
