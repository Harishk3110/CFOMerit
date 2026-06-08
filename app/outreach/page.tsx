"use client";

import React, { useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { CopyButton } from "@/components/CopyButton";
import { Plus, Filter, Search, MessageSquare, Sparkles } from "lucide-react";

const sampleLeads = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Head of Talent",
    company: "TechCorp",
    leadType: "recruiter",
    status: "connected",
    priority: 90,
    lastContacted: "2 days ago",
  },
  {
    id: 2,
    name: "Alex Park",
    role: "Founder",
    company: "StartupX",
    leadType: "founder",
    status: "message_generated",
    priority: 85,
    lastContacted: "Never",
  },
  {
    id: 3,
    name: "Jamie Rodriguez",
    role: "Recruiter",
    company: "FinanceHub",
    leadType: "recruiter",
    status: "new",
    priority: 72,
    lastContacted: "Never",
  },
  {
    id: 4,
    name: "Morgan Lee",
    role: "Angel Investor",
    company: "Independent",
    leadType: "investor",
    status: "replied",
    priority: 88,
    lastContacted: "5 days ago",
  },
];

export default function OutreachPage() {
  const [selectedLead, setSelectedLead] = useState<(typeof sampleLeads)[0] | null>(null);
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredLeads =
    filterStatus === "all"
      ? sampleLeads
      : sampleLeads.filter((lead) => lead.status === filterStatus);

  const sampleMessages = {
    connection_request:
      "Hi Sarah, I've been following TechCorp's growth in talent tech. Impressed by your team's approach to early hiring. Would love to connect and chat about how Merit could help you evaluate fresh talent beyond resumes. Connecting now!",
    first_dm:
      "Sarah, quick question: how do you currently evaluate fresh talent beyond resumes? We're building Merit to solve exactly this - giving recruiters structured proof of ability. Would love your thoughts. Available for a quick call?",
    follow_up_1:
      "Following up on my earlier message. Realized I should've led with this: Merit is already helping 3 of your peer companies evaluate students. Worth 10 minutes? Free this week?",
    follow_up_2:
      "Last outreach on this - just didn't want to miss the opportunity. If evaluating early talent is painful for your team, this matters. Happy to revisit anytime.",
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Outreach</h1>
          <p className="text-slate-600 mt-1">
            LinkedIn outreach assistant for recruiters, founders, and investors
          </p>
        </div>
        <button
          onClick={() => setShowNewLeadForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Lead
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <div className="flex-1 relative min-w-64">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search by name, company, or notes..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
          <Filter size={16} />
          Filters
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {["all", "new", "message_generated", "connected", "replied"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === status
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {status === "all"
              ? "All"
              : status.replace("_", " ").charAt(0).toUpperCase() +
                status.replace("_", " ").slice(1)}
          </button>
        ))}
      </div>

      {/* Leads Table & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leads List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-700">
                    Name
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-700">
                    Company
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-700">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-700">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${
                      selectedLead?.id === lead.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{lead.name}</p>
                        <p className="text-xs text-slate-600">{lead.role}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {lead.company}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${lead.priority}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">
                          {lead.priority}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredLeads.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-600">No leads found</p>
              </div>
            )}
          </div>
        </div>

        {/* Lead Detail Panel */}
        <div className="lg:col-span-1">
          {selectedLead ? (
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedLead.name}
                </h3>
                <p className="text-sm text-slate-600">{selectedLead.role}</p>
                <p className="text-sm text-slate-600">{selectedLead.company}</p>
              </div>

              <div className="mb-6 space-y-2 border-t border-b border-slate-200 py-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Lead Type:</span>
                  <span className="font-medium">{selectedLead.leadType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Status:</span>
                  <StatusBadge status={selectedLead.status} />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Priority:</span>
                  <span className="font-medium">{selectedLead.priority}/100</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Last Contacted:</span>
                  <span className="font-medium">{selectedLead.lastContacted}</span>
                </div>
              </div>

              <div className="mb-6">
                <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 mb-3">
                  <Sparkles size={16} />
                  Generate Message
                </button>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Generated Messages
                  </label>
                  {Object.entries(sampleMessages).map(([type, message]) => (
                    <div key={type} className="bg-slate-50 rounded p-3">
                      <p className="text-xs font-medium text-slate-700 mb-2">
                        {type.replace(/_/g, " ").toUpperCase()}
                      </p>
                      <p className="text-xs text-slate-600 line-clamp-3 mb-2">
                        {message}
                      </p>
                      <CopyButton text={message} label="Copy" />
                    </div>
                  ))}
                </div>
              </div>

              <button className="w-full px-4 py-2 bg-slate-100 text-slate-900 rounded-lg font-medium hover:bg-slate-200">
                Mark as Sent
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 p-6 text-center">
              <MessageSquare size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-slate-600">Select a lead to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
