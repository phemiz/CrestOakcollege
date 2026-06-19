"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { requestClearance } from "@/app/actions/student-actions";
import { 
  CheckCircle2, 
  Clock, 
  HelpCircle,
  RefreshCw,
  AlertTriangle,
  Send,
  Building,
  Library,
  HeartPulse,
  CreditCard,
  UserCheck
} from "lucide-react";

interface ClearanceClientViewProps {
  bursaryCleared: boolean;
  departmentCleared: boolean;
  initialLibraryRequested: boolean;
  initialHealthRequested: boolean;
  initialRegistryRequested: boolean;
}

export default function ClearanceClientView({
  bursaryCleared,
  departmentCleared,
  initialLibraryRequested,
  initialHealthRequested,
  initialRegistryRequested
}: ClearanceClientViewProps) {
  const router = useRouter();
  const [libraryRequested, setLibraryRequested] = useState(initialLibraryRequested);
  const [healthRequested, setHealthRequested] = useState(initialHealthRequested);
  const [registryRequested, setRegistryRequested] = useState(initialRegistryRequested);
  
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleRequestClearance = async (type: string) => {
    setIsSubmitting(type);
    setStatus(null);

    const res = await requestClearance(type);

    setIsSubmitting(null);

    if (res.success) {
      setStatus({ type: "success", message: res.message || `Request for ${type} clearance submitted successfully.` });
      if (type === "Library") setLibraryRequested(true);
      if (type === "Health") setHealthRequested(true);
      if (type === "Registry") setRegistryRequested(true);
      router.refresh();
    } else {
      setStatus({ type: "error", message: res.error || "Failed to submit clearance request. Please try again." });
    }
  };

  const steps = [
    {
      id: "department",
      name: "Departmental Screening",
      desc: "Requires credentials audit and Acceptance Fee settlement.",
      cleared: departmentCleared,
      pending: !departmentCleared,
      requested: true,
      actionable: false,
      icon: Building
    },
    {
      id: "bursary",
      name: "Bursary Payment Clearance",
      desc: "Requires complete settlement of active semester school fees.",
      cleared: bursaryCleared,
      pending: !bursaryCleared,
      requested: true,
      actionable: false,
      icon: CreditCard
    },
    {
      id: "library",
      name: "College Library Clearance",
      desc: "Ensures no outstanding book holds or fine penalties.",
      cleared: false,
      pending: !libraryRequested,
      requested: libraryRequested,
      actionable: !libraryRequested,
      type: "Library",
      icon: Library
    },
    {
      id: "health",
      name: "Health Services Clearance",
      desc: "Verifies medical certificate submission and drug screening.",
      cleared: false,
      pending: !healthRequested,
      requested: healthRequested,
      actionable: !healthRequested,
      type: "Health",
      icon: HeartPulse
    },
    {
      id: "registry",
      name: "Final Registry clearance",
      desc: "Validates credentials and approves portal certificate downloads.",
      cleared: false,
      pending: !registryRequested,
      requested: registryRequested,
      actionable: !registryRequested,
      type: "Registry",
      icon: UserCheck
    }
  ];

  const totalCleared = steps.filter(s => s.cleared).length;

  return (
    <div className="flex flex-col gap-8">
      
      {status && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2.5 ${
          status.type === "success" 
            ? "bg-emerald-50 text-emerald-800 border border-emerald-100 animate-scale-in" 
            : "bg-red-50 text-red-800 border border-red-100"
        }`}>
          {status.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{status.message}</span>
        </div>
      )}

      {/* Progress banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-semibold text-slate-600">
        <div>
          <h4 className="font-display font-black text-brand-blue-dark text-xs sm:text-sm uppercase tracking-wider">Overall Clearance Progress</h4>
          <p className="text-slate-400 mt-1">Status: {totalCleared === steps.length ? "Fully Cleared" : "Clearance In Progress"}</p>
        </div>
        <div className="bg-brand-blue text-white px-4 py-2 rounded-xl text-center shrink-0">
          <span className="font-display font-black text-brand-gold">{totalCleared} / {steps.length} Steps Cleared</span>
        </div>
      </div>

      {/* Clearance Checklist stages */}
      <div className="flex flex-col gap-4">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 rounded-2xl border transition-all ${
                step.cleared 
                  ? "border-emerald-200 bg-emerald-55/10" 
                  : step.requested 
                    ? "border-amber-200 bg-amber-50/10" 
                    : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl shrink-0 ${
                  step.cleared 
                    ? "bg-emerald-100 text-emerald-800" 
                    : step.requested 
                      ? "bg-amber-100 text-amber-800" 
                      : "bg-slate-100 text-slate-500"
                }`}>
                  <Icon size={18} />
                </div>
                <div>
                  <h5 className="font-display font-black text-brand-blue-dark text-xs sm:text-sm">{step.name}</h5>
                  <p className="text-slate-400 text-[10px] sm:text-xs mt-1 leading-normal font-semibold font-sans">{step.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 mt-4 sm:mt-0 self-end sm:self-auto">
                {/* Status bubble */}
                {step.cleared ? (
                  <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-xl font-black text-[9px] uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 size={10} />
                    <span>Cleared</span>
                  </span>
                ) : step.requested ? (
                  <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-xl font-black text-[9px] uppercase tracking-wider flex items-center gap-1">
                    <Clock size={10} />
                    <span>Under Review</span>
                  </span>
                ) : (
                  <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-xl font-black text-[9px] uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle size={10} />
                    <span>Pending</span>
                  </span>
                )}

                {/* Request trigger */}
                {step.actionable && (
                  <button
                    disabled={isSubmitting === step.type}
                    onClick={() => handleRequestClearance(step.type!)}
                    className="bg-brand-blue hover:bg-brand-blue-dark disabled:bg-slate-300 text-white font-display font-bold py-1.5 px-4 rounded-xl transition-colors cursor-pointer text-[10px] uppercase flex items-center gap-1 shadow-sm"
                  >
                    {isSubmitting === step.type ? (
                      <RefreshCw size={10} className="animate-spin" />
                    ) : (
                      <Send size={10} />
                    )}
                    <span>Request Clearance</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
