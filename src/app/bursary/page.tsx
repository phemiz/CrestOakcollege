import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Coins } from "lucide-react";
import { BursaryCalculator } from "@/components/bursary/BursaryCalculator";

export default function BursaryPage() {
  return (
    <>
      <Header />

      <main className="flex-grow bg-slate-50 print:bg-white">
        {/* HERO SECTION */}
        <section className="bg-brand-blue-dark text-white py-20 relative overflow-hidden print:hidden">
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-blue/40 via-slate-900 to-slate-950" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10 text-center flex flex-col gap-4">
            <span className="text-brand-gold font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-1.5">
              <Coins size={14} className="text-brand-gold animate-bounce" />
              Bursary Department
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight">
              Approved Fee Structure
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto font-medium">
              Official fees schedules and installment payment pathways for the 2026/2027 Academic Session. Plan your education finances transparently.
            </p>
          </div>
        </section>

        {/* Interactive Fee Calculator Grid */}
        <BursaryCalculator />

      </main>

      <Footer />
    </>
  );
}
