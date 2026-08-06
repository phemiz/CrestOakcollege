"use client";

import React, { useState, useEffect } from "react";
import FacultiesClient from "@/components/admin/FacultiesClient";
import { Loader2 } from "lucide-react";

export default function FacultiesPage() {
  const [faculties, setFaculties] = useState<any[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/faculties.php")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (Array.isArray(data.faculties)) setFaculties(data.faculties);
          if (Array.isArray(data.lecturers)) setLecturers(data.lecturers);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return <FacultiesClient faculties={faculties} lecturers={lecturers} />;
}
