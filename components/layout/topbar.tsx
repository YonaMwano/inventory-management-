"use client";

import Link from "next/link";
import { Search, Plus, Bell, LogOut, User } from "@/components/icons";
import { logoutAction } from "@/app/actions/auth";

type TopBarProps = {
  title?: string;
  userName?: string;
};

export function TopBar({ title, userName }: TopBarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-slate-900">
          {title || "Dashboard"}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search products, orders..."
            className="w-56 rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Quick actions */}
        <Link
          href="/sales"
          className="hidden items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 sm:inline-flex"
        >
          <Plus className="h-4 w-4" />
          New Sale
        </Link>
        <Link
          href="/inventory"
          className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:inline-flex"
        >
          <Plus className="h-4 w-4" />
          Product
        </Link>

        {/* Notifications */}
        <button
          type="button"
          className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>

        {/* User + logout */}
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 py-1 pl-2 pr-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
            <User className="h-3.5 w-3.5" />
          </div>
          <span className="hidden max-w-[100px] truncate text-sm font-medium text-slate-700 sm:inline">
            {userName || "User"}
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
