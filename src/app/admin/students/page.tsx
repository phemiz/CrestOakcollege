"use client";

import React, { useState, useEffect } from "react";
import StudentsClient from "@/components/admin/StudentsClient";
import { Loader2 } from "lucide-react";

export default function StudentsPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [programmes, setProgrammes] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    if (typeof window !== "undefined") {
      const isAuth = localStorage.getItem("isAuthenticated");
      const userStr = localStorage.getItem("user") || localStorage.getItem("cchsmt_user_session");
      let roleUpper = "";
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          roleUpper = (u.role || "").toUpperCase();
        } catch (e) {}
      }
      const isAdmin = roleUpper.includes("ADMIN") || roleUpper.includes("SUPER");
      if (!isAuth || isAuth !== "true" || !isAdmin) {
        window.location.replace("/login/?gateway=admin");
        return;
      }
      setIsAuthorized(true);
    }

    fetch('/api/admin/students.php')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (Array.isArray(data)) {
          setStudents(data);
        } else if (data?.students && Array.isArray(data.students)) {
          setStudents(data.students);
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

  if (!isAuthorized || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-slate-600 font-medium text-sm">
          <Loader2 className="h-5 w-5 animate-spin text-brand-red" />
          <span>Verifying administrative authorization and loading student roster...</span>
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
