import React from "react";
import PortalLayoutClient from "@/components/admissions/PortalLayoutClient";

export const dynamic = "force-static";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const applicantUser = {
    name: "Applicant User",
    email: "applicant@crestoakcollege.com.ng",
    role: "APPLICANT"
  };

  return (
    <PortalLayoutClient user={applicantUser} hasAdmissionLetter={true}>
      {children}
    </PortalLayoutClient>
  );
}
