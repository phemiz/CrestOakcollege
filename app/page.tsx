"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
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
  ChevronRight,
  HeartPulse,
  Leaf,
  Calendar,
  Building,
  ClipboardList,
  Wallet,
  Sparkles,
  Check,
  CheckCircle2,
  Lock,
  ExternalLink,
  MessageSquare
} from "lucide-react";

// Stat counter component that increments on mount
const StatCounter = ({ value, label, icon: Icon }: { value: string; label: string; icon: any }) => {
  const [count, setCount] = useState(0);
  const target = parseInt(value.replace(/[^0-9]/g, ""), 10);
  const isPercent = value.includes("%");
  const isPlus = value.includes("+");

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const totalSteps = duration / 16;
    const increment = target / totalSteps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-3 bg-brand-blue-dark/5 text-brand-blue rounded-xl shrink-0">
        <Icon size={26} className="text-brand-blue-light" />
      </div>
      <div>
        <p className="text-3xl font-extrabold text-brand-blue-dark font-display">
          {count}
          {isPlus && "+"}
          {isPercent && "%"}
        </p>
        <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
};

const quickLinks = [
  { name: "Admissions Portal", desc: "Start online application", href: "/admissions", icon: ClipboardList, badge: "Open" },
  { name: "Program Finder", desc: "Find courses & criteria", href: "/academics", icon: BookOpen, badge: "B.Sc./Degree" },
  { name: "Student Portal", desc: "Register courses & check results", href: "/portal", icon: GraduationCap, badge: "Active" },
  { name: "Fee Payment Portal", desc: "Simulated Paystack billing", href: "/portal?tab=billing", icon: Wallet, badge: "Secure" },
  { name: "Campus Gallery", desc: "Labs, library & campus life", href: "/gallery", icon: Building, badge: "Tour" },
  { name: "Admin CMS Control", desc: "Manage announcements & fees", href: "/admin", icon: ShieldCheck, badge: "Staff" }
];

const chooseReasons = [
  {
    title: "Accredited Health & Tech Modules",
    desc: "Fully validated by NMCN, MLSCN, and Community Health Boards for licensed practice.",
    icon: ShieldCheck
  },
  {
    title: "Affiliated with Atiba University",
    desc: "Formal degree supervision and academic paths endorsed by Atiba University, Oyo.",
    icon: GraduationCap
  },
  {
    title: "Modern Training Laboratories",
    desc: "Gain hands-on expertise in simulated clinical wards, microbiology labs, and tech hubs.",
    icon: Atom
  },
  {
    title: "Affordable & Installment Fees",
    desc: "Flexible, parents-focused tuition structured to allow convenient installment splits.",
    icon: Wallet
  },
  {
    title: "Clinical Placement Guarantee",
    desc: "Rotations and internships across recognized regional hospitals and digital enterprises.",
    icon: HeartPulse
  },
  {
    title: "Graduate Job Employability",
    desc: "Focus on licensing examination reviews to ensure immediate workforce integration.",
    icon: Briefcase
  }
];

const testimonialsData = {
  students: [
    { name: "Chinedu Okafor", program: "Nursing Science (B.Sc.)", text: "The medical lab equipment at CrestOak is outstanding. The practical sessions prepare us for actual clinical tasks. It makes a huge difference compared to other colleges.", outcome: "Clinical Intern" },
    { name: "Fatima Bello", program: "Computer Science (B.Sc.)", text: "I love the hybrid learning structure. CrestOak has modern computer hardware labs and the collaboration with Atiba University provides great resources.", outcome: "Software Dev Aspirant" }
  ],
  alumni: [
    { name: "Tunde Adelakun", program: "Medical Laboratory Science (B.Sc.)", text: "Directly after my B.Sc. program, I secured a job at a top diagnostic center in Lagos. The licensing review drills at CrestOak were the key to passing my board exams.", outcome: "Lab Scientist at Synlab" },

    { name: "Amara Okoye", program: "Public Health Graduate", text: "The program focused heavily on community engagement and epidemiology. I was hired by a healthcare NGO immediately after graduation.", outcome: "Health Officer, UNICEF NG" }
  ],
  parents: [
    { name: "Chief Gabriel Adebayo", relation: "Parent of Nursing Student", text: "Sending my daughter to CrestOak is the best decision I've made. The school fees are affordable, payments are structured, and the affiliation with Atiba University is reassuring.", outcome: "Satisfied Parent" },
    { name: "Alhaji Ibrahim Musa", relation: "Guardian of Computer Science Student", text: "The focus on ethics and practical skills makes CrestOak stand out. My nephew is already designing websites and databases in his second year.", outcome: "Proud Uncle" }
  ],
  partners: [
    { name: "Dr. Kunle Fagbemi", company: "Lagos Health Systems", text: "We have partnered with CrestOak for clinical rotations for 3 years. Their students show higher clinical preparedness and discipline than most.", outcome: "Healthcare Partner" },
    { name: "Engr. Sandra Cole", company: "TechNext Nigeria", text: "CrestOak graduates in Applied Sciences adapt very quickly to industry tech stacks. Their curriculum aligns with modern technical standards.", outcome: "Industry Placement Partner" }
  ]
};

