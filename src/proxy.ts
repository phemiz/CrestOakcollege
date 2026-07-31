import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const url = req.nextUrl.clone();
    const path = url.pathname;
    const host = req.headers.get("host") || "";
    const role = (token?.role as string) || "";

    // Subdomain Host Rewrites Logic
    if (host.startsWith("admin.")) {
      if (!path.startsWith("/admin")) {
        url.pathname = `/admin${path}`;
        return NextResponse.rewrite(url);
      }
    } else if (host.startsWith("staff.")) {
      if (!path.startsWith("/staff")) {
        url.pathname = `/staff${path}`;
        return NextResponse.rewrite(url);
      }
    } else if (host.startsWith("admissions.")) {
      if (!path.startsWith("/admissions")) {
        url.pathname = `/admissions${path}`;
        return NextResponse.rewrite(url);
      }
    } else if (host.startsWith("portal.")) {
      if (!path.startsWith("/portal") && !path.startsWith("/student")) {
        url.pathname = `/portal${path}`;
        return NextResponse.rewrite(url);
      }
    } else if (host.startsWith("pay.")) {
      if (!path.startsWith("/bursary") && !path.startsWith("/pay")) {
        url.pathname = `/bursary${path}`;
        return NextResponse.rewrite(url);
      }
    } else if (host.startsWith("register.")) {
      if (!path.startsWith("/admissions/register") && !path.startsWith("/register")) {
        url.pathname = `/admissions/register${path}`;
        return NextResponse.rewrite(url);
      }
    }

    // Role-Based Access Control Checks
    if (path.startsWith("/admin")) {
      if (role !== "Admin" && role !== "Super Admin" && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/login?error=AccessDenied", req.url));
      }
    }

    if (path.startsWith("/portal")) {
      if (role !== "Student" && role !== "STUDENT") {
        return NextResponse.redirect(new URL("/login?error=AccessDenied", req.url));
      }
    }

    if (path.startsWith("/bursary")) {
      if (
        role !== "Bursary" &&
        role !== "BURSAR" &&
        role !== "Admin" &&
        role !== "Super Admin" &&
        role !== "ADMIN"
      ) {
        return NextResponse.redirect(new URL("/login?error=AccessDenied", req.url));
      }
    }

    if (path.startsWith("/staff")) {
      if (
        role !== "Lecturer" &&
        role !== "LECTURER" &&
        role !== "Staff" &&
        role !== "STAFF" &&
        role !== "HOD" &&
        role !== "DEAN" &&
        role !== "REGISTRAR" &&
        role !== "Admin" &&
        role !== "Super Admin" &&
        role !== "ADMIN"
      ) {
        return NextResponse.redirect(new URL("/login?error=AccessDenied", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/portal/:path*",
    "/bursary/:path*",
    "/staff/:path*",
  ],
};
