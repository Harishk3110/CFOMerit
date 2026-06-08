-- Merit Command Center Database Schema
-- Run this in Supabase SQL Editor to initialize database

-- Create profiles table
CREATE TABLE IF NOT EXISTS command_center_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  company_name TEXT DEFAULT 'Merit',
  role TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create outreach leads table
CREATE TABLE IF NOT EXISTS outreach_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  linkedin_url TEXT,
  profile_image_url TEXT,
  uploaded_profile_screenshot_url TEXT,
  company_name TEXT,
  role_title TEXT,
  industry TEXT,
  location TEXT,
  lead_type TEXT CHECK (lead_type IN ('recruiter', 'founder', 'HR', 'talent acquisition', 'investor', 'school partner', 'mentor', 'accelerator', 'customer', 'other')),
  source TEXT,
  priority_score INT DEFAULT 0 CHECK (priority_score >= 0 AND priority_score <= 100),
  personalization_notes TEXT,
  profile_summary TEXT,
  pain_angle TEXT,
  merit_angle TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'researched', 'message_generated', 'ready_to_send', 'connection_sent', 'connected', 'first_dm_sent', 'follow_up_1_sent', 'follow_up_2_sent', 'replied', 'meeting_booked', 'converted', 'not_interested', 'dead')),
  owner TEXT,
  last_contacted_at TIMESTAMP,
  next_follow_up_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID
);

-- Create outreach messages table
CREATE TABLE IF NOT EXISTS outreach_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES outreach_leads(id) ON DELETE CASCADE,
  message_type TEXT CHECK (message_type IN ('connection_request', 'first_dm', 'follow_up_1', 'follow_up_2', 'breakup', 'email')),
  message_text TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'sent', 'copied')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID
);

-- Create outreach events table
CREATE TABLE IF NOT EXISTS outreach_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES outreach_leads(id) ON DELETE CASCADE,
  event_type TEXT CHECK (event_type IN ('connection_sent', 'message_sent', 'reply_received', 'meeting_scheduled', 'manual_note')),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID
);

-- Create investors table
CREATE TABLE IF NOT EXISTS investors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_name TEXT NOT NULL,
  firm_name TEXT,
  investor_type TEXT CHECK (investor_type IN ('angel', 'VC', 'accelerator', 'family office', 'strategic investor', 'operator angel', 'grant', 'school fund', 'other')),
  linkedin_url TEXT,
  website_url TEXT,
  email TEXT,
  location TEXT,
  thesis TEXT,
  relevant_portfolio_companies TEXT,
  check_size_min NUMERIC,
  check_size_max NUMERIC,
  stage_focus TEXT,
  sector_focus TEXT,
  warm_intro_source TEXT,
  priority_score INT DEFAULT 0 CHECK (priority_score >= 0 AND priority_score <= 100),
  status TEXT DEFAULT 'target' CHECK (status IN ('target', 'researched', 'warm_intro_needed', 'contacted', 'replied', 'meeting_booked', 'first_meeting_done', 'follow_up_sent', 'data_room_sent', 'diligence', 'soft_commit', 'committed', 'passed', 'dead')),
  last_contacted_at TIMESTAMP,
  next_follow_up_at TIMESTAMP,
  meeting_date TIMESTAMP,
  notes TEXT,
  concerns TEXT,
  next_steps TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID
);

-- Create investor interactions table
CREATE TABLE IF NOT EXISTS investor_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
  interaction_type TEXT CHECK (interaction_type IN ('email', 'call', 'meeting', 'demo', 'pitch', 'message')),
  description TEXT,
  outcome TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID
);

-- Create investor updates table
CREATE TABLE IF NOT EXISTS investor_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
  update_text TEXT NOT NULL,
  sent_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID
);

-- Create costs table
CREATE TABLE IF NOT EXISTS costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor TEXT NOT NULL,
  category TEXT CHECK (category IN ('software', 'hosting', 'AI/API', 'design', 'marketing', 'legal', 'accounting', 'events', 'contractor', 'office', 'travel', 'miscellaneous')),
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  billing_frequency TEXT DEFAULT 'monthly' CHECK (billing_frequency IN ('one-time', 'monthly', 'quarterly', 'annual')),
  start_date DATE,
  end_date DATE,
  payment_method TEXT,
  owner TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  notes TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID
);

-- Create finance settings table
CREATE TABLE IF NOT EXISTS finance_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  current_cash_balance NUMERIC NOT NULL,
  monthly_revenue NUMERIC DEFAULT 0,
  expected_monthly_revenue NUMERIC DEFAULT 0,
  target_monthly_budget NUMERIC,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID
);

-- Create weekly plans table
CREATE TABLE IF NOT EXISTS weekly_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start_date DATE,
  weekly_theme TEXT,
  top_3_priorities TEXT,
  owner TEXT,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed')),
  key_metric_target TEXT,
  actual_result TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  owner TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'backlog' CHECK (status IN ('backlog', 'this_week', 'in_progress', 'blocked', 'done', 'killed')),
  due_date DATE,
  linked_strategy_pillar TEXT,
  linked_experiment TEXT,
  linked_investor_id UUID REFERENCES investors(id) ON DELETE SET NULL,
  linked_lead_id UUID REFERENCES outreach_leads(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID
);

-- Create AI briefings table
CREATE TABLE IF NOT EXISTS ai_briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  briefing_type TEXT CHECK (briefing_type IN ('daily_founder', 'weekly_strategy', 'investor_meeting_prep', 'recruiter_meeting_prep', 'finance_health', 'outreach_performance')),
  briefing_text TEXT NOT NULL,
  related_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_outreach_leads_status ON outreach_leads(status);
CREATE INDEX IF NOT EXISTS idx_outreach_leads_lead_type ON outreach_leads(lead_type);
CREATE INDEX IF NOT EXISTS idx_outreach_leads_priority ON outreach_leads(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_investors_status ON investors(status);
CREATE INDEX IF NOT EXISTS idx_investors_priority ON investors(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_costs_category ON costs(category);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Enable Row Level Security (RLS) if using authentication
-- ALTER TABLE command_center_profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE outreach_leads ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE investors ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE costs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE finance_settings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE weekly_plans ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ai_briefings ENABLE ROW LEVEL SECURITY;

-- Create seed data (comment out if you don't want sample data)
INSERT INTO finance_settings (current_cash_balance, monthly_revenue, expected_monthly_revenue, target_monthly_budget, currency, created_by)
VALUES (68000, 2000, 5000, 10000, 'USD', NULL)
ON CONFLICT DO NOTHING;

INSERT INTO weekly_plans (week_start_date, weekly_theme, top_3_priorities, owner, status, key_metric_target, created_by)
VALUES (
  CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::INT,
  'Recruiter Validation Sprint',
  '1. Complete portfolio verification feature
2. Complete 5 recruiter validation calls
3. Prepare Series Seed pitch deck',
  'Founder',
  'in_progress',
  'Recruiter activation rate: target 40%',
  NULL
)
ON CONFLICT DO NOTHING;
