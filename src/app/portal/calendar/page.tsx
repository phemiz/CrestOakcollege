import React from "react";
import { getSafeSession } from "@/lib/session";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import { Calendar, Clock, MapPin, AlertCircle } from "lucide-react";

export default async function AcademicCalendarPage() {
  const session = await getSafeSession();

  if (!session || session.user.role !== "Student") {
    redirect("/login");
  }

  // Fetch student details
  const student = await db.student.findUnique({
    where: { id: session.user.id },
    include: {
      currentSession: true
    }
  });

  if (!student) {
    redirect("/login");
  }

  // Fetch semesters in the current session
  const semesters = await db.semester.findMany({
    where: {
      sessionId: student.currentSessionId,
      isDeleted: false
    },
    orderBy: {
      startDate: "asc"
    }
  });

  const sessionStart = student.currentSession.startDate.toLocaleDateString();
  const sessionEnd = student.currentSession.endDate.toLocaleDateString();

  // Mock calendar events linked to the database semesters' dates
  const firstSem = semesters.find((s: any) => s.name === "FIRST");
  const secondSem = semesters.find((s: any) => s.name === "SECOND");

  const events = [];

  if (firstSem) {
    const fStart = firstSem.startDate;
    events.push(
      {
        title: "Resumption & Lecture Commencement",
        date: fStart.toLocaleDateString(),
        description: "Lectures start for all departments and student levels.",
        category: "Lectures",
        location: "Main Campus Lectures Halls"
      },
      {
        title: "First Semester Course Registration Deadline",
        date: new Date(fStart.getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(), // +2 weeks
        description: "Deadline to register courses. Late registrations incur N5,000 penalty fees.",
        category: "Academic",
        location: "Portal Self-service"
      },
      {
        title: "Freshman Matriculation Ceremony",
        date: new Date(fStart.getTime() + 45 * 24 * 60 * 60 * 1000).toLocaleDateString(), // +1.5 months
        description: "Mandatory matriculation ceremony for allYear 1 admissions.",
        category: "Ceremony",
        location: "College Main Auditorium"
      },
      {
        title: "First Semester Examination Period",
        date: firstSem.endDate.toLocaleDateString(),
        description: "Final written papers and lab audits across all levels.",
        category: "Examinations",
        location: "Examination Halls"
      }
    );
  }

  if (secondSem) {
    const sStart = secondSem.startDate;
    events.push(
      {
        title: "Second Semester Lectures Resumption",
        date: sStart.toLocaleDateString(),
        description: "Lectures commence for the second academic cycle.",
        category: "Lectures",
        location: "Main Campus"
      },
      {
        title: "Second Semester Examination Period",
        date: secondSem.endDate.toLocaleDateString(),
        description: "Concluding final exams and end-of-year screening audits.",
        category: "Examinations",
        location: "Examination Halls"
      }
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-display font-black text-brand-blue-dark text-lg sm:text-xl">Academic Calendar & Events</h3>
          <p className="text-slate-400 text-xs mt-1">Track active semester timelines, lecture resumptions, and examination periods.</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl text-[10px] sm:text-xs font-bold text-slate-500 flex items-center gap-1.5 shrink-0">
          <Calendar size={14} className="text-brand-blue-light" />
          <span>Active Session: {student.currentSession.name}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Session timeline outline */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <h4 className="font-display font-black text-brand-blue-dark text-xs uppercase tracking-wider border-b border-slate-100 pb-3 mb-2">
            Session Deadlines & Timeline
          </h4>

          {events.length === 0 ? (
            <div className="text-center text-slate-400 py-10 text-xs font-bold border border-dashed border-slate-200 rounded-2xl">
              No calendar events loaded.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {events.map((ev, index) => (
                <div 
                  key={index}
                  className="flex gap-4 p-5 border border-slate-200 rounded-2xl bg-white hover:shadow-sm transition-all"
                >
                  {/* Calendar tag icon */}
                  <div className="p-3 bg-brand-blue-light/10 text-brand-blue-light rounded-xl h-fit shrink-0">
                    <Calendar size={16} />
                  </div>
                  <div className="flex-grow flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs font-semibold text-slate-600">
                    <div>
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                        ev.category === "Examinations" ? "bg-red-100 text-red-800" :
                        ev.category === "Lectures" ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-700"
                      }`}>
                        {ev.category}
                      </span>
                      <h5 className="font-display font-black text-brand-blue-dark text-xs sm:text-sm mt-1.5">{ev.title}</h5>
                      <p className="text-slate-400 text-[10px] sm:text-xs mt-1 leading-normal font-semibold font-sans">{ev.description}</p>
                      
                      <div className="flex gap-3 text-[10px] text-slate-400 font-bold mt-2.5">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="shrink-0" />
                          <span>{ev.location}</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 border border-slate-150 px-3 py-2 rounded-xl text-center shrink-0 self-start sm:self-auto min-w-[90px]">
                      <span className="text-slate-400 text-[8px] font-black uppercase tracking-wider block">Due Date</span>
                      <span className="font-display font-black text-brand-blue-dark block mt-0.5 text-xs sm:text-sm">{ev.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Timetable metrics summary */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col gap-4">
            <h4 className="font-display font-black text-brand-blue-dark text-xs uppercase tracking-wider border-b border-slate-150 pb-2.5">
              Active Session Bounds
            </h4>
            
            <div className="flex flex-col gap-3 font-semibold text-xs text-slate-600">
              <div className="flex justify-between items-center">
                <span>Session Start:</span>
                <span className="font-bold text-brand-blue-dark">{sessionStart}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-150 pt-2.5">
                <span>Session End:</span>
                <span className="font-bold text-brand-blue-dark">{sessionEnd}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-150 pt-2.5">
                <span>Semesters in Session:</span>
                <span className="font-bold">{semesters.length} Semesters</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex items-start gap-2.5 text-xs font-semibold text-slate-600 leading-normal">
            <AlertCircle size={16} className="text-brand-blue-light mt-0.5 shrink-0" />
            <div>
              <p className="font-black uppercase tracking-wider text-[9px] text-brand-blue-dark mb-1">Administrative Note</p>
              <p className="text-slate-400 leading-relaxed text-[10px] sm:text-xs">
                Calendar schedules are subject to adjustment by the College Senate. Any modifications will be broadcasted to the Portal announcements list.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
