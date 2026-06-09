"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  text: string;
  label?: string;
}

export function CopyButton({ text, label = "Copy" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        copied
          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
          : "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
      }`}
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? "Copied!" : label}
    </button>
  );
}
