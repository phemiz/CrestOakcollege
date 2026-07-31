"use client";

import React from "react";
import Image from "next/image";
import { Printer, QrCode } from "lucide-react";
import { getCourseLabel } from "@/data/admissionsData";
import { Admission } from "@/types";

interface AdmissionLetterTabProps {
  trackingApplication: Admission | null;
}

export const AdmissionLetterTab: React.FC<AdmissionLetterTabProps> = ({ trackingApplication }) => {
  const triggerPrint = () => {
    window.print();
  };

  const app = trackingApplication || {
    regNumber: "CCHMS/2026/NUR/0042",
    fullName: "Olawale Tunde Joseph",
    course: "nursing",
    faculty: "health",
    level: "undergraduate",
    dateSubmitted: "June 07, 2026",
    verificationCode: "CCXT84"
  };

  return (
    <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-md">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6 print:hidden">
        <div>
          <h3 className="font-display font-extrabold text-brand-blue-dark text-lg sm:text-xl">
            Admission Letter System
          </h3>
          <p className="text-slate-400 text-xs mt-1">Print or download your official admission offer.</p>
        </div>
        <button
          onClick={triggerPrint}
          className="bg-brand-blue text-white hover:bg-brand-blue-dark p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Printer size={15} />
          <span>Print Letter</span>
        </button>
      </div>

      {/* Actual printable letterhead layout */}
      <div className="border border-slate-100 p-6 sm:p-10 rounded-2xl bg-white text-slate-800 leading-relaxed font-sans text-xs sm:text-sm print:border-none print:p-0">
        {/* Letterhead Header */}
        <div className="flex items-center justify-between border-b-2 border-brand-blue-dark pb-6 mb-8">
          <div className="flex items-center gap-4">
            <Image
              src="/crestoak-logo.png"
              alt="CrestOak logo"
              width={64}
              height={64}
              loading="lazy"
              className="w-16 h-16 object-contain rounded-full bg-white p-0.5 border border-slate-100"
            />
            <div className="flex flex-col text-left">
              <span className="font-display text-lg font-black tracking-tight text-brand-blue-dark leading-none">CRESTOAK</span>
              <div className="flex flex-col mt-0.5 gap-0.5">
                <span className="text-[7.5px] tracking-wider font-extrabold text-brand-red uppercase leading-none">
                  College of Health Sciences
                </span>
                <span className="text-[6.5px] tracking-[0.05em] font-bold text-brand-blue uppercase leading-none">
                  Management and Technology
                </span>
              </div>
              <span className="text-[6px] tracking-tight font-semibold text-slate-500 leading-normal mt-1 max-w-[200px]">
                Accredited & Verified Higher Institution.
              </span>
            </div>
          </div>
          
          <div className="text-right text-[8px] font-bold text-slate-500 flex flex-col">
            <span>Ref: CCHSMT/ADM/2026/OFF</span>
            <span>Date: {app.dateSubmitted}</span>
            <span>Verification Code: {app.verificationCode}</span>
          </div>
        </div>

        {/* Letter body */}
        <div className="flex flex-col gap-6 text-slate-700">
          <p className="font-bold text-brand-blue-dark">
            Dear Applicant,
          </p>

          <div>
            <h4 className="font-display font-black text-brand-blue-dark text-base uppercase text-center border-y border-slate-200 py-2 my-2 tracking-wide">
              OFFER OF PROVISIONAL ADMISSION FOR {app.level === "postgraduate" ? "2025/2026" : "2026/2027"} ACADEMIC SESSION
            </h4>
          </div>

          <p>
            Following your successful screening and eligibility audits, we are pleased to offer you provisional admission to study at <strong>CrestOak College of Health Sciences Management and Technology</strong> (Badagry, Lagos campus) under accredited university-level academic frameworks.
          </p>

          <p>
            Your admission details are specified below:
          </p>

          <div className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
            <div>
              <span className="text-slate-400 block uppercase mb-0.5">Full Name</span>
              <span className="text-brand-blue-dark font-extrabold">
                {app.fullName}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase mb-0.5">Program assigned</span>
              <span className="text-brand-blue-dark font-extrabold uppercase">
                {getCourseLabel(app.level, app.faculty, app.course)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase mb-0.5">Registration Number</span>
              <span className="text-brand-red font-black">
                {app.regNumber}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase mb-0.5">Accreditation Status</span>
              <span className="text-brand-blue-dark font-extrabold">Accredited Tertiary Institution</span>
            </div>
          </div>

          <p>
            This offer is subject to the verification of your original certificates, credentials, and passport photographs at the administrative registry. To accept this offer, you are expected to pay a non-refundable Acceptance Fee of <strong>₦50,000</strong> using your student portal accounts dashboard within fourteen (14) days of this notice.
          </p>

          <p>
            Accept our warm congratulations.
          </p>

          {/* Signature block */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-4">
            <div>
              <p className="font-bold text-slate-700">Dr. Ajisefinni E.O.</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Rector, CrestOak College</p>
              <div className="w-16 h-8 bg-slate-100 rounded border border-slate-200 mt-1 flex items-center justify-center text-[7px] text-slate-400 font-black italic">
                Signed
              </div>
            </div>

            <div className="flex flex-col items-center gap-1.5 text-center text-[8px] font-bold text-slate-400">
              <QrCode size={45} className="text-slate-600" />
              <span>Scan to Verify Slip</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
