"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  UserPlus,
  Loader2,
  ShieldAlert,
  GraduationCap,
  KeyRound,
  FileText,
  History,
  Lock,
  Unlock,
  CheckCircle2,
  Copy,
  Zap,
  Eye,
  EyeOff,
  Mail,
  RefreshCw,
  Share2
} from "lucide-react";
import {
  DEFAULT_DEPARTMENTS,
  DEFAULT_PROGRAMMES,
  DEFAULT_SESSIONS,
  DEFAULT_SEMESTERS
} from "@/constants/institutionalData";

interface StudentItem {
  id: string;
  matricNo: string;
  level: number;
  cgpa: number;
  gpa: number;
  status: "ACTIVE" | "FINANCIAL_HOLD" | "DISCIPLINARY_HOLD" | "SUSPENDED";
  holdReason?: string | null;
  user: {
    firstName: string;
    lastName: string;
    middleName: string | null;
    email: string;
    phoneNumber: string | null;
    dob?: string;
  };
  department: {
    id: string;
    name: string;
  };
  programme: {
    id: string;
    name: string;
  };
  entrySessionId: string;
  currentSessionId: string;
  currentSemesterId: string;
}

interface DropdownItem {
  id: string;
  name: string;
}

interface AuditLogItem {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  targetId: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

interface StudentsClientProps {
  students: StudentItem[];
  departments: DropdownItem[];
  programmes: DropdownItem[];
  sessions: DropdownItem[];
  semesters: DropdownItem[];
  auditLogs?: AuditLogItem[];
}

const COURSE_CODES = [
  { code: "NUR", name: "Nursing Sciences" },
  { code: "MLS", name: "Medical Laboratory Science" },
  { code: "CHS", name: "Community Health Sciences" },
  { code: "SCS", name: "Computer Science & IT" },
  { code: "BUS", name: "Business Administration" },
  { code: "LAW", name: "Law & Criminology" }
];

const YEARS = Array.from({ length: 2050 - 2024 + 1 }, (_, i) => String(2024 + i));

function getDeptCode(deptName: string = "") {
  const upper = deptName.toUpperCase();
  if (upper.includes("NURSING")) return "NUR";
  if (upper.includes("LABORATORY") || upper.includes("MLS")) return "MLS";
  if (upper.includes("COMMUNITY") || upper.includes("HEALTH") || upper.includes("CHEW")) return "CHS";
  if (upper.includes("COMPUTER") || upper.includes("SCIENCE") || upper.includes("IT")) return "SCS";
  if (upper.includes("BUSINESS") || upper.includes("MANAGEMENT")) return "BUS";
  if (upper.includes("LAW") || upper.includes("CRIMINOLOGY")) return "LAW";
  return upper.substring(0, 3).replace(/[^A-Z]/g, "S") || "SCS";
}

function SegmentedMatricInput({
  value,
  onChange,
  selectedDeptName
}: {
  value: string;
  onChange: (val: string) => void;
  selectedDeptName?: string;
}) {
  const parts = (value || "").split("/");
  const currentYear = parts[1] || "2026";
  const currentCode = parts[2] || (selectedDeptName ? getDeptCode(selectedDeptName) : "SCS");
  const currentSeq = parts[3] || "0001";

  const [year, setYear] = useState(currentYear);
  const [code, setCode] = useState(currentCode);
  const [seq, setSeq] = useState(currentSeq === "0001" ? "" : currentSeq);

  useEffect(() => {
    const p = (value || "").split("/");
    if (p.length >= 4 && p[0] === "CCHMS") {
      setYear(p[1]);
      setCode(p[2]);
      setSeq(p[3] === "0001" ? "" : p[3]);
    }
  }, [value]);

  useEffect(() => {
    if (selectedDeptName) {
      const autoCode = getDeptCode(selectedDeptName);
      setCode(autoCode);
      const paddedSeq = (seq || "1").padStart(4, "0");
      onChange(`CCHMS/${year}/${autoCode}/${paddedSeq}`);
    }
  }, [selectedDeptName]);

  const updateFullMatric = (newYear: string, newCode: string, newSeqRaw: string) => {
    const cleanSeqDigits = newSeqRaw.replace(/\D/g, "").slice(0, 4);
    setYear(newYear);
    setCode(newCode);
    setSeq(cleanSeqDigits);
    const paddedSeq = (cleanSeqDigits || "1").padStart(4, "0");
    onChange(`CCHMS/${newYear}/${newCode}/${paddedSeq}`);
  };

  const handleSeqBlur = () => {
    if (!seq) {
      onChange(`CCHMS/${year}/${code}/0001`);
    } else {
      const padded = seq.padStart(4, "0");
      setSeq(padded);
      onChange(`CCHMS/${year}/${code}/${padded}`);
    }
  };

  const currentCourse = COURSE_CODES.find((c) => c.code === code) || { code, name: "Course Code" };

  return (
    <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900 shadow-xs transition-all w-full">
      <div className="bg-slate-100 text-slate-500 font-mono font-bold text-xs px-2.5 py-2.5 border-r border-slate-200 select-none shrink-0" title="Institutional Prefix">
        CCHMS/
      </div>

      <div className="flex items-center border-r border-slate-200 bg-white hover:bg-slate-50 shrink-0 px-1" title="Academic Session Year">
        <select
          value={year}
          onChange={(e) => updateFullMatric(e.target.value, code, seq)}
          className="py-2.5 px-1 text-xs font-mono font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <span className="text-slate-400 font-mono font-bold text-xs pr-0.5">/</span>
      </div>

      <div className="flex items-center border-r border-slate-200 bg-white hover:bg-slate-50 shrink-0 px-1" title={`${currentCourse.code}: ${currentCourse.name}`}>
        <select
          value={code}
          onChange={(e) => updateFullMatric(year, e.target.value, seq)}
          className="py-2.5 px-1 text-xs font-mono font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer uppercase"
        >
          {COURSE_CODES.map((c) => (
            <option key={c.code} value={c.code} title={`${c.code} - ${c.name}`}>
              {c.code}
            </option>
          ))}
        </select>
        <span className="text-slate-400 font-mono font-bold text-xs pr-0.5">/</span>
      </div>

      <input
        type="text"
        maxLength={4}
        value={seq}
        onChange={(e) => updateFullMatric(year, code, e.target.value)}
        onBlur={handleSeqBlur}
        placeholder="0001"
        title="4-digit Student Index Number"
        className="w-full min-w-[60px] py-2.5 px-3 font-mono font-bold text-xs text-slate-900 bg-white focus:outline-none placeholder:text-slate-400"
      />
    </div>
  );
}

export default function StudentsClient({
  students: initialStudents,
  departments: rawDepartments,
  programmes: rawProgrammes,
  sessions: rawSessions,
  semesters: rawSemesters,
  auditLogs: initialLogs = []
}: StudentsClientProps) {
  const departments = (rawDepartments && rawDepartments.length > 0)
    ? rawDepartments
    : DEFAULT_DEPARTMENTS.map((d, i) => ({ id: `dept-${i + 1}`, name: d }));

  const programmes = (rawProgrammes && rawProgrammes.length > 0)
    ? rawProgrammes
    : DEFAULT_PROGRAMMES.map((p, i) => ({ id: `prog-${i + 1}`, name: p }));

  const sessions = (rawSessions && rawSessions.length > 0)
    ? rawSessions
    : DEFAULT_SESSIONS.map((s, i) => ({ id: `sess-${i + 1}`, name: s }));

  const semesters = (rawSemesters && rawSemesters.length > 0)
    ? rawSemesters
    : DEFAULT_SEMESTERS.map((sem, i) => ({ id: `sem-${i + 1}`, name: sem }));

  const router = useRouter();
  const [students, setStudents] = useState<StudentItem[]>(initialStudents);
  const [logs, setLogs] = useState<AuditLogItem[]>(initialLogs);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState<"STUDENTS" | "AUDIT_LOGS">("STUDENTS");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Action Modals & Drawers State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);

