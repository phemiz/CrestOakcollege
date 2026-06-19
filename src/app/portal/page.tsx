import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import Link from "next/link";
import { 
  BookOpen, 
  Wallet, 
  Award, 
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  FileText,
  Clock
} from "lucide-react";

export default async function StudentPortalHome() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "Student") {
    redirect("/login");
  }

  // Fetch student profile, including relations
  const student = await db.student.findUnique({
    where: { id: session.user.id },
    include: {
      user: true,
      department: true,
      programme: true,
      currentSession: true,
      currentSemester: true
    }
  });

  if (!student) {
    redirect("/login");
  }

  // Fetch registered courses for the current session/semester
  const registrations = await db.courseRegistration.findMany({
    where: {
      studentId: student.id,
      sessionId: student.currentSessionId,
      semesterId: student.currentSemesterId
    },
    include: {
      course: true
    }
  });

  const totalRegisteredCredits = registrations.reduce((acc, reg) => acc + reg.course.creditUnits, 0);

  // Fetch student results to compute GPAs
  const results = await db.result.findMany({
    where: {
      studentId: student.id,
      isPublished: true
    },
    include: {
      course: true,
      session: true,
      semester: true
    }
  });

  // Fetch invoices to see outstanding dues
  const invoices = await db.invoice.findMany({
    where: {
      userId: student.id,
      isDeleted: false
    }
  });

  const pendingAmount = invoices
    .filter(inv => inv.status !== "PAID" && inv.status !== "CANCELLED")
    .reduce((acc, inv) => Number(acc) + Number(inv.amount), 0);

  // Group results by semester to compute semester-specific GPA trends
  const semesterGpMap: Record<string, { totalPoints: number; totalUnits: number }> = {};
  
  results.forEach(res => {
    const key = `${res.session.name} - ${res.semester.name}`;
    const gpValue = res.gp ? Number(res.gp) : 0;
    const unitsValue = res.course.creditUnits;

    if (!semesterGpMap[key]) {
      semesterGpMap[key] = { totalPoints: 0, totalUnits: 0 };
    }
    semesterGpMap[key].totalPoints += gpValue * unitsValue;
    semesterGpMap[key].totalUnits += unitsValue;
  });

  const gpaTrends = Object.entries(semesterGpMap).map(([semesterLabel, data]) => {
    const gpa = data.totalUnits > 0 ? (data.totalPoints / data.totalUnits) : 0;
    return {
      label: semesterLabel,
      gpa: Number(gpa.toFixed(2)),
      units: data.totalUnits
    };
  });

  // Calculate dynamic GPA & CGPA
  const calculatedCgpa = results.length > 0 
    ? Number((results.reduce((acc, r) => acc + (Number(r.gp || 0) * r.course.creditUnits), 0) / 
      results.reduce((acc, r) => acc + r.course.creditUnits, 0)).toFixed(2))
    : Number(student.cgpa);

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">
      {/* Welcome Banner */}
      <div className="bg-brand-blue text-white rounded-3xl p-6 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-md border border-brand-blue-dark">
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-red/15 rounded-full blur-3xl translate-x-1/4 -translate-y-1/4" />
        <div>
          <span className="text-brand-gold font-bold text-[10px] sm:text-xs uppercase tracking-widest">Student Information Hub</span>
          <h3 className="font-display font-black text-xl sm:text-2xl mt-1 leading-snug">Welcome Back, {student.user.firstName}!</h3>
          <p className="text-slate-200 text-xs mt-1.5 font-bold">
            Level: {student.level} Level • Active Session: {student.currentSession.name} ({student.currentSemester.name} Semester)
          </p>
        </div>
        <div className="bg-white/10 px-5 py-3 rounded-2xl border border-white/10 text-right shrink-0 backdrop-blur-sm">
          <p className="text-slate-300 text-[9px] font-black uppercase tracking-wider">Dynamic CGPA</p>
          <p className="text-2xl sm:text-3xl font-black text-brand-gold mt-0.5 font-display">{calculatedCgpa.toFixed(2)}</p>
        </div>
      </div>

      {/* Main Metrics Card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Card 1: Course Registration */}
        <div className="border border-slate-200 p-5 rounded-2xl shadow-sm bg-white flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 font-black uppercase text-[10px] tracking-wider">Registration Status</span>
            <div className="p-1.5 bg-brand-blue-light/10 text-brand-blue-light rounded-lg">
              <BookOpen size={16} />
            </div>
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-brand-blue-dark">
              {totalRegisteredCredits > 0 ? `${totalRegisteredCredits} Units` : "Not Registered"}
            </p>
            <div className="flex justify-between items-center mt-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase">
                {totalRegisteredCredits > 0 ? "Approved Schedule" : "Action Required"}
              </span>
              <Link href="/portal/courses" className="text-[10px] text-brand-red font-black uppercase hover:underline flex items-center gap-0.5">
                <span>Manage</span>
                <ArrowUpRight size={10} />
              </Link>
            </div>
          </div>
        </div>

        {/* Card 2: Financial Dues */}
        <div className="border border-slate-200 p-5 rounded-2xl shadow-sm bg-white flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 font-black uppercase text-[10px] tracking-wider">Outstanding Dues</span>
            <div className={`p-1.5 rounded-lg ${pendingAmount > 0 ? "bg-brand-red/10 text-brand-red" : "bg-emerald-100 text-emerald-800"}`}>
              <Wallet size={16} />
            </div>
          </div>
          <div>
            <p className={`text-xl sm:text-2xl font-black ${pendingAmount > 0 ? "text-brand-red" : "text-emerald-700"}`}>
              {formatNaira(pendingAmount)}
            </p>
            <div className="flex justify-between items-center mt-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase">
                {pendingAmount > 0 ? "Outstanding Fees" : "Account Cleared"}
              </span>
              {pendingAmount > 0 && (
                <Link href="/portal/billing" className="text-[10px] text-brand-red font-black uppercase hover:underline flex items-center gap-0.5">
                  <span>Pay Now</span>
                  <ArrowUpRight size={10} />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Notifications Alert */}
        <div className="border border-slate-200 p-5 rounded-2xl shadow-sm bg-white flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 font-black uppercase text-[10px] tracking-wider">Academic Standing</span>
            <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
              <Award size={16} />
            </div>
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-brand-blue-dark">Good Standing</p>
            <span className="text-[10px] text-slate-500 font-bold mt-1 block uppercase">No active probations</span>
          </div>
        </div>

      </div>

      {/* Analytics & Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Semester GPA Progress Chart */}
        <div className="lg:col-span-8 border border-slate-200 rounded-3xl p-6 shadow-sm bg-white">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-brand-blue-light" size={16} />
              <h4 className="font-display font-black text-brand-blue-dark text-xs uppercase tracking-wider">
                GPA semester-over-semester trend
              </h4>
            </div>
          </div>

          {gpaTrends.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-xs font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              No results published yet to plot trend
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-end h-48 px-4 pt-4 border-b border-l border-slate-200 relative">
                {/* Horizontal Grid lines */}
                <div className="absolute left-0 right-0 top-1/4 border-t border-slate-100 border-dashed pointer-events-none" />
                <div className="absolute left-0 right-0 top-2/4 border-t border-slate-100 border-dashed pointer-events-none" />
                <div className="absolute left-0 right-0 top-3/4 border-t border-slate-100 border-dashed pointer-events-none" />

                {gpaTrends.map((trend) => {
                  // Max GPA is 5.0
                  const heightPercent = `${(trend.gpa / 5.0) * 100}%`;
                  return (
                    <div key={trend.label} className="flex flex-col items-center gap-2 w-1/4 group relative z-10">
                      {/* Tooltip */}
                      <span className="absolute -top-8 bg-brand-blue text-white text-[9px] font-black px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        GPA: {trend.gpa.toFixed(2)}
                      </span>
                      {/* Bar fill */}
                      <div 
                        style={{ height: heightPercent }} 
                        className="w-8 sm:w-12 bg-brand-blue hover:bg-brand-red rounded-t-lg transition-all shadow-md duration-300"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Labels */}
              <div className="flex justify-between text-[9px] sm:text-[10px] font-black text-slate-400 uppercase px-1">
                {gpaTrends.map((trend) => (
                  <span key={trend.label} className="w-1/4 text-center truncate px-1" title={trend.label}>
                    {trend.label.split(" - ")[1] || trend.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Credit unit analytics Progress */}
        <div className="lg:col-span-4 border border-slate-200 rounded-3xl p-6 shadow-sm bg-white flex flex-col justify-between">
          <div>
            <h4 className="font-display font-black text-brand-blue-dark text-xs uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">
              Registered Credits Progress
            </h4>
            
            <div className="flex flex-col gap-6 py-2">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-600 mb-2">
                  <span>Semester Core Courses</span>
                  <span className="font-display font-black text-brand-blue-dark">{totalRegisteredCredits} / 24 Units</span>
                </div>
                
                {/* Visual indicator bar */}
                <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden border border-slate-200 p-0.5">
                  <div 
                    style={{ width: `${Math.min((totalRegisteredCredits / 24) * 100, 100)}%` }} 
                    className="bg-brand-blue-light h-full rounded-full transition-all duration-500"
                  />
                </div>
                
                <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase leading-snug">
                  * Limit is 12 units minimum and 24 units maximum to satisfy full-time studies.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl text-[10px] font-semibold text-slate-600 leading-normal flex flex-col gap-2.5">
                <div className="flex items-center gap-2 text-brand-blue-dark">
                  <Clock size={14} className="shrink-0 text-brand-blue-light" />
                  <span className="font-black uppercase tracking-wider text-[9px]">Important Deadlines</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-150 pt-2">
                  <span>Course Add/Drop:</span>
                  <span className="font-black text-brand-red">June 30, 2026</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Tuition Instalment:</span>
                  <span className="font-black text-brand-blue-dark">June 21, 2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Grades table */}
      <div className="border border-slate-200 rounded-3xl p-6 shadow-sm bg-white">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <FileText className="text-brand-blue-light" size={16} />
            <h4 className="font-display font-black text-brand-blue-dark text-xs uppercase tracking-wider">
              Recent Published Semester Grades
            </h4>
          </div>
          <Link href="/portal/results" className="text-[10px] text-brand-red font-black uppercase hover:underline">
            View All results
          </Link>
        </div>

        {results.length === 0 ? (
          <div className="text-center text-slate-400 py-8 text-xs font-bold">
            No grades published for this academic period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-3">Course Code</th>
                  <th className="p-3">Title</th>
                  <th className="p-3 text-center">Credit Units</th>
                  <th className="p-3 text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {results.slice(0, 3).map((r) => (
                  <tr key={r.id}>
                    <td className="p-3 font-bold text-brand-blue-dark">{r.course.code}</td>
                    <td className="p-3">{r.course.title}</td>
                    <td className="p-3 text-center font-display">{r.course.creditUnits}</td>
                    <td className="p-3 text-center">
                      <span className="bg-emerald-100 text-emerald-800 font-black px-2.5 py-0.5 rounded">
                        {r.grade || "N/A"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
