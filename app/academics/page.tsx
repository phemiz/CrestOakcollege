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
  Coins,
  BookOpen
} from "lucide-react";

// Academics Data Structure with Fee Schedules
const facultiesData = [
  {
    id: "health",
    name: "Faculty of Health Sciences",
    icon: HeartPulse,
    dean: "Dr. Mrs. A. O. Williams",
    requirements: "Five O'Level Credit passes in WAEC/NECO/NABTEB including English Language, Mathematics, Biology, Chemistry, and Physics in not more than two sittings. Candidates with JAMB must satisfy the cut-off threshold of 140 (Nursing Sciences requires 200).",
    duration: "4 - 5 Years (B.Sc. / BMLs / professional pathways)",
    outcomes: "Licensed Nurse, Medical Lab Scientist, Public Health Administrator, Community Health Inspector.",
    courses: [
      "Nursing Sciences (B.Sc.)",
      "Medical Laboratory Science (BMLs)",
      "Public Health",
      "Physiology"
    ],
    fees: {
      application: 10000,
      acceptance: 25000,
      tuition: 150000,
      examination: 25000,
      hostel: 50000
    }
  },
  {
    id: "natural",
    name: "Faculty of Natural and Applied Sciences",
    icon: Atom,
    dean: "Dr. E. O. Johnson",
    requirements: "Five O'Level Credit passes including English Language, Mathematics, Chemistry, Physics, and Biology or Computer Studies.",
    duration: "4 Years (Bachelor of Science - B.Sc. degree pathways)",
    outcomes: "Software developer, Lab Biochemist, Industrial Chemist, Systems Administrator, Microbiologist.",
    courses: [
      "Biochemistry",
      "Chemistry",
      "Microbiology",
      "Computer Science",
      "Mathematics",
      "Physics",
      "Physics with Electronics"
    ],
    fees: {
      application: 10000,
      acceptance: 25000,
      tuition: 150000,
      examination: 25000,
      hostel: 50000
    }
  },
  {
    id: "arts_social_management",
    name: "Faculty of Arts, Social and Management Sciences",
    icon: Briefcase,
    dean: "Prof. S. J. Balogun",
    requirements: "Five O'Level Credit passes in WAEC/NECO including English Language, Mathematics, and three other relevant Arts, Social Science, or Commercial subjects.",
    duration: "4 Years (Bachelor of Science / Bachelor of Arts pathways)",
    outcomes: "Financial Analyst, Business Manager, Criminology Investigator, Hotel Executive, Diplomat, Communicator.",
    courses: [
      "English",
      "Theater",
      "Accounting",
      "Banking and Finance",
      "Business Administration",
      "Criminology and Security Studies",
      "Entrepreneurship",
      "Economics",
      "Hospitality and Tourism Management",
      "International Relations",
      "Marketing",
      "Political Science",
      "Public Administration",
      "Psychology",
      "Sociology",
      "Transport Management"
    ],
    fees: {
      application: 10000,
      acceptance: 25000,
      tuition: 150000,
      examination: 25000,
      hostel: 50000
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
      "LL.B Law"
    ],
    fees: {
      application: 10000,
      acceptance: 25000,
      tuition: 150000,
      examination: 25000,
      hostel: 50000
    }
  },
  {
    id: "education",
    name: "Faculty of Education",
    icon: BookOpen,
    dean: "Dr. Mrs. F. A. Ayodele",
    requirements: "Five O'Level Credit passes in WAEC/NECO including English Language, Mathematics, and three other relevant teaching subject areas.",
    duration: "4 Years (Bachelor of Education - B.Ed. pathways)",
    outcomes: "Educational Administrator, Library Consultant, Information Officer, School Principal.",
    courses: [
      "Educational Management",
      "Library & Information Science"
    ],
    fees: {
      application: 10000,
      acceptance: 25000,
      tuition: 150000,
      examination: 25000,
      hostel: 50000
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
      "Agricultural Extension and Rural Development"
    ],
    fees: {
      application: 10000,
      acceptance: 25000,
      tuition: 150000,
      examination: 25000,
      hostel: 50000
    }
  }
];

