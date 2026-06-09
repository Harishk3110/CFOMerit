"use client";

import { FormEvent, useState } from "react";
import { Edit, Plus, Sparkles, Trash2 } from "lucide-react";
import { CopyButton } from "@/components/CopyButton";
import { StatusBadge } from "@/components/StatusBadge";
import { generatedWeeklyReview, leverageScore, meritTaskTemplates } from "@/lib/command-center";
import type { KPI, OperatingTrack, Task, WeeklyPlan } from "@/lib/types";
import { useLocalRecords } from "@/lib/use-local-records";

const taskStatuses: Task["status"][] = ["backlog", "this_week", "in_progress", "waiting", "blocked", "done", "killed"];
const priorities: Task["priority"][] = ["low", "medium", "high", "critical"];
const planStatuses: WeeklyPlan["status"][] = ["planned", "in_progress", "completed"];

const emptyPlan = (): WeeklyPlan => {
  const now = new Date().toISOString();
  return { id: `week-${crypto.randomUUID()}`, week_start_date: new Date().toISOString().slice(0, 10), weekly_theme: "", top_3_priorities: "", owner: "", status: "planned", key_metric_target: "", expected_outcome: "", actual_result: "", founder_reflection: "", what_worked: "", what_failed: "", next_week_recommendation: "", notes: "", created_at: now, updated_at: now, created_by: "" };
};

const emptyTask = (status: Task["status"] = "backlog"): Task => {
  const now = new Date().toISOString();
  return { id: `task-${crypto.randomUUID()}`, title: "", description: "", owner: "", priority: "medium", status, due_date: "", operating_track_id: "", linked_kpi_id: "", linked_strategy_pillar: "", linked_experiment: "", effort_score: 1, impact_score: 3, urgency_score: 3, leverage_score: 5, notes: "", created_at: now, updated_at: now, created_by: "" };
};

