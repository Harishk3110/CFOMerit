"use client";

import { FormEvent, useMemo, useState } from "react";
import { Edit, Eye, Plus, Search, Sparkles, Trash2 } from "lucide-react";
import { CopyButton } from "@/components/CopyButton";
import { StatusBadge } from "@/components/StatusBadge";
import { calculateRecruiterScore, generatedLinkedInMessages } from "@/lib/command-center";
import type { OutreachLead, OutreachMessage } from "@/lib/types";
import { useLocalRecords } from "@/lib/use-local-records";

const leadTypes: OutreachLead["lead_type"][] = ["recruiter", "founder", "HR", "talent acquisition", "investor", "school partner", "mentor", "accelerator", "customer", "other"];
const statuses: OutreachLead["status"][] = ["new", "researched", "message_generated", "ready_to_send", "connection_sent", "connected", "first_dm_sent", "follow_up_1_sent", "follow_up_2_sent", "replied", "meeting_booked", "converted", "not_interested", "dead"];

const emptyLead = (): OutreachLead => {
  const now = new Date().toISOString();
  return {
    id: `lead-${crypto.randomUUID()}`,
    first_name: "",
    last_name: "",
    linkedin_url: "",
    company_name: "",
    role_title: "",
    industry: "",
    location: "",
    lead_type: "recruiter",
    source: "",
    priority_score: 0,
    personalization_notes: "",
    profile_summary: "",
    pain_angle: "",
    merit_angle: "",
    status: "new",
    owner: "",
    channel: "LinkedIn",
    message_sent_count: 0,
    reply_count: 0,
    last_reply_summary: "",
    meeting_outcome: "",
    next_action: "",
    next_follow_up_at: "",
    created_at: now,
    updated_at: now,
    created_by: "",
  };
};

