"use client";

import React from "react";
import { GraduationCap, FileCheck } from "lucide-react";
import { Logo } from "@/components/ui/logo";

interface GuidelinesTabProps {
  onStartApply: () => void;
}

export const GuidelinesTab: React.FC<GuidelinesTabProps> = ({ onStartApply }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <div className="lg:col-span-8 flex flex-col gap-8">
        {/* Undergraduate Guidelines */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-red" />
          <div className="flex gap-3 items-center">
            <GraduationCap className="text-brand-red shrink-0" size={24} />
            <h3 className="font-display font-black text-brand-blue-dark text-lg">Undergraduate Admission Guidelines (2026/2027)</h3>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-semibold">
            Applications are invited from suitably qualified candidates for admission into NUC-approved undergraduate courses.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="text-slate-400 block uppercase mb-1">General JAMB Cut-off</span>
              <span className="text-brand-red font-black text-sm">140+ (Nursing Sciences requires 200)</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase mb-1">O&apos;Level Requirements</span>
              <span className="text-brand-blue-dark font-extrabold">5 credits in WAEC/NECO/NABTEB including English & Mathematics in max 2 sittings</span>
            </div>
            <div className="sm:col-span-2 border-t border-slate-200/60 pt-3 mt-1">
              <span className="text-slate-400 block uppercase mb-1">Tuition Scholarship Program</span>
              <span className="text-emerald-700 font-extrabold">Tuition scholarship options are available for undergraduate students.</span>
            </div>
            <div className="sm:col-span-2 border-t border-slate-200/60 pt-3">
              <span className="text-slate-400 block uppercase mb-1">Payment Structure</span>
              <span className="text-brand-blue-dark font-extrabold">Diploma, JUPEB, and other students pay once.</span>
            </div>
          </div>
        </div>

        {/* Postgraduate Guidelines */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-blue" />
          <div className="flex gap-3 items-center">
            <FileCheck className="text-brand-blue shrink-0" size={24} />
            <h3 className="font-display font-black text-brand-blue-dark text-lg">Postgraduate Admission Guidelines (2025/2026)</h3>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-semibold">
            Applications are invited into NUC-approved Postgraduate Diploma (PGD), Master of Science (M.Sc.), Master of Business Administration (MBA), Master of Arts (M.A.), and Doctor of Philosophy (Ph.D.) programmes.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="sm:col-span-2">
              <span className="text-slate-400 block uppercase mb-1">Academic Requirement</span>
              <span className="text-brand-blue-dark font-extrabold">A good first degree (or Master&apos;s degree for Ph.D. path) from a recognized institution and fulfillment of specific departmental prerequisites.</span>
            </div>
            <div className="sm:col-span-2 border-t border-slate-200/60 pt-3">
              <span className="text-slate-400 block uppercase mb-1">How to Apply</span>
              <ul className="list-decimal list-inside space-y-1 mt-1 text-slate-600 font-semibold">
                <li>Visit the official institution website.</li>
                <li>Complete the online application form (under the Online Application tab).</li>
                <li>Pay the prescribed non-refundable application fee.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Step by Step Flow */}
        <div className="flex flex-col gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-display font-extrabold text-brand-blue-dark text-lg uppercase tracking-wider border-b border-slate-200 pb-2">
            Admissions Process Flow
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-display font-bold shrink-0">1</div>
              <div>
                <p className="font-display font-bold text-brand-blue-dark">Submit Form</p>
                <p className="text-slate-500 text-xs mt-1 font-semibold leading-relaxed">Fill account details, verify OTP, input academic details, and submit application.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-display font-bold shrink-0">2</div>
              <div>
                <p className="font-display font-bold text-brand-blue-dark">Credential Audit</p>
                <p className="text-slate-500 text-xs mt-1 font-semibold leading-relaxed">Registry officers audit WAEC/NECO certificates or first-degree transcripts.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-display font-bold shrink-0">3</div>
              <div>
                <p className="font-display font-bold text-brand-blue-dark">Admissions Board Decision</p>
                <p className="text-slate-500 text-xs mt-1 font-semibold leading-relaxed">Successful candidates receive academic clearance and offer release.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-display font-bold shrink-0">4</div>
              <div>
                <p className="font-display font-bold text-brand-blue-dark">Securing Seat</p>
                <p className="text-slate-500 text-xs mt-1 font-semibold leading-relaxed">Print offer letter, pay Acceptance Fee online, and proceed with portal registration.</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <button
              onClick={onStartApply}
              className="bg-brand-red hover:bg-brand-red/90 text-white font-display font-bold px-6 py-2.5 rounded-full text-xs transition-colors cursor-pointer"
            >
              Start Your Application Form
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 flex flex-col gap-6">
        {/* Admissions Info */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col gap-5 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-red" />
          <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 w-fit animate-pulse-slow">
            <Logo variant="crestoak" showText={true} size={40} />
          </div>
          <div>
            <h4 className="font-display font-bold text-brand-blue-dark text-sm sm:text-base">
              Admissions Office Direct Contacts
            </h4>
            <p className="text-slate-500 text-xs mt-1 font-semibold leading-relaxed">
              For direct registration guidance and application support:
            </p>
            <p className="text-brand-blue-dark font-extrabold text-sm mt-3">
              📞 +234 (0) 815 588 4804, +234 (0) 803 861 7259
            </p>
            <p className="text-slate-400 text-xs mt-2 font-semibold">
              Email: <a href="mailto:info@crestoakcollege.com.ng" className="text-brand-red hover:underline">info@crestoakcollege.com.ng</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