export default function WeeklyPage() {
  const plansStore = useLocalRecords<WeeklyPlan>("weekly_plans", []);
  const tasksStore = useLocalRecords<Task>("tasks", []);
  const tracks = useLocalRecords<OperatingTrack>("operating_tracks", []).records;
  const kpis = useLocalRecords<KPI>("kpis", []).records;
  const [editingPlan, setEditingPlan] = useState<WeeklyPlan | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [review, setReview] = useState("");
  const plan = plansStore.records[0];

  const savePlan = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingPlan) return;
    const data = new FormData(event.currentTarget);
    const record: WeeklyPlan = { ...editingPlan, week_start_date: String(data.get("week_start_date") || ""), weekly_theme: String(data.get("weekly_theme") || ""), top_3_priorities: String(data.get("top_3_priorities") || ""), owner: String(data.get("owner") || ""), status: String(data.get("status")) as WeeklyPlan["status"], key_metric_target: String(data.get("key_metric_target") || ""), expected_outcome: String(data.get("expected_outcome") || ""), actual_result: String(data.get("actual_result") || ""), founder_reflection: String(data.get("founder_reflection") || ""), what_worked: String(data.get("what_worked") || ""), what_failed: String(data.get("what_failed") || ""), next_week_recommendation: String(data.get("next_week_recommendation") || ""), notes: String(data.get("notes") || ""), updated_at: new Date().toISOString() };
    if (plansStore.records.some((item) => item.id === record.id)) plansStore.updateRecord(record.id, record);
    else plansStore.setRecords([record]);
    setEditingPlan(null);
  };

  const saveTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingTask) return;
    const data = new FormData(event.currentTarget);
    const scored = { effort_score: Number(data.get("effort_score") || 0), impact_score: Number(data.get("impact_score") || 0), urgency_score: Number(data.get("urgency_score") || 0) };
    const record: Task = { ...editingTask, title: String(data.get("title") || ""), description: String(data.get("description") || ""), owner: String(data.get("owner") || ""), priority: String(data.get("priority")) as Task["priority"], status: String(data.get("status")) as Task["status"], due_date: String(data.get("due_date") || ""), operating_track_id: String(data.get("operating_track_id") || ""), linked_kpi_id: String(data.get("linked_kpi_id") || ""), linked_strategy_pillar: String(data.get("linked_strategy_pillar") || ""), linked_experiment: String(data.get("linked_experiment") || ""), ...scored, leverage_score: leverageScore(scored), notes: String(data.get("notes") || ""), updated_at: new Date().toISOString() };
    if (tasksStore.records.some((task) => task.id === record.id)) tasksStore.updateRecord(record.id, record);
    else tasksStore.addRecord(record);
    setEditingTask(null);
  };

  const deletePlan = () => {
    if (plan && window.confirm("Delete this weekly plan?")) plansStore.deleteRecord(plan.id);
  };

  const deleteTask = (task: Task) => {
    if (window.confirm(`Delete task "${task.title}"?`)) tasksStore.deleteRecord(task.id);
  };

  const loadTaskTemplates = () => {
    const now = new Date().toISOString();
    const existing = new Set(tasksStore.records.map((task) => task.title));
    const records = meritTaskTemplates.filter((template) => !existing.has(template.title)).map<Task>((template) => {
      const track = tracks.find((item) => item.name === template.trackName);
      const scored = { effort_score: template.effort_score, impact_score: template.impact_score, urgency_score: template.urgency_score };
      return { id: `task-${crypto.randomUUID()}`, title: template.title, description: template.description, owner: "Founder", priority: template.priority as Task["priority"], status: "backlog", due_date: "", operating_track_id: track?.id || "", linked_kpi_id: "", linked_strategy_pillar: template.trackName, linked_experiment: "", linked_investor_id: "", linked_lead_id: "", ...scored, leverage_score: leverageScore(scored), notes: "Loaded from Merit task templates. Edit due date, owner, and links.", created_at: now, updated_at: now, created_by: "" };
    });
    tasksStore.setRecords((current) => [...records, ...current]);
  };

  return (
    <div className="max-w-7xl p-6 lg:p-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div><h1 className="text-3xl font-bold text-white">Weekly Execution</h1><p className="mt-1 text-slate-400">Weekly operating plan and task board.</p></div>
        <div className="flex gap-3"><button onClick={loadTaskTemplates} className="rounded-lg border border-slate-700 px-4 py-2 font-medium text-slate-200 hover:bg-slate-900">Load Merit Task Templates</button><button onClick={() => setEditingTask(emptyTask("this_week"))} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500"><Plus size={18} /> Add Task</button></div>
      </div>

      {!plan ? (
        <div className="mb-6 rounded-lg border border-dashed border-slate-800 bg-slate-900 p-10 text-center"><p className="text-lg font-semibold text-slate-100">No weekly plan yet. Create this week&apos;s operating plan.</p><button onClick={() => setEditingPlan(emptyPlan())} className="mt-5 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500">Create Weekly Plan</button></div>
      ) : (
        <section className="mb-6 rounded-lg border border-slate-800 bg-slate-900 p-5">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-xl font-bold text-white">{plan.weekly_theme || "Weekly plan"}</h2><p className="mt-1 text-sm text-slate-400">{plan.week_start_date} - {plan.key_metric_target || "No metric target"}</p></div><div className="flex gap-2"><button onClick={() => setEditingPlan(plan)} className="rounded-md border border-slate-700 p-2 text-slate-300 hover:bg-slate-800"><Edit size={16} /></button><button onClick={deletePlan} className="rounded-md border border-red-900 p-2 text-red-300 hover:bg-red-950"><Trash2 size={16} /></button></div></div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3"><Detail label="Top priorities" value={plan.top_3_priorities || "-"} /><Detail label="Owner" value={plan.owner || "-"} /><Detail label="Status" value={plan.status} /></div>
        </section>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4"><Metric label="Open tasks" value={tasksStore.records.filter((task) => !["done", "killed"].includes(task.status)).length} /><Metric label="In progress" value={tasksStore.records.filter((task) => task.status === "in_progress").length} /><Metric label="Blocked" value={tasksStore.records.filter((task) => task.status === "blocked").length} danger /><Metric label="Done" value={tasksStore.records.filter((task) => task.status === "done").length} /></div>

      {tasksStore.records.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-800 bg-slate-900 p-10 text-center"><p className="text-lg font-semibold text-slate-100">No tasks yet. Add your first execution task or load Merit task templates.</p><div className="mt-5 flex justify-center gap-3"><button onClick={loadTaskTemplates} className="rounded-lg border border-slate-700 px-4 py-2 font-medium text-slate-200 hover:bg-slate-800">Load Merit Task Templates</button><button onClick={() => setEditingTask(emptyTask("this_week"))} className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500">Add Task</button></div></div>
      ) : (
        <div className="overflow-x-auto pb-4"><div className="flex gap-4">{taskStatuses.map((status) => {
          const column = tasksStore.records.filter((task) => task.status === status);
          return <section key={status} className="w-80 shrink-0 rounded-lg border border-slate-800 bg-slate-900 p-4"><div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-bold uppercase text-slate-300">{status.replace(/_/g, " ")}</h2><span className="text-xs text-slate-500">{column.length}</span></div><div className="space-y-3">{column.sort((a, b) => leverageScore(b) - leverageScore(a)).map((task) => {
            const track = tracks.find((item) => item.id === task.operating_track_id);
            const kpi = kpis.find((item) => item.id === task.linked_kpi_id);
            return <div key={task.id} className="rounded-lg border border-slate-800 bg-slate-950 p-4"><div className="mb-3 flex items-start justify-between gap-3"><p className="font-medium text-slate-100">{task.title}</p><StatusBadge status={task.priority} /></div><p className="text-xs text-slate-500">{task.owner || "No owner"}{task.due_date ? ` - due ${task.due_date}` : ""}</p><p className="mt-1 text-xs text-blue-400">{track?.name || "No track"}{kpi ? ` - KPI: ${kpi.title}` : ""}</p>{task.description && <p className="mt-2 text-sm text-slate-300">{task.description}</p>}<div className="mt-3 rounded-md border border-slate-800 bg-slate-900 p-2 text-xs text-slate-400">Leverage: <span className="font-semibold text-slate-100">{leverageScore(task)}</span> = impact {task.impact_score || 0} + urgency {task.urgency_score || 0} - effort {task.effort_score || 0}</div><select value={task.status} onChange={(event) => tasksStore.updateRecord(task.id, { status: event.target.value as Task["status"] })} className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100">{taskStatuses.map((option) => <option key={option}>{option}</option>)}</select><div className="mt-3 flex gap-2"><button onClick={() => setEditingTask(task)} className="rounded-md border border-slate-700 p-2 text-slate-300 hover:bg-slate-800"><Edit size={16} /></button><button onClick={() => deleteTask(task)} className="rounded-md border border-red-900 p-2 text-red-300 hover:bg-red-950"><Trash2 size={16} /></button></div></div>;
          })}<button onClick={() => setEditingTask(emptyTask(status))} className="flex w-full items-center justify-center rounded-lg border border-dashed border-slate-700 px-3 py-3 text-slate-400 hover:bg-slate-800"><Plus size={18} /></button></div></section>;
        })}</div></div>
      )}

      <button onClick={() => setReview(generatedWeeklyReview(tasksStore.records))} className="mt-2 inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 font-medium text-slate-200 hover:bg-slate-900"><Sparkles size={16} /> Generate Weekly Review</button>

      {review && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"><div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-6 shadow-2xl"><h2 className="mb-5 text-xl font-bold text-white">Weekly Review</h2><textarea value={review} onChange={(event) => setReview(event.target.value)} rows={14} className="mb-4 w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm text-slate-100" /><div className="flex gap-3"><CopyButton text={review} label="Copy Review" /><button onClick={() => setReview("")} className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-900">Close</button></div></div></div>}
      {editingPlan && <PlanModal plan={editingPlan} exists={plansStore.records.some((item) => item.id === editingPlan.id)} onCancel={() => setEditingPlan(null)} onSave={savePlan} />}
      {editingTask && <TaskModal task={editingTask} exists={tasksStore.records.some((task) => task.id === editingTask.id)} onCancel={() => setEditingTask(null)} onSave={saveTask} />}
    </div>
  );
}

