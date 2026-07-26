import React, { Suspense } from "react";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { generateSEO } from "@/utils/seo";
import { StructuredData } from "@/components/seo/StructuredData";

export const metadata: Metadata = generateSEO({
  title: "Campus Gallery & Media Center",
  description: "Take a virtual tour of CrestOak College (CCHSMT) Badagry campus. Explore clinical wards, laboratory machinery, lecture theatres, and student activities.",
  path: "/gallery",
  keywords: [
    "CrestOak Gallery",
    "CCHSMT virtual tour",
    "Badagry campus photos",
    "Nursing lab equipment pictures Nigeria"
  ]
});

const GalleryGrid = dynamic(
  () => import("@/components/gallery/GalleryGrid").then((mod) => mod.GalleryGrid),
  {
    loading: () => (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-red border-r-2" />
      </div>
    ),
  }
);

export default function Gallery() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://crestoakcollege.com.ng"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Gallery & Tour",
        "item": "https://crestoakcollege.com.ng/gallery"
      }
    ]
  };

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <Header />

      <main className="flex-grow bg-slate-50">
        {/* HERO HEADER */}
        <section className="bg-brand-blue-dark text-white py-20 relative overflow-hidden">
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-blue/40 via-slate-900 to-slate-950" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10 text-center flex flex-col gap-4">
            <span className="text-brand-gold font-bold text-xs uppercase tracking-widest">Campus Media Center</span>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight">
              Gallery & Campus Tour
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto font-medium">
              Explore CCHSMT laboratory wards, clinical equipment, lecture halls, and activities in our Badagry campus.
            </p>
          </div>
        </section>

        {/* Dynamic Gallery Grid component with dynamic chunks */}
        <Suspense fallback={
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-red border-r-2" />
          </div>
        }>
          <GalleryGrid />
        </Suspense>

      </main>

      <Footer />
    </>
  );
}
