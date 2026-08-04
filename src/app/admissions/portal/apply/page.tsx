import React from "react";
import ApplicantWizardClient from "@/components/admissions/ApplicantWizardClient";

export const dynamic = "force-static";

export default function PortalApplyPage() {
  const programmes = [
    { id: "prog-1", name: "Community Health Extension (CHEW)", code: "CHEW", degreeAwarded: "Diploma in Community Health" },
    { id: "prog-2", name: "Nursing Sciences", code: "NUR", degreeAwarded: "Registered Nurse (RN)" },
    { id: "prog-3", name: "Medical Laboratory Technician", code: "MLT", degreeAwarded: "Diploma in Medical Lab Tech" },
    { id: "prog-4", name: "Computer Science & Health Informatics", code: "CSC", degreeAwarded: "ND / HND Computer Science" },
    { id: "prog-5", name: "Pharmacy Technician", code: "PHT", degreeAwarded: "Diploma in Pharmacy Tech" }
  ];

  return (
    <ApplicantWizardClient
      programmes={programmes}
      draftApplication={null}
    />
  );
}
