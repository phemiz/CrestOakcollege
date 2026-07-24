import React from "react";
import { getSafeSession } from "@/lib/session";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import CourseRegForm from "./CourseRegForm";
import { BookOpen, Calendar, Clock, ShieldAlert } from "lucide-react";

export default async function CourseRegistrationPage() {
  const session = await getSafeSession();

  if (!session || session.user.role !== "Student") {
    redirect("/login");
  }

  // Fetch student profile details
  const student = await db.student.findUnique({
    where: { id: session.user.id },
    include: {
      department: true,
      currentSession: true,
      currentSemester: true
    }
  });

  if (!student) {
    redirect("/login");
  }

  // Query database for available courses for the student's level, department, and semester
  const availableCourses = await db.course.findMany({
    where: {
      departmentId: student.departmentId,
      level: student.level,
      semesterName: student.currentSemester.name,
      isDeleted: false
    },
    orderBy: {
      code: "asc"
    }
  });

  // Query database for existing registrations
  const existingRegistrations = await db.courseRegistration.findMany({
    where: {
      studentId: student.id,
      sessionId: student.currentSessionId,
      semesterId: student.currentSemesterId,
      isDeleted: false
    },
    include: {
      course: true
    }
  });

  const registeredCourseIds = existingRegistrations.map((r: any) => r.courseId);
  const totalRegisteredCredits = existingRegistrations.reduce((acc: number, r: any) => acc + r.course.creditUnits, 0);

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
            availableCourses={availableCourses.map((c: any) => ({
              id: c.id,
              code: c.code,
              title: c.title,
              creditUnits: c.creditUnits,
              description: c.description
            }))}
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
                {registeredCourseIds.length > 0 ? (
                  <span className="text-emerald-700 font-black bg-emerald-100 px-2 py-0.5 rounded">APPROVED</span>
                ) : (
                  <span className="text-brand-red font-black bg-red-100 px-2 py-0.5 rounded">PENDING</span>
                )}
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
