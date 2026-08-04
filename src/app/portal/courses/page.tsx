import React from "react";
import CourseRegForm from "./CourseRegForm";
import { Calendar, Clock } from "lucide-react";

export const dynamic = "force-static";

export default function CourseRegistrationPage() {
  const student = {
    id: "student-1",
    level: "200",
    currentSession: { name: "2025/2026" },
    currentSemester: { name: "First" }
  };

  const availableCourses = [
    { id: "c1", code: "CHEW 201", title: "Introduction to Public Health", creditUnits: 3, description: "Fundamentals of epidemiology & community health" },
    { id: "c2", code: "CHEW 203", title: "Primary Healthcare Management", creditUnits: 3, description: "Principles of primary healthcare administration" },
    { id: "c3", code: "ANA 201", title: "Human Anatomy & Physiology", creditUnits: 4, description: "Systemic human anatomy & clinical physiology" },
    { id: "c4", code: "PHM 201", title: "Basic Pharmacology", creditUnits: 3, description: "Drug actions & clinical pharmacokinetics" },
    { id: "c5", code: "CSC 101", title: "Introduction to Computer Science & IT", creditUnits: 3, description: "Basic computing, software & health IT systems" }
  ];

  const registeredCourseIds = ["c1", "c2", "c3"];
  const totalRegisteredCredits = 10;

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-display font-black text-brand-blue-dark text-lg sm:text-xl">Course Schedule Registration</h3>
          <p className="text-slate-400 text-xs mt-1">Select and register your curriculum courses for the current semester.</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl text-[10px] sm:text-xs font-bold text-slate-500 flex items-center gap-1.5 shrink-0">
          <Calendar size={14} className="text-brand-blue-light" />
          <span>{student.currentSession.name} Academic Session</span>
        </div>
      </div>

      {/* Grid container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Course registration form */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
          <CourseRegForm 
            availableCourses={availableCourses}
            initialRegisteredCourseIds={registeredCourseIds}
          />
        </div>

        {/* Info panel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Active Schedule status card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col gap-4">
            <h4 className="font-display font-black text-brand-blue-dark text-xs uppercase tracking-wider border-b border-slate-150 pb-2.5">
              Registration Summary
            </h4>
            
            <div className="flex flex-col gap-3 font-semibold text-xs text-slate-600">
              <div className="flex justify-between items-center">
                <span>Active Semester:</span>
                <span className="font-black text-brand-blue-dark uppercase">{student.currentSemester.name} Semester</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-150 pt-2.5">
                <span>Registration Status:</span>
                <span className="text-emerald-700 font-black bg-emerald-100 px-2 py-0.5 rounded">APPROVED</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-150 pt-2.5">
                <span>Courses Registered:</span>
                <span className="font-bold">{registeredCourseIds.length} Courses</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-150 pt-2.5">
                <span>Total Registered Units:</span>
                <span className="font-display font-black text-brand-blue-dark">{totalRegisteredCredits} Units</span>
              </div>
            </div>
          </div>

          {/* Academic policy notice */}
          <div className="bg-brand-blue-light/5 border border-brand-blue-light/20 p-5 rounded-2xl text-[10px] sm:text-xs leading-normal font-semibold text-brand-blue-dark flex items-start gap-2.5">
            <Clock size={16} className="text-brand-blue-light mt-0.5 shrink-0" />
            <div>
              <p className="font-black uppercase tracking-wider text-[9px] mb-1">Add/Drop Policy</p>
              <p className="text-slate-500 font-semibold leading-relaxed">
                Registered courses can be altered or dropped until the registration deadline. Any alterations beyond this date will require a manual drop form signed by the Head of Department.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
