"use client";

import { useEffect } from "react";

export default function SuperAdminLoginPage() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user") || localStorage.getItem("cchsmt_user_session");
      const auth = localStorage.getItem("isAuthenticated") === "true";

      let roleUpper = "";
      if (user) {
        try {
          const u = JSON.parse(user);
          roleUpper = (u.role || "").toString().trim().toUpperCase();
        } catch (e) {}
      }

      const isSuperAdmin = roleUpper.includes("SUPER");

      if (auth && isSuperAdmin) {
        window.location.replace("/admin/dashboard/");
      } else {
        window.location.replace("/login/?gateway=superadmin");
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-700 font-bold text-sm">
      Redirecting to Super Admin Gateway Login...
    </div>
  );
}
