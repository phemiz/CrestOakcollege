"use client";

import React, { useState, useEffect } from "react";
import {
  Printer,
  TrendingUp,
  Award,
  Users,
  DollarSign,
  BarChart3,
  CheckCircle2,
  FileSpreadsheet,
  Loader2
} from "lucide-react";

interface ReportsClientProps {
  summaryStats?: {
    totalStudents: number;
    totalRevenue: number;
    avgCgpa: number;
    unpaidAmount: number;
  };
  deptDistribution?: {
    name: string;
    count: number;
  }[];
  revenueByFeeType?: {
    type: string;
    amount: number;
  }[];
  rawStudents?: {
    matricNo: string;
    name: string;
    department: string;
    level: number;
    cgpa: number;
    email: string;
  }[];
  rawPayments?: {
    reference: string;
    amountPaid: number;
    method: string;
    status: string;
    paidAt: string;
    studentName: string;
    matricNo: string;
    feeType: string;
  }[];
}

export default function ReportsClient({
  summaryStats: initialSummary,
  deptDistribution: initialDept,
  revenueByFeeType: initialRevenue,
  rawStudents: initialStudents,
  rawPayments: initialPayments
}: ReportsClientProps) {
  const [stats, setStats] = useState(initialSummary || {
    totalStudents: 0,
    totalRevenue: 0,
    avgCgpa: 0,
    unpaidAmount: 0
  });

  const [deptList, setDeptList] = useState(initialDept || []);
  const [revenueList, setRevenueList] = useState(initialRevenue || []);
  const [studentsList, setStudentsList] = useState(initialStudents || []);
  const [paymentsList, setPaymentsList] = useState(initialPayments || []);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLiveReports() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/admin/reports.php");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            if (data.summaryStats) {
              setStats({
                totalStudents: Number(data.summaryStats.totalStudents || 0),
                totalRevenue: Number(data.summaryStats.totalRevenue || 0),
                avgCgpa: Number(data.summaryStats.avgCgpa || 0),
                unpaidAmount: Number(data.summaryStats.unpaidAmount || 0)
              });
            }
            if (Array.isArray(data.deptDistribution)) setDeptList(data.deptDistribution);
            if (Array.isArray(data.revenueByFeeType)) setRevenueList(data.revenueByFeeType);
            if (Array.isArray(data.rawStudents)) setStudentsList(data.rawStudents);
            if (Array.isArray(data.rawPayments)) setPaymentsList(data.rawPayments);
          }
        }
      } catch (err) {
        console.warn("Reports live API fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLiveReports();
  }, []);

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert("No data available to export.");
      return;
    }
    
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    csvRows.push(headers.join(","));
    
    for (const row of data) {
      const values = headers.map((header) => {
        const val = row[header];
        const stringVal = val === null || val === undefined ? "" : String(val);
        const escaped = stringVal.replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(","));
    }
    
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          aside, nav, button, .no-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          .print-card {
            border: 1px solid #ccc !important;
            box-shadow: none !important;
            background: transparent !important;
            color: black !important;
          }
        }
      `}</style>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h2 className="text-2xl font-display font-black text-slate-900">Analytics & Reports</h2>
          <p className="text-xs text-slate-500 mt-1">Export student records, financial payment datasets, or generate printer summaries.</p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={handlePrint}
            className="bg-slate-900 hover:bg-slate-800 text-white font-display font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Printer className="h-4.5 w-4.5 text-slate-300" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Header */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-5 mb-8">
        <h1 className="text-2xl font-black uppercase font-display text-slate-900">CrestOak College ERP</h1>
        <p className="text-xs text-slate-600 mt-1">Official Institutional Analytics & Financial Collection Report Summary</p>
        <p className="text-[10px] text-slate-500 mt-0.5">Report generated on: {new Date().toLocaleString()}</p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs print-card">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Enrolled</span>
            <Users className="h-4 w-4 text-blue-600 no-print" />
          </div>
          <p className="text-2xl font-display font-black text-slate-900">
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-slate-400" /> : stats.totalStudents}
          </p>
          <span className="text-[10px] text-slate-500 font-semibold block mt-1">Active student folders</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs print-card">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Revenue</span>
            <DollarSign className="h-4 w-4 text-emerald-600 no-print" />
          </div>
          <p className="text-2xl font-display font-black text-slate-900">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            ) : (
              `₦${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
            )}
          </p>
          <span className="text-[10px] text-emerald-700 font-semibold block mt-1">Gateway cleared funds</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs print-card">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Academic CGPA</span>
            <Award className="h-4 w-4 text-amber-600 no-print" />
          </div>
          <p className="text-2xl font-display font-black text-slate-900">
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-slate-400" /> : stats.avgCgpa.toFixed(2)}
          </p>
          <span className="text-[10px] text-slate-500 font-semibold block mt-1">Current college average</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs print-card">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Receivables</span>
            <TrendingUp className="h-4 w-4 text-rose-600 no-print" />
          </div>
          <p className="text-2xl font-display font-black text-slate-900">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            ) : (
              `₦${stats.unpaidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
            )}
          </p>
          <span className="text-[10px] text-rose-700 font-semibold block mt-1">Outstanding billing invoice</span>
        </div>
      </div>

      {/* Analytics Charts/Data Split grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Demographics */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs print-card">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-red-600 no-print" />
            <span>Students by Department</span>
          </h3>
          {isLoading ? (
            <div className="py-8 flex justify-center text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin text-red-600" />
            </div>
          ) : deptList.length > 0 ? (
            <div className="space-y-4">
              {deptList.map((item) => {
                const maxCount = Math.max(...deptList.map((d) => d.count), 1);
                const percentage = (item.count / maxCount) * 100;
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">{item.name}</span>
                      <span className="text-slate-900 font-bold">{item.count} students</span>
                    </div>
                    <div className="h-2 bg-slate-100 border border-slate-200 rounded-full overflow-hidden no-print">
                      <div
                        className="h-full bg-red-600 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
              No department records registered yet.
            </div>
          )}
        </div>

        {/* Revenue Allocation */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs print-card">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 no-print" />
            <span>Revenue by Fee Category</span>
          </h3>
          {isLoading ? (
            <div className="py-8 flex justify-center text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
            </div>
          ) : revenueList.length > 0 ? (
            <div className="space-y-4">
              {revenueList.map((item) => {
                const maxAmount = Math.max(...revenueList.map((r) => r.amount), 1);
                const percentage = (item.amount / maxAmount) * 100;
                return (
                  <div key={item.type} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">{item.type}</span>
                      <span className="text-slate-900 font-bold">
                        ₦{item.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 border border-slate-200 rounded-full overflow-hidden no-print">
                      <div
                        className="h-full bg-emerald-600 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
              No fee collections recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* CSV Launchpad panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs no-print">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-5">
          Excel Data Exporters
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-slate-200 p-4 rounded-xl flex items-center justify-between bg-slate-50">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Undergraduate Registry List</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Exports matricNo, name, department, level, email, and CGPA.</p>
            </div>
            <button
              onClick={() => downloadCSV(studentsList, "crestoak-students-registry.csv")}
              className="bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-xl cursor-pointer transition-colors shadow-xs"
            >
              <FileSpreadsheet className="h-5 w-5" />
            </button>
          </div>

          <div className="border border-slate-200 p-4 rounded-xl flex items-center justify-between bg-slate-50">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Collections & Payment Reference</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Exports payment reference, amounts, payees, and methods.</p>
            </div>
            <button
              onClick={() => downloadCSV(paymentsList, "crestoak-payments-ledger.csv")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl cursor-pointer transition-colors shadow-xs"
            >
              <FileSpreadsheet className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
