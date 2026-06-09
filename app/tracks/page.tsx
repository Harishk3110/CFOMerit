"use client";

import { FormEvent, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { operatingTrackTemplates, trackProgress } from "@/lib/command-center";
import type { FounderNote, KPI, OperatingTrack, Task } from "@/lib/types";
import { useLocalRecords } from "@/lib/use-local-records";

const statuses: OperatingTrack["status"][] = ["active", "at_risk", "blocked", "paused", "completed"];
const priorities: OperatingTrack["priority"][] = ["low", "medium", "high", "critical"];

function emptyTrack(): OperatingTrack {
  const now = new Date().toISOString();
  return {
    id: `track-${crypto.randomUUID()}`,
    name: "",
    description: "",
    owner: "",
    status: "active",
    priority: "medium",
    target_metric: 0,
    current_metric: 0,
    deadline: "",
    notes: "",
    created_at: now,
    updated_at: now,
  };
}

export default function TracksPage() {
  const tracksStore = useLocalRecords<OperatingTrack>("operating_tracks", []);
  const kpis = useLocalRecords<KPI>("kpis", []).records;
  const tasks = useLocalRecords<Task>("tasks", []).records;
  const notes = useLocalRecords<FounderNote>("founder_notes", []).records;
  const [editing, setEditing] = useState<OperatingTrack | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState("");

  const filtered = useMemo(
    () =>
      tracksStore.records
        .filter((track) => `${track.name} ${track.description} ${track.notes}`.toLowerCase().includes(query.toLowerCase()))
        .filter((track) => statusFilter === "all" || track.status === statusFilter)
        .sort((a, b) => trackProgress(b) - trackProgress(a)),
    [query, statusFilter, tracksStore.records]
  );
  const selected = tracksStore.records.find((track) => track.id === selectedId) || filtered[0];

  const loadTemplates = () => {
    const now = new Date().toISOString();
    const existing = new Set(tracksStore.records.map((track) => track.name));
    const records = operatingTrackTemplates
      .filter((template) => !existing.has(template.name))
      .map<OperatingTrack>((template) => ({
        id: `track-${crypto.randomUUID()}`,
        name: template.name,
        description: template.description,
        owner: "Founder",
        status: "active",
        priority: template.priority,
        target_metric: template.target_metric,
        current_metric: 0,
        deadline: "",
        notes: "Loaded from Merit operating track templates. Edit owner, target, and deadline.",
        created_at: now,
        updated_at: now,
      }));
    tracksStore.setRecords((current) => [...records, ...current]);
  };

  const saveTrack = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    const data = new FormData(event.currentTarget);
    const record: OperatingTrack = {
      ...editing,
      name: String(data.get("name") || ""),
      description: String(data.get("description") || ""),
      owner: String(data.get("owner") || ""),
      status: String(data.get("status")) as OperatingTrack["status"],
      priority: String(data.get("priority")) as OperatingTrack["priority"],
      target_metric: Number(data.get("target_metric") || 0),
      current_metric: Number(data.get("current_metric") || 0),
      deadline: String(data.get("deadline") || ""),
      notes: String(data.get("notes") || ""),
      updated_at: new Date().toISOString(),
    };
    if (tracksStore.records.some((track) => track.id === record.id)) tracksStore.updateRecord(record.id, record);
    else tracksStore.addRecord(record);
    setSelectedId(record.id);
    setEditing(null);
  };

  const deleteTrack = (track: OperatingTrack) => {
    if (window.confirm(`Delete operating track "${track.name}"?`)) tracksStore.deleteRecord(track.id);
  };

  return (
    <div className="max-w-7xl p-6 lg:p-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Operating Tracks</h1>
          <p className="mt-1 text-slate-400">Merit workstreams across growth, recruiter demand, product, finance, and founder ops.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={loadTemplates} className="rounded-lg border border-slate-700 px-4 py-2 font-medium text-slate-200 hover:bg-slate-900">Load Merit Track Templates</button>
          <button onClick={() => setEditing(emptyTrack())} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500"><Plus size={18} /> Add Track</button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative min-w-72 flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tracks" className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 pl-10 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none" />
        </div>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100">
          <option value="all">All statuses</option>
          {statuses.map((status) => <option key={status}>{status}</option>)}
        </select>
      </div>

      {tracksStore.records.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-800 bg-slate-900 p-10 text-center">
          <p className="text-lg font-semibold text-slate-100">No operating tracks yet. Add a track or load Merit track templates.</p>
          <button onClick={loadTemplates} className="mt-5 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500">Load Merit Track Templates</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <section className="grid gap-4 xl:col-span-2">
            {filtered.map((track) => {
              const progress = Math.round(trackProgress(track));
              return (
                <button key={track.id} onClick={() => setSelectedId(track.id)} className={`rounded-lg border bg-slate-900 p-5 text-left hover:border-blue-700 ${selected?.id === track.id ? "border-blue-700" : "border-slate-800"}`}>
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-white">{track.name}</h2>
                      <p className="mt-1 text-sm text-slate-400">{track.description}</p>
                    </div>
                    <StatusBadge status={track.status} />
                  </div>
                  <div className="mb-2 flex justify-between text-sm text-slate-400"><span>{track.current_metric}/{track.target_metric}</span><span>{progress}%</span></div>
                  <div className="h-2 rounded-full bg-slate-800"><div className="h-2 rounded-full bg-blue-500" style={{ width: `${progress}%` }} /></div>
                  <div className="mt-4 flex justify-between text-xs text-slate-500"><span>{track.owner || "No owner"}</span><span>{track.deadline || "No deadline"}</span></div>
                </button>
              );
            })}
          </section>
          <aside className="rounded-lg border border-slate-800 bg-slate-900 p-5">
            {selected ? (
              <>
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div><h2 className="text-xl font-bold text-white">{selected.name}</h2><p className="mt-1 text-sm text-slate-400">{selected.owner || "No owner"}</p></div>
                  <StatusBadge status={selected.priority} />
                </div>
                <div className="mb-5 grid grid-cols-2 gap-3 text-sm">
                  <Detail label="Linked KPIs" value={kpis.filter((kpi) => kpi.operating_track_id === selected.id).length.toString()} />
                  <Detail label="Linked Tasks" value={tasks.filter((task) => task.operating_track_id === selected.id).length.toString()} />
                  <Detail label="Linked Notes" value={notes.filter((note) => note.linked_track_id === selected.id).length.toString()} />
                  <Detail label="Health" value={`${Math.round(trackProgress(selected))}%`} />
                </div>
                <p className="mb-5 whitespace-pre-wrap text-sm text-slate-300">{selected.notes || "No notes yet."}</p>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setEditing(selected)} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">Edit Track</button>
                  <button onClick={() => deleteTrack(selected)} className="rounded-lg border border-red-900 px-3 py-2 text-sm text-red-300 hover:bg-red-950">Delete Track</button>
                </div>
              </>
            ) : <p className="text-sm text-slate-500">Select a track.</p>}
          </aside>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <h2 className="mb-5 text-xl font-bold text-white">{tracksStore.records.some((track) => track.id === editing.id) ? "Edit Track" : "Add Track"}</h2>
            <form onSubmit={saveTrack} className="space-y-4">
              <Input name="name" label="Name" defaultValue={editing.name} required />
              <Textarea name="description" label="Description" defaultValue={editing.description} />
              <div className="grid grid-cols-2 gap-3"><Input name="owner" label="Owner" defaultValue={editing.owner} /><Input name="deadline" label="Deadline" type="date" defaultValue={editing.deadline || ""} /></div>
              <div className="grid grid-cols-2 gap-3"><SelectField name="status" label="Status" defaultValue={editing.status} options={statuses} /><SelectField name="priority" label="Priority" defaultValue={editing.priority} options={priorities} /></div>
              <div className="grid grid-cols-2 gap-3"><Input name="current_metric" label="Current metric" type="number" defaultValue={String(editing.current_metric)} /><Input name="target_metric" label="Target metric" type="number" defaultValue={String(editing.target_metric)} /></div>
              <Textarea name="notes" label="Notes" defaultValue={editing.notes || ""} />
              <div className="flex gap-3 pt-2"><button type="button" onClick={() => setEditing(null)} className="flex-1 rounded-lg border border-slate-700 px-4 py-2 font-medium text-slate-300 hover:bg-slate-900">Cancel</button><button type="submit" className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500">Save Track</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-slate-800 bg-slate-950 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-sm font-medium text-slate-100">{value}</p></div>; }
function Input(props: { name: string; label: string; defaultValue?: string; type?: string; required?: boolean }) { return <label className="block"><span className="mb-1 block text-sm text-slate-400">{props.label}</span><input name={props.name} required={props.required} type={props.type || "text"} defaultValue={props.defaultValue} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none" /></label>; }
function SelectField(props: { name: string; label: string; defaultValue: string; options: string[] }) { return <label className="block"><span className="mb-1 block text-sm text-slate-400">{props.label}</span><select name={props.name} defaultValue={props.defaultValue} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none">{props.options.map((option) => <option key={option} value={option}>{option.replace(/_/g, " ")}</option>)}</select></label>; }
function Textarea(props: { name: string; label: string; defaultValue: string }) { return <label className="block"><span className="mb-1 block text-sm text-slate-400">{props.label}</span><textarea name={props.name} rows={3} defaultValue={props.defaultValue} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none" /></label>; }
