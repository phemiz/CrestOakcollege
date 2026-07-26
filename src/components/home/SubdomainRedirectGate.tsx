"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function SubdomainRedirectGate() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hostname = window.location.hostname.toLowerCase();

    // 1. Admissions Subdomain -> Redirect to /admissions/
    if (hostname.startsWith("admissions.")) {
      router.replace("/admissions/");
      return;
    }

    // 2. Student Portal Subdomain -> Redirect to /login/
    if (hostname.startsWith("portal.")) {
      router.replace("/login/");
      return;
    }

    // 3. Staff Subdomain -> Redirect to /login/?gateway=staff
    if (hostname.startsWith("staff.")) {
      router.replace("/login/?gateway=staff");
      return;
    }

    // 4. Bursary / Payment Gateway -> Redirect to /login/?gateway=bursary
    if (hostname.startsWith("pay.")) {
      router.replace("/login/?gateway=bursary");
      return;
    }

    // 5. Admin / Super Admin Subdomains -> Redirect to /login/?gateway=admin
    if (hostname.startsWith("admin.") || hostname.startsWith("superadmin.")) {
      router.replace("/login/?gateway=admin");
      return;
    }
  }, [router]);

  return null;
}

