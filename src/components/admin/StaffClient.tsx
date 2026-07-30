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
  Zap
} from "lucide-react";
import { DEFAULT_DEPARTMENTS, DEFAULT_STAFF_MEMBERS } from "@/constants/institutionalData";

interface StaffItem {
  id: string;
  staffNo: string;
  designation: string;
  joiningDate: Date | string;
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
  
  // Extract 3-letter code from Staff ID (e.g. CCHMS/STAFF/SCS/001 -> SCS)
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
            
            // Add default entries first as baseline fallback
            (DEFAULT_STAFF_MEMBERS as any[]).forEach((item: any) => {
              const key = item.user?.username || item.username || item.staffNo || item.id;
              if (key) mergedMap.set(key, item);
            });
            
            // Overwrite or append with real database records
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
    roleName: "LECTURER" as "LECTURER" | "STAFF" | "BURSAR" | "REGISTRAR",
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
      designation: "Lecturer",
      joiningDate: new Date().toISOString().split("T")[0],
      departmentId: "",
      roleName: "LECTURER",
      rank: "LECTURER_II",
      specialization: ""
    });
    setIsModalOpen(true);
  };

  const openEditModal = (staff: StaffItem) => {
    setEditingStaff(staff);
    setShowPassword(false);
    let roleShort: "LECTURER" | "STAFF" | "BURSAR" | "REGISTRAR" = "STAFF";
    if (staff.user.role.name === "LECTURER") roleShort = "LECTURER";
    else if (staff.user.role.name === "BURSAR") roleShort = "BURSAR";
    else if (staff.user.role.name === "REGISTRAR") roleShort = "REGISTRAR";

    const autoUser = `${staff.user.firstName.trim().toLowerCase().replace(/[^a-z0-9]/g, "")}.${staff.user.lastName.trim().toLowerCase().replace(/[^a-z0-9]/g, "")}`;

    setFormData({
      username: staff.user.username || autoUser,
      email: staff.user.email,
      password: "",
      firstName: staff.user.firstName,
      lastName: staff.user.lastName,
      middleName: staff.user.middleName || "",
      phoneNumber: staff.user.phoneNumber || "",
      staffNo: staff.staffNo,
      designation: staff.designation,
      joiningDate: new Date(staff.joiningDate).toISOString().split("T")[0],
      departmentId: staff.department.id,
      roleName: roleShort,
      rank: staff.lecturer?.rank || "LECTURER_II",
      specialization: staff.lecturer?.specialization || ""
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.username || !formData.phoneNumber?.trim() || (!editingStaff && !formData.password?.trim())) {
      alert("Please fill in all required fields (including Phone Number and Initial Password).");
      return;
    }

    let finalStaffNo = formData.staffNo;
    if (!finalStaffNo) {
      const activeDeptId = formData.departmentId || departments[0]?.id || "";
      finalStaffNo = computeStaffNo(activeDeptId);
    }

    const selectedDept = departments.find((d) => d.id === formData.departmentId);
    const resolvedDeptName = selectedDept?.name || resolveDepartment("", finalStaffNo);

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        staffNo: finalStaffNo,
        departmentId: formData.departmentId || departments[0]?.id,
        department: resolvedDeptName,
        id: editingStaff?.id
      };
      const res = await fetch("/api/admin/staff.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        if (editingStaff) {
          setStaffList((prev) =>
            prev.map((s) => (s.id === editingStaff.id ? { ...s, ...data.staff } : s))
          );
        } else {
          setStaffList((prev) => [data.staff, ...prev]);
        }
        setIsModalOpen(false);
        router.refresh();
      } else {
        alert("Error saving staff profile: " + (data.message || "Failed"));
      }
    } catch (err: any) {
      alert("Submission error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to soft-delete this staff member profile?")) return;

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
        alert("Error deleting staff profile: " + (data.message || "Failed"));
      }
    } catch (err: any) {
      alert("Delete error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter staff
  const filteredStaff = staffList.filter((staff) => {
    const fullName = `${staff.user.firstName} ${staff.user.lastName}`.toLowerCase();
    const searchMatch =
      fullName.includes(searchTerm.toLowerCase()) ||
      staff.staffNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (staff.user.username && staff.user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      staff.user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const deptMatch = deptFilter === "ALL" || staff.department.id === deptFilter;
    const roleMatch = roleFilter === "ALL" || staff.user.role.name === roleFilter;

    return searchMatch && deptMatch && roleMatch;
  });

  // Paginate staff
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
          <h2 className="text-2xl font-display font-black text-slate-900">Staff Registry</h2>
          <p className="text-xs text-slate-500 mt-1">Manage academic lecturers, bursary experts, and registry agents in real time.</p>
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
                      <div className="flex items-center justify-end gap-2">
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
              Showing <span className="font-semibold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="font-semibold text-slate-900">
                {Math.min(currentPage * itemsPerPage, filteredStaff.length)}
              </span>{" "}
              of <span className="font-semibold text-slate-900">{filteredStaff.length}</span> staff
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-bold text-slate-700 px-2">
                Page {currentPage} of {totalPages}
              </span>
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
                  <label className="text-[10px] uppercase font-bold text-slate-700">Official Staff ID (System Generated)</label>
                  <div
                    className={`p-2.5 border rounded-xl font-mono font-bold text-xs select-none flex items-center justify-between shadow-xs transition-colors ${
                      formData.staffNo
                        ? "bg-slate-100 text-slate-700 border-slate-200"
                        : "bg-slate-50 text-slate-400 border-dashed border-slate-300 font-normal"
                    }`}
                  >
                    <span>{formData.staffNo || "Select a department to assign Staff ID..."}</span>
                    {formData.staffNo ? (
                      <span className="text-[9px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-sans uppercase font-bold tracking-wider">
                        System Assigned
                      </span>
                    ) : (
                      <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-sans uppercase font-bold tracking-wider">
                        Pending Dept
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">Username / Login Credential *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. femi.adebayo or staff1"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 font-medium text-xs"
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
                  <label className="text-[10px] uppercase font-bold text-slate-700">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 08012345678"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase font-bold text-slate-700">
                      Initial Portal Password {editingStaff ? "" : "*"}
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoGeneratePassword}
                      className="text-[10px] text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                      title="Auto-generate a secure random password"
                    >
                      <Zap className="h-3 w-3" />
                      <span>Auto-Generate</span>
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      required={!editingStaff}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="e.g. CrestOak@2026 or minimum 8 characters"
                      className="w-full p-2.5 pr-10 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 text-xs font-mono font-medium"
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
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">Designation *</label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Senior Lecturer"
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">Role / Permission Group *</label>
                  <select
                    value={formData.roleName}
                    onChange={(e) => setFormData({ ...formData, roleName: e.target.value as any })}
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 font-bold"
                  >
                    <option value="LECTURER">LECTURER</option>
                    <option value="STAFF">STAFF (Registry Agent)</option>
                    <option value="BURSAR">BURSAR (Financial Officer)</option>
                    <option value="ADMIN">ADMIN (System Admin)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">Joining Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                  />
                </div>
              </div>

              {formData.roleName === "LECTURER" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-slate-700">Academic Rank *</label>
                    <select
                      value={formData.rank}
                      onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                      className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 font-bold"
                    >
                      <option value="GRADUATE_ASSISTANT">Graduate Assistant</option>
                      <option value="ASSISTANT_LECTURER">Assistant Lecturer</option>
                      <option value="LECTURER_II">Lecturer II</option>
                      <option value="LECTURER_I">Lecturer I</option>
                      <option value="SENIOR_LECTURER">Senior Lecturer</option>
                      <option value="ASSOCIATE_PROFESSOR">Associate Professor</option>
                      <option value="PROFESSOR">Professor</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-slate-700">Academic Specialization / Research Area</label>
                    <input
                      type="text"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      placeholder="e.g. Clinical Nursing & Maternal Health"
                      className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                    />
                  </div>
                </div>
              )}

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
