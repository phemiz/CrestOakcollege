"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Newspaper,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  featuredImage: string | null;
  isPublished: boolean;
  publishedAt: Date | string | null;
  createdAt?: Date | string;
}

interface NewsClientProps {
  newsList: NewsItem[];
}

export default function NewsClient({ newsList: initialNews }: NewsClientProps) {
  const router = useRouter();
  const [newsList, setNewsList] = useState<NewsItem[]>(initialNews);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);

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

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        id: editingNews?.id
      };
      const res = await fetch("/api/admin/news.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const newItem: NewsItem = {
          id: editingNews ? editingNews.id : `news-${Math.floor(1000 + Math.random() * 9000)}`,
          title: formData.title,
          slug,
          content: formData.content,
          featuredImage: formData.featuredImage || null,
          isPublished: formData.isPublished,
          publishedAt: formData.isPublished ? dateStr() : null
        };
        if (editingNews) {
          setNewsList((prev) => prev.map((n) => (n.id === editingNews.id ? newItem : n)));
        } else {
          setNewsList((prev) => [newItem, ...prev]);
        }
        setIsModalOpen(false);
        router.refresh();
      } else {
        alert("Error saving news article: " + (data.message || "Failed"));
      }
    } catch (err: any) {
      alert("Submission error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to soft-delete this news article?")) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/news.php", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setNewsList((prev) => prev.filter((n) => n.id !== id));
        router.refresh();
      }
    } catch (err: any) {
      alert("Delete error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  function dateStr() {
    return new Date().toISOString();
  }

  const filteredNews = newsList.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-black text-slate-900">News & Announcements</h2>
          <p className="text-xs text-slate-500 mt-1">Publish campus updates, admissions alerts, and institutional press releases in real time.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-red-600 hover:bg-red-700 text-white font-display font-bold py-2.5 px-5 rounded-xl text-xs transition-all flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Newspaper className="h-4.5 w-4.5" />
          <span>Publish New Article</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs relative">
        <Search className="absolute left-7 top-7 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search news by headline or body content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
        />
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredNews.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                    item.isPublished
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {item.isPublished ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  <span>{item.isPublished ? "Published" : "Draft"}</span>
                </span>
                {item.publishedAt && (
                  <span className="text-[10px] text-slate-500 font-medium">
                    {new Date(item.publishedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-900 text-base leading-snug">{item.title}</h3>
                <p className="text-slate-500 text-xs mt-2 line-clamp-3 leading-relaxed">{item.content}</p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => openEditModal(item)}
                className="p-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition-all cursor-pointer shadow-xs"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-lg text-slate-600 transition-all cursor-pointer shadow-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* News Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white sticky top-0 z-10">
              <h3 className="font-display font-black text-sm tracking-widest uppercase text-slate-900">
                {editingNews ? "Edit Article" : "Create News Article"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-semibold text-slate-800">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-700">Article Headline *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. 2026/2027 Entrance Screening Examination Dates"
                  className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-700">Featured Image URL</label>
                <input
                  type="text"
                  value={formData.featuredImage}
                  onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                  placeholder="/crestoak-poster.jpg"
                  className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-700">Article Body Content *</label>
                <textarea
                  required
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write the article content..."
                  className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="rounded text-red-600 focus:ring-red-600"
                />
                <label htmlFor="isPublished" className="text-slate-900 font-bold cursor-pointer">
                  Publish article immediately to public portal
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                  <span>{isSubmitting ? "Saving..." : editingNews ? "Update Article" : "Publish Article"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