function PlanModal({ plan, exists, onCancel, onSave }: { plan: WeeklyPlan; exists: boolean; onCancel: () => void; onSave: (event: FormEvent<HTMLFormElement>) => void }) { return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"><div className="w-full max-w-2xl rounded-lg border border-slate-800 bg-slate-950 p-6 shadow-2xl"><h2 className="mb-5 text-xl font-bold text-white">{exists ? "Edit Weekly Plan" : "Create Weekly Plan"}</h2><form onSubmit={onSave} className="space-y-4"><Input name="week_start_date" label="Week start" type="date" defaultValue={plan.week_start_date} /><Input name="weekly_theme" label="Weekly theme" defaultValue={plan.weekly_theme} /><Textarea name="top_3_priorities" label="Top 3 priorities" defaultValue={plan.top_3_priorities} /><div className="grid grid-cols-2 gap-3"><Input name="owner" label="Owner" defaultValue={plan.owner} /><SelectField name="status" label="Status" defaultValue={plan.status} options={planStatuses} /></div><Input name="key_metric_target" label="Key metric target" defaultValue={plan.key_metric_target || ""} /><Input name="actual_result" label="Actual result" defaultValue={plan.actual_result || ""} /><Textarea name="notes" label="Notes" defaultValue={plan.notes || ""} /><Actions onCancel={onCancel} label="Save Plan" /></form></div></div>; }
function TaskModal({ task, exists, onCancel, onSave }: { task: Task; exists: boolean; onCancel: () => void; onSave: (event: FormEvent<HTMLFormElement>) => void }) { const tracks = useLocalRecords<OperatingTrack>("operating_tracks", []).records; const kpis = useLocalRecords<KPI>("kpis", []).records; return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"><div className="w-full max-w-2xl rounded-lg border border-slate-800 bg-slate-950 p-6 shadow-2xl"><h2 className="mb-5 text-xl font-bold text-white">{exists ? "Edit Task" : "Add Task"}</h2><form onSubmit={onSave} className="space-y-4"><Input name="title" label="Title" defaultValue={task.title} required /><Textarea name="description" label="Description" defaultValue={task.description || ""} /><div className="grid grid-cols-3 gap-3"><Input name="owner" label="Owner" defaultValue={task.owner} /><SelectField name="priority" label="Priority" defaultValue={task.priority} options={priorities} /><SelectField name="status" label="Status" defaultValue={task.status} options={taskStatuses} /></div><div className="grid grid-cols-2 gap-3"><SelectLinked name="operating_track_id" label="Linked track" defaultValue={task.operating_track_id || ""} options={tracks.map((track) => ({ value: track.id, label: track.name }))} /><SelectLinked name="linked_kpi_id" label="Linked KPI" defaultValue={task.linked_kpi_id || ""} options={kpis.map((kpi) => ({ value: kpi.id, label: kpi.title }))} /></div><div className="grid grid-cols-3 gap-3"><Input name="effort_score" label="Effort" type="number" defaultValue={String(task.effort_score || 0)} /><Input name="impact_score" label="Impact" type="number" defaultValue={String(task.impact_score || 0)} /><Input name="urgency_score" label="Urgency" type="number" defaultValue={String(task.urgency_score || 0)} /></div><div className="grid grid-cols-3 gap-3"><Input name="due_date" label="Due date" type="date" defaultValue={task.due_date || ""} /><Input name="linked_strategy_pillar" label="Strategy pillar" defaultValue={task.linked_strategy_pillar || ""} /><Input name="linked_experiment" label="Experiment" defaultValue={task.linked_experiment || ""} /></div><Textarea name="notes" label="Notes" defaultValue={task.notes || ""} /><Actions onCancel={onCancel} label="Save Task" /></form></div></div>; }
function Actions({ onCancel, label }: { onCancel: () => void; label: string }) { return <div className="flex gap-3 pt-2"><button type="button" onClick={onCancel} className="flex-1 rounded-lg border border-slate-700 px-4 py-2 font-medium text-slate-300 hover:bg-slate-900">Cancel</button><button type="submit" className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500">{label}</button></div>; }
function Metric({ label, value, danger = false }: { label: string; value: number; danger?: boolean }) { return <div className={`rounded-lg border p-4 ${danger && value ? "border-red-900 bg-red-950/30" : "border-slate-800 bg-slate-900"}`}><p className="text-xs uppercase text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-white">{value}</p></div>; }
function Detail({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-slate-800 bg-slate-950 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 whitespace-pre-wrap text-sm font-medium text-slate-100">{value}</p></div>; }
function Input(props: { name: string; label: string; defaultValue?: string; type?: string; required?: boolean }) { return <label className="block"><span className="mb-1 block text-sm text-slate-400">{props.label}</span><input name={props.name} required={props.required} type={props.type || "text"} defaultValue={props.defaultValue} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none" /></label>; }
function SelectField(props: { name: string; label: string; defaultValue: string; options: string[] }) { return <label className="block"><span className="mb-1 block text-sm text-slate-400">{props.label}</span><select name={props.name} defaultValue={props.defaultValue} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none">{props.options.map((option) => <option key={option} value={option}>{option.replace(/_/g, " ")}</option>)}</select></label>; }
function SelectLinked(props: { name: string; label: string; defaultValue: string; options: Array<{ value: string; label: string }> }) { return <label className="block"><span className="mb-1 block text-sm text-slate-400">{props.label}</span><select name={props.name} defaultValue={props.defaultValue} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"><option value="">None</option>{props.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>; }
function Textarea(props: { name: string; label: string; defaultValue: string }) { return <label className="block"><span className="mb-1 block text-sm text-slate-400">{props.label}</span><textarea name={props.name} rows={4} defaultValue={props.defaultValue} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none" /></label>; }
