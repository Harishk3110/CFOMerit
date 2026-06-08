"use client";

import { FormEvent, useMemo, useState } from "react";
import { Plus, Search, Sparkles } from "lucide-react";
import { CopyButton } from "@/components/CopyButton";
import { StatusBadge } from "@/components/StatusBadge";
import { calculateInvestorScore, formatMoney, generatedInvestorUpdate } from "@/lib/command-center";
import { seedInvestors } from "@/lib/seed-data";
import type { Investor } from "@/lib/types";
import { useLocalRecords } from "@/lib/use-local-records";

const investorStatuses: Investor["status"][] = ["target", "researched", "warm_intro_needed", "contacted", "replied", "meeting_booked", "first_meeting_done", "follow_up_sent", "data_room_sent", "diligence", "soft_commit", "committed", "passed", "dead"];
const investorTypes: Investor["investor_type"][] = ["angel", "VC", "accelerator", "family office", "strategic investor", "operator angel", "grant", "school fund", "other"];

export default function InvestorsPage() {
  const store = useLocalRecords("merit.investors", seedInvestors);
  const [selectedId, setSelectedId] = useState(seedInvestors[0]?.id || "");
  const [showAddInvestor, setShowAddInvestor] = useState(false);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [generatedUpdate, setGeneratedUpdate] = useState("");

  const filtered = useMemo(
    () =>
      store.records.filter((investor) => {
        const haystack = `${investor.investor_name} ${investor.firm_name} ${investor.thesis} ${investor.notes}`.toLowerCase();
        return (
          haystack.includes(query.toLowerCase()) &&
          (typeFilter === "all" || investor.investor_type === typeFilter) &&
          (statusFilter === "all" || investor.status === statusFilter)
        );
      }),
    [query, statusFilter, store.records, typeFilter]
  );
  const selected = store.records.find((investor) => investor.id === selectedId) || filtered[0];

  const byStatus = investorStatuses.reduce<Record<string, Investor[]>>((acc, status) => {
    acc[status] = filtered.filter((investor) => investor.status === status);
    return acc;
  }, {});

  const addInvestor = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const partial = {
      investor_name: String(data.get("investor_name") || "New Investor"),
      firm_name: String(data.get("firm_name") || ""),
      investor_type: String(data.get("investor_type")) as Investor["investor_type"],
      linkedin_url: String(data.get("linkedin_url") || ""),
      website_url: String(data.get("website_url") || ""),
      email: String(data.get("email") || ""),
      location: String(data.get("location") || ""),
      thesis: String(data.get("thesis") || ""),
      relevant_portfolio_companies: String(data.get("relevant_portfolio_companies") || ""),
      stage_focus: String(data.get("stage_focus") || ""),
      sector_focus: String(data.get("sector_focus") || ""),
      warm_intro_source: String(data.get("warm_intro_source") || ""),
    };
    const record: Investor = {
      id: `investor-${crypto.randomUUID()}`,
      ...partial,
      check_size_min: Number(data.get("check_size_min") || 0),
      check_size_max: Number(data.get("check_size_max") || 0),
      priority_score: calculateInvestorScore(partial),
      status: "target",
      next_follow_up_at: String(data.get("next_follow_up_at") || ""),
      notes: String(data.get("notes") || ""),
      concerns: "",
      next_steps: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: "",
    };
    store.addRecord(record);
    setSelectedId(record.id);
    setShowAddInvestor(false);
  };

  const investorOutreachText = selected
    ? `${selected.investor_name}, I am building Merit, proof-of-ability infrastructure for early talent. Given ${selected.firm_name || "your"} focus on ${selected.thesis || selected.sector_focus || "early-stage companies"}, I would value a short conversation about our recruiter validation and seed narrative.`
    : "";

  return (
    <div className="max-w-7xl p-6 lg:p-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Investors</h1>
          <p className="mt-1 text-slate-600">Investor relations pipeline, notes, concerns, and follow-up reminders.</p>
        </div>
        <button onClick={() => setShowAddInvestor(true)} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800">
          <Plus size={18} /> Add Investor
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative min-w-72 flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search investor, firm, thesis, notes" className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm" />
        </div>
        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="all">All types</option>{investorTypes.map((type) => <option key={type}>{type}</option>)}</select>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="all">All statuses</option>{investorStatuses.map((status) => <option key={status}>{status}</option>)}</select>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="overflow-x-auto xl:col-span-2">
          <div className="flex gap-4 pb-4">
            {investorStatuses.slice(0, 10).map((status) => (
              <div key={status} className="w-72 shrink-0 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase text-slate-800">{status.replace(/_/g, " ")}</h2>
                  <span className="text-xs font-semibold text-slate-500">{byStatus[status]?.length || 0}</span>
                </div>
                <div className="space-y-3">
                  {(byStatus[status] || []).map((investor) => (
                    <button key={investor.id} onClick={() => setSelectedId(investor.id)} className={`w-full rounded-lg border bg-white p-4 text-left hover:border-blue-400 ${selected?.id === investor.id ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200"}`}>
                      <p className="font-semibold text-slate-950">{investor.firm_name || investor.investor_name}</p>
                      <p className="mt-1 text-xs text-slate-600">{investor.investor_name}</p>
                      <p className="mt-2 line-clamp-2 text-xs text-blue-700">{investor.thesis || investor.sector_focus}</p>
                      <p className="mt-3 text-xs font-semibold text-slate-700">Score {investor.priority_score}</p>
                    </button>
                  ))}
                  {!byStatus[status]?.length && <p className="rounded-md border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500">No investors</p>}
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-lg border border-slate-200 bg-white p-6">
          {selected ? (
            <>
              <h2 className="text-xl font-bold text-slate-950">{selected.firm_name || selected.investor_name}</h2>
              <p className="mt-1 text-sm text-slate-600">{selected.investor_name} - {selected.investor_type}</p>
              <div className="my-5 space-y-2 border-y border-slate-200 py-4 text-sm">
                <div className="flex justify-between"><span className="text-slate-600">Status</span><StatusBadge status={selected.status} /></div>
                <div className="flex justify-between"><span className="text-slate-600">Score</span><span className="font-semibold">{selected.priority_score}/100</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Check size</span><span>{formatMoney(selected.check_size_min || 0)} - {formatMoney(selected.check_size_max || 0)}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Follow-up</span><span>{selected.next_follow_up_at || "None"}</span></div>
              </div>
              <label className="mb-2 block text-xs font-semibold uppercase text-slate-600">Status</label>
              <select value={selected.status} onChange={(event) => store.updateRecord(selected.id, { status: event.target.value as Investor["status"] })} className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">{investorStatuses.map((status) => <option key={status}>{status}</option>)}</select>
              <label className="mb-2 block text-xs font-semibold uppercase text-slate-600">Next follow-up</label>
              <input type="date" value={selected.next_follow_up_at?.slice(0, 10) || ""} onChange={(event) => store.updateRecord(selected.id, { next_follow_up_at: event.target.value })} className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <label className="mb-2 block text-xs font-semibold uppercase text-slate-600">Notes</label>
              <textarea value={selected.notes || ""} onChange={(event) => store.updateRecord(selected.id, { notes: event.target.value })} rows={4} className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <label className="mb-2 block text-xs font-semibold uppercase text-slate-600">Concerns</label>
              <textarea value={selected.concerns || ""} onChange={(event) => store.updateRecord(selected.id, { concerns: event.target.value })} rows={3} className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <div className="mb-4 rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="mb-2 text-xs font-semibold uppercase text-slate-600">Investor outreach draft</p>
                <p className="mb-3 text-sm text-slate-700">{investorOutreachText}</p>
                <CopyButton text={investorOutreachText} label="Copy Message" />
              </div>
              <button onClick={() => setGeneratedUpdate(generatedInvestorUpdate())} className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-50 px-4 py-2 font-medium text-blue-800 hover:bg-blue-100">
                <Sparkles size={16} /> Generate Investor Update
              </button>
              {generatedUpdate && (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <textarea value={generatedUpdate} onChange={(event) => setGeneratedUpdate(event.target.value)} rows={10} className="mb-3 w-full rounded border border-slate-200 bg-white p-2 text-xs text-slate-700" />
                  <CopyButton text={generatedUpdate} label="Copy Update" />
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-600">Select an investor to view profile details.</p>
          )}
        </aside>
      </div>

      {showAddInvestor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-5 text-xl font-bold text-slate-950">Add Investor</h2>
            <form onSubmit={addInvestor} className="space-y-4">
              <div className="grid grid-cols-2 gap-3"><input name="investor_name" required placeholder="Investor name" className="rounded-lg border border-slate-300 px-3 py-2" /><input name="firm_name" placeholder="Firm" className="rounded-lg border border-slate-300 px-3 py-2" /></div>
              <div className="grid grid-cols-2 gap-3"><select name="investor_type" className="rounded-lg border border-slate-300 px-3 py-2">{investorTypes.map((type) => <option key={type}>{type}</option>)}</select><input name="location" placeholder="Location" className="rounded-lg border border-slate-300 px-3 py-2" /></div>
              <div className="grid grid-cols-2 gap-3"><input name="check_size_min" type="number" placeholder="Min check" className="rounded-lg border border-slate-300 px-3 py-2" /><input name="check_size_max" type="number" placeholder="Max check" className="rounded-lg border border-slate-300 px-3 py-2" /></div>
              <input name="linkedin_url" placeholder="LinkedIn URL" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              <input name="website_url" placeholder="Website URL" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              <input name="email" placeholder="Email" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              <textarea name="thesis" rows={3} placeholder="Thesis" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              <textarea name="relevant_portfolio_companies" rows={2} placeholder="Relevant portfolio companies" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              <div className="grid grid-cols-2 gap-3"><input name="stage_focus" placeholder="Stage focus" className="rounded-lg border border-slate-300 px-3 py-2" /><input name="sector_focus" placeholder="Sector focus" className="rounded-lg border border-slate-300 px-3 py-2" /></div>
              <input name="warm_intro_source" placeholder="Warm intro source" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              <input name="next_follow_up_at" type="date" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              <textarea name="notes" rows={3} placeholder="Notes" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowAddInvestor(false)} className="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50">Cancel</button><button type="submit" className="flex-1 rounded-lg bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800">Save Investor</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
