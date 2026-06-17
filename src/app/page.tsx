import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  HeroSection,
  QuickAccessPanel,
  StatisticsSection,
  AboutSection,
  PartnershipSection,
  NewsSection,
  CTASection
} from "@/components/home";

const PathwayFinderSection = dynamic(
  () => import("@/components/home/PathwayFinderSection").then((mod) => mod.PathwayFinderSection),
  {
    loading: () => (
      <div className="min-h-[300px] flex items-center justify-center text-slate-400 font-semibold bg-white border border-slate-100 rounded-3xl p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-red border-r-2" />
      </div>
    ),
  }
);

const TestimonialsSection = dynamic(
  () => import("@/components/home/TestimonialsSection").then((mod) => mod.TestimonialsSection),
  {
    loading: () => (
      <div className="min-h-[250px] flex items-center justify-center text-slate-400 font-semibold bg-white border border-slate-100 rounded-3xl p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-red border-r-2" />
      </div>
    ),
  }
);

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-grow">
        {/* Above-the-fold content rendered instantly on server */}
        <HeroSection />
        <QuickAccessPanel />
        <StatisticsSection />
        <AboutSection />
        <PartnershipSection />
        
        {/* Pathway Finder (Deferred dynamic component) */}
        <Suspense fallback={
          <div className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-red border-r-2" />
          </div>
        }>
          <PathwayFinderSection />
        </Suspense>

        {/* Testimonials (Deferred dynamic component) */}
        <Suspense fallback={
          <div className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-red border-r-2" />
          </div>
        }>
          <TestimonialsSection />
        </Suspense>

        <NewsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
