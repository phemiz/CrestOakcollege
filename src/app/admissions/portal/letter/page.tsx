import React from "react";
import { getSafeSession } from "@/lib/session";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import PrintButton from "./PrintButton";

export const dynamic = "force-static";

export default async function AdmissionLetterPage() {
  const session = await getSafeSession();

  if (!session) return null;

  const application = await db.application.findFirst({
    where: {
      applicantId: session.user.id,
      status: "APPROVED",
      isDeleted: false
    },
    include: {
      programme: {
        select: {
          name: true,
          code: true,
          degreeAwarded: true
        }
      },
      admission: true
    }
  });

  // If no approved offer exists, redirect back to dashboard
  if (!application) {
    redirect("/admissions/portal");
  }

  const candidateName = session.user.name || "Candidate";
  const applicationNo = application.applicationNo;
  const courseName = application.programme.name;
  const degree = application.programme.degreeAwarded;
  const admissionDate = application.admission
    ? new Date(application.admission.admittedAt).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric"
      })
    : new Date().toLocaleDateString();

  return (
    <div className="space-y-6">
      {/* Print stylesheet override */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          aside, nav, .no-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          .letter-sheet {
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
            padding: 0 !important;
            color: black !important;
          }
          .sig-image {
            filter: grayscale(1) !important;
          }
        }
      `,
        }}
      />

      {/* Header controls (hidden during print) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print bg-slate-950 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-display font-black text-white flex items-center gap-2">
            <ShieldCheck className="h-5.5 w-5.5 text-emerald-400" />
            <span>Admission Letter</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Download and print your official CrestOak College offer letter.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admissions/portal"
            className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 font-display font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center gap-2 no-underline"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <PrintButton />
        </div>
      </div>

      {/* Official Letter Sheet */}
      <div className="bg-white text-slate-950 p-8 sm:p-12 md:p-16 border border-slate-200 shadow-2xl rounded-3xl max-w-3xl mx-auto letter-sheet font-serif leading-relaxed text-sm">
        
        {/* CrestOak Official Letterhead */}
        <div className="text-center border-b-2 border-slate-900 pb-6 mb-8">
          <h1 className="font-display font-black text-2xl tracking-widest text-slate-900 uppercase">
            CrestOak College
          </h1>
          <p className="text-[10px] text-slate-600 font-sans font-bold uppercase tracking-wider mt-1">
            Main Campus, Km 4 Badagry Expressway, Lagos State, Nigeria
          </p>
          <p className="text-[10px] text-slate-500 font-sans mt-0.5">
            Web: www.crestoakcollege.edu.ng | Email: info@crestoakcollege.com.ng
          </p>
        </div>

        {/* Date & Ref */}
        <div className="flex justify-between items-start font-sans text-xs text-slate-700 mb-8">
          <div>
            <p><strong>Ref:</strong> COC/ADM/2026/F-VOL.I</p>
            <p className="mt-0.5"><strong>Date:</strong> {admissionDate}</p>
          </div>
          <div className="text-right">
            <p><strong>App No:</strong> {applicationNo}</p>
            <p className="mt-0.5"><strong>Status:</strong> Admitted</p>
          </div>
        </div>

        {/* Address */}
        <div className="mb-8 font-sans">
          <p className="text-slate-600 font-bold uppercase text-[10px] tracking-wider mb-1">PROSPECTIVE CANDIDATE:</p>
          <strong className="text-slate-900 text-base">{candidateName}</strong>
          <p className="text-slate-700 mt-1">Lagos, Nigeria</p>
        </div>

        {/* Salutation */}
        <p className="mb-6 font-semibold">Dear {candidateName.split(" ")[0]},</p>

        {/* Letter Body */}
        <div className="space-y-4 text-justify">
          <p>
            I am pleased to inform you that the Academic Board of CrestOak College has approved your application for admission into the 2026/2027 Academic Session.
          </p>
          <p>
            Consequently, you have been offered provisional admission to study for a degree leading to the award of the <strong className="text-slate-900">{degree} {courseName}</strong> in the Department of Computer Science & Information Technology.
          </p>
          <p>
            This offer is subject to the verification of your O&apos;Level and UTME JAMB results at the screening desk during physical registration resumption. You are required to log in to the student portal to settle your offer acceptance fees within two (2) weeks of receiving this notification, otherwise, your slot may be reassigned.
          </p>
          <p>
            We congratulate you on this milestone and look forward to welcoming you into our campus community.
          </p>
        </div>

        {/* Signatures */}
        <div className="mt-12 pt-8 flex justify-between items-end border-t border-slate-100 font-sans text-xs">
          <div>
            <p className="text-slate-500 uppercase text-[9px] tracking-widest font-bold">Registry Office</p>
            <div className="h-10 my-2 flex items-center justify-start">
              {/* Simulated Sig */}
              <span className="font-mono text-lg italic text-slate-700 tracking-wider">Elizabeth.A</span>
            </div>
            <strong className="text-slate-900">Dr. Elizabeth Adebayo</strong>
            <p className="text-slate-500 mt-0.5">Registrar</p>
          </div>
          <div className="text-right">
            <p className="text-slate-500 uppercase text-[9px] tracking-widest font-bold">Approved Stamp</p>
            <div className="h-14 w-28 my-1 bg-emerald-50 text-emerald-800 border-2 border-dashed border-emerald-500 rounded-xl flex flex-col items-center justify-center font-bold font-sans uppercase text-[10px] tracking-widest leading-none rotate-2">
              <span className="text-[8px] tracking-normal mb-1 font-normal font-sans">CrestOak College</span>
              <span>Admitted</span>
              <span className="text-[8px] font-mono font-normal mt-1 tracking-normal">{new Date().getFullYear()}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
