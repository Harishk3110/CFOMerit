"use client";

import { FormEvent, useState } from "react";
import { RotateCcw, Save } from "lucide-react";
import type { CompanySettings } from "@/lib/types";
import { useLocalRecords } from "@/lib/use-local-records";

const defaultSettings = (): CompanySettings => {
  const now = new Date().toISOString();
  return {
    id: "company-settings",
    company_name: "Merit",
    company_description: "Merit is a proof-of-ability platform for early talent.",
    current_stage: "MVP with early users, recruiter validation, and active product development.",
    core_problem: "Resumes are weak signals for early talent.",
    core_solution: "Merit turns student work into structured, shareable, recruiter-readable proof.",
    target_users: "Students, recruiters, startup founders hiring interns or juniors, schools and career offices.",
    current_strategic_focus: "Grow student project supply, validate recruiter demand, improve portfolio UI, build recruiter discovery workflow, prepare investor narrative.",
    default_currency: "USD",
    current_north_star_metric: "verified student projects uploaded",
    biggest_assumption: "recruiters will use proof-of-work profiles to evaluate early talent faster than resumes",
    biggest_risk: "building product before enough recruiter demand is validated",
    created_at: now,
    updated_at: now,
  };
};

export default function SettingsPage() {
  const settingsStore = useLocalRecords<CompanySettings>("company_settings", [defaultSettings()]);
  const settings = settingsStore.records[0] || defaultSettings();
  const [saved, setSaved] = useState(false);

  const saveSettings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const record: CompanySettings = {
      ...settings,
      company_name: String(data.get("company_name") || ""),
      company_description: String(data.get("company_description") || ""),
      current_stage: String(data.get("current_stage") || ""),
      core_problem: String(data.get("core_problem") || ""),
      core_solution: String(data.get("core_solution") || ""),
      target_users: String(data.get("target_users") || ""),
      current_strategic_focus: String(data.get("current_strategic_focus") || ""),
      default_currency: String(data.get("default_currency") || "USD"),
      current_north_star_metric: String(data.get("current_north_star_metric") || ""),
      biggest_assumption: String(data.get("biggest_assumption") || ""),
      biggest_risk: String(data.get("biggest_risk") || ""),
      updated_at: new Date().toISOString(),
    };
    settingsStore.setRecords([record]);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const resetLocalData = () => {
    if (!window.confirm("Reset local command-center data? This clears KPIs, notes, outreach, investors, costs, plans, tasks, and briefings.")) return;
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith("merit.v2."))
      .forEach((key) => window.localStorage.removeItem(key));
    window.location.reload();
  };

  return (
    <div className="max-w-4xl p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-slate-400">Company context, default currency, and local MVP data controls.</p>
      </div>

      {saved && <div className="mb-6 rounded-lg border border-emerald-900 bg-emerald-950/40 p-4 text-emerald-300">Settings saved.</div>}

      <form onSubmit={saveSettings} className="mb-6 rounded-lg border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-5 text-lg font-bold text-white">Company Context</h2>
        <div className="space-y-4">
          <Input name="company_name" label="Company name" defaultValue={settings.company_name} />
          <Textarea name="company_description" label="Company description" defaultValue={settings.company_description} />
          <Input name="current_stage" label="Current stage" defaultValue={settings.current_stage} />
          <Textarea name="core_problem" label="Core problem" defaultValue={settings.core_problem} />
          <Textarea name="core_solution" label="Core solution" defaultValue={settings.core_solution} />
          <Textarea name="target_users" label="Target users" defaultValue={settings.target_users} />
          <Textarea name="current_strategic_focus" label="Current strategic focus" defaultValue={settings.current_strategic_focus} />
          <Input name="default_currency" label="Default currency" defaultValue={settings.default_currency} />
          <Input name="current_north_star_metric" label="Current north star metric" defaultValue={settings.current_north_star_metric || ""} />
          <Textarea name="biggest_assumption" label="Biggest assumption" defaultValue={settings.biggest_assumption || ""} />
          <Textarea name="biggest_risk" label="Biggest risk" defaultValue={settings.biggest_risk || ""} />
        </div>
        <button className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-500">
          <Save size={18} /> Save Settings
        </button>
      </form>

      <section className="mb-6 rounded-lg border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-3 text-lg font-bold text-white">Environment Variables</h2>
        <p className="mb-4 text-sm text-slate-400">The app works locally without Supabase or OpenAI. Add these values in `.env.local` when you want external services.</p>
        <div className="space-y-3">
          <Env name="NEXT_PUBLIC_SUPABASE_URL" text="Supabase project URL." />
          <Env name="NEXT_PUBLIC_SUPABASE_ANON_KEY" text="Supabase anon key." />
          <Env name="OPENAI_API_KEY" text="Server-side key for AI generation." />
        </div>
      </section>

      <section className="mb-6 rounded-lg border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-3 text-lg font-bold text-white">Compliance Guardrails</h2>
        <div className="space-y-2 text-sm text-slate-400">
          <p>No LinkedIn auto-DM, auto-connect, scraping, passwords, cookies, sessions, or tokens.</p>
          <p>Outreach drafts use Copy Message only. You manually send every message.</p>
          <p>Personalization stays limited to professional context you enter.</p>
        </div>
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-3 text-lg font-bold text-white">Local MVP Data</h2>
        <p className="mb-4 text-sm text-slate-400">Data is stored in browser localStorage under `merit.v2.*` until Supabase persistence is connected.</p>
        <button onClick={resetLocalData} className="inline-flex items-center gap-2 rounded-lg border border-red-900 px-4 py-2 font-medium text-red-300 hover:bg-red-950">
          <RotateCcw size={18} /> Reset Local Data
        </button>
      </section>
    </div>
  );
}

function Input({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return <label className="block"><span className="mb-1 block text-sm text-slate-400">{label}</span><input name={name} defaultValue={defaultValue} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none" /></label>;
}

function Textarea({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return <label className="block"><span className="mb-1 block text-sm text-slate-400">{label}</span><textarea name={name} rows={3} defaultValue={defaultValue} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none" /></label>;
}

function Env({ name, text }: { name: string; text: string }) {
  return <div className="rounded-lg border border-slate-800 bg-slate-950 p-3"><code className="text-sm font-semibold text-blue-300">{name}</code><p className="mt-1 text-sm text-slate-500">{text}</p></div>;
}
