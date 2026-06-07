"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { 
  HeartPulse, 
  Briefcase, 
  Atom, 
  Scale, 
  Globe, 
  Leaf, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  GraduationCap,
  Wallet,
  Coins
} from "lucide-react";

// Academics Data Structure with Fee Schedules
const facultiesData = [
  {
    id: "health",
    name: "Faculty of Applied Health Sciences",
    icon: HeartPulse,
    dean: "Dr. Mrs. A. O. Williams",
    requirements: "Five O'Level Credit passes in WAEC/NECO/NABTEB including English Language, Mathematics, Biology, Chemistry, and Physics in not more than two sittings. Candidates with JAMB must satisfy the cut-off thresholds.",
    duration: "4 - 5 Years (Bachelor of Science / Professional Degree pathways)",
    outcomes: "Licensed Nurse, Medical Lab Scientist, Public Health Administrator, Community Health Inspector.",
    courses: [
      "Nursing Science (B.N.Sc.)",
      "Medical Laboratory Science (B.MLS)",
      "Public Health Technology (B.Sc.)",
      "Community Health (B.Sc.)",
      "Physiology & Anatomy Studies (B.Sc.)"
    ],
    fees: {
      application: 10000,
      acceptance: 20000,
      tuition: 135000,
      examination: 15000,
      hostel: 50000
    }
  },
  {
    id: "social",
    name: "Faculty of Social & Management Sciences",
    icon: Briefcase,
    dean: "Prof. S. J. Balogun",
    requirements: "Five O'Level Credit passes in WAEC/NECO including English Language, Mathematics, Economics, and any other two Social Science/Commercial subjects.",
    duration: "4 Years (Bachelor of Science - B.Sc. pathways)",
    outcomes: "Financial Analyst, Business Manager, Criminology Investigator, Hotel Executive, Diplomat.",
    courses: [
      "Business Administration & Management (B.Sc.)",
      "Banking and Finance (B.Sc.)",
      "Criminology and Security Studies (B.Sc.)",
      "Entrepreneurship & Innovation (B.Sc.)",
      "Hospitality and Tourism Management (B.Sc.)",
      "International Relations (B.Sc.)",
      "Marketing & Digital Sales (B.Sc.)",
      "Public Administration (B.Sc.)"
    ],
    fees: {
      application: 7500,
      acceptance: 15000,
      tuition: 95000,
      examination: 10000,
      hostel: 40000
    }
  },
  {
    id: "natural",
    name: "Faculty of Natural & Applied Sciences",
    icon: Atom,
    dean: "Dr. E. O. Johnson",
    requirements: "Five O'Level Credit passes including English Language, Mathematics, Chemistry, Physics, and Biology or Computer Studies.",
    duration: "4 Years (Bachelor of Science - B.Sc. degree pathways)",
    outcomes: "Software developer, Lab Biochemist, Industrial Chemist, Systems Administrator, Microbiologist.",
    courses: [
      "Computer Science (B.Sc.)",
      "Microbiology (B.Sc.)",
      "Biochemistry (B.Sc.)",
      "Mathematics & Statistics (B.Sc.)",
      "Physics with Electronics (B.Sc.)"
    ],
    fees: {
      application: 8500,
      acceptance: 15000,
      tuition: 105000,
      examination: 12000,
      hostel: 45000
    }
  },
  {
    id: "law",
    name: "Faculty of Law",
    icon: Scale,
    dean: "Barr. A. O. Coker (LL.M)",
    requirements: "Five O'Level Credit passes in WAEC/NECO including English Language, Literature in English, Mathematics, and any two Arts/Social Science subjects.",
    duration: "5 Years (LL.B pathway)",
    outcomes: "Legal Advocate, Solicitor, Corporate Counsel, Legal Consultant, Jurist.",
    courses: [
      "Civil & Common Law (LL.B)",
      "Legal Practice Diploma"
    ],
    fees: {
      application: 15000,
      acceptance: 30000,
      tuition: 180000,
      examination: 20000,
      hostel: 50000
    }
  },
  {
    id: "arts",
    name: "Faculty of Arts",
    icon: Globe,
    dean: "Mrs. F. A. Ayodele",
    requirements: "Five O'Level Credit passes in English Language, Mathematics, Literature in English, and any other two Arts/Social Science subjects.",
    duration: "4 Years (Bachelor of Arts - B.A. degree)",
    outcomes: "Public Speaker, Media Presenter, Copywriter, Theatre Producer, Translator.",
    courses: [
      "English Language & Communications (B.A.)",
      "Theatre & Creative Arts (B.A.)"
    ],
    fees: {
      application: 7500,
      acceptance: 15000,
      tuition: 90000,
      examination: 10000,
      hostel: 40000
    }
  },
  {
    id: "agriculture",
    name: "Faculty of Agricultural Sciences",
    icon: Leaf,
    dean: "Prof. I. A. Ogundele",
    requirements: "Five O'Level Credit passes in English Language, Mathematics, Agricultural Science or Biology, Chemistry, and Geography or Physics.",
    duration: "5 Years (Bachelor of Agriculture - B.Agric. pathways)",
    outcomes: "Agronomist, Farm Manager, Extension Officer, Agricultural Entrepreneur.",
    courses: [
      "Agricultural Extension and Rural Development (B.Agric.)",
      "Animal Science & Crop Tech (B.Agric.)"
    ],
    fees: {
      application: 7500,
      acceptance: 15000,
      tuition: 85000,
      examination: 10000,
      hostel: 40000
    }
  },
];


