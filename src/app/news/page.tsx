import React from "react";
import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { generateSEO } from "@/utils/seo";
import { newsAndEvents } from "@/data/homeData";
import NewsList, { UnifiedNewsItem } from "@/components/news/NewsList";

export const dynamic = "force-static";

export const metadata: Metadata = generateSEO({
  title: "News & Publications",
  description: "Stay up to date with official announcements, admissions updates, clinical posting schedules, and academic calendar alerts from CrestOak College.",
  path: "/news",
  keywords: [
    "CrestOak news",
    "CrestOak college announcements",
    "CCHSMT Badagry updates",
    "Academic accreditation updates",
    "Lagos health science admissions updates"
  ]
});

export default function NewsListingPage() {
  const mappedStaticNews: UnifiedNewsItem[] = newsAndEvents.map((item) => {
    let formattedDate = "Recently";
    try {
      const d = new Date(item.date);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric"
        });
      }
    } catch {}

    return {
      id: `static-${item.id}`,
      title: item.title,
      slug: item.slug || `news-${item.id}`,
      content: item.desc,
      date: formattedDate,
      category: item.category,
      alert: item.alert,
      featuredImage: "/crestoak-poster.jpg",
      authorName: "Registry Office"
    };
  });

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg-light">
      <Header />

      <main className="flex-grow">
        {/* News Hero Header Banner */}
        <section className="bg-brand-blue-dark text-white py-16 sm:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-blue-light/25 via-transparent to-transparent" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
            <div className="max-w-3xl flex flex-col gap-4 animate-fade-in-up">
              <span className="text-brand-gold font-display text-xs font-black uppercase tracking-widest bg-brand-blue/35 border border-white/10 px-3 py-1 rounded-full w-fit">
                CrestOak Information Hub
              </span>
              <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                News, Updates & Campus Announcements
              </h1>
              <p className="text-slate-300 text-sm sm:text-base font-semibold leading-relaxed mt-2">
                Stay updated with the latest screening dates, partnership details, and operational announcements issued by the CrestOak College Registry.
              </p>
            </div>
          </div>
        </section>

        {/* Search & Listing Content */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-16">
          <NewsList initialNews={mappedStaticNews} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
