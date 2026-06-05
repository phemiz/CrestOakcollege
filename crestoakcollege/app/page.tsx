"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Header 
} from "@/components/layout/header";
import { 
  Footer 
} from "@/components/layout/footer";
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Award, 
  ShieldCheck, 
  Atom, 
  Briefcase, 
  Scale, 
  Globe, 
  TrendingUp, 
  ChevronRight,
  HeartPulse,
  Leaf
} from "lucide-react";

const stats = [
  { id: 1, name: "Accredited Programs", value: "25+", icon: BookOpen },
  { id: 2, name: "Active Students", value: "1,200+", icon: Users },
  { id: 3, name: "Qualified Faculty", value: "85+", icon: GraduationCap },
  { id: 4, name: "Success Rate", value: "98%", icon: Award },
];

const faculties = [
  {
    id: "health",
    name: "Faculty of Allied Health Sciences",
    desc: "Nursing Science, Medical Laboratory Science, Public Health, Physiology.",
    icon: HeartPulse,
    color: "from-blue-500/10 to-emerald-500/10 hover:border-emerald-500",
    iconColor: "text-emerald-600",
  },
  {
    id: "social",
    name: "Faculty of Social & Management Sciences",
    desc: "Business Administration, Banking, Criminology, Hospitality, International Relations.",
    icon: Briefcase,
    color: "from-blue-500/10 to-indigo-500/10 hover:border-indigo-500",
    iconColor: "text-indigo-600",
  },
  {
    id: "natural",
    name: "Faculty of Natural & Applied Sciences",
    desc: "Computer Science, Mathematics, Microbiology, Biochemistry, Physics.",
    icon: Atom,
    color: "from-blue-500/10 to-cyan-500/10 hover:border-cyan-500",
    iconColor: "text-cyan-600",
  },
  {
    id: "law",
    name: "Faculty of Law",
    desc: "Comprehensive LL.B program designed for tomorrow's legal minds and jurists.",
    icon: Scale,
    color: "from-blue-500/10 to-amber-500/10 hover:border-amber-500",
    iconColor: "text-amber-600",
  },
  {
    id: "arts",
    name: "Faculty of Arts",
    desc: "English Language and Theatre Arts modules exploring language, culture, and creative expression.",
    icon: Globe,
    color: "from-blue-500/10 to-purple-500/10 hover:border-purple-500",
    iconColor: "text-purple-600",
  },
  {
    id: "agriculture",
    name: "Faculty of Agricultural Sciences",
    desc: "Agricultural Extension and Rural Development targeting ecological security.",
    icon: Leaf,
    color: "from-blue-500/10 to-green-500/10 hover:border-green-500",
    iconColor: "text-green-600",
  },
];

