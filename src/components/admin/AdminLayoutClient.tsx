"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  ShieldCheck,
  Loader2
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
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Enforce Login Gateway Guard
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuth = localStorage.getItem("isAuthenticated");
      if (!isAuth || isAuth !== "true") {
        window.location.replace("/login/?gateway=admin");
      } else {
        setIsAuthorized(true);
      }
    }
  }, []);

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard, roles: ["Super Admin", "Admin", "Bursary", "Staff"] },
    { name: "Admissions", href: "/admin/admissions", icon: UserCheck, roles: ["Super Admin", "Admin", "Staff"] },
    { name: "Students Management", href: "/admin/students", icon: Users, roles: ["Super Admin", "Admin", "Staff"] },
    { name: "Staff Management", href: "/admin/staff", icon: Briefcase, roles: ["Super Admin", "Admin"] },
    { name: "Fee Management", href: "/admin/fees", icon: CreditCard, roles: ["Super Admin", "Admin", "Bursary"] },
    { name: "News & Alerts", href: "/admin/news", icon: Newspaper, roles: ["Super Admin", "Admin", "Staff"] },
    { name: "Gallery Manager", href: "/admin/gallery", icon: Image, roles: ["Super Admin", "Admin", "Staff"] },
    { name: "Programmes", href: "/admin/programmes", icon: BookOpen, roles: ["Super Admin", "Admin", "Staff"] },
    { name: "Faculties & Depts", href: "/admin/faculties", icon: Building2, roles: ["Super Admin", "Admin"] },
    { name: "Analytics & Reports", href: "/admin/reports", icon: BarChart3, roles: ["Super Admin", "Admin", "Bursary"] },
  ];

  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user") || localStorage.getItem("cchsmt_user_session");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed && (parsed.username || parsed.name)) {
            setCurrentUser({
              name: parsed.name || parsed.username || user.name,
              email: parsed.email || `${parsed.username || "admin"}@crestoakcollege.com.ng`,
              role: parsed.role || user.role || "Admin",
            });
          }
        } catch (e) {}
      }
    }
  }, [user]);

  // Robust case-insensitive role filtering
  const userRoleUpper = (currentUser.role || "ADMIN").toString().trim().toUpperCase();
  const isAdminOrSuper = userRoleUpper.includes("ADMIN") || userRoleUpper.includes("SUPER");

  const filteredNavigation = navigation.filter((item) => {
    if (isAdminOrSuper || !userRoleUpper) return true;
    return item.roles.some((role) => role.toUpperCase() === userRoleUpper);
  });

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("userRole");
      localStorage.removeItem("cchsmt_user_session");
      localStorage.removeItem("cchsmt_demo_role");
      document.cookie = "crestoak_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.crestoakcollege.com.ng;";
      document.cookie = "crestoak_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "cchsmt_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.crestoakcollege.com.ng;";
      document.cookie = "cchsmt_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = "/login/?gateway=admin";
    }
  };

  // Auth Guard Loader Screen
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-xl max-w-sm w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center mx-auto">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-slate-900 text-base">Verifying Portal Credentials</h3>
            <p className="text-slate-500 text-xs mt-1">Redirecting to Admin Portal Login Gateway...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 h-16 flex items-center justify-between px-4 sticky top-0 z-50 text-white">
        <div className="flex items-center gap-2">
          <div className="bg-red-600 text-white p-1.5 rounded-lg">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="font-display font-black text-sm tracking-wider uppercase text-white">CrestOak Admin</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-slate-300 hover:text-white focus:outline-none"
        >
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto shadow-sm ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-20 border-b border-slate-100 flex items-center justify-between px-6 shrink-0 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 text-white p-2 rounded-xl shadow-md">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display font-black text-sm tracking-widest text-white leading-none uppercase">CrestOak</h1>
              <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">CMS Console</span>
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
            const isActive = pathname === item.href || (item.href === "/admin" && pathname === "/admin/dashboard");
            return (
              <Link
                key={item.name}
                href={item.href}
                prefetch={false}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3 mb-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <div className="bg-red-50 border border-red-100 text-red-600 p-2 rounded-lg">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate leading-none mb-1">{currentUser.name}</p>
              <span className="inline-block text-[9px] bg-slate-100 border border-slate-200 text-slate-700 font-bold uppercase tracking-widest px-1.5 py-0.5 rounded">
                {currentUser.role}
              </span>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
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
