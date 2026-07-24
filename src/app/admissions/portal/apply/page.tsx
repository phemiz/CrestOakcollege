import React from "react";
import { getSafeSession } from "@/lib/session";
import db from "@/lib/db";
import ApplicantWizardClient from "@/components/admissions/ApplicantWizardClient";

export const dynamic = "force-static";

export default async function PortalApplyPage() {
  const session = await getSafeSession();

  if (!session) return null; // Handled by layout redirect

  const [programmes, draftApp] = await Promise.all([
    db.programme.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        name: true,
        code: true,
        degreeAwarded: true,
      },
      orderBy: { name: "asc" },
    }),
    db.application.findFirst({
      where: {
        applicantId: session.user.id,
        status: "DRAFT",
        isDeleted: false,
      },
      include: {
        documents: {
          select: {
            documentName: true,
            documentUrl: true,
          },
        },
      },
    }),
  ]);

  return (
    <ApplicantWizardClient
      programmes={programmes}
      draftApplication={draftApp}
    />
  );
}
