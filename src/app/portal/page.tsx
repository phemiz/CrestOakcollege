import React, { Suspense } from "react";
import dynamic from "next/dynamic";

const PortalDashboard = dynamic(
  () => import("@/components/portal/PortalDashboard"),
  {
    loading: () => (
      <div className="flex justify-center items-center min-h-[100vh] bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-red border-r-2" />
      </div>
    ),
  }
);

export default function StudentPortal() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[100vh] bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-red border-r-2" />
      </div>
    }>
      <PortalDashboard />
    </Suspense>
  );
}
