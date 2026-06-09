"use client";

import { FormEvent, useMemo, useState } from "react";
import { Download, Edit, Plus, Trash2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { emptyFinanceSettings, financeMetrics, formatMoney } from "@/lib/command-center";
import type { Cost, FinanceSettings } from "@/lib/types";
import { useLocalRecords } from "@/lib/use-local-records";

const categories: Cost["category"][] = ["software", "hosting", "AI/API", "design", "marketing", "legal", "accounting", "events", "contractor", "office", "travel", "miscellaneous"];
const frequencies: Cost["billing_frequency"][] = ["one-time", "monthly", "quarterly", "annual"];
const qualities: NonNullable<Cost["expense_quality"]>[] = ["essential", "useful", "questionable", "cut_candidate"];
const renewalCutoff = new Date();
renewalCutoff.setDate(renewalCutoff.getDate() + 14);
const renewalCutoffIso = renewalCutoff.toISOString().slice(0, 10);

const emptyCost = (): Cost => {
  const now = new Date().toISOString();
  return { id: `cost-${crypto.randomUUID()}`, vendor: "", category: "software", amount: 0, currency: "USD", billing_frequency: "monthly", start_date: new Date().toISOString().slice(0, 10), payment_method: "", owner: "", is_recurring: true, notes: "", receipt_url: "", expense_quality: "useful", renewal_date: "", cancel_url: "", created_at: now, updated_at: now, created_by: "" };
};

export default function FinancePage() {
  const costsStore = useLocalRecords<Cost>("costs", []);
  const settingsStore = useLocalRecords<FinanceSettings>("finance_settings", [emptyFinanceSettings()]);
  const settings = settingsStore.records[0] || emptyFinanceSettings();
  const [editingCost, setEditingCost] = useState<Cost | null>(null);
  const [editingSettings, setEditingSettings] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [vendorSearch, setVendorSearch] = useState("");

  const filteredCosts = costsStore.records.filter((cost) => (categoryFilter === "all" || cost.category === categoryFilter) && cost.vendor.toLowerCase().includes(vendorSearch.toLowerCase()));
  const metrics = financeMetrics(costsStore.records, settings);
  const projection = useMemo(() => [
    { label: "Monthly", value: Math.round(metrics.monthlyBurn) },
    { label: "3 months", value: Math.round(metrics.projectedThreeMonthSpend) },
    { label: "6 months", value: Math.round(metrics.projectedSixMonthSpend) },
  ], [metrics.monthlyBurn, metrics.projectedSixMonthSpend, metrics.projectedThreeMonthSpend]);

  const saveCost = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingCost) return;
    const data = new FormData(event.currentTarget);
    const frequency = String(data.get("billing_frequency")) as Cost["billing_frequency"];
    const record: Cost = {
      ...editingCost,
      vendor: String(data.get("vendor") || ""),
      category: String(data.get("category")) as Cost["category"],
      amount: Number(data.get("amount") || 0),
      currency: String(data.get("currency") || settings.currency || "USD"),
      billing_frequency: frequency,
      start_date: String(data.get("start_date") || ""),
      payment_method: String(data.get("payment_method") || ""),
      owner: String(data.get("owner") || ""),
      is_recurring: data.get("is_recurring") === "on",
      expense_quality: String(data.get("expense_quality") || "useful") as Cost["expense_quality"],
      renewal_date: String(data.get("renewal_date") || ""),
      cancel_url: String(data.get("cancel_url") || ""),
      notes: String(data.get("notes") || ""),
      updated_at: new Date().toISOString(),
    };
    if (costsStore.records.some((cost) => cost.id === record.id)) costsStore.updateRecord(record.id, record);
    else costsStore.addRecord(record);
    setEditingCost(null);
  };

  const saveSettings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const record: FinanceSettings = {
      ...settings,
      current_cash_balance: Number(data.get("current_cash_balance") || 0),
      monthly_revenue: Number(data.get("monthly_revenue") || 0),
      expected_monthly_revenue: Number(data.get("expected_monthly_revenue") || 0),
      target_monthly_budget: Number(data.get("target_monthly_budget") || 0),
      currency: String(data.get("currency") || "USD"),
      updated_at: new Date().toISOString(),
    };
    settingsStore.setRecords([record]);
    setEditingSettings(false);
  };

  const deleteCost = (cost: Cost) => {
    if (window.confirm(`Delete cost "${cost.vendor}"?`)) costsStore.deleteRecord(cost.id);
  };

  const exportCsv = () => {
    const rows = [["vendor", "category", "amount", "currency", "billing_frequency", "is_recurring", "owner", "start_date"], ...filteredCosts.map((cost) => [cost.vendor, cost.category, cost.amount, cost.currency, cost.billing_frequency, cost.is_recurring, cost.owner || "", cost.start_date])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "merit-costs.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl p-6 lg:p-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div><h1 className="text-3xl font-bold text-white">Finance</h1><p className="mt-1 text-slate-400">Costs, burn, runway, and finance settings.</p></div>
        <div className="flex gap-3"><button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 font-medium text-slate-200 hover:bg-slate-900"><Download size={18} /> Export CSV</button><button onClick={() => setEditingCost(emptyCost())} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500"><Plus size={18} /> Add Cost</button></div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Metric label="Cash balance" value={formatMoney(settings.current_cash_balance, settings.currency)} />
        <Metric label="Monthly burn" value={formatMoney(metrics.monthlyBurn, settings.currency)} />
        <Metric label="Net burn" value={metrics.isCashflowPositive ? "Cashflow positive" : formatMoney(metrics.netBurn, settings.currency)} />
        <Metric label="Runway" value={costsStore.records.length || settings.current_cash_balance ? metrics.isCashflowPositive ? "Cashflow positive" : `${metrics.runwayMonths.toFixed(1)} months` : "No data"} danger={!metrics.isCashflowPositive && metrics.runwayMonths < 3} />
      </div>

      <section className="mb-6 rounded-lg border border-slate-800 bg-slate-900 p-5">
        <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold text-white">Finance Settings</h2><button onClick={() => setEditingSettings(true)} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"><Edit size={16} /> Edit</button></div>
        <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-5"><Detail label="Cash" value={formatMoney(settings.current_cash_balance, settings.currency)} /><Detail label="Monthly revenue" value={formatMoney(settings.monthly_revenue, settings.currency)} /><Detail label="Expected revenue" value={formatMoney(settings.expected_monthly_revenue, settings.currency)} /><Detail label="Budget" value={formatMoney(settings.target_monthly_budget, settings.currency)} /><Detail label="Currency" value={settings.currency} /></div>
      </section>

      <section className="mb-6 rounded-lg border border-slate-800 bg-slate-900 p-5">
        <h2 className="mb-4 font-semibold text-white">Finance Action List</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {!settings.current_cash_balance && <Warning text="No cash balance set. Update finance settings." />}
          {!costsStore.records.length && <Warning text="No costs tracked. Add current software and operating costs." />}
          {!metrics.isCashflowPositive && metrics.runwayMonths < 3 && <Warning text="Runway below 3 months. Review burn and fundraising plan." />}
          {metrics.monthlyBurn > settings.target_monthly_budget && settings.target_monthly_budget > 0 && <Warning text="Monthly burn is above target budget." />}
          {costsStore.records.filter((cost) => cost.expense_quality === "cut_candidate").map((cost) => <Warning key={cost.id} text={`Review cut candidate: ${cost.vendor}`} />)}
          {costsStore.records.filter((cost) => cost.renewal_date && cost.renewal_date <= renewalCutoffIso).map((cost) => <Warning key={cost.id} text={`Upcoming renewal: ${cost.vendor} on ${cost.renewal_date}`} />)}
        </div>
      </section>

      {costsStore.records.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-800 bg-slate-900 p-10 text-center"><p className="text-lg font-semibold text-slate-100">No costs tracked yet. Add your first cost to calculate burn and runway.</p><button onClick={() => setEditingCost(emptyCost())} className="mt-5 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500">Add Cost</button></div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <section className="rounded-lg border border-slate-800 bg-slate-900 p-5 lg:col-span-2"><h2 className="mb-4 font-semibold text-white">Spend Projection</h2><ResponsiveContainer width="100%" height={260}><BarChart data={projection}><CartesianGrid strokeDasharray="3 3" stroke="#1e293b" /><XAxis dataKey="label" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip contentStyle={{ background: "#020617", border: "1px solid #334155", color: "#e2e8f0" }} formatter={(value) => formatMoney(Number(value), settings.currency)} /><Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></section>
            <section className="rounded-lg border border-slate-800 bg-slate-900 p-5"><h2 className="mb-4 font-semibold text-white">Cost Breakdown</h2><div className="space-y-3"><Detail label="Recurring monthly" value={formatMoney(metrics.recurringMonthlyCosts, settings.currency)} /><Detail label="One-time costs" value={formatMoney(metrics.oneTimeCosts, settings.currency)} /><Detail label="Budget variance" value={formatMoney(metrics.budgetVariance, settings.currency)} /></div></section>
          </div>
          <div className="mb-4 flex flex-wrap gap-3"><input value={vendorSearch} onChange={(event) => setVendorSearch(event.target.value)} placeholder="Search vendor" className="min-w-72 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500" /><Select value={categoryFilter} onChange={setCategoryFilter} options={["all", ...categories]} /></div>
          <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900"><table className="w-full min-w-[980px]"><thead className="bg-slate-950"><tr>{["Vendor", "Category", "Amount", "Frequency", "Recurring", "Quality", "Renewal", "Owner", "Actions"].map((head) => <th key={head} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">{head}</th>)}</tr></thead><tbody>{filteredCosts.map((cost) => <tr key={cost.id} className="border-t border-slate-800 hover:bg-slate-800/60"><td className="px-4 py-4 font-medium text-slate-100">{cost.vendor}</td><td className="px-4 py-4 text-sm text-slate-400">{cost.category}</td><td className="px-4 py-4 text-sm text-slate-300">{formatMoney(cost.amount, cost.currency)}</td><td className="px-4 py-4 text-sm text-slate-400">{cost.billing_frequency}</td><td className="px-4 py-4 text-sm text-slate-400">{cost.is_recurring ? "Yes" : "No"}</td><td className="px-4 py-4 text-sm text-slate-400">{cost.expense_quality || "-"}</td><td className="px-4 py-4 text-sm text-slate-400">{cost.renewal_date || "-"}</td><td className="px-4 py-4 text-sm text-slate-400">{cost.owner}</td><td className="px-4 py-4"><div className="flex gap-2"><button onClick={() => setEditingCost(cost)} className="rounded-md border border-slate-700 p-2 text-slate-300 hover:bg-slate-800"><Edit size={16} /></button><button onClick={() => deleteCost(cost)} className="rounded-md border border-red-900 p-2 text-red-300 hover:bg-red-950"><Trash2 size={16} /></button></div></td></tr>)}</tbody></table>{!filteredCosts.length && <p className="p-8 text-center text-sm text-slate-500">No costs match the current filters.</p>}</div>
        </>
      )}

      {editingCost && <CostModal cost={editingCost} exists={costsStore.records.some((cost) => cost.id === editingCost.id)} onCancel={() => setEditingCost(null)} onSave={saveCost} />}
      {editingSettings && <SettingsModal settings={settings} onCancel={() => setEditingSettings(false)} onSave={saveSettings} />}
    </div>
  );
}

