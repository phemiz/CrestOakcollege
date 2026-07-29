"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  BookOpen,
  Loader2
} from "lucide-react";
import { DEFAULT_DEPARTMENTS } from "@/constants/institutionalData";

interface ProgrammeItem {
  id: string;
  name: string;
  code: string;
  durationYears: number;
  degreeAwarded: string;
  department: {
    id: string;
    name: string;
  };
}

interface DepartmentItem {
  id: string;
  name: string;
}

interface ProgrammesClientProps {
  programmes: ProgrammeItem[];
  departments: DepartmentItem[];
}

export default function ProgrammesClient({ programmes: initialProgrammes, departments: rawDepartments }: ProgrammesClientProps) {
  const departments = (rawDepartments && rawDepartments.length > 0)
    ? rawDepartments
    : DEFAULT_DEPARTMENTS.map((d, i) => ({ id: `dept-${i + 1}`, name: d }));

  const router = useRouter();
  const [programmes, setProgrammes] = useState<ProgrammeItem[]>(initialProgrammes);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProg, setEditingProg] = useState<ProgrammeItem | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    durationYears: 4,
    degreeAwarded: "B.Sc.",
    departmentId: departments[0]?.id || ""
  });

  const openAddModal = () => {
    setEditingProg(null);
    setFormData({
      name: "",
      code: "",
      durationYears: 4,
      degreeAwarded: "B.Sc.",
      departmentId: departments[0]?.id || ""
    });
    setIsModalOpen(true);
  };

  const openEditModal = (prog: ProgrammeItem) => {
    setEditingProg(prog);
    setFormData({
      name: prog.name,
      code: prog.code,
      durationYears: prog.durationYears,
      degreeAwarded: prog.degreeAwarded,
      departmentId: prog.department.id
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.degreeAwarded) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        id: editingProg?.id,
        type: "programme"
      };
      const res = await fetch("/api/admin/programmes.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        const selectedDept = departments.find((d) => d.id === formData.departmentId) || { id: "dept-1", name: "Department" };
        const updatedItem: ProgrammeItem = {
          id: editingProg ? editingProg.id : `prog-${rand()}`,
          name: formData.name,
          code: formData.code,
          durationYears: formData.durationYears,
          degreeAwarded: formData.degreeAwarded,
          department: selectedDept
        };
        if (editingProg) {
          setProgrammes((prev) => prev.map((p) => (p.id === editingProg.id ? updatedItem : p)));
        } else {
          setProgrammes((prev) => [updatedItem, ...prev]);
        }
        setIsModalOpen(false);
        router.refresh();
      } else {
        alert("Error saving programme: " + (data.message || "Failed"));
      }
    } catch (err: any) {
      alert("Submission error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to soft-delete this academic programme?")) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/programmes.php", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type: "programme" })
      });
      const data = await res.json();
      if (data.success) {
        setProgrammes((prev) => prev.filter((p) => p.id !== id));
        router.refresh();
      } else {
        alert("Error deleting programme: " + (data.message || "Failed"));
      }
    } catch (err: any) {
      alert("Delete error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  function rand() {
    return Math.floor(1000 + Math.random() * 9000);
  }

  const filteredProgrammes = programmes.filter((prog) => {
    return (
      prog.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prog.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prog.department.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-black text-slate-900">Academic Programmes</h2>
          <p className="text-xs text-slate-500 mt-1">Configure accredited courses, degree specifications, and study durations in real time.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-red-600 hover:bg-red-700 text-white font-display font-bold py-2.5 px-5 rounded-xl text-xs transition-all flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <BookOpen className="h-4.5 w-4.5" />
          <span>Add New Programme</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs relative">
        <Search className="absolute left-7 top-7 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search programme by title, code, or managing department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
        />
      </div>

      {/* Programmes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProgrammes.map((prog) => (
          <div
            key={prog.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="bg-red-50 text-red-700 font-mono font-bold text-[10px] px-2.5 py-1 rounded border border-red-100 uppercase">
                  {prog.code}
                </span>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                  {prog.durationYears} Years
                </span>
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-900 text-sm leading-tight">{prog.name}</h3>
                <p className="text-slate-500 text-xs mt-1">{prog.department.name}</p>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Degree Awarded</span>
                <span className="text-xs font-bold text-slate-800">{prog.degreeAwarded}</span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => openEditModal(prog)}
                className="p-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition-all cursor-pointer shadow-xs"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleDelete(prog.id)}
                className="p-2 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-lg text-slate-600 transition-all cursor-pointer shadow-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white sticky top-0 z-10">
              <h3 className="font-display font-black text-sm tracking-widest uppercase text-slate-900">
                {editingProg ? "Edit Programme Specification" : "Create New Programme"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-semibold text-slate-800">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-700">Programme Title *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Nursing Sciences (B.N.Sc)"
                  className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">Programme Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. NUR"
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 font-mono font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">Duration (Years) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={6}
                    value={formData.durationYears}
                    onChange={(e) => setFormData({ ...formData, durationYears: Number(e.target.value) })}
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">Degree / Award *</label>
                  <input
                    type="text"
                    required
                    value={formData.degreeAwarded}
                    onChange={(e) => setFormData({ ...formData, degreeAwarded: e.target.value })}
                    placeholder="e.g. B.N.Sc."
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">Managing Department *</label>
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
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Plus className="h-4 w-4" />}
                  <span>{isSubmitting ? "Saving..." : editingProg ? "Update Specification" : "Create Programme"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
