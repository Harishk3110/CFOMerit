-- Merit Command Center MVP seed data
-- Safe to omit in production if you prefer starting with empty tables.

INSERT INTO outreach_leads (
  first_name, last_name, linkedin_url, company_name, role_title, industry, location,
  lead_type, source, priority_score, personalization_notes, profile_summary,
  pain_angle, merit_angle, status, owner, last_contacted_at, next_follow_up_at
) VALUES
('Sarah', 'Chen', 'https://linkedin.com/in/sample-sarah-chen', 'TechCorp', 'Head of Talent', 'tech', 'Singapore', 'recruiter', 'Founder referral', 95, 'Scaling graduate engineering hiring and cares about practical project evidence.', 'Talent leader responsible for early career hiring across engineering and product.', 'Resume screening creates weak signal for junior roles.', 'Structured project evidence can shorten screening and improve candidate signal.', 'connected', 'Founder', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE),
('Jamie', 'Rodriguez', 'https://linkedin.com/in/sample-jamie-rodriguez', 'FinanceHub', 'Recruiter', 'fintech', 'Singapore', 'recruiter', 'Campus hiring event', 82, 'Hiring interns for data and software roles.', 'Recruiter focused on internship and graduate roles.', 'Needs better evidence than resumes for intern screening.', 'Merit surfaces real student projects and outcomes.', 'message_generated', 'Growth', NULL, CURRENT_DATE + INTERVAL '1 day'),
('Alex', 'Park', 'https://linkedin.com/in/sample-alex-park', 'StartupX', 'Co-founder', 'startup', 'Singapore', 'founder', 'Warm intro', 88, 'Often hires interns and junior operators.', 'Founder building a B2B SaaS team in Singapore.', 'Needs high-signal junior candidates without a large recruiting team.', 'Merit can help identify students with proof of execution.', 'replied', 'Founder', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE),
('Priya', 'Nair', 'https://linkedin.com/in/sample-priya-nair', 'NUS Enterprise', 'Program Manager', 'education', 'Singapore', 'school partner', 'School network', 76, 'Runs student startup and internship programs.', 'Program lead connecting students with startup opportunities.', 'Students need better proof of their project work.', 'Merit can make student outcomes visible to recruiters.', 'new', 'Partnerships', NULL, CURRENT_DATE + INTERVAL '2 days'),
('Morgan', 'Lee', 'https://linkedin.com/in/sample-morgan-lee', 'Independent', 'Operator Angel', 'future of work', 'Singapore', 'investor', 'Accelerator office hours', 90, 'Invests in early talent and future-of-work companies.', 'Operator angel with HR tech and marketplace experience.', 'Looks for clear wedge and recruiter demand evidence.', 'Proof-of-ability infrastructure for early talent.', 'meeting_booked', 'Founder', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '3 days');

INSERT INTO investors (
  investor_name, firm_name, investor_type, linkedin_url, website_url, email, location,
  thesis, relevant_portfolio_companies, check_size_min, check_size_max, stage_focus,
  sector_focus, warm_intro_source, priority_score, status, last_contacted_at,
  next_follow_up_at, meeting_date, notes, concerns, next_steps
) VALUES
('Sarah Johnson', 'Accel', 'VC', 'https://linkedin.com/in/sample-sarah-johnson', 'https://www.accel.com', 'sample@accel.com', 'Singapore', 'Future of work, education, HR tech, and SaaS infrastructure.', 'WorkOS, Guild, sample HR tech investments', 500000, 3000000, 'Seed', 'future of work', 'Founder network', 95, 'meeting_booked', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '2 days', CURRENT_DATE + INTERVAL '1 day', 'Strong thesis fit. Keep pitch focused on recruiter demand and proof-of-ability infrastructure.', 'May challenge defensibility and distribution.', 'Prepare meeting brief and ask for recruiter portfolio feedback.'),
('James Lee', 'Monk''s Hill Ventures', 'VC', 'https://linkedin.com/in/sample-james-lee', 'https://www.monkshill.com', 'sample@monkshill.com', 'Singapore', 'Southeast Asia B2B software and marketplaces.', 'Regional SaaS and marketplace companies', 250000, 2000000, 'Pre-seed / Seed', 'SaaS', 'Accelerator mentor', 88, 'researched', NULL, CURRENT_DATE, NULL, 'Good regional fit; needs clear wedge in Singapore.', 'Market size and go-to-market repeatability.', 'Send concise investor note after recruiter pilot data is ready.'),
('Anita Rao', 'Future Talent Fund', 'operator angel', 'https://linkedin.com/in/sample-anita-rao', NULL, NULL, 'Singapore', 'Education-to-work transition, HR tech, and student mobility.', 'Career discovery and upskilling startups', 25000, 150000, 'Angel', 'HR tech', NULL, 91, 'contacted', CURRENT_DATE - INTERVAL '4 days', CURRENT_DATE, NULL, 'Likely useful as angel plus advisor.', 'Wants evidence that recruiters will change workflow.', 'Follow up with recruiter validation summary.'),
('Daniel Tan', 'Entrepreneur First', 'accelerator', NULL, 'https://www.joinef.com', 'sample@joinef.com', 'Singapore', 'Pre-seed technical founders and new category creation.', 'Talent, AI, and marketplace startups', 100000, 250000, 'Pre-seed', 'AI', 'Program alumni', 84, 'warm_intro_needed', NULL, CURRENT_DATE + INTERVAL '4 days', NULL, 'Potential accelerator route and investor network access.', 'Needs stronger evidence of founder-market insight.', 'Ask alumni for intro.'),
('Mei Wong', 'SEA Angels', 'angel', 'https://linkedin.com/in/sample-mei-wong', NULL, NULL, 'Southeast Asia', 'Student outcomes, marketplace liquidity, and future of work.', 'Education marketplace and hiring tools', 10000, 75000, 'Angel', 'education', NULL, 80, 'target', NULL, CURRENT_DATE + INTERVAL '5 days', NULL, 'Good for first checks and ecosystem intros.', 'May need clearer monetization path.', 'Research recent investments and tailor outreach.');