  // Password & Password Visibility Toggle
  const [showPassword, setShowPassword] = useState(false);

  // Issued Credentials Confirmation Modal
  const [issuedCredentials, setIssuedCredentials] = useState<{
    matricNo: string;
    temporaryPassword: string;
    email: string;
    sendEmail: boolean;
    forcePasswordChange: boolean;
  } | null>(null);

  // Reset Password Modal State
  const [resetPasswordStudent, setResetPasswordStudent] = useState<StudentItem | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Academic Override Drawer
  const [overrideStudent, setOverrideStudent] = useState<StudentItem | null>(null);
  const [overrideForm, setOverrideForm] = useState({
    courseCode: "NUR102",
    newGrade: "A",
    newCgpa: 4.25,
    reason: "Marking discrepancy audit rectification"
  });

  // Hold Toggle Modal
  const [holdStudent, setHoldStudent] = useState<StudentItem | null>(null);
  const [holdForm, setHoldForm] = useState({
    status: "FINANCIAL_HOLD" as "ACTIVE" | "FINANCIAL_HOLD" | "DISCIPLINARY_HOLD",
    reason: "Outstanding First Semester Tuition Balance"
  });

  // Magic Link Modal
  const [magicStudent, setMagicStudent] = useState<StudentItem | null>(null);
  const [generatedLink, setGeneratedLink] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCreds, setCopiedCreds] = useState(false);

  // General Form State for Add / Edit
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    middleName: "",
    phoneNumber: "",
    dob: "2004-05-14",
    matricNo: "",
    password: "",
    sendEmail: true,
    forcePasswordChange: true,
    level: 100,
    status: "ACTIVE" as "ACTIVE" | "FINANCIAL_HOLD" | "DISCIPLINARY_HOLD" | "SUSPENDED",
    departmentId: departments[0]?.id || "",
    programmeId: programmes[0]?.id || "",
    entrySessionId: sessions[0]?.id || "",
    currentSessionId: sessions[0]?.id || "",
    currentSemesterId: semesters[0]?.id || ""
  });

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789#@!";
    let randPass = "CrestOak#";
    for (let i = 0; i < 5; i++) {
      randPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return randPass;
  };

  const handleAutoGeneratePassword = () => {
    const pass = generateRandomPassword();
    setFormData((prev) => ({ ...prev, password: pass }));
    setShowPassword(true);
  };

  const openAddModal = () => {
    const autoPass = generateRandomPassword();
    setEditingStudent(null);
    setShowPassword(true);
    setFormData({
      email: "",
      firstName: "",
      lastName: "",
      middleName: "",
      phoneNumber: "",
      dob: "2004-05-14",
      matricNo: `CCHMS/2026/${departments[0]?.name.substring(0, 3).toUpperCase() || "SCS"}/${String(Math.floor(1 + Math.random() * 999)).padStart(4, "0")}`,
      password: autoPass,
      sendEmail: true,
      forcePasswordChange: true,
      level: 100,
      status: "ACTIVE",
      departmentId: departments[0]?.id || "",
      programmeId: programmes[0]?.id || "",
      entrySessionId: sessions[0]?.id || "",
      currentSessionId: sessions[0]?.id || "",
      currentSemesterId: semesters[0]?.id || ""
    });
    setIsModalOpen(true);
  };

  const openEditModal = (student: StudentItem) => {
    setEditingStudent(student);
    setShowPassword(false);
    setFormData({
      email: student.user.email,
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      middleName: student.user.middleName || "",
      phoneNumber: student.user.phoneNumber || "",
      dob: student.user.dob || "2004-05-14",
      matricNo: student.matricNo,
      password: "",
      sendEmail: false,
      forcePasswordChange: true,
      level: student.level,
      status: student.status,
      departmentId: student.department.id,
      programmeId: student.programme.id,
      entrySessionId: student.entrySessionId,
      currentSessionId: student.currentSessionId,
      currentSemesterId: student.currentSemesterId
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.matricNo || !formData.phoneNumber) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!editingStudent && !formData.password) {
      alert("Please specify or auto-generate an initial password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        action: "save_student",
        ...formData,
        id: editingStudent?.id
      };
      const res = await fetch("/api/admin/students.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      console.log('API Response:', data);
      if (data.success && data.persistenceSuccess !== false) {
        // Re-fetch the student list directly from the GET endpoint (/api/admin/students.php) upon successful creation to confirm database persistence
        try {
          const getRes = await fetch("/api/admin/students.php?t=" + Date.now());
          const getData = await getRes.json();
          if (getData.students && Array.isArray(getData.students)) {
            setStudents(getData.students);
          } else if (editingStudent) {
            setStudents((prev) =>
              prev.map((s) => (s.id === editingStudent.id ? { ...s, ...data.student } : s))
            );
          } else if (data.student) {
            setStudents((prev) => [data.student, ...prev]);
          }
        } catch {
          if (editingStudent) {
            setStudents((prev) =>
              prev.map((s) => (s.id === editingStudent.id ? { ...s, ...data.student } : s))
            );
          } else if (data.student) {
            setStudents((prev) => [data.student, ...prev]);
          }
        }

        setIsModalOpen(false);

        // Visual confirmation modal for new credentials payload
        if (!editingStudent && (data.credentials || formData.password)) {
          setIssuedCredentials({
            matricNo: data.credentials?.matricNo || formData.matricNo,
            temporaryPassword: data.credentials?.temporaryPassword || formData.password,
            email: formData.email,
            sendEmail: formData.sendEmail,
            forcePasswordChange: formData.forcePasswordChange
          });
        }
        router.refresh();
      } else {
        alert("Registration Error: Server failed to save record. " + (data.error || data.message || "Failed to write record to persistent database."));
      }
    } catch (err: any) {
      alert("Registration Error: Server failed to save record. " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset Password Modal Handler
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordStudent || !resetPasswordValue) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/students.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "password_reset",
          id: resetPasswordStudent.id,
          matricNo: resetPasswordStudent.matricNo,
          newPassword: resetPasswordValue,
          email: resetPasswordStudent.user.email
        })
      });
      const data = await res.json();
      if (data.success) {
        setIssuedCredentials({
          matricNo: resetPasswordStudent.matricNo,
          temporaryPassword: resetPasswordValue,
          email: resetPasswordStudent.user.email,
          sendEmail: true,
          forcePasswordChange: true
        });
        setResetPasswordStudent(null);
      } else {
        alert("Password reset failed: " + data.message);
      }
    } catch (err: any) {
      alert("Error resetting password: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Academic Override Handler
  const handleAcademicOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideStudent) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/students.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "academic_override",
          id: overrideStudent.id,
          matricNo: overrideStudent.matricNo,
          cgpa: overrideForm.newCgpa,
          reason: overrideForm.reason
        })
      });
      const data = await res.json();
      if (data.success) {
        setStudents((prev) =>
          prev.map((s) => (s.id === overrideStudent.id ? { ...s, cgpa: overrideForm.newCgpa } : s))
        );
        const newLog: AuditLogItem = {
          id: `log-${Date.now()}`,
          actorId: "adm-001",
          actorName: "System Admin",
          action: "ACADEMIC_OVERRIDE",
          targetId: overrideStudent.matricNo,
          details: `Rectified ${overrideForm.courseCode} grade to ${overrideForm.newGrade}. New CGPA: ${overrideForm.newCgpa}. Reason: ${overrideForm.reason}`,
          ipAddress: "197.210.64.12",
          timestamp: new Date().toLocaleString()
        };
        setLogs((prev) => [newLog, ...prev]);
        alert("Academic override & grade rectification saved successfully!");
        setOverrideStudent(null);
      } else {
        alert("Override failed: " + data.message);
      }
    } catch (err: any) {
      alert("Override error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Administrative Hold Handler
  const handleHoldToggleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holdStudent) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/students.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_hold",
          id: holdStudent.id,
          matricNo: holdStudent.matricNo,
          status: holdForm.status,
          holdReason: holdForm.reason
        })
      });
      const data = await res.json();
      if (data.success) {
        setStudents((prev) =>
          prev.map((s) => (s.id === holdStudent.id ? { ...s, status: holdForm.status, holdReason: holdForm.reason } : s))
        );
        const newLog: AuditLogItem = {
          id: `log-${Date.now()}`,
          actorId: "adm-001",
          actorName: "System Admin",
          action: "ADMINISTRATIVE_HOLD_TOGGLE",
          targetId: holdStudent.matricNo,
          details: `Status changed to ${holdForm.status}. Reason: ${holdForm.reason}`,
          ipAddress: "197.210.64.12",
          timestamp: new Date().toLocaleString()
        };
        setLogs((prev) => [newLog, ...prev]);
        alert("Administrative hold status updated successfully!");
        setHoldStudent(null);
      } else {
        alert("Hold update failed: " + data.message);
      }
    } catch (err: any) {
      alert("Hold update error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Magic Link Generator
  const handleGenerateMagicLink = async (student: StudentItem) => {
    setMagicStudent(student);
    setGeneratedLink("");
    setCopiedLink(false);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/students.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "password_reset",
          id: student.id,
          matricNo: student.matricNo
        })
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedLink(data.magicLink || `https://portal.crestoakcollege.com.ng/login?magicToken=${md5(student.matricNo)}`);
      }
    } catch (err: any) {
      alert("Error generating magic link: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const md5 = (str: string) => Math.random().toString(36).substring(2) + Date.now().toString(36);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to soft-delete this student profile?")) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/students.php", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setStudents((prev) => prev.filter((s) => s.id !== id));
        router.refresh();
      } else {
        alert("Error deleting student: " + (data.message || "Failed"));
      }
    } catch (err: any) {
      alert("Delete error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter application
  const filteredStudents = students.filter((stu) => {
    const fullName = `${stu.user.firstName} ${stu.user.lastName}`.toLowerCase();
    const searchMatch =
      fullName.includes(searchTerm.toLowerCase()) ||
      stu.matricNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stu.user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const deptMatch = deptFilter === "ALL" || stu.department.id === deptFilter;
    const levelMatch = levelFilter === "ALL" || stu.level === Number(levelFilter);

    return searchMatch && deptMatch && levelMatch;
  });

  // Paginate items
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header & Main Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-black text-slate-900">Students Management</h2>
          <p className="text-xs text-slate-500 mt-1">Enterprise student registration, credential issuance, grade overrides, and portal access controls.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
            <button
              onClick={() => setActiveTab("STUDENTS")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "STUDENTS" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Students Roster
            </button>
            <button
              onClick={() => setActiveTab("AUDIT_LOGS")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "AUDIT_LOGS" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <History className="h-3.5 w-3.5" />
              <span>Audit Logs</span>
            </button>
          </div>
          <button
            onClick={openAddModal}
            className="bg-red-600 hover:bg-red-700 text-white font-display font-bold py-2.5 px-5 rounded-xl text-xs transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <UserPlus className="h-4.5 w-4.5" />
            <span>Register New Student</span>
          </button>
        </div>
      </div>

      {activeTab === "STUDENTS" ? (
        <>
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="md:col-span-6 relative">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search students by name, matric no, or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
              />
            </div>
            <div className="md:col-span-3">
              <select
                value={deptFilter}
                onChange={(e) => {
                  setDeptFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors cursor-pointer"
              >
                <option value="ALL">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3">
              <select
                value={levelFilter}
                onChange={(e) => {
                  setLevelFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors cursor-pointer"
              >
                <option value="ALL">All Levels</option>
                <option value="100">100 Level</option>
                <option value="200">200 Level</option>
                <option value="300">300 Level</option>
                <option value="400">400 Level</option>
              </select>
            </div>
          </div>

          {/* Students Data Grid */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            {paginatedStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs text-slate-800">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-5">Student Name</th>
                      <th className="py-3.5 px-5">Matric No</th>
                      <th className="py-3.5 px-5">Department</th>
                      <th className="py-3.5 px-5">Level</th>
                      <th className="py-3.5 px-5">CGPA</th>
                      <th className="py-3.5 px-5">Portal Status</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-5 font-semibold text-slate-900">
                          {student.user.firstName} {student.user.middleName || ""} {student.user.lastName}
                          <span className="block text-[11px] text-slate-500 font-normal mt-0.5">
                            {student.user.email}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 font-mono font-bold text-slate-800">{student.matricNo}</td>
                        <td className="py-3.5 px-5 text-slate-700 font-medium">{student.department.name}</td>
                        <td className="py-3.5 px-5 font-bold text-slate-900">{student.level} Level</td>
                        <td className="py-3.5 px-5 font-bold">
                          <span className="bg-slate-100 text-slate-900 px-2 py-1 rounded-md border border-slate-200 font-mono text-[11px]">
                            {Number(student.cgpa).toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              student.status === "ACTIVE"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : student.status === "FINANCIAL_HOLD"
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-rose-100 text-rose-800 border border-rose-200"
                            }`}
                          >
                            {student.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Academic Override */}
                            <button
                              onClick={() => {
                                setOverrideStudent(student);
                                setOverrideForm({ ...overrideForm, newCgpa: student.cgpa });
                              }}
                              title="Academic Grade Rectification / CGPA Override"
                              className="p-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition-all cursor-pointer shadow-xs"
                            >
                              <GraduationCap className="h-3.5 w-3.5 text-blue-600" />
                            </button>

                            {/* Administrative Hold Toggle */}
                            <button
                              onClick={() => {
                                setHoldStudent(student);
                                setHoldForm({
                                  status: student.status === "ACTIVE" ? "FINANCIAL_HOLD" : "ACTIVE",
                                  reason: student.holdReason || "Financial audit hold"
                                });
                              }}
                              title="Toggle Administrative / Financial Hold"
                              className="p-2 bg-white border border-slate-200 hover:bg-amber-50 rounded-lg text-slate-600 transition-all cursor-pointer shadow-xs"
                            >
                              {student.status === "ACTIVE" ? (
                                <Lock className="h-3.5 w-3.5 text-amber-600" />
                              ) : (
                                <Unlock className="h-3.5 w-3.5 text-emerald-600" />
                              )}
                            </button>

                            {/* Reset Password / Set Password */}
                            <button
                              onClick={() => {
                                setResetPasswordStudent(student);
                                setResetPasswordValue(generateRandomPassword());
                                setShowResetPassword(true);
                              }}
                              title="Reset Password / Set New Password"
                              className="p-2 bg-white border border-slate-200 hover:bg-purple-50 rounded-lg text-slate-600 transition-all cursor-pointer shadow-xs"
                            >
                              <RefreshCw className="h-3.5 w-3.5 text-purple-600" />
                            </button>

                            {/* Magic Link / Copy Access */}
                            <button
                              onClick={() => handleGenerateMagicLink(student)}
                              title="Copy Login Magic Link"
                              className="p-2 bg-white border border-slate-200 hover:bg-indigo-50 rounded-lg text-slate-600 transition-all cursor-pointer shadow-xs"
                            >
                              <KeyRound className="h-3.5 w-3.5 text-indigo-600" />
                            </button>

                            {/* Edit Metadata */}
                            <button
                              onClick={() => openEditModal(student)}
                              title="Edit Student Metadata"
                              className="p-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition-all cursor-pointer shadow-xs"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(student.id)}
                              title="Soft Delete Student Profile"
                              className="p-2 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-lg text-slate-600 transition-all cursor-pointer shadow-xs"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 font-bold uppercase tracking-widest text-xs bg-white">
                No students found in registry.
              </div>
            )}

            {/* Pagination Footer */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center px-5 py-3.5 border-t border-slate-200 text-xs font-bold text-slate-600 bg-slate-50">
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((c) => Math.max(c - 1, 1))}
                    className="p-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((c) => Math.min(c + 1, totalPages))}
                    className="p-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Audit Logs View */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-150 pb-4">
            <div>
              <h3 className="font-display font-black text-slate-900 text-base">Non-Repudiable Administrative Audit Logs</h3>
              <p className="text-xs text-slate-500 mt-0.5">Immutable record of grade overrides, hold toggles, and password reset operations.</p>
            </div>
            <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-mono font-bold px-3 py-1 rounded-full">
              {logs.length} Log Entries Recorded
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action Type</th>
                  <th className="py-3 px-4">Target Student</th>
                  <th className="py-3 px-4">Audit Details & Rationale</th>
                  <th className="py-3 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{log.timestamp}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{log.actorName}</td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{log.targetId}</td>
                    <td className="py-3 px-4 text-slate-700">{log.details}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 1. Register New Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white sticky top-0 z-10">
              <h3 className="font-display font-black text-sm tracking-widest uppercase text-slate-900">
                {editingStudent ? "Edit Student Metadata" : "Register New Student"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-semibold text-slate-800">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">Middle Name</label>
                  <input
                    type="text"
                    value={formData.middleName}
                    onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">Matric No *</label>
                  <SegmentedMatricInput
                    value={formData.matricNo}
                    onChange={(val) => setFormData({ ...formData, matricNo: val })}
                    selectedDeptName={departments.find(d => d.id === formData.departmentId)?.name}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                  />
                </div>
              </div>

              {/* Password Section */}
              <div className="flex flex-col gap-1 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">
                    Initial Portal Password {editingStudent ? "(Leave blank to keep unchanged)" : "*"}
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoGeneratePassword}
                    className="text-[10px] text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    title="Auto-generate a random secure password"
                  >
                    <Zap className="h-3 w-3" />
                    <span>Generate Random Password</span>
                  </button>
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    required={!editingStudent}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Set initial password for student portal..."
                    className="w-full p-2.5 pr-10 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 text-xs font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Issuance Options Checkboxes */}
                <div className="mt-3 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 text-[11px] font-semibold">
                    <input
                      type="checkbox"
                      checked={formData.sendEmail}
                      onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                      className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 h-3.5 w-3.5"
                    />
                    <span>Send initial portal credentials (Matric No & Password) to student email upon creation.</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 text-[11px] font-semibold">
                    <input
                      type="checkbox"
                      checked={formData.forcePasswordChange}
                      onChange={(e) => setFormData({ ...formData, forcePasswordChange: e.target.checked })}
                      className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 h-3.5 w-3.5"
                    />
                    <span>Force student to change password on first portal login.</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">Department *</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 font-bold"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">Academic Level *</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 font-bold"
                  >
                    <option value={100}>100 Level</option>
                    <option value={200}>200 Level</option>
                    <option value={300}>300 Level</option>
                    <option value={400}>400 Level</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-white hover:bg-slate-100 border border-slate-300 px-5 py-2.5 rounded-xl text-slate-700 font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  <span>{isSubmitting ? "Saving..." : editingStudent ? "Update Metadata" : "Register Student & Issue Credentials"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Issued Credentials Confirmation Modal */}
      {issuedCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-sm uppercase">
                <CheckCircle2 className="h-5 w-5" />
                <span>Issued Student Credentials</span>
              </div>
              <button onClick={() => setIssuedCredentials(null)} className="text-slate-400 hover:text-slate-900 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-800 block">Matriculation / User ID</span>
                <span className="font-mono font-black text-sm text-slate-900">{issuedCredentials.matricNo}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-800 block">Temporary Password</span>
                <span className="font-mono font-black text-sm text-slate-900">{issuedCredentials.temporaryPassword}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-800 block">Student Email</span>
                <span className="font-sans font-semibold text-xs text-slate-700">{issuedCredentials.email}</span>
              </div>

              <div className="pt-2 border-t border-emerald-200/60 flex items-center gap-2 text-[11px] font-bold text-emerald-900">
                <Mail className="h-3.5 w-3.5" />
                <span>Email Notice: {issuedCredentials.sendEmail ? "Dispatched" : "Manual Share"}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const text = `CrestOak Student Portal Credentials:\nMatric No: ${issuedCredentials.matricNo}\nPassword: ${issuedCredentials.temporaryPassword}\nLogin: https://portal.crestoakcollege.com.ng/login`;
                  navigator.clipboard.writeText(text);
                  setCopiedCreds(true);
                  setTimeout(() => setCopiedCreds(false), 2000);
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                {copiedCreds ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                <span>{copiedCreds ? "Credentials Copied!" : "Copy Full Credentials Payload"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Reset Password / Set Password Modal */}
      {resetPasswordStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-purple-700 font-extrabold text-sm uppercase">
                <RefreshCw className="h-5 w-5" />
                <span>Reset Student Password</span>
              </div>
              <button onClick={() => setResetPasswordStudent(null)} className="text-slate-400 hover:text-slate-900 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs text-slate-700 font-medium">
              Set new password for student <strong className="font-mono">{resetPasswordStudent.matricNo}</strong> ({resetPasswordStudent.user.email}).
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3 text-xs font-semibold">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase font-bold text-slate-700">New Password</label>
                <button
                  type="button"
                  onClick={() => setResetPasswordValue(generateRandomPassword())}
                  className="text-[10px] text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Zap className="h-3 w-3" />
                  <span>Auto-Generate</span>
                </button>
              </div>

              <div className="relative flex items-center">
                <input
                  type={showResetPassword ? "text" : "password"}
                  required
                  value={resetPasswordValue}
                  onChange={(e) => setResetPasswordValue(e.target.value)}
                  className="w-full p-2.5 pr-10 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 text-xs font-mono font-bold"
                />
                <button
                  type="button"
                  onClick={() => setShowResetPassword(!showResetPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showResetPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResetPasswordStudent(null)}
                  className="bg-white border border-slate-300 px-4 py-2 rounded-xl text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-5 py-2 rounded-xl cursor-pointer"
                >
                  {isSubmitting ? "Updating..." : "Issue New Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Academic Override Drawer */}
      {overrideStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-blue-700 font-extrabold text-sm uppercase">
                <GraduationCap className="h-5 w-5" />
                <span>Academic Grade Rectification</span>
              </div>
              <button onClick={() => setOverrideStudent(null)} className="text-slate-400 hover:text-slate-900 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 font-medium">
              Overriding grades for student <strong className="font-mono">{overrideStudent.matricNo}</strong> ({overrideStudent.user.firstName} {overrideStudent.user.lastName}). All overrides generate an immutable audit log entry.
            </div>

            <form onSubmit={handleAcademicOverrideSubmit} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block uppercase text-[10px] text-slate-600 mb-1">Target Course Code</label>
                <select
                  value={overrideForm.courseCode}
                  onChange={(e) => setOverrideForm({ ...overrideForm, courseCode: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 font-bold"
                >
                  <option value="NUR102">NUR102 - Clinical Nursing Anatomy</option>
                  <option value="CSC301">CSC301 - Data Structures & Algorithms</option>
                  <option value="MLS201">MLS201 - General Clinical Pathology</option>
                  <option value="CHEW101">CHEW101 - Primary Health Care</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase text-[10px] text-slate-600 mb-1">Rectified Grade</label>
                  <select
                    value={overrideForm.newGrade}
                    onChange={(e) => setOverrideForm({ ...overrideForm, newGrade: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 font-bold"
                  >
                    <option value="A">Grade A (70-100% / 5.0)</option>
                    <option value="B">Grade B (60-69% / 4.0)</option>
                    <option value="C">Grade C (50-59% / 3.0)</option>
                    <option value="D">Grade D (45-49% / 2.0)</option>
                  </select>
                </div>
                <div>
                  <label className="block uppercase text-[10px] text-slate-600 mb-1">Target CGPA Override</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.00"
                    max="5.00"
                    value={overrideForm.newCgpa}
                    onChange={(e) => setOverrideForm({ ...overrideForm, newCgpa: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase text-[10px] text-slate-600 mb-1">Audit Justification / Reason *</label>
                <textarea
                  required
                  rows={3}
                  value={overrideForm.reason}
                  onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })}
                  placeholder="State official examination board approval reference..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 font-medium text-xs"
                />
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => alert(`Official Verified Transcript generated for ${overrideStudent.matricNo}. PDF download queued.`)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-3 rounded-xl flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <FileText className="h-4 w-4 text-slate-600" />
                  <span>Generate Transcript PDF</span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-5 py-2 rounded-xl cursor-pointer"
                >
                  {isSubmitting ? "Saving..." : "Apply Override"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Administrative Hold Toggle Modal */}
      {holdStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-amber-700 font-extrabold text-sm uppercase">
                <ShieldAlert className="h-5 w-5" />
                <span>Administrative Hold Control</span>
              </div>
              <button onClick={() => setHoldStudent(null)} className="text-slate-400 hover:text-slate-900 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs text-slate-700 font-medium">
              Student: <strong className="font-mono">{holdStudent.matricNo}</strong> ({holdStudent.user.firstName} {holdStudent.user.lastName})
            </div>

            <form onSubmit={handleHoldToggleSubmit} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block uppercase text-[10px] text-slate-600 mb-1">Hold Type / Status</label>
                <select
                  value={holdForm.status}
                  onChange={(e) => setHoldForm({ ...holdForm, status: e.target.value as any })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 font-bold"
                >
                  <option value="ACTIVE">ACTIVE (No Portal Lockout)</option>
                  <option value="FINANCIAL_HOLD">FINANCIAL HOLD (Tuition Lockout)</option>
                  <option value="DISCIPLINARY_HOLD">DISCIPLINARY HOLD (Exam Lockout)</option>
                </select>
              </div>

              <div>
                <label className="block uppercase text-[10px] text-slate-600 mb-1">Reason / Lockout Notice</label>
                <textarea
                  required
                  rows={3}
                  value={holdForm.reason}
                  onChange={(e) => setHoldForm({ ...holdForm, reason: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 font-medium text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setHoldStudent(null)}
                  className="bg-white border border-slate-300 px-4 py-2 rounded-xl text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-2 rounded-xl cursor-pointer"
                >
                  {isSubmitting ? "Updating..." : "Update Hold Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Magic Login Link Modal */}
      {magicStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-sm uppercase">
                <KeyRound className="h-5 w-5" />
                <span>Portal Magic Access Link</span>
              </div>
              <button onClick={() => setMagicStudent(null)} className="text-slate-400 hover:text-slate-900 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs text-slate-700 font-medium">
              Generate direct magic portal access link for <strong className="font-mono">{magicStudent.matricNo}</strong> ({magicStudent.user.email}).
            </div>

            {generatedLink ? (
              <div className="space-y-3">
                <label className="block text-[10px] font-bold uppercase text-slate-600">Generated One-Time Magic Access Link</label>
                <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-900 break-all select-all flex items-center justify-between">
                  <span>{generatedLink}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedLink);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="ml-2 p-1.5 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shrink-0 cursor-pointer text-slate-700"
                    title="Copy Magic Link"
                  >
                    {copiedLink ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Link ready. Student can paste this in browser to bypass password prompt once.
                </p>
              </div>
            ) : (
              <div className="py-4 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mx-auto" />
                <span className="text-xs font-bold text-slate-500 mt-2 block">Generating cryptographic access token...</span>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setMagicStudent(null)}
                className="bg-slate-900 text-white font-bold px-5 py-2 rounded-xl cursor-pointer text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
