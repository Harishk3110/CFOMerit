import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "not-configured",
});

interface LeadOutreachInput {
  leadType: string;
  name: string;
  role: string;
  company: string;
  profileSummary?: string;
  personalizationNotes?: string;
}

interface InvestorOutreachInput {
  investorName: string;
  firm: string;
  thesis?: string;
  portfolioRelevance?: string;
  meritTraction?: string;
  fundraisingContext?: string;
}

interface InvestorUpdateInput {
  traction?: string;
  productProgress?: string;
  growth?: string;
  revenue?: string;
  asks?: string;
  blockers?: string;
  nextMonthGoals?: string;
}

interface WeeklyReviewInput {
  priorities?: string;
  completedTasks?: string[];
  blockedTasks?: string[];
  metrics?: Record<string, unknown>;
  experiments?: string[];
  risks?: string[];
}

interface FinanceReportInput {
  costs?: number;
  revenue?: number;
  cashBalance?: number;
  runway?: number;
  budgetTargets?: Record<string, number>;
}

const MERIT_CONTEXT = `
Company: Merit
Description: Merit is a proof-of-ability platform for early talent. Students showcase real projects, evidence, outcomes, skills, and work history. Recruiters use Merit to evaluate candidates beyond traditional resumes.
Current stage: MVP with early users, recruiter validation, and active product development.
Core problem: Resumes are weak signals for early talent. Students struggle to prove what they can actually do, and recruiters struggle to evaluate ability quickly.
Core solution: Merit turns student work into structured, shareable, recruiter-readable proof.
Target users: students, recruiters, startup founders hiring interns or juniors, schools and career offices.
Current strategic focus: grow student project supply, validate recruiter demand, improve portfolio UI, build recruiter discovery workflow, prepare investor/accelerator narrative.
`;

export async function generateLinkedInOutreach(input: LeadOutreachInput) {
  if (!process.env.OPENAI_API_KEY) {
    return generateFallbackLinkedInOutreach(input);
  }

  const prompt = `
You are a concise, direct founder outreach assistant for Merit, a proof-of-ability platform.

${MERIT_CONTEXT}

Generate LinkedIn outreach messages for this lead:
- Name: ${input.name}
- Role: ${input.role}
- Company: ${input.company}
- Lead Type: ${input.leadType}
${input.profileSummary ? `- Profile Summary: ${input.profileSummary}` : ""}
${input.personalizationNotes ? `- Personalization Notes: ${input.personalizationNotes}` : ""}

Generate these messages in JSON format:
{
  "connectionRequest": "Brief, personalized connection request (2-3 sentences)",
  "firstDM": "First DM after they accept (2-3 sentences, value-first)",
  "followUp1": "Follow-up 1 if no reply (2-3 sentences)",
  "followUp2": "Follow-up 2 if still no reply (2-3 sentences, different angle)",
  "breakupMessage": "Soft close message (2 sentences)",
  "emailVersion": "Email version of the pitch (3-4 sentences)"
}

Make messages:
- Direct and founder-to-founder where relevant
- Recruiter-specific if this is a recruiter
- Investor-specific if this is an investor
- Credible (no fake traction, no overclaiming)
- Concise (not spammy)
- Personalized based on available context
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No response from OpenAI");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse JSON response");

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("OpenAI API error:", error);
    return generateFallbackLinkedInOutreach(input);
  }
}

export async function generateInvestorOutreach(input: InvestorOutreachInput) {
  if (!process.env.OPENAI_API_KEY) {
    return generateFallbackInvestorOutreach(input);
  }

  const prompt = `
You are a founder pitching to investors for Merit, a proof-of-ability platform.

${MERIT_CONTEXT}

Generate investor outreach messages for this investor:
- Investor Name: ${input.investorName}
- Firm: ${input.firm}
${input.thesis ? `- Thesis: ${input.thesis}` : ""}
${input.portfolioRelevance ? `- Portfolio Relevance: ${input.portfolioRelevance}` : ""}
${input.meritTraction ? `- Merit Traction: ${input.meritTraction}` : ""}

Generate these in JSON format:
{
  "warmIntroRequest": "How to ask for a warm intro (2-3 sentences)",
  "coldLinkedIn": "Cold LinkedIn message (2-3 sentences)",
  "emailDraft": "Email pitch (4-5 sentences)",
  "followUp1": "Follow-up 1 (2-3 sentences)",
  "followUp2": "Follow-up 2 (2-3 sentences)"
}

Make messages:
- Data-driven (cite real metrics where available)
- Founder-focused (why we're building this)
- Thesis-aligned (show relevance to their portfolio)
- Direct and concise
- Compelling without overclaiming
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No response from OpenAI");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse JSON response");

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("OpenAI API error:", error);
    return generateFallbackInvestorOutreach(input);
  }
}

