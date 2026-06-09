// Database types for Merit Command Center

// Profiles
export interface CommandCenterProfile {
  id: string;
  user_id: string;
  company_name: string;
  role: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Outreach Leads
export interface OutreachLead {
  id: string;
  first_name: string;
  last_name: string;
  linkedin_url?: string;
  profile_image_url?: string;
  uploaded_profile_screenshot_url?: string;
  company_name: string;
  role_title: string;
  industry: string;
  location: string;
  lead_type: "recruiter" | "founder" | "HR" | "talent acquisition" | "investor" | "school partner" | "mentor" | "accelerator" | "customer" | "other";
  source: string;
  priority_score: number;
  personalization_notes?: string;
  profile_summary?: string;
  pain_angle?: string;
  merit_angle?: string;
  status: "new" | "researched" | "message_generated" | "ready_to_send" | "connection_sent" | "connected" | "first_dm_sent" | "follow_up_1_sent" | "follow_up_2_sent" | "replied" | "meeting_booked" | "converted" | "not_interested" | "dead";
  owner: string;
  channel?: "LinkedIn" | "Instagram" | "Email" | "In-person" | "Referral" | "Other";
  message_sent_count?: number;
  reply_count?: number;
  last_reply_summary?: string;
  meeting_outcome?: string;
  next_action?: string;
  last_contacted_at?: string;
  next_follow_up_at?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Outreach Messages
export interface OutreachMessage {
  id: string;
  lead_id: string;
  message_type: "connection_request" | "first_dm" | "follow_up_1" | "follow_up_2" | "breakup" | "email";
  message_text: string;
  status: "draft" | "ready" | "sent" | "copied";
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Outreach Events
export interface OutreachEvent {
  id: string;
  lead_id: string;
  event_type: "connection_sent" | "message_sent" | "reply_received" | "meeting_scheduled" | "manual_note";
  description: string;
  created_at: string;
  created_by: string;
}

// Investors
export interface Investor {
  id: string;
  investor_name: string;
  firm_name: string;
  investor_type: "angel" | "VC" | "accelerator" | "family office" | "strategic investor" | "operator angel" | "grant" | "school fund" | "other";
  linkedin_url?: string;
  website_url?: string;
  email?: string;
  location: string;
  thesis?: string;
  relevant_portfolio_companies?: string;
  check_size_min?: number;
  check_size_max?: number;
  stage_focus?: string;
  sector_focus?: string;
  warm_intro_source?: string;
  priority_score: number;
  status: "target" | "researched" | "warm_intro_needed" | "contacted" | "replied" | "meeting_booked" | "first_meeting_done" | "follow_up_sent" | "data_room_sent" | "diligence" | "soft_commit" | "committed" | "passed" | "dead";
  last_contacted_at?: string;
  next_follow_up_at?: string;
  meeting_date?: string;
  notes?: string;
  concerns?: string;
  next_steps?: string;
  fundraising_stage?: string;
  investor_fit_score?: number;
  warm_intro_status?: "needed" | "requested" | "secured" | "not_available";
  next_ask?: string;
  concern_tags?: string;
  meeting_outcome?: string;
  follow_up_quality?: "low" | "medium" | "high";
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Investor Interactions
export interface InvestorInteraction {
  id: string;
  investor_id: string;
  interaction_type: "email" | "call" | "meeting" | "demo" | "pitch" | "message";
  description: string;
  outcome?: string;
  created_at: string;
  created_by: string;
}

// Investor Updates
export interface InvestorUpdate {
  id: string;
  investor_id: string;
  update_text: string;
  sent_date?: string;
  created_at: string;
  created_by: string;
}

// Costs
export interface Cost {
  id: string;
  vendor: string;
  category: "software" | "hosting" | "AI/API" | "design" | "marketing" | "legal" | "accounting" | "events" | "contractor" | "office" | "travel" | "miscellaneous";
  amount: number;
  currency: string;
  billing_frequency: "one-time" | "monthly" | "quarterly" | "annual";
  start_date: string;
  end_date?: string;
  payment_method?: string;
  owner?: string;
  is_recurring: boolean;
  notes?: string;
  receipt_url?: string;
  expense_quality?: "essential" | "useful" | "questionable" | "cut_candidate";
  renewal_date?: string;
  cancel_url?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Finance Settings
export interface FinanceSettings {
  id: string;
  current_cash_balance: number;
  monthly_revenue: number;
  expected_monthly_revenue: number;
  target_monthly_budget: number;
  currency: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Weekly Plans
export interface WeeklyPlan {
  id: string;
  week_start_date: string;
  weekly_theme: string;
  top_3_priorities: string;
  owner: string;
  status: "planned" | "in_progress" | "completed";
  key_metric_target?: string;
  expected_outcome?: string;
  actual_result?: string;
  founder_reflection?: string;
  what_worked?: string;
  what_failed?: string;
  next_week_recommendation?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Tasks
export interface Task {
  id: string;
  title: string;
  description?: string;
  owner: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "backlog" | "this_week" | "in_progress" | "waiting" | "blocked" | "done" | "killed";
  due_date?: string;
  operating_track_id?: string;
  linked_kpi_id?: string;
  linked_strategy_pillar?: string;
  linked_experiment?: string;
  linked_investor_id?: string;
  linked_lead_id?: string;
  effort_score?: number;
  impact_score?: number;
  urgency_score?: number;
  leverage_score?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

// AI Briefings
export interface AIBriefing {
  id: string;
  briefing_type: "daily_founder" | "weekly_strategy" | "investor_meeting_prep" | "recruiter_meeting_prep" | "finance_health" | "outreach_performance";
  briefing_text: string;
  related_data?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
  created_by: string;
}

export interface KPI {
  id: string;
  title: string;
  category: "users" | "recruiters" | "investors" | "outreach" | "revenue" | "product" | "partnerships" | "finance" | "execution" | "other";
  target_value: number;
  current_value: number;
  unit: string;
  period: "daily" | "weekly" | "monthly" | "quarterly";
  owner: string;
  status: "on_track" | "at_risk" | "behind" | "achieved" | "paused";
  manual_status_override?: boolean;
  priority: "low" | "medium" | "high" | "critical";
  operating_track_id?: string;
  progress_history?: Array<{ date: string; value: number }>;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FounderNote {
  id: string;
  title: string;
  content: string;
  category: "general" | "outreach" | "investor" | "finance" | "product" | "strategy" | "meeting" | "personal reminder" | "decision" | "risk";
  linked_lead_id?: string;
  linked_investor_id?: string;
  linked_task_id?: string;
  linked_kpi_id?: string;
  linked_track_id?: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "done" | "archived";
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanySettings {
  id: string;
  company_name: string;
  company_description: string;
  current_stage: string;
  core_problem: string;
  core_solution: string;
  target_users: string;
  current_strategic_focus: string;
  default_currency: string;
  current_north_star_metric?: string;
  biggest_assumption?: string;
  biggest_risk?: string;
  created_at: string;
  updated_at: string;
}

export interface OperatingTrack {
  id: string;
  name: string;
  description: string;
  owner: string;
  status: "active" | "at_risk" | "blocked" | "paused" | "completed";
  priority: "low" | "medium" | "high" | "critical";
  target_metric: number;
  current_metric: number;
  deadline?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DecisionLog {
  id: string;
  decision: string;
  context: string;
  options_considered: string;
  final_choice: string;
  reason: string;
  owner: string;
  decision_date: string;
  linked_track_id?: string;
  linked_kpi_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  category: "product" | "market" | "finance" | "legal" | "team" | "technical" | "fundraising" | "growth" | "execution";
  probability: number;
  impact: number;
  severity_score: number;
  mitigation: string;
  owner: string;
  status: "open" | "monitoring" | "mitigated" | "closed";
  linked_track_id?: string;
  created_at: string;
  updated_at: string;
}
