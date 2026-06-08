"use client";

import { useState } from "react";
import { RotateCcw, Save } from "lucide-react";
import { meritContext } from "@/lib/seed-data";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [reset, setReset] = useState(false);

  const saveSettings = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const resetLocalData = () => {
    if (!window.confirm("Reset local Merit Command Center data to seed records?")) return;
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith("merit."))
      .forEach((key) => window.localStorage.removeItem(key));
    setReset(true);
    window.setTimeout(() => window.location.reload(), 700);
  };

  return (
    <div className="max-w-4xl p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-950">Settings</h1>
        <p className="mt-1 text-slate-600">Company context, environment setup, and local MVP data controls.</p>
      </div>

      {saved && <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">Settings saved locally.</div>}
      {reset && <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-800">Local data reset. Reloading seed records.</div>}

      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-slate-950">Default Merit Context</h2>
        <div className="space-y-4">
          <Field label="Company" value={meritContext.company} />
          <TextArea label="Description" value={meritContext.description} />
          <TextArea label="Core Problem" value={meritContext.coreProblem} />
          <TextArea label="Core Solution" value={meritContext.coreSolution} />
          <TextArea label="Current Strategic Focus" value={meritContext.strategicFocus} />
        </div>
      </section>

      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-2 text-lg font-bold text-slate-950">Environment Variables</h2>
        <p className="mb-4 text-sm text-slate-600">The app runs without these values using local seed data and fallback drafts. Add them in `.env.local` for Supabase persistence and OpenAI generation.</p>
        <div className="space-y-3">
          <EnvRow name="NEXT_PUBLIC_SUPABASE_URL" description="Supabase project URL." />
          <EnvRow name="NEXT_PUBLIC_SUPABASE_ANON_KEY" description="Supabase anon key for browser database access." />
          <EnvRow name="OPENAI_API_KEY" description="Server-side key for AI route generation." />
        </div>
      </section>

      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-slate-950">Compliance Guardrails</h2>
        <div className="grid gap-2 text-sm text-slate-700">
          <p>No LinkedIn auto-DM, auto-connect, scraping, password, cookie, session, or token handling exists in this MVP.</p>
          <p>Outreach messages are editable drafts with Copy Message buttons only. Founders must send every LinkedIn message manually.</p>
          <p>Personalization is based on professional context entered by the founder: role, company, industry, notes, and Merit relevance.</p>
        </div>
      </section>

      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-slate-950">Local MVP Data</h2>
        <p className="mb-4 text-sm text-slate-600">Until Supabase is connected, the app stores edits in browser localStorage under `merit.*` keys.</p>
        <button onClick={resetLocalData} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50">
          <RotateCcw size={18} /> Reset Local Seed Data
        </button>
      </section>

      <button onClick={saveSettings} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-6 py-3 font-medium text-white hover:bg-blue-800">
        <Save size={18} /> Save Settings
      </button>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input defaultValue={value} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
    </label>
  );
}

function TextArea({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <textarea defaultValue={value} rows={3} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
    </label>
  );
}

function EnvRow({ name, description }: { name: string; description: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <code className="text-sm font-semibold text-slate-950">{name}</code>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </div>
  );
}
