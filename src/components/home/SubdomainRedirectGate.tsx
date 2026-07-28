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

    // 1. ADMIN / SUPERADMIN SUBDOMAIN GATEWAY
    if (hostname.startsWith("admin.") || hostname.startsWith("superadmin.") || hostname.includes("admin.")) {
      if (!isAuthenticated || !isAdminRole) {
        if (pathname === "/" || pathname === "/login" || pathname === "/login/") {
          const params = new URLSearchParams(window.location.search);
          if (params.get("gateway") !== "admin") {
            window.location.replace("/login/?gateway=admin");
          }
        } else if (!pathname.startsWith("/admin")) {
          window.location.replace("/login/?gateway=admin");
        }
      } else {
        // Authenticated Admin visiting root "/" or "/login" -> send to /admin/dashboard/
        if (pathname === "/" || pathname === "/login" || pathname === "/login/") {
          window.location.replace("/admin/dashboard/");
        }
      }
      return;
    }

    // 2. BURSARY / PAY SUBDOMAIN GATEWAY
    if (hostname.startsWith("pay.") || hostname.startsWith("bursary.") || hostname.includes("bursary.") || hostname.includes("pay.")) {
      if (!isAuthenticated || !isBursaryRole) {
        if (pathname === "/" || pathname === "/login" || pathname === "/login/") {
          const params = new URLSearchParams(window.location.search);
          if (params.get("gateway") !== "bursary") {
            window.location.replace("/login/?gateway=bursary");
          }
        } else if (!pathname.startsWith("/bursary")) {
          window.location.replace("/login/?gateway=bursary");
        }
      } else {
        // Authenticated Bursar visiting root "/" or "/login" -> send to /bursary/
        if (pathname === "/" || pathname === "/login" || pathname === "/login/") {
          window.location.replace("/bursary/");
        }
      }
      return;
    }

    // 3. STAFF SUBDOMAIN GATEWAY
    if (hostname.startsWith("staff.") || hostname.includes("staff.")) {
      if (!isAuthenticated || !isStaffRole) {
        if (pathname === "/" || pathname === "/login" || pathname === "/login/") {
          const params = new URLSearchParams(window.location.search);
          if (params.get("gateway") !== "staff") {
            window.location.replace("/login/?gateway=staff");
          }
        } else if (!pathname.startsWith("/staff")) {
          window.location.replace("/login/?gateway=staff");
        }
      } else {
        // Authenticated Staff visiting root "/" or "/login" -> send to /staff/
        if (pathname === "/" || pathname === "/login" || pathname === "/login/") {
          window.location.replace("/staff/");
        }
      }
      return;
    }

    // 4. STUDENT PORTAL SUBDOMAIN GATEWAY
    if (hostname.startsWith("portal.") || hostname.includes("portal.")) {
      if (!isAuthenticated || !isStudentRole) {
        if (pathname === "/" || pathname === "/login" || pathname === "/login/") {
          const params = new URLSearchParams(window.location.search);
          if (params.get("gateway") !== "portal") {
            window.location.replace("/login/?gateway=portal");
          }
        } else if (!pathname.startsWith("/portal")) {
          window.location.replace("/login/?gateway=portal");
        }
      } else {
        // Authenticated Student visiting root "/" or "/login" -> send to /portal/
        if (pathname === "/" || pathname === "/login" || pathname === "/login/") {
          window.location.replace("/portal/");
        }
      }
      return;
    }
  }, [pathname, router]);

  return null;
}

export default SubdomainRedirectGate;
