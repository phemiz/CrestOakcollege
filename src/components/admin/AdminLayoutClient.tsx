"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  UserCheck,
  Users,
  Briefcase,
  CreditCard,
  Newspaper,
  Image,
  BookOpen,
  Building2,
  BarChart3,
  LogOut,
  Menu,
  X,
  User,
  ShieldAlert
} from "lucide-react";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    role: string;
  };
}

export default function AdminLayoutClient({ children, user }: AdminLayoutClientProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard, roles: ["Super Admin", "Admin", "Bursary", "Staff"] },
    { name: "Admissions", href: "/admin/admissions", icon: UserCheck, roles: ["Super Admin", "Admin", "Staff"] },
    { name: "Students Directory", href: "/admin/students", icon: Users, roles: ["Super Admin", "Admin", "Staff"] },
    { name: "Staff Management", href: "/admin/staff", icon: Briefcase, roles: ["Super Admin", "Admin"] },
    { name: "Fee Management", href: "/admin/fees", icon: CreditCard, roles: ["Super Admin", "Admin", "Bursary"] },
    { name: "News & Alerts", href: "/admin/news", icon: Newspaper, roles: ["Super Admin", "Admin", "Staff"] },
    { name: "Gallery Manager", href: "/admin/gallery", icon: Image, roles: ["Super Admin", "Admin", "Staff"] },
    { name: "Programmes", href: "/admin/programmes", icon: BookOpen, roles: ["Super Admin", "Admin", "Staff"] },
    { name: "Faculties & Depts", href: "/admin/faculties", icon: Building2, roles: ["Super Admin", "Admin"] },
    { name: "Analytics & Reports", href: "/admin/reports", icon: BarChart3, roles: ["Super Admin", "Admin", "Bursary"] },
  ];

  // Filter navigation by user role
  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user.role)
  );

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("cchsmt_user_session");
      localStorage.removeItem("cchsmt_demo_role");
      window.location.href = "/login";
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-950 border-b border-slate-800 h-16 flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-brand-red text-white p-1.5 rounded-lg">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <span className="font-display font-bold text-sm tracking-wider uppercase text-white">CrestOak Admin</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-slate-400 hover:text-white focus:outline-none"
        >
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 border-r border-slate-800 flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-20 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 text-white p-2 rounded-xl">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display font-black text-sm tracking-widest text-white leading-none uppercase">CrestOak</h1>
              <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">CMS Console</span>
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
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/10"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3 mb-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800/40">
            <div className="bg-red-600/15 border border-red-500/20 text-red-400 p-2 rounded-lg">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-200 truncate leading-none mb-1">{user.name}</p>
              <span className="inline-block text-[9px] bg-red-600/20 border border-red-500/30 text-red-400 font-bold uppercase tracking-widest px-1.5 py-0.5 rounded">
                {user.role}
              </span>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-red-950/40 hover:text-red-400 hover:border-red-900/30 text-slate-400 border border-slate-800/80 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
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
          className="fixed inset-0 z-30 bg-black/60 md:hidden backdrop-blur-xs"
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
