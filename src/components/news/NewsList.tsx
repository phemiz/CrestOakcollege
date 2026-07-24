"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Calendar, User, ArrowRight, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface UnifiedNewsItem {
  id: string | number;
  title: string;
  slug: string;
  content: string; // Description or full content
  date: string; // Formatted date string
  category: string;
  alert?: string;
  featuredImage?: string | null;
  authorName?: string;
}

interface NewsListProps {
  initialNews: UnifiedNewsItem[];
}

export default function NewsList({ initialNews }: NewsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Dynamically compute list of categories from the news items
  const categories = useMemo(() => {
    const cats = new Set<string>();
    initialNews.forEach((item) => {
      if (item.category) {
        // Standardize capitalization
        const capCat = item.category.charAt(0).toUpperCase() + item.category.slice(1).toLowerCase();
        cats.add(capCat);
      }
    });
    return ["All", ...Array.from(cats)];
  }, [initialNews]);

  // Filter items based on search query and category
  const filteredNews = useMemo(() => {
    return initialNews.filter((item) => {
      const itemCategory = item.category ? item.category.toLowerCase() : "";
      const matchesCategory =
        selectedCategory === "All" ||
        itemCategory === selectedCategory.toLowerCase();

      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        itemCategory.includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [initialNews, searchQuery, selectedCategory]);

  return (
    <div className="flex flex-col gap-10">
      {/* Search and Filter Bar */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Search Input */}
        <div className="relative w-full md:w-80 flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 group focus-within:border-brand-blue-light focus-within:bg-white transition-all">
          <Search className="text-slate-400 group-focus-within:text-brand-blue-light mr-2.5 shrink-0" size={18} />
          <input
            id="news-search-input"
            type="text"
            placeholder="Search news & announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-slate-800 placeholder-slate-400 font-semibold focus:outline-none text-sm w-full"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
          {categories.map((category) => (
            <button
              key={category}
              id={`filter-category-${category.toLowerCase()}`}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === category
                  ? "bg-brand-red text-white shadow-md shadow-brand-red/10"
                  : "bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of articles */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="popLayout">
          {filteredNews.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredNews.map((news) => (
                <motion.article
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                  key={news.id}
                  className="bg-white rounded-3xl border border-slate-100 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group"
                >
                  <div className="flex flex-col">
                    {/* Header Image or Placeholder */}
                    <div className="relative h-48 w-full bg-slate-150 overflow-hidden shrink-0">
                      {news.featuredImage ? (
                        <img
                          src={news.featuredImage}
                          alt={news.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-brand-blue/5 to-brand-blue-dark/10 flex items-center justify-center p-6 text-brand-blue-light/20 relative">
                          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                          <BookOpen size={48} className="text-brand-blue-light/30 relative z-10" />
                        </div>
                      )}
                      {news.alert && (
                        <span className="absolute top-4 left-4 text-[9px] font-black uppercase tracking-wider text-white bg-brand-red px-2.5 py-1 rounded-lg shadow-md z-10">
                          {news.alert}
                        </span>
                      )}
                      <span className="absolute top-4 right-4 text-[9px] font-black uppercase tracking-wider text-slate-800 bg-white border border-slate-100 px-2.5 py-1 rounded-lg shadow-sm z-10">
                        {news.category}
                      </span>
                    </div>

                    <div className="p-6 sm:p-8 flex flex-col gap-3">
                      {/* Meta information row */}
                      <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-brand-red" />
                          <span>{news.date}</span>
                        </div>
                        {news.authorName && (
                          <>
                            <span className="opacity-45">•</span>
                            <div className="flex items-center gap-1.5">
                              <User size={13} className="text-brand-blue-light" />
                              <span className="max-w-[100px] truncate">{news.authorName}</span>
                            </div>
                          </>
                        )}
                      </div>

                      <h3 className="font-display font-black text-brand-blue-dark text-base sm:text-lg leading-snug group-hover:text-brand-red transition-colors duration-250 line-clamp-2">
                        {news.title}
                      </h3>

                      <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed font-semibold font-sans line-clamp-3">
                        {news.content.replace(/<[^>]*>/g, "")} {/* Strips HTML tags if present */}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-4 border-t border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <Link
                      href={`/news/${news.slug}`}
                      className="text-xs font-black uppercase text-brand-blue group-hover:text-brand-red transition-colors flex items-center gap-1.5"
                    >
                      <span>Read Publication</span>
                      <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-white border border-slate-100 rounded-3xl p-8 flex flex-col items-center gap-4 shadow-sm"
            >
              <div className="p-4 bg-brand-red-light text-brand-red rounded-full">
                <Search size={32} />
              </div>
              <div>
                <h3 className="font-display font-black text-brand-blue-dark text-lg">No Publications Found</h3>
                <p className="text-slate-400 text-xs sm:text-sm max-w-sm mt-1 mx-auto font-medium">
                  We couldn&apos;t find any articles matching &quot;<span className="text-slate-600 font-bold">{searchQuery}</span>&quot; or the selected category.
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="text-xs font-black uppercase text-brand-red hover:underline mt-2"
              >
                Clear all filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
