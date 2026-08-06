"use client";

import React, { useState, useEffect } from "react";
import AdmissionsClient from "@/components/admin/AdmissionsClient";
import { Loader2 } from "lucide-react";

export default function AdmissionsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/admissions.php")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.applications)) {
          setApplications(data.applications);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return <AdmissionsClient applications={applications} />;
}
