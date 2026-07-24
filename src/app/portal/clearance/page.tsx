import React from "react";
import { getSafeSession } from "@/lib/session";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import ClearanceClientView from "./ClearanceClientView";
import { Award } from "lucide-react";

export default async function StudentClearancePage() {
  const session = await getSafeSession();

  if (!session || session.user.role !== "Student") {
    redirect("/login");
  }

  // Fetch student profile details
  const student = await db.student.findUnique({
    where: { id: session.user.id }
  });

  if (!student) {
    redirect("/login");
  }

  // Fetch student invoices to evaluate bursary and departmental clearance
  const invoices = await db.invoice.findMany({
    where: {
      userId: student.id,
      isDeleted: false
    }
  });

  // Acceptance invoice is PAID or not
  const acceptanceInvoice = invoices.find((inv: any) => inv.feeType === "ACCEPTANCE" || inv.description.toLowerCase().includes("acceptance"));
  const departmentCleared = acceptanceInvoice ? acceptanceInvoice.status === "PAID" : false;

  // Tuition invoice is PAID or not
  const tuitionInvoice = invoices.find((inv: any) => inv.feeType === "TUITION" || inv.description.toLowerCase().includes("tuition"));
  const bursaryCleared = tuitionInvoice ? tuitionInvoice.status === "PAID" : false;

  // Query audit logs to check if they've submitted clearance requests
  const auditLogs = await db.auditLog.findMany({
    where: {
      userId: student.id,
      action: "CREATE",
      entity: "ClearanceRequest"
    }
  });

  const libraryRequested = auditLogs.some((log: any) => {
    try {
      const vals = log.newValues as any;
      return vals && vals.clearanceType === "Library";
    } catch {
      return false;
    }
  });

  const healthRequested = auditLogs.some((log: any) => {
    try {
      const vals = log.newValues as any;
      return vals && vals.clearanceType === "Health";
    } catch {
      return false;
    }
  });

  const registryRequested = auditLogs.some((log: any) => {
    try {
      const vals = log.newValues as any;
      return vals && vals.clearanceType === "Registry";
    } catch {
      return false;
    }
  });

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-display font-black text-brand-blue-dark text-lg sm:text-xl">Student Clearance Status</h3>
          <p className="text-slate-400 text-xs mt-1">Audit status checklist and submit clearance validation requests.</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl text-[10px] sm:text-xs font-bold text-slate-500 flex items-center gap-1.5 shrink-0">
          <Award size={14} className="text-brand-gold" />
          <span>Graduation Clearance Eligible</span>
        </div>
      </div>

      <ClearanceClientView 
        bursaryCleared={bursaryCleared}
        departmentCleared={departmentCleared}
        initialLibraryRequested={libraryRequested}
        initialHealthRequested={healthRequested}
        initialRegistryRequested={registryRequested}
      />
    </div>
  );
}
