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
  Briefcase,
  CreditCard,
  Shield,
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

type RoleType = "Student" | "Lecturer" | "Staff" | "Bursary" | "Admin" | "Super Admin";

interface RoleOption {
  id: RoleType;
  title: string;
  subdomain: string;
  description: string;
  icon: React.ComponentType<any>;
  colorClass: string;
  bgGlow: string;
  redirectUrl: string;
  demoUser: string;
}

const roleOptions: RoleOption[] = [
  {
    id: "Student",
    title: "Student",
    subdomain: "portal.crestoakcollege.com.ng",
    description: "Course registration, semester results & academic dashboard",
    icon: GraduationCap,
    colorClass: "text-blue-600 border-blue-500/40 bg-blue-50/80 hover:bg-blue-100/50",
    bgGlow: "shadow-[0_0_15px_rgba(59,130,246,0.15)] ring-2 ring-blue-500/30",
    redirectUrl: "/portal",
    demoUser: "student1",
  },
  {
    id: "Lecturer",
    title: "Lecturer",
    subdomain: "staff.crestoakcollege.com.ng",
    description: "Manage courses, grades & student submissions",
    icon: User,
    colorClass: "text-emerald-600 border-emerald-500/40 bg-emerald-50/80 hover:bg-emerald-100/50",
    bgGlow: "shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-2 ring-emerald-500/30",
    redirectUrl: "/staff",
    demoUser: "lecturer1",
  },
  {
    id: "Staff",
    title: "Staff",
    subdomain: "staff.crestoakcollege.com.ng",
    description: "Registry administration, staff tools & institutional reports",
    icon: Briefcase,
    colorClass: "text-purple-600 border-purple-500/40 bg-purple-50/80 hover:bg-purple-100/50",
    bgGlow: "shadow-[0_0_15px_rgba(168,85,247,0.15)] ring-2 ring-purple-500/30",
    redirectUrl: "/staff",
    demoUser: "staff1",
  },
  {
    id: "Bursary",
    title: "Bursary",
    subdomain: "pay.crestoakcollege.com.ng",
    description: "Tuition invoices, fee receipts & payment validation",
    icon: CreditCard,
    colorClass: "text-amber-600 border-amber-500/40 bg-amber-50/80 hover:bg-amber-100/50",
    bgGlow: "shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-2 ring-amber-500/30",
    redirectUrl: "/bursary",
    demoUser: "bursary1",
  },
  {
    id: "Admin",
    title: "Admin",
    subdomain: "admin.crestoakcollege.com.ng",
    description: "Oversee college operations, user accounts & settings",
    icon: Shield,
    colorClass: "text-rose-600 border-rose-500/40 bg-rose-50/80 hover:bg-rose-100/50",
    bgGlow: "shadow-[0_0_15px_rgba(244,63,94,0.15)] ring-2 ring-rose-500/30",
    redirectUrl: "/admin",
    demoUser: "admin1",
  },
  {
    id: "Super Admin",
    title: "Super Admin",
    subdomain: "admin.crestoakcollege.com.ng",
    description: "Full system control, security policy & database governance",
    icon: Lock,
    colorClass: "text-red-700 border-red-500/40 bg-red-50/80 hover:bg-red-100/50",
    bgGlow: "shadow-[0_0_15px_rgba(220,38,38,0.15)] ring-2 ring-red-500/30",
    redirectUrl: "/admin",
    demoUser: "admin",
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

  const [selectedRole, setSelectedRole] = useState<RoleType>("Student");
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
      setErrorMsg("Access Denied: You do not have permission to access that page with your current role.");
    } else if (errorType === "CredentialsSignin") {
      setErrorMsg("Invalid Username / Registration Number or Password.");
    } else if (errorType) {
      setErrorMsg("An authentication error occurred. Please check your credentials and try again.");
    }
  }, [isClient, searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isClient && status === "authenticated" && session?.user) {
      const userRole = session.user.role as RoleType;
      redirectBasedOnRole(userRole);
    }
  }, [isClient, status, session]);

  const redirectBasedOnRole = (role: RoleType) => {
    switch (role) {
      case "Student":
        router.push("/portal");
        break;
      case "Lecturer":
      case "Staff":
        router.push("/staff");
        break;
      case "Bursary":
        router.push("/bursary");
        break;
      case "Admin":
      case "Super Admin":
        router.push("/admin");
        break;
      default:
        router.push("/portal");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (!username.trim() || !password) {
      setErrorMsg("Please enter both your Username / Registration Number and Password.");
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
        const activeOption = roleOptions.find((r) => r.id === selectedRole);
        if (activeOption) {
          router.push(activeOption.redirectUrl);
        } else {
          router.push("/portal");
        }
      }
    } catch (err) {
      console.error("Login unexpected error:", err);
      setErrorMsg("An unexpected server error occurred. Please try again later.");
      setLoading(false);
    }
  };

  const currentRoleConfig = roleOptions.find((r) => r.id === selectedRole) || roleOptions[0];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
        {/* HERO BANNER */}
        <section className="bg-brand-blue-dark text-white py-14 sm:py-16 relative overflow-hidden">
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-blue/40 via-slate-900 to-slate-950" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Unified CrestOak Institutional Gateway
            </div>
            <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
              Portal Sign In
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
              Select your institutional role to log in to your designated subdomain gateway.
            </p>
          </div>
        </section>

        {/* MAIN CONTAINER */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
          
          {/* SUBDOMAIN GATEWAY INDICATOR BANNER */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xl shadow-slate-200/50 mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-blue" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Subdomain Gateways Overview
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Official CrestOak College Domains
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {[
                { name: "Student Gateway", host: "portal.crestoakcollege.com.ng", role: "Student", badge: "bg-blue-600" },
                { name: "Staff Gateway", host: "staff.crestoakcollege.com.ng", role: "Lecturer / Staff", badge: "bg-purple-600" },
                { name: "Bursary Gateway", host: "pay.crestoakcollege.com.ng", role: "Bursary", badge: "bg-amber-600" },
                { name: "Admin Gateway", host: "admin.crestoakcollege.com.ng", role: "Admin", badge: "bg-rose-600" },
                { name: "Admissions Portal", host: "admissions.crestoakcollege.com.ng", role: "Applicants", badge: "bg-emerald-600" },
              ].map((gateway) => (
                <div key={gateway.name} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col justify-between">
                  <span className={`text-[9px] font-extrabold uppercase text-white px-2 py-0.5 rounded-full ${gateway.badge} w-max`}>
                    {gateway.role}
                  </span>
                  <div className="mt-1.5">
                    <h5 className="text-[11px] font-bold text-slate-800">{gateway.name}</h5>
                    <p className="text-[9px] font-mono text-slate-400 truncate">{gateway.host}</p>
                  </div>
                </div>
              ))}
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
                    {currentRoleConfig.title} Gateway
                  </h2>
                  <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed font-normal">
                    {currentRoleConfig.description}
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-white/10 text-xs">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-brand-gold block">
                    Gateway Features:
                  </span>
                  
                  <div className="flex items-center gap-2.5 text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Role-Based Access Control (RBAC)</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Subdomain Security Isolation</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Argon2id Encrypted Password Vault</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>256-bit TLS Session Security</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Secure Gateway
                </span>
                <span className="font-mono">{currentRoleConfig.subdomain}</span>
              </div>
            </div>

            {/* RIGHT SIDE: ROLE SELECTION & LOGIN FORM */}
            <div className="w-full md:w-7/12 flex flex-col justify-center space-y-6">
              
              <div>
                <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-brand-blue-dark tracking-tight">
                  Sign In
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  Select your institutional role and enter your credentials.
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
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. ROLE SELECTION GRID */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Select Your Role Gateway
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {roleOptions.map((role) => {
                      const IconComponent = role.icon;
                      const isSelected = selectedRole === role.id;
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => {
                            setSelectedRole(role.id);
                            setErrorMsg(null);
                            if (role.id === "Student" && !username) setUsername("student1");
                            else if (role.id === "Lecturer" && !username) setUsername("lecturer1");
                            else if (role.id === "Staff" && !username) setUsername("staff1");
                            else if (role.id === "Bursary" && !username) setUsername("bursary1");
                            else if (role.id === "Admin" && !username) setUsername("admin1");
                            else if (role.id === "Super Admin" && !username) setUsername("admin");
                          }}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-200 group cursor-pointer ${
                            isSelected
                              ? `${role.colorClass} ${role.bgGlow} scale-[1.02]`
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-600"
                          }`}
                        >
                          <IconComponent
                            className={`w-5 h-5 mb-1.5 transition-transform duration-200 ${
                              isSelected ? "scale-110" : "text-slate-400 group-hover:text-slate-600"
                            }`}
                          />
                          <span className="text-xs font-bold">{role.title}</span>
                          <span className="text-[9px] font-mono text-slate-400 truncate max-w-full mt-0.5">
                            {role.subdomain.split('.')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. CREDENTIALS INPUTS */}
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
                    >
                      {selectedRole === "Student"
                        ? "Matriculation / Student Reg. Number"
                        : "Staff ID / Username / Email"}
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
                        placeholder={
                          selectedRole === "Student"
                            ? "e.g., student1 or STU-2026-001"
                            : `e.g., ${currentRoleConfig.demoUser}`
                        }
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label
                        htmlFor="password"
                        className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                      >
                        Password
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
                      <span>Authenticating {selectedRole}...</span>
                    </>
                  ) : (
                    <>
                      <span>Access {selectedRole} Gateway</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* DEMO CREDENTIALS BOX */}
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-4 text-xs text-slate-700 space-y-1.5 shadow-sm">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  Test Credentials for {selectedRole}:
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Username: <code className="bg-white border border-amber-300 text-amber-900 font-mono font-bold px-1.5 py-0.5 rounded">{currentRoleConfig.demoUser}</code> | Password: <code className="bg-white border border-amber-300 text-amber-900 font-mono font-bold px-1.5 py-0.5 rounded">{selectedRole === "Super Admin" ? "Adm1nSecureP@ss123!" : "password123"}</code>
                </p>
              </div>

              {/* APPLICANT & HELP LINKS */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
                <span>Prospective student?</span>
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

