"use client";

import React, { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
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
  ArrowLeft
} from "lucide-react";

type RoleType = "Student" | "Lecturer" | "Staff" | "Bursary" | "Admin" | "Super Admin";

interface RoleOption {
  id: RoleType;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  colorClass: string;
  bgGlow: string;
}

const roleOptions: RoleOption[] = [
  {
    id: "Student",
    title: "Student",
    description: "Access your dashboard, lectures & results",
    icon: BookOpen,
    colorClass: "text-blue-500 border-blue-500/30 bg-blue-500/5",
    bgGlow: "shadow-[0_0_15px_rgba(59,130,246,0.15)]",
  },
  {
    id: "Lecturer",
    title: "Lecturer",
    description: "Manage courses, grades & student submissions",
    icon: User,
    colorClass: "text-emerald-500 border-emerald-500/30 bg-emerald-500/5",
    bgGlow: "shadow-[0_0_15px_rgba(16,185,129,0.15)]",
  },
  {
    id: "Staff",
    title: "Staff",
    description: "Manage administration, registry & reports",
    icon: Briefcase,
    colorClass: "text-purple-500 border-purple-500/30 bg-purple-500/5",
    bgGlow: "shadow-[0_0_15px_rgba(168,85,247,0.15)]",
  },
  {
    id: "Bursary",
    title: "Bursary",
    description: "Process payments, invoices & fee status",
    icon: CreditCard,
    colorClass: "text-amber-500 border-amber-500/30 bg-amber-500/5",
    bgGlow: "shadow-[0_0_15px_rgba(245,158,11,0.15)]",
  },
  {
    id: "Admin",
    title: "Admin",
    description: "Oversee operations, users & settings",
    icon: Shield,
    colorClass: "text-rose-500 border-rose-500/30 bg-rose-500/5",
    bgGlow: "shadow-[0_0_15px_rgba(244,63,94,0.15)]",
  },
  {
    id: "Super Admin",
    title: "Super Admin",
    description: "Full system control & security settings",
    icon: Lock,
    colorClass: "text-red-600 border-red-600/30 bg-red-600/5",
    bgGlow: "shadow-[0_0_15px_rgba(220,38,38,0.15)]",
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
      setErrorMsg("Access Denied: You do not have permissions to access that page. Please log in with the correct role.");
    } else if (errorType === "CredentialsSignin") {
      setErrorMsg("Invalid username or password.");
    } else if (errorType) {
      setErrorMsg("An authentication error occurred. Please try again.");
    }
  }, [isClient, searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isClient && status === "authenticated" && session?.user) {
      const userRole = session.user.role;
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
        router.push("/");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (!username.trim() || !password) {
      setErrorMsg("Please fill in all fields.");
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
        // Success. The useEffect hook above will catch the authenticated status and handle redirection.
        // But let's also trigger a programmatic router push just in case.
        router.refresh();
      }
    } catch (err) {
      console.error("Login unexpected error:", err);
      setErrorMsg("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-12 relative overflow-hidden font-sans">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-red-600/10 blur-[120px] pointer-events-none" />

      {/* Back to Home Button */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </button>

      {/* Main Glassmorphic Container */}
      <div className="w-full max-w-4xl backdrop-blur-xl bg-slate-900/60 border border-slate-800 shadow-2xl rounded-[32px] overflow-hidden flex flex-col md:flex-row relative z-10">
        
        {/* Left Side: Branding Banner (Visible on Desktop) */}
        <div className="w-full md:w-5/12 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
          <div>
            <Logo showText={true} lightText={true} size={50} className="mb-8" />
            <h2 className="text-2xl font-bold font-display text-white mt-12 leading-tight tracking-wide">
              Secure Enterprise Portal
            </h2>
            <p className="text-slate-400 text-sm mt-4 leading-relaxed">
              Welcome to the CrestOak College academic & administration gateway. Please select your role to proceed.
            </p>
          </div>
          
          <div className="mt-8 text-xs text-slate-500 border-t border-slate-800/60 pt-4">
            &copy; {new Date().getFullYear()} CrestOak College. All rights reserved. Secured by Argon2id & TLS.
          </div>
        </div>

        {/* Right Side: Login Panel */}
        <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Sign In</h1>
            <p className="text-slate-400 text-sm mt-2">Select your portal role and enter credentials.</p>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-200 p-4 rounded-xl text-sm transition-all duration-300">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Role Selection Grid */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-300 group cursor-pointer ${
                        isSelected
                          ? `${role.colorClass} border-current ${role.bgGlow} scale-[1.03]`
                          : "border-slate-800 bg-slate-950/20 hover:border-slate-700 hover:bg-slate-900/50"
                      }`}
                    >
                      <IconComponent
                        className={`w-6 h-6 mb-2 transition-transform duration-300 ${
                          isSelected ? "scale-110" : "text-slate-500 group-hover:text-slate-300"
                        }`}
                      />
                      <span
                        className={`text-xs font-bold transition-colors ${
                          isSelected ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                        }`}
                      >
                        {role.title}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500 italic mt-1.5">
                {roleOptions.find((r) => r.id === selectedRole)?.description}
              </p>
            </div>

            {/* 2. Credentials Form Fields */}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2"
                >
                  {selectedRole === "Student" ? "Registration Number" : "Username / Email"}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <User className="w-5 h-5" />
                  </span>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    placeholder={
                      selectedRole === "Student"
                        ? "e.g., student1"
                        : "e.g., lecturer1, admin1"
                    }
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-400"
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
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
                    className="w-full pl-11 pr-11 py-3 bg-slate-950/40 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-xl font-semibold hover:from-indigo-500 hover:to-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 border border-indigo-500/20 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Access Portal</span>
              )}
            </button>
          </form>

          {/* Test Credentials Helper Panel */}
          <div className="mt-8 border-t border-slate-800/80 pt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              For evaluation/testing
            </h4>
            <div className="bg-slate-950/30 border border-slate-800/60 p-3 rounded-lg text-[11px] text-slate-400 leading-relaxed">
              <span className="font-semibold text-indigo-400">Demo Account:</span> Enter username <code className="text-white bg-slate-850 px-1 py-0.5 rounded">student1</code> or <code className="text-white bg-slate-850 px-1 py-0.5 rounded">lecturer1</code> or <code className="text-white bg-slate-850 px-1 py-0.5 rounded">admin1</code> with password <code className="text-white bg-slate-850 px-1 py-0.5 rounded">password123</code>.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500 border-r-2" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
