import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AcademicsContent } from "@/components/academics/AcademicsContent";
import { generateSEO } from "@/utils/seo";
import { StructuredData } from "@/components/seo/StructuredData";
import { facultiesData, postgraduateData } from "@/data/academicsData";

export const dynamic = "force-static";

interface AcademicsPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}

/**
 * Enterprise SEO Dynamic Metadata Generator.
 * Adapts page title, canonical alternates, and meta descriptions based on active query params.
 */
export async function generateMetadata({ searchParams }: AcademicsPageProps = {}): Promise<Metadata> {
  const resolvedParams = searchParams ? (searchParams instanceof Promise ? await searchParams : searchParams) : {};
  const faculty = resolvedParams?.faculty;
  const level = resolvedParams?.level || resolvedParams?.tab;

  if (level === "postgraduate") {
    return generateSEO({
      title: "Postgraduate Degrees & Programmes (PGD, M.Sc, MBA, Ph.D)",
      description: "Explore NUC-approved postgraduate diploma, master, and doctoral degree programmes in Computer Science, Business Administration, Public Administration, Economics, and Nursing sciences at CrestOak College (CCHSMT) Badagry.",
      path: "/academics?level=postgraduate",
      keywords: ["CrestOak Postgraduate", "PGD Computer Science Lagos", "MBA badagry", "PhD public administration Nigeria", "Master of Nursing Lagos"]
    });
  }

  if (faculty && typeof faculty === "string") {
    const fac = facultiesData.find(f => f.id === faculty);
    if (fac) {
      return generateSEO({
        title: `${fac.name} - Available Programs`,
        description: `Explore courses, entry requirements, standard program duration, and career outcomes under the ${fac.name} at CrestOak College (CCHSMT) Badagry, Lagos.`,
        path: `/academics?faculty=${faculty}`,
        keywords: [fac.name, ...fac.courses]
      });
    }
  }

  return generateSEO({
    title: "Academic Programs & Curricula (2026/2027)",
    description: "Discover CrestOak College (CCHSMT) Badagry, Lagos approved undergraduate and postgraduate courses in Health Sciences, Management, Law, Agriculture, and Applied Sciences.",
    path: "/academics",
    keywords: ["Academics CrestOak", "Health Sciences Nigeria", "accredited badagry courses", "law program badagry"]
  });
}

export default async function Academics({ searchParams }: AcademicsPageProps = {}) {
  const resolvedParams = searchParams ? (searchParams instanceof Promise ? await searchParams : searchParams) : {};
  const faculty = resolvedParams?.faculty;
  const level = resolvedParams?.level || resolvedParams?.tab;

  // 1. Dynamic Breadcrumbs List Schema
  const breadcrumbElements = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://crestoakcollege.edu.ng"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Academics",
      "item": "https://crestoakcollege.edu.ng/academics"
    }
  ];

  if (faculty || level) {
    const name = level === "postgraduate" 
      ? "Postgraduate" 
      : (facultiesData.find(f => f.id === faculty)?.name || "Faculty Details");

    breadcrumbElements.push({
      "@type": "ListItem",
      "position": 3,
      "name": name,
      "item": level === "postgraduate" 
        ? "https://crestoakcollege.edu.ng/academics?level=postgraduate" 
        : `https://crestoakcollege.edu.ng/academics?faculty=${faculty}`
    });
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbElements
  };

  // 2. Dynamic Course Schemas
  const schemasToInject: any[] = [breadcrumbSchema];

  if (level === "postgraduate") {
    postgraduateData.forEach(p => {
      p.courses.forEach(c => {
        schemasToInject.push({
          "@context": "https://schema.org",
          "@type": "Course",
          "name": `${p.name} - ${c}`,
          "description": `${p.name} in ${c} offered at CrestOak College (CCHSMT) Badagry, Lagos. Entry requirements: ${p.requirements}`,
          "provider": {
            "@type": "CollegeOrUniversity",
            "name": "CrestOak College",
            "url": "https://crestoakcollege.edu.ng"
          }
        });
      });
    });
  } else {
    const activeFaculty = facultiesData.find(f => f.id === (faculty || "health")) || facultiesData[0];
    activeFaculty.courses.forEach(c => {
      schemasToInject.push({
        "@context": "https://schema.org",
        "@type": "Course",
        "name": c,
        "description": `${c} undergraduate program offered under the ${activeFaculty.name} at CrestOak College (CCHSMT) Badagry, Lagos. Standard duration: ${activeFaculty.duration}.`,
        "provider": {
          "@type": "CollegeOrUniversity",
          "name": "CrestOak College",
          "url": "https://crestoakcollege.edu.ng"
        }
      });
    });
  }

  return (
    <>
      {/* Inject all compiled structured schemas dynamically */}
      {schemasToInject.map((schema, idx) => (
        <StructuredData key={idx} data={schema} />
      ))}
      
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
              Explore our wide range of NUC-approved undergraduate and postgraduate programs.
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
