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
  Loader2
} from "lucide-react";
import { DEFAULT_DEPARTMENTS } from "@/constants/institutionalData";

interface StaffItem {
  id: string;
  staffNo: string;
  designation: string;
  joiningDate: Date | string;
  user: {
    id?: string;
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

const STAFF_COURSE_CODES = [
  { code: "SCS", name: "Computer Science & IT" },
  { code: "NUR", name: "Nursing Sciences" },
  { code: "MLS", name: "Medical Laboratory Science" },
  { code: "CHS", name: "Community Health Sciences" },
  { code: "BUS", name: "Business Administration" },
  { code: "LAW", name: "Law & Criminology" },
  { code: "REG", name: "Registry & Administration" },
  { code: "BUR", name: "Bursary & Finance" }
];

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

function SegmentedStaffIdInput({
  value,
  onChange,
  selectedDeptName
}: {
  value: string;
  onChange: (val: string) => void;
  selectedDeptName?: string;
}) {
  const parts = (value || "").split("/");
  let currentCode = "SCS";
  let currentSeq = "001";

  if (parts.length >= 4 && parts[0] === "CCHMS" && parts[1] === "STAFF") {
    currentCode = parts[2] || "SCS";
    currentSeq = parts[3] || "001";
  } else if (selectedDeptName) {
    currentCode = getStaffDeptCode(selectedDeptName);
  }

  const [code, setCode] = useState(currentCode);
  const [seq, setSeq] = useState(currentSeq === "001" ? "" : currentSeq);

  useEffect(() => {
    const p = (value || "").split("/");
    if (p.length >= 4 && p[0] === "CCHMS" && p[1] === "STAFF") {
      setCode(p[2]);
      setSeq(p[3] === "001" ? "" : p[3]);
    }
  }, [value]);

  useEffect(() => {
    if (selectedDeptName) {
      const autoCode = getStaffDeptCode(selectedDeptName);
      setCode(autoCode);
      const paddedSeq = (seq || "1").padStart(3, "0");
      onChange(`CCHMS/STAFF/${autoCode}/${paddedSeq}`);
    }
  }, [selectedDeptName]);

  const updateFullStaffId = (newCode: string, newSeqRaw: string) => {
    const cleanSeqDigits = newSeqRaw.replace(/\D/g, "").slice(0, 3);
    setCode(newCode);
    setSeq(cleanSeqDigits);
    const paddedSeq = (cleanSeqDigits || "1").padStart(3, "0");
    onChange(`CCHMS/STAFF/${newCode}/${paddedSeq}`);
  };

  const handleSeqBlur = () => {
    if (!seq) {
      onChange(`CCHMS/STAFF/${code}/001`);
    } else {
      const padded = seq.padStart(3, "0");
      setSeq(padded);
      onChange(`CCHMS/STAFF/${code}/${padded}`);
    }
  };

  const currentCourse = STAFF_COURSE_CODES.find((c) => c.code === code) || { code, name: "Department Code" };

  return (
    <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900 shadow-xs transition-all w-full">
      {/* 1. Locked Staff Prefix */}
      <div className="bg-slate-100 text-slate-500 font-mono font-bold text-xs px-2.5 py-2.5 border-r border-slate-200 select-none shrink-0" title="Institutional Staff Prefix">
        CCHMS/STAFF/
      </div>

      {/* 2. Department Code Select with Tooltip */}
      <div className="flex items-center border-r border-slate-200 bg-white hover:bg-slate-50 shrink-0 px-1" title={`${currentCourse.code}: ${currentCourse.name}`}>
        <select
          value={code}
          onChange={(e) => updateFullStaffId(e.target.value, seq)}
          className="py-2.5 px-1 text-xs font-mono font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer uppercase"
        >
          {STAFF_COURSE_CODES.map((c) => (
            <option key={c.code} value={c.code} title={`${c.code} - ${c.name}`}>
              {c.code}
            </option>
          ))}
        </select>
        <span className="text-slate-400 font-mono font-bold text-xs pr-0.5">/</span>
      </div>

      {/* 3. 3-Digit Sequential Index Input */}
      <input
        type="text"
        maxLength={3}
        value={seq}
        onChange={(e) => updateFullStaffId(code, e.target.value)}
        onBlur={handleSeqBlur}
        placeholder="001"
        title="3-digit Staff Index Number"
        className="w-full min-w-[50px] py-2.5 px-3 font-mono font-bold text-xs text-slate-900 bg-white focus:outline-none placeholder:text-slate-400"
      />
    </div>
  );
}

export default function StaffClient({ staffList: initialStaff, departments: rawDepartments }: StaffClientProps) {
  const departments = (rawDepartments && rawDepartments.length > 0)
    ? rawDepartments
    : DEFAULT_DEPARTMENTS.map((d, i) => ({ id: `dept-${i + 1}`, name: d }));

  const router = useRouter();
  const [staffList, setStaffList] = useState<StaffItem[]>(initialStaff);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    email: "",
    firstName: "",
    lastName: "",
    middleName: "",
    phoneNumber: "",
    staffNo: "",
    designation: "",
    joiningDate: new Date().toISOString().split("T")[0],
    departmentId: departments[0]?.id || "",
    roleName: "LECTURER" as "LECTURER" | "STAFF" | "BURSAR" | "REGISTRAR",
    rank: "LECTURER_II",
    specialization: ""
  });

