import React from "react";
import ApplicantDashboardClient from "@/components/admissions/ApplicantDashboardClient";

export const dynamic = "force-static";

export default function PortalDashboardPage() {
  const application = {
    id: "app-1",
    applicationNo: "APP-2026-0001",
    status: "APPROVED" as const,
    paymentStatus: "PAID" as const,
    programme: {
      name: "Computer Science & Health Informatics",
      code: "CSC",
      degreeAwarded: "ND / HND"
    },
    screening: {
      screeningDate: new Date("2026-08-15T09:00:00Z"),
      venue: "Main Auditorium, CrestOak College",
      status: "PASSED" as const,
      notes: "Screening completed successfully."
    },
    admission: {
      status: "ADMITTED" as const,
      admittedAt: new Date("2026-07-01T10:00:00Z")
    }
  };

  return (
    <ApplicantDashboardClient
      application={application}
      notificationLogs={[]}
    />
  );
}
