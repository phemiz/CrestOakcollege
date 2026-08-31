"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";

interface ReviewItem {
  id: string;
  reviewerName: string;
  reviewerRole: string;
  reviewText: string;
  photoUrl: string | null;
  displayOrder: number;
  status: "ACTIVE" | "INACTIVE";
  category: "students" | "alumni" | "parents" | "partners";
  programOrRelation: string;
  outcome: string;
  createdAt?: string;
}

interface ReviewsClientProps {
  reviews: any[];
}

const CATEGORY_OPTIONS: { value: ReviewItem["category"]; label: string }[] = [
  { value: "students", label: "Student" },
  { value: "alumni", label: "Alumnus / Alumna" },
  { value: "parents", label: "Parent / Guardian" },
  { value: "partners", label: "Clinical / Industry Partner" },
];

const RELATION_LABEL: Record<ReviewItem["category"], string> = {
  students: "Program / Course",
  alumni: "Program &amp; Graduation Year".replace("&amp;", "&"),
  parents: "Relation to Student",
  partners: "Company / Organization",
};

const RELATION_PLACEHOLDER: Record<ReviewItem["category"], string> = {
  students: "e.g. BSc Nursing Science, 300 Level",
  alumni: "e.g. BSc Medical Laboratory Science, Class of 2023",
  parents: "e.g. Parent of a 200 Level Nursing student",
  partners: "e.g. Lagos University Teaching Hospital",
};

const MAX_PHOTO_BYTES = 2 * 1024 * 1024; // 2MB, matches backend jpg/jpeg/png/webp handling
const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

function normalizeReview(raw: any): ReviewItem {
  return {
    id: String(raw?.id ?? raw?.review_id ?? `review-${Date.now()}-${Math.random()}`),
    reviewerName: raw?.reviewer_name ?? raw?.reviewerName ?? "",
    reviewerRole: raw?.reviewer_role ?? raw?.reviewerRole ?? "",
    reviewText: raw?.review_text ?? raw?.reviewText ?? "",
    photoUrl: raw?.photo_url ?? raw?.photoUrl ?? null,
    displayOrder: Number(raw?.display_order ?? raw?.displayOrder ?? 0),
    status: (raw?.status ?? "ACTIVE") === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    category: ["students", "alumni", "parents", "partners"].includes(raw?.category)
      ? raw.category
      : "students",
    programOrRelation: raw?.program_or_relation ?? raw?.programOrRelation ?? "",
    outcome: raw?.outcome ?? "",
    createdAt: raw?.created_at ?? raw?.createdAt,
  };
}

