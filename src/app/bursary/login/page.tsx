"use client";

import { useEffect } from "react";

export default function BursaryLoginPage() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.href = "/login/?gateway=bursary";
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-300 font-bold text-sm">
      Redirecting to Bursary & Payment Gateway Login...
    </div>
  );
}
