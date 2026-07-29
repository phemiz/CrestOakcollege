"use client";

import React, { useState } from "react";
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
  Loader2
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
  user: {
    firstName: string;
    lastName: string;
    middleName: string | null;
    email: string;
    phoneNumber: string | null;
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

interface StudentsClientProps {
  students: StudentItem[];
  departments: DropdownItem[];
  programmes: DropdownItem[];
  sessions: DropdownItem[];
  semesters: DropdownItem[];
}

export default function StudentsClient({
  students: initialStudents,
  departments: rawDepartments,
  programmes: rawProgrammes,
  sessions: rawSessions,
  semesters: rawSemesters
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [levelFilter, setLevelFilter] = useState("ALL");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    middleName: "",
    phoneNumber: "",
    matricNo: "",
    level: 100,
    departmentId: departments[0]?.id || "",
    programmeId: programmes[0]?.id || "",
    entrySessionId: sessions[0]?.id || "",
    currentSessionId: sessions[0]?.id || "",
    currentSemesterId: semesters[0]?.id || ""
  });

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({
      email: "",
      firstName: "",
      lastName: "",
      middleName: "",
      phoneNumber: "",
      matricNo: `CCHMS/2026/${departments[0]?.name.substring(0, 3).toUpperCase() || "SCS"}/${String(Math.floor(1 + Math.random() * 999)).padStart(4, "0")}`,
      level: 100,
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
    setFormData({
      email: student.user.email,
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      middleName: student.user.middleName || "",
      phoneNumber: student.user.phoneNumber || "",
      matricNo: student.matricNo,
      level: student.level,
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
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.matricNo) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        id: editingStudent?.id
      };
      const res = await fetch("/api/admin/students.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        if (editingStudent) {
          setStudents((prev) =>
            prev.map((s) => (s.id === editingStudent.id ? { ...s, ...data.student } : s))
          );
        } else {
          setStudents((prev) => [data.student, ...prev]);
        }
        setIsModalOpen(false);
        router.refresh();
      } else {
        alert("Error saving student profile: " + (data.message || "Failed to submit."));
      }
    } catch (err: any) {
      alert("Submission error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
      {/* Title & Add Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-black text-slate-900">Students Registry</h2>
          <p className="text-xs text-slate-500 mt-1">Manage active student credentials, levels, and department files in real time.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-red-600 hover:bg-red-700 text-white font-display font-bold py-2.5 px-5 rounded-xl text-xs transition-all flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <UserPlus className="h-4.5 w-4.5" />
          <span>Add New Student</span>
        </button>
      </div>

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
                  <th className="py-3.5 px-5">Name</th>
                  <th className="py-3.5 px-5">Matric No</th>
                  <th className="py-3.5 px-5">Department</th>
                  <th className="py-3.5 px-5">Level</th>
                  <th className="py-3.5 px-5">CGPA</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-900">
                      {student.user.firstName} {student.user.lastName}
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
                    <td className="py-3.5 px-5 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(student)}
                        className="p-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition-all cursor-pointer shadow-xs"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="p-2 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-lg text-slate-600 transition-all cursor-pointer shadow-xs"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
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

      {/* Create / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white sticky top-0 z-10">
              <h3 className="font-display font-black text-sm tracking-widest uppercase text-slate-900">
                {editingStudent ? "Edit Student Profile" : "Register New Student"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
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
                  <input
                    type="text"
                    required
                    value={formData.matricNo}
                    onChange={(e) => setFormData({ ...formData, matricNo: e.target.value })}
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 font-mono font-bold"
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
                  <label className="text-[10px] uppercase font-bold text-slate-700">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                  />
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
                  <label className="text-[10px] uppercase font-bold text-slate-700">Academic Programme *</label>
                  <select
                    value={formData.programmeId}
                    onChange={(e) => setFormData({ ...formData, programmeId: e.target.value })}
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 font-bold"
                  >
                    {programmes.map((prog) => (
                      <option key={prog.id} value={prog.id}>
                        {prog.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">Entry Session *</label>
                  <select
                    value={formData.entrySessionId}
                    onChange={(e) => setFormData({ ...formData, entrySessionId: e.target.value })}
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 font-bold"
                  >
                    {sessions.map((ses) => (
                      <option key={ses.id} value={ses.id}>
                        {ses.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">Current Session *</label>
                  <select
                    value={formData.currentSessionId}
                    onChange={(e) => setFormData({ ...formData, currentSessionId: e.target.value })}
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 font-bold"
                  >
                    {sessions.map((ses) => (
                      <option key={ses.id} value={ses.id}>
                        {ses.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">Current Semester *</label>
                  <select
                    value={formData.currentSemesterId}
                    onChange={(e) => setFormData({ ...formData, currentSemesterId: e.target.value })}
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 font-bold"
                  >
                    {semesters.map((sem) => (
                      <option key={sem.id} value={sem.id}>
                        {sem.name} Semester
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
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
                  <span>{isSubmitting ? "Saving..." : editingStudent ? "Update Profile" : "Register Student"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
