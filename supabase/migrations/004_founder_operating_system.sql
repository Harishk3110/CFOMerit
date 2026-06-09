-- Advanced founder operating system additions.

CREATE TABLE IF NOT EXISTS operating_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner TEXT,
  status TEXT CHECK (status IN ('active', 'at_risk', 'blocked', 'paused', 'completed')) DEFAULT 'active',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  target_metric NUMERIC DEFAULT 0,
  current_metric NUMERIC DEFAULT 0,
  deadline DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS decision_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision TEXT NOT NULL,
  context TEXT,
  options_considered TEXT,
  final_choice TEXT,
  reason TEXT,
  owner TEXT,
  decision_date DATE,
  linked_track_id UUID REFERENCES operating_tracks(id) ON DELETE SET NULL,
  linked_kpi_id UUID REFERENCES kpis(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('product', 'market', 'finance', 'legal', 'team', 'technical', 'fundraising', 'growth', 'execution')) DEFAULT 'execution',
  probability NUMERIC DEFAULT 1,
  impact NUMERIC DEFAULT 1,
  severity_score NUMERIC DEFAULT 1,
  mitigation TEXT,
  owner TEXT,
  status TEXT CHECK (status IN ('open', 'monitoring', 'mitigated', 'closed')) DEFAULT 'open',
  linked_track_id UUID REFERENCES operating_tracks(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE kpis ADD COLUMN IF NOT EXISTS manual_status_override BOOLEAN DEFAULT FALSE;
ALTER TABLE kpis ADD COLUMN IF NOT EXISTS operating_track_id UUID REFERENCES operating_tracks(id) ON DELETE SET NULL;
ALTER TABLE kpis ADD COLUMN IF NOT EXISTS progress_history JSONB DEFAULT '[]'::jsonb;

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS operating_track_id UUID REFERENCES operating_tracks(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS linked_kpi_id UUID REFERENCES kpis(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS effort_score NUMERIC DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS impact_score NUMERIC DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS urgency_score NUMERIC DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS leverage_score NUMERIC DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check CHECK (status IN ('backlog', 'this_week', 'in_progress', 'waiting', 'blocked', 'done', 'killed'));

ALTER TABLE weekly_plans ADD COLUMN IF NOT EXISTS expected_outcome TEXT;
ALTER TABLE weekly_plans ADD COLUMN IF NOT EXISTS founder_reflection TEXT;
ALTER TABLE weekly_plans ADD COLUMN IF NOT EXISTS what_worked TEXT;
ALTER TABLE weekly_plans ADD COLUMN IF NOT EXISTS what_failed TEXT;
ALTER TABLE weekly_plans ADD COLUMN IF NOT EXISTS next_week_recommendation TEXT;

ALTER TABLE founder_notes ADD COLUMN IF NOT EXISTS linked_kpi_id UUID REFERENCES kpis(id) ON DELETE SET NULL;
ALTER TABLE founder_notes ADD COLUMN IF NOT EXISTS linked_track_id UUID REFERENCES operating_tracks(id) ON DELETE SET NULL;
ALTER TABLE founder_notes DROP CONSTRAINT IF EXISTS founder_notes_category_check;
ALTER TABLE founder_notes ADD CONSTRAINT founder_notes_category_check CHECK (category IN ('general', 'outreach', 'investor', 'finance', 'product', 'strategy', 'meeting', 'personal reminder', 'decision', 'risk'));

ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'LinkedIn';
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS message_sent_count INT DEFAULT 0;
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS reply_count INT DEFAULT 0;
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS last_reply_summary TEXT;
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS meeting_outcome TEXT;
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS next_action TEXT;

CREATE TABLE IF NOT EXISTS outreach_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES outreach_leads(id) ON DELETE CASCADE,
  interaction_type TEXT,
  description TEXT,
  outcome TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE investors ADD COLUMN IF NOT EXISTS fundraising_stage TEXT;
ALTER TABLE investors ADD COLUMN IF NOT EXISTS investor_fit_score INT DEFAULT 0;
ALTER TABLE investors ADD COLUMN IF NOT EXISTS warm_intro_status TEXT DEFAULT 'needed';
ALTER TABLE investors ADD COLUMN IF NOT EXISTS next_ask TEXT;
ALTER TABLE investors ADD COLUMN IF NOT EXISTS concern_tags TEXT;
ALTER TABLE investors ADD COLUMN IF NOT EXISTS meeting_outcome TEXT;
ALTER TABLE investors ADD COLUMN IF NOT EXISTS follow_up_quality TEXT DEFAULT 'medium';

ALTER TABLE costs ADD COLUMN IF NOT EXISTS expense_quality TEXT DEFAULT 'useful';
ALTER TABLE costs ADD COLUMN IF NOT EXISTS renewal_date DATE;
ALTER TABLE costs ADD COLUMN IF NOT EXISTS cancel_url TEXT;

ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS current_north_star_metric TEXT;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS biggest_assumption TEXT;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS biggest_risk TEXT;

CREATE INDEX IF NOT EXISTS idx_operating_tracks_status ON operating_tracks(status);
CREATE INDEX IF NOT EXISTS idx_operating_tracks_priority ON operating_tracks(priority);
CREATE INDEX IF NOT EXISTS idx_risks_severity ON risks(severity_score DESC);
CREATE INDEX IF NOT EXISTS idx_decision_log_date ON decision_log(decision_date DESC);
