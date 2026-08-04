"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ChevronLeft, ChevronRight, Play, Eye, Calendar, Sparkles } from "lucide-react";

const galleryData = [
  {
    id: 1,
    title: "Clinical Nursing Simulation Ward",
    category: "labs",
    desc: "Complete simulation beds, patient models, and standard health monitoring diagnostic equipment.",
    gradient: "from-blue-500/20 via-sky-500/20 to-brand-blue/30",
    iconName: "Stethoscope",
    date: "May 2026"
  },
  {
    id: 2,
    title: "Diagnostic Microbiology Laboratory",
    category: "labs",
    desc: "Equipped with advanced microscopes and autoclaves for clinical pathology drills.",
    gradient: "from-emerald-500/20 via-teal-500/20 to-brand-blue/30",
    iconName: "Atom",
    date: "April 2026"
  },
  {
    id: 3,
    title: "Moot Court & Legal Advocacy Hall",
    category: "classes",
    desc: "Mock trial chambers for Faculty of Law students to practice advocacy, judicial proceedings, and litigation.",
    gradient: "from-amber-500/20 via-yellow-500/20 to-brand-blue/30",
    iconName: "Scale",
    date: "June 2026"
  },
  {
    id: 4,
    title: "Digital Hardware Programming Centre",
    category: "labs",
    desc: "High-speed networks and workstations for database administration, compilers, and hardware configuration.",
    gradient: "from-indigo-500/20 via-purple-500/20 to-brand-blue/30",
    iconName: "Cpu",
    date: "March 2026"
  },
  {
    id: 5,
    title: "Historical Badagry Campus Grounds",
    category: "campus",
    desc: "Lush gardens and recreational zones for students located in the historic coastal town of Badagry.",
    gradient: "from-green-500/20 via-lime-500/20 to-brand-blue/30",
    iconName: "Trees",
    date: "January 2026"
  },
  {
    id: 6,
    title: "Academic Matriculation Ceremony",
    category: "events",
    desc: "Welcoming 2025/2026 session freshers into the official CrestOak College academic register.",
    gradient: "from-red-500/20 via-pink-500/20 to-brand-blue/30",
    iconName: "GraduationCap",
    date: "December 2025"
  }
];

interface GalleryItem {
  id: number;
  title: string;
  category: string;
  desc: string;
  gradient: string;
  iconName: string;
  date: string;
}

