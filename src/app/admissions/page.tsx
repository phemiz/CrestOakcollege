"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  GuidelinesTab,
  FeesCalculatorTab,
  ApplicationFormTab,
  AdmissionTrackerTab,
  AdmissionLetterTab
} from "@/components/admissions";
import { Admission } from "@/types";
import { ArrowRight, FileText, Search, Sparkles, GraduationCap, ShieldCheck } from "lucide-react";

export default function Admissions() {
  const [activeTab, setActiveTab] = useState<"guidelines" | "fees" | "apply" | "track" | "letter">("guidelines");
  const [selectedTrackingApp, setSelectedTrackingApp] = useState<Admission | null>(null);
  
  // Prefill details from URL
  const [prefilled, setPrefilled] = useState({
    level: "",
    faculty: "",
    course: "",
    regNumber: ""
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") as "guidelines" | "fees" | "apply" | "track" | "letter" | null;
      const levelParam = params.get("level");
      const facultyParam = params.get("faculty");
      const courseParam = params.get("course");
      const regParam = params.get("reg");

      const timer = setTimeout(() => {
        if (tabParam && ["guidelines", "fees", "apply", "track", "letter"].includes(tabParam)) {
          setActiveTab(tabParam);
        }
        
        if (levelParam || facultyParam || courseParam || regParam) {
          setPrefilled({
            level: levelParam || "",
            faculty: facultyParam || "",
            course: courseParam || "",
            regNumber: regParam || ""
          });
          
          if (courseParam || levelParam) {
            setActiveTab("apply");
          } else if (regParam) {
            setActiveTab("track");
          }
        }
      }, 0);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleTrack = (regNum: string, appRecord: Admission) => {
    setSelectedTrackingApp(appRecord);
    setPrefilled(prev => ({ ...prev, regNumber: regNum }));
    setActiveTab("track");
  };

  const handleViewLetter = (appRecord: Admission) => {
    setSelectedTrackingApp(appRecord);
    setActiveTab("letter");
  };

  return (
    <>
      <Header />
      <main className="flex-grow bg-slate-50">
        {/* HERO HEADER */}
        <section className="bg-brand-blue-dark text-white py-16 sm:py-20 relative overflow-hidden">
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-blue/40 via-slate-900 to-slate-950" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10 text-center flex flex-col gap-6 items-center">
            <span className="inline-flex items-center gap-1.5 text-brand-gold font-bold text-xs uppercase tracking-widest bg-brand-gold/10 px-3.5 py-1.5 rounded-full border border-brand-gold/20">
              <Sparkles className="w-3.5 h-3.5" /> 2026/2027 Enrollment Portal
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight">
              Admissions Office
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-medium">
              Start your journey today. Apply online for Health Sciences and Medical Technology programs, check your status, and view document verification steps.
            </p>

            {/* PROMINENT DIRECT ACTION CTA BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2 w-full max-w-md justify-center">
              <Link
                href="/admissions/apply"
                className="py-3.5 px-6 bg-gradient-to-r from-brand-red to-red-700 hover:from-red-600 hover:to-red-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-red-900/30 transition-all text-sm no-underline border border-red-500/20 hover:scale-[1.02]"
              >
                <GraduationCap className="w-5 h-5" />
                Apply Online Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/admissions/status"
                className="py-3.5 px-6 bg-slate-800/90 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 border border-slate-700 transition-all text-sm no-underline hover:scale-[1.02]"
              >
                <Search className="w-4.5 h-4.5 text-brand-gold" />
                Check Application Status
              </Link>
            </div>
          </div>
        </section>

        {/* QUICK PORTAL ACCESS BANNER */}
        <section className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white py-6 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Direct Application Routes Active</h3>
                <p className="text-slate-400 text-xs">Access dedicated multi-step application form & status verification portal.</p>
              </div>
            </div>
            <div className="flex gap-3 text-xs font-semibold">
              <Link
                href="/admissions/apply"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors no-underline"
              >
                Start Multi-Step Application
              </Link>
              <Link
                href="/admissions/status"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors no-underline"
              >
                Status Checker Portal
              </Link>
            </div>
          </div>
        </section>

        {/* Tab Selection */}
        <section className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex overflow-x-auto no-scrollbar whitespace-nowrap justify-start">
            {[
              { id: "guidelines", label: "General Guidelines" },
              { id: "fees", label: "Fees & Bursary" },
              { id: "apply", label: "Online Application" },
              { id: "track", label: "Admission Tracker" },
              { id: "letter", label: "Admission Letter" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "guidelines" | "fees" | "apply" | "track" | "letter")}
                className={`py-4 px-4 sm:px-6 font-display text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
                  activeTab === tab.id
                    ? "border-brand-red text-brand-red font-extrabold"
                    : "border-transparent text-slate-500 hover:text-brand-blue-dark"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* PAGE CONTENT PANEL */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            {activeTab === "guidelines" && (
              <GuidelinesTab onStartApply={() => setActiveTab("apply")} />
            )}
            {activeTab === "fees" && (
              <FeesCalculatorTab />
            )}
            {activeTab === "apply" && (
              <ApplicationFormTab
                onTrack={handleTrack}
                prefilledLevel={prefilled.level}
                prefilledFaculty={prefilled.faculty}
                prefilledCourse={prefilled.course}
              />
            )}
            {activeTab === "track" && (
              <AdmissionTrackerTab
                onViewLetter={handleViewLetter}
                initialRegNum={prefilled.regNumber}
              />
            )}
            {activeTab === "letter" && (
              <AdmissionLetterTab trackingApplication={selectedTrackingApp} />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
