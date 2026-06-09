"use client";

import Link from "next/link";
import { AlertCircle, CheckCircle2, Clock, DollarSign, ListChecks, TrendingUp, Users } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { emptyFinanceSettings, financeMetrics, formatMoney, isDueTodayOrEarlier, kpiProgress } from "@/lib/command-center";
import type { Cost, FinanceSettings, FounderNote, Investor, KPI, OutreachLead, Task, WeeklyPlan } from "@/lib/types";
import { useLocalRecords } from "@/lib/use-local-records";

export default function DashboardPage() {
  const kpis = useLocalRecords<KPI>("kpis", []).records;
  const leads = useLocalRecords<OutreachLead>("outreach_leads", []).records;
  const investors = useLocalRecords<Investor>("investors", []).records;
  const costs = useLocalRecords<Cost>("costs", []).records;
  const financeSettings = useLocalRecords<FinanceSettings>("finance_settings", [emptyFinanceSettings()]).records[0] || emptyFinanceSettings();
  const tasks = useLocalRecords<Task>("tasks", []).records;
  const weeklyPlans = useLocalRecords<WeeklyPlan>("weekly_plans", []).records;
  const notes = useLocalRecords<FounderNote>("founder_notes", []).records;

  const finance = financeMetrics(costs, financeSettings);
  const dueLeads = leads.filter((lead) => isDueTodayOrEarlier(lead.next_follow_up_at));
  const dueInvestors = investors.filter((investor) => isDueTodayOrEarlier(investor.next_follow_up_at));
  const activeInvestorConversations = investors.filter((investor) =>
    ["contacted", "replied", "meeting_booked", "first_meeting_done", "follow_up_sent", "diligence", "soft_commit"].includes(investor.status)
  ).length;
  const meetingsBooked =
    leads.filter((lead) => lead.status === "meeting_booked").length +
    investors.filter((investor) => investor.status === "meeting_booked").length;
  const openTasks = tasks.filter((task) => !["done", "killed"].includes(task.status));
  const blockedTasks = tasks.filter((task) => task.status === "blocked");
  const criticalKpis = kpis.filter((kpi) => kpi.priority === "critical");
  const weeklyProgress = kpis.filter((kpi) => kpi.period === "weekly");
  const weeklyAverage = weeklyProgress.length
    ? Math.round(weeklyProgress.reduce((sum, kpi) => sum + kpiProgress(kpi), 0) / weeklyProgress.length)
    : 0;
  const pinnedNotes = notes.filter((note) => note.pinned && note.status !== "archived").slice(0, 5);
  const currentPlan = weeklyPlans[0];

  const actions = [
    dueLeads.length ? `Follow up with ${dueLeads.length} outreach lead(s).` : null,
    dueInvestors.length ? `Follow up with ${dueInvestors.length} investor(s).` : null,
    blockedTasks.length ? `Unblock ${blockedTasks.length} blocked task(s).` : null,
    kpis.some((kpi) => kpi.status === "behind") ? "Review behind KPIs and decide what gets cut or fixed." : null,
    !kpis.length && !leads.length && !investors.length && !costs.length ? "Add your first KPI, lead, investor, cost, or weekly plan to start operating from this dashboard." : null,
  ].filter(Boolean) as string[];

  return (
    <div className="max-w-7xl p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Founder Command Center</h1>
        <p className="mt-1 text-slate-400">What do I need to do today to move Merit forward?</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Total KPIs" value={kpis.length} icon={ListChecks} />
        <MetricCard label="KPIs Behind" value={kpis.filter((kpi) => kpi.status === "behind").length} icon={AlertCircle} variant={kpis.some((kpi) => kpi.status === "behind") ? "danger" : "default"} />
        <MetricCard label="Outreach Leads" value={leads.length} icon={Users} />
        <MetricCard label="Follow-ups Due" value={dueLeads.length + dueInvestors.length} icon={Clock} variant={dueLeads.length + dueInvestors.length ? "warning" : "default"} />
        <MetricCard label="Investor Conversations" value={activeInvestorConversations} icon={TrendingUp} />
        <MetricCard label="Meetings Booked" value={meetingsBooked} icon={CheckCircle2} />
        <MetricCard label="Monthly Burn" value={formatMoney(finance.monthlyBurn, financeSettings.currency)} icon={DollarSign} />
        <MetricCard label="Runway" value={finance.isCashflowPositive ? "Cashflow positive" : finance.runwayMonths ? `${finance.runwayMonths.toFixed(1)} mo` : "No data"} />
        <MetricCard label="Open Tasks" value={openTasks.length} />
        <MetricCard label="Blocked Tasks" value={blockedTasks.length} variant={blockedTasks.length ? "danger" : "default"} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel title="Today's Action List" href="/weekly" linkLabel="Open execution">
          {actions.length ? (
            <div className="space-y-3">
              {actions.map((action) => (
                <div key={action} className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm text-slate-200">{action}</div>
              ))}
            </div>
          ) : (
            <Empty text="No urgent actions from current data." />
          )}
        </Panel>

        <Panel title="KPI Snapshot" href="/kpis" linkLabel="Manage KPIs">
          {kpis.length ? (
            <div className="space-y-3">
              <Row label="On track" value={kpis.filter((kpi) => kpi.status === "on_track").length} />
              <Row label="At risk" value={kpis.filter((kpi) => kpi.status === "at_risk").length} />
              <Row label="Behind" value={kpis.filter((kpi) => kpi.status === "behind").length} />
              <Row label="Critical" value={criticalKpis.length} />
              <Row label="Weekly progress" value={`${weeklyAverage}%`} />
            </div>
          ) : (
            <Empty text="No KPIs tracked yet. Add your first KPI." />
          )}
        </Panel>

        <Panel title="Finance Snapshot" href="/finance" linkLabel="Open finance">
          {costs.length || financeSettings.current_cash_balance ? (
            <div className="space-y-3">
              <Row label="Cash balance" value={formatMoney(financeSettings.current_cash_balance, financeSettings.currency)} />
              <Row label="Monthly revenue" value={formatMoney(financeSettings.monthly_revenue, financeSettings.currency)} />
              <Row label="Monthly burn" value={formatMoney(finance.monthlyBurn, financeSettings.currency)} />
              <Row label="Runway" value={finance.isCashflowPositive ? "Cashflow positive" : `${finance.runwayMonths.toFixed(1)} months`} />
            </div>
          ) : (
            <Empty text="No costs tracked yet. Add your first cost to calculate burn and runway." />
          )}
        </Panel>

        <Panel title="Outreach Follow-ups Due" href="/outreach" linkLabel="Open outreach">
          {dueLeads.length ? dueLeads.slice(0, 5).map((lead) => (
            <Item key={lead.id} title={`${lead.first_name} ${lead.last_name}`} meta={`${lead.company_name} - ${lead.role_title}`} status={lead.status} />
          )) : <Empty text="No outreach follow-ups due." />}
        </Panel>

        <Panel title="Investor Follow-ups Due" href="/investors" linkLabel="Open investors">
          {dueInvestors.length ? dueInvestors.slice(0, 5).map((investor) => (
            <Item key={investor.id} title={investor.investor_name} meta={investor.firm_name || investor.investor_type} status={investor.status} />
          )) : <Empty text="No investor follow-ups due." />}
        </Panel>

        <Panel title="Weekly Execution" href="/weekly" linkLabel="Open board">
          {currentPlan || tasks.length ? (
            <div className="space-y-3">
              {currentPlan && <Item title={currentPlan.weekly_theme || "Weekly plan"} meta={currentPlan.key_metric_target || "No metric target set"} status={currentPlan.status} />}
              <Row label="Open tasks" value={openTasks.length} />
              <Row label="Blocked" value={blockedTasks.length} />
            </div>
          ) : (
            <Empty text="No weekly plan yet. Create this week's operating plan." />
          )}
        </Panel>

        <Panel title="Important Notes" href="/notes" linkLabel="Open notes">
          {pinnedNotes.length ? pinnedNotes.map((note) => (
            <Item key={note.id} title={note.title} meta={note.category} status={note.priority} />
          )) : <Empty text="No important notes pinned yet." />}
        </Panel>

        <Panel title="Risks / Blockers" href="/weekly" linkLabel="Review blockers">
          {blockedTasks.length || kpis.some((kpi) => ["behind", "at_risk"].includes(kpi.status)) ? (
            <div className="space-y-3">
              {blockedTasks.slice(0, 3).map((task) => <Item key={task.id} title={task.title} meta={task.owner} status="blocked" />)}
              {kpis.filter((kpi) => ["behind", "at_risk"].includes(kpi.status)).slice(0, 3).map((kpi) => <Item key={kpi.id} title={kpi.title} meta={`${kpi.current_value}/${kpi.target_value} ${kpi.unit}`} status={kpi.status} />)}
            </div>
          ) : (
            <Empty text="No risks or blockers tracked yet." />
          )}
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, children, href, linkLabel }: { title: string; children: React.ReactNode; href: string; linkLabel: string }) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-semibold text-white">{title}</h2>
        <Link href={href} className="text-xs font-medium text-blue-400 hover:text-blue-300">{linkLabel}</Link>
      </div>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return <div className="flex justify-between border-b border-slate-800 pb-2 text-sm last:border-0"><span className="text-slate-400">{label}</span><span className="font-semibold text-slate-100">{value}</span></div>;
}

function Item({ title, meta, status }: { title: string; meta: string; status: string }) {
  return <div className="rounded-lg border border-slate-800 bg-slate-950 p-3"><div className="flex items-start justify-between gap-3"><div><p className="font-medium text-slate-100">{title}</p><p className="mt-1 text-xs text-slate-500">{meta}</p></div><StatusBadge status={status} /></div></div>;
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-lg border border-dashed border-slate-800 bg-slate-950 p-4 text-sm text-slate-500">{text}</p>;
}
