"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSession } from "@/components/providers/session-provider";
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
    hostname.startsWith("superadmin.") ||
    hostname.includes("superadmin") ||
    currentPath.includes("/superadmin") ||
    urlGateway === "superadmin";

  const isAdminGateway =
    !isSuperAdminGateway && (
      hostname.startsWith("admin.") ||
      hostname.includes("admin.") ||
      currentPath.includes("/admin") ||
      urlGateway === "admin"
    );

  const isBursaryGateway =
    hostname.startsWith("pay.") ||
    hostname.startsWith("bursary.") ||
    hostname.includes("pay.") ||
    hostname.includes("bursary.") ||
    currentPath.includes("/bursary") ||
    urlGateway === "bursary" ||
    urlGateway === "pay";

  const isStaffGateway =
    hostname.startsWith("staff.") ||
    hostname.includes("staff.") ||
    currentPath.includes("/staff") ||
    urlGateway === "staff" ||
    urlGateway === "lecturer";

  // Strict Single-Role Access Configuration
  const gatewayConfig = (() => {
    if (isSuperAdminGateway) {
      return {
        role: "Super Admin" as RoleType,
        title: "Super Admin Control Center",
        subtitle: "Master administrative authorization. Enter Super Admin credentials to access global institutional controls.",
        badge: "Official CrestOak Super Admin Gateway",
        usernameLabel: "Super Admin Username / ID",
        placeholder: "e.g., admin or superadmin",
        redirectUrl: "/admin/dashboard/",
        icon: Shield,
        securityNotice: "Strictly restricted to authorized Super Admin personnel.",
        themeColor: "from-red-950 via-slate-950 to-slate-900",
        badgeBg: "bg-red-500/10 border-red-500/30 text-red-400",
        btnGradient: "from-red-700 to-slate-900 hover:from-red-600 hover:to-slate-800",
      };
    }

    if (isAdminGateway) {
      return {
        role: "Admin" as RoleType,
        title: "Administrative Control Panel",
        subtitle: "Authorized institutional administrative personnel only. Enter your Admin ID and password to proceed.",
        badge: "Official CrestOak Admin Gateway",
        usernameLabel: "Administrative Staff ID / Username",
        placeholder: "e.g., admin1",
        redirectUrl: "/admin/dashboard/",
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
        redirectUrl: "/bursary/dashboard/",
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
        redirectUrl: "/staff/dashboard/",
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
      placeholder: "e.g., student1 or CCHMS/2026/SCS/0001",
      redirectUrl: "/portal/dashboard/",
      icon: GraduationCap,
      securityNotice: "Official student gateway for CrestOak College (CCHSMT).",
      themeColor: "from-brand-blue-dark via-brand-blue to-slate-950",
      badgeBg: "bg-brand-gold/10 border-brand-gold/30 text-brand-gold",
      btnGradient: "from-brand-blue to-brand-blue-dark hover:from-brand-blue-light hover:to-brand-blue",
    };
  })();

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

  // Redirect if already authenticated WITH A ROLE MATCHING THIS GATEWAY
  useEffect(() => {
    if (!isClient) return;

    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user") || localStorage.getItem("cchsmt_user_session");
      const auth = localStorage.getItem("isAuthenticated");

      if (user && auth === "true") {
        let storedRole = "Student";
        try {
          const parsed = JSON.parse(user);
          if (parsed.role) {
            storedRole = String(parsed.role).trim();
          }
        } catch (e) {}

        const roleUpper = storedRole.toUpperCase();
        const targetRoleUpper = gatewayConfig.role.toUpperCase();

        const isMatch =
          (targetRoleUpper.includes("ADMIN") && roleUpper.includes("ADMIN")) ||
          (targetRoleUpper.includes("BURSARY") && (roleUpper.includes("BURSARY") || roleUpper.includes("ADMIN"))) ||
          (targetRoleUpper.includes("STAFF") && (roleUpper.includes("STAFF") || roleUpper.includes("LECTURER") || roleUpper.includes("ADMIN"))) ||
          (targetRoleUpper.includes("STUDENT") && roleUpper.includes("STUDENT"));

        if (isMatch) {
          redirectBasedOnRole(storedRole);
          return;
        }
      }
    }

    if (status === "authenticated" && session?.user) {
      const storedRole = String(session.user.role || "Student");
      const roleUpper = storedRole.toUpperCase();
      const targetRoleUpper = gatewayConfig.role.toUpperCase();

      const isMatch =
        (targetRoleUpper.includes("ADMIN") && roleUpper.includes("ADMIN")) ||
        (targetRoleUpper.includes("BURSARY") && (roleUpper.includes("BURSARY") || roleUpper.includes("ADMIN"))) ||
        (targetRoleUpper.includes("STAFF") && (roleUpper.includes("STAFF") || roleUpper.includes("LECTURER") || roleUpper.includes("ADMIN"))) ||
        (targetRoleUpper.includes("STUDENT") && roleUpper.includes("STUDENT"));

      if (isMatch) {
        redirectBasedOnRole(storedRole);
      }
    }
  }, [isClient, status, session, gatewayConfig.role]);

  const redirectBasedOnRole = (role: string) => {
    const rUpper = role.toUpperCase();
    if (rUpper.includes("ADMIN") || rUpper.includes("SUPER")) {
      if (!window.location.pathname.startsWith("/admin")) {
        window.location.replace("/admin/dashboard/");
      }
    } else if (rUpper.includes("BURSARY")) {
      if (!window.location.pathname.startsWith("/bursary")) {
        window.location.replace("/bursary/dashboard/");
      }
    } else if (rUpper.includes("STAFF") || rUpper.includes("LECTURER")) {
      if (!window.location.pathname.startsWith("/staff")) {
        window.location.replace("/staff/dashboard/");
      }
    } else {
      if (!window.location.pathname.startsWith("/portal")) {
        window.location.replace("/portal/dashboard/");
      }
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
      const currentHost = typeof window !== "undefined" ? window.location.hostname.toLowerCase() : "";
      const searchGateway = (searchParams.get("gateway") || searchParams.get("role") || "").toLowerCase();

      let roleContext = "student";
      if (currentHost.startsWith("superadmin.") || searchGateway === "superadmin" || currentHost.includes("superadmin")) {
        roleContext = "superadmin";
      } else if (currentHost.startsWith("admin.") || searchGateway === "admin" || currentHost.includes("admin")) {
        roleContext = "admin";
      } else if (currentHost.startsWith("pay.") || currentHost.startsWith("bursary.") || searchGateway === "bursary" || searchGateway === "pay") {
        roleContext = "bursary";
      } else if (currentHost.startsWith("staff.") || searchGateway === "staff" || searchGateway === "lecturer") {
        roleContext = "staff";
      }

      const cleanInput = username.trim().replace(/\\/g, '');

      const response = await fetch(`/api/login.php?gateway=${encodeURIComponent(roleContext)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username: cleanInput,
          matricNo: cleanInput,
          staffId: cleanInput,
          staffNo: cleanInput,
          password,
          role: roleContext,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("isAuthenticated", "true");
          localStorage.setItem("userRole", data.user.role || roleContext);
          localStorage.setItem("cchsmt_user_session", JSON.stringify(data.user));
          localStorage.setItem("crestoak_session", JSON.stringify(data.user));
        }

        const targetUrl = data.redirectUrl || data.redirect || gatewayConfig.redirectUrl || "/portal/dashboard";
        window.location.href = targetUrl;
      } else {
        setErrorMsg(data.message || "Invalid portal credentials.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const GatewayIcon = gatewayConfig.icon;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24 flex flex-col justify-between">
        
        {/* TOP HERO BANNER */}
        <section className={`bg-gradient-to-br ${gatewayConfig.themeColor} text-white py-12 sm:py-16 md:py-20 relative overflow-hidden`}>
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-3 sm:space-y-4">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs sm:text-sm font-bold uppercase tracking-wider ${gatewayConfig.badgeBg}`}>
              <Sparkles className="w-4 h-4" />
              {gatewayConfig.badge}
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-display font-extrabold text-white tracking-tight leading-tight">
              {gatewayConfig.title}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed font-medium">
              {gatewayConfig.subtitle}
            </p>
          </div>
        </section>

        {/* RE-CENTERED ELEGANT SIGN-IN CONTAINER */}
        <div className="max-w-md sm:max-w-xl mx-auto px-4 sm:px-6 -mt-6 sm:-mt-10 relative z-20 w-full">
          
          <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-2xl shadow-slate-200/80 space-y-6 sm:space-y-7">
            
            {/* BRANDING HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <Logo showText={true} lightText={false} size={44} />
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-800 text-xs sm:text-sm font-extrabold shadow-sm">
                <GatewayIcon className="w-4.5 h-4.5 text-brand-blue" />
                <span>{gatewayConfig.role}</span>
              </div>
            </div>

            {/* ERROR MESSAGE ALERT */}
            {errorMsg && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs sm:text-sm md:text-base animate-in fade-in">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-brand-red" />
                <span className="font-semibold">{errorMsg}</span>
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              
              {/* USERNAME / REG NO INPUT */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 mb-2"
                >
                  {gatewayConfig.usernameLabel}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center text-slate-400">
                    <User className="w-5 h-5 sm:w-6 sm:h-6" />
                  </span>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    placeholder={gatewayConfig.placeholder}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-11 sm:pl-12 pr-4 sm:pr-5 py-3.5 sm:py-4 bg-slate-50 border border-slate-300 rounded-xl sm:rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all text-base sm:text-lg font-medium"
                  />
                </div>
              </div>

              {/* PASSWORD INPUT */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label
                    htmlFor="password"
                    className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800"
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center text-slate-400">
                    <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 sm:pl-12 pr-11 sm:pr-12 py-3.5 sm:py-4 bg-slate-50 border border-slate-300 rounded-xl sm:rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all text-base sm:text-lg font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 sm:pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Eye className="w-5 h-5 sm:w-6 sm:h-6" />}
                  </button>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 sm:py-4.5 px-6 bg-gradient-to-r ${gatewayConfig.btnGradient} text-white rounded-xl sm:rounded-2xl font-extrabold transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2.5 border border-white/10 shadow-xl text-base sm:text-lg cursor-pointer`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to {gatewayConfig.role} Portal</span>
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </>
                )}
              </button>
            </form>

            {/* SECURITY ASSURANCE & HELPDESK FOOTER */}
            <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-slate-600 gap-3 text-center sm:text-left">
              <span className="flex items-center gap-2 font-semibold text-slate-700">
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                {gatewayConfig.securityNotice}
              </span>
              {gatewayConfig.role === "Student" ? (
                <Link
                  href="/admissions/apply"
                  className="font-extrabold text-brand-blue hover:text-brand-blue-dark hover:underline flex items-center gap-1.5 shrink-0 text-sm sm:text-base"
                >
                  Apply for Admission
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <span className="font-mono text-xs sm:text-sm text-slate-400">Argon2id & SSL Encrypted</span>
              )}
            </div>

          </div>
        </div>

        <div className="py-6 sm:py-8" />
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
