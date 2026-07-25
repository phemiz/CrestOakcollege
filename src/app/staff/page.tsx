"use client";

import React, { useState } from "react";
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
  Plus
} from "lucide-react";

export default function StaffDashboard() {
  const [isClient, setIsClient] = useState(false);
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const status = sessionResult?.status || (isClient ? "unauthenticated" : "loading");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500 border-r-2" />
          <p className="text-slate-400 font-medium">Verifying authorization...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session) {
    // Middleware should have handled this, but display fallback just in case
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold text-red-400">Unauthorized</h1>
          <p className="text-slate-400 mt-2">You must be logged in to view this page.</p>
          <button 
            onClick={() => router.push("/login")}
            className="mt-6 bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded-xl transition-all font-semibold"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const user = session.user;

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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      
      {/* Upper Navigation Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Logo showText={true} lightText={true} size={40} />
          <span className="hidden sm:inline bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
            {user.role} Portal
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-slate-900" />
          </button>
          
          {/* User Profile Info */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-white leading-none">{user.name}</p>
              <p className="text-xs text-slate-400 mt-1">{user.email}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg border border-indigo-500/30">
              {user.name?.charAt(0) || "U"}
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex flex-grow flex-col lg:flex-row">
        
        {/* Sidebar Nav */}
        <aside className="w-full lg:w-64 bg-slate-900 lg:border-r border-slate-800 p-6 space-y-8 shrink-0">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-3">
              Navigation
            </h3>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab("overview")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === "overview"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <GraduationCap className="w-5 h-5" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab("courses")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === "courses"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <BookOpen className="w-5 h-5" />
                My Courses
              </button>
              <button
                onClick={() => setActiveTab("records")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === "records"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <FileSpreadsheet className="w-5 h-5" />
                Gradebook
              </button>
            </nav>
          </div>

          <div className="pt-6 border-t border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-3">
              Account
            </h3>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Content Body */}
        <main className="flex-grow p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full space-y-8">
          
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 border border-indigo-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Welcome Back, {user.name}
            </h1>
            <p className="text-indigo-200 mt-2 max-w-xl text-sm leading-relaxed">
              Managing program modules for the {user.department || "academic"} department. Review student enrollments and update assessment logs.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold">
              <div className="bg-slate-950/40 text-slate-300 px-3.5 py-1.5 rounded-full border border-slate-800/80">
                Department: <span className="text-indigo-400">{user.department || "General Administration"}</span>
              </div>
              {user.faculty && (
                <div className="bg-slate-950/40 text-slate-300 px-3.5 py-1.5 rounded-full border border-slate-800/80">
                  Faculty: <span className="text-indigo-400">{user.faculty}</span>
                </div>
              )}
            </div>
          </div>

          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stat Card 1 */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Active Students</p>
                    <h3 className="text-3xl font-extrabold text-white mt-2">315</h3>
                  </div>
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-xs text-slate-400 mt-4 flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">▲ +12%</span> since last semester
                </div>
              </div>

              {/* Stat Card 2 */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Assigned Courses</p>
                    <h3 className="text-3xl font-extrabold text-white mt-2">3</h3>
                  </div>
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <BookOpen className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-xs text-slate-400 mt-4">
                  Full-time lecturer workload
                </div>
              </div>

              {/* Stat Card 3 */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Academic Calendar</p>
                    <h3 className="text-xl font-bold text-white mt-2">Week 8</h3>
                  </div>
                  <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-xs text-slate-400 mt-4">
                  Midterm examination period
                </div>
              </div>

              {/* Weekly Schedule & Pending Tasks */}
              <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white">Course Schedule</h3>
                  <button className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">View Calendar</button>
                </div>
                <div className="divide-y divide-slate-800">
                  {courses.map((course) => (
                    <div key={course.code} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <span className="text-xs font-bold text-indigo-400 uppercase">{course.code}</span>
                        <h4 className="text-sm font-bold text-white mt-0.5">{course.name}</h4>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" /> {course.schedule} &bull; {course.room}
                        </p>
                      </div>
                      <span className="text-xs bg-slate-950 px-3 py-1 rounded-full border border-slate-800 font-semibold text-slate-300">
                        {course.students} Students enrolled
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checklist Tasks */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white">Tasks & Deadlines</h3>
                  <button className="p-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex gap-3">
                      {task.status === "completed" ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-2 ${
                          task.priority === "high" ? "bg-red-500" : "bg-amber-500"
                        }`} />
                      )}
                      <div>
                        <p className={`text-xs font-semibold ${task.status === "completed" ? "text-slate-500 line-through" : "text-slate-200"}`}>
                          {task.title}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1">
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
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">My Academic Modules</h2>
                  <p className="text-slate-400 text-xs mt-1">Review lecture materials and active course profiles</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search courses..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map((course) => (
                  <div key={course.code} className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl hover:border-slate-700 transition-all group">
                    <div className="flex justify-between items-start">
                      <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                        {course.code}
                      </span>
                      <span className="text-xs text-slate-500">{course.room}</span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-4 group-hover:text-indigo-400 transition-colors">
                      {course.name}
                    </h3>
                    <div className="mt-6 grid grid-cols-2 gap-4 text-xs border-t border-slate-800/60 pt-4">
                      <div>
                        <p className="text-slate-500">Students</p>
                        <p className="text-sm font-bold text-slate-200 mt-1">{course.students} Registered</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Schedule</p>
                        <p className="text-sm font-bold text-slate-200 mt-1">{course.schedule.split(" ")[0]}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "records" && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Gradebook & Approval Log</h2>
                <p className="text-slate-400 text-xs mt-1">Input grades, review assessment sheets, and export transcript logs.</p>
              </div>
              
              <div className="overflow-x-auto border border-slate-850 rounded-2xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-850">
                      <th className="p-4">Module Code</th>
                      <th className="p-4">Module Name</th>
                      <th className="p-4 text-center">Enrolled</th>
                      <th className="p-4">CA Submission</th>
                      <th className="p-4">Exam Submission</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-xs">
                    <tr>
                      <td className="p-4 font-bold text-indigo-400">CSC 201</td>
                      <td className="p-4 text-slate-200">Introduction to Computer Science</td>
                      <td className="p-4 text-center text-slate-300">145</td>
                      <td className="p-4 text-emerald-400 font-semibold">Submitted</td>
                      <td className="p-4 text-amber-400 font-semibold">Pending</td>
                      <td className="p-4">
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold uppercase text-[9px]">
                          In Progress
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-indigo-400">CSC 205</td>
                      <td className="p-4 text-slate-200">Data Structures & Algorithms</td>
                      <td className="p-4 text-center text-slate-300">92</td>
                      <td className="p-4 text-emerald-400 font-semibold">Submitted</td>
                      <td className="p-4 text-emerald-400 font-semibold">Submitted</td>
                      <td className="p-4">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase text-[9px]">
                          Approved
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-indigo-400">CSC 311</td>
                      <td className="p-4 text-slate-200">Software Engineering Principles</td>
                      <td className="p-4 text-center text-slate-300">78</td>
                      <td className="p-4 text-slate-500">Not Started</td>
                      <td className="p-4 text-slate-500">Not Started</td>
                      <td className="p-4">
                        <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full font-bold uppercase text-[9px]">
                          Idle
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
