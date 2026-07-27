import React from "react";
import { getSafeSession } from "@/lib/session";
import db from "@/lib/db";
import ClearanceClientView from "./ClearanceClientView";
import { Award } from "lucide-react";

export default async function StudentClearancePage() {
  let session: any = null;
  try {
    session = await getSafeSession();
  } catch (e) {}

  let student: any = null;
  let invoices: any[] = [];
  let auditLogs: any[] = [];

  if (session?.user?.id) {
    try {
      student = await db.student.findUnique({
        where: { id: session.user.id }
      });
      if (student) {
        invoices = await db.invoice.findMany({
          where: {
            userId: student.id,
            isDeleted: false
          }
        });
        auditLogs = await db.auditLog.findMany({
          where: {
            userId: student.id,
            action: "CREATE",
            entity: "ClearanceRequest"
          }
        });
      }
    } catch (e) {}
  }

  if (!student) {
    student = { id: "demo-student-id" };
    invoices = [
      { feeType: "ACCEPTANCE", description: "acceptance", status: "PAID" },
      { feeType: "TUITION", description: "tuition", status: "PAID" }
    ];
    auditLogs = [];
  }

  // Acceptance invoice is PAID or not
  const acceptanceInvoice = invoices.find((inv: any) => inv.feeType === "ACCEPTANCE" || inv.description?.toLowerCase().includes("acceptance"));
  const departmentCleared = acceptanceInvoice ? acceptanceInvoice.status === "PAID" : true;

  // Tuition invoice is PAID or not
  const tuitionInvoice = invoices.find((inv: any) => inv.feeType === "TUITION" || inv.description?.toLowerCase().includes("tuition"));
  const bursaryCleared = tuitionInvoice ? tuitionInvoice.status === "PAID" : true;

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
