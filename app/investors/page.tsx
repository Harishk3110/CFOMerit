"use client";

import { FormEvent, useMemo, useState } from "react";
import { Edit, Eye, Plus, Search, Sparkles, Trash2 } from "lucide-react";
import { CopyButton } from "@/components/CopyButton";
import { StatusBadge } from "@/components/StatusBadge";
import { calculateInvestorScore, formatMoney } from "@/lib/command-center";
import type { Investor, InvestorInteraction } from "@/lib/types";
import { useLocalRecords } from "@/lib/use-local-records";

const statuses: Investor["status"][] = ["target", "researched", "warm_intro_needed", "contacted", "replied", "meeting_booked", "first_meeting_done", "follow_up_sent", "data_room_sent", "diligence", "soft_commit", "committed", "passed", "dead"];
const types: Investor["investor_type"][] = ["angel", "VC", "accelerator", "family office", "strategic investor", "operator angel", "grant", "school fund", "other"];

const emptyInvestor = (): Investor => {
  const now = new Date().toISOString();
  return { id: `investor-${crypto.randomUUID()}`, investor_name: "", firm_name: "", investor_type: "angel", linkedin_url: "", website_url: "", email: "", location: "", thesis: "", relevant_portfolio_companies: "", check_size_min: 0, check_size_max: 0, stage_focus: "", sector_focus: "", warm_intro_source: "", priority_score: 0, status: "target", next_follow_up_at: "", meeting_date: "", notes: "", concerns: "", next_steps: "", created_at: now, updated_at: now, created_by: "" };
};

