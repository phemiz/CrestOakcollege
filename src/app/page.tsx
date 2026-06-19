import React, { Suspense } from "react";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { generateSEO } from "@/utils/seo";
import { StructuredData } from "@/components/seo/StructuredData";
import {
  HeroSection,
  QuickAccessPanel,
  StatisticsSection,
  AboutSection,
  PartnershipSection,
  NewsSection,
  CTASection
} from "@/components/home";

export const metadata: Metadata = generateSEO({
  title: "CrestOak College | Badagry Campus Health & Technology Programs",
  description: "CrestOak College (CCHSMT) Badagry Lagos. Leading Health Sciences, Management, Law, and Technology programs partnered with Atiba University, Oyo. Start your online application today.",
  path: "",
  keywords: [
    "CrestOak College Home",
    "CCHSMT Badagry",
    "Applied Health Lagos",
    "Atiba University partnership",
    "Nursing entry requirements Nigeria"
  ]
});

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
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "CrestOak College",
          "url": "https://crestoakcollege.edu.ng",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://crestoakcollege.edu.ng/academics?search={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      />
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