// Inner component to handle search params
const AcademicsContent: React.FC = () => {
  const searchParams = useSearchParams();
  const initialFaculty = searchParams.get("faculty") || "health";
  const [activeTab, setActiveTab] = useState(initialFaculty);
  const [showFees, setShowFees] = useState(false);

  // Set active tab if query parameter changes
  useEffect(() => {
    const f = searchParams.get("faculty");
    if (f) {
      setActiveTab(f);
    }
  }, [searchParams]);

  const currentFaculty = facultiesData.find((f) => f.id === activeTab) || facultiesData[0];

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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Navigation Sidebar (Faculties list) */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <h3 className="font-display text-slate-500 uppercase tracking-widest text-xs font-bold px-3 mb-2">
              Faculties List
            </h3>
            {facultiesData.map((fac) => {
              const Icon = fac.icon;
              const isActive = activeTab === fac.id;
              return (
                <button
                  key={fac.id}
                  onClick={() => {
                    setActiveTab(fac.id);
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

            {/* University Affiliation Alert Banner */}
            <div className="bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
              <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-center shrink-0">
                <img
                  src="/atiba-university-banner.png"
                  alt="Atiba University Logo"
                  className="h-10 w-auto object-contain"
                />
              </div>
              <div className="text-xs flex-grow">
                <p className="font-bold text-brand-blue-dark">Academic Partnership & Affiliation</p>
                <p className="text-slate-500 mt-1 leading-relaxed font-semibold">
                  This programme is hosted under the academic affiliation and supervision of <strong>Atiba University, Oyo</strong>.
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
                        Students can pay academic fees in two installments: a minimum of <strong className="text-emerald-700">60%</strong> before first-semester registration, and the balance <strong className="text-emerald-700">40%</strong> before secondary examination clearances.
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
      </div>
    </section>
  );
};

export default function Academics() {
  return (
    <>
      <Header />

      <main className="flex-grow">
        {/* HERO */}
        <section className="bg-brand-blue-dark text-white py-20 relative overflow-hidden">
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-blue/40 via-slate-900 to-slate-950" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10 text-center flex flex-col gap-4">
            <span className="text-brand-gold font-bold text-xs uppercase tracking-widest">CCHSMT Curriculum</span>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight">
              Academic Programs
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto font-medium">
              Explore our wide range of professional certificate, diploma, and degree modules.
            </p>
          </div>
        </section>

        {/* Dynamic content wrapper with Suspense */}
        <Suspense fallback={
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-red border-r-2" />
          </div>
        }>
          <AcademicsContent />
        </Suspense>

      </main>

      <Footer />
    </>
  );
}
