"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertGalleryItem, deleteGalleryItem } from "@/app/actions/admin-actions";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Image as ImageIcon,
  Save,
  Grid
} from "lucide-react";

interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  album: string | null;
  createdAt: Date;
}

interface GalleryClientProps {
  galleryItems: GalleryItem[];
}

export default function GalleryClient({ galleryItems }: GalleryClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [albumFilter, setAlbumFilter] = useState("ALL");

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    album: ""
  });

  // Get unique albums for filter dropdown
  const albums = Array.from(
    new Set(galleryItems.map((item) => item.album).filter(Boolean))
  ) as string[];

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      title: "",
      description: "",
      imageUrl: "",
      album: "Campus Events"
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || "",
      imageUrl: item.imageUrl,
      album: item.album || "Campus Events"
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.imageUrl) {
      alert("Please fill in all required fields.");
      return;
    }

    startTransition(async () => {
      const payload = {
        ...formData,
        id: editingItem?.id
      };
      const res = await upsertGalleryItem(payload);
      if (res.success) {
        setIsModalOpen(false);
        router.refresh();
      } else {
        alert("Error saving gallery item: " + res.error);
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to soft-delete this photo?")) return;

    startTransition(async () => {
      const res = await deleteGalleryItem(id);
      if (res.success) {
        router.refresh();
      } else {
        alert("Error deleting photo: " + res.error);
      }
    });
  };

  // Filter list
  const filteredItems = galleryItems.filter((item) => {
    const titleMatch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const albumMatch = albumFilter === "ALL" || item.album === albumFilter;
    return titleMatch && albumMatch;
  });

  return (
    <div className="space-y-6">
      {/* Title & Add Image Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-black text-white">Campus Gallery Manager</h2>
          <p className="text-xs text-slate-400 mt-1">Publish student orientation photos, clinical labs structures, and graduation activities.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-red-600 hover:bg-red-700 text-white font-display font-bold py-2.5 px-5 rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-red-950/20"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Upload Image</span>
        </button>
      </div>

      {/* Search & Album Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="md:col-span-8 relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search photos by title or album label..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-850 rounded-xl text-xs font-semibold text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-red-600 transition-colors"
          />
        </div>
        <div className="md:col-span-4">
          <select
            value={albumFilter}
            onChange={(e) => setAlbumFilter(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-850 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:border-red-600 transition-colors cursor-pointer"
          >
            <option value="ALL">All Albums</option>
            {albums.map((album) => (
              <option key={album} value={album}>
                {album}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Photo Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all flex flex-col group"
            >
              {/* Image box */}
              <div className="relative aspect-video bg-slate-900 overflow-hidden shrink-0">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
                {item.album && (
                  <span className="absolute top-3 left-3 bg-slate-950/80 border border-slate-800/60 backdrop-blur-xs text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded text-red-400">
                    {item.album}
                  </span>
                )}
              </div>

              {/* Detail block */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-bold text-xs text-slate-200 truncate">{item.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {item.description || "No description configured."}
                  </p>
                </div>
                <div className="flex gap-2 justify-end pt-3 border-t border-slate-900">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 bg-slate-900 border border-slate-850 hover:bg-slate-850 hover:text-white rounded-lg text-slate-400 transition-all cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 bg-slate-900 border border-slate-850 hover:bg-red-950/40 hover:text-red-400 hover:border-red-900/30 rounded-lg text-slate-400 transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-slate-500 font-bold uppercase tracking-widest text-[11px] bg-slate-950 border border-slate-800 rounded-2xl">
          No items uploaded in college photo albums.
        </div>
      )}

      {/* Gallery Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl">
            {/* Modal Header */}
            <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/50">
              <h3 className="font-display font-black text-sm tracking-widest uppercase text-white">
                {editingItem ? "Edit Photo Entry" : "Add Image Entry"}
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
                <label className="text-[10px] uppercase font-bold text-slate-400">Photo Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Matriculation Ceremony Crowd Shot"
                  className="p-3 bg-slate-900 border border-slate-850 rounded-xl focus:outline-none focus:border-red-600 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Album Category *</label>
                  <input
                    type="text"
                    required
                    value={formData.album}
                    onChange={(e) => setFormData({ ...formData, album: e.target.value })}
                    placeholder="e.g. Convocation, Infrastructure"
                    className="p-3 bg-slate-900 border border-slate-850 rounded-xl focus:outline-none focus:border-red-600 text-slate-200 font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Image Source URL *</label>
                  <input
                    type="text"
                    required
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="e.g. https://images.unsplash.com/..."
                    className="p-3 bg-slate-900 border border-slate-850 rounded-xl focus:outline-none focus:border-red-600 text-slate-200"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Brief Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter details about what this photo represents..."
                  className="p-3 bg-slate-900 border border-slate-850 rounded-xl focus:outline-none focus:border-red-600 text-slate-200 resize-none"
                />
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
                  <span>{isPending ? "Saving..." : editingItem ? "Update Entry" : "Save Entry"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
