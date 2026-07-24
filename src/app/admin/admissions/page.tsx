import React from "react";
import db from "@/lib/db";
import AdmissionsClient from "@/components/admin/AdmissionsClient";

export const revalidate = 0; // Fresh applications always

export default async function AdmissionsPage() {
  const applications = await db.application.findMany({
    where: {
      isDeleted: false,
    },
    include: {
      applicant: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
        },
      },
      programme: {
        select: {
          name: true,
          code: true,
        },
      },
      documents: {
        select: {
          id: true,
          documentName: true,
          documentUrl: true,
        },
      },
      screening: {
        select: {
          screeningDate: true,
          venue: true,
          status: true,
          notes: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const mappedApps = applications.map((app: any) => ({
    id: app.id,
    applicationNo: app.applicationNo,
    status: app.status,
    paymentStatus: app.paymentStatus,
    createdAt: app.createdAt,
    applicant: app.applicant,
    programme: app.programme,
    documents: app.documents,
    screening: app.screening ? {
      screeningDate: app.screening.screeningDate,
      venue: app.screening.venue,
      status: app.screening.status,
      notes: app.screening.notes
    } : null,
  }));

  return <AdmissionsClient applications={mappedApps} />;
}
