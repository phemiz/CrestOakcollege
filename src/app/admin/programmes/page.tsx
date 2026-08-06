"use client";

import React, { useState, useEffect } from "react";
import ProgrammesClient from "@/components/admin/ProgrammesClient";
import { Loader2 } from "lucide-react";

export default function ProgrammesPage() {
  const [programmes, setProgrammes] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/programmes.php")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (Array.isArray(data.programmes)) setProgrammes(data.programmes);
          if (Array.isArray(data.departments)) setDepartments(data.departments);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return <ProgrammesClient programmes={programmes} departments={departments} />;
}