export default function InvestorsPage() {
  const investorsStore = useLocalRecords<Investor>("investors", []);
  const interactionsStore = useLocalRecords<InvestorInteraction>("investor_interactions", []);
  const [selectedId, setSelectedId] = useState("");
  const [editing, setEditing] = useState<Investor | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [brief, setBrief] = useState("");

  const selected = investorsStore.records.find((investor) => investor.id === selectedId) || investorsStore.records[0];
  const interactions = interactionsStore.records.filter((interaction) => interaction.investor_id === selected?.id);
  const filtered = useMemo(
    () => investorsStore.records.filter((investor) => {
      const haystack = `${investor.investor_name} ${investor.firm_name} ${investor.thesis} ${investor.notes}`.toLowerCase();
      return haystack.includes(query.toLowerCase()) && (statusFilter === "all" || investor.status === statusFilter) && (typeFilter === "all" || investor.investor_type === typeFilter);
    }),
    [investorsStore.records, query, statusFilter, typeFilter]
  );

  const saveInvestor = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    const data = new FormData(event.currentTarget);
    const partial = {
      investor_name: String(data.get("investor_name") || ""),
      firm_name: String(data.get("firm_name") || ""),
      investor_type: String(data.get("investor_type")) as Investor["investor_type"],
      linkedin_url: String(data.get("linkedin_url") || ""),
      website_url: String(data.get("website_url") || ""),
      email: String(data.get("email") || ""),
      location: String(data.get("location") || ""),
      thesis: String(data.get("thesis") || ""),
      relevant_portfolio_companies: String(data.get("relevant_portfolio_companies") || ""),
      check_size_min: Number(data.get("check_size_min") || 0),
      check_size_max: Number(data.get("check_size_max") || 0),
      stage_focus: String(data.get("stage_focus") || ""),
      sector_focus: String(data.get("sector_focus") || ""),
      warm_intro_source: String(data.get("warm_intro_source") || ""),
      status: String(data.get("status")) as Investor["status"],
      next_follow_up_at: String(data.get("next_follow_up_at") || ""),
      meeting_date: String(data.get("meeting_date") || ""),
      notes: String(data.get("notes") || ""),
      concerns: String(data.get("concerns") || ""),
      next_steps: String(data.get("next_steps") || ""),
    };
    const record: Investor = { ...editing, ...partial, priority_score: calculateInvestorScore(partial), updated_at: new Date().toISOString() };
    if (investorsStore.records.some((investor) => investor.id === record.id)) investorsStore.updateRecord(record.id, record);
    else investorsStore.addRecord(record);
    setSelectedId(record.id);
    setEditing(null);
  };

  const deleteInvestor = (investor: Investor) => {
    if (!window.confirm(`Delete investor "${investor.investor_name}"?`)) return;
    investorsStore.deleteRecord(investor.id);
    interactionsStore.setRecords((records) => records.filter((interaction) => interaction.investor_id !== investor.id));
    if (selectedId === investor.id) setSelectedId("");
  };

  const addMeetingNote = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected) return;
    const data = new FormData(event.currentTarget);
    const now = new Date().toISOString();
    interactionsStore.addRecord({ id: `interaction-${crypto.randomUUID()}`, investor_id: selected.id, interaction_type: "meeting", description: String(data.get("description") || ""), outcome: String(data.get("outcome") || ""), created_at: now, created_by: "" });
    event.currentTarget.reset();
  };

  const outreachDraft = selected ? `${selected.investor_name}, I am building Merit, proof-of-ability infrastructure for early talent. Given ${selected.firm_name || "your"} focus on ${selected.thesis || selected.sector_focus || "early-stage companies"}, I would value a short conversation about our recruiter validation and seed narrative.` : "";
  const generateBrief = () => {
    if (!selected) return;
    setBrief(`Investor Meeting Brief: ${selected.investor_name}

Firm: ${selected.firm_name || "Independent"}
Thesis: ${selected.thesis || "Not captured yet"}
Why relevant: Merit is a proof-of-ability platform for early talent, starting with student portfolios and recruiter discovery.

Likely questions:
- Why is this not LinkedIn, Handshake, or a job board?
- What proof do recruiters want before changing workflow?
- What is the wedge and monetization path?

Concerns to prepare for:
${selected.concerns || "Distribution, defensibility, and willingness to pay."}

Suggested ask:
Warm intros to recruiters hiring interns, juniors, students, or fresh graduates.`);
  };

  return (
    <div className="max-w-7xl p-6 lg:p-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div><h1 className="text-3xl font-bold text-white">Investors</h1><p className="mt-1 text-slate-400">Investor targets, notes, follow-ups, and meeting prep.</p></div>
        <button onClick={() => setEditing(emptyInvestor())} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500"><Plus size={18} /> Add Investor</button>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative min-w-72 flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search investor, firm, thesis, notes" className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 pl-10 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none" /></div>
        <Select value={typeFilter} onChange={setTypeFilter} options={["all", ...types]} />
        <Select value={statusFilter} onChange={setStatusFilter} options={["all", ...statuses]} />
      </div>

      {investorsStore.records.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-800 bg-slate-900 p-10 text-center"><p className="text-lg font-semibold text-slate-100">No investors tracked yet. Add your first investor target.</p><button onClick={() => setEditing(emptyInvestor())} className="mt-5 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500">Add Investor</button></div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <section className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900 xl:col-span-2">
            <table className="w-full min-w-[900px]"><thead className="bg-slate-950"><tr>{["Investor", "Firm", "Type", "Status", "Score", "Next follow-up", "Meeting date", "Actions"].map((head) => <th key={head} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">{head}</th>)}</tr></thead><tbody>{filtered.map((investor) => <tr key={investor.id} className={`border-t border-slate-800 hover:bg-slate-800/60 ${selected?.id === investor.id ? "bg-blue-950/30" : ""}`}><td className="px-4 py-4 font-medium text-slate-100">{investor.investor_name}</td><td className="px-4 py-4 text-sm text-slate-400">{investor.firm_name}</td><td className="px-4 py-4 text-sm text-slate-400">{investor.investor_type}</td><td className="px-4 py-4"><StatusBadge status={investor.status} /></td><td className="px-4 py-4 text-sm text-slate-300">{investor.priority_score}</td><td className="px-4 py-4 text-sm text-slate-400">{investor.next_follow_up_at || "-"}</td><td className="px-4 py-4 text-sm text-slate-400">{investor.meeting_date || "-"}</td><td className="px-4 py-4"><div className="flex gap-2"><IconButton label="View" onClick={() => setSelectedId(investor.id)} icon={<Eye size={16} />} /><IconButton label="Edit" onClick={() => setEditing(investor)} icon={<Edit size={16} />} /><IconButton danger label="Delete" onClick={() => deleteInvestor(investor)} icon={<Trash2 size={16} />} /></div></td></tr>)}</tbody></table>
            {!filtered.length && <p className="p-8 text-center text-sm text-slate-500">No investors match the current filters.</p>}
          </section>
          <aside className="rounded-lg border border-slate-800 bg-slate-900 p-5">
            {selected ? <>
              <div className="mb-5 flex items-start justify-between gap-3"><div><h2 className="text-xl font-bold text-white">{selected.investor_name}</h2><p className="mt-1 text-sm text-slate-400">{selected.firm_name || selected.investor_type}</p></div><StatusBadge status={selected.status} /></div>
              <div className="mb-5 grid grid-cols-2 gap-3 text-sm"><Detail label="Score" value={`${selected.priority_score}/100`} /><Detail label="Check size" value={`${formatMoney(selected.check_size_min || 0)} - ${formatMoney(selected.check_size_max || 0)}`} /><Detail label="Follow-up" value={selected.next_follow_up_at || "-"} /><Detail label="Meeting" value={selected.meeting_date || "-"} /></div>
              <TextareaInline label="Concerns" value={selected.concerns || ""} onChange={(value) => investorsStore.updateRecord(selected.id, { concerns: value })} />
              <TextareaInline label="Next steps" value={selected.next_steps || ""} onChange={(value) => investorsStore.updateRecord(selected.id, { next_steps: value })} />
              <div className="mb-5 grid grid-cols-2 gap-3"><button onClick={() => setEditing(selected)} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">Edit Investor</button><button onClick={() => deleteInvestor(selected)} className="rounded-lg border border-red-900 px-3 py-2 text-sm text-red-300 hover:bg-red-950">Delete Investor</button></div>
              <div className="mb-5 rounded-lg border border-slate-800 bg-slate-950 p-3"><p className="mb-2 text-xs uppercase text-slate-500">Outreach draft</p><p className="mb-3 text-sm text-slate-300">{outreachDraft}</p><CopyButton text={outreachDraft} label="Copy Message" /></div>
              <button onClick={generateBrief} className="mb-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500"><Sparkles size={16} /> Generate Meeting Brief</button>
              {brief && <div className="mb-5 rounded-lg border border-slate-800 bg-slate-950 p-3"><textarea value={brief} onChange={(event) => setBrief(event.target.value)} rows={10} className="mb-3 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm text-slate-100" /><CopyButton text={brief} label="Copy Brief" /></div>}
              <form onSubmit={addMeetingNote} className="mb-5 space-y-3"><p className="text-xs uppercase text-slate-500">Add meeting note</p><textarea name="description" required rows={3} placeholder="Meeting note" className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100 placeholder:text-slate-500" /><input name="outcome" placeholder="Outcome / next action" className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100 placeholder:text-slate-500" /><button className="w-full rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">Save Meeting Note</button></form>
              <div className="space-y-3">{interactions.map((interaction) => <div key={interaction.id} className="rounded-lg border border-slate-800 bg-slate-950 p-3"><p className="text-sm text-slate-200">{interaction.description}</p><p className="mt-1 text-xs text-slate-500">{interaction.outcome}</p><button onClick={() => window.confirm("Delete this note?") && interactionsStore.deleteRecord(interaction.id)} className="mt-2 text-xs text-red-300">Delete note</button></div>)}</div>
            </> : <p className="text-sm text-slate-500">Select an investor to view details.</p>}
          </aside>
        </div>
      )}
      {editing && <InvestorModal investor={editing} exists={investorsStore.records.some((investor) => investor.id === editing.id)} onCancel={() => setEditing(null)} onSave={saveInvestor} />}
    </div>
  );
}

