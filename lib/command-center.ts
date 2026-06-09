import type {
  Cost,
  FinanceSettings,
  FounderNote,
  Investor,
  KPI,
  OperatingTrack,
  OutreachLead,
  Risk,
  Task,
} from "./types";

export function formatMoney(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function isDueTodayOrEarlier(date?: string) {
  if (!date) return false;
  return date.slice(0, 10) <= todayIso();
}

export function monthlyEquivalent(cost: Pick<Cost, "amount" | "billing_frequency" | "is_recurring">) {
  if (!cost.is_recurring && cost.billing_frequency === "one-time") return 0;
  if (cost.billing_frequency === "annual") return cost.amount / 12;
  if (cost.billing_frequency === "quarterly") return cost.amount / 3;
  if (cost.billing_frequency === "monthly") return cost.amount;
  return 0;
}

export function financeMetrics(costs: Cost[], settings: FinanceSettings) {
  const recurringMonthlyCosts = costs.reduce((sum, cost) => sum + monthlyEquivalent(cost), 0);
  const oneTimeCosts = costs
    .filter((cost) => cost.billing_frequency === "one-time" || !cost.is_recurring)
    .reduce((sum, cost) => sum + cost.amount, 0);
  const monthlyBurn = recurringMonthlyCosts + oneTimeCosts / 12;
  const netBurn = monthlyBurn - settings.monthly_revenue;
  const runwayMonths = netBurn <= 0 ? Infinity : settings.current_cash_balance / netBurn;
  const budgetVariance = monthlyBurn - (settings.target_monthly_budget || 0);

  return {
    recurringMonthlyCosts,
    oneTimeCosts,
    monthlyBurn,
    netBurn,
    runwayMonths,
    budgetVariance,
    projectedThreeMonthSpend: monthlyBurn * 3,
    projectedSixMonthSpend: monthlyBurn * 6,
    isCashflowPositive: netBurn <= 0,
  };
}

export function spendByCategory(costs: Cost[]) {
  return Object.entries(
    costs.reduce<Record<string, number>>((acc, cost) => {
      acc[cost.category] = (acc[cost.category] || 0) + cost.amount;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));
}

export function calculateRecruiterScore(lead: Partial<OutreachLead>): number {
  let score = 0;
  const role = lead.role_title?.toLowerCase() || "";
  const company = lead.company_name?.toLowerCase() || "";
  const location = lead.location?.toLowerCase() || "";
  const industry = lead.industry?.toLowerCase() || "";
  const source = lead.source?.toLowerCase() || "";
  const notes = lead.personalization_notes?.toLowerCase() || "";

  if (["recruiter", "hr", "talent acquisition", "people", "founder", "co-founder"].some((kw) => role.includes(kw))) score += 25;
  if (["intern", "junior", "student", "fresh grad", "graduate", "early career"].some((kw) => `${company} ${notes}`.includes(kw))) score += 20;
  if (location.includes("singapore") || location.includes("southeast asia")) score += 15;
  if (["startup", "sme", "tech", "education", "hiring", "hr", "fintech"].some((kw) => industry.includes(kw))) score += 15;
  if (["warm intro", "event", "school", "referral"].some((kw) => source.includes(kw))) score += 10;
  if (["hiring pain", "screening", "resume", "intern", "junior"].some((kw) => notes.includes(kw))) score += 10;
  if (lead.linkedin_url) score += 5;

  return Math.min(score, 100);
}

export function calculateInvestorScore(investor: Partial<Investor>): number {
  let score = 0;
  const type = investor.investor_type?.toLowerCase() || "";
  const thesis = investor.thesis?.toLowerCase() || "";
  const sector = investor.sector_focus?.toLowerCase() || "";
  const stage = investor.stage_focus?.toLowerCase() || "";
  const location = investor.location?.toLowerCase() || "";

  if (["vc", "angel", "accelerator", "operator angel"].some((kw) => type.includes(kw))) score += 25;
  if (["early-stage", "pre-seed", "seed"].some((kw) => stage.includes(kw) || thesis.includes(kw))) score += 25;
  if (["future of work", "education", "hr tech", "ai", "marketplace", "saas"].some((kw) => thesis.includes(kw) || sector.includes(kw))) score += 20;
  if (location.includes("singapore") || location.includes("southeast asia")) score += 15;
  if (["accelerator", "university", "startup ecosystem"].some((kw) => thesis.includes(kw) || sector.includes(kw))) score += 15;
  if (investor.warm_intro_source) score += 10;
  if (investor.relevant_portfolio_companies) score += 10;
  if (investor.linkedin_url || investor.website_url) score += 5;

  return Math.min(score, 100);
}

export function generatedLinkedInMessages(lead: OutreachLead) {
  const firstName = lead.first_name || "there";
  const isInvestor = lead.lead_type === "investor";
  const roleContext = `${lead.role_title || "your role"} at ${lead.company_name || "your company"}`;
  const positioning = isInvestor
    ? "Merit is building proof-of-ability infrastructure for early talent, starting with student portfolios and recruiter discovery."
    : "Merit helps recruiters evaluate students through real projects, evidence, outcomes, and proof of ability instead of relying only on resumes.";

  return {
    connection_request: `Hi ${firstName}, I noticed your work as ${roleContext}. I am building Merit around early-talent proof of ability and thought your perspective would be useful. Open to connecting?`,
    first_dm: `${firstName}, quick context: ${positioning} Based on your work at ${lead.company_name || "your team"}, I would value a short reaction to whether this solves a real screening pain.`,
    follow_up_1: `Following up, ${firstName}. The specific question is whether project evidence would help your team evaluate students or junior candidates faster than resumes. Worth a 10-minute conversation?`,
    follow_up_2: `Last follow-up from me. If early-talent evaluation is not a priority right now, no issue. If it is, I can share a concise Merit walkthrough and get your blunt feedback.`,
    breakup: `I will close the loop here. Reach out anytime if proof-of-ability hiring becomes relevant for ${lead.company_name || "your team"}.`,
    email: `Subject: Proof-of-ability hiring signal for ${lead.company_name || "your team"}\n\nHi ${firstName},\n\nI am building Merit, a proof-of-ability platform for early talent. Students show real projects, evidence, outcomes, and skills so recruiters can evaluate ability beyond resumes.\n\nGiven your work as ${roleContext}, I would value a short reaction to whether this would improve early-talent screening. Open to a 10-minute call?`,
  };
}

export function generatedInvestorUpdate() {
  return `Headline: Merit is tightening the proof-of-ability wedge for early talent.

Traction: Early recruiter conversations continue to validate that resumes are weak signal for student and junior hiring.

Product Progress: The current focus is portfolio evidence, recruiter-readable project summaries, and a tighter discovery workflow.

Recruiter Progress: The highest-leverage ask remains warm intros to recruiters hiring interns, juniors, or fresh graduates.

Revenue Progress: Pilot revenue is early but useful. The priority is proving repeatable recruiter willingness to pay.

Key Wins: Stronger founder narrative, clearer recruiter positioning, and better operating visibility through the command center.

Current Asks: Warm recruiter intros, feedback on the seed narrative, and access to operators who know HR tech distribution.

Next Month Goals: Close more recruiter validation calls, improve portfolio UI, and prepare investor-ready pilot metrics.`;
}

export function generatedWeeklyReview(tasks: Task[]) {
  const completed = tasks.filter((task) => task.status === "done");
  const blocked = tasks.filter((task) => task.status === "blocked");
  const criticalOpen = tasks.filter((task) => task.priority === "critical" && task.status !== "done");

  return `What Moved:
${completed.length ? completed.map((task) => `- ${task.title}`).join("\n") : "- No completed tasks recorded yet."}

What Did Not Move:
${blocked.length ? blocked.map((task) => `- ${task.title}`).join("\n") : "- No blockers recorded."}

Where Execution Is Weak:
The highest-risk pattern is open critical work staying outside done status. ${criticalOpen.length} critical item(s) still need founder attention.

Highest-Leverage Next Actions:
- Clear the top blocker before adding new initiatives.
- Push recruiter validation calls before broad investor outreach.
- Convert meeting feedback into one product decision this week.

Strategic Recommendation:
Keep the week narrow. Proof-of-ability only matters if recruiters see a faster, clearer hiring signal, so prioritize recruiter validation and the verification workflow.`;
}

export function kpiProgress(kpi: Pick<KPI, "current_value" | "target_value">) {
  if (!kpi.target_value || kpi.target_value <= 0) return 0;
  return Math.min(100, Math.max(0, (kpi.current_value / kpi.target_value) * 100));
}

export function autoKpiStatus(kpi: Pick<KPI, "current_value" | "target_value" | "status" | "manual_status_override">): KPI["status"] {
  if (kpi.status === "paused" || kpi.manual_status_override) return kpi.status;
  const progress = kpiProgress(kpi);
  if (progress >= 100) return "achieved";
  if (progress >= 75) return "on_track";
  if (progress >= 40) return "at_risk";
  return "behind";
}

export function leverageScore(task: Pick<Task, "impact_score" | "urgency_score" | "effort_score">) {
  return (task.impact_score || 0) + (task.urgency_score || 0) - (task.effort_score || 0);
}

export function trackProgress(track: Pick<OperatingTrack, "current_metric" | "target_metric">) {
  if (!track.target_metric || track.target_metric <= 0) return 0;
  return Math.min(100, Math.max(0, (track.current_metric / track.target_metric) * 100));
}

export function riskSeverity(risk: Pick<Risk, "probability" | "impact">) {
  return Math.max(0, (risk.probability || 0) * (risk.impact || 0));
}

export function emptyFinanceSettings(): FinanceSettings {
  const now = new Date().toISOString();
  return {
    id: "finance-settings",
    current_cash_balance: 0,
    monthly_revenue: 0,
    expected_monthly_revenue: 0,
    target_monthly_budget: 0,
    currency: "USD",
    created_at: now,
    updated_at: now,
    created_by: "",
  };
}

export const operatingTrackTemplates: Array<Pick<OperatingTrack, "name" | "description" | "priority" | "target_metric">> = [
  { name: "Student Growth", description: "Grow student users and profile activation.", priority: "critical", target_metric: 100 },
  { name: "Project Supply", description: "Increase uploaded proof-of-ability project supply.", priority: "critical", target_metric: 100 },
  { name: "Passport Creation", description: "Manually create and improve Merit passports for early users.", priority: "high", target_metric: 50 },
  { name: "Recruiter Demand", description: "Validate recruiter demand and create recruiter accounts.", priority: "critical", target_metric: 20 },
  { name: "Investor Relations", description: "Track investor and accelerator outreach.", priority: "high", target_metric: 25 },
  { name: "School Partnerships", description: "Build school and lecturer partnership pipeline.", priority: "high", target_metric: 20 },
  { name: "Product v4", description: "Ship Merit v4 UI/UX and recruiter-facing workflows.", priority: "critical", target_metric: 100 },
  { name: "AI Matching Layer", description: "Plan AI matching and recruiter discovery layer.", priority: "medium", target_metric: 10 },
  { name: "Marketing", description: "Execute content and proof-of-ability narrative.", priority: "medium", target_metric: 30 },
  { name: "Finance", description: "Control burn, runway, and software spend.", priority: "high", target_metric: 12 },
  { name: "Founder Ops", description: "Weekly planning, KPI updates, and operating cadence.", priority: "critical", target_metric: 52 },
];

type KpiTemplate = Pick<KPI, "title" | "category" | "target_value" | "unit" | "period" | "priority" | "notes"> & { trackName: string };

export const meritKpiTemplates: KpiTemplate[] = [
  ["Student users signed up", "users", "Student Growth"],
  ["Active student profiles", "users", "Student Growth"],
  ["Uploaded projects", "product", "Project Supply"],
  ["Completed passports/portfolios", "product", "Passport Creation"],
  ["Profile completion rate", "users", "Passport Creation"],
  ["Instagram DMs sent", "outreach", "Marketing"],
  ["LinkedIn leads researched", "outreach", "Recruiter Demand"],
  ["LinkedIn messages manually sent", "outreach", "Recruiter Demand"],
  ["Follow-ups completed", "outreach", "Founder Ops"],
  ["Outreach replies", "outreach", "Recruiter Demand"],
  ["Meetings booked", "outreach", "Recruiter Demand"],
  ["Recruiter accounts created", "recruiters", "Recruiter Demand"],
  ["Recruiter interviews booked", "recruiters", "Recruiter Demand"],
  ["Recruiter interviews completed", "recruiters", "Recruiter Demand"],
  ["Recruiter validation calls", "recruiters", "Recruiter Demand"],
  ["Recruiters willing to pilot", "recruiters", "Recruiter Demand"],
  ["Potential paying recruiter leads", "recruiters", "Recruiter Demand"],
  ["Schools contacted", "partnerships", "School Partnerships"],
  ["Teachers/lecturers contacted", "partnerships", "School Partnerships"],
  ["Partnership meetings booked", "partnerships", "School Partnerships"],
  ["Partnership proposals sent", "partnerships", "School Partnerships"],
  ["Investors researched", "investors", "Investor Relations"],
  ["Investors contacted", "investors", "Investor Relations"],
  ["Warm intros requested", "investors", "Investor Relations"],
  ["Investor meetings booked", "investors", "Investor Relations"],
  ["Accelerator applications submitted", "investors", "Investor Relations"],
  ["Grants/competitions submitted", "investors", "Investor Relations"],
  ["Merit v4 UI screens completed", "product", "Product v4"],
  ["Bugs fixed", "product", "Product v4"],
  ["Shareable passport links created", "product", "Product v4"],
  ["Recruiter discovery features completed", "product", "Product v4"],
  ["AI matching planning tasks completed", "product", "AI Matching Layer"],
  ["Instagram posts published", "outreach", "Marketing"],
  ["Reels/TikToks published", "outreach", "Marketing"],
  ["Case studies created", "outreach", "Marketing"],
  ["Founder posts published", "outreach", "Marketing"],
  ["Website updates shipped", "product", "Marketing"],
  ["Monthly burn", "finance", "Finance"],
  ["Runway", "finance", "Finance"],
  ["Revenue", "revenue", "Finance"],
  ["Budget variance", "finance", "Finance"],
  ["Recurring software costs", "finance", "Finance"],
].map(([title, category, trackName]) => ({
  title,
  category: category as KPI["category"],
  trackName,
  target_value: category === "finance" ? 1 : 10,
  unit: category === "finance" || category === "revenue" ? "USD" : "count",
  period: "weekly",
  priority: ["Student Growth", "Recruiter Demand", "Product v4", "Finance"].includes(trackName) ? "critical" : "high",
  notes: "Loaded from Merit KPI templates. Edit target/current values for the current operating cycle.",
}));

type TaskTemplate = Pick<Task, "title" | "description" | "priority" | "status" | "effort_score" | "impact_score" | "urgency_score"> & { trackName: string };

export const meritTaskTemplates: TaskTemplate[] = [
  ["Find 20 design students on Instagram", "Student Growth"],
  ["DM 20 students about Merit passport", "Student Growth"],
  ["Create 5 student passports manually", "Passport Creation"],
  ["Follow up with students who did not reply", "Student Growth"],
  ["Track student profile completion", "Student Growth"],
  ["Research 10 recruiter leads", "Recruiter Demand"],
  ["Send 10 manual LinkedIn connection requests", "Recruiter Demand"],
  ["Send 10 recruiter first DMs manually", "Recruiter Demand"],
  ["Book 3 recruiter validation calls", "Recruiter Demand"],
  ["Create 2 recruiter accounts", "Recruiter Demand"],
  ["Ask recruiter for hiring pain points", "Recruiter Demand"],
  ["Review current Merit UI", "Product v4"],
  ["Finalize v4 UI direction", "Product v4"],
  ["Build passport/profile page improvements", "Product v4"],
  ["Build recruiter discovery workflow", "Product v4"],
  ["Test shareable passport links", "Product v4"],
  ["Fix authentication/sign-up issues", "Product v4"],
  ["Research 10 investor targets", "Investor Relations"],
  ["Prepare investor one-liner", "Investor Relations"],
  ["Prepare investor update", "Investor Relations"],
  ["Apply to SMU BIG", "Investor Relations"],
  ["Apply to Build Week", "Investor Relations"],
  ["Apply to relevant accelerator/grant", "Investor Relations"],
  ["Follow up with warm intro sources", "Investor Relations"],
  ["Publish Merit intro post", "Marketing"],
  ["Publish proof-of-ability content", "Marketing"],
  ["Create student success story", "Marketing"],
  ["Create recruiter-facing post", "Marketing"],
  ["Update website copy", "Marketing"],
  ["Add all current software costs", "Finance"],
  ["Set current cash balance", "Finance"],
  ["Review monthly burn", "Finance"],
  ["Cut unnecessary subscriptions", "Finance"],
  ["Update runway calculation", "Finance"],
  ["Plan weekly top 3 priorities", "Founder Ops"],
  ["Review blocked tasks", "Founder Ops"],
  ["Run weekly review", "Founder Ops"],
  ["Decide next week's focus", "Founder Ops"],
  ["Update KPI progress", "Founder Ops"],
].map(([title, trackName]) => ({
  title,
  trackName,
  description: `Merit operating task for ${trackName}.`,
  priority: ["Recruiter Demand", "Product v4", "Finance", "Founder Ops"].includes(trackName) ? "high" : "medium",
  status: "backlog",
  effort_score: 2,
  impact_score: ["Recruiter Demand", "Product v4"].includes(trackName) ? 5 : 4,
  urgency_score: 4,
}));

export interface DailyAction {
  id: string;
  title: string;
  source: string;
  priority: "low" | "medium" | "high" | "critical";
  dueDate?: string;
  href: string;
}

export function buildDailyActions(input: {
  tasks: Task[];
  leads: OutreachLead[];
  investors: Investor[];
  kpis: KPI[];
  costs: Cost[];
  finance: ReturnType<typeof financeMetrics>;
  notes: FounderNote[];
  risks: Risk[];
}): DailyAction[] {
  const actions: DailyAction[] = [];
  input.tasks
    .filter((task) => task.due_date && task.due_date < todayIso() && task.status !== "done" && task.status !== "killed")
    .forEach((task) => actions.push({ id: `task-${task.id}`, title: `Overdue task: ${task.title}`, source: "Weekly Execution", priority: task.priority, dueDate: task.due_date, href: "/weekly" }));
  input.leads
    .filter((lead) => isDueTodayOrEarlier(lead.next_follow_up_at))
    .forEach((lead) => actions.push({ id: `lead-${lead.id}`, title: `Follow up: ${lead.first_name} ${lead.last_name}`, source: "Outreach", priority: lead.priority_score >= 80 ? "high" : "medium", dueDate: lead.next_follow_up_at, href: "/outreach" }));
  input.investors
    .filter((investor) => isDueTodayOrEarlier(investor.next_follow_up_at))
    .forEach((investor) => actions.push({ id: `investor-${investor.id}`, title: `Investor follow-up: ${investor.investor_name}`, source: "Investors", priority: investor.priority_score >= 80 ? "high" : "medium", dueDate: investor.next_follow_up_at, href: "/investors" }));
  input.tasks
    .filter((task) => task.status === "blocked")
    .forEach((task) => actions.push({ id: `blocked-${task.id}`, title: `Unblock: ${task.title}`, source: "Weekly Execution", priority: task.priority, dueDate: task.due_date, href: "/weekly" }));
  input.kpis
    .filter((kpi) => kpi.status === "behind")
    .forEach((kpi) => actions.push({ id: `kpi-${kpi.id}`, title: `KPI behind: ${kpi.title}`, source: "KPIs", priority: kpi.priority, href: "/kpis" }));
  if (!input.finance.isCashflowPositive && input.finance.runwayMonths < 3) {
    actions.push({ id: "finance-runway", title: "Runway below 3 months", source: "Finance", priority: "critical", href: "/finance" });
  }
  input.risks
    .filter((risk) => risk.status !== "closed" && risk.severity_score >= 12)
    .forEach((risk) => actions.push({ id: `risk-${risk.id}`, title: `High-severity risk: ${risk.title}`, source: "Risks", priority: "critical", href: "/risks" }));

  const rank = { critical: 4, high: 3, medium: 2, low: 1 };
  return actions.sort((a, b) => rank[b.priority] - rank[a.priority]).slice(0, 12);
}
