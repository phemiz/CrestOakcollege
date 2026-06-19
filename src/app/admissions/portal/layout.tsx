import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import PortalLayoutClient from "@/components/admissions/PortalLayoutClient";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Ensure role is APPLICANT (case-insensitive checks)
  const userRole = session.user.role || "";
  if (userRole.toUpperCase() !== "APPLICANT") {
    redirect("/login?error=AccessDenied");
  }

  // Check if they have an approved application to unlock the admission letter link
  const approvedApp = await db.application.findFirst({
    where: {
      applicantId: session.user.id,
      status: "APPROVED",
      isDeleted: false
    }
  });

  const hasAdmissionLetter = !!approvedApp;

  return (
    <PortalLayoutClient user={session.user} hasAdmissionLetter={hasAdmissionLetter}>
      {children}
    </PortalLayoutClient>
  );
}
