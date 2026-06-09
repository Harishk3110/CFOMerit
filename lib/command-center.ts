import type { Cost, FinanceSettings, Investor, KPI, OutreachLead, Task } from "./types";

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
