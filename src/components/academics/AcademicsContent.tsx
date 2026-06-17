"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  GraduationCap,
  Wallet,
  Coins
} from "lucide-react";

import { facultiesData, postgraduateData } from "@/data/academicsData";

export const AcademicsContent: React.FC = () => {
  const searchParams = useSearchParams();
  const initialFaculty = searchParams.get("faculty") || "health";
  const initialLevel = searchParams.get("level") || "undergraduate";
  const initialTab = searchParams.get("tab");

  const [academicLevel, setAcademicLevel] = useState<"undergraduate" | "postgraduate">(
    initialLevel === "postgraduate" || initialTab === "postgraduate" ? "postgraduate" : "undergraduate"
  );
  
  const [activeFacultyTab, setActiveFacultyTab] = useState(initialFaculty);
  const [activePostgradTab, setActivePostgradTab] = useState("pgd");
  const [showFees, setShowFees] = useState(false);

  // Sync URL parameters
  useEffect(() => {
    const f = searchParams.get("faculty");
    const lvl = searchParams.get("level");
    const t = searchParams.get("tab");

    const timer = setTimeout(() => {
      if (f) {
        setActiveFacultyTab(f);
        setAcademicLevel("undergraduate");
      }
      if (lvl === "postgraduate" || t === "postgraduate") {
        setAcademicLevel("postgraduate");
      } else if (lvl === "undergraduate") {
        setAcademicLevel("undergraduate");
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [searchParams]);

  const currentFaculty = facultiesData.find((f) => f.id === activeFacultyTab) || facultiesData[0];
  const currentPostgrad = postgraduateData.find((p) => p.id === activePostgradTab) || postgraduateData[0];

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Toggle Switcher */}
        <div className="flex justify-center mb-12">
          <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50 flex gap-2 w-full max-w-md shadow-inner">
            <button
              onClick={() => {
                setAcademicLevel("undergraduate");
                setShowFees(false);
              }}
              className={`flex-1 py-3 px-5 rounded-xl text-center font-display text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                academicLevel === "undergraduate"
                  ? "bg-brand-red text-white shadow-md"
                  : "text-slate-500 hover:text-brand-blue-dark hover:bg-slate-200/50"
              }`}
            >
              Undergraduate (2026/2027)
            </button>
            <button
              onClick={() => {
                setAcademicLevel("postgraduate");
                setShowFees(false);
              }}
              className={`flex-1 py-3 px-5 rounded-xl text-center font-display text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                academicLevel === "postgraduate"
                  ? "bg-brand-red text-white shadow-md"
                  : "text-slate-500 hover:text-brand-blue-dark hover:bg-slate-200/50"
              }`}
            >
              Postgraduate (2025/2026)
            </button>
          </div>
        </div>

        {academicLevel === "undergraduate" ? (
          /* UNDERGRADUATE CONTENT */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Navigation Sidebar (Faculties list) */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              <h3 className="font-display text-slate-500 uppercase tracking-widest text-xs font-bold px-3 mb-2">
                Undergraduate Faculties
              </h3>
              {facultiesData.map((fac) => {
                const Icon = fac.icon;
                const isActive = activeFacultyTab === fac.id;
                return (
                  <button
                    key={fac.id}
                    onClick={() => {
                      setActiveFacultyTab(fac.id);
                      setShowFees(false); // Reset fees view
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      isActive
                         ? "border-brand-red bg-brand-red-light/10 text-brand-blue-dark shadow-sm font-semibold"
                         : "border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-brand-blue-dark"
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl shrink-0 ${isActive ? "bg-brand-red text-white" : "bg-slate-200 text-slate-600"}`}>
                      <Icon size={18} />
                    </div>
                    <span className="font-display text-xs sm:text-sm font-bold tracking-tight leading-snug">
                      {fac.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Main Faculty Details View */}
            <div className="lg:col-span-8 bg-brand-bg-light border border-slate-100 p-6 sm:p-8 rounded-3xl flex flex-col gap-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-6">
                <div>
                  <span className="text-brand-red font-bold text-xs uppercase tracking-widest">Faculty Details</span>
                  <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-brand-blue-dark mt-1">
                    {currentFaculty.name}
                  </h2>
                </div>
                <div className="bg-white border border-slate-100 px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 shadow-sm shrink-0 w-fit">
                  Dean: <span className="text-brand-blue-dark font-bold">{currentFaculty.dean}</span>
                </div>
              </div>

              {/* CrestOak College Academic Banner */}
              <div className="bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-red" />
                <div className="bg-white px-2 py-2 rounded-xl border border-slate-100 shadow-sm flex items-center justify-center shrink-0">
                  <Image
                    src="/crestoak-logo.png"
                    alt="CrestOak College Logo"
                    width={40}
                    height={40}
                    loading="lazy"
                    className="h-10 w-10 object-contain"
                  />
                </div>
                <div className="text-xs flex-grow">
                  <p className="font-bold text-brand-blue-dark text-sm sm:text-base">
                    CrestOak College of Health Sciences, Management, and Technology
                  </p>
                  <p className="text-slate-500 mt-0.5 leading-relaxed font-semibold">
                    Undergraduate programs are designed to meet standard national and clinical guidelines to foster first-class professional skills and competence.
                  </p>
                </div>
              </div>

              {/* Courses list */}
              <div>
                <h4 className="font-display font-extrabold text-brand-blue-dark text-lg mb-4 flex items-center gap-2">
                  <GraduationCap size={20} className="text-brand-red" />
                  Available Courses / Programs
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentFaculty.courses.map((course) => (
                    <div key={course} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-red shrink-0" />
                      <span className="font-display text-sm font-bold text-brand-blue-dark">{course}</span>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-slate-200/60" />

              {/* Requirements & Duration Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-3">
                  <h5 className="font-display font-bold text-brand-blue-dark text-base flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-brand-blue-light" />
                    Entry Requirements
                  </h5>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-semibold">
                    {currentFaculty.requirements}
                  </p>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <h5 className="font-display font-bold text-brand-blue-dark text-base flex items-center gap-2">
                      <Clock size={18} className="text-brand-blue-light" />
                      Standard Duration
                    </h5>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-semibold">
                      {currentFaculty.duration}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <h5 className="font-display font-bold text-brand-blue-dark text-base flex items-center gap-2">
                      <GraduationCap size={18} className="text-brand-blue-light" />
                      Career & Job Outcomes
                    </h5>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-semibold">
                      {currentFaculty.outcomes}
                    </p>
                  </div>
                </div>
              </div>

              <hr className="border-slate-200/60" />

              {/* Structured Tuition Fee Section */}
              <div className="bg-white rounded-2xl border border-slate-150 p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet size={20} className="text-brand-red" />
                    <h5 className="font-display font-bold text-brand-blue-dark text-base">
                      Naira (₦) Fees & Funding
                    </h5>
                  </div>
                  <button
                    onClick={() => setShowFees(!showFees)}
                    className="bg-brand-blue-light/10 text-brand-blue-light hover:bg-brand-blue-light hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>{showFees ? "Hide Fees Breakdown" : "View Fees Breakdown"}</span>
                    <ChevronRight size={14} className={`transition-transform duration-200 ${showFees ? "rotate-90" : ""}`} />
                  </button>
                </div>

                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  CCHSMT runs a student-focused affordable tuition structure. Invoices are generated in Naira (₦) and can be paid securely online via Paystack or bank transfer.
                </p>

                {showFees && (
                  <div className="mt-2 border-t border-slate-100 pt-4 flex flex-col gap-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="py-2.5 pb-2">Fee Category</th>
                            <th className="py-2.5 pb-2 text-right">Amount (₦)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                          <tr>
                            <td className="py-2.5">Application Form Fee</td>
                            <td className="py-2.5 text-right font-display text-brand-blue-dark">{formatNaira(currentFaculty.fees.application)}</td>
                          </tr>
                          <tr>
                            <td className="py-2.5">Acceptance Fee (One-Time)</td>
                            <td className="py-2.5 text-right font-display text-brand-blue-dark">{formatNaira(currentFaculty.fees.acceptance)}</td>
                          </tr>
                          <tr>
                            <td className="py-2.5">Academic Tuition Fee (Per Session)</td>
                            <td className="py-2.5 text-right font-display text-brand-blue-dark">{formatNaira(currentFaculty.fees.tuition)}</td>
                          </tr>
                          <tr>
                            <td className="py-2.5">Examination & Practical Assessment Fee</td>
                            <td className="py-2.5 text-right font-display text-brand-blue-dark">{formatNaira(currentFaculty.fees.examination)}</td>
                          </tr>
                          <tr>
                            <td className="py-2.5">Hostel Accommodation Fee (Optional)</td>
                            <td className="py-2.5 text-right font-display text-brand-blue-dark">{formatNaira(currentFaculty.fees.hostel)}</td>
                          </tr>
                          <tr className="bg-slate-50 font-black text-brand-blue-dark">
                            <td className="py-3 px-2 rounded-l-lg">Total Session Fee (with Hostel)</td>
                            <td className="py-3 px-2 text-right rounded-r-lg font-display text-brand-red">
                              {formatNaira(
                                currentFaculty.fees.acceptance +
                                currentFaculty.fees.tuition +
                                currentFaculty.fees.examination +
                                currentFaculty.fees.hostel
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Payment install notice */}
                    <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-xs flex gap-2 items-start font-semibold">
                      <Coins size={16} className="shrink-0 text-emerald-600 mt-0.5" />
                      <div>
                        <p className="font-bold text-brand-blue-dark">Flexible Payment Plan Options</p>
                        <p className="mt-1 leading-relaxed text-slate-600 font-semibold">
                          Students can pay academic fees in two installments: a minimum of <strong className="text-emerald-700">70%</strong> before first-semester registration, and the balance <strong className="text-emerald-700">30%</strong> before secondary examination clearances.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Application Quick Link Banner */}
              <div className="mt-4 bg-brand-blue text-white p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h5 className="font-display font-bold text-base">Interest in this Faculty?</h5>
                  <p className="text-slate-200 text-xs mt-1">Start your online registration now to secure admission.</p>
                </div>
                <Link href="/admissions">
                  <button className="bg-brand-red hover:bg-brand-red/90 text-white font-display font-bold px-6 py-2.5 rounded-full text-xs transition-colors shrink-0 cursor-pointer">
                    Apply Now
                  </button>
                </Link>
              </div>

            </div>
          </div>
        ) : (
          /* POSTGRADUATE CONTENT */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Navigation Sidebar (Postgrad degrees list) */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              <h3 className="font-display text-slate-500 uppercase tracking-widest text-xs font-bold px-3 mb-2">
                Postgraduate Degrees
              </h3>
              {postgraduateData.map((prog) => {
                const Icon = prog.icon;
                const isActive = activePostgradTab === prog.id;
                return (
                  <button
                    key={prog.id}
                    onClick={() => {
                      setActivePostgradTab(prog.id);
                      setShowFees(false);
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      isActive
                         ? "border-brand-red bg-brand-red-light/10 text-brand-blue-dark shadow-sm font-semibold"
                         : "border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-brand-blue-dark"
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl shrink-0 ${isActive ? "bg-brand-red text-white" : "bg-slate-200 text-slate-600"}`}>
                      <Icon size={18} />
                    </div>
                    <span className="font-display text-xs sm:text-sm font-bold tracking-tight leading-snug">
                      {prog.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Main Postgraduate Details View */}
            <div className="lg:col-span-8 bg-brand-bg-light border border-slate-100 p-6 sm:p-8 rounded-3xl flex flex-col gap-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-6">
                <div>
                  <span className="text-brand-red font-bold text-xs uppercase tracking-widest">Program Details (2025/2026)</span>
                  <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-brand-blue-dark mt-1">
                    {currentPostgrad.name}
                  </h2>
                </div>
                <div className="bg-white border border-slate-100 px-4 py-2 rounded-xl text-xs font-semibold text-emerald-600 shadow-sm shrink-0 w-fit">
                  Status: <span className="font-bold">NUC-Approved</span>
                </div>
              </div>

              {/* CrestOak College Academic Banner */}
              <div className="bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-red" />
                <div className="bg-white px-2 py-2 rounded-xl border border-slate-100 shadow-sm flex items-center justify-center shrink-0">
                  <Image
                    src="/crestoak-logo.png"
                    alt="CrestOak College Logo"
                    width={40}
                    height={40}
                    loading="lazy"
                    className="h-10 w-10 object-contain"
                  />
                </div>
                <div className="text-xs flex-grow">
                  <p className="font-bold text-brand-blue-dark text-sm sm:text-base">
                    CrestOak College of Health Sciences, Management, and Technology
                  </p>
                  <p className="text-slate-500 mt-0.5 leading-relaxed font-semibold">
                    Postgraduate programs are structured to foster advanced research, expert leadership, and specialized competence in management, health sciences, and technology.
                  </p>
                </div>
              </div>

              {/* Courses list */}
              <div>
                <h4 className="font-display font-extrabold text-brand-blue-dark text-lg mb-4 flex items-center gap-2">
                  <GraduationCap size={20} className="text-brand-red" />
                  Available Departments / Majors
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentPostgrad.courses.map((course) => (
                    <div key={course} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-red shrink-0" />
                      <span className="font-display text-sm font-bold text-brand-blue-dark">{course}</span>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-slate-200/60" />

              {/* Requirements & Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-3">
                  <h5 className="font-display font-bold text-brand-blue-dark text-base flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-brand-blue-light" />
                    Entry Requirements
                  </h5>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-semibold">
                    {currentPostgrad.requirements}
                  </p>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <h5 className="font-display font-bold text-brand-blue-dark text-base flex items-center gap-2">
                      <Clock size={18} className="text-brand-blue-light" />
                      Program Duration
                    </h5>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-semibold">
                      {currentPostgrad.duration}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <h5 className="font-display font-bold text-brand-blue-dark text-base flex items-center gap-2">
                      <GraduationCap size={18} className="text-brand-blue-light" />
                      Career Path & Research
                    </h5>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-semibold">
                      {currentPostgrad.outcomes}
                    </p>
                  </div>
                </div>
              </div>

              <hr className="border-slate-200/60" />

              {/* Tuition Fees */}
              <div className="bg-white rounded-2xl border border-slate-150 p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet size={20} className="text-brand-red" />
                    <h5 className="font-display font-bold text-brand-blue-dark text-base">
                      Naira (₦) Fees & Funding
                    </h5>
                  </div>
                  <button
                    onClick={() => setShowFees(!showFees)}
                    className="bg-brand-blue-light/10 text-brand-blue-light hover:bg-brand-blue-light hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>{showFees ? "Hide Fees Breakdown" : "View Fees Breakdown"}</span>
                    <ChevronRight size={14} className={`transition-transform duration-200 ${showFees ? "rotate-90" : ""}`} />
                  </button>
                </div>

                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Postgraduate studies run on an administrative schedule with structured term charges. Tuition scholarship options are available for qualified applicants.
                </p>

                {showFees && (
                  <div className="mt-2 border-t border-slate-100 pt-4 flex flex-col gap-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="py-2.5 pb-2">Fee Category</th>
                            <th className="py-2.5 pb-2 text-right">Amount (₦)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                          <tr>
                            <td className="py-2.5">Postgraduate Application Fee</td>
                            <td className="py-2.5 text-right font-display text-brand-blue-dark">{formatNaira(currentPostgrad.fees.application)}</td>
                          </tr>
                          <tr>
                            <td className="py-2.5">Acceptance Fee (One-Time)</td>
                            <td className="py-2.5 text-right font-display text-brand-blue-dark">{formatNaira(currentPostgrad.fees.acceptance)}</td>
                          </tr>
                          <tr>
                            <td className="py-2.5">Postgraduate Tuition Fee (Per Session)</td>
                            <td className="py-2.5 text-right font-display text-brand-blue-dark">{formatNaira(currentPostgrad.fees.tuition)}</td>
                          </tr>
                          <tr>
                            <td className="py-2.5">Examination & Thesis Defence Fee</td>
                            <td className="py-2.5 text-right font-display text-brand-blue-dark">{formatNaira(currentPostgrad.fees.examination)}</td>
                          </tr>
                          <tr className="bg-slate-50 font-black text-brand-blue-dark">
                            <td className="py-3 px-2 rounded-l-lg">Total Session Fee (without Hostel)</td>
                            <td className="py-3 px-2 text-right rounded-r-lg font-display text-brand-red">
                              {formatNaira(
                                currentPostgrad.fees.acceptance +
                                currentPostgrad.fees.tuition +
                                currentPostgrad.fees.examination
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Application */}
              <div className="mt-4 bg-brand-blue text-white p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h5 className="font-display font-bold text-base">Ready to Apply?</h5>
                  <p className="text-slate-200 text-xs mt-1">Submit your credentials to study in the 2025/2026 cycle.</p>
                </div>
                <Link href="/admissions">
                  <button className="bg-brand-red hover:bg-brand-red/90 text-white font-display font-bold px-6 py-2.5 rounded-full text-xs transition-colors shrink-0 cursor-pointer">
                    Apply Now
                  </button>
                </Link>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
};