export async function generateInvestorUpdate(input: InvestorUpdateInput) {
  if (!process.env.OPENAI_API_KEY) {
    return generateFallbackInvestorUpdate(input);
  }

  const prompt = `
You are a founder writing a monthly investor update for Merit.

${MERIT_CONTEXT}

Generate a concise investor update with this information:
${input.traction ? `- Traction: ${input.traction}` : ""}
${input.productProgress ? `- Product Progress: ${input.productProgress}` : ""}
${input.growth ? `- Growth: ${input.growth}` : ""}
${input.revenue ? `- Revenue: ${input.revenue}` : ""}
${input.asks ? `- Current Asks: ${input.asks}` : ""}
${input.blockers ? `- Blockers: ${input.blockers}` : ""}
${input.nextMonthGoals ? `- Next Month Goals: ${input.nextMonthGoals}` : ""}

Generate in JSON format:
{
  "update": "Concise investor update (150-250 words, structured with clear sections: What Moved, Current Focus, Key Asks, Next Month)"
}

Make it:
- Honest (no fake traction)
- Operator-focused (metrics that matter)
- Clear on asks (what you need)
- Conversational but professional
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No response from OpenAI");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse JSON response");

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("OpenAI API error:", error);
    return generateFallbackInvestorUpdate(input);
  }
}

export async function generateWeeklyReview(input: WeeklyReviewInput) {
  if (!process.env.OPENAI_API_KEY) {
    return generateFallbackWeeklyReview(input);
  }

  const prompt = `
You are a blunt, operator-focused advisor reviewing Merit's weekly execution.

Generate a weekly strategy review with this data:
${input.priorities ? `- Planned Priorities: ${input.priorities}` : ""}
${input.completedTasks ? `- Completed Tasks: ${input.completedTasks.join(", ")}` : ""}
${input.blockedTasks ? `- Blocked Tasks: ${input.blockedTasks.join(", ")}` : ""}
${input.risks ? `- Risks: ${input.risks.join(", ")}` : ""}

Generate in JSON format:
{
  "review": "Blunt weekly review (150-200 words). Include: What Moved (1-2 sentences), What Didn't Move (1-2 sentences), Execution Weak Points (1-2 sentences), Highest-Leverage Next Actions (3-4 bullet points), Strategic Recommendation (2-3 sentences)"
}

Be blunt. Don't sugarcoat. Focus on execution velocity and leverage.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No response from OpenAI");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse JSON response");

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("OpenAI API error:", error);
    return generateFallbackWeeklyReview(input);
  }
}

export async function generateDailyBriefing() {
  if (!process.env.OPENAI_API_KEY) {
    return generateFallbackDailyBriefing();
  }

  const prompt = `
You are a founder's daily briefing assistant for Merit.

Generate a daily briefing in JSON format:
{
  "briefing": "What should the founder focus on today? (Include: Top 3 Actions, Key Metrics to Watch, Risks to Monitor)"
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No response from OpenAI");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse JSON response");

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("OpenAI API error:", error);
    return generateFallbackDailyBriefing();
  }
}

export async function generateFinanceReport(input: FinanceReportInput) {
  if (!process.env.OPENAI_API_KEY) {
    return generateFallbackFinanceReport(input);
  }

  const prompt = `
You are a CFO-style operating advisor for Merit.

${MERIT_CONTEXT}

Generate a finance health report using:
- Costs: ${input.costs ?? "not provided"}
- Revenue: ${input.revenue ?? "not provided"}
- Cash Balance: ${input.cashBalance ?? "not provided"}
- Runway: ${input.runway ?? "not provided"}
- Budget Targets: ${JSON.stringify(input.budgetTargets || {})}

Return JSON:
{
  "report": "Concise finance summary with cost warnings, suggested cuts, and runway interpretation"
}

Be direct, practical, and do not invent numbers.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No response from OpenAI");
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse JSON response");
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("OpenAI API error:", error);
    return generateFallbackFinanceReport(input);
  }
}

