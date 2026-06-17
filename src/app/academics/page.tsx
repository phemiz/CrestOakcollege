import React, { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AcademicsContent } from "@/components/academics/AcademicsContent";

export default function Academics() {
  return (
    <>
      <Header />

      <main className="flex-grow">
        {/* HERO */}
        <section className="bg-brand-blue-dark text-white py-20 relative overflow-hidden">
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-blue/40 via-slate-900 to-slate-950" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10 text-center flex flex-col gap-4">
            <span className="text-brand-gold font-bold text-xs uppercase tracking-widest">CCHSMT Curriculum</span>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight">
              Academic Programs
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto font-medium">
              Explore our wide range of undergraduate and postgraduate modules.
            </p>
          </div>
        </section>

        {/* Dynamic content wrapper with Suspense */}
        <Suspense fallback={
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-red border-r-2" />
          </div>
        }>
          <AcademicsContent />
        </Suspense>

      </main>

      <Footer />
    </>
  );
}
