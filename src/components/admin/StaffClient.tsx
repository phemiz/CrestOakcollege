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
  Eye,
  EyeOff,
  Zap,
  BookOpen,
  CheckCircle2,
  Shield
} from "lucide-react";
import { DEFAULT_DEPARTMENTS, DEFAULT_STAFF_MEMBERS } from "@/constants/institutionalData";

interface StaffItem {
  id: string;
  staffNo: string;
  designation: string;
  joiningDate: Date | string;
  allocatedCourses?: string[];
  user: {
    id?: string;
    username?: string | null;
    firstName: string;
    lastName: string;
    middleName: string | null;
    email: string;
    phoneNumber: string | null;
    role: {
      name: string;
    };
  };
  department: {
    id: string;
    name: string;
  };
  lecturer?: {
    rank: string;
    specialization: string;
  } | null;
}

interface DropdownItem {
  id: string;
  name: string;
}

interface StaffClientProps {
  staffList: StaffItem[];
  departments: DropdownItem[];
}

export const resolveDepartment = (dept: string = "", staffId: string = "") => {
  if (dept && dept !== "Selected Department" && dept.trim() !== "") {
    return dept;
  }
  
  const codeMatch = staffId ? staffId.match(/STAFF\/([A-Z]{3})\//i) : null;
  const code = codeMatch ? codeMatch[1].toUpperCase() : '';
  
  const DEPT_MAP: Record<string, string> = {
    'SCS': 'Department of Computer Science & IT',
    'NUR': 'Department of Nursing Sciences',
    'MLS': 'Department of Medical Laboratory Science',
    'CHS': 'Department of Community Health Sciences',
    'BUS': 'Department of Business Administration',
    'LAW': 'Department of Law & Criminology',
    'REG': 'Registry & Academic Affairs',
    'BUR': 'Bursary & Financial Services'
  };

  return DEPT_MAP[code] || 'General Administration';
};

function getStaffDeptCode(deptName: string = "") {
  const upper = deptName.toUpperCase();
  if (upper.includes("NURSING")) return "NUR";
  if (upper.includes("LABORATORY") || upper.includes("MLS")) return "MLS";
  if (upper.includes("COMMUNITY") || upper.includes("HEALTH") || upper.includes("CHEW")) return "CHS";
  if (upper.includes("COMPUTER") || upper.includes("SCIENCE") || upper.includes("IT")) return "SCS";
  if (upper.includes("BUSINESS") || upper.includes("MANAGEMENT")) return "BUS";
  if (upper.includes("LAW") || upper.includes("CRIMINOLOGY")) return "LAW";
  if (upper.includes("REGISTRY") || upper.includes("ADMIN")) return "REG";
  if (upper.includes("BURSARY") || upper.includes("FINANCE") || upper.includes("ACCOUNT")) return "BUR";
  return upper.substring(0, 3).replace(/[^A-Z]/g, "S") || "SCS";
}

const AVAILABLE_COURSES = [
  { code: "NUR101", title: "Introduction to Nursing & Clinical Ethics" },
  { code: "NUR102", title: "Clinical Nursing Anatomy & Physiology" },
  { code: "MLS201", title: "General Clinical Pathology & Haematology" },
  { code: "MLS202", title: "Medical Microbiology & Diagnostics" },
  { code: "CSC101", title: "Introduction to Computer Science & Python" },
  { code: "CSC301", title: "Database Systems & Data Warehousing" },
  { code: "CHEW101", title: "Primary Health Care & Community Medicine" },
  { code: "BUS201", title: "Principles of Management & Organization" }
];

export default function StaffClient({ staffList: initialStaff, departments: rawDepartments }: StaffClientProps) {
  const departments = (rawDepartments && rawDepartments.length > 0)
    ? rawDepartments
    : DEFAULT_DEPARTMENTS.map((d, i) => ({ id: `dept-${i + 1}`, name: d }));

  const router = useRouter();
  const [staffList, setStaffList] = useState<StaffItem[]>(
    (initialStaff && initialStaff.length > 0) ? initialStaff : (DEFAULT_STAFF_MEMBERS as any)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchStaffMembers = async () => {
      try {
        const res = await fetch("/api/admin/staff.php?_t=" + Date.now());
        if (res.ok) {
          const data = await res.json();
          const liveList = Array.isArray(data) ? data : (data.staffList || data.data || []);
          
          if (Array.isArray(liveList) && liveList.length > 0) {
            const mergedMap = new Map();
            
            (DEFAULT_STAFF_MEMBERS as any[]).forEach((item: any) => {
              const key = item.user?.username || item.username || item.staffNo || item.id;
              if (key) mergedMap.set(key, item);
            });
            
            liveList.forEach((item: any) => {
              const key = item.user?.username || item.username || item.staffNo || item.staff_id || item.id;
              if (key) {
                const sNo = item.staffNo || item.staff_id || item.staffId || 'CCHMS/STAFF/SCS/001';
                const dName = resolveDepartment(item.department?.name || item.department || '', sNo);
                const normalizedItem: StaffItem = {
                  id: item.id || item.staff_id || item.staffNo,
                  staffNo: sNo,
                  designation: item.designation || 'Staff',
                  joiningDate: item.joiningDate || item.joining_date || new Date().toISOString().split('T')[0],
                  allocatedCourses: item.allocatedCourses || ["NUR101", "CSC101"],
                  user: {
                    id: item.user?.id || item.id,
                    username: item.user?.username || item.username || '',
                    firstName: item.user?.firstName || item.firstName || item.first_name || '',
                    lastName: item.user?.lastName || item.lastName || item.last_name || '',
                    middleName: item.user?.middleName || item.middleName || item.middle_name || '',
                    email: item.user?.email || item.email || '',
                    phoneNumber: item.user?.phoneNumber || item.phone || item.phoneNumber || '',
                    role: {
                      name: item.user?.role?.name || item.roleName || item.role || 'LECTURER'
                    }
                  },
                  department: {
                    id: item.department?.id || ('dept-' + String(dName).toLowerCase().replace(/[^a-z0-9]/g, '-')),
                    name: dName
                  },
                  lecturer: (item.lecturer || item.academicRank || item.academic_rank) ? {
                    rank: item.lecturer?.rank || item.academicRank || item.academic_rank || 'LECTURER_II',
                    specialization: item.lecturer?.specialization || item.specialization || ''
                  } : null
                };
                mergedMap.set(key, normalizedItem);
              }
            });
            
            setStaffList(Array.from(mergedMap.values()));
            return;
          }
        }
      } catch (error) {
        console.warn("Could not fetch live staff records, displaying defaults.", error);
      }
      
      setStaffList(DEFAULT_STAFF_MEMBERS as any);
    };

    fetchStaffMembers();
  }, []);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffItem | null>(null);

  // Course Allocation Modal
  const [courseStaff, setCourseStaff] = useState<StaffItem | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    middleName: "",
    phoneNumber: "",
    staffNo: "",
    designation: "",
    joiningDate: new Date().toISOString().split("T")[0],
    departmentId: "",
    roleName: "LECTURER" as "LECTURER" | "HOD" | "DEAN" | "STAFF" | "BURSAR" | "REGISTRAR" | "ADMIN",
    rank: "LECTURER_II",
    specialization: ""
  });

  const computeStaffNo = (deptId: string) => {
    if (!deptId) return "";
    const selectedDept = departments.find((d) => d.id === deptId);
    const code = getStaffDeptCode(selectedDept?.name || "");
    const countInDept = staffList.filter((s) => s.department?.id === deptId).length;
    const nextIndex = String(countInDept + 1).padStart(3, "0");
    return `CCHMS/STAFF/${code}/${nextIndex}`;
  };

  const handleNameChange = (field: "firstName" | "lastName", val: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: val };
      const fn = updated.firstName.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
      const ln = updated.lastName.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
      const suggestedUsername = fn && ln ? `${fn}.${ln}` : fn || ln;
      return {
        ...updated,
        username: suggestedUsername
      };
    });
  };

  const handleDepartmentChange = (deptId: string) => {
    setFormData((prev) => ({
      ...prev,
      departmentId: deptId,
      staffNo: editingStaff ? prev.staffNo : computeStaffNo(deptId)
    }));
  };

  const handleAutoGeneratePassword = () => {
    const randDigits = Math.floor(1000 + Math.random() * 9000);
    const generated = `CrestOak#${randDigits}`;
    setFormData((prev) => ({ ...prev, password: generated }));
    setShowPassword(true);
  };

  const openAddModal = () => {
    setEditingStaff(null);
    setShowPassword(false);
    setFormData({
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      middleName: "",
      phoneNumber: "",
      staffNo: "",
      designation: "Lecturer II",
      joiningDate: new Date().toISOString().split("T")[0],
      departmentId: departments[0]?.id || "",
      roleName: "LECTURER",
      rank: "LECTURER_II",
      specialization: ""
    });
    setIsModalOpen(true);
  };

  const openEditModal = (staff: StaffItem) => {
    setEditingStaff(staff);
    setShowPassword(false);
    setFormData({
      username: staff.user.username || "",
      email: staff.user.email,
      password: "",
      firstName: staff.user.firstName,
      lastName: staff.user.lastName,
      middleName: staff.user.middleName || "",
      phoneNumber: staff.user.phoneNumber || "",
      staffNo: staff.staffNo,
      designation: staff.designation,
      joiningDate: typeof staff.joiningDate === "string" ? staff.joiningDate.split("T")[0] : new Date().toISOString().split("T")[0],
      departmentId: staff.department.id,
      roleName: (staff.user.role.name as any) || "LECTURER",
      rank: staff.lecturer?.rank || "LECTURER_II",
      specialization: staff.lecturer?.specialization || ""
    });
    setIsModalOpen(true);
  };

  const openCourseAllocationModal = (staff: StaffItem) => {
    setCourseStaff(staff);
    setSelectedCourses(staff.allocatedCourses || ["NUR101", "CSC101"]);
  };

  const toggleCourseAllocation = (code: string) => {
    setSelectedCourses((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSaveCourseAllocation = async () => {
    if (!courseStaff) return;
    setIsSubmitting(true);
    try {
      setStaffList((prev) =>
        prev.map((s) => (s.id === courseStaff.id ? { ...s, allocatedCourses: selectedCourses } : s))
      );
      alert(`Course allocation updated successfully for ${courseStaff.user.firstName} ${courseStaff.user.lastName}! Assigned (${selectedCourses.length}) courses.`);
      setCourseStaff(null);
    } catch (err: any) {
      alert("Error saving course mapping: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.username) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedDept = departments.find((d) => d.id === formData.departmentId);
      const deptName = selectedDept ? selectedDept.name : "General Administration";
      const computedStaffNo = formData.staffNo || computeStaffNo(formData.departmentId);

      const payload = {
        ...formData,
        staffNo: computedStaffNo,
        departmentName: deptName,
        id: editingStaff?.id
      };

      const res = await fetch("/api/admin/staff.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success || data.staff) {
        const returnedStaff = data.staff || data.data;
        const normalized: StaffItem = {
          id: editingStaff?.id || returnedStaff?.id || `staff-${Date.now()}`,
          staffNo: computedStaffNo,
          designation: formData.designation || "Lecturer",
          joiningDate: formData.joiningDate,
          allocatedCourses: editingStaff?.allocatedCourses || ["NUR101"],
          user: {
            id: editingStaff?.user.id || `usr-${Date.now()}`,
            username: formData.username,
            firstName: formData.firstName,
            lastName: formData.lastName,
            middleName: formData.middleName || "",
            email: formData.email,
            phoneNumber: formData.phoneNumber || "",
            role: { name: formData.roleName }
          },
          department: {
            id: formData.departmentId,
            name: deptName
          },
          lecturer: {
            rank: formData.rank,
            specialization: formData.specialization
          }
        };

        if (editingStaff) {
          setStaffList((prev) => prev.map((s) => (s.id === editingStaff.id ? normalized : s)));
        } else {
          setStaffList((prev) => [normalized, ...prev]);
        }
        setIsModalOpen(false);
        router.refresh();
      } else {
        alert("Error saving staff record: " + (data.message || "Failed"));
      }
    } catch (err: any) {
      alert("Submission error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to soft-delete this staff member record?")) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/staff.php", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setStaffList((prev) => prev.filter((s) => s.id !== id));
        router.refresh();
      } else {
        alert("Error deleting staff: " + (data.message || "Failed"));
      }
    } catch (err: any) {
      alert("Delete error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStaff = staffList.filter((staff) => {
    const fullName = `${staff.user?.firstName || ""} ${staff.user?.lastName || ""}`.toLowerCase();
    const username = (staff.user?.username || "").toLowerCase();
    const email = (staff.user?.email || "").toLowerCase();
    const staffNo = (staff.staffNo || "").toLowerCase();

    const searchMatch =
      fullName.includes(searchTerm.toLowerCase()) ||
      username.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase()) ||
      staffNo.includes(searchTerm.toLowerCase());

    const deptMatch = deptFilter === "ALL" || staff.department?.id === deptFilter;
    const roleMatch = roleFilter === "ALL" || staff.user?.role?.name === roleFilter;

    return searchMatch && deptMatch && roleMatch;
  });

  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Title & Add Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-black text-slate-900">Staff Registry & Roles</h2>
          <p className="text-xs text-slate-500 mt-1">Manage academic faculty, administrative roles (HOD, Dean, Bursar, Registrar), and course allocation mapping.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-red-600 hover:bg-red-700 text-white font-display font-bold py-2.5 px-5 rounded-xl text-xs transition-all flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <UserPlus className="h-4.5 w-4.5" />
          <span>Add New Staff</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="md:col-span-6 relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search staff by name, staff number, username, or email..."
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
            className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
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
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="DEAN">DEAN</option>
            <option value="HOD">HOD</option>
            <option value="LECTURER">LECTURER</option>
            <option value="BURSAR">BURSAR</option>
            <option value="REGISTRAR">REGISTRAR</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-4">Staff ID</th>
                <th className="py-3.5 px-4">Department / Unit</th>
                <th className="py-3.5 px-4">Designation & Rank</th>
                <th className="py-3.5 px-4">Role / Access</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    No staff records match your filters.
                  </td>
                </tr>
              ) : (
                paginatedStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">
                        {staff.user.firstName} {staff.user.middleName || ""} {staff.user.lastName}
                      </div>
                      <div className="text-[11px] text-slate-400">{staff.user.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{staff.staffNo}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{resolveDepartment(staff.department?.name, staff.staffNo)}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{staff.designation}</div>
                      {staff.lecturer?.specialization && (
                        <div className="text-[10px] text-slate-400 font-medium">{staff.lecturer.specialization}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          staff.user.role.name === "ADMIN"
                            ? "bg-purple-100 text-purple-700 border border-purple-200"
                            : staff.user.role.name === "DEAN" || staff.user.role.name === "HOD"
                            ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                            : staff.user.role.name === "BURSAR"
                            ? "bg-amber-100 text-amber-700 border border-amber-200"
                            : staff.user.role.name === "LECTURER"
                            ? "bg-blue-100 text-blue-700 border border-blue-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {staff.user.role.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openCourseAllocationModal(staff)}
                          className="p-1.5 bg-white border border-slate-200 hover:bg-blue-50 text-blue-700 rounded-lg transition-colors cursor-pointer"
                          title="Course Allocation Mapping"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(staff)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Staff Member"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(staff.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Soft-Delete Staff"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
            <div className="text-xs text-slate-500">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Course Allocation Mapping Modal */}
      {courseStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-blue-700 font-extrabold text-sm uppercase">
                <BookOpen className="h-5 w-5" />
                <span>Course Allocation Mapping</span>
              </div>
              <button onClick={() => setCourseStaff(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Map taught course codes to <strong className="font-mono text-slate-900">{courseStaff.staffNo}</strong> ({courseStaff.user.firstName} {courseStaff.user.lastName}).
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {AVAILABLE_COURSES.map((course) => {
                const isSelected = selectedCourses.includes(course.code);
                return (
                  <div
                    key={course.code}
                    onClick={() => toggleCourseAllocation(course.code)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? "bg-blue-50 border-blue-300 text-blue-900"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div>
                      <span className="font-mono font-bold text-xs block">{course.code}</span>
                      <span className="text-[11px] font-medium text-slate-500">{course.title}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />}
                  </div>
                );
              })}
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCourseStaff(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCourseAllocation}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold cursor-pointer"
              >
                Save Course Mapping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-xl font-display font-black text-slate-900">
                  {editingStaff ? "Edit Staff Member Profile" : "Register New Staff Member"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editingStaff ? "Update staff member record and permissions." : "Create new academic or administrative staff account."}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleNameChange("firstName", e.target.value)}
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => handleNameChange("lastName", e.target.value)}
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
                  <label className="text-[10px] uppercase font-bold text-slate-700">Official Staff ID</label>
                  <div className="p-2.5 border rounded-xl font-mono font-bold text-xs select-none flex items-center justify-between shadow-xs bg-slate-100 text-slate-700 border-slate-200">
                    <span>{formData.staffNo || "Select department first..."}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">Username / Login Credential *</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                  />
                </div>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">Role / Access Group *</label>
                  <select
                    value={formData.roleName}
                    onChange={(e) => setFormData({ ...formData, roleName: e.target.value as any })}
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 font-bold"
                  >
                    <option value="LECTURER">LECTURER</option>
                    <option value="HOD">HOD (Head of Department)</option>
                    <option value="DEAN">DEAN (Faculty Dean)</option>
                    <option value="STAFF">STAFF (Registry Agent)</option>
                    <option value="BURSAR">BURSAR (Financial Officer)</option>
                    <option value="REGISTRAR">REGISTRAR</option>
                    <option value="ADMIN">ADMIN (System Admin)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">Department *</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    required
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 font-bold"
                  >
                    <option value="">-- Select Department --</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingStaff ? "Update Staff Profile" : "Register Staff Member"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
