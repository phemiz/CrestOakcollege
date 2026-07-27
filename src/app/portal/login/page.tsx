"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PortalLoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.href = "/login/?gateway=portal";
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-slate-500 font-bold text-sm">Redirecting to Student Portal Login Gateway...</div>
    </div>
  );
}
