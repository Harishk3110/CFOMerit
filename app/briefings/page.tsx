"use client";

import { FormEvent, useState } from "react";
import { Calendar, DollarSign, Edit, MessageSquare, Plus, Sparkles, Trash2, TrendingUp, Users } from "lucide-react";
import { CopyButton } from "@/components/CopyButton";
import { emptyFinanceSettings, financeMetrics, formatMoney, generatedWeeklyReview, isDueTodayOrEarlier } from "@/lib/command-center";
import type { AIBriefing, Cost, FinanceSettings, Investor, KPI, OutreachLead, Task } from "@/lib/types";
import { useLocalRecords } from "@/lib/use-local-records";

const briefingTypes: Array<{ id: AIBriefing["briefing_type"]; title: string; icon: typeof Calendar }> = [
  { id: "daily_founder", title: "Daily Founder Briefing", icon: Calendar },
  { id: "weekly_strategy", title: "Weekly Strategy Review", icon: TrendingUp },
  { id: "investor_meeting_prep", title: "Investor Meeting Prep", icon: Users },
  { id: "recruiter_meeting_prep", title: "Recruiter Meeting Prep", icon: MessageSquare },
  { id: "finance_health", title: "Finance Health Report", icon: DollarSign },
  { id: "outreach_performance", title: "Outreach Performance Review", icon: Sparkles },
];

