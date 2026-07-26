"use client";

import React, { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Logo } from "@/components/ui/logo";
import {
  BookOpen,
  User,
  Shield,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  GraduationCap,
  Building2,
  ShieldCheck,
  HelpCircle
} from "lucide-react";

const subdomainPortals = [
  {
    id: "Student",
    title: "Student Portal",
    subdomain: "portal.crestoakcollege.com.ng",
    description: "Course registration, results & student dashboard",
    icon: GraduationCap,
    isCurrent: true,
    url: "/login",
    colorClass: "border-brand-blue bg-brand-blue/5 text-brand-blue-dark",
    badgeBg: "bg-brand-blue text-white",
  },
  {
    id: "Admin",
    title: "Admin & Staff Portal",
    subdomain: "admin.crestoakcollege.com.ng",
    description: "Staff management, registry & administrative controls",
    icon: Shield,
    isCurrent: false,
    url: "https://admin.crestoakcollege.com.ng",
    localFallback: "/admin",
    colorClass: "border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50/50 text-slate-700",
    badgeBg: "bg-purple-600 text-white",
  },
  {
    id: "Bursary",
    title: "Bursary & Payments",
    subdomain: "pay.crestoakcollege.com.ng",
    description: "Tuition invoices, fee receipts & payment validation",
    icon: CreditCard,
    isCurrent: false,
    url: "https://pay.crestoakcollege.com.ng",
    localFallback: "/bursary",
    colorClass: "border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/50 text-slate-700",
    badgeBg: "bg-amber-600 text-white",
  },
  {
    id: "Admissions",
    title: "Admissions Portal",
    subdomain: "admissions.crestoakcollege.com.ng",
    description: "Online application, tracking & admission letters",
    icon: BookOpen,
    isCurrent: false,
    url: "https://admissions.crestoakcollege.com.ng",
    localFallback: "/admissions/apply",
    colorClass: "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700",
    badgeBg: "bg-emerald-600 text-white",
  },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const sessionResult = useSession();
  const session = sessionResult?.data;
  const status = sessionResult?.status || (isClient ? "unauthenticated" : "loading");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check URL parameters for errors
  useEffect(() => {
    if (!isClient) return;
    const errorType = searchParams.get("error");
    if (errorType === "AccessDenied") {
      setErrorMsg("Access Denied: You do not have permission to access that page. Please log in with valid student credentials.");
    } else if (errorType === "CredentialsSignin") {
      setErrorMsg("Invalid Student Registration Number or Password.");
    } else if (errorType) {
      setErrorMsg("An authentication error occurred. Please check your credentials and try again.");
    }
  }, [isClient, searchParams]);

  // Redirect if already authenticated as student or admin
  useEffect(() => {
    if (isClient && status === "authenticated" && session?.user) {
      const userRole = session.user.role;
      if (userRole === "Student") {
        router.push("/portal");
      } else if (userRole === "Lecturer" || userRole === "Staff") {
        router.push("/staff");
      } else if (userRole === "Bursary") {
        router.push("/bursary");
      } else if (userRole === "Admin" || userRole === "Super Admin") {
        router.push("/admin");
      } else {
        router.push("/portal");
      }
    }
  }, [isClient, status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (!username.trim() || !password) {
      setErrorMsg("Please enter both your Student Registration Number and Password.");
      setLoading(false);
      return;
    }

    try {
      const res = await signIn("credentials", {
        redirect: false,
        username: username.trim(),
        password: password,
      });

      if (res?.error) {
        setErrorMsg(res.error);
        setLoading(false);
      } else {
        router.refresh();
        router.push("/portal");
      }
    } catch (err) {
      console.error("Login unexpected error:", err);
      setErrorMsg("An unexpected server error occurred. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
        {/* HERO BANNER - MATCHING ADMISSIONS/APPLY ELEGANT NAVY STYLING */}
        <section className="bg-brand-blue-dark text-white py-14 sm:py-16 relative overflow-hidden">
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-blue/40 via-slate-900 to-slate-950" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Official Student Portal Gateway • portal.crestoakcollege.com.ng
            </div>
            <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
              Student Portal Sign In
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
              Access your academic dashboard, course registration, semester results, and student services.
            </p>
          </div>
        </section>

        {/* MAIN CONTAINER */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
          
          {/* SUBDOMAIN GATEWAY SWITCHER STRIP */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xl shadow-slate-200/50 mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-blue" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Institutional Subdomain Gateways
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Each role has its designated domain portal
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {subdomainPortals.map((portal) => {
                const IconComp = portal.icon;
                if (portal.isCurrent) {
                  return (
                    <div
                      key={portal.id}
                      className="p-3 rounded-xl border-2 border-brand-blue bg-brand-blue/5 text-slate-900 shadow-sm relative flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="w-8 h-8 rounded-lg bg-brand-blue text-white flex items-center justify-center font-bold">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-brand-blue text-white">
                          Current Portal
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-brand-blue-dark">{portal.title}</h4>
                        <p className="text-[10px] font-mono text-brand-blue font-semibold truncate mt-0.5">
                          {portal.subdomain}
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <a
                    key={portal.id}
                    href={portal.url}
                    className="p-3 rounded-xl border border-slate-200 bg-white hover:border-brand-blue/40 hover:bg-slate-50 transition-all duration-200 group flex flex-col justify-between no-underline"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-brand-blue group-hover:text-white transition-colors flex items-center justify-center">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-blue transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 group-hover:text-brand-blue transition-colors">
                        {portal.title}
                      </h4>
                      <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5 group-hover:text-slate-600">
                        {portal.subdomain}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          {/* MAIN GLASSMORPHIC ELEGANT CARD */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-slate-200/80 overflow-hidden flex flex-col md:flex-row gap-8 sm:gap-10">
            
            {/* LEFT SIDE: BRANDING & GUIDANCE CARD */}
            <div className="w-full md:w-5/12 bg-gradient-to-br from-brand-blue-dark via-brand-blue to-slate-900 text-white p-6 sm:p-8 rounded-2xl flex flex-col justify-between border border-brand-blue/30 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 rounded-full bg-brand-gold/10 blur-2xl pointer-events-none" />
              
              <div className="relative z-10 space-y-6">
                <Logo showText={true} lightText={true} size={48} />

                <div>
                  <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-tight leading-snug">
                    Student Academic Gateway
                  </h2>
                  <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed font-normal">
                    Welcome to CrestOak College's official student environment. Manage your academic journey with security and speed.
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-white/10 text-xs">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-brand-gold block">
                    Student Services Available:
                  </span>
                  
                  <div className="flex items-center gap-2.5 text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Semester Course Registration</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Continuous Assessment & Exam Results</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Academic Transcripts & Statements</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Tuition Receipts & Bursary Clearances</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 256-bit SSL Encrypted
                </span>
                <span>CCHSMT Portal</span>
              </div>
            </div>

            {/* RIGHT SIDE: DEDICATED STUDENT LOGIN FORM */}
            <div className="w-full md:w-7/12 flex flex-col justify-center space-y-6">
              
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-bold mb-2">
                  <GraduationCap className="w-4 h-4" />
                  Student Portal Login Only
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-brand-blue-dark tracking-tight">
                  Sign In to Student Account
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  Enter your matriculation or registration number and password.
                </p>
              </div>

              {/* ERROR MESSAGE ALERT */}
              {errorMsg && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs sm:text-sm animate-in fade-in">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-brand-red" />
                  <span className="font-semibold">{errorMsg}</span>
                </div>
              )}

              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* REGISTRATION NUMBER INPUT */}
                <div>
                  <label
                    htmlFor="username"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
                  >
                    Matriculation / Student Reg. Number
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <User className="w-5 h-5" />
                    </span>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      placeholder="e.g., student1 or CCHSMT/2026/001"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                {/* PASSWORD INPUT */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label
                      htmlFor="password"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                    >
                      Portal Password
                    </label>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <Lock className="w-5 h-5" />
                    </span>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all text-sm font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-5 bg-gradient-to-r from-brand-blue to-brand-blue-dark hover:from-brand-blue-light hover:to-brand-blue text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 border border-brand-blue-light shadow-lg shadow-brand-blue/25 text-sm cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Authenticating Student Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Access Student Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* DEMO CREDENTIALS BOX */}
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-4 text-xs text-slate-700 space-y-1.5 shadow-sm">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  Testing & Demo Account:
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Enter username <code className="bg-white border border-amber-300 text-amber-900 font-mono font-bold px-1.5 py-0.5 rounded">student1</code> with password <code className="bg-white border border-amber-300 text-amber-900 font-mono font-bold px-1.5 py-0.5 rounded">password123</code>.
                </p>
              </div>

              {/* APPLICANT & HELP LINKS */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
                <span>Not registered yet?</span>
                <Link
                  href="/admissions/apply"
                  className="font-bold text-brand-blue hover:text-brand-blue-dark hover:underline flex items-center gap-1"
                >
                  Apply for Admission (2026/2027)
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50">
          <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

