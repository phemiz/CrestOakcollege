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
  Loader2,
  RefreshCw,
  AlertCircle
} from "lucide-react";

interface LiveCourse {
  code: string;
  title: string;
  name: string;
  units: number;
  department: string;
  enrolledCount: number;
  students: number;
  schedule: string;
  room: string;
}

interface GradeRecord {
  id: string;
  matricNo: string;
  courseCode: string;
  courseTitle: string;
  units: number;
  semester: string;
  session: string;
  assignment: number;
  caTest: number;
  project: number;
  exam: number;
  score: number;
  grade: string;
  gradePoint: number;
  qualityPoints: number;
  recordedBy: string;
  updatedAt: string;
}

export default function StaffDashboard() {
  const [isClient, setIsClient] = useState(false);
  const [localUser, setLocalUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  // Live data state
  const [liveCourses, setLiveCourses] = useState<LiveCourse[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState("");

  // Grade Management Form State
  const [gradeForm, setGradeForm] = useState({
    matricNo: "",
    courseCode: "",
    courseTitle: "",
    units: 3,
    semester: "First Semester, 2025/2026",
    session: "2025/2026",
    assignment: 0,
    caTest: 0,
    project: 0,
    exam: 0
  });
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);
  const [gradeSuccessMsg, setGradeSuccessMsg] = useState("");
  const [savedGradesList, setSavedGradesList] = useState<GradeRecord[]>([]);
  const [gradesLoading, setGradesLoading] = useState(false);

  // Total enrolled across all courses (for overview)
  const totalEnrolled = liveCourses.reduce((sum, c) => sum + (c.students || c.enrolledCount || 0), 0);

  const fetchLiveCourses = async (user: any) => {
    if (!user) return;
    setCoursesLoading(true);
    setCoursesError("");
    const sin = user.sin ?? user.staffNo ?? user.staffId ?? user.username ?? "";
    const email = user.email ?? "";
    const params = new URLSearchParams();
    if (sin) params.set("sin", sin);
    else if (email) params.set("email", email);
    try {
      const res = await fetch(`/api/staff/courses.php?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.courses)) {
        setLiveCourses(data.courses);
      } else {
        setCoursesError("Could not load courses from server.");
      }
    } catch {
      setCoursesError("Network error fetching courses.");
    } finally {
      setCoursesLoading(false);
    }
  };

  const fetchSavedGrades = async (user: any) => {
    setGradesLoading(true);
    const sin = user?.sin ?? user?.staffNo ?? "";
    const email = user?.email ?? "";
    const params = new URLSearchParams();
    if (sin) params.set("sin", sin);
    else if (email) params.set("email", email);
    try {
      const res = await fetch(`/api/staff/gradebook.php?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.grades)) {
        setSavedGradesList(data.grades);
      }
    } catch {
      // Fallback to admin grades endpoint
      try {
        const res2 = await fetch("/api/admin/grades.php");
        const d2 = await res2.json();
        if (d2.success && Array.isArray(d2.grades)) setSavedGradesList(d2.grades);
      } catch {}
    } finally {
      setGradesLoading(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("isAuthenticated") === "true";
      const userStr = localStorage.getItem("user") || localStorage.getItem("cchsmt_user_session");
      let parsedUser: any = null;
      if (auth && userStr) {
        try {
          parsedUser = JSON.parse(userStr);
          setLocalUser(parsedUser);
          setIsAuthenticated(true);
        } catch {}
      } else if (auth) {
        setIsAuthenticated(true);
      }

      const activeUser = parsedUser || (session?.user as any);
      if (activeUser) {
        fetchLiveCourses(activeUser);
        fetchSavedGrades(activeUser);
      } else {
        // Still try to fetch all grades without filter
        fetchSavedGrades(null);
      }
    }
  }, []);

  // Also re-fetch when session loads
  useEffect(() => {
    if (session?.user && liveCourses.length === 0) {
      fetchLiveCourses(session.user as any);
      fetchSavedGrades(session.user as any);
    }
  }, [session]);

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingGrade(true);
    setGradeSuccessMsg("");

    const activeUser = (session?.user as any) || localUser;

    try {
      const res = await fetch("/api/staff/gradebook.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_grade",
          ...gradeForm,
          sin: activeUser?.sin ?? activeUser?.staffNo ?? "",
          email: activeUser?.email ?? "",
          lecturerName: activeUser?.name ?? activeUser?.firstName ?? "Lecturer",
          recordedBy: activeUser?.name ?? activeUser?.email ?? "Lecturer"
        })
      });
      const data = await res.json();
      if (data.success) {
        setGradeSuccessMsg(`✔ Grade saved! Student CGPA updated to ${data.calculatedCgpa}`);
        // Refresh grade list
        await fetchSavedGrades(activeUser);
        // Reset score fields only (preserve matric/course for quick repeated entry)
        setGradeForm(prev => ({ ...prev, assignment: 0, caTest: 0, project: 0, exam: 0 }));
      } else {
        alert("Error saving grade: " + (data.message || "Save failed."));
      }
    } catch (err: any) {
      // Fallback to old admin endpoint
      try {
        const res2 = await fetch("/api/admin/grades.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "save_grade",
            ...gradeForm,
            recordedBy: activeUser?.name || "Lecturer"
          })
        });
        const d2 = await res2.json();
        if (d2.success) {
          setGradeSuccessMsg(`✔ Grade saved! CGPA updated to ${d2.calculatedCgpa}`);
          await fetchSavedGrades(activeUser);
        } else {
          alert("Error saving grade: " + (d2.message || "Save failed."));
        }
      } catch {
        alert("Network error: " + err.message);
      }
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

  const effectiveUser = (session?.user as any) || localUser || {
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

  // Summary tasks derived from live data
  const tasks = [
    { id: 1, title: `Submit Grade Sheets for ${liveCourses.length} Course${liveCourses.length !== 1 ? "s" : ""}`, deadline: "Ongoing", priority: "high" as const, status: "pending" as const },
    { id: 2, title: "Approve Student Course Registrations", deadline: "In 5 days", priority: "medium" as const, status: "pending" as const },
    { id: 3, title: "Upload Course Syllabi for Registered Courses", deadline: "Completed", priority: "low" as const, status: "completed" as const },
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
                {liveCourses.length > 0 && (
                  <span className="ml-auto bg-indigo-100 text-indigo-700 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                    {liveCourses.length}
                  </span>
                )}
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
                {savedGradesList.length > 0 && (
                  <span className="ml-auto bg-emerald-100 text-emerald-700 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                    {savedGradesList.length}
                  </span>
                )}
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
              {liveCourses.length > 0 && (
                <div className="bg-white/10 backdrop-blur-xs text-white px-3.5 py-1.5 rounded-full border border-white/15">
                  Courses: <span className="text-emerald-300 font-bold">{liveCourses.length} Allocated</span>
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
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Students</p>
                    <h3 className="text-3xl font-display font-black text-slate-900 mt-2">
                      {coursesLoading ? "..." : totalEnrolled > 0 ? totalEnrolled : "—"}
                    </h3>
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-xs text-slate-500 mt-4 flex items-center gap-1.5 font-medium">
                  <span className="text-emerald-600 font-bold">Across all your courses</span>
                </div>
              </div>

              {/* Stat Card 2 */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Assigned Courses</p>
                    <h3 className="text-3xl font-display font-black text-slate-900 mt-2">
                      {coursesLoading ? (
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mt-2" />
                      ) : (
                        liveCourses.length || "0"
                      )}
                    </h3>
                  </div>
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-xs text-slate-500 mt-4 font-medium">
                  {coursesLoading ? "Loading from server..." : liveCourses.length > 0 ? "Live from staff records" : "No courses allocated yet"}
                </div>
              </div>

              {/* Stat Card 3 */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Grade Records</p>
                    <h3 className="text-3xl font-display font-black text-slate-900 mt-2">
                      {savedGradesList.length}
                    </h3>
                  </div>
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-xs text-slate-500 mt-4 font-medium">
                  Recorded in gradebook
                </div>
              </div>

              {/* Weekly Schedule & Pending Tasks */}
              <div className="md:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-xs">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-display font-black text-slate-900">Course Schedule</h3>
                  <button
                    onClick={() => fetchLiveCourses(effectiveUser)}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-bold cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Refresh
                  </button>
                </div>

                {coursesLoading ? (
                  <div className="flex items-center justify-center py-8 gap-2 text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-xs font-medium">Loading courses...</span>
                  </div>
                ) : coursesError ? (
                  <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 p-3 rounded-xl border border-red-100">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{coursesError}</span>
                  </div>
                ) : liveCourses.length === 0 ? (
                  <p className="text-xs text-slate-400 font-medium text-center py-6">
                    No courses allocated yet. Contact admin to assign courses to your profile.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {liveCourses.map((course) => (
                      <div key={course.code} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <span className="text-xs font-bold text-indigo-600 uppercase">{course.code}</span>
                          <h4 className="text-sm font-bold text-slate-900 mt-0.5">{course.title || course.name}</h4>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                            {course.units} Credit Units • {course.department}
                          </p>
                        </div>
                        <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200 font-semibold whitespace-nowrap">
                          {course.students || course.enrolledCount || 0} Students enrolled
                        </span>
                      </div>
                    ))}
                  </div>
                )}
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
                  <p className="text-slate-500 text-xs mt-1 font-medium">
                    Live data from staff records — {liveCourses.length} course{liveCourses.length !== 1 ? "s" : ""} allocated
                  </p>
                </div>
                <button
                  onClick={() => fetchLiveCourses(effectiveUser)}
                  disabled={coursesLoading}
                  className="flex items-center gap-2 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold px-4 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${coursesLoading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>

              {coursesLoading ? (
                <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                  <span className="text-sm font-medium">Loading your courses from the server...</span>
                </div>
              ) : coursesError ? (
                <div className="flex items-center gap-3 text-red-600 text-sm bg-red-50 p-4 rounded-2xl border border-red-100">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="font-bold">Could not load courses</p>
                    <p className="text-xs font-medium mt-0.5">{coursesError}</p>
                  </div>
                </div>
              ) : liveCourses.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-bold text-sm">No courses allocated</p>
                  <p className="text-xs mt-1">Contact the admin to assign courses to your staff profile.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {liveCourses.map((course) => (
                    <div key={course.code} className="bg-slate-50 border border-slate-200 p-6 rounded-2xl hover:border-slate-300 transition-all group">
                      <div className="flex justify-between items-start">
                        <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                          {course.code}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">{course.units} Units</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-4 group-hover:text-indigo-600 transition-colors">
                        {course.title || course.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">{course.department}</p>
                      <div className="mt-6 grid grid-cols-2 gap-4 text-xs border-t border-slate-200 pt-4">
                        <div>
                          <p className="text-slate-500 font-medium">Students</p>
                          <p className="text-sm font-bold text-slate-900 mt-1">
                            {course.students || course.enrolledCount || 0} Enrolled
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 font-medium">Grades Recorded</p>
                          <p className="text-sm font-bold text-slate-900 mt-1">
                            {savedGradesList.filter(g => g.courseCode.replace(/ /g, '') === course.code.replace(/ /g, '')).length}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setGradeForm(prev => ({ ...prev, courseCode: course.code, courseTitle: course.title || course.name, units: course.units || 3 }));
                          setActiveTab("records");
                        }}
                        className="mt-4 w-full text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl transition-colors cursor-pointer"
                      >
                        Enter Grades →
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                      {liveCourses.length > 0 ? (
                        <select
                          required
                          value={gradeForm.courseCode}
                          onChange={(e) => {
                            const selected = liveCourses.find(c => c.code === e.target.value);
                            setGradeForm({ 
                              ...gradeForm, 
                              courseCode: e.target.value,
                              courseTitle: selected?.title || selected?.name || gradeForm.courseTitle,
                              units: selected?.units || gradeForm.units
                            });
                          }}
                          className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 font-bold text-slate-900"
                        >
                          <option value="">— Select Course —</option>
                          {liveCourses.map(c => (
                            <option key={c.code} value={c.code}>{c.code} — {c.title || c.name}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          required
                          value={gradeForm.courseCode}
                          onChange={(e) => setGradeForm({ ...gradeForm, courseCode: e.target.value })}
                          placeholder="e.g. NUR 101"
                          className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 font-bold uppercase text-slate-900"
                        />
                      )}
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
                          type="number" step="0.5" min="0" max="10" required
                          value={gradeForm.assignment}
                          onChange={(e) => setGradeForm({ ...gradeForm, assignment: Number(e.target.value) })}
                          className="p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-slate-600">CA Test (Max 20)</label>
                        <input
                          type="number" step="0.5" min="0" max="20" required
                          value={gradeForm.caTest}
                          onChange={(e) => setGradeForm({ ...gradeForm, caTest: Number(e.target.value) })}
                          className="p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-slate-600">Project (Max 10)</label>
                        <input
                          type="number" step="0.5" min="0" max="10" required
                          value={gradeForm.project}
                          onChange={(e) => setGradeForm({ ...gradeForm, project: Number(e.target.value) })}
                          className="p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-slate-600">Semester Exam (Max 60)</label>
                        <input
                          type="number" step="0.5" min="0" max="60" required
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
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 font-semibold">{savedGradesList.length} Grade Records</span>
                    <button
                      onClick={() => fetchSavedGrades(effectiveUser)}
                      disabled={gradesLoading}
                      className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-bold cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${gradesLoading ? "animate-spin" : ""}`} />
                      Refresh
                    </button>
                  </div>
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
                      {gradesLoading ? (
                        <tr>
                          <td colSpan={10} className="p-8 text-center">
                            <Loader2 className="w-5 h-5 animate-spin text-indigo-500 mx-auto" />
                          </td>
                        </tr>
                      ) : savedGradesList.length > 0 ? (
                        savedGradesList.map((g) => (
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
                        ))
                      ) : (
                        <tr>
                          <td colSpan={10} className="p-8 text-center text-slate-500 font-bold uppercase tracking-wider text-xs bg-slate-50/50">
                            No recorded course grades in gradebook yet. Enter student component scores above to publish results.
                          </td>
                        </tr>
                      )}
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