function CostModal({ cost, exists, onCancel, onSave }: { cost: Cost; exists: boolean; onCancel: () => void; onSave: (event: FormEvent<HTMLFormElement>) => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"><div className="w-full max-w-2xl rounded-lg border border-slate-800 bg-slate-950 p-6 shadow-2xl"><h2 className="mb-5 text-xl font-bold text-white">{exists ? "Edit Cost" : "Add Cost"}</h2><form onSubmit={onSave} className="space-y-4"><div className="grid grid-cols-2 gap-3"><Input name="vendor" label="Vendor" defaultValue={cost.vendor} required /><SelectField name="category" label="Category" defaultValue={cost.category} options={categories} /></div><div className="grid grid-cols-3 gap-3"><Input name="amount" label="Amount" type="number" defaultValue={String(cost.amount)} /><Input name="currency" label="Currency" defaultValue={cost.currency} /><SelectField name="billing_frequency" label="Frequency" defaultValue={cost.billing_frequency} options={frequencies} /></div><div className="grid grid-cols-3 gap-3"><Input name="start_date" label="Date" type="date" defaultValue={cost.start_date} /><Input name="renewal_date" label="Renewal date" type="date" defaultValue={cost.renewal_date || ""} /><SelectField name="expense_quality" label="Quality" defaultValue={cost.expense_quality || "useful"} options={qualities} /></div><div className="grid grid-cols-3 gap-3"><Input name="owner" label="Owner" defaultValue={cost.owner || ""} /><Input name="payment_method" label="Payment method" defaultValue={cost.payment_method || ""} /><Input name="cancel_url" label="Cancel URL" defaultValue={cost.cancel_url || ""} /></div><label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" name="is_recurring" defaultChecked={cost.is_recurring} className="h-4 w-4 accent-blue-600" /> Recurring</label><Textarea name="notes" label="Notes" defaultValue={cost.notes || ""} /><div className="flex gap-3 pt-2"><button type="button" onClick={onCancel} className="flex-1 rounded-lg border border-slate-700 px-4 py-2 font-medium text-slate-300 hover:bg-slate-900">Cancel</button><button type="submit" className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500">Save Cost</button></div></form></div></div>;
}

function SettingsModal({ settings, onCancel, onSave }: { settings: FinanceSettings; onCancel: () => void; onSave: (event: FormEvent<HTMLFormElement>) => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"><div className="w-full max-w-xl rounded-lg border border-slate-800 bg-slate-950 p-6 shadow-2xl"><h2 className="mb-5 text-xl font-bold text-white">Edit Finance Settings</h2><form onSubmit={onSave} className="space-y-4"><Input name="current_cash_balance" label="Current cash balance" type="number" defaultValue={String(settings.current_cash_balance)} /><Input name="monthly_revenue" label="Monthly revenue" type="number" defaultValue={String(settings.monthly_revenue)} /><Input name="expected_monthly_revenue" label="Expected monthly revenue" type="number" defaultValue={String(settings.expected_monthly_revenue)} /><Input name="target_monthly_budget" label="Monthly budget" type="number" defaultValue={String(settings.target_monthly_budget)} /><Input name="currency" label="Currency" defaultValue={settings.currency} /><div className="flex gap-3 pt-2"><button type="button" onClick={onCancel} className="flex-1 rounded-lg border border-slate-700 px-4 py-2 font-medium text-slate-300 hover:bg-slate-900">Cancel</button><button type="submit" className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500">Save Settings</button></div></form></div></div>;
}

function Metric({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) { return <div className={`rounded-lg border p-4 ${danger ? "border-red-900 bg-red-950/30" : "border-slate-800 bg-slate-900"}`}><p className="text-xs uppercase text-slate-500">{label}</p><p className="mt-2 text-xl font-bold text-white">{value}</p></div>; }
function Detail({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-slate-800 bg-slate-950 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-sm font-medium text-slate-100">{value}</p></div>; }
function Warning({ text }: { text: string }) { return <div className="rounded-lg border border-amber-900 bg-amber-950/30 p-3 text-sm text-amber-200">{text}</div>; }
function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) { return <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none">{options.map((option) => <option key={option} value={option}>{option.replace(/_/g, " ")}</option>)}</select>; }
function Input(props: { name: string; label: string; defaultValue?: string; type?: string; required?: boolean }) { return <label className="block"><span className="mb-1 block text-sm text-slate-400">{props.label}</span><input name={props.name} required={props.required} type={props.type || "text"} defaultValue={props.defaultValue} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none" /></label>; }
function SelectField(props: { name: string; label: string; defaultValue: string; options: string[] }) { return <label className="block"><span className="mb-1 block text-sm text-slate-400">{props.label}</span><select name={props.name} defaultValue={props.defaultValue} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none">{props.options.map((option) => <option key={option} value={option}>{option.replace(/_/g, " ")}</option>)}</select></label>; }
function Textarea(props: { name: string; label: string; defaultValue: string }) { return <label className="block"><span className="mb-1 block text-sm text-slate-400">{props.label}</span><textarea name={props.name} rows={3} defaultValue={props.defaultValue} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none" /></label>; }