const newsAndEvents = [
  {
    id: 1,
    title: "2025/2026 Admissions Screening Dates Released",
    date: "June 15, 2026",
    desc: "First batch entrance screenings and interviews will commence at the Badagry campus. Check requirements.",
    category: "Screening",
    alert: "Urgent"
  },
  {
    id: 2,
    title: "Academic Affiliation Review by Atiba University Board",
    date: "June 02, 2026",
    desc: "A delegation from Atiba University visited the CCHSMT laboratories to certify the updated digital curriculum.",
    category: "Affiliation",
    alert: "Update"
  },
  {
    id: 3,
    title: "Lagos State Healthcare Integration Placement Scheme",
    date: "May 28, 2026",
    desc: "New partnerships signed with Lagos State hospitals for student clinical postings and internship placements.",
    category: "Clinical",
    alert: "New Partnership"
  },
  {
    id: 4,
    title: "Tuition Installment Payment Option Now Live",
    date: "May 15, 2026",
    desc: "Students can now pay school fees in flexible installments using Paystack or local bank transfers via the portal.",
    category: "Finance",
    alert: "Portal Alert"
  }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<"students" | "alumni" | "parents" | "partners">("students");

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
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 bg-red-500/25 border-2 border-red-400 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.45)] px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider w-fit animate-pulse"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping shrink-0" />
                  Admissions Open: Undergrad 2026/2027 & Postgrad 2025/2026
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  className="inline-flex items-center gap-1.5 bg-brand-blue-light/10 border border-brand-blue-light/30 px-3.5 py-1.5 rounded-full text-brand-blue-light font-semibold text-[10px] sm:text-xs uppercase tracking-wider w-fit"
                >
                  <img
                    src="/atiba-university-banner.png"
                    alt="Atiba University Logo"
                    className="w-4 h-4 rounded-full object-cover object-left"
                  />
                  <span>Affiliated with Atiba University</span>
                </motion.div>
              </div>

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
                Igniting Changes Through Knowledge. Under the academic affiliation and supervision of Atiba University, Oyo, discover comprehensive professional programs to build your clinical and technical expertise.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-1"
              >
                <Link href="/admissions">
                  <button className="bg-brand-red hover:bg-brand-red/90 text-white font-display font-bold px-8 py-3.5 rounded-full shadow-lg shadow-brand-red/30 transition-all cursor-pointer flex items-center gap-2">
                    <span>Apply Now</span>
                    <ChevronRight size={16} />
                  </button>
                </Link>
                <Link href="/academics">
                  <button className="border border-white/20 hover:border-white/50 text-white hover:bg-white/5 font-display font-bold px-8 py-3.5 rounded-full transition-all cursor-pointer">
                    Explore Programs
                  </button>
                </Link>
              </motion.div>

              {/* Trust Badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-[10px] text-slate-400 font-bold uppercase tracking-wider"
              >
                <span className="flex items-center gap-1.5"><ShieldCheck className="text-brand-gold" size={14} /> NUC Aligned Pathways</span>
                <span className="hidden sm:inline opacity-30">|</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="text-brand-gold" size={14} /> Board Certified Wards</span>
                <span className="hidden sm:inline opacity-30">|</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="text-brand-gold" size={14} /> Lagos State Accredited</span>
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
                <div className="w-48 h-48 rounded-full border-4 border-dashed border-white/20 flex items-center justify-center p-4 relative">
                  <GraduationCap size={72} className="text-brand-gold animate-bounce" />
                  <div className="absolute inset-0 rounded-full border border-white/10 animate-pulse" />
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

        {/* QUICK ACCESS PANEL */}
        <section className="relative z-20 -mt-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="text-brand-red animate-pulse" size={18} />
              <h3 className="font-display text-xs font-black text-brand-blue-dark uppercase tracking-widest">
                Quick Access Portal Panel
              </h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {quickLinks.map((link, idx) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={idx}
                    href={link.href}
                    className="flex flex-col gap-3 p-4 bg-slate-50 hover:bg-brand-red-light/20 border border-slate-100 hover:border-brand-red/25 rounded-2xl text-left transition-all duration-300 group hover:-translate-y-1 shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div className="p-2 bg-white rounded-xl text-brand-blue group-hover:bg-brand-red group-hover:text-white transition-colors">
                        <Icon size={16} />
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 bg-white group-hover:bg-brand-red/10 group-hover:text-brand-red px-2 py-0.5 rounded border border-slate-100">
                        {link.badge}
                      </span>
                    </div>
                    <div>
                      <p className="font-display text-xs font-bold text-brand-blue-dark leading-tight group-hover:text-brand-red transition-colors">
                        {link.name}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 leading-snug hidden sm:block">
                        {link.desc}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* STATISTICS SECTION */}
        <section className="bg-brand-bg-light pt-20 pb-10 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCounter value="25+" label="Accredited Programs" icon={BookOpen} />
              <StatCounter value="1200+" label="Active Students" icon={Users} />
              <StatCounter value="85+" label="Experienced Lecturers" icon={GraduationCap} />
              <StatCounter value="98%" label="Graduate Placement" icon={Award} />
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
                CrestOak College of Health Sciences, Management and Technology (CCHSMT) stands as a beacon of academic excellence in Lagos. Strategically located in the historic town of Badagry, our institution is dedicated to raising qualified healthcare practitioners, managers, legal practitioners, and technologists.
              </p>
              <p className="text-slate-600 leading-relaxed font-medium">
                Our academic programmes are run under the <span className="font-display font-bold text-brand-blue-dark">academic affiliation and supervision of Atiba University, Oyo</span>, ensuring that all curricula meet rigorous national standards and degrees are widely recognized. We believe in standard hands-on clinical laboratories, digital workshops, and active mentoring.
              </p>
              
              {/* Academic Partnership Card */}
              <div className="relative overflow-hidden bg-gradient-to-r from-emerald-50/50 via-slate-50 to-slate-50/30 border border-emerald-500/10 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center gap-6 mt-2 shadow-sm hover:shadow-md transition-all duration-300">
                {/* Decorative side accent line */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l-2xl" />
                
                {/* Logo Badge Container */}
                <div className="flex shrink-0">
                  <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-center hover:scale-[1.02] transition-transform duration-200">
                    <img 
                      src="/atiba-university-banner.png" 
                      alt="Atiba University Banner" 
                      className="h-10 sm:h-12 w-auto object-contain" 
                    />
                  </div>
                </div>
                
                {/* Text Content */}
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <h4 className="font-display text-xs font-extrabold text-brand-blue-dark uppercase tracking-wider">
                      Official Academic Affiliation
                    </h4>
                  </div>
                  <p className="text-xs sm:text-[13px] text-slate-600 mt-2 leading-relaxed font-semibold">
                    Under the direct academic supervision and affiliation of <strong className="text-brand-blue-dark font-bold">Atiba University, Oyo, Nigeria</strong>.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 mt-2">
                <div className="flex gap-3.5 items-start">
                  <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-full shrink-0 mt-0.5">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-brand-blue-dark">University Affiliation</h4>
                    <p className="text-slate-500 text-sm mt-0.5">Formal affiliation ensures transfer paths, academic oversight, and standard degree awarding frameworks.</p>
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

              <div className="mt-2">
                <Link href="/about">
                  <button className="inline-flex items-center gap-2 text-brand-red hover:text-brand-red/80 font-display font-bold text-base transition-colors group cursor-pointer">
                    <span>Read Rector Message</span>
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
                  <div className="w-12 h-12 rounded-full bg-white p-0.5 shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                    <img src="/crestoak-logo.png" alt="CrestOak College Seal" className="w-full h-full object-contain rounded-full" />
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

        {/* WHY CHOOSE CRESTOAK SECTION (UPGRADED) */}
        <section className="bg-brand-bg-light py-20 border-y border-slate-150">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="text-center max-w-xl mx-auto flex flex-col gap-4 mb-16">
              <span className="text-brand-red font-bold text-xs uppercase tracking-widest">Why CrestOak?</span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-blue-dark tracking-tight">
                Our Institutional Edge
              </h2>
              <p className="text-slate-500 text-sm font-medium">
                CrestOak is built to meet regulatory standards while supporting affordable, high-employability programs suitable for Nigerian families.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {chooseReasons.map((reason, idx) => {
                const Icon = reason.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex gap-4 items-start"
                  >
                    <div className="p-3 bg-brand-red-light text-brand-red rounded-xl shrink-0">
                      <Icon size={22} />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-brand-blue-dark text-base">
                        {reason.title}
                      </h4>
                      <p className="text-slate-500 text-xs sm:text-sm mt-2 leading-relaxed font-semibold">
                        {reason.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* INTERACTIVE TESTIMONIAL SYSTEM */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="text-center max-w-xl mx-auto flex flex-col gap-4 mb-12">
              <span className="text-brand-red font-bold text-xs uppercase tracking-widest">Testimonials</span>
              <h2 className="font-display text-3xl font-extrabold text-brand-blue-dark tracking-tight">
                Institutional Credibility & Trust
              </h2>
              <p className="text-slate-500 text-sm font-medium">
                Hear what our students, graduates, guardians, and clinical partners in Nigeria say about our courses.
              </p>
            </div>

            {/* Selector tabs */}
            <div className="flex overflow-x-auto no-scrollbar whitespace-nowrap md:justify-center gap-2 mb-10 max-w-lg mx-auto bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              {(Object.keys(testimonialsData) as Array<keyof typeof testimonialsData>).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`shrink-0 md:flex-grow py-2.5 px-4 rounded-xl font-display text-xs font-bold capitalize transition-all cursor-pointer ${
                    activeTab === tab
                      ? "bg-brand-red text-white shadow-sm"
                      : "text-slate-500 hover:text-brand-blue-dark hover:bg-slate-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Testimonials list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <AnimatePresence mode="wait">
                {testimonialsData[activeTab].map((item: any, index: number) => (
                  <motion.div
                    key={`${activeTab}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="bg-brand-bg-light rounded-3xl p-6 border border-slate-100 flex flex-col justify-between shadow-sm relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-5 text-brand-blue">
                      <MessageSquare size={72} />
                    </div>
                    
                    <p className="text-slate-600 italic text-sm leading-relaxed relative z-10">
                      "{item.text}"
                    </p>
                    
                    <div className="mt-6 pt-4 border-t border-slate-200/50 flex items-center justify-between">
                      <div>
                        <p className="font-display font-extrabold text-brand-blue-dark text-sm">
                          {item.name}
                        </p>
                        <p className="text-slate-400 text-[10px] mt-0.5 font-bold">
                          {item.program || item.relation || item.company}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-brand-red bg-brand-red-light px-2.5 py-0.5 rounded-full uppercase">
                        {item.outcome}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* NEWS, EVENTS & ACADEMIC CALENDAR */}
        <section id="news" className="bg-brand-bg-light py-20 border-t border-slate-150">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="text-center max-w-xl mx-auto flex flex-col gap-4 mb-16">
              <span className="text-brand-red font-bold text-xs uppercase tracking-widest">News & Admissions News</span>
              <h2 className="font-display text-3xl font-extrabold text-brand-blue-dark tracking-tight">
                Academic Calendar & Updates
              </h2>
              <p className="text-slate-500 text-sm font-medium">
                Stay updated with key entrance screening dates, session deadlines, and local healthcare partnership disclosures.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {newsAndEvents.map((news) => (
                <div
                  key={news.id}
                  className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-black uppercase tracking-wider text-brand-red bg-brand-red-light px-2 py-0.5 rounded">
                        {news.alert}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                        <Calendar size={12} />
                        <span>{news.date}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-brand-blue-dark text-sm sm:text-base leading-snug group-hover:text-brand-red transition-colors">
                        {news.title}
                      </h3>
                      <p className="text-slate-500 text-xs mt-2.5 leading-relaxed font-semibold">
                        {news.desc}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-50 text-right">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      {news.category}
                    </span>
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
