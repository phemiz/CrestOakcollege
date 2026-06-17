import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // RBAC Authorization rules:
    // 1. Admin & Super Admin can access /admin
    if (path.startsWith("/admin")) {
      if (token?.role !== "Admin" && token?.role !== "Super Admin") {
        return NextResponse.redirect(new URL("/login?error=AccessDenied", req.url));
      }
    }

    // 2. Student can access /portal
    if (path.startsWith("/portal")) {
      if (token?.role !== "Student") {
        return NextResponse.redirect(new URL("/login?error=AccessDenied", req.url));
      }
    }

    // 3. Bursary, Admin, Super Admin can access /bursary
    if (path.startsWith("/bursary")) {
      if (
        token?.role !== "Bursary" &&
        token?.role !== "Admin" &&
        token?.role !== "Super Admin"
      ) {
        return NextResponse.redirect(new URL("/login?error=AccessDenied", req.url));
      }
    }

    // 4. Lecturer, Staff, Admin, Super Admin can access /staff
    if (path.startsWith("/staff")) {
      if (
        token?.role !== "Lecturer" &&
        token?.role !== "Staff" &&
        token?.role !== "Admin" &&
        token?.role !== "Super Admin"
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
