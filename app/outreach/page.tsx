"use client";

import { FormEvent, useMemo, useState } from "react";
import { Filter, MessageSquare, Plus, Search, Sparkles } from "lucide-react";
import { CopyButton } from "@/components/CopyButton";
import { StatusBadge } from "@/components/StatusBadge";
import { calculateRecruiterScore, generatedLinkedInMessages } from "@/lib/command-center";
import { seedOutreachLeads, seedOutreachMessages } from "@/lib/seed-data";
import type { OutreachLead, OutreachMessage } from "@/lib/types";
import { useLocalRecords } from "@/lib/use-local-records";

const leadTypes: OutreachLead["lead_type"][] = ["recruiter", "founder", "HR", "talent acquisition", "investor", "school partner", "mentor", "accelerator", "customer", "other"];
const statuses: OutreachLead["status"][] = ["new", "researched", "message_generated", "ready_to_send", "connection_sent", "connected", "first_dm_sent", "follow_up_1_sent", "follow_up_2_sent", "replied", "meeting_booked", "converted", "not_interested", "dead"];

export default function OutreachPage() {
  const leadsStore = useLocalRecords("merit.outreach_leads", seedOutreachLeads);
  const messagesStore = useLocalRecords("merit.outreach_messages", seedOutreachMessages);
  const [selectedLeadId, setSelectedLeadId] = useState(seedOutreachLeads[0]?.id || "");
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [drafting, setDrafting] = useState(false);

  const leads = leadsStore.records;
  const selectedLead = leads.find((lead) => lead.id === selectedLeadId) || leads[0];
  const selectedMessages = messagesStore.records.filter((message) => message.lead_id === selectedLead?.id);

  const filteredLeads = useMemo(
    () =>
      leads.filter((lead) => {
        const haystack = `${lead.first_name} ${lead.last_name} ${lead.company_name} ${lead.role_title} ${lead.personalization_notes || ""}`.toLowerCase();
        return (
          haystack.includes(query.toLowerCase()) &&
          (statusFilter === "all" || lead.status === statusFilter) &&
          (typeFilter === "all" || lead.lead_type === typeFilter)
        );
      }),
    [leads, query, statusFilter, typeFilter]
  );

  const addLead = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const partial = {
      role_title: String(data.get("role_title") || ""),
      company_name: String(data.get("company_name") || ""),
      location: String(data.get("location") || ""),
      industry: String(data.get("industry") || ""),
      source: String(data.get("source") || ""),
      personalization_notes: String(data.get("personalization_notes") || ""),
      linkedin_url: String(data.get("linkedin_url") || ""),
    };
    const record: OutreachLead = {
      id: `lead-${crypto.randomUUID()}`,
      first_name: String(data.get("first_name") || "New"),
      last_name: String(data.get("last_name") || "Lead"),
      lead_type: String(data.get("lead_type")) as OutreachLead["lead_type"],
      status: "new",
      priority_score: calculateRecruiterScore(partial),
      profile_summary: String(data.get("profile_summary") || ""),
      pain_angle: "",
      merit_angle: "",
      owner: String(data.get("owner") || "Founder"),
      last_contacted_at: undefined,
      next_follow_up_at: String(data.get("next_follow_up_at") || ""),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: "",
      ...partial,
    };
    leadsStore.addRecord(record);
    setSelectedLeadId(record.id);
    setShowNewLeadForm(false);
  };

  const generateMessages = async () => {
    if (!selectedLead) return;
    setDrafting(true);
    let generated = generatedLinkedInMessages(selectedLead);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "linkedin_outreach",
          input: {
            leadType: selectedLead.lead_type,
            name: `${selectedLead.first_name} ${selectedLead.last_name}`,
            role: selectedLead.role_title,
            company: selectedLead.company_name,
            profileSummary: selectedLead.profile_summary,
            personalizationNotes: selectedLead.personalization_notes,
          },
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
    } catch {
      // Keep deterministic fallback drafts.
    }

    const newMessages: OutreachMessage[] = Object.entries(generated).map(([type, text]) => ({
      id: `msg-${crypto.randomUUID()}`,
      lead_id: selectedLead.id,
      message_type: type === "breakup" ? "breakup" : type === "email" ? "email" : (type as OutreachMessage["message_type"]),
      message_text: text,
      status: "ready",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: "",
    }));
    messagesStore.setRecords((current) => [...newMessages, ...current.filter((message) => message.lead_id !== selectedLead.id)]);
    leadsStore.updateRecord(selectedLead.id, { status: "message_generated" });
    setDrafting(false);
  };

  const markManuallySent = () => {
    if (!selectedLead) return;
    leadsStore.updateRecord(selectedLead.id, {
      status: selectedLead.status === "connection_sent" ? "first_dm_sent" : "connection_sent",
      last_contacted_at: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <div className="max-w-7xl p-6 lg:p-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Outreach</h1>
          <p className="mt-1 text-slate-600">Draft and track manual LinkedIn outreach. This page never sends messages automatically.</p>
        </div>
        <button onClick={() => setShowNewLeadForm(true)} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800">
          <Plus size={18} /> Add Lead
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative min-w-72 flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, company, role, or notes" className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="all">All statuses</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select>
        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="all">All lead types</option>{leadTypes.map((type) => <option key={type}>{type}</option>)}</select>
        <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600"><Filter size={16} /> {filteredLeads.length} shown</div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white lg:col-span-2">
          <table className="w-full min-w-[720px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                {["Lead", "Type", "Status", "Score", "Follow-up"].map((head) => <th key={head} className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-600">{head}</th>)}
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id} onClick={() => setSelectedLeadId(lead.id)} className={`cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50 ${selectedLead?.id === lead.id ? "bg-blue-50" : ""}`}>
                  <td className="px-5 py-4"><p className="font-medium text-slate-950">{lead.first_name} {lead.last_name}</p><p className="text-sm text-slate-600">{lead.role_title} at {lead.company_name}</p></td>
                  <td className="px-5 py-4 text-sm text-slate-700">{lead.lead_type}</td>
                  <td className="px-5 py-4"><StatusBadge status={lead.status} /></td>
                  <td className="px-5 py-4"><span className="font-semibold text-slate-900">{lead.priority_score}</span></td>
                  <td className="px-5 py-4 text-sm text-slate-700">{lead.next_follow_up_at || "Not scheduled"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filteredLeads.length && <p className="p-8 text-center text-sm text-slate-600">No leads match the current filters.</p>}
        </section>

        <aside className="rounded-lg border border-slate-200 bg-white p-6">
          {selectedLead ? (
            <>
              <h2 className="text-xl font-bold text-slate-950">{selectedLead.first_name} {selectedLead.last_name}</h2>
              <p className="mt-1 text-sm text-slate-600">{selectedLead.role_title} at {selectedLead.company_name}</p>
              <div className="my-5 space-y-2 border-y border-slate-200 py-4 text-sm">
                <div className="flex justify-between"><span className="text-slate-600">Status</span><StatusBadge status={selectedLead.status} /></div>
                <div className="flex justify-between"><span className="text-slate-600">Score</span><span className="font-semibold">{selectedLead.priority_score}/100</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Owner</span><span>{selectedLead.owner}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Next follow-up</span><span>{selectedLead.next_follow_up_at || "None"}</span></div>
              </div>
              <p className="mb-4 text-sm text-slate-700">{selectedLead.profile_summary || selectedLead.personalization_notes || "Add profile text or notes to improve message quality."}</p>
              <button onClick={generateMessages} disabled={drafting} className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-50 px-4 py-2 font-medium text-blue-800 hover:bg-blue-100 disabled:opacity-60">
                <Sparkles size={16} /> {drafting ? "Generating..." : "Generate Message Drafts"}
              </button>
              <button onClick={markManuallySent} className="mb-5 w-full rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-800 hover:bg-slate-50">
                Mark as Manually Sent
              </button>
              <label className="mb-2 block text-xs font-semibold uppercase text-slate-600">Schedule follow-up</label>
              <input type="date" value={selectedLead.next_follow_up_at?.slice(0, 10) || ""} onChange={(event) => leadsStore.updateRecord(selectedLead.id, { next_follow_up_at: event.target.value })} className="mb-5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <div className="space-y-3">
                {selectedMessages.length ? selectedMessages.map((message) => (
                  <div key={message.id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <p className="mb-2 text-xs font-semibold uppercase text-slate-600">{message.message_type.replace(/_/g, " ")}</p>
                    <textarea value={message.message_text} onChange={(event) => messagesStore.updateRecord(message.id, { message_text: event.target.value })} rows={4} className="mb-2 w-full resize-none rounded border border-slate-200 bg-white p-2 text-xs text-slate-700" />
                    <CopyButton text={message.message_text} label="Copy Message" />
                  </div>
                )) : (
                  <div className="rounded-md bg-slate-50 p-4 text-center text-sm text-slate-600"><MessageSquare size={24} className="mx-auto mb-2 text-slate-400" />Generate drafts to create copy-only outreach messages.</div>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-600">Select a lead to view details.</p>
          )}
        </aside>
      </div>

      {showNewLeadForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-5 text-xl font-bold text-slate-950">Add Outreach Lead</h2>
            <form onSubmit={addLead} className="space-y-4">
              <div className="grid grid-cols-2 gap-3"><input name="first_name" required placeholder="First name" className="rounded-lg border border-slate-300 px-3 py-2" /><input name="last_name" required placeholder="Last name" className="rounded-lg border border-slate-300 px-3 py-2" /></div>
              <div className="grid grid-cols-2 gap-3"><input name="role_title" required placeholder="Role title" className="rounded-lg border border-slate-300 px-3 py-2" /><input name="company_name" required placeholder="Company" className="rounded-lg border border-slate-300 px-3 py-2" /></div>
              <div className="grid grid-cols-2 gap-3"><select name="lead_type" className="rounded-lg border border-slate-300 px-3 py-2">{leadTypes.map((type) => <option key={type}>{type}</option>)}</select><input name="owner" placeholder="Owner" className="rounded-lg border border-slate-300 px-3 py-2" /></div>
              <div className="grid grid-cols-2 gap-3"><input name="industry" placeholder="Industry" className="rounded-lg border border-slate-300 px-3 py-2" /><input name="location" placeholder="Location" className="rounded-lg border border-slate-300 px-3 py-2" /></div>
              <input name="linkedin_url" placeholder="LinkedIn URL" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              <input name="source" placeholder="Source, warm intro, event, referral" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              <textarea name="profile_summary" rows={3} placeholder="Paste visible profile text or summary" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              <textarea name="personalization_notes" rows={3} placeholder="Professional personalization notes only" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              <input name="next_follow_up_at" type="date" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowNewLeadForm(false)} className="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50">Cancel</button><button type="submit" className="flex-1 rounded-lg bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800">Save Lead</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
