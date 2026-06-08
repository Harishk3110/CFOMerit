"use client";

import React from "react";

interface StatusBadgeProps {
  status: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

export function StatusBadge({ status, variant = "default" }: StatusBadgeProps) {
  const getColors = (v: string) => {
    const colorMap: Record<string, { bg: string; text: string }> = {
      default: { bg: "bg-slate-100", text: "text-slate-800" },
      success: { bg: "bg-green-100", text: "text-green-800" },
      warning: { bg: "bg-yellow-100", text: "text-yellow-800" },
      danger: { bg: "bg-red-100", text: "text-red-800" },
      info: { bg: "bg-blue-100", text: "text-blue-800" },
    };
    return colorMap[v] || colorMap.default;
  };

  // Auto-detect variant based on status
  let autoVariant = variant;
  if (!variant || variant === "default") {
    const statusLower = status.toLowerCase();
    if (
      statusLower.includes("connected") ||
      statusLower.includes("converted") ||
      statusLower.includes("committed") ||
      statusLower.includes("done")
    ) {
      autoVariant = "success";
    } else if (
      statusLower.includes("interested") ||
      statusLower.includes("dead") ||
      statusLower.includes("killed")
    ) {
      autoVariant = "danger";
    } else if (
      statusLower.includes("follow") ||
      statusLower.includes("diligence")
    ) {
      autoVariant = "warning";
    } else if (statusLower.includes("draft") || statusLower.includes("backlog")) {
      autoVariant = "info";
    }
  }

  const colors = getColors(autoVariant);

  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
    >
      {status}
    </span>
  );
}
