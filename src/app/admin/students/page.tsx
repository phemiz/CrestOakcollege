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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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

    fetch("/api/admin/students.php")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (Array.isArray(data.students)) setStudents(data.students);
          if (Array.isArray(data.departments)) setDepartments(data.departments);
          if (Array.isArray(data.programmes)) setProgrammes(data.programmes);
          if (Array.isArray(data.sessions)) setSessions(data.sessions);
          if (Array.isArray(data.semesters)) setSemesters(data.semesters);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-slate-600 font-medium text-sm">
          <Loader2 className="h-5 w-5 animate-spin text-brand-red" />
          <span>Verifying administrative authorization...</span>
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
    />
  );
}
