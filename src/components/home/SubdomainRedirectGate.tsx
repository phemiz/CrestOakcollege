"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function SubdomainRedirectGate() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check master keychain: if user or isAuthenticated === 'true' exists, do not trigger redirect
    const user = localStorage.getItem("user") || localStorage.getItem("cchsmt_user_session");
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (user || isAuthenticated) {
      return;
    }

    const hostname = window.location.hostname.toLowerCase();

    // 1. Never redirect if user is already inside an active page or dashboard
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/portal") ||
      pathname.startsWith("/bursary") ||
      pathname.startsWith("/admissions")
    ) {
      return;
    }

    // 2. Admin Domain: Route unauthenticated root visits strictly to /login/?gateway=admin
    if (hostname.startsWith("admin.") || hostname.startsWith("superadmin.")) {
      if (pathname === "/" || pathname === "/login" || pathname === "/login/") {
        const params = new URLSearchParams(window.location.search);
        if (params.get("gateway") !== "admin") {
          router.replace("/login/?gateway=admin");
        }
      }
      return;
    }

    // 3. Bursary/Pay Domain: Route unauthenticated root visits strictly to /login/?gateway=bursary
    if (hostname.startsWith("pay.") || hostname.startsWith("bursary.")) {
      if (pathname === "/" || pathname === "/login" || pathname === "/login/") {
        const params = new URLSearchParams(window.location.search);
        if (params.get("gateway") !== "bursary") {
          router.replace("/login/?gateway=bursary");
        }
      }
      return;
    }

    // 4. Student Portal Domain
    if (hostname.startsWith("portal.")) {
      if (pathname === "/") {
        router.replace("/login/");
      }
      return;
    }
  }, [pathname, router]);

  return null;
}

export default SubdomainRedirectGate;
