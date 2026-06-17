import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ShieldCheck } from "lucide-react";

export const AboutSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="flex flex-col gap-6">
          <span className="text-brand-red font-bold text-sm uppercase tracking-widest">About Our Institution</span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-blue-dark tracking-tight leading-tight">
            Igniting Changes Through Innovation and Knowledge
          </h2>
          <p className="text-slate-600 leading-relaxed font-medium">
            CrestOak College of Health Sciences, Management and Technology (CCHSMT) stands as a beacon of academic excellence in Lagos. Strategically located in the historic town of Badagry, our institution is dedicated to raising qualified healthcare practitioners, managers, legal practitioners, and technologists.
          </p>
          <p className="text-slate-600 leading-relaxed font-medium">
            Our academic programmes are run under the <span className="font-display font-bold text-brand-blue-dark">academic partnership and supervision of Atiba University, Oyo</span>, ensuring that all curricula meet rigorous national standards and degrees are widely recognized. We believe in standard hands-on clinical laboratories, digital workshops, and active mentoring.
          </p>
          
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex gap-3.5 items-start">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-full shrink-0 mt-0.5">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 className="font-display font-bold text-brand-blue-dark">University Partnership</h4>
                <p className="text-slate-500 text-sm mt-0.5">Formal partnership ensures transfer paths, academic oversight, and standard degree awarding frameworks.</p>
              </div>
            </div>
            <div className="flex gap-3.5 items-start">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-full shrink-0 mt-0.5">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 className="font-display font-bold text-brand-blue-dark">Modern Practical Laboratories</h4>
                <p className="text-slate-500 text-sm mt-0.5">Experience practical simulation in state-of-the-art clinics, laboratories, and computer centers.</p>
              </div>
            </div>
          </div>

          <div className="mt-2">
            <Link href="/about">
              <button className="inline-flex items-center gap-2 text-brand-red hover:text-brand-red/80 font-display font-bold text-base transition-colors group cursor-pointer">
                <span>Read Rector Message</span>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>

        {/* Visual Frame */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue-light to-brand-blue rounded-3xl opacity-10 blur-xl -rotate-3 translate-x-2 translate-y-2" />
          <div className="relative border border-slate-100 bg-slate-50 p-8 rounded-3xl flex flex-col gap-6 shadow-md">
            <div className="flex items-center gap-4 border-b border-slate-200/60 pb-4">
              <div className="w-12 h-12 rounded-full bg-white p-0.5 shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                <Image
                  src="/crestoak-logo.png"
                  alt="CrestOak College Seal"
                  width={48}
                  height={48}
                  loading="lazy"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <div>
                <h4 className="font-display font-bold text-brand-blue-dark text-lg">CrestOak Philosophy</h4>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">Our Values</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/60">
                <span className="font-display font-black text-brand-red text-2xl">01.</span>
                <h5 className="font-display font-bold text-brand-blue-dark mt-1 text-sm">Academic Rigor</h5>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">Adhering strictly to standard professional training guidelines.</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-150/60">
                <span className="font-display font-black text-brand-red text-2xl">02.</span>
                <h5 className="font-display font-bold text-brand-blue-dark mt-1 text-sm">Innovation</h5>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">Leveraging tech solutions in health diagnostics and business.</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-150/60">
                <span className="font-display font-black text-brand-red text-2xl">03.</span>
                <h5 className="font-display font-bold text-brand-blue-dark mt-1 text-sm">Moral Integrity</h5>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">Instilling ethics, social duty, and values in all future graduates.</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-150/60">
                <span className="font-display font-black text-brand-red text-2xl">04.</span>
                <h5 className="font-display font-bold text-brand-blue-dark mt-1 text-sm">Empowerment</h5>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">Preparing graduates for entrepreneurship and career excellence.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
