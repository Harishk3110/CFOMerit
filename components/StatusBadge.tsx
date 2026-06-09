"use client";

interface StatusBadgeProps {
  status: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

export function StatusBadge({ status, variant = "default" }: StatusBadgeProps) {
  const statusLower = status.toLowerCase();
  let autoVariant = variant;

  if (variant === "default") {
    if (["achieved", "on_track", "connected", "converted", "committed", "done"].some((term) => statusLower.includes(term))) {
      autoVariant = "success";
    } else if (["at_risk", "follow", "diligence", "in_progress", "this_week"].some((term) => statusLower.includes(term))) {
      autoVariant = "warning";
    } else if (["behind", "dead", "killed", "blocked", "critical", "not_interested"].some((term) => statusLower.includes(term))) {
      autoVariant = "danger";
    } else if (["draft", "backlog", "new", "target"].some((term) => statusLower.includes(term))) {
      autoVariant = "info";
    }
  }

  const colorMap: Record<string, string> = {
    default: "border-slate-700 bg-slate-800 text-slate-200",
    success: "border-emerald-800 bg-emerald-950/70 text-emerald-300",
    warning: "border-amber-800 bg-amber-950/70 text-amber-300",
    danger: "border-red-800 bg-red-950/70 text-red-300",
    info: "border-blue-800 bg-blue-950/70 text-blue-300",
  };

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${colorMap[autoVariant]}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
