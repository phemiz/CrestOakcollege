import React from "react";
import Image from "next/image";
import { GraduationCap, Award, ShieldCheck, CheckCircle2 } from "lucide-react";

export const PartnershipSection = () => {
  return (
    <section className="bg-gradient-to-r from-slate-900 via-brand-blue-dark to-slate-950 py-16 text-white relative overflow-hidden">
      {/* Decorative Blur elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-blue-light/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Logo & Headline */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <span className="text-brand-gold font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-ping" />
              Academic Collaboration
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight">
              Accredited & Supervised Academic <br />
              <span className="text-brand-gold">Higher Education Standards</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              All degree programmes and scientific syllabi are directly monitored and validated under national accreditation guidelines, ensuring seamless graduation, official transcript clearances, and recognized professional qualifications.
            </p>
            
            {/* Logo Badge Card */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-5 flex items-center gap-5 w-fit">
              <div className="bg-white p-2 rounded-xl shrink-0">
                <Image 
                  src="/crestoak-seal.png" 
                  alt="CrestOak College Seal" 
                  width={48}
                  height={48}
                  loading="lazy"
                  className="h-12 w-auto object-contain"
                />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quality Standards</p>
                <p className="text-sm font-extrabold text-white">Accredited Tertiary Institution</p>
                <p className="text-[10px] text-brand-gold font-semibold mt-0.5">Verified Academic Partner</p>
              </div>
            </div>
          </div>

          {/* Details & Benefits */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-white/[0.08] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-brand-gold/10 text-brand-gold flex items-center justify-center mb-4">
                <GraduationCap size={20} />
              </div>
              <h4 className="font-display font-bold text-white text-base">Direct B.Sc. Pathways</h4>
              <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                Study curriculum structures aligned directly with national university requirements, providing smooth degree transitions.
              </p>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-white/[0.08] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <ShieldCheck size={20} />
              </div>
              <h4 className="font-display font-bold text-white text-base">NUC Accredited Audits</h4>
              <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                Rigorous oversight verifies clinical training, lab equipment, and exam standards match national university benchmarks.
              </p>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-white/[0.08] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-brand-blue-light/10 text-brand-blue-light flex items-center justify-center mb-4">
                <Award size={20} />
              </div>
              <h4 className="font-display font-bold text-white text-base">Accredited Certifications</h4>
              <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                Graduates are cleared for national professional boards and licensing exams including NMCN, MLSCN, and Community Boards.
              </p>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-white/[0.08] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                <CheckCircle2 size={20} />
              </div>
              <h4 className="font-display font-bold text-white text-base">Transcript Guarantee</h4>
              <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                Secure valid transcripts and registry file statements recognized globally for academic continuation.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
