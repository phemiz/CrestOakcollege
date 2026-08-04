import React from "react";
import BillingClientView from "./BillingClientView";
import { ShieldCheck } from "lucide-react";

export const dynamic = "force-static";

export default function StudentBillingPage() {
  const student = {
    matricNo: "CCHMS/2026/SCS/0001",
    user: { firstName: "Student", lastName: "User" }
  };

  const today = new Date().toLocaleDateString();

  const invoices = [
    {
      id: "inv1",
      invoiceNo: "INV-2026-001",
      amount: 150000,
      description: "2025/2026 First Semester Tuition Fee",
      feeType: "TUITION",
      status: "PENDING",
      dueDate: today
    },
    {
      id: "inv2",
      invoiceNo: "INV-2025-089",
      amount: 35000,
      description: "Freshman Acceptance & Registration Dues",
      feeType: "ACCEPTANCE",
      status: "PAID",
      dueDate: today
    }
  ];

  const payments = [
    {
      id: "pay1",
      reference: "PAY-REF-998231",
      amountPaid: 35000,
      method: "Paystack Card",
      status: "SUCCESSFUL",
      paidAt: today,
      invoice: {
        invoiceNo: "INV-2025-089",
        description: "Freshman Acceptance & Registration Dues"
      }
    }
  ];

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

      <BillingClientView 
        invoices={invoices}
        payments={payments}
        studentName={`${student.user.firstName} ${student.user.lastName}`}
        matricNo={student.matricNo}
      />
    </div>
  );
}
