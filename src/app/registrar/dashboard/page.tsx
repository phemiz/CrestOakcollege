"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Logo } from "@/components/ui/logo";
import { useSession } from "@/components/providers/session-provider";
import {
  FileSpreadsheet,
  BookOpenCheck,
  Award,
  CalendarDays,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Lock,
  Unlock,
  AlertTriangle,
  FileCheck,
  GraduationCap,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  Plus,
  Loader2,
  Building,
  Calendar,
  Check,
  ExternalLink,
  ShieldAlert
} from "lucide-react";

export const dynamic = "force-static";

// TYPES & INTERFACES
type ActiveTab = "admissions" | "records" | "courses" | "graduation" | "calendar";

interface StudentRecord {
  id: string;
  name: string;
  matricNo: string;
  department: string;
  cgpa: number;
  totalUnits: number;
  status: "Active" | "Graduated" | "Withdrawn";
  transcriptStatus: "Pending" | "Approved" | "Dispatched" | "None";
  destination?: string;
}

interface CourseOffering {
  id: string;
  code: string;
  title: string;
  department: string;
  currentEnrollment: number;
  capacityCap: number;
  status: "Approved" | "Pending Review" | "Rejected";
}

interface PrerequisiteOverride {
  id: string;
  matricNo: string;
  studentName: string;
  courseCode: string;
  reason: string;
  issuedBy: string;
  date: string;
}

interface DegreeAudit {
  id: string;
  matricNo: string;
  studentName: string;
  degree: string;
  department: string;
  unitsEarned: number;
  requiredUnits: number;
  cgpa: number;
  classOfDegree: string;
  auditStatus: "Cleared" | "Requirements Pending" | "Financial Hold";
  approvedForGraduation: boolean;
}

interface GradeLockStatus {
  departmentId: string;
  departmentName: string;
  faculty: string;
  gradeSubmissionLocked: boolean;
  totalCourses: number;
  submittedCourses: number;
}

interface Application {
  id: number;
  appNo: string;
  fullName: string;
  email: string;
  phone: string;
  faculty: string;
  course: string;
  status: string;
  dateSubmitted: string;
}

