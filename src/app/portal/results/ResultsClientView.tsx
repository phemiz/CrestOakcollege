"use client";

import React, { useState } from "react";
import { Printer, FileText, GraduationCap, Download, CheckCircle2 } from "lucide-react";

interface ResultsClientViewProps {
  student: {
    fullName: string;
    matricNo: string;
    level: number;
    department: string;
    programme: string;
  };
  results: Array<{
    id: string;
    caScore: number | null;
    examScore: number | null;
    totalScore: number | null;
    grade: string | null;
    gp: number | null;
    course: {
      code: string;
      title: string;
      creditUnits: number;
    };
    session: {
      name: string;
    };
    semester: {
      name: string;
    };
  }>;
  calculatedCgpa: number;
}

export default function ResultsClientView({ student, results, calculatedCgpa }: ResultsClientViewProps) {
  const [activeTab, setActiveTab] = useState<"grades" | "transcript">("grades");

  // Group results by academic session/semester for the transcript view
  const groupedResults: Record<string, typeof results> = {};
  results.forEach(res => {
    const semName = res.semester.name === "FIRST" ? "First Semester" : "Second Semester";
    const key = `${res.session.name} - ${semName}`;
    if (!groupedResults[key]) {
      groupedResults[key] = [];
    }
    groupedResults[key].push(res);
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Sub Tabs and Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-2 gap-4 print:hidden">
        <div className="flex gap-4 overflow-x-auto no-scrollbar whitespace-nowrap">
          <button
            onClick={() => setActiveTab("grades")}
            className={`pb-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "grades"
                ? "text-brand-red border-b-2 border-brand-red"
                : "text-slate-400 hover:text-brand-blue-dark"
            }`}
          >
            Active Semester Grades
          </button>
          <button
            onClick={() => setActiveTab("transcript")}
            className={`pb-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "transcript"
                ? "text-brand-red border-b-2 border-brand-red"
                : "text-slate-400 hover:text-brand-blue-dark"
            }`}
          >
            Academic Transcript
          </button>
        </div>

        {activeTab === "transcript" && (
          <button
            onClick={handlePrint}
            className="bg-brand-blue hover:bg-brand-blue-dark text-white font-display font-bold px-4 py-2 rounded-xl transition-all cursor-pointer text-xs flex items-center gap-1.5 shrink-0 shadow-sm"
          >
            <Printer size={14} />
            <span>Print Transcript</span>
          </button>
        )}
      </div>

      {/* GRADES VIEW */}
      {activeTab === "grades" && (
        <div className="flex flex-col gap-6 print:hidden">
          <div>
            <h4 className="font-display font-black text-brand-blue-dark text-sm sm:text-base">Semester Grade Sheet</h4>
            <p className="text-slate-400 text-xs mt-1">Review individual course CA, Exam and overall GPA scores for this session.</p>
          </div>

          {results.length === 0 ? (
            <div className="text-center text-slate-400 py-12 text-xs font-bold border border-dashed border-slate-200 rounded-2xl bg-slate-50">
              No published grades available for this academic cycle.
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-4 py-3">Course</th>
                      <th className="p-4 py-3">Title</th>
                      <th className="p-4 py-3 text-center">Units</th>
                      <th className="p-4 py-3 text-center">CA (30)</th>
                      <th className="p-4 py-3 text-center">Exam (70)</th>
                      <th className="p-4 py-3 text-center">Total</th>
                      <th className="p-4 py-3 text-center">Grade</th>
                      <th className="p-4 py-3 text-right">GP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {results.map((r) => (
                      <tr key={r.id}>
                        <td className="p-4 font-bold text-brand-blue-dark">{r.course.code}</td>
                        <td className="p-4">{r.course.title}</td>
                        <td className="p-4 text-center font-display">{r.course.creditUnits}</td>
                        <td className="p-4 text-center font-display">{r.caScore ? Number(r.caScore).toFixed(1) : "—"}</td>
                        <td className="p-4 text-center font-display">{r.examScore ? Number(r.examScore).toFixed(1) : "—"}</td>
                        <td className="p-4 text-center font-display text-brand-blue font-black">{r.totalScore ? Number(r.totalScore).toFixed(1) : "—"}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                            r.grade === "A" ? "bg-emerald-100 text-emerald-800" :
                            r.grade === "B" || r.grade === "B+" ? "bg-blue-100 text-blue-800" :
                            r.grade === "C" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                          }`}>
                            {r.grade || "—"}
                          </span>
                        </td>
                        <td className="p-4 text-right font-display text-brand-blue-dark">{r.gp ? Number(r.gp).toFixed(2) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* CGPA display card */}
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-xs font-semibold text-slate-600 flex justify-between items-center">
                <div>
                  <h5 className="font-display font-black text-brand-blue-dark text-xs uppercase tracking-wider">Cumulative GPA Status</h5>
                  <p className="text-slate-400 mt-1">Calculated from {results.reduce((acc, r) => acc + r.course.creditUnits, 0)} registered units.</p>
                </div>
                <div className="bg-brand-blue text-white px-5 py-2.5 rounded-xl border border-brand-blue-dark text-right shadow-sm shrink-0">
                  <span className="text-slate-300 text-[8px] font-black uppercase tracking-wider block">Student CGPA</span>
                  <span className="text-xl font-black font-display text-brand-gold mt-0.5 block">{calculatedCgpa.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TRANSCRIPT VIEW */}
      {activeTab === "transcript" && (
        <div className="flex flex-col gap-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md print:border-none print:shadow-none print:p-0">
          
          {/* Transcript Official Header */}
          <div className="flex justify-between items-center border-b-2 border-brand-blue pb-5">
            <div>
              <h2 className="font-display font-black text-brand-blue-dark text-xl sm:text-2xl tracking-tight">CrestOak College</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Office of the Registrar • Official Academic Transcript</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Date Issued</p>
              <p className="text-xs font-bold text-brand-blue-dark mt-0.5">{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Student details box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs font-semibold text-slate-600">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-400 font-bold">Student Full Name:</span>
                <span className="font-bold text-brand-blue-dark">{student.fullName}</span>
              </div>
              <div className="flex justify-between sm:border-none pb-2 sm:pb-0">
                <span className="text-slate-400 font-bold">Matric Number:</span>
                <span className="font-display font-bold text-brand-blue-dark">{student.matricNo}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-400 font-bold">Academic Programme:</span>
                <span className="font-bold text-brand-blue-dark text-right truncate max-w-[200px]" title={student.programme}>{student.programme}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">Degree Awarded:</span>
                <span className="font-bold text-brand-blue-dark">{student.programme.split(" ")[0] || "Bachelor"}</span>
              </div>
            </div>
          </div>

          {/* Semesters list */}
          <div className="flex flex-col gap-6">
            {Object.keys(groupedResults).length === 0 ? (
              <div className="text-center text-slate-400 py-10 text-xs font-bold">No academic results available to display.</div>
            ) : (
              Object.entries(groupedResults).map(([semesterLabel, semesterResults]) => {
                // Compute semester GPA
                const semPoints = semesterResults.reduce((acc, r) => acc + (Number(r.gp || 0) * r.course.creditUnits), 0);
                const semUnits = semesterResults.reduce((acc, r) => acc + r.course.creditUnits, 0);
                const semGpa = semUnits > 0 ? (semPoints / semUnits) : 0;

                return (
                  <div key={semesterLabel} className="flex flex-col gap-3">
                    <h5 className="font-display font-black text-brand-blue-dark text-xs sm:text-sm uppercase tracking-wider border-b border-slate-200 pb-1.5 mt-2">
                      {semesterLabel}
                    </h5>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200">
                            <th className="p-3">Course Code</th>
                            <th className="p-3">Title</th>
                            <th className="p-3 text-center">Credit Units</th>
                            <th className="p-3 text-center">Grade</th>
                            <th className="p-3 text-right">Points</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                          {semesterResults.map(r => (
                            <tr key={r.id}>
                              <td className="p-3 font-bold text-brand-blue-dark">{r.course.code}</td>
                              <td className="p-3">{r.course.title}</td>
                              <td className="p-3 text-center font-display">{r.course.creditUnits}</td>
                              <td className="p-3 text-center"><span className="font-bold">{r.grade || "N/A"}</span></td>
                              <td className="p-3 text-right font-display text-brand-blue-dark">{(Number(r.gp || 0) * r.course.creditUnits).toFixed(1)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase px-2 py-1.5 bg-slate-50 rounded-xl">
                      <span>Semester Total Units: {semUnits}</span>
                      <span>Semester GPA: {semGpa.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Transcript Footer stats */}
          <div className="border-t-2 border-brand-blue pt-5 mt-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold text-slate-600">
            <div>
              <p className="font-display font-black text-brand-blue-dark text-sm">CUMULATIVE CGPA: {calculatedCgpa.toFixed(2)}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Total Cumulative Earned Units: {results.reduce((acc, r) => acc + r.course.creditUnits, 0)} Units</p>
            </div>
            
            {/* Signature mockup */}
            <div className="text-center sm:text-right shrink-0">
              <div className="h-10 w-32 border-b border-slate-350 mx-auto sm:ml-auto flex items-end justify-center font-serif text-slate-300 select-none italic text-sm pb-1 font-bold">
                E. Adebayo
              </div>
              <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-1">Registrar Signature & Seal</p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
