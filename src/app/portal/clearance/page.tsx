import React from "react";
import ClearanceClientView from "./ClearanceClientView";
import { Award } from "lucide-react";

export const dynamic = "force-static";

export default function StudentClearancePage() {
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
        bursaryCleared={true}
        departmentCleared={true}
        initialLibraryRequested={true}
        initialHealthRequested={true}
        initialRegistryRequested={false}
      />
    </div>
  );
}
