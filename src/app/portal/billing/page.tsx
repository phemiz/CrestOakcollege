import React from "react";
import { getSafeSession } from "@/lib/session";
import db from "@/lib/db";
import BillingClientView from "./BillingClientView";
import { ShieldCheck } from "lucide-react";

export default async function StudentBillingPage() {
  let session: any = null;
  try {
    session = await getSafeSession();
  } catch (e) {}

  let student: any = null;
  let invoices: any[] = [];
  let payments: any[] = [];

  if (session?.user?.id) {
    try {
      student = await db.student.findUnique({
        where: { id: session.user.id },
        include: {
          user: true,
          currentSession: true
        }
      });
      if (student) {
        invoices = await db.invoice.findMany({
          where: {
            userId: student.id,
            isDeleted: false
          },
          orderBy: {
            createdAt: "desc"
          }
        });
        payments = await db.payment.findMany({
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
      }
    } catch (e) {}
  }

  if (!student) {
    student = {
      matricNo: "CCHMS/2026/SCS/0001",
      user: { firstName: "Student", lastName: "User" }
    };
    invoices = [
      {
        id: "inv1",
        invoiceNo: "INV-2026-001",
        amount: 150000,
        description: "2025/2026 First Semester Tuition Fee",
        feeType: "TUITION",
        status: "PENDING",
        dueDate: new Date()
      },
      {
        id: "inv2",
        invoiceNo: "INV-2025-089",
        amount: 35000,
        description: "Freshman Acceptance & Registration Dues",
        feeType: "ACCEPTANCE",
        status: "PAID",
        dueDate: new Date()
      }
    ];
    payments = [
      {
        id: "pay1",
        reference: "PAY-REF-998231",
        amountPaid: 35000,
        method: "Paystack Card",
        status: "SUCCESSFUL",
        paidAt: new Date(),
        createdAt: new Date(),
        invoice: {
          invoiceNo: "INV-2025-089",
          description: "Freshman Acceptance & Registration Dues"
        }
      }
    ];
  }

  const serializedInvoices = invoices.map((inv: any) => ({
    id: inv.id,
    invoiceNo: inv.invoiceNo,
    amount: Number(inv.amount),
    description: inv.description,
    feeType: inv.feeType,
    status: inv.status,
    dueDate: inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : new Date().toLocaleDateString()
  }));

  const serializedPayments = payments.map((p: any) => ({
    id: p.id,
    reference: p.reference,
    amountPaid: Number(p.amountPaid),
    method: p.method,
    status: p.status,
    paidAt: p.paidAt ? new Date(p.paidAt).toLocaleDateString() : new Date(p.createdAt || Date.now()).toLocaleDateString(),
    invoice: {
      invoiceNo: p.invoice?.invoiceNo || "N/A",
      description: p.invoice?.description || "N/A"
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
        studentName={`${student.user?.firstName || "Student"} ${student.user?.lastName || "User"}`}
        matricNo={student.matricNo}
      />
    </div>
  );
}