INSERT INTO costs (vendor, category, amount, currency, billing_frequency, start_date, payment_method, owner, is_recurring, notes) VALUES
('Supabase', 'hosting', 250, 'USD', 'monthly', CURRENT_DATE - INTERVAL '90 days', 'card', 'Engineering', TRUE, 'Database and storage'),
('Vercel', 'hosting', 150, 'USD', 'monthly', CURRENT_DATE - INTERVAL '90 days', 'card', 'Engineering', TRUE, 'App hosting'),
('OpenAI API', 'AI/API', 500, 'USD', 'monthly', CURRENT_DATE - INTERVAL '60 days', 'card', 'Product', TRUE, 'Draft generation and briefings'),
('Domain', 'software', 50, 'USD', 'annual', CURRENT_DATE - INTERVAL '120 days', 'card', 'Founder', TRUE, 'Merit domain renewal'),
('Figma', 'design', 80, 'USD', 'monthly', CURRENT_DATE - INTERVAL '90 days', 'card', 'Design', TRUE, 'Design workspace'),
('Linear', 'software', 50, 'USD', 'monthly', CURRENT_DATE - INTERVAL '90 days', 'card', 'Product', TRUE, 'Execution tracking'),
('Design Contractor', 'contractor', 3000, 'USD', 'one-time', CURRENT_DATE - INTERVAL '20 days', 'bank transfer', 'Founder', FALSE, 'Portfolio UI sprint'),
('Recruiter Event', 'events', 650, 'USD', 'one-time', CURRENT_DATE - INTERVAL '10 days', 'card', 'Growth', FALSE, 'Founder dinner and recruiter interviews');

INSERT INTO tasks (title, description, owner, priority, status, due_date, linked_strategy_pillar) VALUES
('Build recruiter messaging templates', 'Create reusable outreach copy for recruiter segments.', 'Product', 'low', 'backlog', CURRENT_DATE + INTERVAL '7 days', 'Recruiter demand'),
('Design analytics dashboard', 'Define recruiter validation metrics.', 'Design', 'medium', 'backlog', CURRENT_DATE + INTERVAL '10 days', 'Portfolio UI'),
('Finalize portfolio UI flow', 'Finish project evidence and outcome sections.', 'Product', 'high', 'this_week', CURRENT_DATE + INTERVAL '2 days', 'Portfolio UI'),
('Complete 5 recruiter validation calls', 'Ask about screening workflow and willingness to pilot.', 'Growth', 'critical', 'this_week', CURRENT_DATE + INTERVAL '4 days', 'Recruiter demand'),
('Prepare investor data room', 'Collect metrics, pitch narrative, and pilot notes.', 'Finance', 'high', 'this_week', CURRENT_DATE + INTERVAL '5 days', 'Fundraising'),
('Implement project verification', 'Add evidence checks and recruiter-readable verification state.', 'Engineering', 'high', 'in_progress', CURRENT_DATE + INTERVAL '3 days', 'Proof of ability'),
('Recruiter onboarding copy', 'Tighten copy around proof-of-ability evaluation.', 'Marketing', 'medium', 'in_progress', CURRENT_DATE + INTERVAL '2 days', 'Recruiter workflow'),
('Deploy new student upload flow', 'Blocked until storage setup is confirmed.', 'Engineering', 'critical', 'blocked', CURRENT_DATE + INTERVAL '1 day', 'Student supply'),
('Student signup flow redesign', 'Ship simpler onboarding.', 'Product', 'high', 'done', CURRENT_DATE - INTERVAL '2 days', 'Student supply'),
('Pilot pricing review', 'Review current pilot pricing and budget sensitivity.', 'Finance', 'medium', 'done', CURRENT_DATE - INTERVAL '1 day', 'Revenue');

INSERT INTO ai_briefings (briefing_type, briefing_text, related_data) VALUES
('daily_founder', 'Top actions: follow up with Sarah Chen, prepare the Accel meeting brief, and unblock project verification. Finance is stable, but API cost needs monitoring.', '{"seed": true}'::jsonb),
('weekly_strategy', 'Execution review: recruiter validation moved, verification is still the constraint, and accelerator outreach should stay deprioritized until the core pilot workflow is stronger.', '{"seed": true}'::jsonb);
