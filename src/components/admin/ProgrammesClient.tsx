"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertAcademicProgramme, deleteAcademicProgramme } from "@/app/actions/admin-actions";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  BookOpen,
  Save,
  GraduationCap
} from "lucide-react";

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

export default function ProgrammesClient({ programmes, departments }: ProgrammesClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Search filter
  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProg, setEditingProg] = useState<ProgrammeItem | null>(null);

  // Form State
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

    startTransition(async () => {
      const payload = {
        ...formData,
        id: editingProg?.id
      };
      const res = await upsertAcademicProgramme(payload);
      if (res.success) {
        setIsModalOpen(false);
        router.refresh();
      } else {
        alert("Error saving programme: " + res.error);
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to soft-delete this academic programme?")) return;

    startTransition(async () => {
      const res = await deleteAcademicProgramme(id);
      if (res.success) {
        router.refresh();
      } else {
        alert("Error deleting programme: " + res.error);
      }
    });
  };

  // Filter list
  const filteredProgrammes = programmes.filter((prog) => {
    return (
      prog.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prog.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prog.department.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Title & Add Programme Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-black text-white">Academic Programmes</h2>
          <p className="text-xs text-slate-400 mt-1">Configure degree streams, study duration bounds, and department links.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-red-600 hover:bg-red-700 text-white font-display font-bold py-2.5 px-5 rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-red-950/20"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Add Programme</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <Search className="absolute left-7 top-7 h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search programmes by name, degree code, or department name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-850 rounded-xl text-xs font-semibold text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-red-600 transition-colors"
        />
      </div>

      {/* Grid of Programmes */}
      {filteredProgrammes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProgrammes.map((prog) => (
            <div
              key={prog.id}
              className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="bg-red-600/15 border border-red-500/20 text-red-400 font-bold uppercase tracking-wider text-[9px] px-2 py-0.5 rounded">
                    {prog.degreeAwarded}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono font-bold">
                    Code: <strong className="text-slate-300">{prog.code}</strong>
                  </span>
                </div>
                <h3 className="font-display font-bold text-sm text-slate-100 leading-tight">
                  {prog.name}
                </h3>
                <div className="text-[11px] text-slate-400 space-y-1">
                  <p>Department: <strong className="text-slate-300 font-semibold">{prog.department.name}</strong></p>
                  <p>Duration: <strong className="text-slate-350">{prog.durationYears} Academic Years</strong></p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-900 flex justify-end gap-2">
                <button
                  onClick={() => openEditModal(prog)}
                  className="p-2 bg-slate-900 border border-slate-850 hover:bg-slate-850 hover:text-white rounded-lg text-slate-400 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold px-3"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(prog.id)}
                  className="p-2 bg-slate-900 border border-slate-850 hover:bg-red-950/40 hover:text-red-400 hover:border-red-900/30 rounded-lg text-slate-400 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold px-3"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-slate-500 font-bold uppercase tracking-widest text-[11px] bg-slate-950 border border-slate-800 rounded-2xl">
          No academic programmes configured.
        </div>
      )}

      {/* Editor Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl">
            {/* Modal Header */}
            <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/50">
              <h3 className="font-display font-black text-sm tracking-widest uppercase text-white">
                {editingProg ? "Edit Programme Details" : "Create Academic Programme"}
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
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Programme Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. B.Sc. Computer Science"
                  className="p-3 bg-slate-900 border border-slate-850 rounded-xl focus:outline-none focus:border-red-600 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Programme Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. BSC-CSC"
                    className="p-3 bg-slate-900 border border-slate-850 rounded-xl focus:outline-none focus:border-red-600 text-slate-200 font-mono font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Degree Awarded *</label>
                  <input
                    type="text"
                    required
                    value={formData.degreeAwarded}
                    onChange={(e) => setFormData({ ...formData, degreeAwarded: e.target.value })}
                    placeholder="e.g. B.Sc., B.Eng., B.N.Sc."
                    className="p-3 bg-slate-900 border border-slate-850 rounded-xl focus:outline-none focus:border-red-600 text-slate-200 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Department Link *</label>
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
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Duration (Years) *</label>
                  <select
                    value={formData.durationYears}
                    onChange={(e) => setFormData({ ...formData, durationYears: Number(e.target.value) })}
                    className="p-3 bg-slate-900 border border-slate-850 rounded-xl focus:outline-none focus:border-red-600 text-slate-200 font-bold"
                  >
                    <option value={1}>1 Year (Diploma)</option>
                    <option value={2}>2 Years (ND)</option>
                    <option value={3}>3 Years (Direct Entry)</option>
                    <option value={4}>4 Years (Standard Bachelor)</option>
                    <option value={5}>5 Years (Engineering/Agriculture)</option>
                  </select>
                </div>
              </div>

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
                  <span>{isPending ? "Saving..." : editingProg ? "Save Changes" : "Create Programme"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
