import React from "react";
import { getSafeSession } from "@/lib/session";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import ClientPortalShell from "@/components/portal/ClientPortalShell";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  let session = null;
  try {
    session = await getSafeSession();
  } catch (e) {
    // Static export / offline DB fallback
  }

  let serializedUser = {
    id: "demo-student-id",
    fullName: "Student User",
    matricNo: "CCHSMT/2026/001",
    email: "student1@crestoakcollege.com.ng",
    department: "Community Health",
    programme: "Community Health Extension (CHEW)",
    avatarUrl: null,
  };

  let serializedAnnouncements: Array<{
    id: string;
    title: string;
    content: string;
    createdAt: string;
  }> = [];

  if (session?.user?.id) {
    try {
      const student = await db.student.findUnique({
        where: { id: session.user.id },
        include: {
          user: true,
          department: true,
          programme: true,
        },
      });

      if (student) {
        serializedUser = {
          id: student.id,
          fullName: `${student.user.firstName} ${student.user.lastName}`,
          matricNo: student.matricNo,
          email: student.user.email,
          department: student.department.name,
          programme: student.programme.name,
          avatarUrl: student.user.avatarUrl,
        };
      }

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

      serializedAnnouncements = announcements.map((a: any) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        createdAt: a.createdAt.toISOString()
      }));
    } catch (err) {
      // Fallback
    }
  }

  return (
    <ClientPortalShell 
      user={serializedUser} 
      announcements={serializedAnnouncements}
    >
      {children}
    </ClientPortalShell>
  );
}
