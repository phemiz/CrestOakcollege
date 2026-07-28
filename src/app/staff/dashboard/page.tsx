"use client";

import React, { useEffect, useState } from "react";
import StaffDashboard from "../page";
import { Loader2 } from "lucide-react";

export default function StaffDashboardAliasPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuth = localStorage.getItem("isAuthenticated");
      if (!isAuth || isAuth !== "true") {
        window.location.replace("/login/?gateway=staff");
      } else {
        setIsAuthorized(true);
      }
    }
  }, []);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-slate-400 font-medium text-sm">
          <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
          <span>Verifying staff portal credentials...</span>
        </div>
      </div>
    );
  }

  return <StaffDashboard />;
}
