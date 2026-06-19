import React from "react";
import db from "@/lib/db";
import StudentsClient from "@/components/admin/StudentsClient";

export const revalidate = 0; // Fresh students directory always

export default async function StudentsPage() {
  const [
    students,
    departments,
    programmes,
    sessions,
    semesters
  ] = await Promise.all([
    db.student.findMany({
      where: {
        isDeleted: false,
        user: { isDeleted: false }
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            middleName: true,
            email: true,
            phoneNumber: true
          }
        },
        department: {
          select: {
            id: true,
            name: true
          }
        },
        programme: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        matricNo: "asc"
      }
    }),
    db.department.findMany({
      where: { isDeleted: false },
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    }),
    db.programme.findMany({
      where: { isDeleted: false },
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    }),
    db.academicSession.findMany({
      where: { isDeleted: false },
      select: { id: true, name: true },
      orderBy: { name: "desc" }
    }),
    db.semester.findMany({
      where: { isDeleted: false },
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    })
  ]);

  const mappedStudents = students.map((stu) => ({
    id: stu.id,
    matricNo: stu.matricNo,
    level: stu.level,
    cgpa: Number(stu.cgpa),
    gpa: Number(stu.gpa),
    user: stu.user,
    department: stu.department,
    programme: stu.programme,
    entrySessionId: stu.entrySessionId,
    currentSessionId: stu.currentSessionId,
    currentSemesterId: stu.currentSemesterId
  }));

  // Re-map semester names to be human readable
  const mappedSemesters = semesters.map((sem) => ({
    id: sem.id,
    name: sem.name
  }));

  return (
    <StudentsClient
      students={mappedStudents}
      departments={departments}
      programmes={programmes}
      sessions={sessions}
      semesters={mappedSemesters}
    />
  );
}
