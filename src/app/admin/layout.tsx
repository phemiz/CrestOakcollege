import React from "react";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

export const dynamic = "force-static";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminUser = {
    name: "System Admin",
    email: "admin@crestoakcollege.com.ng",
    role: "Admin"
  };

  return (
    <AdminLayoutClient user={adminUser}>
      {children}
    </AdminLayoutClient>
  );
}