export default function OutreachPage() {
  const leadsStore = useLocalRecords<OutreachLead>("outreach_leads", []);
  const messagesStore = useLocalRecords<OutreachMessage>("outreach_messages", []);
  const [selectedId, setSelectedId] = useState("");
  const [editing, setEditing] = useState<OutreachLead | null>(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [drafting, setDrafting] = useState(false);

  const selected = leadsStore.records.find((lead) => lead.id === selectedId) || leadsStore.records[0];
  const selectedMessages = messagesStore.records.filter((message) => message.lead_id === selected?.id);
  const filtered = useMemo(
    () =>
      leadsStore.records.filter((lead) => {
        const haystack = `${lead.first_name} ${lead.last_name} ${lead.company_name} ${lead.role_title} ${lead.personalization_notes || ""}`.toLowerCase();
        return haystack.includes(query.toLowerCase()) && (typeFilter === "all" || lead.lead_type === typeFilter) && (statusFilter === "all" || lead.status === statusFilter);
      }),
    [leadsStore.records, query, statusFilter, typeFilter]
  );

  const saveLead = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    const data = new FormData(event.currentTarget);
    const partial = {
      first_name: String(data.get("first_name") || ""),
      last_name: String(data.get("last_name") || ""),
      linkedin_url: String(data.get("linkedin_url") || ""),
      company_name: String(data.get("company_name") || ""),
      role_title: String(data.get("role_title") || ""),
      industry: String(data.get("industry") || ""),
      location: String(data.get("location") || ""),
      lead_type: String(data.get("lead_type")) as OutreachLead["lead_type"],
      source: String(data.get("source") || ""),
      personalization_notes: String(data.get("personalization_notes") || ""),
      profile_summary: String(data.get("profile_summary") || ""),
      pain_angle: String(data.get("pain_angle") || ""),
      merit_angle: String(data.get("merit_angle") || ""),
      status: String(data.get("status")) as OutreachLead["status"],
      owner: String(data.get("owner") || ""),
      channel: String(data.get("channel") || "LinkedIn") as OutreachLead["channel"],
      message_sent_count: Number(data.get("message_sent_count") || 0),
      reply_count: Number(data.get("reply_count") || 0),
      last_reply_summary: String(data.get("last_reply_summary") || ""),
      meeting_outcome: String(data.get("meeting_outcome") || ""),
      next_action: String(data.get("next_action") || ""),
      next_follow_up_at: String(data.get("next_follow_up_at") || ""),
    };
    const record: OutreachLead = {
      ...editing,
      ...partial,
      priority_score: calculateRecruiterScore(partial),
      updated_at: new Date().toISOString(),
    };
    if (leadsStore.records.some((lead) => lead.id === record.id)) leadsStore.updateRecord(record.id, record);
    else leadsStore.addRecord(record);
    setSelectedId(record.id);
    setEditing(null);
  };

  const deleteLead = (lead: OutreachLead) => {
    if (!window.confirm(`Delete ${lead.first_name} ${lead.last_name}?`)) return;
    leadsStore.deleteRecord(lead.id);
    messagesStore.setRecords((records) => records.filter((message) => message.lead_id !== lead.id));
    if (selectedId === lead.id) setSelectedId("");
  };

  const generateMessages = async () => {
    if (!selected) return;
    setDrafting(true);
    let generated = generatedLinkedInMessages(selected);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "linkedin_outreach",
          input: { leadType: selected.lead_type, name: `${selected.first_name} ${selected.last_name}`, role: selected.role_title, company: selected.company_name, profileSummary: selected.profile_summary, personalizationNotes: selected.personalization_notes },
        }),
      });
      if (response.ok) {
        const data = await response.json();
        generated = {
          connection_request: data.connectionRequest || generated.connection_request,
          first_dm: data.firstDM || generated.first_dm,
          follow_up_1: data.followUp1 || generated.follow_up_1,
          follow_up_2: data.followUp2 || generated.follow_up_2,
          breakup: data.breakupMessage || generated.breakup,
          email: data.emailVersion || generated.email,
        };
      }
    } catch {}
    const now = new Date().toISOString();
    const records: OutreachMessage[] = Object.entries(generated).map(([type, text]) => ({
      id: `msg-${crypto.randomUUID()}`,
      lead_id: selected.id,
      message_type: type === "breakup" ? "breakup" : type === "email" ? "email" : (type as OutreachMessage["message_type"]),
      message_text: text,
      status: "ready",
      created_at: now,
      updated_at: now,
      created_by: "",
    }));
    messagesStore.setRecords((current) => [...records, ...current.filter((message) => message.lead_id !== selected.id)]);
    leadsStore.updateRecord(selected.id, { status: "message_generated" });
    setDrafting(false);
  };

  const markSent = () => {
    if (!selected) return;
    leadsStore.updateRecord(selected.id, { status: selected.status === "connection_sent" ? "first_dm_sent" : "connection_sent", last_contacted_at: new Date().toISOString().slice(0, 10) });
  };

  return (
    <div className="max-w-7xl p-6 lg:p-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div><h1 className="text-3xl font-bold text-white">Outreach</h1><p className="mt-1 text-slate-400">Manual outreach tracking. No LinkedIn automation or scraping.</p></div>
        <button onClick={() => setEditing(emptyLead())} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500"><Plus size={18} /> Add Lead</button>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative min-w-72 flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, company, role, notes" className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 pl-10 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none" /></div>
        <Select value={typeFilter} onChange={setTypeFilter} options={["all", ...leadTypes]} />
        <Select value={statusFilter} onChange={setStatusFilter} options={["all", ...statuses]} />
      </div>

      {leadsStore.records.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-6">
          <Metric label="Total leads" value={leadsStore.records.length} />
          <Metric label="Contacted" value={leadsStore.records.filter((lead) => lead.last_contacted_at || (lead.message_sent_count || 0) > 0).length} />
          <Metric label="Replies" value={leadsStore.records.filter((lead) => lead.status === "replied" || (lead.reply_count || 0) > 0).length} />
          <Metric label="Meetings" value={leadsStore.records.filter((lead) => lead.status === "meeting_booked").length} />
          <Metric label="Overdue follow-ups" value={leadsStore.records.filter((lead) => lead.next_follow_up_at && lead.next_follow_up_at < new Date().toISOString().slice(0, 10)).length} />
          <Metric label="High priority" value={leadsStore.records.filter((lead) => lead.priority_score >= 80).length} />
        </div>
      )}

      {leadsStore.records.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-800 bg-slate-900 p-10 text-center"><p className="text-lg font-semibold text-slate-100">No outreach leads yet. Add your first recruiter, investor, school partner, or mentor.</p><button onClick={() => setEditing(emptyLead())} className="mt-5 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500">Add Lead</button></div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <section className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900 xl:col-span-2">
            <table className="w-full min-w-[980px]">
              <thead className="bg-slate-950"><tr>{["Name", "Company", "Role", "Type", "Status", "Score", "Next follow-up", "Owner", "Actions"].map((head) => <th key={head} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">{head}</th>)}</tr></thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr key={lead.id} className={`border-t border-slate-800 hover:bg-slate-800/60 ${selected?.id === lead.id ? "bg-blue-950/30" : ""}`}>
                    <td className="px-4 py-4 font-medium text-slate-100">{lead.first_name} {lead.last_name}</td>
                    <td className="px-4 py-4 text-sm text-slate-400">{lead.company_name}</td>
                    <td className="px-4 py-4 text-sm text-slate-400">{lead.role_title}</td>
                    <td className="px-4 py-4 text-sm text-slate-400">{lead.lead_type}</td>
                    <td className="px-4 py-4"><StatusBadge status={lead.status} /></td>
                    <td className="px-4 py-4 text-sm text-slate-300">{lead.priority_score}</td>
                    <td className="px-4 py-4 text-sm text-slate-400">{lead.next_follow_up_at || "-"}</td>
                    <td className="px-4 py-4 text-sm text-slate-400">{lead.owner}</td>
                    <td className="px-4 py-4"><div className="flex gap-2"><IconButton label="View" onClick={() => setSelectedId(lead.id)} icon={<Eye size={16} />} /><IconButton label="Edit" onClick={() => setEditing(lead)} icon={<Edit size={16} />} /><IconButton danger label="Delete" onClick={() => deleteLead(lead)} icon={<Trash2 size={16} />} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filtered.length && <p className="p-8 text-center text-sm text-slate-500">No leads match the current filters.</p>}
          </section>

          <aside className="rounded-lg border border-slate-800 bg-slate-900 p-5">
            {selected ? (
              <>
                <div className="mb-5 flex items-start justify-between gap-3"><div><h2 className="text-xl font-bold text-white">{selected.first_name} {selected.last_name}</h2><p className="mt-1 text-sm text-slate-400">{selected.role_title} at {selected.company_name}</p></div><StatusBadge status={selected.status} /></div>
                <div className="mb-5 grid grid-cols-2 gap-3 text-sm"><Detail label="Score" value={`${selected.priority_score}/100`} /><Detail label="Channel" value={selected.channel || "-"} /><Detail label="Follow-up" value={selected.next_follow_up_at || "-"} /><Detail label="Next action" value={selected.next_action || "-"} /></div>
                <TextareaInline label="Lead note" value={selected.personalization_notes || ""} onChange={(value) => leadsStore.updateRecord(selected.id, { personalization_notes: value })} />
                <div className="mb-5 grid grid-cols-2 gap-3"><button onClick={() => setEditing(selected)} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">Edit Lead</button><button onClick={() => deleteLead(selected)} className="rounded-lg border border-red-900 px-3 py-2 text-sm text-red-300 hover:bg-red-950">Delete Lead</button></div>
                <div className="mb-5 grid grid-cols-2 gap-3"><button onClick={generateMessages} disabled={drafting} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"><Sparkles size={16} /> {drafting ? "Generating" : "Generate"}</button><button onClick={markSent} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">Mark Contacted</button><button onClick={() => leadsStore.updateRecord(selected.id, { status: "replied", reply_count: (selected.reply_count || 0) + 1 })} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">Mark Replied</button><button onClick={() => leadsStore.updateRecord(selected.id, { status: "meeting_booked" })} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">Meeting Booked</button><button onClick={() => leadsStore.updateRecord(selected.id, { status: "dead" })} className="rounded-lg border border-red-900 px-3 py-2 text-sm text-red-300 hover:bg-red-950">Mark Dead</button></div>
                <label className="mb-2 block text-xs uppercase text-slate-500">Next follow-up</label><input type="date" value={selected.next_follow_up_at?.slice(0, 10) || ""} onChange={(event) => leadsStore.updateRecord(selected.id, { next_follow_up_at: event.target.value })} className="mb-5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100" />
                <div className="space-y-3">{selectedMessages.length ? selectedMessages.map((message) => <MessageEditor key={message.id} message={message} update={(updates) => messagesStore.updateRecord(message.id, updates)} remove={() => window.confirm("Delete this draft?") && messagesStore.deleteRecord(message.id)} />) : <p className="rounded-lg border border-dashed border-slate-800 bg-slate-950 p-4 text-sm text-slate-500">No message drafts yet. Generate drafts, edit them, then use Copy Message.</p>}</div>
              </>
            ) : <p className="text-sm text-slate-500">Select a lead to view details.</p>}
          </aside>
        </div>
      )}

      {editing && <LeadModal lead={editing} exists={leadsStore.records.some((lead) => lead.id === editing.id)} onCancel={() => setEditing(null)} onSave={saveLead} />}
    </div>
  );
}

