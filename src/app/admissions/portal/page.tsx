import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import ApplicantDashboardClient from "@/components/admissions/ApplicantDashboardClient";

export const revalidate = 0; // Fresh details always

export default async function PortalDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) return null; // Handled by layout redirect

  const [application, notificationLogs] = await Promise.all([
    db.application.findFirst({
      where: {
        applicantId: session.user.id,
        isDeleted: false
      },
      include: {
        programme: {
          select: {
            name: true,
            code: true,
            degreeAwarded: true
          }
        },
        screening: {
          select: {
            screeningDate: true,
            venue: true,
            status: true,
            notes: true
          }
        },
        admission: {
          select: {
            status: true,
            admittedAt: true
          }
        }
      }
    }),
    db.notificationLog.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: "desc"
      }
    })
  ]);

  // Convert schema types to dashboard client interface props
  const mappedApp = application ? {
    id: application.id,
    applicationNo: application.applicationNo,
    status: application.status,
    paymentStatus: application.paymentStatus,
    programme: application.programme,
    screening: application.screening ? {
      screeningDate: application.screening.screeningDate,
      venue: application.screening.venue,
      status: application.screening.status,
      notes: application.screening.notes
    } : null,
    admission: application.admission ? {
      status: application.admission.status,
      admittedAt: application.admission.admittedAt
    } : null
  } : null;

  return (
    <ApplicantDashboardClient
      application={mappedApp}
      notificationLogs={notificationLogs}
    />
  );
}
