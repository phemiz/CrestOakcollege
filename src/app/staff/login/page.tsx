"use client";

import { useEffect } from "react";

export default function StaffLoginPage() {
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

      const isStaff = roleUpper.includes("STAFF") || roleUpper.includes("LECTURER") || roleUpper.includes("ADMIN") || roleUpper.includes("SUPER");

      if (auth && isStaff) {
        if (!window.location.pathname.startsWith("/staff")) {
          window.location.replace("/staff/");
        }
      } else {
        window.location.replace("/login/?gateway=staff");
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-300 font-bold text-sm">
      Redirecting to Academic Staff Gateway Login...
    </div>
  );
}
