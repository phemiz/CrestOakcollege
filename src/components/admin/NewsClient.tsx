"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertNewsPost, deleteNewsPost } from "@/app/actions/admin-actions";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Newspaper,
  Save,
  CheckCircle,
  Eye,
  EyeOff
} from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  featuredImage: string | null;
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
}

interface NewsClientProps {
  newsList: NewsItem[];
}

export default function NewsClient({ newsList }: NewsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Search filter
  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    featuredImage: "",
    isPublished: true
  });

  const openAddModal = () => {
    setEditingNews(null);
    setFormData({
      title: "",
      content: "",
      featuredImage: "",
      isPublished: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (news: NewsItem) => {
    setEditingNews(news);
    setFormData({
      title: news.title,
      content: news.content,
      featuredImage: news.featuredImage || "",
      isPublished: news.isPublished
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert("Please fill in all required fields.");
      return;
    }

    startTransition(async () => {
      const payload = {
        ...formData,
        id: editingNews?.id
      };
      const res = await upsertNewsPost(payload);
      if (res.success) {
        setIsModalOpen(false);
        router.refresh();
      } else {
        alert("Error saving news article: " + res.error);
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to soft-delete this news article?")) return;

    startTransition(async () => {
      const res = await deleteNewsPost(id);
      if (res.success) {
        router.refresh();
      } else {
        alert("Error deleting news article: " + res.error);
      }
    });
  };

  // Filter list
  const filteredNews = newsList.filter((news) => {
    return (
      news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      news.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Title & Add News Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-black text-white">News & Publications</h2>
          <p className="text-xs text-slate-400 mt-1">Publish college bulletins, academic calendars updates, or urgent alerts.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-red-600 hover:bg-red-700 text-white font-display font-bold py-2.5 px-5 rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-red-950/20"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Write New Article</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <Search className="absolute left-7 top-7 h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search articles by headline or contents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-850 rounded-xl text-xs font-semibold text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-red-600 transition-colors"
        />
      </div>

      {/* Grid of news items */}
      {filteredNews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredNews.map((news) => (
            <div
              key={news.id}
              className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                    news.isPublished
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-900/30"
                      : "bg-slate-900 text-slate-400 border border-slate-800"
                  }`}>
                    {news.isPublished ? (
                      <>
                        <Eye className="h-3 w-3" />
                        <span>Published</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3" />
                        <span>Draft</span>
                      </>
                    )}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">
                    {new Date(news.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-display font-bold text-sm text-slate-100 leading-tight">
                  {news.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {news.content}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-900 flex justify-end gap-2">
                <button
                  onClick={() => openEditModal(news)}
                  className="p-2 bg-slate-900 border border-slate-850 hover:bg-slate-850 hover:text-white rounded-lg text-slate-400 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold px-3"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(news.id)}
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
          No articles published yet.
        </div>
      )}

      {/* Editor Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl">
            {/* Modal Header */}
            <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/50">
              <h3 className="font-display font-black text-sm tracking-widest uppercase text-white">
                {editingNews ? "Edit College Announcement" : "Create College Announcement"}
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
                <label className="text-[10px] uppercase font-bold text-slate-400">Article Title/Headline *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. 2026/2027 Post-UTME Entrance Screening Guidelines"
                  className="p-3 bg-slate-900 border border-slate-850 rounded-xl focus:outline-none focus:border-red-600 text-slate-200"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Featured Image URL (Optional)</label>
                <input
                  type="text"
                  value={formData.featuredImage}
                  onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                  placeholder="e.g. https://images.unsplash.com/..."
                  className="p-3 bg-slate-900 border border-slate-850 rounded-xl focus:outline-none focus:border-red-600 text-slate-200"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Announcement Body Content *</label>
                <textarea
                  required
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write the full announcement details here..."
                  className="p-3 bg-slate-900 border border-slate-850 rounded-xl focus:outline-none focus:border-red-600 text-slate-200 resize-none font-sans"
                />
              </div>

              <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-850 w-fit">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="h-4 w-4 rounded bg-slate-900 border-slate-850 text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <label htmlFor="isPublished" className="text-slate-300 font-bold uppercase tracking-wider text-[10px] cursor-pointer select-none">
                  Publish article immediately (Active on web lists)
                </label>
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
                  <Save className="h-4 w-4" />
                  <span>{isPending ? "Saving..." : editingNews ? "Save Article" : "Publish Article"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
