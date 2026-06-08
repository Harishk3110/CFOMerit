"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Save } from "lucide-react";

export default function SettingsPage() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [showAnonKey, setShowAnonKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">
          Configure your Merit Command Center
        </p>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
          ✓ Settings saved successfully
        </div>
      )}

      {/* Company Information */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          Company Information
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Company Name
            </label>
            <input
              type="text"
              defaultValue="Merit"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Current Runway (months)
            </label>
            <input
              type="number"
              defaultValue="8.2"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Founder/CEO Name
            </label>
            <input
              type="text"
              placeholder="Your name"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Company Description
            </label>
            <textarea
              rows={3}
              defaultValue="Merit is a proof-of-ability platform for early talent. Students showcase real projects, evidence, outcomes, skills, and work history. Recruiters use Merit to evaluate candidates beyond traditional resumes."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
            />
          </div>
        </div>
      </div>

      {/* Supabase Configuration */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          Supabase Configuration
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          Connect your Supabase project for database functionality
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Supabase Project URL
            </label>
            <input
              type="text"
              placeholder="https://your-project.supabase.co"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
            />
            <p className="text-xs text-slate-500 mt-1">
              Find in your Supabase project settings
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Supabase Anon Key
            </label>
            <div className="relative">
              <input
                type={showAnonKey ? "text" : "password"}
                placeholder="Your anon key"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
              />
              <button
                onClick={() => setShowAnonKey(!showAnonKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showAnonKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Save in .env.local as NEXT_PUBLIC_SUPABASE_ANON_KEY
            </p>
          </div>
        </div>
      </div>

      {/* OpenAI Configuration */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          OpenAI Configuration
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          Enable AI-powered message generation and briefings
        </p>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            OpenAI API Key
          </label>
          <div className="relative">
            <input
              type={showApiKey ? "text" : "password"}
              placeholder="sk-..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
            />
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Get your API key from{" "}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              OpenAI dashboard
            </a>
            . Save in .env.local as OPENAI_API_KEY
          </p>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="daily-briefing"
              defaultChecked
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="daily-briefing" className="text-sm text-slate-700">
              Generate daily briefing every morning at 8 AM
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="weekly-review"
              defaultChecked
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="weekly-review" className="text-sm text-slate-700">
              Generate weekly review every Friday at 5 PM
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="follow-up-alerts"
              defaultChecked
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="follow-up-alerts" className="text-sm text-slate-700">
              Alert when follow-ups are due
            </label>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-slate-50 rounded-lg border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">About</h2>
        <div className="text-sm text-slate-600 space-y-2">
          <p>
            <strong>Merit Command Center</strong> v1.0
          </p>
          <p>
            An internal founder operating system for early-stage startups. Track
            outreach, investors, finance, weekly execution, and get AI-powered
            briefings.
          </p>
          <p className="text-xs text-slate-500 mt-4">
            Built with Next.js, Supabase, and OpenAI.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
        >
          <Save size={18} />
          Save Settings
        </button>

        <button className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50">
          Reset to Defaults
        </button>
      </div>

      {/* Documentation */}
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-bold text-blue-900 mb-2">📖 Documentation</h3>
        <p className="text-blue-800 text-sm mb-3">
          Set up your Merit Command Center to work with your team:
        </p>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>
            • Create a{" "}
            <code className="bg-blue-100 px-1 py-0.5 rounded">.env.local</code>{" "}
            file with your credentials
          </li>
          <li>• Run the database migrations (see README)</li>
          <li>• Invite your team (via Supabase auth)</li>
          <li>• Start tracking outreach, investors, and finance</li>
        </ul>
      </div>
    </div>
  );
}
