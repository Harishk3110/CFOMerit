"use client";

import { FormEvent, useMemo, useState } from "react";
import { Edit, Pin, Plus, Search, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import type { DecisionLog, FounderNote } from "@/lib/types";
import { useLocalRecords } from "@/lib/use-local-records";

const categories: FounderNote["category"][] = ["general", "outreach", "investor", "finance", "product", "strategy", "meeting", "personal reminder", "decision", "risk"];
const statuses: FounderNote["status"][] = ["open", "in_progress", "done", "archived"];
const priorities: FounderNote["priority"][] = ["low", "medium", "high", "critical"];

const emptyNote = (): FounderNote => {
  const now = new Date().toISOString();
  return {
    id: `note-${crypto.randomUUID()}`,
    title: "",
    content: "",
    category: "general",
    priority: "medium",
    status: "open",
    pinned: false,
    created_at: now,
    updated_at: now,
  };
};

const emptyDecision = (): DecisionLog => {
  const now = new Date().toISOString();
  return { id: `decision-${crypto.randomUUID()}`, decision: "", context: "", options_considered: "", final_choice: "", reason: "", owner: "", decision_date: new Date().toISOString().slice(0, 10), linked_track_id: "", linked_kpi_id: "", created_at: now, updated_at: now };
};

export default function NotesPage() {
  const store = useLocalRecords<FounderNote>("founder_notes", []);
  const decisionsStore = useLocalRecords<DecisionLog>("decision_log", []);
  const [editing, setEditing] = useState<FounderNote | null>(null);
  const [editingDecision, setEditingDecision] = useState<DecisionLog | null>(null);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(
    () =>
      store.records
        .filter((note) => {
          const haystack = `${note.title} ${note.content}`.toLowerCase();
          return (
            haystack.includes(query.toLowerCase()) &&
            (categoryFilter === "all" || note.category === categoryFilter) &&
            (statusFilter === "all" || note.status === statusFilter)
          );
        })
        .sort((a, b) => Number(b.pinned) - Number(a.pinned) || new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    [categoryFilter, query, statusFilter, store.records]
  );

  const saveNote = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    const data = new FormData(event.currentTarget);
    const record: FounderNote = {
      ...editing,
      title: String(data.get("title") || ""),
      content: String(data.get("content") || ""),
      category: String(data.get("category")) as FounderNote["category"],
      priority: String(data.get("priority")) as FounderNote["priority"],
      status: String(data.get("status")) as FounderNote["status"],
      linked_lead_id: String(data.get("linked_lead_id") || ""),
      linked_investor_id: String(data.get("linked_investor_id") || ""),
      linked_task_id: String(data.get("linked_task_id") || ""),
      linked_kpi_id: String(data.get("linked_kpi_id") || ""),
      linked_track_id: String(data.get("linked_track_id") || ""),
      pinned: data.get("pinned") === "on",
      updated_at: new Date().toISOString(),
    };
    if (store.records.some((note) => note.id === record.id)) {
      store.updateRecord(record.id, record);
    } else {
      store.addRecord(record);
    }
    setEditing(null);
  };

  const deleteNote = (note: FounderNote) => {
    if (window.confirm(`Delete note "${note.title}"?`)) store.deleteRecord(note.id);
  };

  const saveDecision = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingDecision) return;
    const data = new FormData(event.currentTarget);
    const record: DecisionLog = {
      ...editingDecision,
      decision: String(data.get("decision") || ""),
      context: String(data.get("context") || ""),
      options_considered: String(data.get("options_considered") || ""),
      final_choice: String(data.get("final_choice") || ""),
      reason: String(data.get("reason") || ""),
      owner: String(data.get("owner") || ""),
      decision_date: String(data.get("decision_date") || ""),
      linked_track_id: String(data.get("linked_track_id") || ""),
      linked_kpi_id: String(data.get("linked_kpi_id") || ""),
      updated_at: new Date().toISOString(),
    };
    if (decisionsStore.records.some((decision) => decision.id === record.id)) decisionsStore.updateRecord(record.id, record);
    else decisionsStore.addRecord(record);
    setEditingDecision(null);
  };

  const deleteDecision = (decision: DecisionLog) => {
    if (window.confirm(`Delete decision "${decision.decision}"?`)) decisionsStore.deleteRecord(decision.id);
  };

  return (
    <div className="max-w-7xl p-6 lg:p-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Notes</h1>
          <p className="mt-1 text-slate-400">Private founder scratchpad for strategy, meetings, and reminders.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setEditingDecision(emptyDecision())} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 font-medium text-slate-200 hover:bg-slate-900"><Plus size={18} /> Add Decision</button>
          <button onClick={() => setEditing(emptyNote())} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500">
            <Plus size={18} /> Add Note
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative min-w-72 flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search notes" className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 pl-10 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none" />
        </div>
        <Select value={categoryFilter} onChange={setCategoryFilter} options={["all", ...categories]} />
        <Select value={statusFilter} onChange={setStatusFilter} options={["all", ...statuses]} />
      </div>

      {store.records.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-800 bg-slate-900 p-10 text-center">
          <p className="text-lg font-semibold text-slate-100">No notes yet. Add your first founder note.</p>
          <button onClick={() => setEditing(emptyNote())} className="mt-5 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500">Add Note</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {filtered.map((note) => (
            <article key={note.id} className={`rounded-lg border bg-slate-900 p-5 ${note.pinned ? "border-blue-700" : "border-slate-800"}`}>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    {note.pinned && <Pin size={14} className="text-blue-400" />}
                    <h2 className="font-semibold text-white">{note.title}</h2>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{note.category}</p>
                </div>
                <StatusBadge status={note.status} />
              </div>
              <p className="min-h-20 whitespace-pre-wrap text-sm text-slate-300">{note.content}</p>
              <div className="mt-5 flex items-center justify-between">
                <StatusBadge status={note.priority} />
                <div className="flex gap-2">
                  <button onClick={() => store.updateRecord(note.id, { pinned: !note.pinned })} className="rounded-md border border-slate-700 p-2 text-slate-300 hover:bg-slate-800" aria-label={`Pin ${note.title}`}><Pin size={16} /></button>
                  <button onClick={() => setEditing(note)} className="rounded-md border border-slate-700 p-2 text-slate-300 hover:bg-slate-800" aria-label={`Edit ${note.title}`}><Edit size={16} /></button>
                  <button onClick={() => deleteNote(note)} className="rounded-md border border-red-900 p-2 text-red-300 hover:bg-red-950" aria-label={`Delete ${note.title}`}><Trash2 size={16} /></button>
                </div>
              </div>
            </article>
          ))}
          {!filtered.length && <p className="rounded-lg border border-dashed border-slate-800 bg-slate-900 p-8 text-center text-sm text-slate-500 lg:col-span-3">No notes match the current filters.</p>}
        </div>
      )}

      <section className="mt-8 rounded-lg border border-slate-800 bg-slate-900 p-5">
        <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold text-white">Decision Log</h2><button onClick={() => setEditingDecision(emptyDecision())} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">Add Decision</button></div>
        {decisionsStore.records.length ? (
          <div className="space-y-3">{decisionsStore.records.slice().sort((a, b) => b.decision_date.localeCompare(a.decision_date)).map((decision) => <div key={decision.id} className="rounded-lg border border-slate-800 bg-slate-950 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-medium text-slate-100">{decision.decision}</p><p className="mt-1 text-sm text-slate-400">{decision.final_choice}</p><p className="mt-1 text-xs text-slate-500">{decision.decision_date} - {decision.owner || "No owner"}</p></div><div className="flex gap-2"><button onClick={() => setEditingDecision(decision)} className="rounded-md border border-slate-700 p-2 text-slate-300 hover:bg-slate-800"><Edit size={16} /></button><button onClick={() => deleteDecision(decision)} className="rounded-md border border-red-900 p-2 text-red-300 hover:bg-red-950"><Trash2 size={16} /></button></div></div></div>)}</div>
        ) : <p className="rounded-lg border border-dashed border-slate-800 bg-slate-950 p-4 text-sm text-slate-500">No decisions logged yet. Add decisions when Merit changes direction.</p>}
      </section>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <h2 className="mb-5 text-xl font-bold text-white">{store.records.some((note) => note.id === editing.id) ? "Edit Note" : "Add Note"}</h2>
            <form onSubmit={saveNote} className="space-y-4">
              <Input name="title" label="Title" defaultValue={editing.title} required />
              <Textarea name="content" label="Content" defaultValue={editing.content} rows={8} />
              <div className="grid grid-cols-3 gap-3">
                <SelectField name="category" label="Category" defaultValue={editing.category} options={categories} />
                <SelectField name="status" label="Status" defaultValue={editing.status} options={statuses} />
                <SelectField name="priority" label="Priority" defaultValue={editing.priority} options={priorities} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Input name="linked_lead_id" label="Linked lead ID" defaultValue={editing.linked_lead_id || ""} />
                <Input name="linked_investor_id" label="Linked investor ID" defaultValue={editing.linked_investor_id || ""} />
                <Input name="linked_task_id" label="Linked task ID" defaultValue={editing.linked_task_id || ""} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input name="linked_kpi_id" label="Linked KPI ID" defaultValue={editing.linked_kpi_id || ""} />
                <Input name="linked_track_id" label="Linked track ID" defaultValue={editing.linked_track_id || ""} />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" name="pinned" defaultChecked={editing.pinned} className="h-4 w-4 accent-blue-600" /> Pin important note</label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditing(null)} className="flex-1 rounded-lg border border-slate-700 px-4 py-2 font-medium text-slate-300 hover:bg-slate-900">Cancel</button>
                <button type="submit" className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500">Save Note</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {editingDecision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <h2 className="mb-5 text-xl font-bold text-white">{decisionsStore.records.some((decision) => decision.id === editingDecision.id) ? "Edit Decision" : "Add Decision"}</h2>
            <form onSubmit={saveDecision} className="space-y-4">
              <Input name="decision" label="Decision" defaultValue={editingDecision.decision} required />
              <Textarea name="context" label="Context" defaultValue={editingDecision.context} />
              <Textarea name="options_considered" label="Options considered" defaultValue={editingDecision.options_considered} />
              <Input name="final_choice" label="Final choice" defaultValue={editingDecision.final_choice} />
              <Textarea name="reason" label="Reason" defaultValue={editingDecision.reason} />
              <div className="grid grid-cols-2 gap-3"><Input name="owner" label="Owner" defaultValue={editingDecision.owner} /><Input name="decision_date" label="Decision date" defaultValue={editingDecision.decision_date} /></div>
              <div className="grid grid-cols-2 gap-3"><Input name="linked_track_id" label="Linked track ID" defaultValue={editingDecision.linked_track_id || ""} /><Input name="linked_kpi_id" label="Linked KPI ID" defaultValue={editingDecision.linked_kpi_id || ""} /></div>
              <div className="flex gap-3 pt-2"><button type="button" onClick={() => setEditingDecision(null)} className="flex-1 rounded-lg border border-slate-700 px-4 py-2 font-medium text-slate-300 hover:bg-slate-900">Cancel</button><button type="submit" className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500">Save Decision</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none">{options.map((option) => <option key={option} value={option}>{option.replace(/_/g, " ")}</option>)}</select>;
}

function Input(props: { name: string; label: string; defaultValue?: string; required?: boolean }) {
  return <label className="block"><span className="mb-1 block text-sm text-slate-400">{props.label}</span><input name={props.name} required={props.required} defaultValue={props.defaultValue} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none" /></label>;
}

function SelectField(props: { name: string; label: string; defaultValue: string; options: string[] }) {
  return <label className="block"><span className="mb-1 block text-sm text-slate-400">{props.label}</span><select name={props.name} defaultValue={props.defaultValue} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none">{props.options.map((option) => <option key={option} value={option}>{option.replace(/_/g, " ")}</option>)}</select></label>;
}

function Textarea(props: { name: string; label: string; defaultValue: string; rows?: number }) {
  return <label className="block"><span className="mb-1 block text-sm text-slate-400">{props.label}</span><textarea name={props.name} rows={props.rows || 4} defaultValue={props.defaultValue} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none" /></label>;
}
