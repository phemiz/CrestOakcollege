"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  FileText,
  Printer,
  LogOut,
  Menu,
  X,
  User,
  ExternalLink,
  GraduationCap
} from "lucide-react";

interface PortalLayoutClientProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    role: string;
  };
  hasAdmissionLetter: boolean;
}

export default function PortalLayoutClient({
  children,
  user,
  hasAdmissionLetter
}: PortalLayoutClientProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation = [
    { name: "Dashboard Home", href: "/admissions/portal", icon: LayoutDashboard },
    { name: "Application Form", href: "/admissions/portal/apply", icon: FileText },
  ];

  if (hasAdmissionLetter) {
    navigation.push({ name: "Admission Letter", href: "/admissions/portal/letter", icon: Printer });
  }

  const handleSignOut = () => {
    document.cookie = "cchsmt_user_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 text-white p-1.5 rounded-lg shadow-xs">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-display font-black text-sm tracking-wider uppercase text-slate-900">CrestOak Apply</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-slate-600 hover:text-slate-900 focus:outline-none"
        >
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-20 border-b border-slate-100 flex items-center justify-between px-6 shrink-0 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 text-white p-2 rounded-xl shadow-xs">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display font-black text-sm tracking-widest text-white leading-none uppercase">CrestOak</h1>
              <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Admissions</span>
            </div>
          </div>
          {/* Close button on mobile */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Navigation Links */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1.5 scrollbar-thin">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                prefetch={false}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <Link
            href="/admissions"
            prefetch={false}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <ExternalLink className="h-4.5 w-4.5 shrink-0" />
            <span>Admissions Info</span>
          </Link>
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3 mb-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <div className="bg-indigo-50 border border-indigo-100 text-indigo-600 p-2 rounded-lg">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate leading-none mb-1">{user.name}</p>
              <span className="inline-block text-[9px] bg-slate-100 border border-slate-200 text-slate-700 font-bold uppercase tracking-widest px-1.5 py-0.5 rounded">
                APPLICANT
              </span>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-red-50 hover:text-red-600 text-slate-600 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/50 md:hidden backdrop-blur-xs"
        />
      )}

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Workspace Children */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
