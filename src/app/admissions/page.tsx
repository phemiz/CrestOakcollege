"use client";

import React, { useState, useEffect } from "react";
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
        <section className="bg-brand-blue-dark text-white py-20 relative overflow-hidden">
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-blue/40 via-slate-900 to-slate-950" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10 text-center flex flex-col gap-4">
            <span className="text-brand-gold font-bold text-xs uppercase tracking-widest">Enrollment Portal</span>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight">
              Admissions Office
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto font-medium">
              Start your journey today. Apply online for Undergraduate (2026/2027) or Postgraduate (2025/2026) cycles, track your status, and print offer letters.
            </p>
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
