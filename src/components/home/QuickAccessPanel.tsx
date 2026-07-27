import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { quickLinks } from "@/data/homeData";

export const QuickAccessPanel = () => {
  return (
    <section className="relative z-20 -mt-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="text-brand-red animate-pulse" size={18} />
          <h3 className="font-display text-xs font-black text-brand-blue-dark uppercase tracking-widest">
            Quick Access Portal Panel
          </h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickLinks.map((link, idx) => {
            const Icon = link.icon;
            return (
              <Link
                key={idx}
                href={link.href}
                prefetch={false}
                className="flex flex-col gap-3 p-4 bg-slate-50 hover:bg-brand-red-light/20 border border-slate-100 hover:border-brand-red/25 rounded-2xl text-left transition-all duration-300 group hover:-translate-y-1 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-white rounded-xl text-brand-blue group-hover:bg-brand-red group-hover:text-white transition-colors">
                    <Icon size={16} />
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 bg-white group-hover:bg-brand-red/10 group-hover:text-brand-red px-2 py-0.5 rounded border border-slate-100">
                    {link.badge}
                  </span>
                </div>
                <div>
                  <p className="font-display text-xs font-bold text-brand-blue-dark leading-tight group-hover:text-brand-red transition-colors">
                    {link.name}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-snug hidden sm:block">
                    {link.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