  const openAddModal = () => {
    setEditingStaff(null);
    setFormData({
      email: "",
      firstName: "",
      lastName: "",
      middleName: "",
      phoneNumber: "",
      staffNo: `CCHMS/STAFF/${getStaffDeptCode(departments[0]?.name)}/001`,
      designation: "Lecturer",
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
    let roleShort: "LECTURER" | "STAFF" | "BURSAR" | "REGISTRAR" = "STAFF";
    if (staff.user.role.name === "LECTURER") roleShort = "LECTURER";
    else if (staff.user.role.name === "BURSAR") roleShort = "BURSAR";
    else if (staff.user.role.name === "REGISTRAR") roleShort = "REGISTRAR";

    setFormData({
      email: staff.user.email,
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
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.staffNo) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
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
            placeholder="Search staff by name, staff number, or email..."
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
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="LECTURER">Lecturers</option>
            <option value="STAFF">Registry Staff</option>
            <option value="BURSAR">Bursary Staff</option>
            <option value="ADMIN">System Admin</option>
          </select>
        </div>
      </div>

      {/* Staff Data Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {paginatedStaff.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs text-slate-800">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-5">Name</th>
                  <th className="py-3.5 px-5">Staff No</th>
                  <th className="py-3.5 px-5">Designation</th>
                  <th className="py-3.5 px-5">Role/Scope</th>
                  <th className="py-3.5 px-5">Joining Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-900">
                      {staff.user.firstName} {staff.user.lastName}
                      <span className="block text-[11px] text-slate-500 font-normal mt-0.5">
                        {staff.user.email}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-800">{staff.staffNo}</td>
                    <td className="py-3.5 px-5 text-slate-700 font-medium">
                      {staff.designation}
                      {staff.lecturer && (
                        <span className="block text-[11px] text-slate-500 font-normal italic">
                          Specialization: {staff.lecturer.specialization || "General"}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="bg-red-50 text-red-700 px-2.5 py-1 rounded border border-red-100 font-bold uppercase tracking-wider text-[10px]">
                        {staff.user.role.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 font-medium">
                      {new Date(staff.joiningDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(staff)}
                        className="p-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition-all cursor-pointer shadow-xs"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(staff.id)}
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
            No staff members found in registry.
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
                {editingStaff ? "Edit Staff Profile" : "Register New Staff Member"}
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
                  <label className="text-[10px] uppercase font-bold text-slate-700">Staff Number *</label>
                  <SegmentedStaffIdInput
                    value={formData.staffNo}
                    onChange={(val) => setFormData({ ...formData, staffNo: val })}
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
                  <label className="text-[10px] uppercase font-bold text-slate-700">Joining Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 font-bold"
                  />
                </div>
              </div>

              {formData.roleName === "LECTURER" && (
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-slate-700">Academic Rank</label>
                    <select
                      value={formData.rank}
                      onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                      className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 font-bold"
                    >
                      <option value="PROFESSOR">Professor</option>
                      <option value="READER">Reader / Associate Prof</option>
                      <option value="SENIOR_LECTURER">Senior Lecturer</option>
                      <option value="LECTURER_I">Lecturer I</option>
                      <option value="LECTURER_II">Lecturer II</option>
                      <option value="ASSISTANT_LECTURER">Assistant Lecturer</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-slate-700">Specialization</label>
                    <input
                      type="text"
                      placeholder="e.g. Clinical Nursing"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                    />
                  </div>
                </div>
              )}

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
                  <span>{isSubmitting ? "Saving..." : editingStaff ? "Update Staff" : "Register Staff"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
