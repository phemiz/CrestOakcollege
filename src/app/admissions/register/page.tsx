"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { registerApplicantUser } from "@/app/actions/admissions-actions";
import {
  User,
  Mail,
  Phone,
  Lock,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate fields
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.password) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      const res = await registerApplicantUser({
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        middleName: formData.middleName.trim() || undefined,
        phoneNumber: formData.phone.trim() || undefined
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setErrorMsg(res.error || "Failed to create account.");
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-12 relative overflow-hidden font-sans text-slate-200">
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-red-600/10 blur-[120px] pointer-events-none" />

      {/* Back Button */}
      <Link
        href="/admissions"
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 no-underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Admissions Main
      </Link>

      <div className="w-full max-w-2xl backdrop-blur-xl bg-slate-900/60 border border-slate-800 shadow-2xl rounded-[32px] overflow-hidden p-8 md:p-10 relative z-10 space-y-8">
        
        {/* Branding header */}
        <div className="flex flex-col items-center text-center">
          <Logo showText={true} lightText={true} size={45} className="mb-4" />
          <h2 className="text-xl md:text-2xl font-display font-black text-white uppercase tracking-wider">
            Applicant Portal Account Signup
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Register your credentials to start your 2026/2027 academic session application.
          </p>
        </div>

        {success ? (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">Account Created Successfully!</h3>
            <p className="text-slate-400 text-xs max-w-sm">
              Your applicant account is now active. Redirecting you to the secure login gateway to begin your dashboard profile...
            </p>
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-emerald-500 border-r-2 mt-4" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 text-xs font-semibold text-slate-400">
            
            {/* Error banner */}
            {errorMsg && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-200 p-4 rounded-xl text-sm transition-all">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">First Name *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First Name"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Last Name *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Surname"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Middle Name (Optional)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                    placeholder="Middle Name"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Phone Number *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="tel"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 08155884804"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email Address *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. applicant@gmail.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Password *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Confirm Password *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Retype password"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-xl font-semibold hover:from-indigo-500 hover:to-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 border border-indigo-500/20 shadow-lg cursor-pointer text-xs mt-4"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  <span>Registering account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-4 text-slate-500 text-[11px]">
              Already have an applicant account?{" "}
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-bold no-underline">
                Sign In here
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