export const GalleryGrid: React.FC = () => {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  // Filter & Search Logic
  const filteredItems = galleryData.filter(item => {
    const matchesFilter = filter === "all" || item.category === filter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Navigate lightbox
  const handleNext = () => {
    if (!selectedImage) return;
    const currentIdx = filteredItems.findIndex(i => i.id === selectedImage.id);
    if (currentIdx < filteredItems.length - 1) {
      setSelectedImage(filteredItems[currentIdx + 1]);
    } else {
      setSelectedImage(filteredItems[0]);
    }
  };

  const handlePrev = () => {
    if (!selectedImage) return;
    const currentIdx = filteredItems.findIndex(i => i.id === selectedImage.id);
    if (currentIdx > 0) {
      setSelectedImage(filteredItems[currentIdx - 1]);
    } else {
      setSelectedImage(filteredItems[filteredItems.length - 1]);
    }
  };

  return (
    <>
      {/* GALLERY FILTER & SEARCH GRID */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col gap-10">
          
          {/* Filter and Search Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex overflow-x-auto no-scrollbar whitespace-nowrap gap-2 justify-start w-full md:w-auto pb-1 md:pb-0">
              {[
                { id: "all", label: "All Media" },
                { id: "labs", label: "Labs & Wards" },
                { id: "classes", label: "Classrooms" },
                { id: "campus", label: "Campus Life" },
                { id: "events", label: "Events & Ceremonies" }
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setFilter(btn.id)}
                  className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    filter === btn.id
                      ? "bg-brand-red text-white shadow-sm"
                      : "text-slate-500 hover:text-brand-blue-dark hover:bg-slate-550"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Search gallery files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2.5 pl-9 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-brand-blue text-slate-800"
              />
              <Search size={14} className="text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>

          {/* Media Grid */}
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedImage(item)}
                  className="group bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
                >
                  {/* Mock illustration / gradient box */}
                  <div className={`h-48 w-full bg-gradient-to-tr ${item.gradient} flex items-center justify-center p-6 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20">
                        <Eye size={20} />
                      </div>
                    </div>
                    <div className="p-4 bg-white/5 backdrop-blur-sm rounded-full text-slate-700 border border-white/10 text-center font-display font-black text-2xl uppercase tracking-widest pointer-events-none select-none select-all opacity-40">
                      {item.category}
                    </div>
                  </div>

                  <div className="p-5 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <span>{item.category.replace("-", " ")}</span>
                      <span className="flex items-center gap-1"><Calendar size={11} /> {item.date}</span>
                    </div>
                    <h3 className="font-display font-bold text-brand-blue-dark text-base group-hover:text-brand-red transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed font-semibold">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 font-bold text-sm uppercase tracking-wider border border-dashed border-slate-200 rounded-3xl bg-white">
              No media files match your query.
            </div>
          )}

        </div>
      </section>

      {/* VIRTUAL VIDEO TOUR CONTAINER */}
      <section className="bg-brand-bg-light py-20 border-t border-slate-155">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Text description */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <Sparkles className="text-brand-red animate-pulse" size={16} />
              <span className="text-brand-red font-bold text-xs uppercase tracking-widest">Digital Campus</span>
            </div>
            <h2 className="font-display text-3xl font-extrabold text-brand-blue-dark tracking-tight leading-tight">
              Virtual Tour Walkthrough
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              Can&apos;t visit our Badagry campus in person? Watch our comprehensive high-definition video walkthrough. This tour covers our state-of-the-art clinical laboratories, lecture halls, and the partner university administrative wings.
            </p>
            
            <div className="bg-white border border-slate-150 p-4 rounded-2xl text-xs flex gap-2 items-start font-semibold text-slate-600">
              <Calendar size={18} className="text-brand-blue-light shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-brand-blue-dark">Interactive Campus Facilities Tour</p>
                <p className="mt-1 leading-relaxed text-slate-500 font-semibold">
                  Explore our modern science laboratories, health informatics centers, and student resource complexes designed to support world-class health education.
                </p>
              </div>
            </div>
          </div>

          {/* Video mockup player */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="bg-slate-900 border border-slate-850 p-4 rounded-3xl w-full max-w-lg aspect-video flex flex-col items-center justify-center relative overflow-hidden shadow-2xl group">
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/40 to-slate-950/80 z-0" />
              
              {/* Visual grid overlay */}
              <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:2rem_2rem]" />
              
              <div className="relative z-10 flex flex-col items-center gap-4 text-center">
                <button
                  onClick={() => alert("Simulation Playback: Video stream starting soon. Low bandwidth friendly caching enabled.")}
                  className="w-16 h-16 rounded-full bg-white hover:bg-brand-red text-brand-blue hover:text-white flex items-center justify-center shadow-2xl transition-all hover:scale-110 cursor-pointer border-4 border-white/20"
                  aria-label="Play tour video"
                >
                  <Play size={24} className="ml-1" />
                </button>
                <div>
                  <h4 className="font-display font-extrabold text-white text-base">CrestOak Campus Video Tour</h4>
                  <p className="text-slate-400 text-xs mt-1 font-bold">Duration: 4m 32s • Size: 18MB (Mobile Data Optimized)</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* LIGHTBOX MODAL OVERLAY */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[140] bg-slate-950/90 backdrop-blur-md flex flex-col justify-between p-6"
          >
            {/* Top Close Bar */}
            <div className="flex justify-between items-center text-white">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {selectedImage.category.replace("-", " ")} ({selectedImage.date})
              </span>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white cursor-pointer"
                aria-label="Close lightbox"
              >
                <X size={20} />
              </button>
            </div>

            {/* Middle Container */}
            <div className="flex items-center justify-between gap-4 flex-grow my-8 max-w-6xl mx-auto w-full">
              {/* Prev Button */}
              <button
                onClick={handlePrev}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors cursor-pointer border border-white/10 shrink-0"
                aria-label="Previous image"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Mock Image Box */}
              <div className={`flex-grow h-[50vh] sm:h-[60vh] max-w-3xl bg-gradient-to-tr ${selectedImage.gradient} rounded-3xl border border-white/15 flex items-center justify-center p-6 text-center shadow-2xl relative overflow-hidden`}>
                <div className="absolute inset-0 bg-slate-950/10 pointer-events-none" />
                <div className="text-white relative z-10 flex flex-col items-center gap-4">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                    {selectedImage.category}
                  </span>
                  <h4 className="font-display font-black text-xl sm:text-2xl tracking-tight max-w-md">{selectedImage.title}</h4>
                </div>
              </div>

              {/* Next Button */}
              <button
                onClick={handleNext}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors cursor-pointer border border-white/10 shrink-0"
                aria-label="Next image"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Bottom Details Bar */}
            <div className="text-center text-white max-w-lg mx-auto flex flex-col gap-2">
              <h3 className="font-display font-bold text-base sm:text-lg">{selectedImage.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-semibold">{selectedImage.desc}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
