"use client";

import React, { useState, useEffect } from "react";
import BillingClientView from "./BillingClientView";
import { ShieldCheck, Loader2 } from "lucide-react";

interface Invoice {
  id: string;
  invoiceNo: string;
  amount: number;
  description: string;
  feeType: string;
  status: string;
  dueDate: string;
}

interface Payment {
  id: string;
  reference: string;
  amountPaid: number;
  method: string;
  status: string;
  paidAt: string;
  invoice: {
    invoiceNo: string;
    description: string;
  };
}

export default function StudentBillingPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [studentName, setStudentName] = useState("Student");
  const [matricNo, setMatricNo] = useState("");

  useEffect(() => {
    const fetchBilling = async () => {
      try {
        const res = await fetch("/api/bursary/dashboard.php", {
          method: "GET",
          credentials: "include"
        });
        const data = await res.json();
        if (data.success) {
          setInvoices(data.invoices || []);
          setPayments(data.payments || []);
          setStudentName(data.studentName || "Student");
          setMatricNo(data.matricNo || "");
        } else {
          setError(data.message || "Could not load billing information.");
        }
      } catch {
        setError("Network error loading billing information.");
      } finally {
        setLoading(false);
      }
    };
    fetchBilling();
  }, []);

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h3 className="font-display font-black text-brand-blue-dark text-lg sm:text-xl">Financial & Billing Services</h3>
          <p className="text-slate-400 text-xs mt-1">Settle outstanding semester invoices and track payment transaction receipts.</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl text-[10px] sm:text-xs font-bold text-slate-500 flex items-center gap-1.5 shrink-0">
          <ShieldCheck size={14} className="text-emerald-700" />
          <span>Payment Gateway Secured</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-xs font-semibold">Loading billing information...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl text-xs font-semibold">
          {error}
        </div>
      ) : (
        <BillingClientView
          invoices={invoices}
          payments={payments}
          studentName={studentName}
          matricNo={matricNo}
        />
      )}
    </div>
  );
}