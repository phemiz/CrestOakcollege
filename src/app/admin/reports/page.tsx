"use client";

import React, { useState, useEffect } from "react";
import ReportsClient from "@/components/admin/ReportsClient";
import { Loader2 } from "lucide-react";

export default function ReportsPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [summaryStats, setSummaryStats] = useState<any>({ totalStudents: 0, totalRevenue: 0, avgCgpa: 0, unpaidAmount: 0 });
  const [deptDistribution, setDeptDistribution] = useState<any[]>([]);
  const [revenueByFeeType, setRevenueByFeeType] = useState<any[]>([]);
  const [rawStudents, setRawStudents] = useState<any[]>([]);
  const [rawPayments, setRawPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuth = localStorage.getItem("isAuthenticated");
      const userStr = localStorage.getItem("user") || localStorage.getItem("cchsmt_user_session");
      let roleUpper = "";
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          roleUpper = (u.role || "").toUpperCase();
        } catch (e) {}
      }
      const isAdmin = roleUpper.includes("ADMIN") || roleUpper.includes("SUPER");
      if (!isAuth || isAuth !== "true" || !isAdmin) {
        window.location.replace("/login/?gateway=admin");
        return;
      }
      setIsAuthorized(true);
    }

    fetch("/api/admin/reports.php")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.summaryStats) setSummaryStats(data.summaryStats);
          if (Array.isArray(data.deptDistribution)) setDeptDistribution(data.deptDistribution);
          if (Array.isArray(data.revenueByFeeType)) setRevenueByFeeType(data.revenueByFeeType);
          if (Array.isArray(data.rawStudents)) setRawStudents(data.rawStudents);
          if (Array.isArray(data.rawPayments)) setRawPayments(data.rawPayments);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-slate-600 font-medium text-sm">
          <Loader2 className="h-5 w-5 animate-spin text-brand-red" />
          <span>Verifying administrative authorization...</span>
        </div>
      </div>
    );
  }

  return (
    <ReportsClient
      summaryStats={summaryStats}
      deptDistribution={deptDistribution}
      revenueByFeeType={revenueByFeeType}
      rawStudents={rawStudents}
      rawPayments={rawPayments}
    />
  );
}
