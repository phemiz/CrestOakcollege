"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const { isAuthorized, isChecking } = useRequireAuth({
    allowedRoles: ["STAFF", "LECTURER", "HOD", "DEAN", "REGISTRAR"],
    gateway: "staff",
  });

  if (isChecking || !isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-xl max-w-sm w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 text-white flex items-center justify-center mx-auto">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-slate-900 text-base">Verifying Staff Portal</h3>
            <p className="text-slate-500 text-xs mt-1">Redirecting to Staff Portal Login...</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
