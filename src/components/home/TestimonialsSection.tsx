"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { testimonialsData } from "@/data/homeData";
import { Testimonial } from "@/types";

export const TestimonialsSection = () => {
  const [activeTab, setActiveTab] = useState<"students" | "alumni" | "parents" | "partners">("students");

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="text-center max-w-xl mx-auto flex flex-col gap-4 mb-12">
          <span className="text-brand-red font-bold text-xs uppercase tracking-widest">Testimonials</span>
          <h2 className="font-display text-3xl font-extrabold text-brand-blue-dark tracking-tight">
            Institutional Credibility & Trust
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            Hear what our students, graduates, guardians, and clinical partners in Nigeria say about our courses.
          </p>
        </div>

        {/* Selector tabs */}
        <div className="flex overflow-x-auto no-scrollbar whitespace-nowrap md:justify-center gap-2 mb-10 max-w-lg mx-auto bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          {(Object.keys(testimonialsData) as Array<keyof typeof testimonialsData>).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 md:flex-grow py-2.5 px-4 rounded-xl font-display text-xs font-bold capitalize transition-all cursor-pointer ${
                activeTab === tab
                  ? "bg-brand-red text-white shadow-sm"
                  : "text-slate-500 hover:text-brand-blue-dark hover:bg-slate-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Testimonials list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {testimonialsData[activeTab].map((item: Testimonial, index: number) => (
              <motion.div
                key={`${activeTab}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-brand-bg-light rounded-3xl p-6 border border-slate-100 flex flex-col justify-between shadow-sm relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 text-brand-blue">
                  <MessageSquare size={72} />
                </div>
                
                <p className="text-slate-600 italic text-sm leading-relaxed relative z-10">
                  &quot;{item.text}&quot;
                </p>
                
                <div className="mt-6 pt-4 border-t border-slate-200/50 flex items-center justify-between">
                  <div>
                    <p className="font-display font-extrabold text-brand-blue-dark text-sm">
                      {item.name}
                    </p>
                    <p className="text-slate-400 text-[10px] mt-0.5 font-bold">
                      {item.program || item.relation || item.company}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-brand-red bg-brand-red-light px-2.5 py-0.5 rounded-full uppercase">
                    {item.outcome}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