function MessageEditor({ message, update, remove }: { message: OutreachMessage; update: (updates: Partial<OutreachMessage>) => void; remove: () => void }) {
  return <div className="rounded-lg border border-slate-800 bg-slate-950 p-3"><div className="mb-2 flex items-center justify-between"><p className="text-xs font-semibold uppercase text-slate-500">{message.message_type.replace(/_/g, " ")}</p><button onClick={remove} className="text-xs text-red-300 hover:text-red-200">Delete</button></div><textarea value={message.message_text} onChange={(event) => update({ message_text: event.target.value })} rows={4} className="mb-3 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-slate-100 focus:border-blue-500 focus:outline-none" /><CopyButton text={message.message_text} label="Copy Message" /></div>;
}

function LeadModal({ lead, exists, onCancel, onSave }: { lead: OutreachLead; exists: boolean; onCancel: () => void; onSave: (event: FormEvent<HTMLFormElement>) => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"><div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-6 shadow-2xl"><h2 className="mb-5 text-xl font-bold text-white">{exists ? "Edit Lead" : "Add Lead"}</h2><form onSubmit={onSave} className="space-y-4"><div className="grid grid-cols-2 gap-3"><Input name="first_name" label="First name" defaultValue={lead.first_name} required /><Input name="last_name" label="Last name" defaultValue={lead.last_name} required /></div><div className="grid grid-cols-2 gap-3"><Input name="company_name" label="Company" defaultValue={lead.company_name} /><Input name="role_title" label="Role" defaultValue={lead.role_title} /></div><div className="grid grid-cols-4 gap-3"><SelectField name="lead_type" label="Type" defaultValue={lead.lead_type} options={leadTypes} /><SelectField name="status" label="Status" defaultValue={lead.status} options={statuses} /><SelectField name="channel" label="Channel" defaultValue={lead.channel || "LinkedIn"} options={["LinkedIn", "Instagram", "Email", "In-person", "Referral", "Other"]} /><Input name="owner" label="Owner" defaultValue={lead.owner} /></div><div className="grid grid-cols-3 gap-3"><Input name="industry" label="Industry" defaultValue={lead.industry} /><Input name="location" label="Location" defaultValue={lead.location} /><Input name="next_follow_up_at" label="Follow-up" type="date" defaultValue={lead.next_follow_up_at?.slice(0, 10) || ""} /></div><div className="grid grid-cols-2 gap-3"><Input name="message_sent_count" label="Messages sent" defaultValue={String(lead.message_sent_count || 0)} /><Input name="reply_count" label="Replies" defaultValue={String(lead.reply_count || 0)} /></div><Input name="linkedin_url" label="Profile URL" defaultValue={lead.linkedin_url || ""} /><Input name="source" label="Source" defaultValue={lead.source} /><Input name="next_action" label="Next action" defaultValue={lead.next_action || ""} /><Textarea name="last_reply_summary" label="Last reply summary" defaultValue={lead.last_reply_summary || ""} /><Textarea name="meeting_outcome" label="Meeting outcome" defaultValue={lead.meeting_outcome || ""} /><Textarea name="profile_summary" label="Profile summary" defaultValue={lead.profile_summary || ""} /><Textarea name="personalization_notes" label="Notes" defaultValue={lead.personalization_notes || ""} /><div className="grid grid-cols-2 gap-3"><Input name="pain_angle" label="Pain angle" defaultValue={lead.pain_angle || ""} /><Input name="merit_angle" label="Merit angle" defaultValue={lead.merit_angle || ""} /></div><div className="flex gap-3 pt-2"><button type="button" onClick={onCancel} className="flex-1 rounded-lg border border-slate-700 px-4 py-2 font-medium text-slate-300 hover:bg-slate-900">Cancel</button><button type="submit" className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500">Save Lead</button></div></form></div></div>;
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) { return <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none">{options.map((option) => <option key={option} value={option}>{option.replace(/_/g, " ")}</option>)}</select>; }
function Input(props: { name: string; label: string; defaultValue?: string; type?: string; required?: boolean }) { return <label className="block"><span className="mb-1 block text-sm text-slate-400">{props.label}</span><input name={props.name} required={props.required} type={props.type || "text"} defaultValue={props.defaultValue} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none" /></label>; }
function SelectField(props: { name: string; label: string; defaultValue: string; options: string[] }) { return <label className="block"><span className="mb-1 block text-sm text-slate-400">{props.label}</span><select name={props.name} defaultValue={props.defaultValue} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none">{props.options.map((option) => <option key={option} value={option}>{option.replace(/_/g, " ")}</option>)}</select></label>; }
function Textarea(props: { name: string; label: string; defaultValue: string }) { return <label className="block"><span className="mb-1 block text-sm text-slate-400">{props.label}</span><textarea name={props.name} rows={3} defaultValue={props.defaultValue} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none" /></label>; }
function Detail({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-slate-800 bg-slate-950 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-sm font-medium text-slate-100">{value}</p></div>; }
function TextareaInline({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="mb-5 block"><span className="mb-2 block text-xs uppercase text-slate-500">{label}</span><textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100 focus:border-blue-500 focus:outline-none" /></label>; }
function IconButton({ label, icon, onClick, danger = false }: { label: string; icon: React.ReactNode; onClick: () => void; danger?: boolean }) { return <button onClick={onClick} title={label} className={`rounded-md border p-2 ${danger ? "border-red-900 text-red-300 hover:bg-red-950" : "border-slate-700 text-slate-300 hover:bg-slate-800"}`}>{icon}</button>; }
function Metric({ label, value }: { label: string; value: number }) { return <div className="rounded-lg border border-slate-800 bg-slate-900 p-4"><p className="text-xs uppercase text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-white">{value}</p></div>; }
