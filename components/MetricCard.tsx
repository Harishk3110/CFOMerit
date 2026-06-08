"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

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
  const getColors = (v: string) => {
    const colorMap: Record<string, string> = {
      default: "bg-white border-slate-200 text-slate-900",
      warning: "bg-yellow-50 border-yellow-200 text-yellow-900",
      danger: "bg-red-50 border-red-200 text-red-900",
      success: "bg-green-50 border-green-200 text-green-900",
    };
    return colorMap[v] || colorMap.default;
  };

  return (
    <div className={`border rounded-lg p-6 ${getColors(variant)}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {subtext && <p className="text-xs opacity-60 mt-1">{subtext}</p>}
        </div>
        {Icon && <Icon size={24} className="opacity-50" />}
      </div>
      {trend && (
        <div className="mt-4 text-xs">
          {trend === "up" && <span className="text-green-600">↑ Trending up</span>}
          {trend === "down" && <span className="text-red-600">↓ Trending down</span>}
          {trend === "stable" && (
            <span className="text-slate-600">→ Stable</span>
          )}
        </div>
      )}
    </div>
  );
}
