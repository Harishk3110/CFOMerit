"use client";

import React, { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";

const taskStatuses = ["backlog", "this_week", "in_progress", "blocked", "done"];

const sampleTasks = {
  backlog: [
    {
      id: 1,
      title: "Build recruiter messaging templates",
      owner: "Product",
      priority: "low",
    },
    {
      id: 2,
      title: "Design analytics dashboard",
      owner: "Design",
      priority: "medium",
    },
  ],
  this_week: [
    {
      id: 3,
      title: "Finalize portfolio UI flow",
      owner: "Product",
      priority: "high",
    },
    {
      id: 4,
      title: "5 recruiter validation calls",
      owner: "Growth",
      priority: "critical",
    },
    {
      id: 5,
      title: "Prepare investor data room",
      owner: "Finance",
      priority: "high",
    },
  ],
  in_progress: [
    {
      id: 6,
      title: "Implement project verification",
      owner: "Engineering",
      priority: "high",
    },
    {
      id: 7,
      title: "Recruiter onboarding copy",
      owner: "Marketing",
      priority: "medium",
    },
  ],
  blocked: [
    {
      id: 8,
      title: "Deploy new student upload flow",
      owner: "Engineering",
      priority: "critical",
      blocker: "Waiting on Supabase storage migration",
    },
  ],
  done: [
    {
      id: 9,
      title: "Student signup flow redesign",
      owner: "Product",
      priority: "high",
    },
    {
      id: 10,
      title: "Stripe integration testing",
      owner: "Engineering",
      priority: "medium",
    },
  ],
};

const weeklyPlan = {
  week: "June 8-14",
  theme: "Recruiter Validation Sprint",
  priority1: "Complete portfolio verification feature",
  priority2: "Complete 5 recruiter validation calls",
  priority3: "Prepare Series Seed pitch deck",
  keyMetric: "Recruiter activation rate: target 40%",
};

export default function WeeklyPage() {
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);

  const weeklyReviewSample = `WEEKLY REVIEW: Week of June 1-7

What Moved:
✓ Portfolio UI redesign completed and deployed
✓ 4 recruiter validation calls completed (95% positive feedback)
✓ Investor intro pipeline expanded to 8 targets

What Didn't Move:
✗ Project verification feature delayed (engineering blockers)
✗ Student onboarding email flow not prioritized
✗ Accelerator outreach stalled

Execution Weak Points:
- Engineering capacity fully allocated to verification feature
- Communication delays on blocker resolution
- Too many parallel initiatives diluting focus

Highest-Leverage Next Actions:
1. Unblock verification feature immediately (priority critical)
2. Close 2 investor meetings this week (already booked)
3. Push recruiter activation push (currently 35%, target 40%)
4. Kill secondary initiatives to make room for core metrics

Strategic Recommendation for Next Week:
Stop everything and focus on recruiter validation. We have momentum and investor interest. The verification feature unblock will compound our progress. Push for 60% activation rate by week end.`;

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Weekly Execution</h1>
        <p className="text-slate-600 mt-1">
          Weekly planning board and task execution tracking
        </p>
      </div>

      {/* Weekly Plan Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            This Week: {weeklyPlan.week}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Weekly Theme
              </label>
              <p className="text-lg font-semibold text-slate-900">
                {weeklyPlan.theme}
              </p>
            </div>
            <div className="border-t border-slate-200 pt-4">
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Top 3 Priorities
              </label>
              <ol className="space-y-2 text-sm">
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600">1.</span>
                  <span>{weeklyPlan.priority1}</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600">2.</span>
                  <span>{weeklyPlan.priority2}</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600">3.</span>
                  <span>{weeklyPlan.priority3}</span>
                </li>
              </ol>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <p className="font-semibold text-blue-900">Key Metric Target</p>
              <p className="text-blue-800 mt-1">{weeklyPlan.keyMetric}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Status</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-600">This Week's Tasks</p>
              <p className="text-3xl font-bold text-slate-900">
                {sampleTasks.this_week.length}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">
                {sampleTasks.in_progress.length}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600">Blocked</p>
              <p className="text-2xl font-bold text-red-600">
                {sampleTasks.blocked.length}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600">Completed This Week</p>
              <p className="text-2xl font-bold text-green-600">
                {sampleTasks.done.length}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowWeeklyReview(true)}
            className="w-full mt-6 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200"
          >
            <Sparkles size={16} />
            Generate Review
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-full">
          {taskStatuses.map((status) => (
            <div
              key={status}
              className="flex-shrink-0 w-80 bg-slate-50 rounded-lg p-4 border border-slate-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900 text-sm">
                  {status.replace("_", " ").toUpperCase()}
                </h3>
                <span className="text-xs font-semibold text-slate-600">
                  {sampleTasks[status as keyof typeof sampleTasks]?.length || 0}
                </span>
              </div>

              <div className="space-y-2">
                {(sampleTasks[status as keyof typeof sampleTasks] || []).map((task) => (
                  <div
                    key={task.id}
                    className="p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-400 cursor-move transition-colors"
                  >
                    <p className="font-medium text-sm text-slate-900">
                      {task.title}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-600">{task.owner}</span>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          task.priority === "critical"
                            ? "bg-red-100 text-red-800"
                            : task.priority === "high"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                    {task.blocker && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                        <p className="font-semibold">Blocker:</p>
                        <p>{task.blocker}</p>
                      </div>
                    )}
                  </div>
                ))}

                <button className="w-full mt-4 px-3 py-2 text-sm font-medium text-slate-600 border border-dashed border-slate-300 rounded-lg hover:bg-slate-100">
                  <Plus size={16} className="mx-auto" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Review Modal */}
      {showWeeklyReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  AI Weekly Review
                </h2>
                <p className="text-slate-600 mt-1">
                  Blunt, operator-focused execution review
                </p>
              </div>
              <button
                onClick={() => setShowWeeklyReview(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="bg-slate-50 rounded-lg p-6 mb-6 border border-slate-200">
              <p className="text-slate-700 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                {weeklyReviewSample}
              </p>
            </div>

            <button
              onClick={() => setShowWeeklyReview(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
