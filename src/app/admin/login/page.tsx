"use client";

import { useEffect } from "react";

export default function AdminLoginPage() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user") || localStorage.getItem("cchsmt_user_session");
      const auth = localStorage.getItem("isAuthenticated");

      if (user || auth === "true") {
        if (!window.location.pathname.startsWith("/admin/dashboard")) {
          window.location.replace("/admin/dashboard/");
        }
      } else {
        window.location.replace("/login/?gateway=admin");
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-300 font-bold text-sm">
      Redirecting to CrestOak Administrative Gateway...
    </div>
  );
}