// Fallback functions when API is not configured
function generateFallbackLinkedInOutreach(input: LeadOutreachInput) {
  const firstNameOnly = input.name.split(" ")[0];

  return {
    connectionRequest: `Hi ${firstNameOnly}, impressed by your work at ${input.company} in ${input.role}. Connecting for a quick chat about early talent evaluation.`,
    firstDM: `${firstNameOnly}, quick question: How do you currently evaluate fresh talent beyond resumes? We're building Merit to solve exactly this. Would love your thoughts.`,
    followUp1: `Following up on my message about Merit. Whether you're hiring or advising, this is worth 10 minutes. Free today?`,
    followUp2: `Last follow-up: Merit would be valuable for your team at ${input.company}. If now isn't right, I'll check back in a month.`,
    breakupMessage: `All good if this isn't a fit right now. Feel free to reach out anytime you want to explore early talent evaluation.`,
    emailVersion: `Hi ${firstNameOnly}, I wanted to introduce Merit - we're helping companies like ${input.company} evaluate early talent through real projects instead of just resumes. Would love to show you how it works. Available for a quick call?`,
  };
}

function generateFallbackInvestorOutreach(input: InvestorOutreachInput) {
  return {
    warmIntroRequest: `Could you intro me to ${input.investorName} at ${input.firm}? They're exactly the right investor for Merit's thesis in proof-of-ability infrastructure.`,
    coldLinkedIn: `${input.investorName}, we're building Merit - proof-of-ability infrastructure for early talent. Given your focus on HR tech and future of work, we should talk.`,
    emailDraft: `Hi ${input.investorName}, Merit is the proof-of-ability platform for early talent evaluation. We're helping companies move beyond resumes. Your portfolio in HR tech makes you a natural fit. Free for a 15-min call?`,
    followUp1: `Following up on Merit. We've got strong early recruiter validation. Would like to show you our traction.`,
    followUp2: `Last outreach on Merit. If you're interested in early talent evaluation infrastructure, this is a category we think matters. Happy to chat anytime.`,
  };
}

function generateFallbackInvestorUpdate(input: InvestorUpdateInput) {
  return {
    update: `What Moved: ${input.traction || "Early user validation with recruiters"}.

Current Focus: ${input.productProgress || "Improving portfolio UI and recruiter discovery"}.

Key Asks: ${input.asks || "Warm intros to recruiter networks and HR tech partners"}.

Next Month: ${input.nextMonthGoals || "Scale recruiter pilot and improve student onboarding"}.`,
  };
}

function generateFallbackWeeklyReview() {
  return {
    review: `What Moved: Focus areas were executed. Made progress on key initiatives.

What Didn't Move: Some external dependencies delayed progress on secondary efforts.

Execution Weak Points: Communication on blockers could have been faster.

Highest-Leverage Next Actions:
- Unblock the top-priority item
- Validate recruiter feedback
- Improve conversion on onboarding
- Plan accelerator outreach

Strategic Recommendation: Push on recruiter validation this week. That's the highest-leverage use of time right now.`,
  };
}

function generateFallbackDailyBriefing() {
  return {
    briefing: `Top 3 Actions:
1. Review recruiter feedback from yesterday
2. Respond to investor inquiry
3. Prepare weekly planning session

Key Metrics to Watch:
- Student signup rate
- Recruiter activation
- Time to first hire signal

Risks to Monitor:
- Execution velocity on portfolio improvements
- Recruiter churn if experience isn't smooth`,
  };
}

