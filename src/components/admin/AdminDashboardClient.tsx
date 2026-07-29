"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Briefcase,
  BookOpen,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  Activity,
  DollarSign,
  Loader2
} from "lucide-react";
import Link from "next/link";

interface AuditLog {
  id: string;
  createdAt: string;
  action: string;
  entity: string;
  entityId?: string;
  ipAddress?: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface DashboardMetrics {
  studentsCount: number;
  staffCount: number;
  coursesCount: number;
  pendingAppsCount: number;
  totalRevenue: number;
  activeSession: { name: string } | null;
  recentAudits: AuditLog[];
}

export default function AdminDashboardClient() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    studentsCount: 0,
    staffCount: 0,
    coursesCount: 0,
    pendingAppsCount: 0,
    totalRevenue: 0,
    activeSession: { name: "2026/2027 Academic Session" },
    recentAudits: []
  });
  const [isLoading, setIsLoading] = useState(true);

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

  // Fetch metrics once authorized
  useEffect(() => {
    if (!isAuthorized) return;
    async function fetchStats() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/admin/stats.php", {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        if (response.ok) {
          const res = await response.json();
          if (res.success && res.data) {
            setMetrics({
              studentsCount: Number(res.data.studentsCount || 0),
              staffCount: Number(res.data.staffCount || 0),
              coursesCount: Number(res.data.coursesCount || 0),
              pendingAppsCount: Number(res.data.pendingAppsCount || 0),
              totalRevenue: Number(res.data.totalRevenue || 0),
              activeSession: res.data.activeSession || { name: "2026/2027 Academic Session" },
              recentAudits: Array.isArray(res.data.recentAudits) ? res.data.recentAudits : []
            });
          }
        }
      } catch (err) {
        console.warn("Failed to fetch live admin stats:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, [isAuthorized]);

  if (!isAuthorized) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-slate-600 font-medium text-sm">
          <Loader2 className="h-5 w-5 animate-spin text-red-600" />
          <span>Verifying admin credentials...</span>
        </div>
      </div>
    );
  }

  const stats = [
    {
      name: "Enrolled Students",
      value: metrics.studentsCount,
      icon: Users,
      color: "bg-blue-50 text-blue-600 border-blue-100",
      iconColor: "text-blue-600 bg-blue-100/60",
      href: "/admin/students"
    },
    {
      name: "Staff & Faculty",
      value: metrics.staffCount,
      icon: Briefcase,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
      iconColor: "text-emerald-600 bg-emerald-100/60",
      href: "/admin/staff"
    },
    {
      name: "Active Courses",
      value: metrics.coursesCount,
      icon: BookOpen,
      color: "bg-violet-50 text-violet-600 border-violet-100",
      iconColor: "text-violet-600 bg-violet-100/60",
      href: "/admin/programmes"
    },
    {
      name: "Pending Admissions",
      value: metrics.pendingAppsCount,
      icon: FileText,
      color: "bg-amber-50 text-amber-600 border-amber-100",
      iconColor: "text-amber-600 bg-amber-100/60",
      href: "/admin/admissions"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner - Deep Institutional Navy */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 border border-slate-800 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-lg text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-600/20 via-transparent to-transparent opacity-70" />
        <div className="relative z-10">
          <span className="text-[10px] bg-red-600/20 border border-red-400/30 text-red-300 font-bold uppercase tracking-widest px-3 py-1 rounded-full">
            System Executive Overview
          </span>
          <h2 className="text-xl md:text-3xl font-display font-black tracking-tight text-white mt-4">
            CrestOak Administrative Control Portal
          </h2>
          <p className="text-slate-300 text-xs md:text-sm mt-2 max-w-2xl font-medium leading-relaxed">
            Centralized management dashboard. Monitor college enrollment statistics, manage academic processes, inspect fee collections, and audit administrative activity logs.
          </p>
          {metrics.activeSession && (
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-200 bg-white/10 w-fit px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Active Academic Session: <strong className="text-white font-bold">{metrics.activeSession.name}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Cards Grid - Light Institutional Styling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              href={stat.href}
              prefetch={false}
              key={stat.name}
              className="group block bg-white border border-slate-200 rounded-2xl p-5 hover:border-red-300 transition-all hover:-translate-y-1 shadow-sm hover:shadow-md relative overflow-hidden"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.name}</p>
                  <p className="text-2xl md:text-3xl font-display font-black text-slate-900 mt-2">
                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-slate-400" /> : stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.iconColor} border border-transparent`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-slate-400 group-hover:text-red-600 transition-colors">
                <span>Manage directory</span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Financial Overview & Task Launchpad */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Collections Overview Card */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                Gateway Collections
              </span>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 mt-2">Total Settled Revenue</h3>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-display font-black text-slate-900 tracking-tight">
              {isLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              ) : (
                `₦${metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              )}
            </p>
            <p className="text-slate-500 text-xs mt-3 leading-relaxed font-medium">
              Sum total of all successfully completed student tuition, accommodation, and registration fee payments routed through local payment gateways.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1.5 font-semibold">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <span>Payments status healthy</span>
            </span>
            <Link
              href="/admin/fees"
              prefetch={false}
              className="text-red-600 hover:text-red-700 font-bold transition-colors flex items-center gap-1"
            >
              <span>Ledger details</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Administrative Quick Launchpad */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-5 flex items-center gap-2">
            <Activity className="h-4.5 w-4.5 text-red-600" />
            <span>Administrative Tasks Launchpad</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "Approve Admissions", href: "/admin/admissions", color: "hover:border-amber-300 hover:bg-amber-50/50 hover:text-amber-900" },
              { label: "Add New Student", href: "/admin/students", color: "hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-900" },
              { label: "Staff Directory", href: "/admin/staff", color: "hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-900" },
              { label: "Dispatch Invoices", href: "/admin/fees", color: "hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-900" },
              { label: "Announcements", href: "/admin/news", color: "hover:border-purple-300 hover:bg-purple-50/50 hover:text-purple-900" },
              { label: "Generate Reports", href: "/admin/reports", color: "hover:border-rose-300 hover:bg-rose-50/50 hover:text-rose-900" }
            ].map((btn) => (
              <Link
                key={btn.label}
                href={btn.href}
                prefetch={false}
                className={`bg-slate-50 border border-slate-200 p-4 rounded-xl text-center text-xs font-bold text-slate-700 transition-all ${btn.color} shadow-xs hover:shadow-sm`}
              >
                {btn.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Activity Stream Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">System Activity Audit Trail</h3>
            <p className="text-xs text-slate-500 mt-0.5">Real-time recording of operations performed across administrative accounts.</p>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl">
            <Clock className="h-4 w-4" />
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center flex justify-center items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
            <Loader2 className="h-5 w-5 animate-spin text-red-600" />
            <span>Loading audit trail...</span>
          </div>
        ) : metrics.recentAudits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs text-slate-700">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Operator / Actor</th>
                  <th className="py-3 px-4">Operation</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {metrics.recentAudits.map((audit: any) => {
                  const actorName = audit.user
                    ? `${audit.user.firstName} ${audit.user.lastName}`
                    : "System Job";
                  const actorEmail = audit.user ? audit.user.email : "cron@crestoak";
                  
                  return (
                    <tr key={audit.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-semibold">
                        {new Date(audit.createdAt).toLocaleString(undefined, {
                          month: "short",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit"
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{actorName}</div>
                        <div className="text-[10px] text-slate-500">{actorEmail}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                          audit.action === "CREATE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : audit.action === "UPDATE"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : audit.action === "DELETE"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}>
                          {audit.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-900 font-bold">
                        {audit.entity}
                        {audit.entityId && (
                          <span className="block text-[10px] text-slate-500 font-normal truncate max-w-[120px] font-mono">
                            {audit.entityId}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">{audit.ipAddress || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 font-bold uppercase tracking-wider text-[11px] bg-slate-50">
            No system audit entries logged yet.
          </div>
        )}
      </div>
    </div>
  );
}
