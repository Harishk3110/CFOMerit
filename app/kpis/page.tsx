"use client";

import { FormEvent, useMemo, useState } from "react";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { autoKpiStatus, kpiProgress, meritKpiTemplates } from "@/lib/command-center";
import type { KPI, OperatingTrack } from "@/lib/types";
import { useLocalRecords } from "@/lib/use-local-records";

const categories: KPI["category"][] = ["users", "recruiters", "investors", "outreach", "revenue", "product", "partnerships", "finance", "execution", "other"];
const periods: KPI["period"][] = ["daily", "weekly", "monthly", "quarterly"];
const statuses: KPI["status"][] = ["on_track", "at_risk", "behind", "achieved", "paused"];
const priorities: KPI["priority"][] = ["low", "medium", "high", "critical"];
const priorityRank: Record<KPI["priority"], number> = { critical: 4, high: 3, medium: 2, low: 1 };

const emptyKpi = (): KPI => {
  const now = new Date().toISOString();
  return {
    id: `kpi-${crypto.randomUUID()}`,
    title: "",
    category: "execution",
    target_value: 0,
    current_value: 0,
    unit: "",
    period: "weekly",
    owner: "",
    status: "on_track",
    manual_status_override: false,
    priority: "medium",
    operating_track_id: "",
    progress_history: [],
    notes: "",
    created_at: now,
    updated_at: now,
  };
};