function generateFallbackFinanceReport(input: FinanceReportInput) {
  const costs = input.costs || 0;
  const revenue = input.revenue || 0;
  const netBurn = costs - revenue;
  const runwayText =
    netBurn <= 0
      ? "Merit is cashflow positive on the provided monthly figures."
      : `Estimated runway is ${input.runway?.toFixed?.(1) || input.runway || "unknown"} months.`;

  return {
    report: `Finance Summary:
- Monthly costs: $${costs.toLocaleString()}
- Monthly revenue: $${revenue.toLocaleString()}
- Cash balance: $${(input.cashBalance || 0).toLocaleString()}
- ${runwayText}

Cost Warnings:
- Watch AI/API spend and contractor scope before increasing burn.
- Keep hosting costs proportional to active usage.

Suggested Cuts:
- Audit repeated AI calls and batch low-value generations.
- Delay non-critical design or marketing spend until recruiter validation improves.

Runway Interpretation:
Maintain discipline until recruiter demand is repeatable. Spend should map directly to validation, product quality, or fundraising readiness.`,
  };
}

// Lead scoring functions
export function calculateRecruiterScore(lead: {
  role_title?: string;
  company_name?: string;
  location?: string;
  industry?: string;
  source?: string;
  personalization_notes?: string;
  linkedin_url?: string;
}): number {
  let score = 0;

  // Role scoring
  const roleKeywords = ["recruiter", "HR", "talent acquisition", "people", "founder", "co-founder"];
  if (lead.role_title) {
    const roleLower = lead.role_title.toLowerCase();
    if (roleKeywords.some((kw) => roleLower.includes(kw))) score += 25;
  }

  // Company hiring scoring
  const hiringKeywords = ["interns", "juniors", "students", "fresh grads", "early career"];
  if (lead.company_name) {
    const companyLower = lead.company_name.toLowerCase();
    if (hiringKeywords.some((kw) => companyLower.includes(kw))) score += 20;
  }

  // Location scoring
  if (lead.location && ["Singapore", "Singapore, Singapore"].includes(lead.location)) {
    score += 15;
  }

  // Industry scoring
  const activeIndustries = ["startup", "SME", "tech", "education", "hiring", "HR"];
  if (lead.industry) {
    const industryLower = lead.industry.toLowerCase();
    if (activeIndustries.some((ind) => industryLower.includes(ind))) score += 15;
  }

  // Source scoring
  if (lead.source) {
    const sourceLower = lead.source.toLowerCase();
    if (["warm intro", "event", "school", "referral"].some((s) => sourceLower.includes(s))) score += 10;
  }

  // Personalization scoring
  if (lead.personalization_notes && lead.personalization_notes.length > 20) score += 10;

  // LinkedIn URL scoring
  if (lead.linkedin_url) score += 5;

  return Math.min(score, 100);
}

export function calculateInvestorScore(investor: {
  investor_type?: string;
  thesis?: string;
  location?: string;
  sector_focus?: string;
  stage_focus?: string;
  warm_intro_source?: string;
  relevant_portfolio_companies?: string;
  linkedin_url?: string;
}): number {
  let score = 0;

  // Investor type scoring
  const activeTypes = ["VC", "angel", "accelerator"];
  if (investor.investor_type && activeTypes.includes(investor.investor_type)) score += 25;

  // Thesis alignment scoring
  const relevantThesis = ["early-stage", "future of work", "education", "HR tech", "AI", "marketplace", "SaaS"];
  if (investor.thesis) {
    const thesisLower = investor.thesis.toLowerCase();
    if (relevantThesis.some((t) => thesisLower.includes(t))) score += 20;
  }

  // Location scoring
  if (investor.location && ["Singapore", "Singapore, Singapore", "Southeast Asia"].includes(investor.location)) {
    score += 15;
  }

  // Sector alignment
  if (investor.sector_focus && ["HR tech", "education", "future of work", "AI"].includes(investor.sector_focus)) {
    score += 15;
  }

  // Warm intro available
  if (investor.warm_intro_source) score += 10;

  // Portfolio relevance
  if (investor.relevant_portfolio_companies && investor.relevant_portfolio_companies.length > 0) score += 10;

  // LinkedIn present
  if (investor.linkedin_url) score += 5;

  return Math.min(score, 100);
}
