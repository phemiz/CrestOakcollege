"use client";

import { useEffect } from "react";

export default function BursaryLoginPage() {
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

      const isBursar = roleUpper.includes("BURSAR") || roleUpper.includes("FINANCE") || roleUpper.includes("ADMIN") || roleUpper.includes("SUPER");

      if (auth && isBursar) {
        window.location.replace("/bursary/dashboard/");
      } else {
        window.location.replace("/login/?gateway=bursary");
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-700 font-bold text-sm">
      Redirecting to Bursary Gateway Login...
    </div>
  );
}
