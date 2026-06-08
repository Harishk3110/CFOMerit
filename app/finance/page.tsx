"use client";

import React, { useState } from "react";
import { Plus, AlertCircle, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const costs = [
  {
    id: 1,
    vendor: "Supabase",
    category: "hosting",
    amount: 250,
    frequency: "monthly",
    recurring: true,
  },
  {
    id: 2,
    vendor: "Vercel",
    category: "hosting",
    amount: 150,
    frequency: "monthly",
    recurring: true,
  },
  {
    id: 3,
    vendor: "OpenAI API",
    category: "AI/API",
    amount: 500,
    frequency: "monthly",
    recurring: true,
  },
  {
    id: 4,
    vendor: "Domain + SSL",
    category: "software",
    amount: 50,
    frequency: "annual",
    recurring: true,
  },
  {
    id: 5,
    vendor: "Figma",
    category: "design",
    amount: 80,
    frequency: "monthly",
    recurring: true,
  },
  {
    id: 6,
    vendor: "Linear",
    category: "software",
    amount: 50,
    frequency: "monthly",
    recurring: true,
  },
  {
    id: 7,
    vendor: "Design Contractor",
    category: "contractor",
    amount: 3000,
    frequency: "one-time",
    recurring: false,
  },
];

const monthlyBurnData = [
  { month: "Feb", burn: 7200 },
  { month: "Mar", burn: 8100 },
  { month: "Apr", burn: 8500 },
  { month: "May", burn: 8300 },
  { month: "Jun", burn: 8500 },
];

const categorySpend = [
  { name: "Hosting", value: 400 },
  { name: "AI/API", value: 500 },
  { name: "Design", value: 80 },
  { name: "Software", value: 100 },
  { name: "Contractor", value: 3000 },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function FinancePage() {
  const monthlyRecurring = costs
    .filter((c) => c.recurring && c.frequency === "monthly")
    .reduce((sum, c) => sum + c.amount, 0);

  const annualOneTime = costs
    .filter((c) => !c.recurring)
    .reduce((sum, c) => sum + c.amount, 0);

  const monthlyBurn = monthlyRecurring + annualOneTime / 12;
  const monthlyRevenue = 2000; // Sample data
  const netBurn = monthlyBurn - monthlyRevenue;
  const currentCash = 68000;
  const runway = Math.round(currentCash / netBurn);

  const [showAddCost, setShowAddCost] = useState(false);

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Finance</h1>
          <p className="text-slate-600 mt-1">
            Cost tracking, burn rate, and runway visibility
          </p>
        </div>
        <button
          onClick={() => setShowAddCost(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Cost
        </button>
      </div>

      {/* Key Finance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-sm font-medium text-slate-600">Current Cash</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            ${currentCash.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-sm font-medium text-slate-600">Monthly Recurring</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            ${monthlyRecurring.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-sm font-medium text-slate-600">Monthly Revenue</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            ${monthlyRevenue.toLocaleString()}
          </p>
        </div>
        <div
          className={`rounded-lg border p-6 ${
            runway < 6
              ? "bg-red-50 border-red-200"
              : "bg-green-50 border-green-200"
          }`}
        >
          <p className="text-sm font-medium text-slate-600">Estimated Runway</p>
          <p
            className={`text-3xl font-bold mt-2 ${
              runway < 6 ? "text-red-900" : "text-green-900"
            }`}
          >
            {runway} months
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Burn Over Time */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Burn Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyBurnData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                formatter={(value) => `$${value}`}
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                }}
              />
              <Bar dataKey="burn" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Spend by Category */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Spend by Category
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categorySpend}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {categorySpend.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `$${value}`}
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {categorySpend.map((cat, idx) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="text-slate-700">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Runway Warning */}
      {runway < 6 && (
        <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-6 flex gap-4">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-900">
              ⚠️ Runway below 6 months
            </h3>
            <p className="text-red-800 mt-1">
              At current burn rate of ${monthlyBurn.toLocaleString()}/month, you have
              approximately {runway} months of cash left. Consider cost optimization or
              revenue acceleration.
            </p>
          </div>
        </div>
      )}

      {/* Costs Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-700">
                Vendor
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-700">
                Category
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-700">
                Amount
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-700">
                Frequency
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-700">
                Recurring
              </th>
            </tr>
          </thead>
          <tbody>
            {costs.map((cost) => (
              <tr key={cost.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">
                  {cost.vendor}
                </td>
                <td className="px-6 py-4 text-slate-600">{cost.category}</td>
                <td className="px-6 py-4 font-semibold text-slate-900">
                  ${cost.amount}
                </td>
                <td className="px-6 py-4 text-slate-600">{cost.frequency}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      cost.recurring
                        ? "bg-blue-100 text-blue-800"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {cost.recurring ? "Yes" : "No"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Cost Modal */}
      {showAddCost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Add Cost</h2>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Vendor Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Supabase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category
                </label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>software</option>
                  <option>hosting</option>
                  <option>AI/API</option>
                  <option>design</option>
                  <option>marketing</option>
                  <option>contractor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddCost(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Add Cost
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
