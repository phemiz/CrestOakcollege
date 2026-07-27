import { redirect } from "next/navigation";
import { getSafeSession } from "@/lib/session";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = {
    name: "System Admin",
    email: "admin@crestoakcollege.com.ng",
    role: "Admin"
  };

  try {
    const session = await getSafeSession();
    if (session?.user) {
      user = {
        name: session.user.name || "System Admin",
        email: session.user.email || "admin@crestoakcollege.com.ng",
        role: session.user.role || "Admin"
      };
    }
  } catch (e) {
    // Static export / offline DB fallback
  }

  return (
    <AdminLayoutClient user={user}>
      {children}
    </AdminLayoutClient>
  );
}
