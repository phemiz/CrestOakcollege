"use client";

import React, { useState, useEffect } from "react";
import StudentsClient from "@/components/admin/StudentsClient";
import { Loader2 } from "lucide-react";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [programmes, setProgrammes] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    fetch('/api/admin/students.php')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        const list = Array.isArray(data)
          ? data
          : (data?.students || data?.data || data?.records || data?.items || data?.list || []);
        if (Array.isArray(list)) {
          setStudents(list);
        }
        if (data?.departments && Array.isArray(data.departments)) setDepartments(data.departments);
        if (data?.programmes && Array.isArray(data.programmes)) setProgrammes(data.programmes);
        if (data?.sessions && Array.isArray(data.sessions)) setSessions(data.sessions);
        if (data?.semesters && Array.isArray(data.semesters)) setSemesters(data.semesters);
        if (data?.auditLogs && Array.isArray(data.auditLogs)) setAuditLogs(data.auditLogs);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load students roster from API:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-slate-600 font-medium text-sm">
          <Loader2 className="h-5 w-5 animate-spin text-brand-red" />
          <span>Loading student roster...</span>
        </div>
      </div>
    );
  }

  return (
    <StudentsClient
      students={students}
      departments={departments}
      programmes={programmes}
      sessions={sessions}
      semesters={semesters}
      auditLogs={auditLogs}
    />
  );
}
