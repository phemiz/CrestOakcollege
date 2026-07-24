import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, User, BookOpen } from "lucide-react";
import db from "@/lib/db";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { generateSEO } from "@/utils/seo";
import { newsAndEvents } from "@/data/homeData";
import ShareButton from "./ShareButton";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return newsAndEvents
    .filter((item) => item.slug)
    .map((item) => ({ slug: item.slug as string }));
}

interface PageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

// Generate Dynamic SEO Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Await the params if it's a promise
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // 1. Search database
  let article = null;
  try {
    article = await db.news.findUnique({
      where: { slug, isDeleted: false }
    });
  } catch (error) {
    console.error(`[news/[slug]/page.tsx] generateMetadata db query failed for slug ${slug}:`, error);
  }

  if (article && article.isPublished) {
    return generateSEO({
      title: article.title,
      description: article.content.substring(0, 160).replace(/<[^>]*>/g, ""),
      path: `/news/${slug}`
    });
  }

  // 2. Search static fallback
  const staticArticle = newsAndEvents.find((item) => item.slug === slug);
  if (staticArticle) {
    return generateSEO({
      title: staticArticle.title,
      description: staticArticle.desc,
      path: `/news/${slug}`
    });
  }

  return generateSEO({
    title: "Article Not Found",
    description: "The requested news article could not be located.",
    path: `/news/${slug}`
  });
}

