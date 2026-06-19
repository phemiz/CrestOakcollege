import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import ResultsClientView from "./ResultsClientView";
import { Award, Calendar } from "lucide-react";

export default async function ResultsCheckerPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "Student") {
    redirect("/login");
  }

  // Fetch student details
  const student = await db.student.findUnique({
    where: { id: session.user.id },
    include: {
      user: true,
      department: true,
      programme: true
    }
  });

  if (!student) {
    redirect("/login");
  }

  // Query published results for the student
  const results = await db.result.findMany({
    where: {
      studentId: student.id,
      isPublished: true,
      isDeleted: false
    },
    include: {
      course: true,
      session: true,
      semester: true
    },
    orderBy: [
      { session: { name: "asc" } },
      { semester: { name: "asc" } },
      { course: { code: "asc" } }
    ]
  });

  // Calculate dynamic CGPA
  const totalPoints = results.reduce((acc, r) => acc + (Number(r.gp || 0) * r.course.creditUnits), 0);
  const totalUnits = results.reduce((acc, r) => acc + r.course.creditUnits, 0);
  const calculatedCgpa = totalUnits > 0 ? (totalPoints / totalUnits) : Number(student.cgpa);

  const serializedStudent = {
    fullName: `${student.user.firstName} ${student.user.lastName}`,
    matricNo: student.matricNo,
    level: student.level,
    department: student.department.name,
    programme: student.programme.name
  };

  const serializedResults = results.map(r => ({
    id: r.id,
    caScore: r.caScore ? Number(r.caScore) : null,
    examScore: r.examScore ? Number(r.examScore) : null,
    totalScore: r.totalScore ? Number(r.totalScore) : null,
    grade: r.grade,
    gp: r.gp ? Number(r.gp) : null,
    course: {
      code: r.course.code,
      title: r.course.title,
      creditUnits: r.course.creditUnits
    },
    session: {
      name: r.session.name
    },
    semester: {
      name: r.semester.name
    }
  }));

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h3 className="font-display font-black text-brand-blue-dark text-lg sm:text-xl">Academic Grades & Transcripts</h3>
          <p className="text-slate-400 text-xs mt-1">Audit final grades and download official transcripts.</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl text-[10px] sm:text-xs font-bold text-slate-500 flex items-center gap-1.5 shrink-0">
          <Award size={14} className="text-brand-blue-light" />
          <span>Active Standing: Good</span>
        </div>
      </div>

      <ResultsClientView 
        student={serializedStudent}
        results={serializedResults}
        calculatedCgpa={calculatedCgpa}
      />
    </div>
  );
}