export default function BriefingsPage() {
  const briefingsStore = useLocalRecords<AIBriefing>("ai_briefings", []);
  const leads = useLocalRecords<OutreachLead>("outreach_leads", []).records;
  const investors = useLocalRecords<Investor>("investors", []).records;
  const costs = useLocalRecords<Cost>("costs", []).records;
  const financeSettings = useLocalRecords<FinanceSettings>("finance_settings", [emptyFinanceSettings()]).records[0] || emptyFinanceSettings();
  const tasks = useLocalRecords<Task>("tasks", []).records;
  const kpis = useLocalRecords<KPI>("kpis", []).records;
  const [selectedId, setSelectedId] = useState("");
  const [editing, setEditing] = useState<AIBriefing | null>(null);
  const selected = briefingsStore.records.find((briefing) => briefing.id === selectedId) || briefingsStore.records[0];
  const finance = financeMetrics(costs, financeSettings);

  const generate = (type: AIBriefing["briefing_type"]) => {
    const now = new Date().toISOString();
    const dueLeads = leads.filter((lead) => isDueTodayOrEarlier(lead.next_follow_up_at));
    const dueInvestors = investors.filter((investor) => isDueTodayOrEarlier(investor.next_follow_up_at));
    const recruiter = leads.find((lead) => lead.lead_type === "recruiter");
    const investor = investors.find((item) => item.status === "meeting_booked") || investors[0];
    const templates: Record<AIBriefing["briefing_type"], string> = {
      daily_founder: `Daily Founder Briefing

Follow-ups due: ${dueLeads.length + dueInvestors.length}
Open tasks: ${tasks.filter((task) => !["done", "killed"].includes(task.status)).length}
Blocked tasks: ${tasks.filter((task) => task.status === "blocked").length}
KPIs behind: ${kpis.filter((kpi) => kpi.status === "behind").length}

Recommended actions:
- Clear overdue follow-ups.
- Unblock the highest-priority execution item.
- Review any behind or at-risk KPIs.`,
      weekly_strategy: generatedWeeklyReview(tasks),
      investor_meeting_prep: investor ? `Investor Meeting Prep: ${investor.investor_name}

Firm: ${investor.firm_name || "Independent"}
Thesis: ${investor.thesis || "Not captured"}
Likely questions: differentiation, recruiter demand, defensibility, monetization.
Strong angle: Merit is proof-of-ability infrastructure for early talent.
Risks they may challenge: ${investor.concerns || "Distribution and willingness to pay."}
Follow-up ask: warm intros to recruiters hiring interns, juniors, students, or fresh grads.` : "No investor tracked yet. Add an investor before generating meeting prep.",
      recruiter_meeting_prep: recruiter ? `Recruiter Meeting Prep: ${recruiter.first_name} ${recruiter.last_name}

Company: ${recruiter.company_name}
Likely hiring pain: ${recruiter.pain_angle || "Resume screening is weak signal for early talent."}
Merit pitch: recruiters evaluate students through real projects, evidence, outcomes, and proof of ability.
Questions: current screening workflow, strongest hiring signals, pilot interest.
Follow-up: propose a short pilot around an open intern or junior role.` : "No recruiter lead tracked yet. Add a recruiter lead before generating recruiter prep.",
      finance_health: `Finance Health Report

Cash: ${formatMoney(financeSettings.current_cash_balance, financeSettings.currency)}
Monthly burn: ${formatMoney(finance.monthlyBurn, financeSettings.currency)}
Revenue: ${formatMoney(financeSettings.monthly_revenue, financeSettings.currency)}
Runway: ${finance.isCashflowPositive ? "cashflow positive" : `${finance.runwayMonths.toFixed(1)} months`}

Priorities:
- Tie spend to recruiter validation, product quality, or fundraising readiness.
- Watch recurring software and AI/API costs.
- Do not add discretionary spend without a KPI impact.`,
      outreach_performance: `Outreach Performance Review

Total leads: ${leads.length}
Follow-ups due: ${dueLeads.length}
High-priority leads: ${leads.filter((lead) => lead.priority_score >= 80).length}

By status:
${Object.entries(leads.reduce<Record<string, number>>((acc, lead) => { acc[lead.status] = (acc[lead.status] || 0) + 1; return acc; }, {})).map(([status, count]) => `- ${status}: ${count}`).join("\n") || "- No leads yet"}

Next actions:
- Add targeted leads.
- Generate drafts.
- Copy messages manually.
- Track follow-up dates.`,
    };
    const record: AIBriefing = { id: `briefing-${crypto.randomUUID()}`, briefing_type: type, briefing_text: templates[type], related_data: {}, created_at: now, updated_at: now, created_by: "" };
    briefingsStore.addRecord(record);
    setSelectedId(record.id);
  };

  const saveBriefing = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    const data = new FormData(event.currentTarget);
    const record = { ...editing, briefing_type: String(data.get("briefing_type")) as AIBriefing["briefing_type"], briefing_text: String(data.get("briefing_text") || ""), updated_at: new Date().toISOString() };
    if (briefingsStore.records.some((briefing) => briefing.id === record.id)) briefingsStore.updateRecord(record.id, record);
    else briefingsStore.addRecord(record);
    setSelectedId(record.id);
    setEditing(null);
  };

  const addManual = () => {
    const now = new Date().toISOString();
    setEditing({ id: `briefing-${crypto.randomUUID()}`, briefing_type: "daily_founder", briefing_text: "", related_data: {}, created_at: now, updated_at: now, created_by: "" });
  };

  const deleteBriefing = (briefing: AIBriefing) => {
    if (window.confirm("Delete this briefing?")) briefingsStore.deleteRecord(briefing.id);
  };

  return (
    <div className="max-w-7xl p-6 lg:p-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div><h1 className="text-3xl font-bold text-white">AI Briefings</h1><p className="mt-1 text-slate-400">Generate, edit, copy, and delete founder operating briefings.</p></div>
        <button onClick={addManual} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500"><Plus size={18} /> Add Briefing</button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        {briefingTypes.map((type) => {
          const Icon = type.icon;
          return <button key={type.id} onClick={() => generate(type.id)} className="rounded-lg border border-slate-800 bg-slate-900 p-4 text-left hover:border-blue-700 hover:bg-blue-950/30"><div className="mb-2 flex items-center gap-2 text-blue-400"><Icon size={18} /><span className="font-semibold">{type.title}</span></div><p className="text-sm text-slate-500">Generate from current command-center data.</p></button>;
        })}
      </div>

      {briefingsStore.records.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-800 bg-slate-900 p-10 text-center"><p className="text-lg font-semibold text-slate-100">No AI briefings saved yet. Generate or add your first briefing.</p></div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <h2 className="mb-4 font-semibold text-white">Saved Briefings</h2>
            <div className="space-y-2">{briefingsStore.records.map((briefing) => <button key={briefing.id} onClick={() => setSelectedId(briefing.id)} className={`w-full rounded-lg border p-3 text-left hover:bg-slate-800 ${selected?.id === briefing.id ? "border-blue-700 bg-blue-950/30" : "border-slate-800 bg-slate-950"}`}><p className="font-medium text-slate-100">{briefing.briefing_type.replace(/_/g, " ")}</p><p className="mt-1 text-xs text-slate-500">{new Date(briefing.created_at).toLocaleString()}</p></button>)}</div>
          </section>
          <section className="rounded-lg border border-slate-800 bg-slate-900 p-5 lg:col-span-2">
            {selected ? <><div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-xl font-bold text-white">{selected.briefing_type.replace(/_/g, " ")}</h2><div className="flex gap-2"><button onClick={() => setEditing(selected)} className="rounded-md border border-slate-700 p-2 text-slate-300 hover:bg-slate-800"><Edit size={16} /></button><button onClick={() => deleteBriefing(selected)} className="rounded-md border border-red-900 p-2 text-red-300 hover:bg-red-950"><Trash2 size={16} /></button></div></div><textarea value={selected.briefing_text} onChange={(event) => briefingsStore.updateRecord(selected.id, { briefing_text: event.target.value })} rows={22} className="mb-4 w-full rounded-lg border border-slate-700 bg-slate-950 p-4 text-sm leading-relaxed text-slate-100 focus:border-blue-500 focus:outline-none" /><CopyButton text={selected.briefing_text} label="Copy Briefing" /></> : <p className="text-sm text-slate-500">Select a briefing.</p>}
          </section>
        </div>
      )}

      {editing && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"><div className="w-full max-w-2xl rounded-lg border border-slate-800 bg-slate-950 p-6 shadow-2xl"><h2 className="mb-5 text-xl font-bold text-white">Edit Briefing</h2><form onSubmit={saveBriefing} className="space-y-4"><label className="block"><span className="mb-1 block text-sm text-slate-400">Type</span><select name="briefing_type" defaultValue={editing.briefing_type} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100">{briefingTypes.map((type) => <option key={type.id} value={type.id}>{type.title}</option>)}</select></label><label className="block"><span className="mb-1 block text-sm text-slate-400">Text</span><textarea name="briefing_text" rows={14} defaultValue={editing.briefing_text} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100" /></label><div className="flex gap-3 pt-2"><button type="button" onClick={() => setEditing(null)} className="flex-1 rounded-lg border border-slate-700 px-4 py-2 font-medium text-slate-300 hover:bg-slate-900">Cancel</button><button type="submit" className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500">Save Briefing</button></div></form></div></div>}
    </div>
  );
}
