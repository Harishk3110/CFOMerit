-- Founder command center additions: KPIs, notes, and company settings.

CREATE TABLE IF NOT EXISTS kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT CHECK (category IN ('users', 'recruiters', 'investors', 'outreach', 'revenue', 'product', 'partnerships', 'finance', 'execution', 'other')) DEFAULT 'other',
  target_value NUMERIC DEFAULT 0,
  current_value NUMERIC DEFAULT 0,
  unit TEXT,
  period TEXT CHECK (period IN ('daily', 'weekly', 'monthly', 'quarterly')) DEFAULT 'weekly',
  owner TEXT,
  status TEXT CHECK (status IN ('on_track', 'at_risk', 'behind', 'achieved', 'paused')) DEFAULT 'on_track',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS founder_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  category TEXT CHECK (category IN ('general', 'outreach', 'investor', 'finance', 'product', 'strategy', 'meeting', 'personal reminder')) DEFAULT 'general',
  linked_lead_id UUID REFERENCES outreach_leads(id) ON DELETE SET NULL,
  linked_investor_id UUID REFERENCES investors(id) ON DELETE SET NULL,
  linked_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('open', 'in_progress', 'done', 'archived')) DEFAULT 'open',
  pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT DEFAULT 'Merit',
  company_description TEXT,
  current_stage TEXT,
  core_problem TEXT,
  core_solution TEXT,
  target_users TEXT,
  current_strategic_focus TEXT,
  default_currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kpis_status ON kpis(status);
CREATE INDEX IF NOT EXISTS idx_kpis_category ON kpis(category);
CREATE INDEX IF NOT EXISTS idx_kpis_period ON kpis(period);
CREATE INDEX IF NOT EXISTS idx_founder_notes_status ON founder_notes(status);
CREATE INDEX IF NOT EXISTS idx_founder_notes_category ON founder_notes(category);
CREATE INDEX IF NOT EXISTS idx_founder_notes_pinned ON founder_notes(pinned DESC);
