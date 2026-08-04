import React from "react";
import ClientPortalShell from "@/components/portal/ClientPortalShell";

export const dynamic = "force-static";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const defaultUser = {
    id: "student-portal-user",
    fullName: "Student User",
    matricNo: "CCHMS/2026/SCS/0001",
    email: "student1@crestoakcollege.com.ng",
    department: "Community Health",
    programme: "Community Health Extension (CHEW)",
    avatarUrl: null,
  };

  return (
    <ClientPortalShell 
      user={defaultUser} 
      announcements={[]}
    >
      {children}
    </ClientPortalShell>
  );
}
