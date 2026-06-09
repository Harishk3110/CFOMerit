"use client";

import Link from "next/link";
import { CheckCircle2, ListChecks } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import {
  buildDailyActions,
  emptyFinanceSettings,
  financeMetrics,
  formatMoney,
  isDueTodayOrEarlier,
  kpiProgress,
  leverageScore,
  trackProgress,
} from "@/lib/command-center";
import type { Cost, DecisionLog, FinanceSettings, FounderNote, Investor, KPI, OperatingTrack, OutreachLead, Risk, Task, WeeklyPlan } from "@/lib/types";
import { useLocalRecords } from "@/lib/use-local-records";

export default function DashboardPage() {
  const kpisStore = useLocalRecords<KPI>("kpis", []);
  const leadsStore = useLocalRecords<OutreachLead>("outreach_leads", []);
  const investorsStore = useLocalRecords<Investor>("investors", []);
  const costs = useLocalRecords<Cost>("costs", []).records;
  const financeSettings = useLocalRecords<FinanceSettings>("finance_settings", [emptyFinanceSettings()]).records[0] || emptyFinanceSettings();
  const tasksStore = useLocalRecords<Task>("tasks", []);
  const weeklyPlans = useLocalRecords<WeeklyPlan>("weekly_plans", []).records;
  const notes = useLocalRecords<FounderNote>("founder_notes", []).records;
  const tracks = useLocalRecords<OperatingTrack>("operating_tracks", []).records;
  const decisions = useLocalRecords<DecisionLog>("decision_log", []).records;
  const risks = useLocalRecords<Risk>("risks", []).records;

  const kpis = kpisStore.records;
  const leads = leadsStore.records;
  const investors = investorsStore.records;
  const tasks = tasksStore.records;
  const finance = financeMetrics(costs, financeSettings);
  const dueLeads = leads.filter((lead) => isDueTodayOrEarlier(lead.next_follow_up_at));
  const dueInvestors = investors.filter((investor) => isDueTodayOrEarlier(investor.next_follow_up_at));
  const dueTasks = tasks.filter((task) => isDueTodayOrEarlier(task.due_date) && !["done", "killed"].includes(task.status));
  const blockedTasks = tasks.filter((task) => task.status === "blocked");
  const tasksThisWeek = tasks.filter((task) => ["this_week", "in_progress", "waiting", "blocked", "done"].includes(task.status));
  const completedThisWeek = tasks.filter((task) => task.status === "done");
  const killedTasks = tasks.filter((task) => task.status === "killed");
  const overdueTasks = tasks.filter((task) => task.due_date && task.due_date < new Date().toISOString().slice(0, 10) && !["done", "killed"].includes(task.status));
  const completionRate = tasksThisWeek.length ? Math.round((completedThisWeek.length / tasksThisWeek.length) * 100) : 0;
  const contacted = leads.filter((lead) => lead.last_contacted_at || ["connection_sent", "first_dm_sent", "follow_up_1_sent", "follow_up_2_sent", "replied", "meeting_booked", "converted"].includes(lead.status)).length;
  const meetings = leads.filter((lead) => lead.status === "meeting_booked").length;
  const conversionRate = contacted ? Math.round((meetings / contacted) * 100) : 0;
  const averageProgress = kpis.length ? Math.round(kpis.reduce((sum, kpi) => sum + kpiProgress(kpi), 0) / kpis.length) : 0;
  const currentPlan = weeklyPlans[0];
  const mainBottleneck = blockedTasks[0]?.title || risks.filter((risk) => risk.status !== "closed").sort((a, b) => b.severity_score - a.severity_score)[0]?.title || "No bottleneck tracked";
  const nextAction = buildDailyActions({ tasks, leads, investors, kpis, costs, finance, notes, risks })[0];
  const actions = buildDailyActions({ tasks, leads, investors, kpis, costs, finance, notes, risks });
  const topTracks = tracks.slice().sort((a, b) => (b.priority === "critical" ? 1 : 0) - (a.priority === "critical" ? 1 : 0) || trackProgress(a) - trackProgress(b)).slice(0, 5);
  const weeklyTopTasks = tasks.slice().sort((a, b) => leverageScore(b) - leverageScore(a)).slice(0, 5);

  return (
    <div className="max-w-7xl p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Founder Command Center</h1>
        <p className="mt-1 text-slate-400">What do I need to do today, what is behind, and what matters most this week?</p>
      </div>

      <section className="mb-6 rounded-lg border border-blue-900/70 bg-blue-950/20 p-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          <Strip label="Follow-ups" value={dueLeads.length + dueInvestors.length} />
          <Strip label="Tasks due" value={dueTasks.length} />
          <Strip label="Blocked" value={blockedTasks.length} danger />
          <Strip label="KPIs behind" value={kpis.filter((kpi) => kpi.status === "behind").length} danger />
          <Strip label="Runway" value={finance.isCashflowPositive ? "Positive" : costs.length || financeSettings.current_cash_balance ? `${finance.runwayMonths.toFixed(1)} mo` : "No data"} />
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 md:col-span-1">
            <p className="text-xs uppercase text-slate-500">Highest priority</p>
            <p className="mt-1 line-clamp-2 text-sm font-semibold text-white">{nextAction?.title || "Add operating data"}</p>
          </div>
        </div>
      </section>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <MetricCard label="Total KPIs" value={kpis.length} icon={ListChecks} />
        <MetricCard label="At risk" value={kpis.filter((kpi) => kpi.status === "at_risk").length} variant={kpis.some((kpi) => kpi.status === "at_risk") ? "warning" : "default"} />
        <MetricCard label="Behind" value={kpis.filter((kpi) => kpi.status === "behind").length} variant={kpis.some((kpi) => kpi.status === "behind") ? "danger" : "default"} />
        <MetricCard label="Critical" value={kpis.filter((kpi) => kpi.priority === "critical").length} />
        <MetricCard label="Average Progress" value={`${averageProgress}%`} />
        <MetricCard label="Achieved" value={kpis.filter((kpi) => kpi.status === "achieved").length} icon={CheckCircle2} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel title="Daily Action List" href="/weekly" linkLabel="Open board">
          {actions.length ? actions.map((action) => (
            <ActionItem key={action.id} action={action} onDone={() => {
              if (action.id.startsWith("task-") || action.id.startsWith("blocked-")) tasksStore.updateRecord(action.id.replace("task-", "").replace("blocked-", ""), { status: "done" });
            }} />
          )) : <Empty text="No urgent actions. Add KPIs, tasks, follow-ups, risks, or finance settings." />}
        </Panel>

        <Panel title="Founder Focus" href="/weekly" linkLabel="Edit plan">
          <Detail label="Weekly theme" value={currentPlan?.weekly_theme || "No weekly plan"} />
          <Detail label="Top 3 priorities" value={currentPlan?.top_3_priorities || "No priorities set"} />
          <Detail label="Main bottleneck" value={mainBottleneck} />
          <Detail label="Next high-leverage action" value={weeklyTopTasks[0]?.title || nextAction?.title || "No task/action yet"} />
          <Detail label="Strategic focus" value={currentPlan?.notes || "Set current focus in Weekly Execution or Settings"} />
        </Panel>

        <Panel title="Execution Snapshot" href="/weekly" linkLabel="View tasks">
          <Row label="Tasks this week" value={tasksThisWeek.length} />
          <Row label="Completed" value={completedThisWeek.length} />
          <Row label="Overdue" value={overdueTasks.length} />
          <Row label="Blocked" value={blockedTasks.length} />
          <Row label="Killed" value={killedTasks.length} />
          <Row label="Completion rate" value={`${completionRate}%`} />
        </Panel>

        <Panel title="Outreach Snapshot" href="/outreach" linkLabel="Open outreach">
          <Row label="Total leads" value={leads.length} />
          <Row label="New leads" value={leads.filter((lead) => lead.status === "new").length} />
          <Row label="Follow-ups due" value={dueLeads.length} />
          <Row label="Replies" value={leads.filter((lead) => lead.status === "replied" || (lead.reply_count || 0) > 0).length} />
          <Row label="Meetings booked" value={meetings} />
          <Row label="Contacted to meeting" value={`${conversionRate}%`} />
        </Panel>

        <Panel title="Finance Snapshot" href="/finance" linkLabel="Open finance">
          <Row label="Cash balance" value={formatMoney(financeSettings.current_cash_balance, financeSettings.currency)} />
          <Row label="Monthly burn" value={formatMoney(finance.monthlyBurn, financeSettings.currency)} />
          <Row label="Recurring costs" value={formatMoney(finance.recurringMonthlyCosts, financeSettings.currency)} />
          <Row label="Revenue" value={formatMoney(financeSettings.monthly_revenue, financeSettings.currency)} />
          <Row label="Net burn" value={finance.isCashflowPositive ? "Cashflow positive" : formatMoney(finance.netBurn, financeSettings.currency)} />
          <Row label="Budget variance" value={formatMoney(finance.budgetVariance, financeSettings.currency)} />
        </Panel>

        <Panel title="Operating Tracks" href="/tracks" linkLabel="Manage tracks">
          {topTracks.length ? topTracks.map((track) => <TrackItem key={track.id} track={track} />) : <Empty text="No operating tracks yet. Load Merit track templates manually." />}
        </Panel>

        <Panel title="Notes / Decisions" href="/notes" linkLabel="Open notes">
          {notes.filter((note) => note.pinned).slice(0, 3).map((note) => <Item key={note.id} title={note.title} meta={note.category} status={note.priority} />)}
          {decisions.slice().sort((a, b) => b.decision_date.localeCompare(a.decision_date)).slice(0, 3).map((decision) => <Item key={decision.id} title={decision.decision} meta={decision.final_choice} status="decision" />)}
          {!notes.filter((note) => note.pinned).length && !decisions.length && <Empty text="No pinned notes or decisions yet." />}
        </Panel>

        <Panel title="Risks / Blockers" href="/risks" linkLabel="Open risks">
          {risks.filter((risk) => risk.status !== "closed").sort((a, b) => b.severity_score - a.severity_score).slice(0, 5).map((risk) => <Item key={risk.id} title={risk.title} meta={`Severity ${risk.severity_score} - ${risk.category}`} status={risk.status} />)}
          {blockedTasks.slice(0, 3).map((task) => <Item key={task.id} title={task.title} meta={task.owner || "Task blocker"} status="blocked" />)}
          {!risks.filter((risk) => risk.status !== "closed").length && !blockedTasks.length && <Empty text="No open risks or blockers tracked." />}
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, children, href, linkLabel }: { title: string; children: React.ReactNode; href: string; linkLabel: string }) {
  return <section className="rounded-lg border border-slate-800 bg-slate-900 p-5"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-semibold text-white">{title}</h2><Link href={href} className="text-xs font-medium text-blue-400 hover:text-blue-300">{linkLabel}</Link></div><div className="space-y-3">{children}</div></section>;
}
function Strip({ label, value, danger = false }: { label: string; value: string | number; danger?: boolean }) { return <div className={`rounded-lg border p-3 ${danger && value ? "border-red-900 bg-red-950/40" : "border-slate-800 bg-slate-950"}`}><p className="text-xs uppercase text-slate-500">{label}</p><p className="mt-1 text-lg font-bold text-white">{value}</p></div>; }
function Row({ label, value }: { label: string; value: string | number }) { return <div className="flex justify-between border-b border-slate-800 pb-2 text-sm last:border-0"><span className="text-slate-400">{label}</span><span className="font-semibold text-slate-100">{value}</span></div>; }
function Detail({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-slate-800 bg-slate-950 p-3"><p className="text-xs uppercase text-slate-500">{label}</p><p className="mt-1 whitespace-pre-wrap text-sm text-slate-100">{value}</p></div>; }
function Item({ title, meta, status }: { title: string; meta: string; status: string }) { return <div className="rounded-lg border border-slate-800 bg-slate-950 p-3"><div className="flex items-start justify-between gap-3"><div><p className="font-medium text-slate-100">{title}</p><p className="mt-1 text-xs text-slate-500">{meta}</p></div><StatusBadge status={status} /></div></div>; }
function TrackItem({ track }: { track: OperatingTrack }) { const progress = Math.round(trackProgress(track)); return <div className="rounded-lg border border-slate-800 bg-slate-950 p-3"><div className="mb-2 flex items-start justify-between gap-3"><div><p className="font-medium text-slate-100">{track.name}</p><p className="text-xs text-slate-500">{track.owner || "No owner"}</p></div><StatusBadge status={track.status} /></div><div className="h-2 rounded-full bg-slate-800"><div className="h-2 rounded-full bg-blue-500" style={{ width: `${progress}%` }} /></div><p className="mt-1 text-xs text-slate-500">{progress}% progress</p></div>; }
function ActionItem({ action, onDone }: { action: { title: string; source: string; priority: string; dueDate?: string; href: string }; onDone: () => void }) { return <div className="rounded-lg border border-slate-800 bg-slate-950 p-3"><div className="flex items-start justify-between gap-3"><div><p className="font-medium text-slate-100">{action.title}</p><p className="mt-1 text-xs text-slate-500">{action.source}{action.dueDate ? ` - due ${action.dueDate}` : ""}</p></div><StatusBadge status={action.priority} /></div><div className="mt-3 flex gap-2"><button onClick={onDone} className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800">Mark done</button><Link href={action.href} className="rounded-md border border-blue-900 px-2 py-1 text-xs text-blue-300 hover:bg-blue-950">Open item</Link></div></div>; }
function Empty({ text }: { text: string }) { return <p className="rounded-lg border border-dashed border-slate-800 bg-slate-950 p-4 text-sm text-slate-500">{text}</p>; }
