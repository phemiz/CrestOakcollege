"use client";

import React, { useState, useEffect } from "react";
import FeesClient from "@/components/admin/FeesClient";
import { Loader2 } from "lucide-react";

export default function FeesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/fees.php")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (Array.isArray(data.invoices)) setInvoices(data.invoices);
          if (Array.isArray(data.students)) setStudents(data.students);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return <FeesClient invoices={invoices} students={students} />;
}
