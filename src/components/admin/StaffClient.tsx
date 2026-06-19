"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertStaffProfile, deleteStaffProfile } from "@/app/actions/admin-actions";
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  UserPlus
} from "lucide-react";

interface StaffItem {
  id: string;
  staffNo: string;
  designation: string;
  joiningDate: Date;
  user: {
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

export default function StaffClient({ staffList, departments }: StaffClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

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
      staffNo: `EMP-${departments[0]?.name.substring(0, 3).toUpperCase() || "REG"}-${Math.floor(100 + Math.random() * 900)}`,
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
    // Find role short-name (LECTURER, STAFF, BURSAR, REGISTRAR)
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

    startTransition(async () => {
      const payload = {
        ...formData,
        id: editingStaff?.id,
        joiningDate: new Date(formData.joiningDate)
      };
      const res = await upsertStaffProfile(payload);
      if (res.success) {
        setIsModalOpen(false);
        router.refresh();
      } else {
        alert("Error saving profile: " + res.error);
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to soft-delete this staff member profile?")) return;

    startTransition(async () => {
      const res = await deleteStaffProfile(id);
      if (res.success) {
        router.refresh();
      } else {
        alert("Error deleting staff: " + res.error);
      }
    });
  };

  // Filter application
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

  // Paginate items
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
          <h2 className="text-xl font-display font-black text-white">Staff Registry</h2>
          <p className="text-xs text-slate-400 mt-1">Manage academic lecturers, bursary experts, registry agents, and HOD leadership status.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-red-600 hover:bg-red-700 text-white font-display font-bold py-2.5 px-5 rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-red-950/20"
        >
          <UserPlus className="h-4.5 w-4.5" />
          <span>Add New Staff</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="md:col-span-6 relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search staff by name, staff number, or designation..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-850 rounded-xl text-xs font-semibold text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-red-600 transition-colors"
          />
        </div>
        <div className="md:col-span-3">
          <select
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-850 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:border-red-600 transition-colors cursor-pointer"
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
            className="w-full px-4 py-3 bg-slate-900 border border-slate-850 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:border-red-600 transition-colors cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="LECTURER">Lecturers</option>
            <option value="STAFF">Registry Staff</option>
            <option value="BURSAR">Bursary Staff</option>
          </select>
        </div>
      </div>

      {/* Staff Data Grid */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
        {paginatedStaff.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-4 px-5">Name</th>
                  <th className="py-4 px-5">Staff No</th>
                  <th className="py-4 px-5">Designation</th>
                  <th className="py-4 px-5">Role/Scope</th>
                  <th className="py-4 px-5">Joining Date</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {paginatedStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="py-4 px-5 font-semibold text-slate-200">
                      {staff.user.firstName} {staff.user.lastName}
                      <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                        {staff.user.email}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-mono font-bold text-slate-300">{staff.staffNo}</td>
                    <td className="py-4 px-5 text-slate-300">
                      {staff.designation}
                      {staff.lecturer && (
                        <span className="block text-[10px] text-slate-400 font-normal italic">
                          Specialization: {staff.lecturer.specialization || "None"}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      <span className="bg-slate-900 px-2.5 py-1 rounded text-red-400 border border-red-950/20 font-bold uppercase tracking-wider text-[10px]">
                        {staff.user.role.name}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-400 font-medium">
                      {new Date(staff.joiningDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-5 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(staff)}
                        className="p-2 bg-slate-900 border border-slate-850 hover:bg-slate-850 hover:text-white rounded-lg text-slate-400 transition-all cursor-pointer"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(staff.id)}
                        className="p-2 bg-slate-900 border border-slate-850 hover:bg-red-950/40 hover:text-red-400 hover:border-red-900/30 rounded-lg text-slate-400 transition-all cursor-pointer"
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
          <div className="py-16 text-center text-slate-500 font-bold uppercase tracking-widest text-[11px] bg-slate-950">
            No staff records found.
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-5 py-4 border-t border-slate-800 text-xs font-bold text-slate-400 bg-slate-950/40">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((c) => Math.max(c - 1, 1))}
                className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((c) => Math.min(c + 1, totalPages))}
                className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/50 sticky top-0 z-10">
              <h3 className="font-display font-black text-sm tracking-widest uppercase text-white">
                {editingStaff ? "Edit Staff Details" : "Register New Staff Member"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-semibold text-slate-350">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="p-3 bg-slate-900 border border-slate-850 rounded-xl focus:outline-none focus:border-red-600 text-slate-200"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="p-3 bg-slate-900 border border-slate-850 rounded-xl focus:outline-none focus:border-red-600 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Middle Name</label>
                  <input
                    type="text"
                    value={formData.middleName}
                    onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                    className="p-3 bg-slate-900 border border-slate-850 rounded-xl focus:outline-none focus:border-red-600 text-slate-200"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Staff ID Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.staffNo}
                    onChange={(e) => setFormData({ ...formData, staffNo: e.target.value })}
                    className="p-3 bg-slate-900 border border-slate-850 rounded-xl focus:outline-none focus:border-red-600 text-slate-200 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="p-3 bg-slate-900 border border-slate-850 rounded-xl focus:outline-none focus:border-red-600 text-slate-200"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="p-3 bg-slate-900 border border-slate-850 rounded-xl focus:outline-none focus:border-red-600 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Designation *</label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Senior Lecturer, Bursar, Registry Admin"
                    className="p-3 bg-slate-900 border border-slate-850 rounded-xl focus:outline-none focus:border-red-600 text-slate-200"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Department *</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="p-3 bg-slate-900 border border-slate-850 rounded-xl focus:outline-none focus:border-red-600 text-slate-200 font-bold"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Staff Role Type *</label>
                  <select
                    value={formData.roleName}
                    onChange={(e) => setFormData({ ...formData, roleName: e.target.value as any })}
                    className="p-3 bg-slate-900 border border-slate-850 rounded-xl focus:outline-none focus:border-red-600 text-slate-200 font-bold"
                  >
                    <option value="LECTURER">Lecturer (Academic)</option>
                    <option value="STAFF">Registry (Admin)</option>
                    <option value="BURSAR">Bursary (Finance)</option>
                    <option value="REGISTRAR">Registrar (Academic Admin)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Joining Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="p-3 bg-slate-900 border border-slate-850 rounded-xl focus:outline-none focus:border-red-600 text-slate-200"
                  />
                </div>
              </div>

              {formData.roleName === "LECTURER" && (
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 space-y-4">
                  <h4 className="font-display font-extrabold text-[10px] text-red-500 uppercase tracking-widest leading-none">Lecturer Credentials</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Academic Rank *</label>
                      <select
                        value={formData.rank}
                        onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                        className="p-3 bg-slate-900 border border-slate-850 rounded-xl focus:outline-none focus:border-red-600 text-slate-200 font-bold"
                      >
                        <option value="ASSISTANT_LECTURER">Assistant Lecturer</option>
                        <option value="LECTURER_II">Lecturer II</option>
                        <option value="LECTURER_I">Lecturer I</option>
                        <option value="SENIOR_LECTURER">Senior Lecturer</option>
                        <option value="READER">Reader</option>
                        <option value="PROFESSOR">Professor</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Area of Specialization</label>
                      <input
                        type="text"
                        value={formData.specialization}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                        placeholder="e.g. Distributed Systems, ML"
                        className="p-3 bg-slate-900 border border-slate-850 rounded-xl focus:outline-none focus:border-red-600 text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-800 px-5 py-3 rounded-xl text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-red-950/10"
                >
                  <Plus className="h-4 w-4" />
                  <span>{isPending ? "Saving..." : editingStaff ? "Update Details" : "Register Staff"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