export default function ReviewsClient({ reviews: rawReviews }: ReviewsClientProps) {
  const router = useRouter();

  const [reviews, setReviews] = useState<ReviewItem[]>(
    Array.isArray(rawReviews) ? rawReviews.map(normalizeReview) : []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keep local state in sync if the parent page re-fetches and passes new data
  useEffect(() => {
    if (Array.isArray(rawReviews)) {
      setReviews(rawReviews.map(normalizeReview));
    }
  }, [rawReviews]);

  // Search & filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | ReviewItem["category"]>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal / form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    reviewerName: "",
    reviewerRole: "",
    reviewText: "",
    category: "students" as ReviewItem["category"],
    programOrRelation: "",
    outcome: "",
    displayOrder: 0,
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
  });

  const resetForm = () => {
    setFormData({
      reviewerName: "",
      reviewerRole: "",
      reviewText: "",
      category: "students",
      programOrRelation: "",
      outcome: "",
      displayOrder: reviews.length,
      status: "ACTIVE",
    });
    setPhotoPreview(null);
    setPhotoBase64(null);
    setPhotoError(null);
  };

  const openAddModal = () => {
    setEditingReview(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (review: ReviewItem) => {
    setEditingReview(review);
    setFormData({
      reviewerName: review.reviewerName,
      reviewerRole: review.reviewerRole,
      reviewText: review.reviewText,
      category: review.category,
      programOrRelation: review.programOrRelation,
      outcome: review.outcome,
      displayOrder: review.displayOrder,
      status: review.status,
    });
    setPhotoPreview(review.photoUrl);
    setPhotoBase64(null);
    setPhotoError(null);
    setIsModalOpen(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
      setPhotoError("Please choose a JPG, PNG, or WEBP image.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError("Image must be smaller than 2MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoBase64(result);
      setPhotoPreview(result);
    };
    reader.onerror = () => setPhotoError("Could not read that image. Please try another file.");
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setPhotoBase64(null);
    setPhotoError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reviewerName.trim() || !formData.reviewText.trim()) {
      alert("Reviewer name and review text are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Record<string, any> = {
        reviewerName: formData.reviewerName.trim(),
        reviewerRole: formData.reviewerRole.trim(),
        reviewText: formData.reviewText.trim(),
        category: formData.category,
        programOrRelation: formData.programOrRelation.trim(),
        outcome: formData.outcome.trim(),
        displayOrder: formData.displayOrder,
        status: formData.status,
      };

      if (photoBase64) {
        payload.photoBase64 = photoBase64;
      } else if (editingReview) {
        payload.existingPhotoUrl = editingReview.photoUrl;
      }

      if (editingReview) {
        payload.id = editingReview.id;
      }

      const res = await fetch("/api/admin/reviews.php", {
        method: editingReview ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("sessionToken")}`,
          "X-CSRF-Token": localStorage.getItem("csrfToken") || "",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        // The backend only echoes back { id, photoUrl } (POST) or { photoUrl } (PUT) —
        // not the full row — so the updated review is built locally from the form
        // payload plus whatever the API actually returned.
        const savedId = editingReview ? editingReview.id : String(data.id);
        const normalized = normalizeReview({
          id: savedId,
          reviewerName: formData.reviewerName.trim(),
          reviewerRole: formData.reviewerRole.trim(),
          reviewText: formData.reviewText.trim(),
          photoUrl: data.photoUrl ?? editingReview?.photoUrl ?? null,
          displayOrder: formData.displayOrder,
          status: formData.status,
          category: formData.category,
          programOrRelation: formData.programOrRelation.trim(),
          outcome: formData.outcome.trim(),
        });
        setReviews((prev) =>
          editingReview
            ? prev.map((r) => (r.id === editingReview.id ? normalized : r))
            : [normalized, ...prev]
        );
        setIsModalOpen(false);
        router.refresh();
      } else {
        alert("Could not save review: " + (data.message || "Unknown error."));
      }
    } catch (err: any) {
      alert("Error saving review: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review? This cannot be undone.")) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/reviews.php", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("sessionToken")}`,
          "X-CSRF-Token": localStorage.getItem("csrfToken") || "",
        },
        body: JSON.stringify({ id }),
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

  const toggleStatus = async (review: ReviewItem) => {
    const nextStatus = review.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/reviews.php", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("sessionToken")}`,
          "X-CSRF-Token": localStorage.getItem("csrfToken") || "",
        },
        body: JSON.stringify({
          id: review.id,
          reviewerName: review.reviewerName,
          reviewerRole: review.reviewerRole,
          reviewText: review.reviewText,
          category: review.category,
          programOrRelation: review.programOrRelation,
          outcome: review.outcome,
          displayOrder: review.displayOrder,
          status: nextStatus,
          existingPhotoUrl: review.photoUrl,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === review.id ? { ...r, status: nextStatus } : r))
        );
      } else {
        alert("Could not update status: " + (data.message || "Failed"));
      }
    } catch (err: any) {
      alert("Error updating status: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReviews = useMemo(() => {
    return reviews
      .filter((r) => {
        const term = searchTerm.toLowerCase();
        const nameMatch =
          r.reviewerName.toLowerCase().includes(term) ||
          r.reviewText.toLowerCase().includes(term) ||
          r.programOrRelation.toLowerCase().includes(term);
        const categoryMatch = categoryFilter === "ALL" || r.category === categoryFilter;
        const statusMatch = statusFilter === "ALL" || r.status === statusFilter;
        return nameMatch && categoryMatch && statusMatch;
      })
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [reviews, searchTerm, categoryFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / itemsPerPage));
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Title & Add Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-black text-slate-900">
            Homepage Reviews
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage the testimonials shown in the reviews carousel on the public homepage.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-brand-red hover:bg-brand-red-dark text-white font-display font-bold py-2.5 px-5 rounded-xl text-xs transition-all flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Add Review</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="md:col-span-6 relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by reviewer name, program, or review text..."
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
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
          >
            <option value="ALL">All Categories</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active (visible)</option>
            <option value="INACTIVE">Inactive (hidden)</option>
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
                <th className="py-3.5 px-4">Order</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedReviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 font-medium">
                    No reviews match your filters.
                  </td>
                </tr>
              ) : (
                paginatedReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {review.photoUrl ? (
                          <img
                            src={review.photoUrl}
                            alt={review.reviewerName}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                            <ImageIcon className="h-4 w-4" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{review.reviewerName}</p>
                          <p className="text-[10px] text-slate-400">
                            {review.programOrRelation || review.reviewerRole || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-brand-blue-50 text-brand-blue-dark border border-brand-blue-100">
                        {CATEGORY_OPTIONS.find((c) => c.value === review.category)?.label ??
                          review.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-slate-600 italic line-clamp-2">
                        &quot;{review.reviewText}&quot;
                      </p>
                      {review.outcome && (
                        <span className="inline-block mt-1 text-[9px] font-bold text-brand-red bg-brand-red-light px-2 py-0.5 rounded-full uppercase">
                          {review.outcome}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      {review.displayOrder}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => toggleStatus(review)}
                        disabled={isSubmitting}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider cursor-pointer transition-colors ${
                          review.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                        }`}
                        title="Click to toggle visibility"
                      >
                        {review.status}
                      </button>
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

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
            <span className="text-xs text-slate-500">
              Page {currentPage} of {totalPages}
            </span>
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
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-xl font-display font-black text-slate-900">
                  {editingReview ? "Edit Review" : "Add New Review"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editingReview
                    ? "Update this testimonial's details."
                    : "This will appear in the homepage reviews carousel once saved as Active."}
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
              {/* Photo upload */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-slate-300" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700 block mb-1">
                    Photo (optional)
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    className="text-[11px] text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                  />
                  {photoPreview && (
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="text-[10px] text-red-500 hover:text-red-700 font-bold mt-1 cursor-pointer"
                    >
                      Remove photo
                    </button>
                  )}
                  {photoError && (
                    <p className="text-[10px] text-red-600 font-bold mt-1">{photoError}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">
                    Reviewer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.reviewerName}
                    onChange={(e) =>
                      setFormData({ ...formData, reviewerName: e.target.value })
                    }
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">
                    Role / Title (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.reviewerRole}
                    onChange={(e) =>
                      setFormData({ ...formData, reviewerRole: e.target.value })
                    }
                    placeholder="e.g. Class Representative"
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 placeholder:text-slate-400 placeholder:font-medium"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-700">
                  Review Text *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.reviewText}
                  onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                  placeholder="Type or paste the review here..."
                  className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 placeholder:text-slate-400 placeholder:font-medium resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as ReviewItem["category"],
                      })
                    }
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">
                    {RELATION_LABEL[formData.category]}
                  </label>
                  <input
                    type="text"
                    value={formData.programOrRelation}
                    onChange={(e) =>
                      setFormData({ ...formData, programOrRelation: e.target.value })
                    }
                    placeholder={RELATION_PLACEHOLDER[formData.category]}
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 placeholder:text-slate-400 placeholder:font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">
                    Outcome Badge (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.outcome}
                    onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                    placeholder="e.g. Now employed at LUTH"
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 placeholder:text-slate-400 placeholder:font-medium"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) =>
                      setFormData({ ...formData, displayOrder: Number(e.target.value) })
                    }
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3 border border-slate-200">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-700">
                    Visible on Homepage
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Inactive reviews are saved but hidden from the public site.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      status: prev.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                    }))
                  }
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                    formData.status === "ACTIVE" ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 bg-white rounded-full shadow-sm transition-transform ${
                      formData.status === "ACTIVE" ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-brand-red hover:bg-brand-red-dark text-white font-bold px-5 py-2 rounded-xl cursor-pointer disabled:opacity-60 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {isSubmitting
                    ? "Saving..."
                    : editingReview
                    ? "Save Changes"
                    : "Add Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
