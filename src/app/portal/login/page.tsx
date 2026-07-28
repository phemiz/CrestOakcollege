"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PortalLoginPage() {
  const router = useRouter();

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

      const isStudent = roleUpper.includes("STUDENT") || (!roleUpper && auth);

      if (auth && isStudent) {
        if (!window.location.pathname.startsWith("/portal")) {
          window.location.replace("/portal/");
        }
      } else {
        window.location.replace("/login/?gateway=portal");
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-slate-500 font-bold text-sm">Redirecting to Student Portal Login Gateway...</div>
    </div>
  );
}
