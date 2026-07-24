import React from "react";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import { newsAndEvents } from "@/data/homeData";

export const NewsSection = () => {
  return (
    <section id="news" className="bg-brand-bg-light py-20 border-t border-slate-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="text-center max-w-xl mx-auto flex flex-col gap-4 mb-16">
          <span className="text-brand-red font-bold text-xs uppercase tracking-widest">News & Admissions News</span>
          <h2 className="font-display text-3xl font-extrabold text-brand-blue-dark tracking-tight">
            Academic Calendar & Updates
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            Stay updated with key entrance screening dates, session deadlines, and local healthcare partnership disclosures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {newsAndEvents.map((news) => (
            <Link
              href={`/news/${news.slug}`}
              key={news.id}
              className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-black uppercase tracking-wider text-brand-red bg-brand-red-light px-2 py-0.5 rounded">
                    {news.alert}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                    <Calendar size={12} />
                    <span>{news.date}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-display font-bold text-brand-blue-dark text-sm sm:text-base leading-snug group-hover:text-brand-red transition-colors">
                    {news.title}
                  </h3>
                  <p className="text-slate-500 text-xs mt-2.5 leading-relaxed font-semibold">
                    {news.desc}
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-brand-blue hover:text-brand-red font-sans transition-colors flex items-center gap-1">
                  Read More <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                </span>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  {news.category}
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/news">
            <button className="bg-brand-blue-dark hover:bg-brand-blue text-white font-display text-xs font-bold px-8 py-3 rounded-full shadow-lg shadow-brand-blue/15 transition-all cursor-pointer inline-flex items-center gap-2 group">
              <span>View All News & Announcements</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};
