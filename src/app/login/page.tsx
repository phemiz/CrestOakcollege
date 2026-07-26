"use client";

import React, { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Logo } from "@/components/ui/logo";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  GraduationCap,
  ShieldCheck,
  HelpCircle,
  Shield,
  CreditCard,
  Briefcase
} from "lucide-react";

type RoleType = "Student" | "Lecturer" | "Staff" | "Bursary" | "Admin" | "Super Admin";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);
  const [hostname, setHostname] = useState("");
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      setHostname(window.location.hostname.toLowerCase());
      setCurrentPath(window.location.pathname.toLowerCase());
    }
  }, []);

  const sessionResult = useSession();
  const session = sessionResult?.data;
  const status = sessionResult?.status || (isClient ? "unauthenticated" : "loading");

  // Domain & Gateway Context Detection
  const urlGateway = (searchParams.get("gateway") || searchParams.get("role") || "").toLowerCase();

  const isSuperAdminGateway =
    hostname.includes("superadmin") ||
    currentPath.includes("/superadmin") ||
    urlGateway === "superadmin";

  const isAdminGateway =
    hostname.includes("admin.") ||
    currentPath.includes("/admin") ||
    urlGateway === "admin";

  const isBursaryGateway =
    hostname.includes("pay.") ||
    hostname.includes("bursary.") ||
    currentPath.includes("/bursary") ||
    urlGateway === "bursary" ||
    urlGateway === "pay";

  const isStaffGateway =
    hostname.includes("staff.") ||
    currentPath.includes("/staff") ||
    urlGateway === "staff" ||
    urlGateway === "lecturer";

  // Strict Single-Role Access Configuration
  const gatewayConfig = (() => {
    if (isAdminGateway || isSuperAdminGateway) {
      return {
        role: (isSuperAdminGateway ? "Super Admin" : "Admin") as RoleType,
        title: "Administrative Control Panel",
        subtitle: "Authorized institutional administrative personnel only. Enter your Admin ID and password to proceed.",
        badge: "Official CrestOak Admin Gateway",
        usernameLabel: "Administrative Staff ID / Username",
        placeholder: "e.g., admin1",
        demoUser: isSuperAdminGateway ? "admin" : "admin1",
        demoPass: isSuperAdminGateway ? "Adm1nSecureP@ss123!" : "password123",
        redirectUrl: "/admin",
        icon: Shield,
        securityNotice: "Unauthorized access is strictly prohibited and monitored.",
        themeColor: "from-rose-950 via-slate-900 to-slate-950",
        badgeBg: "bg-rose-500/10 border-rose-500/30 text-rose-400",
        btnGradient: "from-rose-700 to-slate-900 hover:from-rose-600 hover:to-slate-800",
      };
    }

    if (isBursaryGateway) {
      return {
        role: "Bursary" as RoleType,
        title: "Bursary & Payments Portal",
        subtitle: "Enter your Bursary Staff ID and password to process tuition invoices, fee receipts, and clearances.",
        badge: "Official CrestOak Bursary Gateway",
        usernameLabel: "Bursary Staff ID / Username",
        placeholder: "e.g., bursary1",
        demoUser: "bursary1",
        demoPass: "password123",
        redirectUrl: "/bursary",
        icon: CreditCard,
        securityNotice: "Secured financial gateway with 256-bit encryption.",
        themeColor: "from-amber-950 via-slate-900 to-slate-950",
        badgeBg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
        btnGradient: "from-amber-700 to-slate-900 hover:from-amber-600 hover:to-slate-800",
      };
    }

    if (isStaffGateway) {
      return {
        role: "Staff" as RoleType,
        title: "Academic Staff Portal",
        subtitle: "Enter your Lecturer / Staff ID and password to access course management, grading, and department tools.",
        badge: "Official CrestOak Staff Gateway",
        usernameLabel: "Lecturer / Staff ID / Username",
        placeholder: "e.g., lecturer1 or staff1",
        demoUser: "lecturer1",
        demoPass: "password123",
        redirectUrl: "/staff",
        icon: Briefcase,
        securityNotice: "Internal academic portal for verified CrestOak staff.",
        themeColor: "from-purple-950 via-slate-900 to-slate-950",
        badgeBg: "bg-purple-500/10 border-purple-500/30 text-purple-400",
        btnGradient: "from-purple-700 to-slate-900 hover:from-purple-600 hover:to-slate-800",
      };
    }

    // Default: Dedicated Student Portal Access
    return {
      role: "Student" as RoleType,
      title: "Student Portal Access",
      subtitle: "Enter your Matric / Registration Number and Password to access your academic dashboard, course registration, and results.",
      badge: "Official CrestOak Student Portal Gateway",
      usernameLabel: "Matriculation / Student Reg. Number",
      placeholder: "e.g., student1 or CCHSMT/2026/001",
      demoUser: "student1",
      demoPass: "password123",
      redirectUrl: "/portal",
      icon: GraduationCap,
      securityNotice: "Official student gateway for CrestOak College (CCHSMT).",
      themeColor: "from-brand-blue-dark via-brand-blue to-slate-950",
      badgeBg: "bg-brand-gold/10 border-brand-gold/30 text-brand-gold",
      btnGradient: "from-brand-blue to-brand-blue-dark hover:from-brand-blue-light hover:to-brand-blue",
    };
  })();

  const [username, setUsername] = useState(gatewayConfig.demoUser);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync username default when gateway config loads
  useEffect(() => {
    if (gatewayConfig.demoUser) {
      setUsername(gatewayConfig.demoUser);
    }
  }, [gatewayConfig.demoUser]);

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
      setErrorMsg("Please enter your credentials.");
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
        router.push(gatewayConfig.redirectUrl);
      }
    } catch (err) {
      console.error("Login unexpected error:", err);
      setErrorMsg("An unexpected server error occurred. Please try again later.");
      setLoading(false);
    }
  };

  const GatewayIcon = gatewayConfig.icon;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24 flex flex-col justify-between">
        
        {/* TOP HERO BANNER */}
        <section className={`bg-gradient-to-br ${gatewayConfig.themeColor} text-white py-14 sm:py-16 relative overflow-hidden`}>
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-3">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-wider ${gatewayConfig.badgeBg}`}>
              <Sparkles className="w-3.5 h-3.5" />
              {gatewayConfig.badge}
            </div>
            <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
              {gatewayConfig.title}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
              {gatewayConfig.subtitle}
            </p>
          </div>
        </section>

        {/* RE-CENTERED ELEGANT SIGN-IN CONTAINER */}
        <div className="max-w-xl mx-auto px-4 sm:px-6 -mt-8 relative z-20 w-full">
          
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-slate-200/80 space-y-6">
            
            {/* BRANDING HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <Logo showText={true} lightText={false} size={42} />
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                <GatewayIcon className="w-4 h-4 text-brand-blue" />
                <span>{gatewayConfig.role}</span>
              </div>
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
              
              {/* USERNAME / REG NO INPUT */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
                >
                  {gatewayConfig.usernameLabel}
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
                    placeholder={gatewayConfig.placeholder}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all text-sm font-medium"
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
                    className="w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all text-sm font-medium"
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
                className={`w-full py-3.5 px-5 bg-gradient-to-r ${gatewayConfig.btnGradient} text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 border border-white/10 shadow-lg text-sm cursor-pointer`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to {gatewayConfig.role} Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* DEMO CREDENTIALS BOX */}
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-4 text-xs text-slate-700 space-y-1.5 shadow-sm">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                Demo Credentials:
              </div>
              <p className="text-slate-600 leading-relaxed">
                Username: <code className="bg-white border border-amber-300 text-amber-900 font-mono font-bold px-1.5 py-0.5 rounded">{gatewayConfig.demoUser}</code> | Password: <code className="bg-white border border-amber-300 text-amber-900 font-mono font-bold px-1.5 py-0.5 rounded">{gatewayConfig.demoPass}</code>
              </p>
            </div>

            {/* SECURITY ASSURANCE & HELPDESK FOOTER */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
              <span className="flex items-center gap-1.5 text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                {gatewayConfig.securityNotice}
              </span>
              {gatewayConfig.role === "Student" ? (
                <Link
                  href="/admissions/apply"
                  className="font-bold text-brand-blue hover:text-brand-blue-dark hover:underline flex items-center gap-1 shrink-0"
                >
                  Apply for Admission
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <span className="font-mono text-[11px] text-slate-400">Argon2id & SSL Encrypted</span>
              )}
            </div>

          </div>
        </div>

        <div className="py-6" />
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