export default async function NewsDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // 1. Query DB
  let dbArticle = null;
  try {
    dbArticle = await db.news.findUnique({
      where: { slug, isDeleted: false },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true
          }
        }
      }
    });
  } catch (error) {
    console.error(`[news/[slug]/page.tsx] dbArticle query failed for slug ${slug}:`, error);
  }

  let articleData: {
    title: string;
    content: string;
    date: string;
    category: string;
    alert?: string;
    featuredImage?: string | null;
    authorName: string;
  } | null = null;

  if (dbArticle && dbArticle.isPublished) {
    const pubDate = dbArticle.publishedAt || dbArticle.createdAt;
    articleData = {
      title: dbArticle.title,
      content: dbArticle.content,
      date: pubDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      }),
      category: "Announcement",
      alert: "Official",
      featuredImage: dbArticle.featuredImage,
      authorName: `${dbArticle.author.firstName} ${dbArticle.author.lastName}`
    };
  } else {
    // 2. Query Static Fallback
    const staticArticle = newsAndEvents.find((item) => item.slug === slug);
    if (staticArticle) {
      articleData = {
        title: staticArticle.title,
        content: staticArticle.desc,
        date: staticArticle.date,
        category: staticArticle.category,
        alert: staticArticle.alert,
        featuredImage: null,
        authorName: "Registry Office"
      };
    }
  }

  // If not found, return 404 page
  if (!articleData) {
    notFound();
  }

  // Fetch recent news (excluding the current one) to display in sidebar
  let recentDbArticles: any[] = [];
  try {
    recentDbArticles = await db.news.findMany({
      where: {
        isPublished: true,
        isDeleted: false,
        NOT: { slug }
      },
      orderBy: {
        publishedAt: "desc"
      },
      take: 3
    });
  } catch (error) {
    console.error("[news/[slug]/page.tsx] recentDbArticles query failed:", error);
  }

  const recentSidebarItems = [
    ...recentDbArticles.map((item) => ({
      title: item.title,
      slug: item.slug,
      date: (item.publishedAt || item.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      }),
      category: "Announcement"
    })),
    ...newsAndEvents
      .filter((item) => item.slug !== slug)
      .map((item) => ({
        title: item.title,
        slug: item.slug || "",
        date: item.date,
        category: item.category
      }))
  ].slice(0, 4); // limit to 4 recent items

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg-light">
      <Header />

      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Back button */}
          <div className="mb-8">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-xs font-black uppercase text-slate-550 hover:text-brand-red transition-colors group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to all publications</span>
            </Link>
          </div>

          {/* Grid Layout: Main Article vs Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Article Body */}
            <article className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-sm">
              <header className="flex flex-col gap-6 mb-8">
                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-bold uppercase tracking-wider">
                  <span className="text-[9px] font-black tracking-widest text-white bg-brand-red px-2.5 py-1 rounded-lg shadow-sm">
                    {articleData.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-brand-red" />
                    <span>{articleData.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User size={14} className="text-brand-blue-light" />
                    <span>Issued by {articleData.authorName}</span>
                  </div>
                </div>

                <h1 className="font-display text-2xl sm:text-4xl font-black text-brand-blue-dark leading-tight">
                  {articleData.title}
                </h1>
              </header>

              {/* Main Image */}
              <div className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden mb-8 bg-slate-100 border border-slate-100">
                {articleData.featuredImage ? (
                  <img
                    src={articleData.featuredImage}
                    alt={articleData.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-blue/5 to-brand-blue-dark/10 flex items-center justify-center p-12 text-brand-blue-light/10">
                    <BookOpen size={96} className="text-brand-blue-light/20" />
                  </div>
                )}
              </div>

              {/* Content Body */}
              <div 
                className="prose prose-slate max-w-none text-slate-600 font-medium font-sans leading-relaxed text-sm sm:text-base space-y-6"
                dangerouslySetInnerHTML={{ __html: articleData.content }}
              />

              {/* Footer row inside article */}
              <div className="border-t border-slate-100 pt-8 mt-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-xs text-slate-400 font-semibold italic">
                  * All official notices are verified by the Registrar Office before digital publication.
                </div>
                
                {/* Share action */}
                <ShareButton title={articleData?.title} />
              </div>
            </article>

            {/* Right Column: Sidebar */}
            <aside className="lg:col-span-4 flex flex-col gap-8">
              {/* Sticky wrapper */}
              <div className="sticky top-24 flex flex-col gap-8">
                {/* Academic Partnership Box */}
                <div className="bg-brand-blue-dark text-white rounded-3xl p-6 relative overflow-hidden border border-brand-blue shadow-lg">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-brand-blue-light/30 via-transparent to-transparent" />
                  <div className="relative z-10 flex flex-col gap-4">
                    <span className="text-brand-gold font-display text-[9px] font-black uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded w-fit">
                      Affiliation Notice
                    </span>
                    <h4 className="font-display font-black text-white text-base leading-tight">
                      Atiba University, Oyo Partnership
                    </h4>
                    <p className="text-slate-300 text-xs font-medium leading-relaxed">
                      CrestOak College academic programs are supervised and verified in compliance with Atiba University guidelines and quality assurance standards.
                    </p>
                    <Link
                      href="/about"
                      className="text-xs font-black text-brand-gold hover:text-white transition-colors flex items-center gap-1 mt-1 uppercase"
                    >
                      <span>Read Disclosures</span>
                      <ArrowLeft className="rotate-180" size={12} />
                    </Link>
                  </div>
                </div>

                {/* Recent Updates List */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                  <h3 className="font-display font-black text-brand-blue-dark text-sm uppercase tracking-wider mb-6 pb-2 border-b border-slate-100">
                    Recent Publications
                  </h3>

                  <div className="flex flex-col gap-5">
                    {recentSidebarItems.length === 0 ? (
                      <div className="text-center text-xs font-semibold text-slate-400 py-4">No other recent articles.</div>
                    ) : (
                      recentSidebarItems.map((item, index) => (
                        <Link
                          href={`/news/${item.slug}`}
                          key={index}
                          className="flex flex-col gap-1.5 group cursor-pointer"
                        >
                          <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                            <span>{item.date}</span>
                            <span className="text-brand-red font-extrabold">{item.category}</span>
                          </div>
                          <h4 className="font-display font-bold text-brand-blue-dark text-xs sm:text-sm leading-snug group-hover:text-brand-red transition-colors line-clamp-2">
                            {item.title}
                          </h4>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
