"use client";

import React, { useState, useEffect } from "react";
import StaffClient from "@/components/admin/StaffClient";
import { Loader2 } from "lucide-react";

export default function StaffPage() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/admin/staff.php', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('sessionToken') || ''}`,
        'X-CSRF-Token': localStorage.getItem('csrfToken') || ''
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        const records = Array.isArray(data) 
          ? data 
          : Array.isArray(data?.staff) 
          ? data.staff 
          : Array.isArray(data?.staffList) 
          ? data.staffList 
          : [];
        setStaffList(records);
        if (data?.departments && Array.isArray(data.departments)) {
          setDepartments(data.departments);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading staff roster:', err);
        if (isMounted) {
          setStaffList([]);
          setLoading(false);
        }
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
          <span>Loading staff registry...</span>
        </div>
      </div>
    );
  }

  return <StaffClient staffList={staffList} departments={departments} />;
}
