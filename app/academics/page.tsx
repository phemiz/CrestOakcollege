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
  GraduationCap 
} from "lucide-react";

// Academics Data Structure
const facultiesData = [
  {
    id: "health",
    name: "Faculty of Allied Health Sciences",
    icon: HeartPulse,
    dean: "Dr. Mrs. A. O. Williams",
    requirements: "Five O'Level Credit passes in WAEC/NECO/NABTEB including English Language, Mathematics, Biology, Chemistry, and Physics in not more than two sittings.",
    duration: "3 - 5 Years (depending on Certificate, Diploma, or Degree path)",
    outcomes: "Registered Nurse, Clinical Lab Assistant, Public Health Administrator, Community Health Officer.",
    courses: [
      "Nursing Science",
      "Medical Laboratory Science",
      "Public Health",
      "Physiology"
    ],
  },
  {
    id: "social",
    name: "Faculty of Social & Management Sciences",
    icon: Briefcase,
    dean: "Prof. S. J. Balogun",
    requirements: "Five O'Level Credit passes in WAEC/NECO including English Language, Mathematics, Economics, and any other two Social Science/Commercial subjects.",
    duration: "4 Years (for Bachelor's degree pathways)",
    outcomes: "Financial Analyst, Business Administrator, Intelligence & Security Analyst, Hotel Manager, diplomat, Public Administrator.",
    courses: [
      "Banking and Finance",
      "Business Administration",
      "Criminology and Security Studies",
      "Entrepreneurship",
      "Hospitality and Tourism Management",
      "International Relations",
      "Marketing",
      "Political Science",
      "Public Administration",
      "Psychology",
      "Sociology",
      "Transport Management"
    ],
  },
  {
    id: "natural",
    name: "Faculty of Natural & Applied Sciences",
    icon: Atom,
    dean: "Dr. E. O. Johnson",
    requirements: "Five O'Level Credit passes including English Language, Mathematics, Chemistry, Physics, and Biology or Computer Studies.",
    duration: "4 Years",
    outcomes: "Software Engineer, Biochemist, Chemical Analyst, Microbiologist, Systems Specialist.",
    courses: [
      "Biochemistry",
      "Chemistry",
      "Microbiology",
      "Computer Science (Dept. of Physical & Computer Sciences)",
      "Mathematics (Dept. of Physical & Computer Sciences)",
      "Physics (Dept. of Physical & Computer Sciences)",
      "Physics with Electronics (Dept. of Physical & Computer Sciences)"
    ],
  },
  {
    id: "law",
    name: "Faculty of Law",
    icon: Scale,
    dean: "Barr. A. O. Coker (LL.M)",
    requirements: "Five O'Level Credit passes in WAEC/NECO including English Language, Literature in English, Mathematics, and any two Arts/Social Science subjects.",
    duration: "5 Years (LL.B pathway)",
    outcomes: "Legal Advocate, Solicitor, Corporate Legal Adviser, Judicial Officer, Legal Consultant.",
    courses: [
      "Law"
    ],
  },
  {
    id: "arts",
    name: "Faculty of Arts",
    icon: Globe,
    dean: "Mrs. F. A. Ayodele",
    requirements: "Five O'Level Credit passes in English Language, Mathematics, Literature in English, and any other two Arts/Social Science subjects.",
    duration: "4 Years",
    outcomes: "Academic Instructor, Theater Director, Copywriter, Media Producer, Communications Specialist.",
    courses: [
      "English Language",
      "Theatre Arts"
    ],
  },
  {
    id: "agriculture",
    name: "Faculty of Agricultural Sciences",
    icon: Leaf,
    dean: "Prof. I. A. Ogundele",
    requirements: "Five O'Level Credit passes in English Language, Mathematics, Agricultural Science or Biology, Chemistry, and Geography or Physics.",
    duration: "4 - 5 Years",
    outcomes: "Extension Specialist, Agricultural Project Manager, Farm Consultant, Agronomist.",
    courses: [
      "Agricultural Extension and Rural Development"
    ],
  },
];

// Inner component to handle search params
const AcademicsContent: React.FC = () => {
  const searchParams = useSearchParams();
  const initialFaculty = searchParams.get("faculty") || "health";
  const [activeTab, setActiveTab] = useState(initialFaculty);

  // Set active tab if query parameter changes
  useEffect(() => {
    const f = searchParams.get("faculty");
    if (f) {
      setActiveTab(f);
    }
  }, [searchParams]);

  const currentFaculty = facultiesData.find((f) => f.id === activeTab) || facultiesData[0];

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
                  onClick={() => setActiveTab(fac.id)}
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
          <div className="lg:col-span-8 bg-brand-bg-light border border-slate-100 p-8 rounded-3xl flex flex-col gap-8">
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
            <div className="bg-white border border-slate-200/50 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-white p-0.5 border border-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                <img
                  src="/atiba-logo.png"
                  alt="Atiba University Logo"
                  className="object-contain w-full h-full rounded-full"
                />
              </div>
              <div className="text-xs">
                <p className="font-bold text-brand-blue-dark">Academic Partnership & Affiliation</p>
                <p className="text-slate-500 mt-0.5 leading-relaxed font-semibold">
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
