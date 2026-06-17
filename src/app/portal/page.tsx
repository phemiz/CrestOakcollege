import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

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

export default async function StudentPortal() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "Student") {
    redirect("/login");
  }

  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[100vh] bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-red border-r-2" />
      </div>
    }>
      <PortalDashboard initialUser={session.user} />
    </Suspense>
  );
}
