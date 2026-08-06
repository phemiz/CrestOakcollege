"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function SubdomainRedirectGate() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hostname = window.location.hostname.toLowerCase();

    // Retrieve logged-in user credentials and role from localStorage
    const userStr = localStorage.getItem("user") || localStorage.getItem("cchsmt_user_session");
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

    let roleUpper = "";
    if (userStr && isAuthenticated) {
      try {
        const u = JSON.parse(userStr);
        roleUpper = (u.role || "").toString().trim().toUpperCase();
      } catch (e) {}
    }

    const isAdminRole = roleUpper.includes("ADMIN") || roleUpper.includes("SUPER");
    const isBursaryRole = roleUpper.includes("BURSARY") || isAdminRole;
    const isStaffRole = roleUpper.includes("STAFF") || roleUpper.includes("LECTURER") || isAdminRole;
    const isStudentRole = roleUpper.includes("STUDENT") || (!roleUpper && isAuthenticated);

    const isLoginPage = pathname.includes("/login");

    // 1. ADMIN / SUPERADMIN SUBDOMAIN GATEWAY
    if (hostname.startsWith("admin.") || hostname.startsWith("superadmin.") || hostname.includes("admin.")) {
      if (!isAuthenticated || !isAdminRole) {
        if (!isLoginPage && !pathname.startsWith("/admin")) {
          router.replace("/admin/login/");
        }
      } else {
        if (pathname === "/" || isLoginPage) {
          router.replace("/admin/dashboard/");
        }
      }
      return;
    }

    // 2. BURSARY / PAY SUBDOMAIN GATEWAY
    if (hostname.startsWith("pay.") || hostname.startsWith("bursary.") || hostname.includes("bursary.") || hostname.includes("pay.")) {
      if (!isAuthenticated || !isBursaryRole) {
        if (!isLoginPage && !pathname.startsWith("/bursary")) {
          router.replace("/bursary/login/");
        }
      } else {
        if (pathname === "/" || isLoginPage) {
          router.replace("/bursary/dashboard/");
        }
      }
      return;
    }

    // 3. STAFF SUBDOMAIN GATEWAY
    if (hostname.startsWith("staff.") || hostname.includes("staff.")) {
      if (!isAuthenticated || !isStaffRole) {
        if (!isLoginPage && !pathname.startsWith("/staff")) {
          router.replace("/staff/login/");
        }
      } else {
        if (pathname === "/" || isLoginPage) {
          router.replace("/staff/dashboard/");
        }
      }
      return;
    }

    // 4. STUDENT PORTAL SUBDOMAIN GATEWAY
    if (hostname.startsWith("portal.") || hostname.includes("portal.")) {
      if (!isAuthenticated || !isStudentRole) {
        if (!isLoginPage && !pathname.startsWith("/portal")) {
          router.replace("/portal/login/");
        }
      } else {
        if (pathname === "/" || isLoginPage) {
          router.replace("/portal/dashboard/");
        }
      }
      return;
    }
  }, [pathname, router]);

  return null;
}

export default SubdomainRedirectGate;
