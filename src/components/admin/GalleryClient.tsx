"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Image as ImageIcon,
  Loader2
} from "lucide-react";

interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  album: string | null;
  createdAt?: Date | string;
}

interface GalleryClientProps {
  galleryItems: GalleryItem[];
}

export default function GalleryClient({ galleryItems: initialGallery }: GalleryClientProps) {
  const router = useRouter();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(initialGallery);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        id: editingItem?.id
      };
      const res = await fetch("/api/admin/gallery.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        const newItem: GalleryItem = {
          id: editingItem ? editingItem.id : `gal-${Math.floor(1000 + Math.random() * 9000)}`,
          title: formData.title,
          description: formData.description || null,
          imageUrl: formData.imageUrl,
          album: formData.album || null
        };
        if (editingItem) {
          setGalleryItems((prev) => prev.map((g) => (g.id === editingItem.id ? newItem : g)));
        } else {
          setGalleryItems((prev) => [newItem, ...prev]);
        }
        setIsModalOpen(false);
        router.refresh();
      } else {
        alert("Error saving gallery item: " + (data.message || "Failed"));
      }
    } catch (err: any) {
      alert("Submission error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to soft-delete this photo?")) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/gallery.php", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setGalleryItems((prev) => prev.filter((g) => g.id !== id));
        router.refresh();
      }
    } catch (err: any) {
      alert("Delete error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = galleryItems.filter((item) => {
    const searchMatch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const albumMatch = albumFilter === "ALL" || item.album === albumFilter;
    return searchMatch && albumMatch;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-black text-slate-900">Media Gallery Manager</h2>
          <p className="text-xs text-slate-500 mt-1">Upload and organize campus photography, lab demonstrations, and event photo albums.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-red-600 hover:bg-red-700 text-white font-display font-bold py-2.5 px-5 rounded-xl text-xs transition-all flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <ImageIcon className="h-4.5 w-4.5" />
          <span>Upload Media Asset</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="md:col-span-8 relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search photo caption or album name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
          />
        </div>
        <div className="md:col-span-4">
          <select
            value={albumFilter}
            onChange={(e) => setAlbumFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors cursor-pointer"
          >
            <option value="ALL">All Photo Albums</option>
            {albums.map((album) => (
              <option key={album} value={album}>
                {album}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div className="aspect-video bg-slate-100 relative overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              {item.album && (
                <span className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                  {item.album}
                </span>
              )}
            </div>
            <div className="p-4 space-y-2">
              <h3 className="font-display font-bold text-slate-900 text-sm leading-snug">{item.title}</h3>
              {item.description && (
                <p className="text-slate-500 text-xs line-clamp-2">{item.description}</p>
              )}
            </div>

            <div className="p-4 pt-0 flex justify-end gap-2">
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white sticky top-0 z-10">
              <h3 className="font-display font-black text-sm tracking-widest uppercase text-slate-900">
                {editingItem ? "Edit Media Asset" : "Upload Photo Asset"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-semibold text-slate-800">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-700">Photo Title / Caption *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Clinical Nursing Simulation Ward"
                  className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-700">Image Asset URL / Path *</label>
                <input
                  type="text"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="/crestoak-poster.jpg"
                  className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 font-mono"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-700">Album Category</label>
                <input
                  type="text"
                  value={formData.album}
                  onChange={(e) => setFormData({ ...formData, album: e.target.value })}
                  placeholder="e.g. Infrastructure, Events"
                  className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-700">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                />
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
                  <span>{isSubmitting ? "Saving..." : editingItem ? "Update Photo" : "Upload Asset"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
