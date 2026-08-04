import React from "react";
import ResultsClientView from "./ResultsClientView";
import { Award } from "lucide-react";

export const dynamic = "force-static";

export default function ResultsCheckerPage() {
  const student = {
    matricNo: "CCHMS/2026/SCS/0001",
    level: "200",
    cgpa: 3.85,
    user: { firstName: "Student", lastName: "User" },
    department: { name: "Community Health" },
    programme: { name: "Community Health Extension (CHEW)" }
  };

  const results = [
    {
      id: "r1",
      caScore: 28,
      examScore: 58,
      totalScore: 86,
      grade: "A",
      gp: 5.0,
      course: { code: "CHEW 101", title: "Introduction to Health Science", creditUnits: 3 },
      session: { name: "2024/2025" },
      semester: { name: "First" }
    },
    {
      id: "r2",
      caScore: 24,
      examScore: 52,
      totalScore: 76,
      grade: "A",
      gp: 5.0,
      course: { code: "GST 101", title: "Use of English & Communication", creditUnits: 2 },
      session: { name: "2024/2025" },
      semester: { name: "First" }
    },
    {
      id: "r3",
      caScore: 22,
      examScore: 46,
      totalScore: 68,
      grade: "B",
      gp: 4.0,
      course: { code: "CHEW 102", title: "Community Hygiene & Sanitation", creditUnits: 3 },
      session: { name: "2024/2025" },
      semester: { name: "Second" }
    }
  ];

  const totalPoints = results.reduce((acc: number, r: any) => acc + (Number(r.gp || 0) * (r.course?.creditUnits || 0)), 0);
  const totalUnits = results.reduce((acc: number, r: any) => acc + (r.course?.creditUnits || 0), 0);
  const calculatedCgpa = totalUnits > 0 ? (totalPoints / totalUnits) : 3.85;

  const serializedStudent = {
    fullName: `${student.user.firstName} ${student.user.lastName}`,
    matricNo: student.matricNo,
    level: Number(student.level) || 200,
    department: student.department.name,
    programme: student.programme.name
  };

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
        results={results}
        calculatedCgpa={calculatedCgpa}
      />
    </div>
  );
}
