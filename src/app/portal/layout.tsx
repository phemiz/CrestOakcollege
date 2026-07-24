import React from "react";
import { getSafeSession } from "@/lib/session";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import ClientPortalShell from "@/components/portal/ClientPortalShell";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getSafeSession();

  if (!session || session.user.role !== "Student") {
    redirect("/login");
  }

  // Fetch student details to get dynamic database values (e.g. matricNo, department)
  const student = await db.student.findUnique({
    where: { id: session.user.id },
    include: {
      user: true,
      department: true,
      programme: true,
    },
  });

  if (!student) {
    redirect("/login");
  }

  // Fetch announcements targeted to ALL or STUDENTS
  const announcements = await db.sentAnnouncements.findMany({
    where: {
      OR: [
        { audience: "ALL" },
        { audience: "STUDENTS" }
      ],
      isDeleted: false
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 5
  });

  const serializedUser = {
    id: student.id,
    fullName: `${student.user.firstName} ${student.user.lastName}`,
    matricNo: student.matricNo,
    email: student.user.email,
    department: student.department.name,
    programme: student.programme.name,
    avatarUrl: student.user.avatarUrl,
  };

  const serializedAnnouncements = announcements.map((a: any) => ({
    id: a.id,
    title: a.title,
    content: a.content,
    createdAt: a.createdAt.toISOString()
  }));

  return (
    <ClientPortalShell 
      user={serializedUser} 
      announcements={serializedAnnouncements}
    >
      {children}
    </ClientPortalShell>
  );
}
