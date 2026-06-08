"use client";

import Link from "next/link";
import { AlertCircle, CheckCircle2, Clock, DollarSign, TrendingUp, Users, Zap } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { financeMetrics, formatMoney, isDueTodayOrEarlier } from "@/lib/command-center";
import {
  seedCosts,
  seedFinanceSettings,
  seedInvestors,
  seedOutreachLeads,
  seedTasks,
  seedWeeklyPlans,
} from "@/lib/seed-data";
import { useLocalRecords } from "@/lib/use-local-records";

export default function DashboardPage() {
  const leads = useLocalRecords("merit.outreach_leads", seedOutreachLeads).records;
  const investors = useLocalRecords("merit.investors", seedInvestors).records;
  const costs = useLocalRecords("merit.costs", seedCosts).records;
  const tasks = useLocalRecords("merit.tasks", seedTasks).records;
  const weeklyPlans = useLocalRecords("merit.weekly_plans", seedWeeklyPlans).records;

  const metrics = financeMetrics(costs, seedFinanceSettings);
  const followUpsDue = [
    ...leads
      .filter((lead) => isDueTodayOrEarlier(lead.next_follow_up_at))
      .map((lead) => ({
        id: lead.id,
        name: `${lead.first_name} ${lead.last_name}`,
        context: `${lead.role_title} at ${lead.company_name}`,
        href: "/outreach",
        status: lead.status,
      })),
    ...investors
      .filter((investor) => isDueTodayOrEarlier(investor.next_follow_up_at))
      .map((investor) => ({
        id: investor.id,
        name: investor.investor_name,
        context: investor.firm_name || investor.investor_type,
        href: "/investors",
        status: investor.status,
      })),
  ];
  const activeConversations = leads.filter((lead) =>
    ["connected", "first_dm_sent", "follow_up_1_sent", "follow_up_2_sent", "replied", "meeting_booked"].includes(lead.status)
  ).length;
  const meetingsBooked =
    leads.filter((lead) => lead.status === "meeting_booked").length +
    investors.filter((investor) => investor.status === "meeting_booked").length;
  const weeklyPlan = weeklyPlans[0];
  const openRisks = [
    metrics.runwayMonths < 3 ? "Runway below 3 months. Cut spend or accelerate revenue now." : null,
    tasks.some((task) => task.status === "blocked") ? "Critical work is blocked on the weekly execution board." : null,
    leads.filter((lead) => lead.status === "new").length > 3 ? "New outreach leads are piling up without message generation." : null,
  ].filter(Boolean) as string[];

  return (
    <div className="max-w-7xl p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-950">Dashboard</h1>
        <p className="mt-1 text-slate-600">What do we need to do today to move Merit forward?</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Recruiter Leads" value={leads.filter((lead) => lead.lead_type === "recruiter").length} icon={Users} />
        <MetricCard label="Investor Leads" value={investors.length} icon={TrendingUp} />
        <MetricCard label="Active Conversations" value={activeConversations} icon={Clock} />
        <MetricCard
          label="Follow-ups Due Today"
          value={followUpsDue.length}
          icon={AlertCircle}
          variant={followUpsDue.length > 0 ? "warning" : "success"}
        />
        <MetricCard label="Meetings Booked" value={meetingsBooked} icon={CheckCircle2} />
        <MetricCard label="Monthly Burn" value={formatMoney(metrics.monthlyBurn)} icon={DollarSign} />
        <MetricCard
          label="Estimated Runway"
          value={metrics.isCashflowPositive ? "Cashflow positive" : `${metrics.runwayMonths.toFixed(1)} months`}
          icon={Zap}
          variant={!metrics.isCashflowPositive && metrics.runwayMonths < 3 ? "danger" : "default"}
        />
        <MetricCard label="Current Focus" value="Recruiter validation" subtext="Portfolio proof and investor narrative" />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-lg border border-slate-200 bg-white p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-950">Today&apos;s Follow-ups</h2>
            <Link className="text-sm font-medium text-blue-700 hover:underline" href="/outreach">
              Open outreach
            </Link>
          </div>
          <div className="space-y-3">
            {followUpsDue.length ? (
              followUpsDue.slice(0, 6).map((item) => (
                <Link key={item.id} href={item.href} className="flex items-center justify-between rounded-md border border-slate-100 p-3 hover:bg-slate-50">
                  <div>
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-600">{item.context}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </Link>
              ))
            ) : (
              <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-600">No follow-ups due today. Add next follow-up dates in Outreach or Investors.</p>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-bold text-slate-950">This Week&apos;s Priorities</h2>
          {weeklyPlan ? (
            <div className="space-y-3">
              <p className="font-semibold text-slate-900">{weeklyPlan.weekly_theme}</p>
              {weeklyPlan.top_3_priorities.split("\n").map((priority, index) => (
                <div key={priority} className="flex gap-3 text-sm text-slate-700">
                  <span className="font-bold text-blue-700">{index + 1}.</span>
                  <span>{priority}</span>
                </div>
              ))}
              <Link className="inline-flex text-sm font-medium text-blue-700 hover:underline" href="/weekly">
                Open weekly board
              </Link>
            </div>
          ) : (
            <p className="text-sm text-slate-600">No weekly plan yet.</p>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-bold text-slate-950">Outreach Pipeline</h2>
          {["new", "message_generated", "connected", "replied", "meeting_booked"].map((status) => (
            <div key={status} className="flex items-center justify-between border-b border-slate-100 py-2 text-sm last:border-0">
              <span className="capitalize text-slate-600">{status.replace(/_/g, " ")}</span>
              <span className="font-semibold text-slate-900">{leads.filter((lead) => lead.status === status).length}</span>
            </div>
          ))}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-bold text-slate-950">Finance Snapshot</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-600">Cash</span><span className="font-semibold">{formatMoney(seedFinanceSettings.current_cash_balance)}</span></div>
            <div className="flex justify-between"><span className="text-slate-600">Revenue</span><span className="font-semibold">{formatMoney(seedFinanceSettings.monthly_revenue)}</span></div>
            <div className="flex justify-between"><span className="text-slate-600">Net burn</span><span className="font-semibold">{formatMoney(metrics.netBurn)}</span></div>
            <Link className="inline-flex pt-3 text-sm font-medium text-blue-700 hover:underline" href="/finance">Open finance</Link>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-bold text-slate-950">Strategic Risks</h2>
          <div className="space-y-3">
            {openRisks.length ? (
              openRisks.map((risk) => (
                <div key={risk} className="flex gap-3 text-sm text-slate-700">
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-600" />
                  <span>{risk}</span>
                </div>
              ))
            ) : (
              <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-600">No critical risks from current seed data.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
