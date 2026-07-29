"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Building2,
  ChevronRight,
  School,
  Loader2
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
  headOfDepartment?: {
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
  dean?: {
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

export default function FacultiesClient({ faculties: initialFaculties, lecturers }: FacultiesClientProps) {
  const router = useRouter();
  const [faculties, setFaculties] = useState<FacultyItem[]>(initialFaculties);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeFaculty, setActiveFaculty] = useState<FacultyItem | null>(initialFaculties[0] || null);

  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<FacultyItem | null>(null);
  const [editingDept, setEditingDept] = useState<DepartmentItem | null>(null);

  const [facultyForm, setFacultyForm] = useState({
    name: "",
    code: "",
    description: "",
    deanId: ""
  });

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
      deanId: ""
    });
    setIsFacultyModalOpen(true);
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
      headOfDepartmentId: ""
    });
    setIsDeptModalOpen(true);
  };

  const handleFacultySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facultyForm.name || !facultyForm.code) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/programmes.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...facultyForm, id: editingFaculty?.id, type: "faculty" })
      });
      const data = await res.json();
      if (data.success) {
        const newFac: FacultyItem = {
          id: editingFaculty ? editingFaculty.id : `fac-${Math.floor(1000 + Math.random() * 9000)}`,
          name: facultyForm.name,
          code: facultyForm.code,
          description: facultyForm.description,
          dean: null,
          departments: editingFaculty ? editingFaculty.departments : []
        };
        if (editingFaculty) {
          setFaculties((prev) => prev.map((f) => (f.id === editingFaculty.id ? newFac : f)));
        } else {
          setFaculties((prev) => [...prev, newFac]);
        }
        setIsFacultyModalOpen(false);
        router.refresh();
      } else {
        alert("Error saving faculty: " + (data.message || "Failed"));
      }
    } catch (err: any) {
      alert("Submission error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name || !deptForm.code || !deptForm.facultyId) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/programmes.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...deptForm, id: editingDept?.id, type: "department" })
      });
      const data = await res.json();
      if (data.success) {
        const newDept: DepartmentItem = {
          id: editingDept ? editingDept.id : `dept-${Math.floor(1000 + Math.random() * 9000)}`,
          name: deptForm.name,
          code: deptForm.code,
          description: deptForm.description,
          headOfDepartment: null
        };
        setFaculties((prev) =>
          prev.map((f) => {
            if (f.id === deptForm.facultyId) {
              const updatedDepts = editingDept
                ? f.departments.map((d) => (d.id === editingDept.id ? newDept : d))
                : [...f.departments, newDept];
              return { ...f, departments: updatedDepts };
            }
            return f;
          })
        );
        setIsDeptModalOpen(false);
        router.refresh();
      } else {
        alert("Error saving department: " + (data.message || "Failed"));
      }
    } catch (err: any) {
      alert("Submission error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFaculty = async (id: string) => {
    if (!confirm("Are you sure you want to soft-delete this faculty?")) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/programmes.php", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type: "faculty" })
      });
      const data = await res.json();
      if (data.success) {
        setFaculties((prev) => prev.filter((f) => f.id !== id));
        if (activeFaculty?.id === id) setActiveFaculty(null);
        router.refresh();
      }
    } catch (err: any) {
      alert("Delete error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDept = async (deptId: string, facId: string) => {
    if (!confirm("Are you sure you want to soft-delete this department?")) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/programmes.php", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deptId, type: "department" })
      });
      const data = await res.json();
      if (data.success) {
        setFaculties((prev) =>
          prev.map((f) =>
            f.id === facId
              ? { ...f, departments: f.departments.filter((d) => d.id !== deptId) }
              : f
          )
        );
        router.refresh();
      }
    } catch (err: any) {
      alert("Delete error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-black text-slate-900">Faculties & Departments</h2>
          <p className="text-xs text-slate-500 mt-1">Organize academic faculties, specialized departments, and deanships in real time.</p>
        </div>
        <button
          onClick={openAddFaculty}
          className="bg-red-600 hover:bg-red-700 text-white font-display font-bold py-2.5 px-5 rounded-xl text-xs transition-all flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Building2 className="h-4.5 w-4.5" />
          <span>Add New Faculty</span>
        </button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Faculty Cards */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-display font-bold text-xs uppercase tracking-widest text-slate-500">
            Faculties List ({faculties.length})
          </h3>
          <div className="space-y-3">
            {faculties.map((fac) => {
              const isSelected = activeFaculty?.id === fac.id;
              return (
                <div
                  key={fac.id}
                  onClick={() => setActiveFaculty(fac)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-3 shadow-xs ${
                    isSelected
                      ? "border-slate-900 bg-white shadow-md"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono font-bold text-[10px] bg-red-50 text-red-700 border border-red-100 px-2.5 py-1 rounded">
                      {fac.code}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditFaculty(fac);
                        }}
                        className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 cursor-pointer"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFaculty(fac.id);
                        }}
                        className="p-1.5 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 rounded-lg text-slate-600 cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-slate-900 text-sm">{fac.name}</h4>
                    <p className="text-slate-500 text-xs mt-1 line-clamp-2">{fac.description}</p>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-500 font-medium">
                      {fac.departments.length} Departments
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Departments Panel */}
        <div className="lg:col-span-7 space-y-4">
          {activeFaculty ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                    {activeFaculty.code}
                  </span>
                  <h3 className="font-display font-black text-slate-900 text-lg mt-1">{activeFaculty.name}</h3>
                  <p className="text-slate-500 text-xs mt-0.5">{activeFaculty.description}</p>
                </div>
                <button
                  onClick={() => openAddDept(activeFaculty.id)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Department</span>
                </button>
              </div>

              {/* Department items */}
              <div className="space-y-3">
                {activeFaculty.departments.length > 0 ? (
                  activeFaculty.departments.map((dept) => (
                    <div
                      key={dept.id}
                      className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex justify-between items-center"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[10px] bg-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded">
                            {dept.code}
                          </span>
                          <h4 className="font-bold text-slate-900 text-xs">{dept.name}</h4>
                        </div>
                        {dept.description && (
                          <p className="text-slate-500 text-[11px] mt-1">{dept.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => openEditDept(dept, activeFaculty.id)}
                          className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 cursor-pointer shadow-xs"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDept(dept.id, activeFaculty.id)}
                          className="p-1.5 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 rounded-lg text-slate-600 cursor-pointer shadow-xs"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-slate-500 font-bold uppercase tracking-widest text-xs bg-slate-50 rounded-xl border border-slate-200">
                    No departments added to this faculty yet.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-20 bg-white border border-slate-200 rounded-2xl text-center text-slate-500 font-bold text-xs uppercase tracking-widest">
              Select a faculty to view departments.
            </div>
          )}
        </div>
      </div>

      {/* Faculty Modal */}
      {isFacultyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white">
              <h3 className="font-display font-black text-sm tracking-widest uppercase text-slate-900">
                {editingFaculty ? "Edit Faculty" : "Create New Faculty"}
              </h3>
              <button onClick={() => setIsFacultyModalOpen(false)} className="text-slate-400 hover:text-slate-900 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleFacultySubmit} className="p-6 space-y-4 text-xs font-semibold text-slate-800">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-700">Faculty Title *</label>
                <input
                  type="text"
                  required
                  value={facultyForm.name}
                  onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                  placeholder="e.g. Faculty of Health Sciences"
                  className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-700">Faculty Code *</label>
                <input
                  type="text"
                  required
                  value={facultyForm.code}
                  onChange={(e) => setFacultyForm({ ...facultyForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. FHS"
                  className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 font-mono font-bold"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-700">Description</label>
                <textarea
                  rows={3}
                  value={facultyForm.description}
                  onChange={(e) => setFacultyForm({ ...facultyForm, description: e.target.value })}
                  className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsFacultyModalOpen(false)}
                  className="bg-white hover:bg-slate-100 border border-slate-300 px-5 py-2.5 rounded-xl text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Plus className="h-4 w-4" />}
                  <span>{isSubmitting ? "Saving..." : "Save Faculty"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Department Modal */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white">
              <h3 className="font-display font-black text-sm tracking-widest uppercase text-slate-900">
                {editingDept ? "Edit Department" : "Add Department"}
              </h3>
              <button onClick={() => setIsDeptModalOpen(false)} className="text-slate-400 hover:text-slate-900 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleDeptSubmit} className="p-6 space-y-4 text-xs font-semibold text-slate-800">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-700">Department Name *</label>
                <input
                  type="text"
                  required
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  placeholder="e.g. Department of Nursing Sciences"
                  className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-700">Department Code *</label>
                <input
                  type="text"
                  required
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. NUR"
                  className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 font-mono font-bold"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="bg-white hover:bg-slate-100 border border-slate-300 px-5 py-2.5 rounded-xl text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Plus className="h-4 w-4" />}
                  <span>{isSubmitting ? "Saving..." : "Save Department"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
