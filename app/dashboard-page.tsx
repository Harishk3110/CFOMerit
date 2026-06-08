"use client";

import React from "react";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Users,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Zap,
} from "lucide-react";

// Sample data - in production this would come from Supabase
const sampleData = {
  recruiterLeads: 24,
  investorLeads: 8,
  activeConversations: 12,
  followUpsDue: 5,
  meetingsBooked: 3,
  monthlyBurn: 8500,
  estimatedRunway: "8.2 months",
  lastUpdate: "Updated 2 hours ago",
};

const upcomingMeetings = [
  {
    id: 1,
    title: "Recruiter Call - TechCorp",
    time: "2:00 PM Today",
    attendee: "Sarah Chen",
    status: "confirmed",
  },
  {
    id: 2,
    title: "Investor Intro - Accel",
    time: "Tomorrow 10:00 AM",
    attendee: "Alex Park",
    status: "pending",
  },
  {
    id: 3,
    title: "Customer Interview",
    time: "Thursday 3:00 PM",
    attendee: "Jordan Lee",
    status: "confirmed",
  },
];

const weekTopPriorities = [
  { id: 1, title: "Finalize recruiter onboarding flow", owner: "Product" },
  { id: 2, title: "Prepare investor data room", owner: "Finance" },
  { id: 3, title: "Complete 5 recruiter interviews", owner: "Growth" },
];

const openRisks = [
  {
    id: 1,
    risk: "Runway below 6 months if burn stays at current rate",
    impact: "high",
  },
  { id: 2, risk: "Q3 recruiter churn needs attention", impact: "medium" },
  {
    id: 3,
    risk: "Portfolio UI delays blocking recruiter validation",
    impact: "high",
  },
];

export default function DashboardPage() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">
          What do we need to do today to move Merit forward?
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Recruiter Leads"
          value={sampleData.recruiterLeads}
          icon={Users}
          trend="up"
        />
        <MetricCard
          label="Investor Leads"
          value={sampleData.investorLeads}
          icon={TrendingUp}
        />
        <MetricCard
          label="Active Conversations"
          value={sampleData.activeConversations}
          icon={Clock}
        />
        <MetricCard
          label="Follow-ups Due Today"
          value={sampleData.followUpsDue}
          icon={AlertCircle}
          variant={sampleData.followUpsDue > 3 ? "warning" : "default"}
        />
      </div>

      {/* Finance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <MetricCard
          label="Monthly Burn"
          value={`$${sampleData.monthlyBurn.toLocaleString()}`}
          icon={DollarSign}
        />
        <MetricCard
          label="Estimated Runway"
          value={sampleData.estimatedRunway}
          variant={parseFloat(sampleData.estimatedRunway) < 6 ? "danger" : "default"}
          icon={Zap}
        />
        <MetricCard
          label="Meetings Booked"
          value={sampleData.meetingsBooked}
          icon={CheckCircle2}
          trend="up"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Upcoming Meetings */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Upcoming Meetings
          </h2>
          <div className="space-y-4">
            {upcomingMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="flex items-between justify-between border-b border-slate-100 pb-4 last:border-0"
              >
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{meeting.title}</p>
                  <p className="text-sm text-slate-600 mt-1">
                    {meeting.time} · {meeting.attendee}
                  </p>
                </div>
                <div>
                  <StatusBadge status={meeting.status} />
                </div>
              </div>
            ))}
            <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700">
              View Calendar
            </button>
          </div>
        </div>

        {/* Week's Top Priorities */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            This Week's Priorities
          </h2>
          <div className="space-y-3">
            {weekTopPriorities.map((priority, idx) => (
              <div key={priority.id} className="flex gap-3">
                <span className="text-lg font-bold text-blue-600">
                  {idx + 1}.
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    {priority.title}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Owner: {priority.owner}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Outreach Pipeline & Risks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outreach Pipeline Overview */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Outreach Pipeline
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">New Leads</span>
              <span className="font-bold text-slate-900">8</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">Ready to Send</span>
              <span className="font-bold text-slate-900">12</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">Connected</span>
              <span className="font-bold text-slate-900">15</span>
            </div>
            <div className="flex justify-between items-center pb-2">
              <span className="text-sm text-slate-600">Converted</span>
              <span className="font-bold text-slate-900">3</span>
            </div>
          </div>
          <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700">
            View Outreach
          </button>
        </div>

        {/* Open Risks */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Strategic Risks
          </h2>
          <div className="space-y-3">
            {openRisks.map((risk) => (
              <div key={risk.id} className="flex gap-3">
                <AlertCircle
                  size={16}
                  className={`flex-shrink-0 mt-0.5 ${
                    risk.impact === "high"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                />
                <p className="text-sm text-slate-700">{risk.risk}</p>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 px-4 py-2 bg-slate-100 text-slate-900 rounded-lg font-medium text-sm hover:bg-slate-200">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