export default function KPIsPage() {
  const store = useLocalRecords<KPI>("kpis", []);
  const tracks = useLocalRecords<OperatingTrack>("operating_tracks", []).records;
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [editing, setEditing] = useState<KPI | null>(null);

  const filtered = useMemo(
    () =>
      store.records
        .filter((kpi) => {
          const haystack = `${kpi.title} ${kpi.notes || ""}`.toLowerCase();
          return (
            haystack.includes(query.toLowerCase()) &&
            (categoryFilter === "all" || kpi.category === categoryFilter) &&
            (statusFilter === "all" || kpi.status === statusFilter) &&
            (periodFilter === "all" || kpi.period === periodFilter)
          );
        })
        .sort((a, b) => priorityRank[b.priority] - priorityRank[a.priority]),
    [categoryFilter, periodFilter, query, statusFilter, store.records]
  );

  const saveKpi = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    const data = new FormData(event.currentTarget);
    const manual = data.get("manual_status_override") === "on";
    const baseRecord: KPI = {
      ...editing,
      title: String(data.get("title") || ""),
      category: String(data.get("category")) as KPI["category"],
      target_value: Number(data.get("target_value") || 0),
      current_value: Number(data.get("current_value") || 0),
      unit: String(data.get("unit") || ""),
      period: String(data.get("period")) as KPI["period"],
      owner: String(data.get("owner") || ""),
      status: String(data.get("status")) as KPI["status"],
      manual_status_override: manual,
      priority: String(data.get("priority")) as KPI["priority"],
      operating_track_id: String(data.get("operating_track_id") || ""),
      progress_history: [...(editing.progress_history || []), { date: new Date().toISOString().slice(0, 10), value: Number(data.get("current_value") || 0) }].slice(-12),
      notes: String(data.get("notes") || ""),
      updated_at: new Date().toISOString(),
    };
    const record: KPI = { ...baseRecord, status: autoKpiStatus(baseRecord) };
    if (store.records.some((kpi) => kpi.id === record.id)) {
      store.updateRecord(record.id, record);
    } else {
      store.addRecord(record);
    }
    setEditing(null);
  };

  const deleteKpi = (kpi: KPI) => {
    if (window.confirm(`Delete KPI "${kpi.title}"?`)) store.deleteRecord(kpi.id);
  };

  const loadTemplates = () => {
    const now = new Date().toISOString();
    const existing = new Set(store.records.map((kpi) => kpi.title));
    const records = meritKpiTemplates
      .filter((template) => !existing.has(template.title))
      .map<KPI>((template) => ({
        id: `kpi-${crypto.randomUUID()}`,
        title: template.title,
        category: template.category,
        target_value: template.target_value,
        current_value: 0,
        unit: template.unit,
        period: template.period as KPI["period"],
        owner: "Founder",
        status: "behind",
        manual_status_override: false,
        priority: template.priority as KPI["priority"],
        operating_track_id: tracks.find((track) => track.name === template.trackName)?.id || "",
        progress_history: [],
        notes: template.notes,
        created_at: now,
        updated_at: now,
      }));
    store.setRecords((current) => [...records, ...current]);
  };

  return (
    <div className="max-w-7xl p-6 lg:p-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">KPIs</h1>
          <p className="mt-1 text-slate-400">Founder operating metrics for Merit.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={loadTemplates} className="rounded-lg border border-slate-700 px-4 py-2 font-medium text-slate-200 hover:bg-slate-900">Load Merit KPI Templates</button>
          <button onClick={() => setEditing(emptyKpi())} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500">
            <Plus size={18} /> Add KPI
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-5">
        <Summary label="Total KPIs" value={store.records.length} />
        <Summary label="On track" value={store.records.filter((kpi) => kpi.status === "on_track").length} />
        <Summary label="At risk" value={store.records.filter((kpi) => kpi.status === "at_risk").length} warning />
        <Summary label="Behind" value={store.records.filter((kpi) => kpi.status === "behind").length} danger />
        <Summary label="Critical" value={store.records.filter((kpi) => kpi.priority === "critical").length} danger />
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative min-w-72 flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search KPI title or notes" className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 pl-10 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none" />
        </div>
        <Select value={categoryFilter} onChange={setCategoryFilter} options={["all", ...categories]} />
        <Select value={statusFilter} onChange={setStatusFilter} options={["all", ...statuses]} />
        <Select value={periodFilter} onChange={setPeriodFilter} options={["all", ...periods]} />
      </div>

      {store.records.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-800 bg-slate-900 p-10 text-center">
          <p className="text-lg font-semibold text-slate-100">No KPIs tracked yet. Add your first KPI.</p>
          <div className="mt-5 flex justify-center gap-3">
            <button onClick={loadTemplates} className="rounded-lg border border-slate-700 px-4 py-2 font-medium text-slate-200 hover:bg-slate-800">Load Merit KPI Templates</button>
            <button onClick={() => setEditing(emptyKpi())} className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500">Add KPI</button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {filtered.slice(0, 6).map((kpi) => (
              <div key={kpi.id} className={`rounded-lg border bg-slate-900 p-5 ${["behind", "at_risk"].includes(kpi.status) ? "border-amber-800" : "border-slate-800"}`}>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-white">{kpi.title}</h2>
                    <p className="mt-1 text-xs text-slate-500">{kpi.category} - {kpi.period}</p>
                    <p className="mt-1 text-xs text-blue-400">{tracks.find((track) => track.id === kpi.operating_track_id)?.name || "No track"}</p>
                  </div>
                  <StatusBadge status={kpi.status} />
                </div>
                <div className="mb-2 flex justify-between text-sm"><span className="text-slate-400">Progress</span><span className="text-slate-100">{kpi.current_value}/{kpi.target_value} {kpi.unit}</span></div>
                <div className="h-2 rounded-full bg-slate-800"><div className="h-2 rounded-full bg-blue-500" style={{ width: `${kpiProgress(kpi)}%` }} /></div>
                <div className="mt-4 flex justify-between text-xs text-slate-500"><span>{Math.round(kpiProgress(kpi))}%</span><span>{kpi.owner || "No owner"}</span></div>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
            <table className="w-full min-w-[900px]">
              <thead className="bg-slate-950">
                <tr>{["Title", "Track", "Category", "Period", "Progress", "Status", "Priority", "Owner", "Actions"].map((head) => <th key={head} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">{head}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.map((kpi) => (
                  <tr key={kpi.id} className="border-t border-slate-800 hover:bg-slate-800/60">
                    <td className="px-4 py-4 font-medium text-slate-100">{kpi.title}</td>
                    <td className="px-4 py-4 text-sm text-slate-400">{tracks.find((track) => track.id === kpi.operating_track_id)?.name || "-"}</td>
                    <td className="px-4 py-4 text-sm text-slate-400">{kpi.category}</td>
                    <td className="px-4 py-4 text-sm text-slate-400">{kpi.period}</td>
                    <td className="px-4 py-4 text-sm text-slate-300">{kpi.current_value}/{kpi.target_value} {kpi.unit}</td>
                    <td className="px-4 py-4"><StatusBadge status={kpi.status} /></td>
                    <td className="px-4 py-4"><StatusBadge status={kpi.priority} /></td>
                    <td className="px-4 py-4 text-sm text-slate-400">{kpi.owner}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => setEditing(kpi)} className="rounded-md border border-slate-700 p-2 text-slate-300 hover:bg-slate-800" aria-label={`Edit ${kpi.title}`}><Edit size={16} /></button>
                        <button onClick={() => deleteKpi(kpi)} className="rounded-md border border-red-900 p-2 text-red-300 hover:bg-red-950" aria-label={`Delete ${kpi.title}`}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filtered.length && <p className="p-8 text-center text-sm text-slate-500">No KPIs match the current filters.</p>}
          </div>
        </>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <h2 className="mb-5 text-xl font-bold text-white">{store.records.some((kpi) => kpi.id === editing.id) ? "Edit KPI" : "Add KPI"}</h2>
            <form onSubmit={saveKpi} className="space-y-4">
              <Input name="title" label="Title" defaultValue={editing.title} required />
              <div className="grid grid-cols-2 gap-3">
                <SelectField name="category" label="Category" defaultValue={editing.category} options={categories} />
                <SelectField name="period" label="Period" defaultValue={editing.period} options={periods} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Input name="current_value" label="Current" type="number" defaultValue={editing.current_value} />
                <Input name="target_value" label="Target" type="number" defaultValue={editing.target_value} />
                <Input name="unit" label="Unit" defaultValue={editing.unit} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <SelectField name="status" label="Status" defaultValue={editing.status} options={statuses} />
                <SelectField name="priority" label="Priority" defaultValue={editing.priority} options={priorities} />
                <Input name="owner" label="Owner" defaultValue={editing.owner} />
              </div>
              <label className="block">
                <span className="mb-1 block text-sm text-slate-400">Linked operating track</span>
                <select name="operating_track_id" defaultValue={editing.operating_track_id || ""} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none">
                  <option value="">No track</option>
                  {tracks.map((track) => <option key={track.id} value={track.id}>{track.name}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" name="manual_status_override" defaultChecked={editing.manual_status_override || editing.status === "paused"} className="h-4 w-4 accent-blue-600" />
                Manually override status
              </label>
              <Textarea name="notes" label="Notes" defaultValue={editing.notes || ""} />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditing(null)} className="flex-1 rounded-lg border border-slate-700 px-4 py-2 font-medium text-slate-300 hover:bg-slate-900">Cancel</button>
                <button type="submit" className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500">Save KPI</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Summary({ label, value, warning = false, danger = false }: { label: string; value: number; warning?: boolean; danger?: boolean }) {
  return <div className={`rounded-lg border p-4 ${danger ? "border-red-900 bg-red-950/30" : warning ? "border-amber-900 bg-amber-950/30" : "border-slate-800 bg-slate-900"}`}><p className="text-xs uppercase text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-white">{value}</p></div>;
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none">{options.map((option) => <option key={option} value={option}>{option.replace(/_/g, " ")}</option>)}</select>;
}

function Input(props: { name: string; label: string; defaultValue?: string | number; type?: string; required?: boolean }) {
  return <label className="block"><span className="mb-1 block text-sm text-slate-400">{props.label}</span><input name={props.name} required={props.required} type={props.type || "text"} defaultValue={props.defaultValue} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none" /></label>;
}

function SelectField(props: { name: string; label: string; defaultValue: string; options: string[] }) {
  return <label className="block"><span className="mb-1 block text-sm text-slate-400">{props.label}</span><select name={props.name} defaultValue={props.defaultValue} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none">{props.options.map((option) => <option key={option} value={option}>{option.replace(/_/g, " ")}</option>)}</select></label>;
}

function Textarea(props: { name: string; label: string; defaultValue: string }) {
  return <label className="block"><span className="mb-1 block text-sm text-slate-400">{props.label}</span><textarea name={props.name} rows={4} defaultValue={props.defaultValue} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none" /></label>;
}