// Postgraduate Data Structure
const postgraduateData = [
  {
    id: "pgd",
    name: "Postgraduate Diploma (PGD) Programmes",
    icon: BookOpen,
    requirements: "A good first degree (B.Sc. / HND) in a relevant field from a recognized tertiary institution. Candidates must also satisfy the specific department's core prerequisite subject requirements.",
    duration: "1 - 2 Years (Postgraduate Diploma)",
    outcomes: "Advanced corporate advancement, structural training shift, or prerequisite criteria fulfillment for master's degree pathways.",
    courses: [
      "Accounting",
      "Business Administration",
      "Public Administration",
      "Computer Science"
    ],
    fees: {
      application: 15000,
      acceptance: 30000,
      tuition: 220000,
      examination: 30000,
      hostel: 50000
    }
  },
  {
    id: "msc",
    name: "Master of Science (M.Sc.) Programmes",
    icon: GraduationCap,
    requirements: "A good first degree in the relevant discipline with a minimum of Second Class Lower division from a recognized institution.",
    duration: "1.5 - 2 Years (Master of Science)",
    outcomes: "Specialist corporate consultant, scientific research specialist, university lecturer, public administrator.",
    courses: [
      "Public Administration",
      "Computer Science",
      "Business Administration",
      "Nursing",
      "Political Science",
      "Economics",
      "International Relations",
      "Sociology"
    ],
    fees: {
      application: 15000,
      acceptance: 30000,
      tuition: 250000,
      examination: 30000,
      hostel: 50000
    }
  },
  {
    id: "mba",
    name: "Master of Business Administration (MBA)",
    icon: Briefcase,
    requirements: "A good first degree in business or commercial sciences, or a recognized Postgraduate Diploma in administration, with professional work experience.",
    duration: "1.5 - 2 Years (Master of Business Administration)",
    outcomes: "Chief executive officer, organizational manager, senior business administrator, entrepreneur.",
    courses: [
      "Business Administration"
    ],
    fees: {
      application: 20000,
      acceptance: 30000,
      tuition: 280000,
      examination: 30000,
      hostel: 50000
    }
  },
  {
    id: "ma",
    name: "Master of Arts (M.A.) Programmes",
    icon: Globe,
    requirements: "A good bachelor's degree in English or adjacent humanities subjects with a minimum of Second Class Lower division.",
    duration: "1.5 - 2 Years (Master of Arts)",
    outcomes: "Communications director, editor, communications consultant, lecturer, publisher.",
    courses: [
      "English"
    ],
    fees: {
      application: 15000,
      acceptance: 30000,
      tuition: 240000,
      examination: 30000,
      hostel: 50000
    }
  },
  {
    id: "phd",
    name: "Doctor of Philosophy (Ph.D.) Programmes",
    icon: Scale,
    requirements: "A recognized Master's degree in the relevant discipline with a cumulative Grade Point Average (GPA) of 3.50 on a 5.00 point scale or 60% average.",
    duration: "3 - 5 Years (Doctoral Degree)",
    outcomes: "Doctoral researcher, university professor, government policymaker, institutional consultant.",
    courses: [
      "Public Administration",
      "Computer Science",
      "Political Science",
      "Economics",
      "International Relations",
      "Sociology",
      "English"
    ],
    fees: {
      application: 25000,
      acceptance: 40000,
      tuition: 350000,
      examination: 40000,
      hostel: 50000
    }
  }
];

// Inner component to handle search params
const AcademicsContent: React.FC = () => {
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
    if (f) {
      setActiveFacultyTab(f);
      setAcademicLevel("undergraduate");
    }
    const lvl = searchParams.get("level");
    const t = searchParams.get("tab");
    if (lvl === "postgraduate" || t === "postgraduate") {
      setAcademicLevel("postgraduate");
    } else if (lvl === "undergraduate") {
      setAcademicLevel("undergraduate");
    }
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

              {/* Affiliation Alert Banner */}
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
                  <p className="font-bold text-brand-blue-dark">Postgraduate Academic Partnership</p>
                  <p className="text-slate-500 mt-1 leading-relaxed font-semibold">
                    Offered under the academic affiliation and supervision of <strong>Atiba University, Oyo</strong>.
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
              Explore our wide range of undergraduate and postgraduate modules.
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