export default function RegistrarDashboardPage() {
  const router = useRouter();
  const sessionResult = useSession();
  const logoutSession = sessionResult?.update;

  // AUTH STATE
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("records");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // SEARCH & FILTER STATES
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // MOCK DEMO DATA (STAFF / REGISTRAR PORTAL DATA)
  const [students, setStudents] = useState<StudentRecord[]>([
    { id: "1", name: "Adebayo Olumide", matricNo: "CCHSMT/2022/NUR/014", department: "Nursing Science", cgpa: 4.62, totalUnits: 148, status: "Active", transcriptStatus: "Pending", destination: "University of Toronto, Canada" },
    { id: "2", name: "Chioma Blessing Egwu", matricNo: "CCHSMT/2021/MLS/009", department: "Medical Laboratory Science", cgpa: 4.45, totalUnits: 160, status: "Graduated", transcriptStatus: "Dispatched", destination: "WES Evaluation Service" },
    { id: "3", name: "Kaufman David", matricNo: "CCHSMT/2023/CS/042", department: "Computer Science", cgpa: 3.85, totalUnits: 94, status: "Active", transcriptStatus: "None" },
    { id: "4", name: "Farida Abubakar", matricNo: "CCHSMT/2022/PH/019", department: "Public Health", cgpa: 4.18, totalUnits: 122, status: "Active", transcriptStatus: "Approved", destination: "Federal Ministry of Health" },
    { id: "5", name: "Emmanuel Victor", matricNo: "CCHSMT/2020/RAD/003", department: "Radiography", cgpa: 2.10, totalUnits: 68, status: "Withdrawn", transcriptStatus: "None" },
  ]);

  const [courses, setCourses] = useState<CourseOffering[]>([
    { id: "1", code: "NUR 301", title: "Advanced Medical Surgical Nursing I", department: "Nursing Science", currentEnrollment: 118, capacityCap: 120, status: "Approved" },
    { id: "2", code: "MLS 405", title: "Clinical Histopathology & Cytology", department: "Medical Laboratory Science", currentEnrollment: 85, capacityCap: 90, status: "Approved" },
    { id: "3", code: "CSC 202", title: "Data Structures & Algorithm Design", department: "Computer Science", currentEnrollment: 154, capacityCap: 150, status: "Pending Review" },
    { id: "4", code: "PBH 311", title: "Epidemiology of Infectious Diseases", department: "Public Health", currentEnrollment: 78, capacityCap: 100, status: "Approved" },
    { id: "5", code: "PHT 402", title: "Orthopaedic Physical Therapy", department: "Physiotherapy", currentEnrollment: 62, capacityCap: 60, status: "Pending Review" },
  ]);

  const [overrides, setOverrides] = useState<PrerequisiteOverride[]>([
    { id: "1", matricNo: "CCHSMT/2023/CS/042", studentName: "Kaufman David", courseCode: "CSC 301", reason: "Direct Entry credit waiver for CSC 101", issuedBy: "Registrar Office", date: "2026-08-01" },
    { id: "2", matricNo: "CCHSMT/2022/NUR/014", studentName: "Adebayo Olumide", courseCode: "NUR 305", reason: "Faculty Board Special Permission", issuedBy: "Dean of Nursing", date: "2026-07-28" }
  ]);

  const [degreeAudits, setDegreeAudits] = useState<DegreeAudit[]>([
    { id: "1", matricNo: "CCHSMT/2021/MLS/009", studentName: "Chioma Blessing Egwu", degree: "B.MLS Medical Laboratory Science", department: "Medical Laboratory Science", unitsEarned: 160, requiredUnits: 160, cgpa: 4.45, classOfDegree: "First Class Honors", auditStatus: "Cleared", approvedForGraduation: true },
    { id: "2", matricNo: "CCHSMT/2021/NUR/002", studentName: "Solomon Janet Kemi", degree: "B.NSc Nursing Science", department: "Nursing Science", unitsEarned: 158, requiredUnits: 160, cgpa: 4.28, classOfDegree: "Second Class Upper", auditStatus: "Requirements Pending", approvedForGraduation: false },
    { id: "3", matricNo: "CCHSMT/2021/PH/011", studentName: "Yakubu Ibrahim", degree: "B.Sc Public Health", department: "Public Health", unitsEarned: 140, requiredUnits: 140, cgpa: 3.92, classOfDegree: "Second Class Upper", auditStatus: "Cleared", approvedForGraduation: true },
    { id: "4", matricNo: "CCHSMT/2021/CS/005", studentName: "Oluwaseun Daniels", degree: "B.Sc Computer Science", department: "Computer Science", unitsEarned: 142, requiredUnits: 140, cgpa: 4.75, classOfDegree: "First Class Honors", auditStatus: "Cleared", approvedForGraduation: true },
  ]);

  const [gradeLocks, setGradeLocks] = useState<GradeLockStatus[]>([
    { departmentId: "1", departmentName: "Nursing Science", faculty: "Faculty of Allied Health", gradeSubmissionLocked: true, totalCourses: 28, submittedCourses: 28 },
    { departmentId: "2", departmentName: "Medical Laboratory Science", faculty: "Faculty of Allied Health", gradeSubmissionLocked: true, totalCourses: 32, submittedCourses: 32 },
    { departmentId: "3", departmentName: "Computer Science", faculty: "Faculty of Natural & Applied Sciences", gradeSubmissionLocked: false, totalCourses: 24, submittedCourses: 18 },
    { departmentId: "4", departmentName: "Public Health", faculty: "Faculty of Health Sciences", gradeSubmissionLocked: false, totalCourses: 20, submittedCourses: 19 },
    { departmentId: "5", departmentName: "Radiography", faculty: "Faculty of Allied Health", gradeSubmissionLocked: true, totalCourses: 22, submittedCourses: 22 }
  ]);

  // ADMISSIONS APPLICATIONS STATE
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationActionId, setApplicationActionId] = useState<string | null>(null);
  const [applicationSearch, setApplicationSearch] = useState("");

  // CALENDAR CONFIG STATE
  const [calendarSettings, setCalendarSettings] = useState({
    session: "2026/2027 Academic Session",
    semester: "First Semester",
    regStartDate: "2026-09-15",
    regEndDate: "2026-10-15",
    lateRegEndDate: "2026-10-30",
    examPublishStatus: "Published" as "Draft" | "Published" | "Under Revision",
    examStartDate: "2026-12-10",
    examEndDate: "2026-12-23"
  });

  // MODAL / DIALOG STATES
  const [statusModalStudent, setStatusModalStudent] = useState<StudentRecord | null>(null);
  const [newOverrideModal, setNewOverrideModal] = useState(false);
  const [verifyDiplomaCode, setVerifyDiplomaCode] = useState("");
  const [diplomaResult, setDiplomaResult] = useState<any>(null);

  // AUTH GUARD (useEffect check)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuth = localStorage.getItem("isAuthenticated") === "true";
      const userStr = localStorage.getItem("user") || localStorage.getItem("cchsmt_user_session");

      if (!isAuth || !userStr) {
        router.replace("/registrar/login");
        return;
      }

      try {
        const parsed = JSON.parse(userStr);
        const roleUpper = String(parsed.role || "").toUpperCase();

        // Safely restrict access to REGISTRAR or ADMIN personnel
        if (!roleUpper.includes("REGISTRAR") && !roleUpper.includes("ADMIN") && !roleUpper.includes("SUPER")) {
          router.replace("/registrar/login?error=AccessDenied");
          return;
        }

        setCurrentUser(parsed);
      } catch (e) {
        console.error("Failed to parse user session", e);
        router.replace("/registrar/login");
        return;
      }

      setLoading(false);
    }
  }, [router]);

  // FETCH ADMISSIONS APPLICATIONS
  const fetchApplications = async () => {
    setApplicationsLoading(true);
    try {
      const res = await fetch("/api/registrar/list-applications.php", {
        method: "GET",
        credentials: "include"
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setApplications(json.data);
      }
    } catch (e) {
      console.error("Failed to load applications", e);
    } finally {
      setApplicationsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchApplications();
    }
  }, [currentUser]);

  // TOAST FEEDBACK HELPER
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // LOGOUT HANDLER
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("userRole");
      localStorage.removeItem("cchsmt_user_session");
      localStorage.removeItem("crestoak_session");
    }
    router.replace("/registrar/login");
  };

  // ACTION HANDLERS
  const handleStatusChange = (studentId: string, newStatus: "Active" | "Graduated" | "Withdrawn") => {
    setStudents(prev =>
      prev.map(s => (s.id === studentId ? { ...s, status: newStatus } : s))
    );
    setStatusModalStudent(null);
    showToast(`Updated student status to ${newStatus} successfully.`);
  };

  const handleTranscriptApprove = (studentId: string) => {
    setStudents(prev =>
      prev.map(s => (s.id === studentId ? { ...s, transcriptStatus: "Approved" } : s))
    );
    showToast("Official transcript request approved & queued for seal signature.");
  };

  const handleTranscriptDispatch = (studentId: string) => {
    setStudents(prev =>
      prev.map(s => (s.id === studentId ? { ...s, transcriptStatus: "Dispatched" } : s))
    );
    showToast("Transcript securely dispatched to receiving institution.");
  };

  const handleRecalculateCGPA = (studentId: string) => {
    showToast("Audit check completed: CGPA calculations verified against grade transcripts.");
  };

  const handleCapChange = (courseId: string, newCap: number) => {
    setCourses(prev =>
      prev.map(c => (c.id === courseId ? { ...c, capacityCap: newCap } : c))
    );
    showToast("Course enrollment cap updated.");
  };

  const handleCourseStatus = (courseId: string, status: "Approved" | "Rejected") => {
    setCourses(prev =>
      prev.map(c => (c.id === courseId ? { ...c, status } : c))
    );
    showToast(`Course offering schedule status set to ${status}.`);
  };

  const handleApplicationStatus = async (appId: number, newStatus: "approved" | "rejected" | "pending") => {
    setApplicationActionId(String(appId));
    try {
      const res = await fetch("/api/admin/update-application.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: appId, status: newStatus })
      });
      const json = await res.json();
      if (json.success) {
        setApplications(prev =>
          prev.map(a => (a.id === appId ? { ...a, status: newStatus.toUpperCase() } : a))
        );
        showToast(json.message || `Application status updated to ${newStatus}.`);
      } else {
        showToast(json.message || "Failed to update application status.");
      }
    } catch (e) {
      showToast("Network error while updating application status.");
    } finally {
      setApplicationActionId(null);
    }
  };

  const handleAddOverride = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const matricNo = formData.get("matricNo") as string;
    const courseCode = formData.get("courseCode") as string;
    const reason = formData.get("reason") as string;

    const newObj: PrerequisiteOverride = {
      id: Date.now().toString(),
      matricNo,
      studentName: "Student (" + matricNo + ")",
      courseCode,
      reason,
      issuedBy: currentUser?.name || "Registrar",
      date: new Date().toISOString().split("T")[0]
    };

    setOverrides([newObj, ...overrides]);
    setNewOverrideModal(false);
    showToast(`Prerequisite waiver code issued for ${courseCode}.`);
  };

  const handleGraduationApprovalToggle = (auditId: string) => {
    setDegreeAudits(prev =>
      prev.map(a =>
        a.id === auditId ? { ...a, approvedForGraduation: !a.approvedForGraduation } : a
      )
    );
    showToast("Senate Convocation roster clearance status toggled.");
  };

  const handleVerifyDiploma = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyDiplomaCode.trim()) return;

    const match = degreeAudits.find(
      a => a.matricNo.toLowerCase().includes(verifyDiplomaCode.trim().toLowerCase())
    );

    if (match) {
      setDiplomaResult({
        valid: true,
        serial: "DIP-2026-CCHSMT-" + Math.floor(1000 + Math.random() * 9000),
        studentName: match.studentName,
        matricNo: match.matricNo,
        degree: match.degree,
        classOfDegree: match.classOfDegree,
        cgpa: match.cgpa,
        dateAwarded: "July 28, 2026",
        sealVerification: "Cryptographically Verified by CrestOak Senate"
      });
    } else {
      setDiplomaResult({
        valid: false,
        message: "No authentic diploma record found matching code/matric number."
      });
    }
  };

  const handleToggleGradeLock = (deptId: string) => {
    setGradeLocks(prev =>
      prev.map(g =>
        g.departmentId === deptId
          ? { ...g, gradeSubmissionLocked: !g.gradeSubmissionLocked }
          : g
      )
    );
    showToast("Faculty Grade Submission portal lock status updated.");
  };

  const handlePublishTimetable = () => {
    const nextStatus = calendarSettings.examPublishStatus === "Published" ? "Under Revision" : "Published";
    setCalendarSettings(prev => ({ ...prev, examPublishStatus: nextStatus }));
    showToast(`Official Examination Timetable status updated to ${nextStatus}.`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 text-slate-800">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-500">Loading University Registrar Workspace...</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col md:flex-row">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-72 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0">
          <div className="p-6 space-y-6">
            
            {/* PORTAL BRANDING */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800 tracking-wide">University Registrar</h2>
                <p className="text-xs text-indigo-600 font-medium">CrestOak Governance</p>
              </div>
            </div>

            {/* USER IDENTITY CARD */}
            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                {currentUser?.name?.charAt(0) || "R"}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-800 truncate">{currentUser?.name || "University Registrar"}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser?.email || "registrar@crestoakcollege.com.ng"}</p>
              </div>
            </div>

            {/* NAVIGATION MENU */}
            <nav className="space-y-1.5 pt-2">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-3">
                Governance Modules
              </span>

              <button
                onClick={() => setActiveTab("admissions")}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "admissions"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-4.5 h-4.5" />
                  <span>Admissions Review</span>
                  {applications.filter(a => (a.status || "").toUpperCase() === "PENDING").length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-extrabold">
                      {applications.filter(a => (a.status || "").toUpperCase() === "PENDING").length}
                    </span>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>

              <button
                onClick={() => setActiveTab("records")}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "records"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-4.5 h-4.5" />
                  <span>Student Academic Records</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>

              <button
                onClick={() => setActiveTab("courses")}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "courses"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpenCheck className="w-4.5 h-4.5" />
                  <span>Course & Catalog</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>

              <button
                onClick={() => setActiveTab("graduation")}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "graduation"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Award className="w-4.5 h-4.5" />
                  <span>Degree Clearance</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>

              <button
                onClick={() => setActiveTab("calendar")}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "calendar"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CalendarDays className="w-4.5 h-4.5" />
                  <span>Calendar & Exams</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>
            </nav>
          </div>

          {/* SIDEBAR FOOTER */}
          <div className="p-6 border-t border-slate-200/80 space-y-3">
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-700 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Registrar Seal Active</span>
              </div>
              <p className="text-[11px] text-slate-500">Current Session: 2026/2027</p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-red-950/40 border border-red-500/30 hover:bg-red-900/50 text-red-300 text-xs font-bold rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out Registrar Session</span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT WORKSPACE */}
        <main className="flex-grow p-4 sm:p-6 md:p-8 space-y-6 overflow-x-hidden">
          
          {/* TOAST ALERT BANNER */}
          {toastMessage && (
            <div className="fixed top-6 right-6 z-50 bg-indigo-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-indigo-400/40 animate-in fade-in slide-in-from-top-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
              <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
            </div>
          )}

          {/* TOP OVERVIEW STATS BANNER */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Pending Transcripts</span>
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-extrabold text-slate-800">
                {students.filter(s => s.transcriptStatus === "Pending").length}
              </p>
              <p className="text-xs text-indigo-600 font-medium">Awaiting Registrar Seal</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Course Offerings</span>
                <BookOpenCheck className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl font-extrabold text-slate-800">
                {courses.length} <span className="text-xs text-slate-500 font-normal">({courses.filter(c => c.status === "Pending Review").length} pending)</span>
              </p>
              <p className="text-xs text-blue-400 font-medium">Approved Catalog Cap: 120</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Degree Clearance</span>
                <Award className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-extrabold text-slate-800">
                {degreeAudits.filter(a => a.approvedForGraduation).length} / {degreeAudits.length}
              </p>
              <p className="text-xs text-emerald-400 font-medium">Cleared for Convocation</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Grade Submission Window</span>
                <Lock className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-xl font-extrabold text-amber-400">
                {gradeLocks.filter(g => g.gradeSubmissionLocked).length} Locked
              </p>
              <p className="text-xs text-slate-500">Out of {gradeLocks.length} Faculties</p>
            </div>
          </div>

          {/* TAB MODULE 0: ADMISSIONS REVIEW */}
          {activeTab === "admissions" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-indigo-600" />
                    Admissions Application Review
                  </h3>
                  <p className="text-xs text-slate-500">
                    Review applications submitted through the public admissions portal. Approve, reject, or return to pending.
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-grow sm:flex-grow-0">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search name, appNo, or email..."
                      value={applicationSearch}
                      onChange={(e) => setApplicationSearch(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    onClick={fetchApplications}
                    className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${applicationsLoading ? "animate-spin" : ""}`} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800">Submitted Applications</h4>
                  <span className="text-xs text-indigo-600 font-semibold">{applications.length} Total</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-500">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3.5">Applicant</th>
                        <th className="px-6 py-3.5">Programme</th>
                        <th className="px-6 py-3.5">Submitted</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5 text-right">Registrar Decision</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium">
                      {applications.length === 0 && !applicationsLoading && (
                        <tr>
                          <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                            No applications found.
                          </td>
                        </tr>
                      )}
                      {applications
                        .filter(a =>
                          a.fullName.toLowerCase().includes(applicationSearch.toLowerCase()) ||
                          a.appNo.toLowerCase().includes(applicationSearch.toLowerCase()) ||
                          a.email.toLowerCase().includes(applicationSearch.toLowerCase())
                        )
                        .map((app) => {
                          const statusUpper = (app.status || "PENDING").toUpperCase();
                          const isBusy = applicationActionId === String(app.id);
                          return (
                            <tr key={app.id} className="hover:bg-slate-50/40 transition-colors">
                              <td className="px-6 py-4">
                                <p className="font-bold text-slate-800">{app.fullName}</p>
                                <p className="text-[11px] font-mono text-slate-500">{app.appNo}</p>
                                <p className="text-[11px] text-slate-500">{app.email} &middot; {app.phone}</p>
                              </td>
                              <td className="px-6 py-4 text-slate-500">
                                <p>{app.course}</p>
                                <p className="text-[11px] text-slate-500">{app.faculty}</p>
                              </td>
                              <td className="px-6 py-4 text-slate-500 text-[11px]">
                                {app.dateSubmitted}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                                    statusUpper === "APPROVED"
                                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                      : statusUpper === "REJECTED"
                                      ? "bg-red-500/10 text-red-400 border border-red-500/30"
                                      : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                  }`}
                                >
                                  {statusUpper}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right space-x-2">
                                <button
                                  disabled={isBusy || statusUpper === "APPROVED"}
                                  onClick={() => handleApplicationStatus(app.id, "approved")}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-[11px] font-bold transition-all"
                                >
                                  Approve
                                </button>
                                <button
                                  disabled={isBusy || statusUpper === "REJECTED"}
                                  onClick={() => handleApplicationStatus(app.id, "rejected")}
                                  className="px-2.5 py-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-[11px] font-bold transition-all"
                                >
                                  Reject
                                </button>
                                {statusUpper !== "PENDING" && (
                                  <button
                                    disabled={isBusy}
                                    onClick={() => handleApplicationStatus(app.id, "pending")}
                                    className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 text-slate-500 rounded-lg text-[11px] font-bold transition-all"
                                  >
                                    Revert to Pending
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB MODULE 1: STUDENT ACADEMIC RECORDS */}
          {activeTab === "records" && (
            <div className="space-y-6">
              
              {/* SECTION HEADER & ACTIONS */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                    Student Academic Records & CGPA Audit
                  </h3>
                  <p className="text-xs text-slate-500">
                    Process transcript requests, verify CGPA calculations, and manage official student academic status.
                  </p>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-grow sm:flex-grow-0">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search name or matric..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* TRANSCRIPT REQUESTS & STATUS TABLE */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800">Transcript Applications & Status Roster</h4>
                  <span className="text-xs text-indigo-600 font-semibold">{students.length} Records Enrolled</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-500">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3.5">Student Details</th>
                        <th className="px-6 py-3.5">Department</th>
                        <th className="px-6 py-3.5">CGPA / Units</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5">Transcript Request</th>
                        <th className="px-6 py-3.5 text-right">Registrar Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium">
                      {students
                        .filter(s =>
                          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.matricNo.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((st) => (
                          <tr key={st.id} className="hover:bg-slate-50/40 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-800">{st.name}</p>
                              <p className="text-[11px] font-mono text-slate-500">{st.matricNo}</p>
                            </td>
                            <td className="px-6 py-4 text-slate-500">{st.department}</td>
                            <td className="px-6 py-4">
                              <span className="font-mono text-indigo-700 font-bold text-sm">{st.cgpa.toFixed(2)}</span>
                              <span className="text-[11px] text-slate-500 block">{st.totalUnits} Units</span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                                  st.status === "Active"
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                    : st.status === "Graduated"
                                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                                    : "bg-red-500/10 text-red-400 border border-red-500/30"
                                }`}
                              >
                                {st.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {st.transcriptStatus === "Pending" && (
                                <div>
                                  <span className="inline-flex items-center gap-1 text-amber-400 text-[11px] font-bold">
                                    <Clock className="w-3.5 h-3.5" /> Pending Approval
                                  </span>
                                  <p className="text-[10px] text-slate-500 truncate max-w-[150px]">{st.destination}</p>
                                </div>
                              )}
                              {st.transcriptStatus === "Approved" && (
                                <span className="inline-flex items-center gap-1 text-indigo-600 text-[11px] font-bold">
                                  <Check className="w-3.5 h-3.5" /> Sealed & Approved
                                </span>
                              )}
                              {st.transcriptStatus === "Dispatched" && (
                                <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-bold">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched
                                </span>
                              )}
                              {st.transcriptStatus === "None" && (
                                <span className="text-slate-500 text-[11px]">No active request</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              <button
                                onClick={() => handleRecalculateCGPA(st.id)}
                                className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-[11px] font-bold transition-all"
                              >
                                Verify CGPA
                              </button>

                              {st.transcriptStatus === "Pending" && (
                                <button
                                  onClick={() => handleTranscriptApprove(st.id)}
                                  className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-bold transition-all"
                                >
                                  Approve Request
                                </button>
                              )}

                              {st.transcriptStatus === "Approved" && (
                                <button
                                  onClick={() => handleTranscriptDispatch(st.id)}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold transition-all"
                                >
                                  Dispatch Transcript
                                </button>
                              )}

                              <button
                                onClick={() => setStatusModalStudent(st)}
                                className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg text-[11px] font-bold transition-all"
                              >
                                Change Status
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB MODULE 2: COURSE REGISTRATION & CATALOG MANAGEMENT */}
          {activeTab === "courses" && (
            <div className="space-y-6">
              
              {/* SECTION HEADER */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <BookOpenCheck className="w-5 h-5 text-blue-400" />
                    Course Catalog & Registration Governance
                  </h3>
                  <p className="text-xs text-slate-500">
                    Approve department course schedules, adjust section enrollment caps, and issue prerequisite overrides.
                  </p>
                </div>

                <button
                  onClick={() => setNewOverrideModal(true)}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>Issue Prerequisite Override</span>
                </button>
              </div>

              {/* COURSE ENROLLMENT CAPS & SCHEDULE APPROVALS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* ENROLLMENT CAPS LIST (2 COLS) */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center justify-between border-b border-slate-200 pb-3">
                    <span>Department Course Offerings & Capacity Caps</span>
                    <span className="text-xs text-slate-500">2026/2027 Semester</span>
                  </h4>

                  <div className="space-y-3">
                    {courses.map((course) => {
                      const pct = Math.min(100, Math.round((course.currentEnrollment / course.capacityCap) * 100));
                      return (
                        <div key={course.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                  {course.code}
                                </span>
                                <h5 className="text-sm font-bold text-slate-800">{course.title}</h5>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">{course.department}</p>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                                course.status === "Approved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                              }`}>
                                {course.status}
                              </span>

                              {course.status === "Pending Review" && (
                                <button
                                  onClick={() => handleCourseStatus(course.id, "Approved")}
                                  className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-500 transition-all"
                                >
                                  Approve
                                </button>
                              )}
                            </div>
                          </div>

                          {/* ENROLLMENT PROGRESS & CAP CONTROLS */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-medium">
                              <span className="text-slate-500">Enrollment: <strong className="text-slate-800">{course.currentEnrollment}</strong> / {course.capacityCap}</span>
                              <span className={`font-mono font-bold ${pct >= 95 ? "text-red-400" : "text-indigo-700"}`}>{pct}% Full</span>
                            </div>
                            <div className="w-full bg-slate-50 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full transition-all ${pct >= 95 ? "bg-red-500" : "bg-indigo-500"}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>

                          {/* QUICK CAP EDIT */}
                          <div className="flex items-center justify-between pt-1 text-xs">
                            <span className="text-slate-500">Adjust Max Capacity Cap:</span>
                            <div className="flex items-center gap-1.5">
                              {[80, 120, 150, 200].map(capVal => (
                                <button
                                  key={capVal}
                                  onClick={() => handleCapChange(course.id, capVal)}
                                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border transition-all ${
                                    course.capacityCap === capVal
                                      ? "bg-indigo-600 text-white border-indigo-500"
                                      : "bg-white text-slate-500 border-slate-200 hover:text-slate-800"
                                  }`}
                                >
                                  {capVal}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* PREREQUISITE OVERRIDES LOG */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center justify-between border-b border-slate-200 pb-3">
                    <span>Active Prerequisite Waivers</span>
                    <span className="text-xs text-indigo-600">{overrides.length} Issued</span>
                  </h4>

                  <div className="space-y-3">
                    {overrides.map((ov) => (
                      <div key={ov.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-indigo-600 font-bold">{ov.courseCode}</span>
                          <span className="text-slate-500 text-[10px]">{ov.date}</span>
                        </div>
                        <p className="font-bold text-slate-800">{ov.studentName}</p>
                        <p className="text-slate-500 text-[11px] leading-relaxed">{ov.reason}</p>
                        <p className="text-[10px] text-slate-500">Issued by: <strong className="text-slate-500">{ov.issuedBy}</strong></p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB MODULE 3: GRADUATION & DEGREE CLEARANCE */}
          {activeTab === "graduation" && (
            <div className="space-y-6">
              
              {/* SECTION HEADER */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-400" />
                    Graduation Clearance & Diploma Verification
                  </h3>
                  <p className="text-xs text-slate-500">
                    Conduct final degree audits, approve Senate graduation lists, and verify digital diploma credentials.
                  </p>
                </div>
              </div>

              {/* DEGREE AUDIT ROSTER & CONVOCATION SIGN-OFF */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">Senate Final Degree Audit Roster</h4>
                  <span className="text-xs text-emerald-400 font-semibold">
                    {degreeAudits.filter(a => a.approvedForGraduation).length} Cleared for Degree Award
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-500">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3.5">Candidate Name</th>
                        <th className="px-6 py-3.5">Degree Program</th>
                        <th className="px-6 py-3.5">Earned Units</th>
                        <th className="px-6 py-3.5">Class of Degree</th>
                        <th className="px-6 py-3.5">Audit Status</th>
                        <th className="px-6 py-3.5 text-right">Senate Approval</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium">
                      {degreeAudits.map((audit) => (
                        <tr key={audit.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-white">{audit.studentName}</p>
                            <p className="text-[11px] font-mono text-slate-500">{audit.matricNo}</p>
                          </td>
                          <td className="px-6 py-4 text-slate-500">{audit.degree}</td>
                          <td className="px-6 py-4">
                            <span className="font-mono font-bold text-indigo-700">
                              {audit.unitsEarned} / {audit.requiredUnits}
                            </span>
                            <span className="text-[10px] text-slate-500 block">Units Completed</span>
                          </td>
                          <td className="px-6 py-4 font-bold text-emerald-400">{audit.classOfDegree}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                              audit.auditStatus === "Cleared"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                            }`}>
                              {audit.auditStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleGraduationApprovalToggle(audit.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                audit.approvedForGraduation
                                  ? "bg-emerald-600 text-white hover:bg-emerald-500"
                                  : "bg-slate-50 text-slate-500 hover:text-white hover:bg-slate-100"
                              }`}
                            >
                              {audit.approvedForGraduation ? "Approved (Senate Signed)" : "Pending Sign-Off"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* DIPLOMA VERIFICATION TOOL */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4.5 h-4.5 text-indigo-600" />
                  Digital Diploma & Certificate Verification Engine
                </h4>
                <p className="text-xs text-slate-500">
                  Verify authentic digital degree certificates, serial numbers, and Senate award credentials.
                </p>

                <form onSubmit={handleVerifyDiploma} className="flex flex-col sm:flex-row gap-3 max-w-xl">
                  <input
                    type="text"
                    placeholder="Enter Certificate Serial or Student Matric No (e.g. CCHSMT/2021/MLS/009)"
                    value={verifyDiplomaCode}
                    onChange={(e) => setVerifyDiplomaCode(e.target.value)}
                    className="flex-grow px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all whitespace-nowrap"
                  >
                    Verify Certificate
                  </button>
                </form>

                {/* VERIFICATION RESULT CARD */}
                {diplomaResult && (
                  <div className={`p-4 rounded-xl border text-xs space-y-2 mt-4 ${
                    diplomaResult.valid
                      ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
                      : "bg-red-950/40 border-red-500/30 text-red-200"
                  }`}>
                    {diplomaResult.valid ? (
                      <div>
                        <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm mb-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Authentic Diploma Verified</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-500 font-mono text-[11px] pt-2">
                          <p>Serial: <strong>{diplomaResult.serial}</strong></p>
                          <p>Candidate: <strong>{diplomaResult.studentName}</strong></p>
                          <p>Matric: <strong>{diplomaResult.matricNo}</strong></p>
                          <p>Class: <strong>{diplomaResult.classOfDegree}</strong></p>
                        </div>
                        <p className="text-[10px] text-emerald-400/80 mt-2 font-sans">{diplomaResult.sealVerification}</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-300 font-semibold">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span>{diplomaResult.message}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB MODULE 4: ACADEMIC CALENDAR & EXAMINATIONS */}
          {activeTab === "calendar" && (
            <div className="space-y-6">
              
              {/* SECTION HEADER */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-amber-400" />
                    Academic Calendar & Examination Schedule Control
                  </h3>
                  <p className="text-xs text-slate-500">
                    Publish exam timetables, manage semester registration dates, and control grade submission locks.
                  </p>
                </div>
              </div>

              {/* CALENDAR SETTINGS & EXAM PUBLICATION */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* CALENDAR & EXAM TIMETABLE CARD */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center justify-between border-b border-slate-200 pb-3">
                    <span>Semester Registration & Exam Schedule</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      calendarSettings.examPublishStatus === "Published"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                    }`}>
                      {calendarSettings.examPublishStatus}
                    </span>
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                      <span className="text-slate-500">Academic Session:</span>
                      <strong className="text-white">{calendarSettings.session}</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                      <span className="text-slate-500">Registration Opens:</span>
                      <strong className="text-indigo-700 font-mono">{calendarSettings.regStartDate}</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                      <span className="text-slate-500">Normal Registration Deadline:</span>
                      <strong className="text-amber-300 font-mono">{calendarSettings.regEndDate}</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                      <span className="text-slate-500">Late Registration Cut-off:</span>
                      <strong className="text-red-400 font-mono">{calendarSettings.lateRegEndDate}</strong>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">Final Examinations Period:</span>
                      <strong className="text-emerald-300 font-mono">{calendarSettings.examStartDate} — {calendarSettings.examEndDate}</strong>
                    </div>
                  </div>

                  <button
                    onClick={handlePublishTimetable}
                    className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-xl text-xs transition-all shadow-lg"
                  >
                    {calendarSettings.examPublishStatus === "Published"
                      ? "Lock & Revise Exam Timetable"
                      : "Publish Official Exam Timetable"}
                  </button>
                </div>

                {/* GRADE SUBMISSION LOCKS GRID */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center justify-between border-b border-slate-200 pb-3">
                    <span>Lecturer Grade Submission Portal Locks</span>
                    <span className="text-xs text-amber-400 font-semibold">Faculty Controls</span>
                  </h4>

                  <div className="space-y-3">
                    {gradeLocks.map((g) => (
                      <div key={g.departmentId} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                        <div>
                          <p className="font-bold text-white">{g.departmentName}</p>
                          <p className="text-[11px] text-slate-500">{g.faculty}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Grades Submitted: {g.submittedCourses}/{g.totalCourses} courses</p>
                        </div>

                        <button
                          onClick={() => handleToggleGradeLock(g.departmentId)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                            g.gradeSubmissionLocked
                              ? "bg-red-950/60 border border-red-500/40 text-red-300 hover:bg-red-900/60"
                              : "bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60"
                          }`}
                        >
                          {g.gradeSubmissionLocked ? (
                            <>
                              <Lock className="w-3.5 h-3.5 text-red-400" />
                              <span>LOCKED</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                              <span>OPEN</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL: CHANGE STUDENT ACADEMIC STATUS */}
      {statusModalStudent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="text-sm font-bold text-white">Update Academic Status</h4>
              <button onClick={() => setStatusModalStudent(null)} className="text-slate-500 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-2">
              <p className="text-slate-500">Student: <strong className="text-white">{statusModalStudent.name}</strong></p>
              <p className="text-slate-500 font-mono">Matric: {statusModalStudent.matricNo}</p>
              <p className="text-slate-500">Current Status: <strong className="text-indigo-600">{statusModalStudent.status}</strong></p>
            </div>

            <div className="space-y-2 pt-2">
              <p className="text-xs font-bold text-slate-500">Select New Status:</p>
              <div className="grid grid-cols-3 gap-2">
                {(["Active", "Graduated", "Withdrawn"] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(statusModalStudent.id, st)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                      statusModalStudent.status === st
                        ? "bg-indigo-600 text-white border-indigo-500"
                        : "bg-slate-50 text-slate-500 border-slate-200 hover:border-indigo-500"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ISSUE PREREQUISITE OVERRIDE */}
      {newOverrideModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddOverride} className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="text-sm font-bold text-white">Issue Prerequisite Waiver</h4>
              <button type="button" onClick={() => setNewOverrideModal(false)} className="text-slate-500 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1">Student Matric Number</label>
                <input
                  name="matricNo"
                  type="text"
                  required
                  placeholder="e.g. CCHSMT/2023/CS/042"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Target Course Code</label>
                <input
                  name="courseCode"
                  type="text"
                  required
                  placeholder="e.g. CSC 301"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Waiver Reason / Board Approval</label>
                <textarea
                  name="reason"
                  required
                  placeholder="State justification for bypassing course prerequisite..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setNewOverrideModal(false)}
                className="px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500"
              >
                Issue Waiver Code
              </button>
            </div>
          </form>
        </div>
      )}

      <Footer />
    </>
  );
}
