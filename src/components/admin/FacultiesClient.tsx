"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  upsertFaculty,
  upsertDepartment,
  deleteFaculty,
  deleteDepartment
} from "@/app/actions/admin-actions";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Building2,
  Save,
  BookOpen,
  UserCheck,
  ChevronRight,
  School
} from "lucide-react";

interface LecturerDropdown {
  id: string;
  name: string;
}

interface DepartmentItem {
  id: string;
  name: string;
  code: string;
  description: string | null;
  headOfDepartment: {
    staff: {
      user: {
        firstName: string;
        lastName: string;
      };
    };
  } | null;
}

interface FacultyItem {
  id: string;
  name: string;
  code: string;
  description: string | null;
  dean: {
    staff: {
      user: {
        firstName: string;
        lastName: string;
      };
    };
  } | null;
  departments: DepartmentItem[];
}

interface FacultiesClientProps {
  faculties: FacultyItem[];
  lecturers: LecturerDropdown[];
}

export default function FacultiesClient({ faculties, lecturers }: FacultiesClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Selected faculty for department viewing
  const [activeFaculty, setActiveFaculty] = useState<FacultyItem | null>(faculties[0] || null);

  // Modals
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<FacultyItem | null>(null);
  const [editingDept, setEditingDept] = useState<DepartmentItem | null>(null);

  // Faculty Form State
  const [facultyForm, setFacultyForm] = useState({
    name: "",
    code: "",
    description: "",
    deanId: ""
  });

  // Department Form State
  const [deptForm, setDeptForm] = useState({
    name: "",
    code: "",
    description: "",
    facultyId: "",
    headOfDepartmentId: ""
  });

  const openAddFaculty = () => {
    setEditingFaculty(null);
    setFacultyForm({
      name: "",
      code: "",
      description: "",
      deanId: lecturers[0]?.id || ""
    });
    setIsFacultyModalOpen(true);
  };

  const openEditFaculty = (fac: FacultyItem) => {
    setEditingFaculty(fac);
    setFacultyForm({
      name: fac.name,
      code: fac.code,
      description: fac.description || "",
      deanId: lecturers.find(l => l.name === `${fac.dean?.staff.user.firstName} ${fac.dean?.staff.user.lastName}`)?.id || ""
    });
    setIsFacultyModalOpen(true);
  };

  const handleFacultySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facultyForm.name || !facultyForm.code) {
      alert("Please fill in required fields.");
      return;
    }

    startTransition(async () => {
      const payload = {
        ...facultyForm,
        id: editingFaculty?.id
      };
      const res = await upsertFaculty(payload);
      if (res.success) {
        setIsFacultyModalOpen(false);
        router.refresh();
      } else {
        alert("Error saving faculty: " + res.error);
      }
    });
  };

  const handleFacultyDelete = async (id: string) => {
    if (!confirm("Delete this faculty profile?")) return;

    startTransition(async () => {
      const res = await deleteFaculty(id);
      if (res.success) {
        router.refresh();
      } else {
        alert("Error deleting faculty: " + res.error);
      }
    });
  };

  const openAddDept = (facId: string) => {
    setEditingDept(null);
    setDeptForm({
      name: "",
      code: "",
      description: "",
      facultyId: facId,
      headOfDepartmentId: lecturers[0]?.id || ""
    });
    setIsDeptModalOpen(true);
  };

  const openEditDept = (dept: DepartmentItem, facId: string) => {
    setEditingDept(dept);
    setDeptForm({
      name: dept.name,
      code: dept.code,
      description: dept.description || "",
      facultyId: facId,
      headOfDepartmentId: lecturers.find(l => l.name === `${dept.headOfDepartment?.staff.user.firstName} ${dept.headOfDepartment?.staff.user.lastName}`)?.id || ""
    });
    setIsDeptModalOpen(true);
  };

  const handleDeptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name || !deptForm.code || !deptForm.facultyId) {
      alert("Please fill in required fields.");
      return;
    }

    startTransition(async () => {
      const payload = {
        ...deptForm,
        id: editingDept?.id
      };
      const res = await upsertDepartment(payload);
      if (res.success) {
        setIsDeptModalOpen(false);
        router.refresh();
      } else {
        alert("Error saving department: " + res.error);
      }
    });
  };

  const handleDeptDelete = async (id: string) => {
    if (!confirm("Delete this department?")) return;

    startTransition(async () => {
      const res = await deleteDepartment(id);
      if (res.success) {
        router.refresh();
      } else {
        alert("Error deleting department: " + res.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-black text-white">Faculty & Departments</h2>
          <p className="text-xs text-slate-400 mt-1">Configure academic faculties, assign deans, and segmented department centers.</p>
        </div>
        <button
          onClick={openAddFaculty}
          className="bg-red-600 hover:bg-red-700 text-white font-display font-bold py-2.5 px-5 rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-red-950/20"
        >
          <Building2 className="h-4.5 w-4.5" />
          <span>Create Faculty</span>
        </button>
      </div>

      {/* Dual Panel Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Faculty Selection List */}
        <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Faculties Directory ({faculties.length})
          </h3>

          <div className="space-y-3">
            {faculties.map((fac) => (
              <div
                key={fac.id}
                onClick={() => setActiveFaculty(fac)}
                className={`bg-slate-900/60 border p-4 rounded-xl cursor-pointer transition-all hover:bg-slate-900 flex justify-between items-center ${
                  activeFaculty?.id === fac.id ? "border-red-500 bg-slate-900" : "border-slate-850"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200 truncate">{fac.name}</span>
                    <span className="bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-bold px-1.5 py-0.5 rounded font-mono">
                      {fac.code}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">
                    Dean: {fac.dean ? `${fac.dean.staff.user.firstName} ${fac.dean.staff.user.lastName}` : "None Assigned"}
                  </p>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => openEditFaculty(fac)}
                    className="p-1.5 bg-slate-900 border border-slate-850 hover:bg-slate-850 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleFacultyDelete(fac.id)}
                    className="p-1.5 bg-slate-900 border border-slate-850 hover:bg-red-950/40 hover:text-red-400 hover:border-red-900/30 rounded-lg text-slate-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <ChevronRight className="h-4.5 w-4.5 text-slate-500 hidden sm:block" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Departments Nested */}
        <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
          {activeFaculty ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-850">
                <div>
                  <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Nested segments</span>
                  <h3 className="text-sm font-bold text-slate-200 mt-0.5">
                    {activeFaculty.name} Departments ({activeFaculty.departments.length})
                  </h3>
                </div>
                <button
                  onClick={() => openAddDept(activeFaculty.id)}
                  className="bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-200 font-display font-bold py-1.5 px-3.5 rounded-lg text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Add Dept
                </button>
              </div>

              {activeFaculty.departments.length > 0 ? (
                <div className="space-y-3">
                  {activeFaculty.departments.map((dept) => (
                    <div
                      key={dept.id}
                      className="bg-slate-900/40 border border-slate-850/80 p-4 rounded-xl flex justify-between items-center text-xs text-slate-350"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200">{dept.name}</span>
                          <span className="bg-slate-950 border border-slate-850 text-[10px] text-slate-400 font-bold px-1 py-0.5 rounded font-mono">
                            {dept.code}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                          HOD: {dept.headOfDepartment ? `${dept.headOfDepartment.staff.user.firstName} ${dept.headOfDepartment.staff.user.lastName}` : "None"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditDept(dept, activeFaculty.id)}
                          className="p-1.5 bg-slate-950 border border-slate-850 hover:bg-slate-850 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeptDelete(dept.id)}
                          className="p-1.5 bg-slate-950 border border-slate-850 hover:bg-red-950/40 hover:text-red-400 hover:border-red-900/30 rounded-lg text-slate-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 border border-dashed border-slate-850 rounded-xl text-center text-slate-500 font-bold uppercase tracking-widest text-[10px] bg-slate-900/10">
                  No departments created in this faculty yet.
                </div>
              )}
            </div>
          ) : (
            <div className="py-16 text-center text-slate-500 font-bold uppercase tracking-widest text-[11px]">
              Select a faculty to configure department segments.
            </div>
          )}
        </div>
      </div>

      {/* Faculty Modal Dialog */}
      {isFacultyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl">
            <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/50">
              <h3 className="font-display font-black text-sm tracking-widest uppercase text-white">
                {editingFaculty ? "Edit Faculty Configuration" : "Create University Faculty"}
              </h3>
              <button
                onClick={() => setIsFacultyModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFacultySubmit} className="p-6 space-y-4 text-xs font-semibold text-slate-350">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Faculty Name *</label>
                <input
                  type="text"
                  required
                  value={facultyForm.name}
                  onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                  placeholder="e.g. Faculty of Science"
                  className="p-3 bg-slate-900 border border-slate-850 rounded-xl focus:outline-none focus:border-red-600 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Faculty Code *</label>
                  <input
                    type="text"
                    required
                    value={facultyForm.code}
                    onChange={(e) => setFacultyForm({ ...facultyForm, code: e.target.value })}
                    placeholder="e.g. SCI"
                    className="p-3 bg-slate-900 border border-slate-850 rounded-xl focus:outline-none focus:border-red-600 text-slate-200 font-mono font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Dean in Charge</label>
                  <select
                    value={facultyForm.deanId}
                    onChange={(e) => setFacultyForm({ ...facultyForm, deanId: e.target.value })}
                    className="p-3 bg-slate-900 border border-slate-850 rounded-xl focus:outline-none focus:border-red-600 text-slate-200 font-bold"
                  >
                    <option value="">No Dean Assigned</option>
                    {lecturers.map((lec) => (
                      <option key={lec.id} value={lec.id}>
                        {lec.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Description</label>
                <textarea
                  rows={3}
                  value={facultyForm.description}
                  onChange={(e) => setFacultyForm({ ...facultyForm, description: e.target.value })}
                  placeholder="Details regarding departments under this faculty..."
                  className="p-3 bg-slate-900 border border-slate-850 rounded-xl focus:outline-none focus:border-red-600 text-slate-200 resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFacultyModalOpen(false)}
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-800 px-5 py-3 rounded-xl text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-red-950/10"
                >
                  <Plus className="h-4 w-4" />
                  <span>{isPending ? "Saving..." : editingFaculty ? "Save Changes" : "Create Faculty"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Department Modal Dialog */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl">
            <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/50">
              <h3 className="font-display font-black text-sm tracking-widest uppercase text-white">
                {editingDept ? "Edit Department Configuration" : "Create Department Segment"}
              </h3>
              <button
                onClick={() => setIsDeptModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleDeptSubmit} className="p-6 space-y-4 text-xs font-semibold text-slate-350">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Department Name *</label>
                <input
                  type="text"
                  required
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  placeholder="e.g. Computer Science & IT"
                  className="p-3 bg-slate-900 border border-slate-850 rounded-xl focus:outline-none focus:border-red-600 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Department Code *</label>
                  <input
                    type="text"
                    required
                    value={deptForm.code}
                    onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                    placeholder="e.g. CSC"
                    className="p-3 bg-slate-900 border border-slate-850 rounded-xl focus:outline-none focus:border-red-600 text-slate-200 font-mono font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Head of Department (HOD)</label>
                  <select
                    value={deptForm.headOfDepartmentId}
                    onChange={(e) => setDeptForm({ ...deptForm, headOfDepartmentId: e.target.value })}
                    className="p-3 bg-slate-900 border border-slate-850 rounded-xl focus:outline-none focus:border-red-600 text-slate-200 font-bold"
                  >
                    <option value="">No HOD Assigned</option>
                    {lecturers.map((lec) => (
                      <option key={lec.id} value={lec.id}>
                        {lec.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Description</label>
                <textarea
                  rows={3}
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  placeholder="Course specialization offerings in this department..."
                  className="p-3 bg-slate-900 border border-slate-850 rounded-xl focus:outline-none focus:border-red-600 text-slate-200 resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-800 px-5 py-3 rounded-xl text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-red-950/10"
                >
                  <Plus className="h-4 w-4" />
                  <span>{isPending ? "Saving..." : editingDept ? "Save Changes" : "Create Department"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
