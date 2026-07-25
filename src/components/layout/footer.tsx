import React from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Globe, ArrowUpRight } from "lucide-react";
import { Logo } from "../ui/logo";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-blue-dark text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        {/* About & Slogan */}
        <div className="flex flex-col gap-6">
          <Link href="/">
            <Logo size={68} showText={true} lightText={true} />
          </Link>
          <p className="text-sm text-slate-400 leading-relaxed font-medium">
            Empowering next-generation professionals in Health Sciences, Management, Law, and Applied Technologies in academic partnership with <strong>Atiba University, Oyo</strong>.
          </p>
          <div className="border-l-2 border-brand-red pl-4 italic text-xs text-white/90">
            &quot;Under the academic supervision of Atiba University&quot;
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-display text-white text-[16px] font-bold tracking-wide mb-6 uppercase border-b border-brand-red pb-2 w-fit">
            Quick Links
          </h3>
          <ul className="flex flex-col gap-3">
            {[
              { label: "Home Base", href: "/" },
              { label: "About CCHSMT", href: "/about" },
              { label: "Academic Programs", href: "/academics" },
              { label: "Admissions Office", href: "/admissions" },
              { label: "Bursary & Fees Guide", href: "/bursary" },
              { label: "Student Portal", href: "/portal" },
              { label: "Admin CMS Panel", href: "/admin" },
              { label: "News & Publications", href: "/news" },
              { label: "Campus Gallery", href: "/gallery" },
              { label: "Contact College", href: "/contact" },
            ].map((lnk) => (
              <li key={lnk.label}>
                <Link
                  href={lnk.href}
                  className="text-xs font-semibold hover:text-white transition-colors flex items-center gap-1 group w-fit"
                >
                  <span>{lnk.label}</span>
                  <ArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Coordinates */}
        <div>
          <h3 className="font-display text-white text-[16px] font-bold tracking-wide mb-6 uppercase border-b border-brand-red pb-2 w-fit">
            Get In Touch
          </h3>
          <ul className="flex flex-col gap-4 text-xs font-semibold">
            <li className="flex gap-3 items-start">
              <MapPin size={16} className="text-brand-red shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                6/8 Isaac Street, Ibereko, Badagry, Lagos State, Nigeria.
              </span>
            </li>
            <li className="flex gap-3 items-center">
              <Phone size={16} className="text-brand-red shrink-0" />
              <div className="flex flex-col">
                <a href="tel:+2348155884804" className="hover:text-white transition-colors">+234 (0) 815 588 4804</a>
                <a href="tel:+2348038617259" className="hover:text-white transition-colors">+234 (0) 803 861 7259</a>
              </div>
            </li>
            <li className="flex gap-3 items-center">
              <Mail size={16} className="text-brand-red shrink-0" />
              <a href="mailto:info@crestoakcollege.com.ng" className="hover:text-white transition-colors break-all">
                info@crestoakcollege.com.ng
              </a>
            </li>
          </ul>
        </div>

        {/* Academic Affiliation details */}
        <div>
          <h3 className="font-display text-white text-[16px] font-bold tracking-wide mb-6 uppercase border-b border-brand-red pb-2 w-fit">
            Affiliations
          </h3>
          <div className="flex flex-col gap-4 text-xs">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
              <span className="font-display text-brand-gold font-extrabold uppercase text-[10px] tracking-wider">
                Partner University
              </span>
              <p className="font-bold text-white leading-tight">Atiba University, Oyo</p>
              <p className="text-slate-400 leading-relaxed font-medium mt-1">
                KM 5, Oyo-Iseyin Road, Oyo State. Curricula aligned under university-level academic audits.
              </p>
            </div>
            <a
              href="https://www.atibauniversity.edu.ng"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-bold text-brand-blue-light hover:text-white transition-colors flex items-center gap-1.5 w-fit"
            >
              <Globe size={12} />
              <span>Visit Atiba University Website</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom copy row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 border-t border-slate-800/60 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 font-bold text-[10px] sm:text-xs uppercase tracking-wider">
        <p className="text-center md:text-left">
          &copy; {new Date().getFullYear()} CrestOak College (CCHSMT). All rights reserved.
        </p>
        <p className="flex items-center gap-1.5 text-center md:text-right">
          <span>Supervised by Atiba University Registry</span>
        </p>
      </div>
    </footer>
  );
};
