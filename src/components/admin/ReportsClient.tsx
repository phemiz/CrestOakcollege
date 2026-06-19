"use client";

import React from "react";
import {
  Download,
  Printer,
  TrendingUp,
  Award,
  Users,
  DollarSign,
  BarChart3,
  CheckCircle2,
  FileSpreadsheet
} from "lucide-react";

interface ReportsClientProps {
  summaryStats: {
    totalStudents: number;
    totalRevenue: number;
    avgCgpa: number;
    unpaidAmount: number;
  };
  deptDistribution: {
    name: string;
    count: number;
  }[];
  revenueByFeeType: {
    type: string;
    amount: number;
  }[];
  rawStudents: {
    matricNo: string;
    name: string;
    department: string;
    level: number;
    cgpa: number;
    email: string;
  }[];
  rawPayments: {
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
  summaryStats,
  deptDistribution,
  revenueByFeeType,
  rawStudents,
  rawPayments
}: ReportsClientProps) {

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert("No data available to export.");
      return;
    }
    
    // Get headers
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    // Add header row
    csvRows.push(headers.join(","));
    
    // Add data rows
    for (const row of data) {
      const values = headers.map((header) => {
        const val = row[header];
        const stringVal = val === null || val === undefined ? "" : String(val);
        // Escape double quotes and wrap in quotes if it contains comma/newline
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
      {/* Print styles override */}
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
          .text-white {
            color: black !important;
          }
          .text-slate-400 {
            color: #555 !important;
          }
        }
      `}</style>

      {/* Header section (hidden during print) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h2 className="text-xl font-display font-black text-white">Analytics & Reports</h2>
          <p className="text-xs text-slate-400 mt-1">Export student records, financial payments datasets, or generate printer summaries.</p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={handlePrint}
            className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 font-display font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Printer className="h-4.5 w-4.5 text-slate-400" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Header (Visible only when printing) */}
      <div className="hidden print:block border-b-2 border-slate-800 pb-5 mb-8">
        <h1 className="text-2xl font-black uppercase font-display text-slate-900">CrestOak College ERP</h1>
        <p className="text-xs text-slate-600 mt-1">Official Institutional Analytics & Financial Collection Report Summary</p>
        <p className="text-[10px] text-slate-500 mt-0.5">Report generated on: {new Date().toLocaleString()}</p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 print-card">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Enrolled</span>
            <Users className="h-4 w-4 text-blue-400 no-print" />
          </div>
          <p className="text-2xl font-display font-black text-white">{summaryStats.totalStudents}</p>
          <span className="text-[9px] text-slate-500 font-semibold block mt-1">Active student folders</span>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 print-card">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
            <DollarSign className="h-4 w-4 text-emerald-400 no-print" />
          </div>
          <p className="text-2xl font-display font-black text-white">
            ₦{summaryStats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[9px] text-emerald-500 font-semibold block mt-1">Gateway cleared funds</span>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 print-card">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Academic CGPA</span>
            <Award className="h-4 w-4 text-amber-400 no-print" />
          </div>
          <p className="text-2xl font-display font-black text-white">{summaryStats.avgCgpa.toFixed(2)}</p>
          <span className="text-[9px] text-slate-500 font-semibold block mt-1">Current college average</span>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 print-card">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Receivables</span>
            <TrendingUp className="h-4 w-4 text-rose-400 no-print" />
          </div>
          <p className="text-2xl font-display font-black text-white">
            ₦{summaryStats.unpaidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[9px] text-rose-500 font-semibold block mt-1">Outstanding billing invoice</span>
        </div>
      </div>

      {/* Analytics Charts/Data Split grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Demographics */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 print-card">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-red-500 no-print" />
            <span>Students by Department</span>
          </h3>
          <div className="space-y-4">
            {deptDistribution.map((item) => {
              const maxCount = Math.max(...deptDistribution.map((d) => d.count), 1);
              const percentage = (item.count / maxCount) * 100;
              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-350">{item.name}</span>
                    <span className="text-slate-200">{item.count} students</span>
                  </div>
                  <div className="h-2 bg-slate-900 border border-slate-850 rounded-full overflow-hidden no-print">
                    <div
                      className="h-full bg-red-600 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue Allocation */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 print-card">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 no-print" />
            <span>Revenue by Fee Category</span>
          </h3>
          <div className="space-y-4">
            {revenueByFeeType.map((item) => {
              const maxAmount = Math.max(...revenueByFeeType.map((r) => r.amount), 1);
              const percentage = (item.amount / maxAmount) * 100;
              return (
                <div key={item.type} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-350">{item.type}</span>
                    <span className="text-slate-200">
                      ₦{item.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-900 border border-slate-850 rounded-full overflow-hidden no-print">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CSV Launchpad panel (hidden during print) */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 no-print">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-5">
          Excel Data Exporters
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-slate-850 p-4 rounded-xl flex items-center justify-between bg-slate-900/40">
            <div>
              <h4 className="text-xs font-bold text-slate-250">Undergraduate Registry List</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Exports matricNo, name, department, level, email, and CGPA.</p>
            </div>
            <button
              onClick={() => downloadCSV(rawStudents, "crestoak-students-registry.csv")}
              className="bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-xl cursor-pointer transition-colors"
            >
              <FileSpreadsheet className="h-5 w-5" />
            </button>
          </div>

          <div className="border border-slate-850 p-4 rounded-xl flex items-center justify-between bg-slate-900/40">
            <div>
              <h4 className="text-xs font-bold text-slate-250">Collections & Payment Reference</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Exports payment reference, amounts, payees, and methods.</p>
            </div>
            <button
              onClick={() => downloadCSV(rawPayments, "crestoak-payments-ledger.csv")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl cursor-pointer transition-colors"
            >
              <FileSpreadsheet className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
