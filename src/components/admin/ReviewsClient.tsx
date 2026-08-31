"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Loader2,
  MessageSquare,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

type ReviewItem = {
  id: string | number;
  reviewer_name: string;
  reviewer_role: string | null;
  review_text: string;
  photo_url: string | null;
  display_order: number;
  status: string;
  created_at?: string;
  category: string;
  program_or_relation: string | null;
  outcome: string | null;
};

const CATEGORY_LABELS: Record<string, string> = {
  students: "Program",
  alumni: "Program",
  parents: "Relation",
  partners: "Company"
};

const CATEGORY_OPTIONS = [
  { value: "students", label: "Students" },
  { value: "alumni", label: "Alumni" },
  { value: "parents", label: "Parents" },
  { value: "partners", label: "Partners" }
];

type FormDataShape = {
  reviewerName: string;
  reviewerRole: string;
  reviewText: string;
  category: string;
  programOrRelation: string;
  outcome: string;
  displayOrder: number;
  status: "ACTIVE" | "INACTIVE";
  photoBase64: string | null;
  existingPhotoUrl: string | null;
};

const DEFAULT_FORM: FormDataShape = {
  reviewerName: "",
  reviewerRole: "",
  reviewText: "",
  category: "students",
  programOrRelation: "",
  outcome: "",
  displayOrder: 0,
  status: "ACTIVE",
  photoBase64: null,
  existingPhotoUrl: null
};

