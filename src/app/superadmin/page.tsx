"use client";

import { useEffect } from "react";

export default function SuperAdminPage() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.href = "/admin/";
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-300 font-bold text-sm">
      Redirecting to CrestOak Super Admin Console...
    </div>
  );
}