function InvestorModal({ investor, exists, onCancel, onSave }: { investor: Investor; exists: boolean; onCancel: () => void; onSave: (event: FormEvent<HTMLFormElement>) => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"><div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-6 shadow-2xl"><h2 className="mb-5 text-xl font-bold text-white">{exists ? "Edit Investor" : "Add Investor"}</h2><form onSubmit={onSave} className="space-y-4"><div className="grid grid-cols-2 gap-3"><Input name="investor_name" label="Investor" defaultValue={investor.investor_name} required /><Input name="firm_name" label="Firm" defaultValue={investor.firm_name} /></div><div className="grid grid-cols-3 gap-3"><SelectField name="investor_type" label="Type" defaultValue={investor.investor_type} options={types} /><SelectField name="status" label="Status" defaultValue={investor.status} options={statuses} /><Input name="location" label="Location" defaultValue={investor.location} /></div><div className="grid grid-cols-2 gap-3"><Input name="linkedin_url" label="LinkedIn URL" defaultValue={investor.linkedin_url || ""} /><Input name="website_url" label="Website URL" defaultValue={investor.website_url || ""} /></div><Input name="email" label="Email" defaultValue={investor.email || ""} /><div className="grid grid-cols-2 gap-3"><Input name="check_size_min" label="Min check" type="number" defaultValue={String(investor.check_size_min || 0)} /><Input name="check_size_max" label="Max check" type="number" defaultValue={String(investor.check_size_max || 0)} /></div><div className="grid grid-cols-2 gap-3"><Input name="stage_focus" label="Stage focus" defaultValue={investor.stage_focus || ""} /><Input name="sector_focus" label="Sector focus" defaultValue={investor.sector_focus || ""} /></div><div className="grid grid-cols-2 gap-3"><Input name="next_follow_up_at" label="Next follow-up" type="date" defaultValue={investor.next_follow_up_at?.slice(0, 10) || ""} /><Input name="meeting_date" label="Meeting date" type="date" defaultValue={investor.meeting_date?.slice(0, 10) || ""} /></div><Input name="warm_intro_source" label="Warm intro source" defaultValue={investor.warm_intro_source || ""} /><Textarea name="thesis" label="Thesis" defaultValue={investor.thesis || ""} /><Textarea name="relevant_portfolio_companies" label="Relevant portfolio" defaultValue={investor.relevant_portfolio_companies || ""} /><Textarea name="notes" label="Notes" defaultValue={investor.notes || ""} /><Textarea name="concerns" label="Concerns" defaultValue={investor.concerns || ""} /><Textarea name="next_steps" label="Next steps" defaultValue={investor.next_steps || ""} /><div className="flex gap-3 pt-2"><button type="button" onClick={onCancel} className="flex-1 rounded-lg border border-slate-700 px-4 py-2 font-medium text-slate-300 hover:bg-slate-900">Cancel</button><button type="submit" className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500">Save Investor</button></div></form></div></div>;
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) { return <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none">{options.map((option) => <option key={option} value={option}>{option.replace(/_/g, " ")}</option>)}</select>; }
function Input(props: { name: string; label: string; defaultValue?: string; type?: string; required?: boolean }) { return <label className="block"><span className="mb-1 block text-sm text-slate-400">{props.label}</span><input name={props.name} required={props.required} type={props.type || "text"} defaultValue={props.defaultValue} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none" /></label>; }
function SelectField(props: { name: string; label: string; defaultValue: string; options: string[] }) { return <label className="block"><span className="mb-1 block text-sm text-slate-400">{props.label}</span><select name={props.name} defaultValue={props.defaultValue} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none">{props.options.map((option) => <option key={option} value={option}>{option.replace(/_/g, " ")}</option>)}</select></label>; }
function Textarea(props: { name: string; label: string; defaultValue: string }) { return <label className="block"><span className="mb-1 block text-sm text-slate-400">{props.label}</span><textarea name={props.name} rows={3} defaultValue={props.defaultValue} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none" /></label>; }
function Detail({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-slate-800 bg-slate-950 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-sm font-medium text-slate-100">{value}</p></div>; }
function TextareaInline({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="mb-5 block"><span className="mb-2 block text-xs uppercase text-slate-500">{label}</span><textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100 focus:border-blue-500 focus:outline-none" /></label>; }
function IconButton({ label, icon, onClick, danger = false }: { label: string; icon: React.ReactNode; onClick: () => void; danger?: boolean }) { return <button onClick={onClick} title={label} className={`rounded-md border p-2 ${danger ? "border-red-900 text-red-300 hover:bg-red-950" : "border-slate-700 text-slate-300 hover:bg-slate-800"}`}>{icon}</button>; }
