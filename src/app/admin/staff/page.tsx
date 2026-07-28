"use client";

import React, { useState, useEffect } from "react";
import StaffClient from "@/components/admin/StaffClient";
import { Loader2 } from "lucide-react";

export default function StaffPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
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

    fetch("/api/admin/staff.php")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (Array.isArray(data.staffList)) setStaffList(data.staffList);
          if (Array.isArray(data.departments)) setDepartments(data.departments);
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

  return <StaffClient staffList={staffList} departments={departments} />;
}
