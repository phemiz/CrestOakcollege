"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare } from "lucide-react";

type Review = {
  id: number;
  name: string;
  role: string | null;
  text: string;
  photoUrl: string | null;
  category: string | null;
  programOrRelation: string | null;
  outcome: string | null;
};

export const TestimonialsSection = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reviews.php")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReviews(data.reviews);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (!loading && reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="text-center max-w-xl mx-auto flex flex-col gap-4 mb-12">
          <span className="text-brand-red font-bold text-xs uppercase tracking-widest">
            Testimonials
          </span>
          <h2 className="font-display text-3xl font-extrabold text-brand-blue-dark tracking-tight">
            Institutional Credibility &amp; Trust
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            Hear what our students, graduates, guardians, and clinical partners in Nigeria say about our courses.
          </p>
        </div>

        <div className="flex overflow-x-auto no-scrollbar gap-6 pb-4 snap-x snap-mandatory">
          <AnimatePresence>
            {reviews.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-brand-bg-light rounded-3xl p-6 border border-slate-100 flex flex-col justify-between shadow-sm relative overflow-hidden shrink-0 w-full sm:w-[380px] snap-start"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 text-brand-blue">
                  <MessageSquare size={72} />
                </div>

                {item.photoUrl && (
                  <img
                    src={item.photoUrl}
                    alt={item.name}
                    className="w-14 h-14 rounded-full object-cover mb-4 relative z-10"
                  />
                )}

                <p className="text-slate-600 italic text-sm leading-relaxed relative z-10">
                  &quot;{item.text}&quot;
                </p>

                <div className="mt-6 pt-4 border-t border-slate-200/50 flex items-center justify-between">
                  <div>
                    <p className="font-display font-extrabold text-brand-blue-dark text-sm">
                      {item.name}
                    </p>
                    {item.programOrRelation && (
                      <p className="text-slate-400 text-[10px] mt-0.5 font-bold">
                        {item.programOrRelation}
                      </p>
                    )}
                  </div>
                  {item.outcome && (
                    <span className="text-[10px] font-bold text-brand-red bg-brand-red-light px-2.5 py-0.5 rounded-full uppercase">
                      {item.outcome}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
