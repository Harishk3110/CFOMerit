"use client";

import { FormEvent, useMemo, useState } from "react";
import { AlertCircle, Download, Plus, Trash2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Cost } from "@/lib/types";
import { financeMetrics, formatMoney, spendByCategory } from "@/lib/command-center";
import { seedCosts, seedFinanceSettings } from "@/lib/seed-data";
import { useLocalRecords } from "@/lib/use-local-records";

const categories: Cost["category"][] = ["software", "hosting", "AI/API", "design", "marketing", "legal", "accounting", "events", "contractor", "office", "travel", "miscellaneous"];
const frequencies: Cost["billing_frequency"][] = ["one-time", "monthly", "quarterly", "annual"];
const colors = ["#2563eb", "#059669", "#d97706", "#dc2626", "#7c3aed", "#0f766e", "#475569"];

export default function FinancePage() {
  const { records: costs, addRecord, deleteRecord } = useLocalRecords("merit.costs", seedCosts);
  const [showAddCost, setShowAddCost] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [vendorSearch, setVendorSearch] = useState("");

  const filteredCosts = costs.filter((cost) => {
    const matchesCategory = categoryFilter === "all" || cost.category === categoryFilter;
    const matchesVendor = cost.vendor.toLowerCase().includes(vendorSearch.toLowerCase());
    return matchesCategory && matchesVendor;
  });
  const metrics = financeMetrics(costs, seedFinanceSettings);
  const categoryData = spendByCategory(costs);
  const burnProjection = useMemo(
    () => [
      { month: "Current", burn: Math.round(metrics.monthlyBurn) },
      { month: "3 mo", burn: Math.round(metrics.projectedThreeMonthSpend) },
      { month: "6 mo", burn: Math.round(metrics.projectedSixMonthSpend) },
    ],
    [metrics.monthlyBurn, metrics.projectedSixMonthSpend, metrics.projectedThreeMonthSpend]
  );

  const addCost = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const frequency = String(data.get("billing_frequency")) as Cost["billing_frequency"];
    const record: Cost = {
      id: `cost-${crypto.randomUUID()}`,
      vendor: String(data.get("vendor") || "New vendor"),
      category: String(data.get("category")) as Cost["category"],
      amount: Number(data.get("amount") || 0),
      currency: "USD",
      billing_frequency: frequency,
      start_date: String(data.get("start_date") || new Date().toISOString().slice(0, 10)),
      payment_method: String(data.get("payment_method") || ""),
      owner: String(data.get("owner") || ""),
      is_recurring: frequency !== "one-time",
      notes: String(data.get("notes") || ""),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: "",
    };
    addRecord(record);
    setShowAddCost(false);
  };

  const exportCsv = () => {
    const rows = [
      ["vendor", "category", "amount", "currency", "billing_frequency", "start_date", "owner", "notes"],
      ...filteredCosts.map((cost) => [cost.vendor, cost.category, cost.amount, cost.currency, cost.billing_frequency, cost.start_date, cost.owner || "", cost.notes || ""]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "merit-costs.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl p-6 lg:p-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Finance</h1>
          <p className="mt-1 text-slate-600">Cost tracking, burn rate, and runway visibility.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50">
            <Download size={18} /> Export CSV
          </button>
          <button onClick={() => setShowAddCost(true)} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800">
            <Plus size={18} /> Add Cost
          </button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Metric label="Current Cash" value={formatMoney(seedFinanceSettings.current_cash_balance)} />
        <Metric label="Monthly Burn" value={formatMoney(metrics.monthlyBurn)} />
        <Metric label="Net Burn" value={metrics.isCashflowPositive ? "Cashflow positive" : formatMoney(metrics.netBurn)} />
        <Metric label="Runway" value={metrics.isCashflowPositive ? "Cashflow positive" : `${metrics.runwayMonths.toFixed(1)} months`} danger={!metrics.isCashflowPositive && metrics.runwayMonths < 3} />
        <Metric label="Recurring Monthly Costs" value={formatMoney(metrics.recurringMonthlyCosts)} />
        <Metric label="One-time Costs" value={formatMoney(metrics.oneTimeCosts)} />
        <Metric label="Budget Variance" value={formatMoney(metrics.budgetVariance)} danger={metrics.budgetVariance > 0} />
        <Metric label="6-month Projected Spend" value={formatMoney(metrics.projectedSixMonthSpend)} />
      </div>

      {!metrics.isCashflowPositive && metrics.runwayMonths < 3 && (
        <div className="mb-8 flex gap-4 rounded-lg border border-red-200 bg-red-50 p-5 text-red-900">
          <AlertCircle className="shrink-0" />
          <p>Runway is below 3 months. Review contractor, AI/API, and discretionary costs before adding new spend.</p>
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-lg border border-slate-200 bg-white p-6 lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold text-slate-950">Burn Projection</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={burnProjection}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip formatter={(value) => formatMoney(Number(value))} />
              <Bar dataKey="burn" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-bold text-slate-950">Spend by Category</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categoryData} innerRadius={55} outerRadius={90} dataKey="value">
                {categoryData.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
              </Pie>
              <Tooltip formatter={(value) => formatMoney(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2 text-sm">
            {categoryData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />{item.name}</span>
                <span className="font-semibold">{formatMoney(item.value)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <input value={vendorSearch} onChange={(event) => setVendorSearch(event.target.value)} placeholder="Search vendor" className="min-w-64 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">All categories</option>
          {categories.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[760px]">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              {["Vendor", "Category", "Amount", "Frequency", "Owner", "Recurring", ""].map((head) => (
                <th key={head} className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-600">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredCosts.map((cost) => (
              <tr key={cost.id} className="border-b border-slate-100 last:border-0">
                <td className="px-5 py-4 font-medium text-slate-950">{cost.vendor}</td>
                <td className="px-5 py-4 text-slate-700">{cost.category}</td>
                <td className="px-5 py-4 font-semibold">{formatMoney(cost.amount, cost.currency)}</td>
                <td className="px-5 py-4 text-slate-700">{cost.billing_frequency}</td>
                <td className="px-5 py-4 text-slate-700">{cost.owner || "Unassigned"}</td>
                <td className="px-5 py-4 text-slate-700">{cost.is_recurring ? "Yes" : "No"}</td>
                <td className="px-5 py-4 text-right">
                  <button onClick={() => window.confirm(`Delete ${cost.vendor}?`) && deleteRecord(cost.id)} className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-700" aria-label={`Delete ${cost.vendor}`}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filteredCosts.length && <p className="p-8 text-center text-sm text-slate-600">No costs match the current filters.</p>}
      </div>

      {showAddCost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-5 text-xl font-bold text-slate-950">Add Cost</h2>
            <form onSubmit={addCost} className="space-y-4">
              <input name="vendor" required placeholder="Vendor" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              <div className="grid grid-cols-2 gap-3">
                <select name="category" className="rounded-lg border border-slate-300 px-3 py-2">{categories.map((category) => <option key={category}>{category}</option>)}</select>
                <input name="amount" required type="number" min="0" step="0.01" placeholder="Amount" className="rounded-lg border border-slate-300 px-3 py-2" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select name="billing_frequency" className="rounded-lg border border-slate-300 px-3 py-2">{frequencies.map((frequency) => <option key={frequency}>{frequency}</option>)}</select>
                <input name="start_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="rounded-lg border border-slate-300 px-3 py-2" />
              </div>
              <input name="owner" placeholder="Owner" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              <input name="payment_method" placeholder="Payment method" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              <textarea name="notes" rows={3} placeholder="Notes" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddCost(false)} className="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 rounded-lg bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800">Save Cost</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className={`rounded-lg border p-5 ${danger ? "border-red-200 bg-red-50" : "border-slate-200 bg-white"}`}>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${danger ? "text-red-900" : "text-slate-950"}`}>{value}</p>
    </div>
  );
}
