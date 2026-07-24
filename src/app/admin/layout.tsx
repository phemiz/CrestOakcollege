import { redirect } from "next/navigation";
import { getSafeSession } from "@/lib/session";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSafeSession();

  if (!session) {
    redirect("/login");
  }

  // Allowed admin panel roles
  const allowedRoles = ["Super Admin", "Admin", "Bursary", "Staff"];
  if (!allowedRoles.includes(session.user.role)) {
    redirect("/login?error=Unauthorized");
  }

  return (
    <AdminLayoutClient user={session.user}>
      {children}
    </AdminLayoutClient>
  );
}
