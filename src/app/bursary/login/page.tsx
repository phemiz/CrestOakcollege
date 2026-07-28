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

      const isBursary = roleUpper.includes("BURSARY") || roleUpper.includes("ADMIN") || roleUpper.includes("SUPER");

      if (auth && isBursary) {
        if (!window.location.pathname.startsWith("/bursary")) {
          window.location.replace("/bursary/");
        }
      } else {
        window.location.replace("/login/?gateway=bursary");
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-300 font-bold text-sm">
      Redirecting to Bursary & Payment Gateway Login...
    </div>
  );
}