export default function Home() {
  return (
    <>
      <Header />

      <main className="flex-grow">
        {/* HERO SECTION */}
        <section className="relative min-h-[90vh] flex items-center bg-slate-900 overflow-hidden py-20">
          {/* Background Gradient Mesh */}
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-blue/30 via-slate-900 to-slate-950" />
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-brand-red/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-96 h-96 bg-brand-blue-light/10 rounded-full blur-3xl" />
          
          {/* Subtle Grid overlay */}
          <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 text-center lg:text-left flex flex-col gap-6">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-brand-red-light/10 border border-brand-red/30 px-4 py-1.5 rounded-full text-brand-red font-semibold text-xs uppercase tracking-wider mx-auto lg:mx-0 w-fit"
              >
                <span className="w-2 h-2 rounded-full bg-brand-red animate-ping" />
                Admission Open for 2025/2026 Session
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.1]"
              >
                CrestOak College of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue-light via-sky-300 to-white">
                  Health Sciences
                </span>, <br />
                Management & Tech
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium"
              >
                Igniting Changes Through Knowledge. Discover a world of comprehensive academic programs designed to equip you with clinical expertise and technical capacity.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-2"
              >
                <Link href="/admissions">
                  <button className="bg-brand-red hover:bg-brand-red/90 text-white font-display font-bold px-8 py-3.5 rounded-full shadow-lg shadow-brand-red/30 transition-all cursor-pointer">
                    Apply Now
                  </button>
                </Link>
                <Link href="/academics">
                  <button className="border border-white/20 hover:border-white/50 text-white hover:bg-white/5 font-display font-bold px-8 py-3.5 rounded-full transition-all cursor-pointer">
                    Explore Faculties
                  </button>
                </Link>
              </motion.div>
            </div>

            {/* Right Graphics/Badge */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="relative bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl w-full max-w-sm overflow-hidden flex flex-col items-center justify-center gap-6"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/10 rounded-full blur-2xl" />
                
                {/* Visual Ring */}
                <div className="w-48 h-48 rounded-full border-4 border-dashed border-white/20 flex items-center justify-center p-4">
                  <GraduationCap size={72} className="text-brand-gold" />
                </div>
                
                <div className="text-center">
                  <h3 className="font-display text-white text-xl font-bold">Nigeria's Finest Training</h3>
                  <p className="text-slate-400 text-xs mt-1">Badagry, Lagos State</p>
                </div>

                <div className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                  <p className="text-brand-gold text-sm font-semibold">JAMB Cut-Off Mark</p>
                  <p className="text-white text-2xl font-black mt-1">140+</p>
                  <p className="text-slate-400 text-[10px] mt-0.5">Required for 2025/2026 Admissions</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* STATISTICS SECTION */}
        <section className="bg-brand-bg-light py-10 border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.id} className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="p-3 bg-brand-blue-dark/5 text-brand-blue rounded-xl shrink-0">
                    <stat.icon size={26} />
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold text-brand-blue-dark font-display">{stat.value}</p>
                    <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">{stat.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WELCOME SECTION */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col gap-6">
              <span className="text-brand-red font-bold text-sm uppercase tracking-widest">About Our Institution</span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-blue-dark tracking-tight leading-tight">
                Igniting Changes Through Innovation and Knowledge
              </h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                CrestOak College of Health Sciences, Management and Technology (CCHSMT) stands as a beacon of academic excellence in Lagos. Strategically located in the historic town of Badagry, our institution is dedicated to raising healthcare technicians, technological pioneers, and business administrators.
              </p>
              <p className="text-slate-600 leading-relaxed font-medium">
                We believe in standard hands-on clinical laboratories, digital workshops, and active mentoring. We provide academic paths which align with regulatory licenses, assuring that our students graduate ready to qualify and excel in licensing examinations globally.
              </p>
              
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex gap-3.5 items-start">
                  <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-full shrink-0 mt-0.5">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-brand-blue-dark">Full Accreditation</h4>
                    <p className="text-slate-500 text-sm mt-0.5">Our curriculum is fully validated and accredited by relevant academic regulatory bodies in Nigeria.</p>
                  </div>
                </div>
                <div className="flex gap-3.5 items-start">
                  <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-full shrink-0 mt-0.5">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-brand-blue-dark">Modern Practical Laboratories</h4>
                    <p className="text-slate-500 text-sm mt-0.5">Experience practical simulation in state-of-the-art clinics, laboratories, and computer centers.</p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Link href="/about">
                  <button className="inline-flex items-center gap-2 text-brand-red hover:text-brand-red/80 font-display font-bold text-base transition-colors group cursor-pointer">
                    <span>Read Provost Message</span>
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Visual Frame */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue-light to-brand-blue rounded-3xl opacity-10 blur-xl -rotate-3 translate-x-2 translate-y-2" />
              <div className="relative border border-slate-100 bg-slate-50 p-8 rounded-3xl flex flex-col gap-6 shadow-md">
                <div className="flex items-center gap-4 border-b border-slate-200/60 pb-4">
                  <div className="w-12 h-12 rounded-full bg-brand-blue text-white flex items-center justify-center font-display font-bold text-lg shrink-0">
                    CO
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-brand-blue-dark text-lg">CrestOak Philosophy</h4>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">Our Values</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/60">
                    <span className="font-display font-black text-brand-red text-2xl">01.</span>
                    <h5 className="font-display font-bold text-brand-blue-dark mt-1 text-sm">Academic Rigor</h5>
                    <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">Adhering strictly to standard professional training guidelines.</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/60">
                    <span className="font-display font-black text-brand-red text-2xl">02.</span>
                    <h5 className="font-display font-bold text-brand-blue-dark mt-1 text-sm">Innovation</h5>
                    <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">Leveraging tech solutions in health diagnostics and business.</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/60">
                    <span className="font-display font-black text-brand-red text-2xl">03.</span>
                    <h5 className="font-display font-bold text-brand-blue-dark mt-1 text-sm">Moral Integrity</h5>
                    <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">Instilling ethics, social duty, and values in all future graduates.</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/60">
                    <span className="font-display font-black text-brand-red text-2xl">04.</span>
                    <h5 className="font-display font-bold text-brand-blue-dark mt-1 text-sm">Empowerment</h5>
                    <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">Preparing graduates for entrepreneurship and career excellence.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ACADEMICS BENTO GRID */}
        <section className="bg-brand-bg-light py-20 border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="text-center max-w-xl mx-auto flex flex-col gap-4 mb-16">
              <span className="text-brand-red font-bold text-sm uppercase tracking-widest">Faculties</span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-blue-dark tracking-tight">
                Our Specialized Faculties
              </h2>
              <p className="text-slate-500 text-sm font-medium">
                Explore our accredited faculties. We design courses to empower career growth, research capability, and clinical proficiency.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {faculties.map((fac) => (
                <div
                  key={fac.id}
                  className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group flex flex-col justify-between"
                >
                  <div className="flex flex-col gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-tr ${fac.color} ${fac.iconColor} shrink-0`}>
                      <fac.icon size={24} />
                    </div>
                    <div>
                      <h3 className="font-display text-brand-blue-dark text-lg font-bold group-hover:text-brand-red transition-colors">
                        {fac.name}
                      </h3>
                      <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                        {fac.desc}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-50">
                    <Link
                      href={`/academics?faculty=${fac.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-brand-blue-light hover:text-brand-red tracking-wider transition-colors cursor-pointer"
                    >
                      <span>Explore Courses</span>
                      <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA ADMISSIONS BANNER */}
        <section className="bg-brand-blue py-20 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-red/25 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-blue-light/25 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 text-center relative z-10 flex flex-col items-center gap-6">
            <span className="text-brand-gold font-bold text-xs uppercase tracking-widest">Ready to join us?</span>
            <h2 className="font-display text-3xl sm:text-5xl font-black max-w-2xl leading-tight">
              Embark on Your Academic Journey Today
            </h2>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed max-w-xl font-medium">
              Join CrestOak College of Health Sciences, Management and Technology. Applications are open for the 2025/2026 academic calendar. Secure your place now!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
              <Link href="/admissions">
                <button className="bg-brand-red hover:bg-brand-red/90 text-white font-display font-bold px-8 py-3.5 rounded-full shadow-lg shadow-brand-red/25 transition-all cursor-pointer">
                  Start Application
                </button>
              </Link>
              <Link href="/contact">
                <button className="border border-white/20 hover:border-white/50 text-white hover:bg-white/5 font-display font-bold px-8 py-3.5 rounded-full transition-all cursor-pointer">
                  Contact Admissions
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
