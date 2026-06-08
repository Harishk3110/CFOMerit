"use client";

import React, { useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { CopyButton } from "@/components/CopyButton";
import { Plus, Sparkles } from "lucide-react";

const investorStatuses = [
  "target",
  "researched",
  "contacted",
  "replied",
  "meeting_booked",
  "diligence",
  "soft_commit",
  "committed",
];

const sampleInvestors = {
  target: [
    {
      id: 1,
      name: "Accel Partners",
      lead: "Sarah Johnson",
      checkSize: "$500K-$5M",
      thesis: "Future of Work, HR Tech",
      priority: 95,
    },
  ],
  researched: [
    {
      id: 2,
      name: "Sequoia Capital",
      lead: "James Lee",
      checkSize: "$1M+",
      thesis: "Infrastructure, AI",
      priority: 90,
    },
    {
      id: 3,
      name: "Greycroft",
      lead: "Ian Oswald",
      checkSize: "$250K-$2M",
      thesis: "Edtech, Diversity",
      priority: 85,
    },
  ],
  contacted: [
    {
      id: 4,
      name: "Khosla Ventures",
      lead: "Partner TBD",
      checkSize: "$500K-$20M",
      thesis: "AI, Climate, Health",
      priority: 80,
    },
  ],
  replied: [
    {
      id: 5,
      name: "Spark Capital",
      lead: "Alex Hill",
      checkSize: "$250K-$3M",
      thesis: "B2B SaaS, Marketplaces",
      priority: 88,
    },
  ],
  meeting_booked: [
    {
      id: 6,
      name: "GGV Capital",
      lead: "Jixun Foo",
      checkSize: "$500K-$10M",
      thesis: "Asia, Consumer, Enterprise",
      priority: 92,
    },
  ],
  diligence: [],
  soft_commit: [],
  committed: [],
};

export default function InvestorsPage() {
  const [selectedInvestor, setSelectedInvestor] = useState<any>(null);
  const [showUpdateGenerator, setShowUpdateGenerator] = useState(false);

  const investorUpdateSample = `What Moved This Month:
- 15 students onboarded with completed projects
- 3 recruiter pilots started (TechCorp, FinanceHub, StartupX)
- Portfolio UI improved (now includes real project verification)

Current Focus:
- Recruiter onboarding flow refinement
- Student project discovery and curation
- Measurable recruiter hiring signal tracking

Key Asks:
- Warm intros to 5 more enterprise recruiters
- Partnership discussion with HR tech platforms
- Advisory help on enterprise sales strategy

Next Month:
- Scale recruiter base to 20 active pilots
- Launch student referral program
- Complete Series Seed pitch materials`;

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Investors</h1>
          <p className="text-slate-600 mt-1">
            Investor relations pipeline and tracking
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
          <Plus size={20} />
          Add Investor
        </button>
      </div>

      {/* Investor Pipeline Board */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Left Column: Stages */}
        <div className="xl:col-span-2 overflow-x-auto pb-4">
          <div className="flex gap-6 min-w-full">
            {investorStatuses.map((status) => (
              <div
                key={status}
                className="flex-shrink-0 w-80 bg-slate-50 rounded-lg p-4 border border-slate-200"
              >
                <h3 className="font-semibold text-slate-900 mb-4 text-sm">
                  {status.replace("_", " ").toUpperCase()}
                  <span className="text-slate-600 font-normal ml-2">
                    ({sampleInvestors[status as keyof typeof sampleInvestors]?.length || 0})
                  </span>
                </h3>

                <div className="space-y-3">
                  {(sampleInvestors[status as keyof typeof sampleInvestors] || []).map(
                    (investor) => (
                      <div
                        key={investor.id}
                        onClick={() => setSelectedInvestor(investor)}
                        className={`p-4 bg-white rounded-lg border cursor-pointer transition-all hover:border-blue-400 ${
                          selectedInvestor?.id === investor.id
                            ? "border-blue-500 ring-2 ring-blue-200"
                            : "border-slate-200"
                        }`}
                      >
                        <p className="font-semibold text-slate-900 text-sm">
                          {investor.name}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          {investor.lead}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {investor.checkSize}
                        </p>
                        <p className="text-xs text-blue-600 mt-2">{investor.thesis}</p>
                      </div>
                    )
                  )}

                  {(sampleInvestors[status as keyof typeof sampleInvestors] || [])
                    .length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <p className="text-xs">No investors</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Investor Detail */}
        <div className="lg:col-span-2 xl:col-span-1">
          {selectedInvestor ? (
            <div className="bg-white rounded-lg border border-slate-200 p-6 sticky top-20">
              <h3 className="text-lg font-bold text-slate-900">
                {selectedInvestor.name}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {selectedInvestor.lead}
              </p>

              <div className="mt-6 space-y-3 border-t border-b border-slate-200 py-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Check Size
                  </label>
                  <p className="text-sm font-medium text-slate-900">
                    {selectedInvestor.checkSize}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Thesis
                  </label>
                  <p className="text-sm text-slate-700">
                    {selectedInvestor.thesis}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Priority
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${selectedInvestor.priority}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold">
                      {selectedInvestor.priority}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowUpdateGenerator(true)}
                className="w-full mt-6 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200"
              >
                <Sparkles size={16} />
                Generate Update
              </button>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-6 text-center">
              <p className="text-slate-600">Select an investor to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Investor Update Generator */}
      {showUpdateGenerator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Generated Investor Update
                </h2>
                <p className="text-slate-600 mt-1">
                  Copy, edit, and share with investors
                </p>
              </div>
              <button
                onClick={() => setShowUpdateGenerator(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="bg-slate-50 rounded-lg p-6 mb-6 border border-slate-200">
              <p className="text-slate-700 whitespace-pre-wrap font-mono text-sm">
                {investorUpdateSample}
              </p>
            </div>

            <div className="flex gap-4">
              <CopyButton text={investorUpdateSample} label="Copy Update" />
              <button
                onClick={() => setShowUpdateGenerator(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
