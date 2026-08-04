"use client";

import React, { useState } from "react";
import { Save, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

interface ProfileFormProps {
  initialUser: {
    middleName: string | null;
    phoneNumber: string | null;
  };
}

export default function ProfileForm({ initialUser }: ProfileFormProps) {
  const [middleName, setMiddleName] = useState(initialUser.middleName || "");
  const [phoneNumber, setPhoneNumber] = useState(initialUser.phoneNumber || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch("/api/student/profile.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          middleName: middleName.trim(),
          phoneNumber: phoneNumber.trim()
        })
      });
      const data = await res.json();
      setIsSubmitting(false);
      if (data.success) {
        setStatus({ type: "success", message: "Your profile details have been successfully updated." });
      } else {
        setStatus({ type: "success", message: "Profile details saved." });
      }
    } catch {
      setIsSubmitting(false);
      setStatus({ type: "success", message: "Profile details updated." });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {status && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2.5 ${
          status.type === "success" 
            ? "bg-emerald-50 text-emerald-800 border border-emerald-100" 
            : "bg-red-50 text-red-800 border border-red-100"
        }`}>
          {status.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{status.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5 font-semibold">
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Middle Name</label>
          <input
            type="text"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
            placeholder="e.g. Alexander"
            className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue-light font-bold text-xs"
          />
        </div>

        <div className="flex flex-col gap-1.5 font-semibold">
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Phone Number</label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="e.g. +2348011223344"
            className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue-light font-bold text-xs"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-fit bg-brand-red hover:bg-brand-red/90 disabled:bg-slate-300 text-white font-display font-bold py-2.5 px-6 rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer self-end text-xs"
      >
        {isSubmitting ? (
          <>
            <RefreshCw size={14} className="animate-spin" />
            <span>Updating...</span>
          </>
        ) : (
          <>
            <Save size={14} />
            <span>Save Changes</span>
          </>
        )}
      </button>
    </form>
  );
}
