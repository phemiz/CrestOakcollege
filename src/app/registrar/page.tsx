"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  FileSpreadsheet,
  BookOpenCheck,
  Award,
  CalendarDays,
  ArrowRight,
  ShieldCheck,
  Loader2,
  LockKeyhole,
  CheckCircle2
} from "lucide-react";

export const dynamic = "force-static";

export default function RegistrarRootPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("isAuthenticated") === "true";
      const userStr = localStorage.getItem("user") || localStorage.getItem("cchsmt_user_session");
      if (auth && userStr) {
        try {
          const parsed = JSON.parse(userStr);
          const roleUpper = String(parsed.role || "").toUpperCase();
          if (roleUpper.includes("REGISTRAR") || roleUpper.includes("ADMIN")) {
            setIsAuthenticated(true);
            setUserName(parsed.name || parsed.username || "Registrar");
            router.push("/registrar/dashboard");
            return;
          }
        } catch (e) {
          console.error("Error parsing user session:", e);
        }
      }
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-900 text-white">
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-300">Verifying Registrar Access...</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-indigo-600/10 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-600/10 blur-[100px] pointer-events-none rounded-full" />

        {/* HERO SECTION */}
        <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center space-y-8">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs sm:text-sm font-semibold tracking-wide uppercase shadow-lg shadow-indigo-950/50">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            Official University Registrar Gateway
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Office of the <span className="bg-gradient-to-r from-indigo-400 via-blue-300 to-sky-400 bg-clip-text text-transparent">University Registrar</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
            Centralized academic governance, transcript processing, degree clearance, course offerings approval, and examination timetable locks for CrestOak College.
          </p>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {isAuthenticated ? (
              <Link
                href="/registrar/dashboard"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold rounded-2xl shadow-xl shadow-indigo-900/40 flex items-center justify-center gap-3 text-base sm:text-lg transition-all transform hover:-translate-y-0.5"
              >
                <span>Enter Registrar Dashboard ({userName})</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <Link
                href="/registrar/login"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-800 hover:from-indigo-500 hover:to-blue-700 text-white font-extrabold rounded-2xl shadow-xl shadow-indigo-950/60 flex items-center justify-center gap-3 text-base sm:text-lg transition-all transform hover:-translate-y-0.5 border border-indigo-400/20"
              >
                <LockKeyhole className="w-5 h-5 text-indigo-300" />
                <span>Sign In to Registrar Portal</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>

          {/* CORE RESPONSIBILITIES PREVIEW GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-12 text-left">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm space-y-3 hover:border-indigo-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Academic Records</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Transcript request approvals, CGPA verifications, and student status updates (Active, Graduated, Withdrawn).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm space-y-3 hover:border-indigo-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <BookOpenCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Course Catalog</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Management of enrollment caps, department course schedules approval, and prerequisite waivers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm space-y-3 hover:border-indigo-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Degree Clearance</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Final degree audits, convocation list sign-offs, and digital diploma authenticity verification.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm space-y-3 hover:border-indigo-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <CalendarDays className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Calendar & Exams</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Exam timetable publishing, registration deadlines, and lecturer grade submission window locks.
              </p>
            </div>
          </div>
        </section>

        {/* SECURITY & GOVERNANCE NOTICE */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 w-full">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-xs sm:text-sm text-slate-300 font-medium">
                Authorized access only. All actions within this portal are cryptographically logged for institutional audit compliance.
              </span>
            </div>
            <Link
              href="/registrar/login"
              className="text-xs sm:text-sm font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-4 whitespace-nowrap"
            >
              Go to Login &rarr;
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