export default function ReviewsClient() {
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);
  const [formData, setFormData] = useState<FormDataShape>(DEFAULT_FORM);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const authHeaders = () => ({
    "Authorization": `Bearer ${localStorage.getItem("sessionToken")}`,
    "X-CSRF-Token": localStorage.getItem("csrfToken") || ""
  });

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/reviews.php?t=" + Date.now(), {
        headers: authHeaders()
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.reviews)) {
        setReviews(data.reviews);
      }
    } catch (err: any) {
      alert("Error loading reviews: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const openAddModal = () => {
    setEditingReview(null);
    setFormData(DEFAULT_FORM);
    setPhotoPreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (review: ReviewItem) => {
    setEditingReview(review);
    setFormData({
      reviewerName: review.reviewer_name || "",
      reviewerRole: review.reviewer_role || "",
      reviewText: review.review_text || "",
      category: review.category || "students",
      programOrRelation: review.program_or_relation || "",
      outcome: review.outcome || "",
      displayOrder: review.display_order || 0,
      status: (review.status as "ACTIVE" | "INACTIVE") || "ACTIVE",
      photoBase64: null,
      existingPhotoUrl: review.photo_url || null
    });
    setPhotoPreview(review.photo_url || null);
    setIsModalOpen(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Please select a JPG, PNG, or WEBP image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setFormData((prev) => ({ ...prev, photoBase64: base64 }));
      setPhotoPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setFormData((prev) => ({ ...prev, photoBase64: null, existingPhotoUrl: null }));
    setPhotoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reviewerName || !formData.reviewText) {
      alert("Reviewer name and review text are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        reviewerName: formData.reviewerName,
        reviewerRole: formData.reviewerRole,
        reviewText: formData.reviewText,
        category: formData.category,
        programOrRelation: formData.programOrRelation,
        outcome: formData.outcome,
        displayOrder: formData.displayOrder,
        status: formData.status,
        photoBase64: formData.photoBase64,
        existingPhotoUrl: formData.existingPhotoUrl
      };
      if (editingReview) {
        payload.id = editingReview.id;
      }

      const res = await fetch("/api/admin/reviews.php", {
        method: editingReview ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders()
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setIsModalOpen(false);
        await fetchReviews();
        router.refresh();
      } else {
        alert("Error saving review: " + (data.message || "Failed to save."));
      }
    } catch (err: any) {
      alert("Error saving review: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/reviews.php", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders()
        },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert("Error deleting review: " + (data.message || "Failed"));
      }
    } catch (err: any) {
      alert("Delete error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const nameMatch = (r.reviewer_name || "").toLowerCase().includes(searchTerm.toLowerCase());
      const textMatch = (r.review_text || "").toLowerCase().includes(searchTerm.toLowerCase());
      const searchMatch = searchTerm === "" || nameMatch || textMatch;
      const catMatch = categoryFilter === "ALL" || r.category === categoryFilter;
      return searchMatch && catMatch;
    });
  }, [reviews, searchTerm, categoryFilter]);

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage) || 1;
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const currentLabel = CATEGORY_LABELS[formData.category] || "Program / Relation";

  return (
    <div className="space-y-6">
      {/* Title & Add Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-black text-slate-900">Homepage Reviews & Testimonials</h2>
          <p className="text-xs text-slate-500 mt-1">Manage student, alumni, parent, and partner reviews shown on the public homepage carousel.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-red-600 hover:bg-red-700 text-white font-display font-bold py-2.5 px-5 rounded-xl text-xs transition-all flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Add Review</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="md:col-span-8 relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search reviews by reviewer name or text..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
          />
        </div>
        <div className="md:col-span-4">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
          >
            <option value="ALL">All Categories</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Reviewer</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Review</th>
                <th className="py-3.5 px-4">Outcome</th>
                <th className="py-3.5 px-4">Order</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    Loading reviews...
                  </td>
                </tr>
              ) : paginatedReviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    No reviews match your filters.
                  </td>
                </tr>
              ) : (
                paginatedReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        {review.photo_url ? (
                          <img
                            src={review.photo_url}
                            alt={review.reviewer_name}
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                            <ImageIcon className="h-3.5 w-3.5 text-slate-300" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900">{review.reviewer_name}</div>
                          <div className="text-[11px] text-slate-400">
                            {review.reviewer_role || review.program_or_relation || "—"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200">
                        {review.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-slate-600 line-clamp-2">{review.review_text}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      {review.outcome ? (
                        <span className="text-[10px] font-bold text-brand-red bg-brand-red-light px-2.5 py-0.5 rounded-full uppercase whitespace-nowrap">
                          {review.outcome}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">{review.display_order}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          (review.status || "ACTIVE") === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {review.status || "ACTIVE"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(review)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Review"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Review"
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

      {/* Add / Edit Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-xl font-display font-black text-slate-900">
                  {editingReview ? "Edit Review" : "Add New Review"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editingReview ? "Update this review's details." : "Add a new testimonial to the homepage carousel."}
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
                  <label className="text-[10px] uppercase font-bold text-slate-700">Reviewer Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.reviewerName}
                    onChange={(e) => setFormData({ ...formData, reviewerName: e.target.value })}
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">Role / Title</label>
                  <input
                    type="text"
                    value={formData.reviewerRole}
                    onChange={(e) => setFormData({ ...formData, reviewerRole: e.target.value })}
                    placeholder="e.g. Graduate, Class of 2025"
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-700">Review Text *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.reviewText}
                  onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                  placeholder="Type or paste the review text..."
                  className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 font-bold"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">{currentLabel}</label>
                  <input
                    type="text"
                    value={formData.programOrRelation}
                    onChange={(e) => setFormData({ ...formData, programOrRelation: e.target.value })}
                    placeholder={`e.g. ${currentLabel}`}
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">Outcome Badge (optional)</label>
                  <input
                    type="text"
                    value={formData.outcome}
                    onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                    placeholder="e.g. Now employed at..."
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value, 10) || 0 })}
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div className="flex flex-col gap-1 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <label className="text-[10px] uppercase font-bold text-slate-700">Photo (optional)</label>
                <div className="flex items-center gap-3 mt-1">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-14 h-14 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-slate-300" />
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5">
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-[11px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors w-fit">
                      <span>{photoPreview ? "Change Photo" : "Upload Photo"}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                    {photoPreview && (
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline text-left cursor-pointer w-fit"
                      >
                        Remove photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-700">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "ACTIVE" | "INACTIVE" })}
                  className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 font-bold"
                >
                  <option value="ACTIVE">ACTIVE (Visible on homepage)</option>
                  <option value="INACTIVE">INACTIVE (Hidden)</option>
                </select>
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
                    <span>{editingReview ? "Update Review" : "Add Review"}</span>
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
