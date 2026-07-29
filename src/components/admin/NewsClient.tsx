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
  Loader2,
  Upload,
  Image as ImageIcon,
  FileText
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

  const [uploadFileName, setUploadFileName] = useState("");
  const [attachmentFileName, setAttachmentFileName] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    featuredImage: "",
    isPublished: true
  });

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setFormData(prev => ({ ...prev, featuredImage: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachmentFileName(file.name);
    }
  };

  const openAddModal = () => {
    setEditingNews(null);
    setUploadFileName("");
    setAttachmentFileName("");
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
    setUploadFileName("");
    setAttachmentFileName("");
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

              {/* Upload Featured Image / Banner */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-700">
                  Featured Image Banner Upload
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-red-500/50 rounded-2xl p-4 bg-slate-50/60 transition-colors">
                  {formData.featuredImage ? (
                    <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <img
                          src={formData.featuredImage}
                          alt="Preview"
                          className="h-12 w-12 object-cover rounded-lg border border-slate-200 shrink-0"
                        />
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {uploadFileName || "Featured Image Selected"}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono truncate max-w-[250px]">
                            {formData.featuredImage.slice(0, 40)}...
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, featuredImage: "" });
                          setUploadFileName("");
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Remove Image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-3 gap-2">
                      <div className="p-2.5 bg-red-50 border border-red-100 text-red-600 rounded-full">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <label
                          htmlFor="news-image-file-input"
                          className="text-xs font-bold text-slate-900 hover:text-red-600 cursor-pointer flex items-center gap-1.5 justify-center"
                        >
                          <Upload className="h-3.5 w-3.5 text-red-600" />
                          <span>Upload Featured Image File</span>
                        </label>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          PNG, JPG, WEBP formats up to 10MB
                        </p>
                      </div>
                      <input
                        id="news-image-file-input"
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1 mt-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Or Enter Image URL Path
                  </span>
                  <input
                    type="text"
                    value={formData.featuredImage}
                    onChange={(e) => {
                      setFormData({ ...formData, featuredImage: e.target.value });
                      setUploadFileName("");
                    }}
                    placeholder="/crestoak-logo.png or https://..."
                    className="p-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* PDF Press Release Attachment Upload */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-700">
                  Optional Press Release PDF / Bulletin Document Attachment
                </label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-slate-600 truncate">
                    <FileText className="h-4 w-4 text-red-600 shrink-0" />
                    <span className="text-xs font-semibold truncate">
                      {attachmentFileName || "No PDF document attached"}
                    </span>
                  </div>
                  <label
                    htmlFor="news-attachment-file-input"
                    className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-900 text-[10px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Upload className="h-3 w-3 text-slate-500" />
                    <span>Attach PDF</span>
                  </label>
                  <input
                    id="news-attachment-file-input"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleAttachmentUpload}
                    className="hidden"
                  />
                </div>
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
