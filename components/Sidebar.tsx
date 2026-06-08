"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  TrendingUp,
  Zap,
  Settings,
  Menu,
  X,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Outreach", href: "/outreach", icon: Users },
  { name: "Investors", href: "/investors", icon: TrendingUp },
  { name: "Finance", href: "/finance", icon: DollarSign },
  { name: "Weekly Execution", href: "/weekly", icon: Zap },
  { name: "AI Briefings", href: "/briefings", icon: LayoutDashboard },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-slate-900 text-white"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold">Merit</h1>
          <p className="text-xs text-slate-400 mt-1">Command Center</p>
        </div>

        <nav className="mt-6 space-y-1 px-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-700 bg-slate-950">
          <p className="text-xs text-slate-400">
            Built for Merit founders. MVP v1.
          </p>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
        />
      )}
    </>
  );
}
