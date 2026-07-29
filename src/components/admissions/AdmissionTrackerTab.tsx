"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, CheckCircle2 } from "lucide-react";
import { getCourseLabel } from "@/data/admissionsData";
import { Admission } from "@/types";

interface AdmissionTrackerTabProps {
  onViewLetter: (app: Admission) => void;
  initialRegNum?: string;
}

export const AdmissionTrackerTab: React.FC<AdmissionTrackerTabProps> = ({
  onViewLetter,
  initialRegNum = ""
}) => {
  const [searchRegNum, setSearchRegNum] = useState(initialRegNum);
  const [trackingApplication, setTrackingApplication] = useState<Admission | null>(null);
  const [trackingError, setTrackingError] = useState("");

  const performSearch = (regNum: string) => {
    if (!regNum.trim()) {
      setTrackingError("Please enter a valid Registration Number.");
      setTrackingApplication(null);
      return;
    }

    const savedAppsStr = localStorage.getItem("cchsmt_submitted_applications") || "[]";
    let savedApps: Admission[] = [];
    try {
      savedApps = JSON.parse(savedAppsStr);
    } catch {
      savedApps = [];
    }

    // Find in localStorage
    const matched = savedApps.find((app) => app.regNumber.toUpperCase() === regNum.trim().toUpperCase());
    
    if (matched) {
      setTrackingApplication(matched);
      setTrackingError("");
    } else {
      // Create a mock application for demonstration if they query any valid code
      if (regNum.toUpperCase().startsWith("CCHSMT/")) {
        const mockApp: Admission = {
          regNumber: regNum.toUpperCase(),
          fullName: "Mock Student Account",
          email: "student@crestoakcollege.com.ng",
          phone: "08155884804",
          level: "undergraduate",
          faculty: "health",
          course: "nursing",
          jambScore: "185",
          olevelCredits: "5",
          verificationCode: "CCXT84",
          status: "Decided", 
          dateSubmitted: "06/07/2026"
        };
        setTrackingApplication(mockApp);
        setTrackingError("");
      } else {
        setTrackingError("No application record found. Make sure format is CCHSMT/2026/XXXX");
        setTrackingApplication(null);
      }
    }
  };

  useEffect(() => {
    if (initialRegNum) {
      const timer = setTimeout(() => {
        setSearchRegNum(initialRegNum);
        performSearch(initialRegNum);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialRegNum]);

  const handleTrackSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchRegNum);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md">
      <div className="border-b border-slate-100 pb-4 mb-6">
        <h3 className="font-display font-extrabold text-brand-blue-dark text-lg sm:text-xl">
          Track Application Status
        </h3>
        <p className="text-slate-400 text-xs mt-1">Enter your Registration Number to view active status indicators.</p>
      </div>

      <form onSubmit={handleTrackSearch} className="flex gap-3 mb-8">
        <input
          type="text"
          placeholder="e.g. CCHMS/2026/CODE/0001"
          value={searchRegNum}
          onChange={(e) => setSearchRegNum(e.target.value)}
          className="flex-grow p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-brand-blue"
        />
        <button
          type="submit"
          className="bg-brand-blue hover:bg-brand-blue-dark text-white px-5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Search size={14} />
          <span>Track</span>
        </button>
      </form>

      {trackingError && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-xs font-bold mb-4">
          {trackingError}
        </div>
      )}

      {trackingApplication && (
        <div className="flex flex-col gap-6">
          {/* Candidate Details */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-semibold text-slate-700 grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-400 font-bold block uppercase mb-0.5">Applicant Name</span>
              <span className="text-brand-blue-dark font-extrabold">{trackingApplication.fullName}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block uppercase mb-0.5">Applied Course</span>
              <span className="text-brand-blue-dark font-extrabold uppercase">
                {getCourseLabel(trackingApplication.level, trackingApplication.faculty, trackingApplication.course)}
              </span>
            </div>
          </div>

          {/* Progress visualizer */}
          <div>
            <h4 className="font-display font-extrabold text-xs text-brand-blue-dark uppercase tracking-wider mb-4">
              Admissions Pipeline Progress
            </h4>
            
            <div className="flex flex-col gap-4">
              {[
                { key: "Submitted", label: "Form Submitted", desc: "Details received successfully" },
                { key: "Screened", label: "Credential Screening", desc: "Verifying credentials and result sheets" },
                { key: "Interviewed", label: "Entrance Interview", desc: "Candidate academic reviews and screenings" },
                { key: "Decided", label: "Admission Decision Offer", desc: "Offer letter generated" }
              ].map((step, idx) => {
                const steps = ["Submitted", "Screened", "Interviewed", "Decided"];
                const currentIdx = steps.indexOf(trackingApplication.status || "Submitted");
                const stepIdx = steps.indexOf(step.key);
                const isDone = stepIdx <= currentIdx;
                const isPassed = stepIdx < currentIdx;
                const isActive = stepIdx === currentIdx;

                return (
                  <div key={step.key} className="flex gap-4 items-start">
                    <div className="flex flex-col items-center shrink-0">
                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all ${
                        isPassed
                          ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                          : isActive
                          ? "bg-brand-red border-brand-red text-white ring-4 ring-brand-red/25 animate-pulse"
                          : "border-slate-200 text-slate-400 bg-white"
                      }`}>
                        {isPassed ? <CheckCircle2 size={14} className="stroke-[3px]" /> : stepIdx + 1}
                      </div>
                      {idx < 3 && (
                        <div className={`w-0.5 h-10 transition-colors ${
                          stepIdx < currentIdx ? "bg-emerald-500" : "bg-slate-200"
                        }`} />
                      )}
                    </div>
                    <div className="text-xs pt-0.5">
                      <p className={`font-bold uppercase tracking-wide ${isDone ? "text-brand-blue-dark font-black" : "text-slate-400"}`}>
                        {step.label}
                      </p>
                      <p className="text-slate-500 font-semibold mt-0.5 leading-snug">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dynamic Status Action & Guidance Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-700 font-semibold flex flex-col gap-2">
            <h5 className="font-display font-bold text-brand-blue-dark text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
              <span>Admissions Team Guidance</span>
            </h5>
            {trackingApplication.status === "Submitted" && (
              <p className="text-slate-500 leading-relaxed font-semibold">
                Your application has been received. Our registry team is currently auditing your O&apos;Level credits and credentials. Please check back within 48 hours for updates.
              </p>
            )}
            {trackingApplication.status === "Screened" && (
              <p className="text-slate-500 leading-relaxed font-semibold">
                Registry audits are completed successfully! You are now scheduled for the entrance screening and interview. Please report to the Badagry campus with original credentials on the next screening date (June 15, 2026).
              </p>
            )}
            {trackingApplication.status === "Interviewed" && (
              <p className="text-slate-500 leading-relaxed font-semibold">
                You have completed your oral interview and entrance examination. The admissions board is compiling decisions. Results will be uploaded here shortly.
              </p>
            )}
            {trackingApplication.status === "Decided" && (
              <div className="flex flex-col gap-3">
                <p className="text-slate-500 leading-relaxed font-semibold">
                  Congratulations! You have been offered provisional admission. Please download your admission letter below. You must accept this offer and pay your Acceptance Fee of ₦50,000 within 14 days.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onViewLetter(trackingApplication)}
                    className="bg-brand-red hover:bg-brand-red/90 text-white font-display font-bold px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider cursor-pointer"
                  >
                    Download Letter
                  </button>
                  <Link href="/portal">
                    <button
                      className="bg-brand-blue hover:bg-brand-blue-dark text-white font-display font-bold px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider cursor-pointer"
                    >
                      Accept & Pay Acceptance Fee
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
