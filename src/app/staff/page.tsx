"use client";

import React, { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { 
  LogOut, 
  User, 
  BookOpen, 
  Users, 
  Calendar, 
  GraduationCap, 
  FileSpreadsheet, 
  Settings, 
  Bell, 
  CheckCircle2, 
  Clock, 
  Search,
  Plus,
  Loader2
} from "lucide-react";

export default function StaffDashboard() {
  const [isClient, setIsClient] = useState(false);
  const [localUser, setLocalUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  // Grade Management Form State
  const [gradeForm, setGradeForm] = useState({
    matricNo: "CCHMS/2026/NUR/0042",
    courseCode: "NUR 101",
    courseTitle: "Foundations of Professional Nursing Practice",
    units: 3,
    semester: "First Semester, 2025/2026",
    session: "2025/2026",
    assignment: 8,
    caTest: 17,
    project: 9,
    exam: 50
  });
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);
  const [gradeSuccessMsg, setGradeSuccessMsg] = useState("");
  const [savedGradesList, setSavedGradesList] = useState<any[]>([]);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("isAuthenticated") === "true";
      const userStr = localStorage.getItem("user") || localStorage.getItem("cchsmt_user_session");
      if (auth && userStr) {
        try {
          const parsed = JSON.parse(userStr);
          setLocalUser(parsed);
          setIsAuthenticated(true);
        } catch (e) {}
      } else if (auth) {
        setIsAuthenticated(true);
      }
    }

    // Fetch existing grades from API
    fetch("/api/admin/grades.php")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.grades)) {
          setSavedGradesList(data.grades);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingGrade(true);
    setGradeSuccessMsg("");

    try {
      const res = await fetch("/api/admin/grades.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_grade",
          ...gradeForm,
          recordedBy: effectiveUser.name || "Lecturer"
        })
      });
      const data = await res.json();
      if (data.success) {
        setGradeSuccessMsg(`Grade saved! Student CGPA updated to ${data.calculatedCgpa}`);
        // Refresh grades list
        const refreshed = await fetch("/api/admin/grades.php");
        const rData = await refreshed.json();
        if (rData.success && Array.isArray(rData.grades)) {
          setSavedGradesList(rData.grades);
        }
      } else {
        alert("Error saving grade: " + (data.message || "Save failed."));
      }
    } catch (err: any) {
      alert("Submission error: " + err.message);
    } finally {
      setIsSubmittingGrade(false);
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800 font-sans">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin h-10 w-10 text-indigo-600" />
          <p className="text-slate-500 font-medium text-sm">Verifying authorization...</p>
        </div>
      </div>
    );
  }

  const effectiveUser = session?.user || localUser || {
    name: localUser?.username || "Academic Staff Member",
    email: localUser?.email || "staff@crestoakcollege.com.ng",
    role: "Staff",
    department: "Community Health",
    faculty: "School of Public Health & Health Sciences"
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("user");
      localStorage.removeItem("cchsmt_user_session");
      localStorage.removeItem("userRole");
    }
    signOut({ callbackUrl: "/login/?gateway=staff" });
  };

  // Mock data for lecturer
  const courses = [
    { code: "CSC 201", name: "Introduction to Computer Science", students: 145, schedule: "Mon/Wed 9:00 AM", room: "Lecture Hall A" },
    { code: "CSC 205", name: "Data Structures & Algorithms", students: 92, schedule: "Tue/Thu 11:00 AM", room: "Lab 3" },
    { code: "CSC 311", name: "Software Engineering Principles", students: 78, schedule: "Friday 2:00 PM", room: "Seminar Room 2" },
  ];

  const tasks = [
    { id: 1, title: "Submit Grade Sheet for CSC 201", deadline: "In 2 days", priority: "high", status: "pending" },
    { id: 2, title: "Approve Student Course Registrations", deadline: "In 5 days", priority: "medium", status: "pending" },
    { id: 3, title: "Upload Course Syllabus for CSC 311", deadline: "Completed", priority: "low", status: "completed" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      
      {/* Upper Navigation Bar */}
      <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <Logo showText={true} lightText={false} size={40} />
          <span className="hidden sm:inline bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
            {effectiveUser.role || "Staff"} Portal
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          </button>
          
          {/* User Profile Info */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-slate-900 leading-none">{effectiveUser.name}</p>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">{effectiveUser.email}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-base shadow-xs">
              {effectiveUser.name?.charAt(0) || "S"}
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex flex-grow flex-col lg:flex-row">
        
        {/* Sidebar Nav */}
        <aside className="w-full lg:w-64 bg-white lg:border-r border-slate-200/80 p-6 space-y-8 shrink-0">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3">
              Navigation
            </h3>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab("overview")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "overview"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <GraduationCap className="w-4.5 h-4.5" />
                <span>Overview</span>
              </button>
              <button
                onClick={() => setActiveTab("courses")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "courses"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <BookOpen className="w-4.5 h-4.5" />
                <span>My Courses</span>
              </button>
              <button
                onClick={() => setActiveTab("records")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "records"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <FileSpreadsheet className="w-4.5 h-4.5" />
                <span>Gradebook</span>
              </button>
            </nav>
          </div>

          <div className="pt-6 border-t border-slate-100 space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3">
              Account
            </h3>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-all cursor-pointer"
            >
              <LogOut className="w-4.5 h-4.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Content Body */}
        <main className="flex-grow p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full space-y-8">
          
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 border border-slate-800 shadow-sm relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <h1 className="text-2xl md:text-3xl font-display font-black text-white tracking-tight">
              Welcome Back, {effectiveUser.name}
            </h1>
            <p className="text-indigo-200 mt-2 max-w-xl text-xs md:text-sm leading-relaxed font-medium">
              Managing program modules for the {effectiveUser.department || "academic"} department. Review student enrollments and update assessment logs.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold">
              <div className="bg-white/10 backdrop-blur-xs text-white px-3.5 py-1.5 rounded-full border border-white/15">
                Department: <span className="text-indigo-300 font-bold">{effectiveUser.department || "General Administration"}</span>
              </div>
              {effectiveUser.faculty && (
                <div className="bg-white/10 backdrop-blur-xs text-white px-3.5 py-1.5 rounded-full border border-white/15">
                  Faculty: <span className="text-indigo-300 font-bold">{effectiveUser.faculty}</span>
                </div>
              )}
            </div>
          </div>

          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stat Card 1 */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Active Students</p>
                    <h3 className="text-3xl font-display font-black text-slate-900 mt-2">315</h3>
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-xs text-slate-500 mt-4 flex items-center gap-1.5 font-medium">
                  <span className="text-emerald-600 font-bold">▲ +12%</span> since last semester
                </div>
              </div>

              {/* Stat Card 2 */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Assigned Courses</p>
                    <h3 className="text-3xl font-display font-black text-slate-900 mt-2">3</h3>
                  </div>
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-xs text-slate-500 mt-4 font-medium">
                  Full-time lecturer workload
                </div>
              </div>

              {/* Stat Card 3 */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Academic Calendar</p>
                    <h3 className="text-xl font-display font-black text-slate-900 mt-2">Week 8</h3>
                  </div>
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-xs text-slate-500 mt-4 font-medium">
                  Midterm examination period
                </div>
              </div>

              {/* Weekly Schedule & Pending Tasks */}
              <div className="md:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-xs">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-display font-black text-slate-900">Course Schedule</h3>
                  <button className="text-xs text-indigo-600 hover:text-indigo-700 font-bold cursor-pointer">View Calendar</button>
                </div>
                <div className="divide-y divide-slate-100">
                  {courses.map((course) => (
                    <div key={course.code} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <span className="text-xs font-bold text-indigo-600 uppercase">{course.code}</span>
                        <h4 className="text-sm font-bold text-slate-900 mt-0.5">{course.name}</h4>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> {course.schedule} &bull; {course.room}
                        </p>
                      </div>
                      <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200 font-semibold">
                        {course.students} Students enrolled
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checklist Tasks */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-xs">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-display font-black text-slate-900">Tasks & Deadlines</h3>
                  <button className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex gap-3">
                      {task.status === "completed" ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-2 ${
                          task.priority === "high" ? "bg-red-500" : "bg-amber-500"
                        }`} />
                      )}
                      <div>
                        <p className={`text-xs font-semibold ${task.status === "completed" ? "text-slate-400 line-through" : "text-slate-800"}`}>
                          {task.title}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">
                          {task.deadline}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "courses" && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-display font-black text-slate-900">My Academic Modules</h2>
                  <p className="text-slate-500 text-xs mt-1 font-medium">Review lecture materials and active course profiles</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search courses..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map((course) => (
                  <div key={course.code} className="bg-slate-50 border border-slate-200 p-6 rounded-2xl hover:border-slate-300 transition-all group">
                    <div className="flex justify-between items-start">
                      <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                        {course.code}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">{course.room}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-4 group-hover:text-indigo-600 transition-colors">
                      {course.name}
                    </h3>
                    <div className="mt-6 grid grid-cols-2 gap-4 text-xs border-t border-slate-200 pt-4">
                      <div>
                        <p className="text-slate-500 font-medium">Students</p>
                        <p className="text-sm font-bold text-slate-900 mt-1">{course.students} Registered</p>
                      </div>
                      <div>
                        <p className="text-slate-500 font-medium">Schedule</p>
                        <p className="text-sm font-bold text-slate-900 mt-1">{course.schedule.split(" ")[0]}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "records" && (
            <div className="space-y-8">
              {/* Grade Entry Form Container */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
                <div className="border-b border-slate-150 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h2 className="text-xl font-display font-black text-slate-900">Lecturer Grade Entry & Assessment Portal</h2>
                    <p className="text-slate-500 text-xs mt-1 font-medium">
                      Enter component scores per student. Scores automatically compute total marks, letter grades, and update student CGPA in real-time.
                    </p>
                  </div>
                  <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Official Gradebook
                  </span>
                </div>

                {gradeSuccessMsg && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-4 rounded-2xl flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{gradeSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSaveGrade} className="space-y-5 text-xs font-semibold text-slate-800">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-slate-600">Student Matriculation No *</label>
                      <input
                        type="text"
                        required
                        value={gradeForm.matricNo}
                        onChange={(e) => setGradeForm({ ...gradeForm, matricNo: e.target.value })}
                        placeholder="e.g. CCHMS/2026/NUR/0042"
                        className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 font-mono font-bold text-slate-900"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-slate-600">Course Code *</label>
                      <input
                        type="text"
                        required
                        value={gradeForm.courseCode}
                        onChange={(e) => setGradeForm({ ...gradeForm, courseCode: e.target.value })}
                        placeholder="e.g. NUR 101"
                        className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 font-bold uppercase text-slate-900"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-slate-600">Credit Units *</label>
                      <input
                        type="number"
                        min="1"
                        max="6"
                        required
                        value={gradeForm.units}
                        onChange={(e) => setGradeForm({ ...gradeForm, units: Number(e.target.value) })}
                        className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-slate-600">Course Title</label>
                    <input
                      type="text"
                      value={gradeForm.courseTitle}
                      onChange={(e) => setGradeForm({ ...gradeForm, courseTitle: e.target.value })}
                      placeholder="Course Title..."
                      className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 font-medium text-slate-900"
                    />
                  </div>

                  {/* Component Breakdown Input Fields */}
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
                    <h3 className="font-display font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                      Assessment Component Breakdown
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-slate-600">Assignment (Max 10)</label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="10"
                          required
                          value={gradeForm.assignment}
                          onChange={(e) => setGradeForm({ ...gradeForm, assignment: Number(e.target.value) })}
                          className="p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-slate-600">CA Test (Max 20)</label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="20"
                          required
                          value={gradeForm.caTest}
                          onChange={(e) => setGradeForm({ ...gradeForm, caTest: Number(e.target.value) })}
                          className="p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-slate-600">Project (Max 10)</label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="10"
                          required
                          value={gradeForm.project}
                          onChange={(e) => setGradeForm({ ...gradeForm, project: Number(e.target.value) })}
                          className="p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-slate-600">Semester Exam (Max 60)</label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="60"
                          required
                          value={gradeForm.exam}
                          onChange={(e) => setGradeForm({ ...gradeForm, exam: Number(e.target.value) })}
                          className="p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                        />
                      </div>
                    </div>

                    {/* Auto Computed Live Summary Box */}
                    {(() => {
                      const total = Math.min(100, Math.max(0, gradeForm.assignment + gradeForm.caTest + gradeForm.project + gradeForm.exam));
                      const grade = total >= 70 ? 'A' : total >= 60 ? 'B' : total >= 50 ? 'C' : total >= 45 ? 'D' : total >= 40 ? 'E' : 'F';
                      const gp = total >= 70 ? 5.0 : total >= 60 ? 4.0 : total >= 50 ? 3.0 : total >= 45 ? 2.0 : total >= 40 ? 1.0 : 0.0;
                      return (
                        <div className="p-4 bg-indigo-900 text-white rounded-xl flex flex-wrap items-center justify-between gap-4 mt-2 shadow-xs">
                          <div>
                            <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block">Computed Total Score</span>
                            <span className="text-2xl font-black font-mono">{total} / 100</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block">Letter Grade</span>
                            <span className="text-xl font-black bg-white/20 px-3 py-0.5 rounded-lg border border-white/20">{grade}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block">Grade Point</span>
                            <span className="text-xl font-black font-mono">{gp.toFixed(1)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block">Quality Points</span>
                            <span className="text-xl font-black font-mono">{(gp * gradeForm.units).toFixed(1)}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isSubmittingGrade}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-display font-bold px-8 py-3 rounded-xl transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                    >
                      {isSubmittingGrade ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      <span>{isSubmittingGrade ? "Saving Grade..." : "Submit & Save Grade Record"}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Roster of Saved Student Grades */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 space-y-4 shadow-xs">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-display font-black text-slate-900">Recorded Course Gradebook Roster</h3>
                  <span className="text-xs text-slate-500 font-semibold">{savedGradesList.length} Grade Records</span>
                </div>
                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200">
                        <th className="p-3.5 px-4">Student Matric</th>
                        <th className="p-3.5 px-4">Course</th>
                        <th className="p-3.5 px-4 text-center">Units</th>
                        <th className="p-3.5 px-4 text-center">Assign (10)</th>
                        <th className="p-3.5 px-4 text-center">CA Test (20)</th>
                        <th className="p-3.5 px-4 text-center">Project (10)</th>
                        <th className="p-3.5 px-4 text-center">Exam (60)</th>
                        <th className="p-3.5 px-4 text-center">Total Score</th>
                        <th className="p-3.5 px-4 text-center">Grade</th>
                        <th className="p-3.5 px-4 text-right">GP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {savedGradesList.map((g: any) => (
                        <tr key={g.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 px-4 font-mono font-bold text-slate-900">{g.matricNo}</td>
                          <td className="p-3.5 px-4 font-bold text-indigo-600">{g.courseCode}</td>
                          <td className="p-3.5 px-4 text-center">{g.units}</td>
                          <td className="p-3.5 px-4 text-center text-slate-500 font-mono">{g.assignment}</td>
                          <td className="p-3.5 px-4 text-center text-slate-500 font-mono">{g.caTest}</td>
                          <td className="p-3.5 px-4 text-center text-slate-500 font-mono">{g.project}</td>
                          <td className="p-3.5 px-4 text-center text-slate-500 font-mono">{g.exam}</td>
                          <td className="p-3.5 px-4 text-center font-black text-slate-900 font-mono">{g.score}</td>
                          <td className="p-3.5 px-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded font-black text-[10px] ${
                              g.grade === "A" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                              g.grade === "B" ? "bg-blue-100 text-blue-800 border border-blue-200" :
                              g.grade === "C" ? "bg-amber-100 text-amber-800 border border-amber-200" :
                              "bg-rose-100 text-rose-800 border border-rose-200"
                            }`}>{g.grade}</span>
                          </td>
                          <td className="p-3.5 px-4 text-right font-mono font-bold text-slate-900">{Number(g.gradePoint || 0).toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
