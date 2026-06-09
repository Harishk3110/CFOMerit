"use client";

import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  variant?: "default" | "warning" | "danger" | "success";
  subtext?: string;
  trend?: "up" | "down" | "stable";
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  variant = "default",
  subtext,
  trend,
}: MetricCardProps) {
  const colorMap: Record<NonNullable<MetricCardProps["variant"]>, string> = {
    default: "border-slate-800 bg-slate-900 text-slate-100",
    warning: "border-amber-900 bg-amber-950/40 text-amber-100",
    danger: "border-red-900 bg-red-950/40 text-red-100",
    success: "border-emerald-900 bg-emerald-950/40 text-emerald-100",
  };

  return (
    <div className={`rounded-lg border p-5 ${colorMap[variant]}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium opacity-75">{label}</p>
          <p className="mt-2 break-words text-2xl font-bold">{value}</p>
          {subtext && <p className="mt-1 text-xs opacity-70">{subtext}</p>}
        </div>
        {Icon && <Icon size={22} className="shrink-0 opacity-55" />}
      </div>
      {trend && (
        <p className="mt-4 text-xs opacity-75">
          {trend === "up" ? "Upward trend" : trend === "down" ? "Downward trend" : "Stable"}
        </p>
      )}
    </div>
  );
}
