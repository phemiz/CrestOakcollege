import React from "react";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Eye, Rocket, CheckCircle2 } from "lucide-react";

const values = [
  { name: "Academic Excellence", desc: "Rigorous standards, expert lecturing, and licensed-focused practical mock reviews." },
  { name: "Clinical Integrity", desc: "Instilling deep respect for safety, ethical protocols, patient confidentiality, and health guidelines." },
  { name: "Technological Competence", desc: "Adapting modern diagnostics, digital tools, and computing architectures in health and business." },
  { name: "Community Responsibility", desc: "Building local engagement, emergency diagnostics, and rural outreach modules." },
];

export default function About() {
  return (
    <>
      <Header />

      <main className="flex-grow">
        {/* HERO HEADER */}
        <section className="bg-brand-blue-dark text-white py-20 relative overflow-hidden">
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-blue/40 via-slate-900 to-slate-950" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10 text-center flex flex-col gap-4">
            <span className="text-brand-gold font-bold text-xs uppercase tracking-widest">Discover CCHSMT</span>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight">
              About Our Institution
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto font-medium">
              A premium, licensed training institution dedicated to raising leaders in healthcare, technology, and administration.
            </p>
          </div>
        </section>

        {/* PROVOST MESSAGE */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Provost Visual Profile */}
            <div className="lg:col-span-5 flex justify-center">
              <div
                className="relative bg-slate-50 border border-slate-100 p-6 rounded-3xl w-full max-w-sm flex flex-col items-center gap-6 shadow-md opacity-0 animate-scale-in"
              >
                <div className="w-48 h-48 rounded-full bg-slate-200 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden relative">
                  <Image
                    src="/rector-enhanced.png"
                    alt="Dr. Ajisefinni E.O. - Rector"
                    width={192}
                    height={192}
                    priority
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center gap-2 -mt-2">
                  <Image
                    src="/crestoak-logo.png"
                    alt="CrestOak College Seal"
                    width={32}
                    height={32}
                    loading="lazy"
                    className="w-8 h-8 rounded-full object-contain shrink-0"
                  />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Official College Seal</span>
                </div>
                <div className="text-center">
                  <h3 className="font-display text-brand-blue-dark text-lg font-bold">Dr. Ajisefinni E.O.</h3>
                  <p className="text-xs font-semibold text-brand-red uppercase tracking-wider mt-1">Rector</p>
                  <p className="text-slate-400 text-[10px] mt-0.5">PhD</p>
                </div>
                <div className="w-full border-t border-slate-100 pt-4 text-center">
                  <p className="italic text-slate-500 text-xs leading-relaxed">
                    &quot;We train not just for certificates, but for licenses and moral competence in the fields.&quot;
                  </p>
                </div>
              </div>
            </div>

            {/* Provost Letter */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <span className="text-brand-red font-bold text-sm uppercase tracking-widest">Leadership Message</span>
              <h2 className="font-display text-3xl font-extrabold text-brand-blue-dark tracking-tight">
                Welcome to CrestOak College
              </h2>
              <div className="text-slate-600 leading-relaxed font-medium flex flex-col gap-4 text-sm sm:text-base">
                <p>
                  It gives me great pleasure to welcome you to CrestOak College of Health Sciences, Management and Technology. As an institution founded on the principles of academic excellence, clinical rigor, and ethical values, our goal is to ignite changes through knowledge.
                </p>
                <p>
                  Nigeria&apos;s health and technology sectors require professionals who possess deep practical understanding and technological flexibility. At CCHSMT, our curricula combine rigorous academic requirements with extensive, hands-on clinical and diagnostic exercises in our laboratories.
                </p>
                <p>
                  We are deeply committed to ensuring that our graduates are fully qualified to take and excel in local and international licensing examinations, making them immediate assets to institutions worldwide.
                </p>
                <p className="font-semibold text-brand-blue-dark mt-2">
                  Dr. Ajisefinni E.O. <br />
                  <span className="text-xs text-slate-500">Rector, CCHSMT</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MISSION & VISION */}
        <section className="bg-brand-bg-light py-20 border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Vision */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-5">
              <div className="p-3 bg-brand-blue-dark/5 text-brand-blue w-fit rounded-xl">
                <Eye size={28} />
              </div>
              <h3 className="font-display text-2xl font-extrabold text-brand-blue-dark">Our Vision</h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
                To be a premier, world-class institution of higher learning recognized for cultivating licensed, ethical, and technologically proficient leaders in health sciences, management, and industrial technologies who ignite positive changes within the African community and globally.
              </p>
            </div>

            {/* Mission */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-5">
              <div className="p-3 bg-brand-red-light text-brand-red w-fit rounded-xl">
                <Rocket size={28} />
              </div>
              <h3 className="font-display text-2xl font-extrabold text-brand-blue-dark">Our Mission</h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
                To deliver qualitative, innovative, and accessible education that fuses theoretical concepts with simulation technologies. We seek to foster clinical and management competence, develop professional integrity, and prepare students for immediate, impactful careers through rigorous licensing preparations.
              </p>
            </div>
          </div>
        </section>

        {/* CORE VALUES */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="text-center max-w-xl mx-auto flex flex-col gap-4 mb-16">
              <span className="text-brand-red font-bold text-sm uppercase tracking-widest">Our Culture</span>
              <h2 className="font-display text-3xl font-extrabold text-brand-blue-dark tracking-tight">
                Core Values We Stand For
              </h2>
              <p className="text-slate-500 text-sm font-medium">
                Our institution stands on four key pillars that define our daily academic lectures, practical clinical drills, and administrative culture.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((v, idx) => (
                <div key={v.name} className="border border-slate-100 p-6 rounded-2xl flex flex-col gap-4 hover:shadow-md transition-shadow">
                  <span className="font-display font-black text-brand-blue-light/25 text-4xl">0{idx + 1}</span>
                  <div>
                    <h4 className="font-display font-bold text-brand-blue-dark text-base">{v.name}</h4>
                    <p className="text-slate-500 text-xs mt-2 leading-relaxed font-semibold">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ACADEMIC PARTNERSHIP */}
        <section className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7 flex flex-col gap-6">
              <span className="text-brand-red font-bold text-sm uppercase tracking-widest">Academic Collaboration</span>
              <h2 className="font-display text-3xl font-extrabold text-brand-blue-dark tracking-tight">
                Our Partnership with Atiba University, Oyo
              </h2>
              <div className="text-slate-600 leading-relaxed font-medium flex flex-col gap-4 text-sm sm:text-base">
                <p>
                  CrestOak College of Health Sciences, Management and Technology operates under the <span className="font-display font-bold text-brand-blue-dark">academic partnership and supervision of Atiba University, Oyo, Nigeria</span>. 
                </p>
                <p>
                  This strategic academic partnership ensures that our course curricula are designed in direct alignment with university-level standards. Our students benefit from collaborative resources, standard examinations, transfer pathways, and certificates/degrees awarded with the endorsement and supervision of Atiba University.
                </p>
                <p>
                  Through this partnership, we maintain rigorous oversight of all our departments across Applied Health, Arts, Law, Social & Management Sciences, Agriculture, and Applied Sciences.
                </p>
              </div>
            </div>
            
            {/* Partnership Visuals */}
            <div className="lg:col-span-5 flex justify-center">
              <div
                className="relative bg-slate-50 border border-slate-100 p-8 rounded-3xl w-full max-w-md flex flex-col items-center gap-6 shadow-md opacity-0 animate-scale-in"
              >
                <div className="w-full flex items-center justify-center py-4 bg-white rounded-2xl border border-slate-150 p-2 shadow-inner">
                  <Image 
                    src="/atiba-university-banner.png" 
                    alt="Atiba University Logo Banner" 
                    width={180}
                    height={72}
                    loading="lazy"
                    className="object-contain max-h-24 w-auto rounded" 
                  />
                </div>
                
                <div className="text-center w-full border-t border-slate-200/60 pt-4">
                  <h4 className="font-display text-brand-blue-dark font-extrabold text-base">Atiba University, Oyo</h4>
                  <p className="text-xs text-brand-red font-semibold uppercase tracking-wider mt-1">Partner Institution</p>
                  <p className="text-slate-500 text-xs mt-3 leading-relaxed">
                    KM 5, Oyo-Iseyin Road, PMB 1077, Oyo State, Nigeria.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* REGULATORY BODIES & ACCREDITATIONS */}
        <section className="bg-brand-bg-light py-20 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="text-center max-w-xl mx-auto flex flex-col gap-4 mb-16">
              <span className="text-brand-red font-bold text-sm uppercase tracking-widest">Quality Assurance</span>
              <h2 className="font-display text-3xl font-extrabold text-brand-blue-dark tracking-tight">
                Accreditations & Regulatory Partners
              </h2>
              <p className="text-slate-500 text-sm font-medium">
                Our programs are fully validated by local and federal boards in Nigeria to ensure our graduates obtain legal practice licenses upon graduation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-center">
              {[
                "Community Health Practitioners Registration Board of Nigeria",
                "Medical Laboratory Science Council of Nigeria",
                "Nursing and Midwifery Council of Nigeria",
                "Federal Ministry of Education, Abuja",
                "Lagos State Ministry of Health",
                "Board of Technical and Vocational Education",
              ].map((partner, index) => (
                <div
                  key={index}
                  className="bg-white border border-slate-100/60 p-6 rounded-2xl flex items-center gap-4 text-left shadow-sm"
                >
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                    <CheckCircle2 size={20} />
                  </div>
                  <span className="font-display text-xs font-bold text-brand-blue-dark leading-snug">
                    {partner}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
