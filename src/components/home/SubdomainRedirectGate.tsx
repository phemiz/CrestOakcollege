"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function SubdomainRedirectGate() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hostname = window.location.hostname.toLowerCase();

    // DO NOT REDIRECT if already inside an active route or dashboard path
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/portal") ||
      pathname.startsWith("/bursary") ||
      pathname.startsWith("/staff") ||
      pathname.startsWith("/admissions")
    ) {
      return;
    }

    const hasSession = !!(
      localStorage.getItem("cchsmt_auth_session") ||
      localStorage.getItem("cchsmt_user_session")
    );

    // 1. Admissions Subdomain
    if (hostname.startsWith("admissions.")) {
      if (pathname === "/" || pathname === "/login" || pathname === "/login/") {
        router.replace("/admissions/");
      }
      return;
    }

    // 2. Super Admin / Admin Subdomain
    if (hostname.startsWith("admin.") || hostname.startsWith("superadmin.")) {
      if (pathname === "/" || pathname === "/login" || pathname === "/login/") {
        if (hasSession) {
          router.replace("/admin/");
        } else if (pathname === "/") {
          const gatewayParam = hostname.startsWith("superadmin.") ? "superadmin" : "admin";
          router.replace(`/login/?gateway=${gatewayParam}`);
        }
      }
      return;
    }

    // 3. Bursary / Payment Subdomain
    if (hostname.startsWith("pay.") || hostname.startsWith("bursary.")) {
      if (pathname === "/" || pathname === "/login" || pathname === "/login/") {
        if (hasSession) {
          router.replace("/bursary/");
        } else if (pathname === "/") {
          router.replace("/login/?gateway=bursary");
        }
      }
      return;
    }

    // 4. Staff Subdomain
    if (hostname.startsWith("staff.")) {
      if (pathname === "/" || pathname === "/login" || pathname === "/login/") {
        if (hasSession) {
          router.replace("/staff/");
        } else if (pathname === "/") {
          router.replace("/login/?gateway=staff");
        }
      }
      return;
    }

    // 5. Student Portal Subdomain
    if (hostname.startsWith("portal.")) {
      if (pathname === "/" || pathname === "/login" || pathname === "/login/") {
        if (hasSession) {
          router.replace("/portal/");
        } else if (pathname === "/") {
          router.replace("/login/?gateway=portal");
        }
      }
      return;
    }
  }, [pathname, router]);

  return null;
}
