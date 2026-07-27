"use client";

import { useEffect } from "react";

export default function StaffLoginPage() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.href = "/login/?gateway=staff";
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-300 font-bold text-sm">
      Redirecting to Academic Staff Gateway Login...
    </div>
  );
}
