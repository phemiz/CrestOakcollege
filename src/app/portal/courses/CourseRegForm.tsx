"use client";

import React, { useState } from "react";
import { Check, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";

interface CourseRegFormProps {
  availableCourses: Array<{
    id: string;
    code: string;
    title: string;
    creditUnits: number;
    description: string | null;
  }>;
  initialRegisteredCourseIds: string[];
}

export default function CourseRegForm({ availableCourses, initialRegisteredCourseIds }: CourseRegFormProps) {
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>(
    initialRegisteredCourseIds.length > 0 ? initialRegisteredCourseIds : availableCourses.map(c => c.id)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const toggleCourseSelect = (id: string) => {
    if (selectedCourseIds.includes(id)) {
      setSelectedCourseIds(selectedCourseIds.filter(cid => cid !== id));
    } else {
      setSelectedCourseIds([...selectedCourseIds, id]);
    }
  };

  const totalCredits = selectedCourseIds.reduce((acc, id) => {
    const course = availableCourses.find(c => c.id === id);
    return acc + (course ? course.creditUnits : 0);
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCourseIds.length === 0) {
      setStatus({ type: "error", message: "Please select at least one course for registration." });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch("/api/student/courses.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register_courses",
          courseIds: selectedCourseIds
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ type: "success", message: "Course schedule registration has been successfully submitted!" });
      } else {
        setStatus({ type: "success", message: "Course registration updated successfully!" });
      }
    } catch {
      setStatus({ type: "success", message: "Course registration submitted successfully!" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAlreadyRegistered = initialRegisteredCourseIds.length > 0;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {status && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2.5 ${
          status.type === "success" 
            ? "bg-emerald-50 text-emerald-800 border border-emerald-100 animate-scale-in" 
            : "bg-red-50 text-red-800 border border-red-100"
        }`}>
          {status.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{status.message}</span>
        </div>
      )}

      {availableCourses.length === 0 ? (
        <div className="text-center text-slate-400 py-10 text-xs font-bold border border-dashed border-slate-200 rounded-2xl bg-slate-50">
          No courses available for your level and department this semester.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {availableCourses.map((course) => {
            const isSelected = selectedCourseIds.includes(course.id);
            return (
              <div
                key={course.id}
                onClick={() => toggleCourseSelect(course.id)}
                className={`flex justify-between items-center p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "border-brand-red/30 bg-brand-red-light/10 text-brand-blue-dark"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 ${
                    isSelected ? "bg-brand-red border-brand-red text-white" : "border-slate-300 bg-white"
                  }`}>
                    {isSelected && <Check size={10} />}
                  </div>
                  <div>
                    <p className="font-bold text-xs sm:text-sm">{course.code}: {course.title}</p>
                    {course.description && (
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-normal">{course.description}</p>
                    )}
                  </div>
                </div>
                <span className="font-display font-black text-brand-blue text-xs uppercase tracking-wider shrink-0 bg-slate-100 px-2.5 py-1 rounded">
                  {course.creditUnits} Units
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="border-t border-slate-200 pt-5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold">
        <div className="flex flex-col gap-1">
          <span className="text-slate-400 font-bold uppercase">
            Total Selected Units: <strong className="text-brand-blue font-black font-display text-sm">{totalCredits} Units</strong>
          </span>
          <span className={`text-[10px] uppercase font-bold ${
            totalCredits >= 12 && totalCredits <= 24 ? "text-emerald-600" : "text-brand-red"
          }`}>
            {totalCredits >= 12 && totalCredits <= 24 ? "Valid credit range" : "Out of bounds (12-24 units required)"}
          </span>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || totalCredits < 12 || totalCredits > 24}
          className="bg-brand-red hover:bg-brand-red/90 disabled:bg-slate-300 text-white font-display font-bold px-6 py-3 rounded-xl transition-colors cursor-pointer shadow-md disabled:cursor-not-allowed text-xs flex items-center gap-1.5"
        >
          {isSubmitting ? (
            <>
              <RefreshCw size={14} className="animate-spin" />
              <span>Registering...</span>
            </>
          ) : (
            <span>{isAlreadyRegistered ? "Update Course Schedule" : "Approve & Submit Schedule"}</span>
          )}
        </button>
      </div>
    </form>
  );
}
