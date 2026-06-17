import React from "react";
import Link from "next/link";

export const CTASection = () => {
  return (
    <section className="bg-brand-blue py-20 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-red/25 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-blue-light/25 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 text-center relative z-10 flex flex-col items-center gap-6">
        <span className="text-brand-gold font-bold text-xs uppercase tracking-widest">Ready to join us?</span>
        <h2 className="font-display text-3xl sm:text-5xl font-black max-w-2xl leading-tight">
          Embark on Your Academic Journey Today
        </h2>
        <p className="text-slate-200 text-sm sm:text-base leading-relaxed max-w-xl font-medium">
          Join CrestOak College of Health Sciences, Management and Technology. Applications are open for the 2025/2026 academic calendar. Secure your place now!
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
          <Link href="/admissions">
            <button className="bg-brand-red hover:bg-brand-red/90 text-white font-display font-bold px-8 py-3.5 rounded-full shadow-lg shadow-brand-red/25 transition-all cursor-pointer">
              Start Application
            </button>
          </Link>
          <Link href="/contact">
            <button className="border border-white/20 hover:border-white/50 text-white hover:bg-white/5 font-display font-bold px-8 py-3.5 rounded-full transition-all cursor-pointer">
              Contact Admissions
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};
