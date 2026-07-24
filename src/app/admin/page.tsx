import React from "react";
import db from "@/lib/db";
import {
  Users,
  Briefcase,
  BookOpen,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  Activity,
  DollarSign
} from "lucide-react";
import Link from "next/link";

export const revalidate = 0; // Disable caching to ensure fresh metrics

export default async function AdminDashboard() {
  // Query statistics in parallel
  const [
    studentsCount,
    staffCount,
    coursesCount,
    pendingAppsCount,
    recentAudits,
    financialSum,
    activeSession,
  ] = await Promise.all([
    db.student.count({ where: { isDeleted: false } }),
    db.staff.count({ where: { isDeleted: false } }),
    db.course.count({ where: { isDeleted: false } }),
    db.application.count({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] }, isDeleted: false } }),
    db.auditLog.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            role: { select: { name: true } }
          }
        }
      }
    }),
    db.payment.aggregate({
      _sum: {
        amountPaid: true
      },
      where: {
        status: "PAID",
        isDeleted: false
      }
    }),
    db.academicSession.findFirst({
      where: { isActive: true }
    })
  ]);

  const totalRevenue = financialSum._sum.amountPaid ? Number(financialSum._sum.amountPaid) : 0;

  const stats = [
    {
      name: "Enrolled Students",
      value: studentsCount,
      icon: Users,
      color: "from-blue-600/20 to-blue-500/5",
      iconColor: "text-blue-400",
      href: "/admin/students"
    },
    {
      name: "Staff & Faculty",
      value: staffCount,
      icon: Briefcase,
      color: "from-emerald-600/20 to-emerald-500/5",
      iconColor: "text-emerald-400",
      href: "/admin/staff"
    },
    {
      name: "Active Courses",
      value: coursesCount,
      icon: BookOpen,
      color: "from-violet-600/20 to-violet-500/5",
      iconColor: "text-violet-400",
      href: "/admin/programmes"
    },
    {
      name: "Pending Admissions",
      value: pendingAppsCount,
      icon: FileText,
      color: "from-amber-600/20 to-amber-500/5",
      iconColor: "text-amber-400",
      href: "/admin/admissions"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-red-950 border border-slate-800 rounded-3xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-600/10 via-transparent to-transparent opacity-60" />
        <div className="relative z-10">
          <span className="text-[10px] bg-red-600/15 border border-red-500/20 text-red-400 font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
            System Overview
          </span>
          <h2 className="text-xl md:text-3xl font-display font-black tracking-tight text-white mt-4">
            CrestOak ERP Administrative Portal
          </h2>
          <p className="text-slate-400 text-xs md:text-sm mt-2 max-w-xl font-medium">
            Welcome to the centralized management dashboard. Monitor college enrollment statistics, manage academic processes, and audit transactions in real-time.
          </p>
          {activeSession && (
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Active Academic Session: <strong className="text-white font-bold">{activeSession.name}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              href={stat.href}
              key={stat.name}
              className="group block bg-slate-950 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all hover:translate-y-[-2px] relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 h-24 w-24 bg-gradient-to-br ${stat.color} rounded-bl-full filter blur-xl opacity-50 group-hover:opacity-80 transition-opacity`} />
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.name}</p>
                  <p className="text-2xl md:text-3xl font-display font-black text-white mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2.5 bg-slate-900 border border-slate-800 rounded-xl ${stat.iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-slate-500 group-hover:text-white transition-colors">
                <span>Manage directory</span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Financial Overview & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Collections Overview */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-emerald-600/10 to-transparent rounded-bl-full filter blur-xl" />
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Total Collections</h3>
                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Gateway Transactions</span>
              </div>
              <div className="p-2.5 bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 rounded-xl">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <p className="text-3xl md:text-4xl font-display font-black text-white">
              ₦{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-slate-400 text-xs mt-3 leading-relaxed">
              Sum total of all successfully completed student tuition, accommodation, and registration fee payments routed through local payment channels.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span>Payments healthy</span>
            </span>
            <Link
              href="/admin/fees"
              className="text-red-400 hover:text-white font-bold transition-colors flex items-center gap-1"
            >
              <span>Ledger details</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Quick Launchpad */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-5 flex items-center gap-2">
            <Activity className="h-4.5 w-4.5 text-red-500" />
            <span>Administrative Tasks Launchpad</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {[
              { label: "Approve Admissions", href: "/admin/admissions", color: "hover:border-amber-500/40 hover:bg-amber-950/10" },
              { label: "Add New Student", href: "/admin/students", color: "hover:border-blue-500/40 hover:bg-blue-950/10" },
              { label: "Staff Directory", href: "/admin/staff", color: "hover:border-emerald-500/40 hover:bg-emerald-950/10" },
              { label: "Dispatch Invoices", href: "/admin/fees", color: "hover:border-indigo-500/40 hover:bg-indigo-950/10" },
              { label: "Announcements", href: "/admin/news", color: "hover:border-purple-500/40 hover:bg-purple-950/10" },
              { label: "Generate Reports", href: "/admin/reports", color: "hover:border-rose-500/40 hover:bg-rose-950/10" }
            ].map((btn) => (
              <Link
                key={btn.label}
                href={btn.href}
                className={`bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl text-center text-xs font-bold text-slate-300 transition-all ${btn.color}`}
              >
                {btn.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Audit Logs Stream */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">System Activity Logs</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Real-time recording of operations performed across administrative accounts.</p>
          </div>
          <div className="p-2 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl">
            <Clock className="h-4 w-4" />
          </div>
        </div>

        {recentAudits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Operator / Actor</th>
                  <th className="py-3 px-4">Operation</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {recentAudits.map((audit: any) => {
                  const actorName = audit.user
                    ? `${audit.user.firstName} ${audit.user.lastName}`
                    : "System Job";
                  const actorEmail = audit.user ? audit.user.email : "cron@crestoak";
                  
                  return (
                    <tr key={audit.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-medium">
                        {new Date(audit.createdAt).toLocaleString(undefined, {
                          month: "short",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit"
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-200">{actorName}</div>
                        <div className="text-[10px] text-slate-400">{actorEmail}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                          audit.action === "CREATE"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-900/30"
                            : audit.action === "UPDATE"
                            ? "bg-blue-950 text-blue-400 border border-blue-900/30"
                            : audit.action === "DELETE"
                            ? "bg-rose-950 text-rose-400 border border-rose-900/30"
                            : "bg-slate-900 text-slate-300 border border-slate-800"
                        }`}>
                          {audit.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-200 font-semibold">
                        {audit.entity}
                        {audit.entityId && (
                          <span className="block text-[10px] text-slate-400 font-normal truncate max-w-[120px] font-mono">
                            {audit.entityId}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">{audit.ipAddress || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 border border-dashed border-slate-800 rounded-xl text-center text-slate-500 font-bold uppercase tracking-wider text-[11px] bg-slate-900/20">
            No system audit entries logged yet.
          </div>
        )}
      </div>
    </div>
  );
}
