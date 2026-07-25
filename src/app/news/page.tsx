import React from "react";
import type { Metadata } from "next";
import db from "@/lib/db";
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
    "Atiba University partnership news",
    "Lagos health science admissions updates"
  ]
});

export default async function NewsListingPage() {
  // Fetch published news from the database
  let dbNewsList: any[] = [];
  try {
    dbNewsList = await db.news.findMany({
      where: {
        isPublished: true,
        isDeleted: false
      },
      orderBy: {
        publishedAt: "desc"
      },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });
  } catch (error) {
    console.error("[news/page.tsx] Database query failed, falling back to static news:", error);
  }

  // Map database news items to the UnifiedNewsItem interface
  const mappedDbNews = dbNewsList.map((item) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    content: item.content,
    date: (item.publishedAt || item.createdAt || new Date()).toISOString(), // Temporarily use ISO string for sorting
    category: "Announcement",
    alert: "Official",
    featuredImage: item.featuredImage,
    authorName: item.author ? `${item.author.firstName} ${item.author.lastName}` : "Registry Office"
  }));

  // Map static news items to the UnifiedNewsItem interface
  const mappedStaticNews = newsAndEvents.map((item) => {
    // Parse the date string safely or default to a date
    let dateObj: Date;
    try {
      dateObj = new Date(item.date);
      if (isNaN(dateObj.getTime())) {
        dateObj = new Date();
      }
    } catch {
      dateObj = new Date();
    }

    return {
      id: `static-${item.id}`,
      title: item.title,
      slug: item.slug || "",
      content: item.desc,
      date: dateObj.toISOString(), // Temporarily use ISO string for sorting
      category: item.category,
      alert: item.alert,
      featuredImage: null,
      authorName: "Registry Office"
    };
  });

  // Merge and filter out duplicates by slug
  const allNewsMap = new Map<string, UnifiedNewsItem>();
  
  // Database news takes priority over static if slugs conflict
  mappedStaticNews.forEach((item) => {
    if (item.slug) {
      allNewsMap.set(item.slug, item);
    }
  });
  
  mappedDbNews.forEach((item) => {
    if (item.slug) {
      allNewsMap.set(item.slug, item);
    }
  });

  const mergedNews = Array.from(allNewsMap.values());

  // Sort chronologically desc
  mergedNews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Format the dates back into readable strings for display
  const finalNews: UnifiedNewsItem[] = mergedNews.map((item) => {
    let formattedDate = "";
    try {
      const d = new Date(item.date);
      formattedDate = d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      });
    } catch {
      formattedDate = "Recently";
    }

    return {
      ...item,
      date: formattedDate
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
          <NewsList initialNews={finalNews} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
