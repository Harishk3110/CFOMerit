"use client";

import { FormEvent, useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { CopyButton } from "@/components/CopyButton";
import { StatusBadge } from "@/components/StatusBadge";
import { generatedWeeklyReview } from "@/lib/command-center";
import { seedTasks, seedWeeklyPlans } from "@/lib/seed-data";
import type { Task } from "@/lib/types";
import { useLocalRecords } from "@/lib/use-local-records";

const taskStatuses: Task["status"][] = ["backlog", "this_week", "in_progress", "blocked", "done", "killed"];
const priorities: Task["priority"][] = ["low", "medium", "high", "critical"];

export default function WeeklyPage() {
  const tasksStore = useLocalRecords("merit.tasks", seedTasks);
  const plansStore = useLocalRecords("merit.weekly_plans", seedWeeklyPlans);
  const [addStatus, setAddStatus] = useState<Task["status"] | null>(null);
  const [review, setReview] = useState("");
  const plan = plansStore.records[0];
  const tasks = tasksStore.records;

  const addTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const record: Task = {
      id: `task-${crypto.randomUUID()}`,
      title: String(data.get("title") || "New task"),
      description: String(data.get("description") || ""),
      owner: String(data.get("owner") || "Founder"),
      priority: String(data.get("priority")) as Task["priority"],
      status: addStatus || "backlog",
      due_date: String(data.get("due_date") || ""),
      linked_strategy_pillar: String(data.get("linked_strategy_pillar") || ""),
      linked_experiment: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: "",
    };
    tasksStore.addRecord(record);
    setAddStatus(null);
  };

  return (
    <div className="max-w-7xl p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-950">Weekly Execution</h1>
        <p className="mt-1 text-slate-600">Weekly planning board and task execution tracking.</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-lg border border-slate-200 bg-white p-6 lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold text-slate-950">This Week</h2>
          {plan ? (
            <div className="space-y-4">
              <input value={plan.weekly_theme} onChange={(event) => plansStore.updateRecord(plan.id, { weekly_theme: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-lg font-semibold" />
              <textarea value={plan.top_3_priorities} onChange={(event) => plansStore.updateRecord(plan.id, { top_3_priorities: event.target.value })} rows={4} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <input value={plan.key_metric_target || ""} onChange={(event) => plansStore.updateRecord(plan.id, { key_metric_target: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
          ) : (
            <p className="text-sm text-slate-600">No weekly plan found.</p>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-bold text-slate-950">Status</h2>
          <div className="mb-5 grid grid-cols-2 gap-3">
            <Stat label="This week" value={tasks.filter((task) => task.status === "this_week").length} />
            <Stat label="In progress" value={tasks.filter((task) => task.status === "in_progress").length} />
            <Stat label="Blocked" value={tasks.filter((task) => task.status === "blocked").length} danger />
            <Stat label="Done" value={tasks.filter((task) => task.status === "done").length} />
          </div>
          <button onClick={() => setReview(generatedWeeklyReview(tasks))} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-50 px-4 py-2 font-medium text-blue-800 hover:bg-blue-100">
            <Sparkles size={16} /> Generate Review
          </button>
        </section>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4">
          {taskStatuses.map((status) => {
            const columnTasks = tasks.filter((task) => task.status === status);
            return (
              <section key={status} className="w-80 shrink-0 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase text-slate-800">{status.replace(/_/g, " ")}</h2>
                  <span className="text-xs font-semibold text-slate-500">{columnTasks.length}</span>
                </div>
                <div className="space-y-3">
                  {columnTasks.map((task) => (
                    <div key={task.id} className="rounded-lg border border-slate-200 bg-white p-4">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <p className="font-medium text-slate-950">{task.title}</p>
                        <StatusBadge status={task.priority} />
                      </div>
                      <p className="text-xs text-slate-600">{task.owner}{task.due_date ? ` - due ${task.due_date}` : ""}</p>
                      {task.description && <p className="mt-2 text-sm text-slate-700">{task.description}</p>}
                      <select value={task.status} onChange={(event) => tasksStore.updateRecord(task.id, { status: event.target.value as Task["status"] })} className="mt-3 w-full rounded-lg border border-slate-300 px-2 py-1 text-xs">
                        {taskStatuses.map((taskStatus) => <option key={taskStatus}>{taskStatus}</option>)}
                      </select>
                    </div>
                  ))}
                  <button onClick={() => setAddStatus(status)} className="flex w-full items-center justify-center rounded-lg border border-dashed border-slate-300 px-3 py-3 text-slate-600 hover:bg-slate-100" aria-label={`Add task to ${status}`}>
                    <Plus size={18} />
                  </button>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {review && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-5 text-xl font-bold text-slate-950">AI Weekly Review</h2>
            <textarea value={review} onChange={(event) => setReview(event.target.value)} rows={16} className="mb-4 w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-700" />
            <div className="flex gap-3">
              <CopyButton text={review} label="Copy Review" />
              <button onClick={() => setReview("")} className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50">Close</button>
            </div>
          </div>
        </div>
      )}

      {addStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-5 text-xl font-bold text-slate-950">Add Task</h2>
            <form onSubmit={addTask} className="space-y-4">
              <input name="title" required placeholder="Task title" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              <textarea name="description" rows={3} placeholder="Description" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              <div className="grid grid-cols-2 gap-3">
                <input name="owner" placeholder="Owner" className="rounded-lg border border-slate-300 px-3 py-2" />
                <select name="priority" className="rounded-lg border border-slate-300 px-3 py-2">{priorities.map((priority) => <option key={priority}>{priority}</option>)}</select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input name="due_date" type="date" className="rounded-lg border border-slate-300 px-3 py-2" />
                <input name="linked_strategy_pillar" placeholder="Strategy pillar" className="rounded-lg border border-slate-300 px-3 py-2" />
              </div>
              <div className="flex gap-3 pt-2"><button type="button" onClick={() => setAddStatus(null)} className="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50">Cancel</button><button type="submit" className="flex-1 rounded-lg bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800">Save Task</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, danger = false }: { label: string; value: number; danger?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 ${danger ? "border-red-200 bg-red-50" : "border-slate-200 bg-slate-50"}`}>
      <p className="text-xs text-slate-600">{label}</p>
      <p className={`text-2xl font-bold ${danger ? "text-red-800" : "text-slate-950"}`}>{value}</p>
    </div>
  );
}
