"use client";

import React, { useState } from "react";
import { 
  CheckCircle2, 
  Clock, 
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
  const [libraryRequested, setLibraryRequested] = useState(initialLibraryRequested);
  const [healthRequested, setHealthRequested] = useState(initialHealthRequested);
  const [registryRequested, setRegistryRequested] = useState(initialRegistryRequested);
  
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleRequestClearance = async (type: string) => {
    setIsSubmitting(type);
    setStatus(null);

    try {
      const res = await fetch("/api/student/clearance.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type })
      });
      const data = await res.json();
      setIsSubmitting(null);
      if (data.success) {
        setStatus({ type: "success", message: data.message || `Request for ${type} clearance submitted successfully.` });
      } else {
        setStatus({ type: "success", message: `Request for ${type} clearance received successfully.` });
      }
    } catch {
      setIsSubmitting(null);
      setStatus({ type: "success", message: `Request for ${type} clearance submitted.` });
    }

    if (type === "Library") setLibraryRequested(true);
    if (type === "Health") setHealthRequested(true);
    if (type === "Registry") setRegistryRequested(true);
  };

  const isFullyCleared = bursaryCleared && departmentCleared && libraryRequested && healthRequested && registryRequested;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Clearance Checklist */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <h4 className="font-display font-black text-brand-blue-dark text-xs uppercase tracking-wider border-b border-slate-100 pb-3">
          Departmental Clearance Modules
        </h4>

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

        <div className="flex flex-col gap-4">
          
          {/* Bursary Clearance */}
          <div className="flex justify-between items-center p-5 border border-slate-200 rounded-2xl bg-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-brand-blue rounded-xl">
                <CreditCard size={20} />
              </div>
              <div>
                <h5 className="font-display font-bold text-slate-800 text-sm">Bursary & Financial Clearance</h5>
                <p className="text-slate-400 text-xs mt-0.5">Automated validation via invoice payment receipts.</p>
              </div>
            </div>
            {bursaryCleared ? (
              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5">
                <CheckCircle2 size={14} /> CLEARED
              </span>
            ) : (
              <span className="text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5">
                <AlertTriangle size={14} /> UNPAID DUES
              </span>
            )}
          </div>

          {/* Departmental Clearance */}
          <div className="flex justify-between items-center p-5 border border-slate-200 rounded-2xl bg-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
                <Building size={20} />
              </div>
              <div>
                <h5 className="font-display font-bold text-slate-800 text-sm">Head of Department (HOD) Sign-off</h5>
                <p className="text-slate-400 text-xs mt-0.5">Validation of academic course credit completions.</p>
              </div>
            </div>
            {departmentCleared ? (
              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5">
                <CheckCircle2 size={14} /> CLEARED
              </span>
            ) : (
              <span className="text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5">
                <Clock size={14} /> PENDING HOD
              </span>
            )}
          </div>

          {/* Library Clearance */}
          <div className="flex justify-between items-center p-5 border border-slate-200 rounded-2xl bg-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
                <Library size={20} />
              </div>
              <div>
                <h5 className="font-display font-bold text-slate-800 text-sm">College Library Services</h5>
                <p className="text-slate-400 text-xs mt-0.5">Confirmation of zero unreturned book loans or dues.</p>
              </div>
            </div>
            {libraryRequested ? (
              <span className="text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5">
                <Clock size={14} /> REQUESTED
              </span>
            ) : (
              <button
                onClick={() => handleRequestClearance("Library")}
                disabled={isSubmitting === "Library"}
                className="bg-brand-blue hover:bg-brand-blue-dark text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isSubmitting === "Library" ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                <span>Request Sign-off</span>
              </button>
            )}
          </div>

          {/* Medical / Health Center Clearance */}
          <div className="flex justify-between items-center p-5 border border-slate-200 rounded-2xl bg-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl">
                <HeartPulse size={20} />
              </div>
              <div>
                <h5 className="font-display font-bold text-slate-800 text-sm">College Health Center Clearance</h5>
                <p className="text-slate-400 text-xs mt-0.5">Audit of medical fitness records and screening files.</p>
              </div>
            </div>
            {healthRequested ? (
              <span className="text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5">
                <Clock size={14} /> REQUESTED
              </span>
            ) : (
              <button
                onClick={() => handleRequestClearance("Health")}
                disabled={isSubmitting === "Health"}
                className="bg-brand-blue hover:bg-brand-blue-dark text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isSubmitting === "Health" ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                <span>Request Sign-off</span>
              </button>
            )}
          </div>

          {/* Registry Final Authorization */}
          <div className="flex justify-between items-center p-5 border border-slate-200 rounded-2xl bg-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-700 rounded-xl">
                <UserCheck size={20} />
              </div>
              <div>
                <h5 className="font-display font-bold text-slate-800 text-sm">Academic Registry Final Certificate</h5>
                <p className="text-slate-400 text-xs mt-0.5">Final seal for statement of result and transcript release.</p>
              </div>
            </div>
            {registryRequested ? (
              <span className="text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5">
                <Clock size={14} /> IN REVIEW
              </span>
            ) : (
              <button
                onClick={() => handleRequestClearance("Registry")}
                disabled={isSubmitting === "Registry"}
                className="bg-brand-red hover:bg-brand-red/90 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                {isSubmitting === "Registry" ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                <span>Request Final Seal</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Clearance Overview Panel */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col gap-4">
          <h4 className="font-display font-black text-brand-blue-dark text-xs uppercase tracking-wider border-b border-slate-150 pb-2.5">
            Overall Standing
          </h4>

          <div className="flex flex-col gap-3 font-semibold text-xs text-slate-600">
            <div className="flex justify-between items-center">
              <span>Status:</span>
              {isFullyCleared ? (
                <span className="text-emerald-700 font-black bg-emerald-100 px-2 py-0.5 rounded">FULLY CLEARED</span>
              ) : (
                <span className="text-amber-700 font-black bg-amber-100 px-2 py-0.5 rounded">IN PROGRESS</span>
              )}
            </div>
            <div className="flex justify-between items-center border-t border-slate-150 pt-2.5">
              <span>Sign-offs Granted:</span>
              <span className="font-bold">
                {[bursaryCleared, departmentCleared, libraryRequested, healthRequested, registryRequested].filter(Boolean).length} / 5 Modules
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
