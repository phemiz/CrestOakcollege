"use client";

import React, { useState, useEffect } from "react";
import ReportsClient from "@/components/admin/ReportsClient";
import { Loader2 } from "lucide-react";

export default function ReportsPage() {
  const [summaryStats, setSummaryStats] = useState<any>({ totalStudents: 0, totalRevenue: 0, avgCgpa: 0, unpaidAmount: 0 });
  const [deptDistribution, setDeptDistribution] = useState<any[]>([]);
  const [revenueByFeeType, setRevenueByFeeType] = useState<any[]>([]);
  const [rawStudents, setRawStudents] = useState<any[]>([]);
  const [rawPayments, setRawPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
