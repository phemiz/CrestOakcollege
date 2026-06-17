import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ShieldCheck, GraduationCap } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-slate-900 overflow-hidden py-20">
      {/* Background Gradient Mesh */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-blue/30 via-slate-900 to-slate-950" />
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-brand-red/10 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-96 h-96 bg-brand-blue-light/10 rounded-full blur-3xl" />
      
      {/* Subtle Grid overlay */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Content */}
        <div className="lg:col-span-7 text-center lg:text-left flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
            <div
              className="inline-flex items-center gap-2 bg-red-500/25 border-2 border-red-400 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.45)] px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider w-fit animate-pulse opacity-0 animate-fade-in-down"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping shrink-0" />
              Admissions Open: Undergrad 2026/2027 & Postgrad 2025/2026
            </div>
            <div
              className="inline-flex items-center gap-1.5 bg-brand-blue-light/10 border border-brand-blue-light/30 px-3.5 py-1.5 rounded-full text-brand-blue-light font-semibold text-[10px] sm:text-xs uppercase tracking-wider w-fit opacity-0 animate-fade-in-down animation-delay-100"
            >
              <Image
                src="/atiba-university-banner.png"
                alt="Atiba University Logo"
                width={16}
                height={16}
                priority
                className="w-4 h-4 rounded-full object-cover object-left"
              />
              <span>Partnered with Atiba University</span>
            </div>
          </div>

          <h1
            className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.1] opacity-0 animate-fade-in-up animation-delay-100"
          >
            CrestOak College of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue-light via-sky-300 to-white">
              Health Sciences
            </span>, <br />
            Management & Tech
          </h1>

          <p
            className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium opacity-0 animate-fade-in-up animation-delay-200"
          >
            Igniting Changes Through Knowledge. Under the academic partnership and supervision of Atiba University, Oyo, discover comprehensive professional programs to build your clinical and technical expertise.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-1 opacity-0 animate-fade-in-up animation-delay-300"
          >
            <Link href="/admissions">
              <button className="bg-brand-red hover:bg-brand-red/90 text-white font-display font-bold px-8 py-3.5 rounded-full shadow-lg shadow-brand-red/30 transition-all cursor-pointer flex items-center gap-2">
                <span>Apply Now</span>
                <ChevronRight size={16} />
              </button>
            </Link>
            <Link href="/academics">
              <button className="border border-white/20 hover:border-white/50 text-white hover:bg-white/5 font-display font-bold px-8 py-3.5 rounded-full transition-all cursor-pointer">
                Explore Programs
              </button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div
            className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-[10px] text-slate-400 font-bold uppercase tracking-wider opacity-70"
          >
            <span className="flex items-center gap-1.5"><ShieldCheck className="text-brand-gold" size={14} /> NUC Aligned Pathways</span>
            <span className="hidden sm:inline opacity-30">|</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="text-brand-gold" size={14} /> Board Certified Wards</span>
            <span className="hidden sm:inline opacity-30">|</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="text-brand-gold" size={14} /> Lagos State Accredited</span>
          </div>
        </div>

        {/* Right Graphics/Badge */}
        <div className="lg:col-span-5 flex justify-center items-center">
          <div
            className="relative bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl w-full max-w-sm overflow-hidden flex flex-col items-center justify-center gap-6 opacity-0 animate-scale-in"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/10 rounded-full blur-2xl" />
            
            {/* Visual Ring */}
            <div className="w-48 h-48 rounded-full border-4 border-dashed border-white/20 flex items-center justify-center p-4 relative">
              <GraduationCap size={72} className="text-brand-gold animate-bounce" />
              <div className="absolute inset-0 rounded-full border border-white/10 animate-pulse" />
            </div>
            
            <div className="text-center">
              <h3 className="font-display text-white text-xl font-bold">Nigeria&apos;s Finest Training</h3>
              <p className="text-slate-400 text-xs mt-1">Badagry, Lagos State</p>
            </div>

            <div className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
              <p className="text-brand-gold text-sm font-semibold">JAMB Cut-Off Mark</p>
              <p className="text-white text-2xl font-black mt-1">140+</p>
              <p className="text-slate-400 text-[10px] mt-0.5">Required for 2025/2026 Admissions</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
