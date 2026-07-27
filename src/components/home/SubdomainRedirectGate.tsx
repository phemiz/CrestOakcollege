"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function SubdomainRedirectGate() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hostname = window.location.hostname.toLowerCase();

    // ----------------------------------------------------
    // 1. ADMIN DOMAIN (admin.crestoakcollege.com.ng)
    // ----------------------------------------------------
    if (hostname.startsWith("admin.") || hostname.startsWith("superadmin.")) {
      const targetGateway = hostname.startsWith("superadmin.") ? "superadmin" : "admin";

      // If user is accessing /login without expected gateway parameter, fix it
      if (pathname.startsWith("/login")) {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("gateway") !== targetGateway) {
          router.replace(`/login/?gateway=${targetGateway}`);
          return;
        }
      }
      // If on root '/', send to admin login gateway (or /admin/ if session exists)
      if (pathname === "/") {
        const session = localStorage.getItem("cchsmt_auth_session") || localStorage.getItem("cchsmt_user_session");
        if (session) {
          router.replace("/admin/");
          return;
        }
        router.replace(`/login/?gateway=${targetGateway}`);
        return;
      }
    }

    // ----------------------------------------------------
    // 2. PAY / BURSARY DOMAIN (pay.crestoakcollege.com.ng)
    // ----------------------------------------------------
    if (hostname.startsWith("pay.") || hostname.startsWith("bursary.")) {
      // Unauthenticated visits to /login or root MUST stay on Bursary Login
      if (pathname === "/" || pathname === "/login" || pathname === "/login/") {
        const session = localStorage.getItem("cchsmt_auth_session") || localStorage.getItem("cchsmt_user_session");
        if (session && pathname === "/") {
          router.replace("/bursary/");
          return;
        }
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("gateway") !== "bursary") {
          router.replace("/login/?gateway=bursary");
          return;
        }
      }
    }

    // ----------------------------------------------------
    // 3. STUDENT PORTAL DOMAIN (portal.crestoakcollege.com.ng)
    // ----------------------------------------------------
    if (hostname.startsWith("portal.")) {
      if (pathname === "/") {
        const session = localStorage.getItem("cchsmt_auth_session") || localStorage.getItem("cchsmt_user_session");
        if (session) {
          router.replace("/portal/");
          return;
        }
        router.replace("/login/?gateway=portal");
        return;
      }
    }
  }, [pathname, router]);

  return null;
}
