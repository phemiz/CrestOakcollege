import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import BillingClientView from "./BillingClientView";
import { ShieldCheck, Calendar } from "lucide-react";

export default async function StudentBillingPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "Student") {
    redirect("/login");
  }

  // Fetch student details
  const student = await db.student.findUnique({
    where: { id: session.user.id },
    include: {
      user: true,
      currentSession: true
    }
  });

  if (!student) {
    redirect("/login");
  }

  // Fetch all invoices for this student
  const invoices = await db.invoice.findMany({
    where: {
      userId: student.id,
      isDeleted: false
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  // Fetch all payment records (including pending/failed) for this student's invoices
  const payments = await db.payment.findMany({
    where: {
      invoice: {
        userId: student.id
      },
      isDeleted: false
    },
    include: {
      invoice: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  const serializedInvoices = invoices.map(inv => ({
    id: inv.id,
    invoiceNo: inv.invoiceNo,
    amount: Number(inv.amount),
    description: inv.description,
    feeType: inv.feeType,
    status: inv.status,
    dueDate: inv.dueDate.toLocaleDateString()
  }));

  const serializedPayments = payments.map(p => ({
    id: p.id,
    reference: p.reference,
    amountPaid: Number(p.amountPaid),
    method: p.method,
    status: p.status,
    paidAt: p.paidAt ? p.paidAt.toLocaleDateString() : p.createdAt.toLocaleDateString(),
    invoice: {
      invoiceNo: p.invoice.invoiceNo,
      description: p.invoice.description
    }
  }));

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
        invoices={serializedInvoices}
        payments={serializedPayments}
        studentName={`${student.user.firstName} ${student.user.lastName}`}
        matricNo={student.matricNo}
      />
    </div>
  );
}
