"use client";

import { FormEvent, useMemo, useState } from "react";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { riskSeverity } from "@/lib/command-center";
import type { OperatingTrack, Risk } from "@/lib/types";
import { useLocalRecords } from "@/lib/use-local-records";

const categories: Risk["category"][] = ["product", "market", "finance", "legal", "team", "technical", "fundraising", "growth", "execution"];
const statuses: Risk["status"][] = ["open", "monitoring", "mitigated", "closed"];

function emptyRisk(): Risk {
  const now = new Date().toISOString();
  return {
    id: `risk-${crypto.randomUUID()}`,
    title: "",
    description: "",
    category: "execution",
    probability: 1,
    impact: 1,
    severity_score: 1,
    mitigation: "",
    owner: "",
    status: "open",
    linked_track_id: "",
    created_at: now,
    updated_at: now,
  };
}

export default function RisksPage() {
  const risksStore = useLocalRecords<Risk>("risks", []);
  const tracks = useLocalRecords<OperatingTrack>("operating_tracks", []).records;
  const [editing, setEditing] = useState<Risk | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const filtered = useMemo(
    () =>
      risksStore.records
        .filter((risk) => `${risk.title} ${risk.description} ${risk.mitigation}`.toLowerCase().includes(query.toLowerCase()))
        .filter((risk) => statusFilter === "all" || risk.status === statusFilter)
        .sort((a, b) => b.severity_score - a.severity_score),
    [query, risksStore.records, statusFilter]
  );

  const saveRisk = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    const data = new FormData(event.currentTarget);
    const probability = Number(data.get("probability") || 1);
    const impact = Number(data.get("impact") || 1);
    const record: Risk = {
      ...editing,
      title: String(data.get("title") || ""),
      description: String(data.get("description") || ""),
      category: String(data.get("category")) as Risk["category"],
      probability,
      impact,
      severity_score: riskSeverity({ probability, impact }),
      mitigation: String(data.get("mitigation") || ""),
      owner: String(data.get("owner") || ""),
      status: String(data.get("status")) as Risk["status"],
      linked_track_id: String(data.get("linked_track_id") || ""),
      updated_at: new Date().toISOString(),
    };
    if (risksStore.records.some((risk) => risk.id === record.id)) risksStore.updateRecord(record.id, record);
    else risksStore.addRecord(record);
    setEditing(null);
  };

  const deleteRisk = (risk: Risk) => {
    if (window.confirm(`Delete risk "${risk.title}"?`)) risksStore.deleteRecord(risk.id);
  };

  return (
    <div className="max-w-7xl p-6 lg:p-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div><h1 className="text-3xl font-bold text-white">Risks / Blockers</h1><p className="mt-1 text-slate-400">Track operating risks, severity, mitigation, and owners.</p></div>
        <button onClick={() => setEditing(emptyRisk())} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500"><Plus size={18} /> Add Risk</button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Summary label="Open" value={risksStore.records.filter((risk) => risk.status === "open").length} />
        <Summary label="Monitoring" value={risksStore.records.filter((risk) => risk.status === "monitoring").length} />
        <Summary label="High severity" value={risksStore.records.filter((risk) => risk.severity_score >= 12).length} danger />
        <Summary label="Closed" value={risksStore.records.filter((risk) => risk.status === "closed").length} />
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative min-w-72 flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search risks" className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 pl-10 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none" /></div>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"><option value="all">All statuses</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select>
      </div>

      {risksStore.records.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-800 bg-slate-900 p-10 text-center"><p className="text-lg font-semibold text-slate-100">No risks tracked yet. Add your first blocker or operating risk.</p><button onClick={() => setEditing(emptyRisk())} className="mt-5 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500">Add Risk</button></div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
          <table className="w-full min-w-[900px]">
            <thead className="bg-slate-950"><tr>{["Risk", "Category", "Severity", "Status", "Owner", "Track", "Actions"].map((head) => <th key={head} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">{head}</th>)}</tr></thead>
            <tbody>
              {filtered.map((risk) => {
                const track = tracks.find((item) => item.id === risk.linked_track_id);
                return (
                  <tr key={risk.id} className="border-t border-slate-800 hover:bg-slate-800/60">
                    <td className="px-4 py-4"><p className="font-medium text-slate-100">{risk.title}</p><p className="mt-1 line-clamp-2 text-xs text-slate-500">{risk.description}</p></td>
                    <td className="px-4 py-4 text-sm text-slate-400">{risk.category}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-100">{risk.severity_score}</td>
                    <td className="px-4 py-4"><StatusBadge status={risk.status} /></td>
                    <td className="px-4 py-4 text-sm text-slate-400">{risk.owner}</td>
                    <td className="px-4 py-4 text-sm text-slate-400">{track?.name || "-"}</td>
                    <td className="px-4 py-4"><div className="flex gap-2"><button onClick={() => setEditing(risk)} className="rounded-md border border-slate-700 p-2 text-slate-300 hover:bg-slate-800"><Edit size={16} /></button><button onClick={() => deleteRisk(risk)} className="rounded-md border border-red-900 p-2 text-red-300 hover:bg-red-950"><Trash2 size={16} /></button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!filtered.length && <p className="p-8 text-center text-sm text-slate-500">No risks match the current filters.</p>}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <h2 className="mb-5 text-xl font-bold text-white">{risksStore.records.some((risk) => risk.id === editing.id) ? "Edit Risk" : "Add Risk"}</h2>
            <form onSubmit={saveRisk} className="space-y-4">
              <Input name="title" label="Title" defaultValue={editing.title} required />
              <Textarea name="description" label="Description" defaultValue={editing.description} />
              <div className="grid grid-cols-2 gap-3"><SelectField name="category" label="Category" defaultValue={editing.category} options={categories} /><SelectField name="status" label="Status" defaultValue={editing.status} options={statuses} /></div>
              <div className="grid grid-cols-3 gap-3"><Input name="probability" label="Probability (1-5)" type="number" defaultValue={String(editing.probability)} /><Input name="impact" label="Impact (1-5)" type="number" defaultValue={String(editing.impact)} /><Input name="owner" label="Owner" defaultValue={editing.owner} /></div>
              <label className="block"><span className="mb-1 block text-sm text-slate-400">Linked track</span><select name="linked_track_id" defaultValue={editing.linked_track_id || ""} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"><option value="">No track</option>{tracks.map((track) => <option key={track.id} value={track.id}>{track.name}</option>)}</select></label>
              <Textarea name="mitigation" label="Mitigation" defaultValue={editing.mitigation} />
              <div className="flex gap-3 pt-2"><button type="button" onClick={() => setEditing(null)} className="flex-1 rounded-lg border border-slate-700 px-4 py-2 font-medium text-slate-300 hover:bg-slate-900">Cancel</button><button type="submit" className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500">Save Risk</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Summary({ label, value, danger = false }: { label: string; value: number; danger?: boolean }) { return <div className={`rounded-lg border p-4 ${danger && value ? "border-red-900 bg-red-950/30" : "border-slate-800 bg-slate-900"}`}><p className="text-xs uppercase text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-white">{value}</p></div>; }
function Input(props: { name: string; label: string; defaultValue?: string; type?: string; required?: boolean }) { return <label className="block"><span className="mb-1 block text-sm text-slate-400">{props.label}</span><input name={props.name} required={props.required} type={props.type || "text"} defaultValue={props.defaultValue} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none" /></label>; }
function SelectField(props: { name: string; label: string; defaultValue: string; options: string[] }) { return <label className="block"><span className="mb-1 block text-sm text-slate-400">{props.label}</span><select name={props.name} defaultValue={props.defaultValue} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none">{props.options.map((option) => <option key={option} value={option}>{option.replace(/_/g, " ")}</option>)}</select></label>; }
function Textarea(props: { name: string; label: string; defaultValue: string }) { return <label className="block"><span className="mb-1 block text-sm text-slate-400">{props.label}</span><textarea name={props.name} rows={3} defaultValue={props.defaultValue} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none" /></label>; }
