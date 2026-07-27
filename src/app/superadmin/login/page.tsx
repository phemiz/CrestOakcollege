"use client";

import { useEffect } from "react";

export default function SuperAdminLoginPage() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.href = "/login/?gateway=superadmin";
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-300 font-bold text-sm">
      Redirecting to CrestOak Super Admin Control Gateway...
    </div>
  );
}
