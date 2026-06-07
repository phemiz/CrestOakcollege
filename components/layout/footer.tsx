"use client";

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
            "Under the academic supervision of Atiba University"
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
              { label: "Student Portal", href: "/portal" },
              { label: "Admin CMS Panel", href: "/admin" },
              { label: "Campus Gallery", href: "/gallery" },
              { label: "Contact College", href: "/contact" },
            ].map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="flex items-center gap-1.5 hover:text-white transition-colors duration-200 text-sm font-medium group"
                >
                  <ArrowUpRight size={14} className="text-brand-red opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Academics Faculties */}
        <div>
          <h3 className="font-display text-white text-[16px] font-bold tracking-wide mb-6 uppercase border-b border-brand-red pb-2 w-fit">
            Faculties
          </h3>
          <ul className="flex flex-col gap-3.5 text-sm font-medium">
            <li>
              <Link href="/academics?faculty=health" className="hover:text-white transition-colors">
                Applied Health Sciences
              </Link>
            </li>
            <li>
              <Link href="/academics?faculty=social" className="hover:text-white transition-colors">
                Social & Management Sciences
              </Link>
            </li>
            <li>
              <Link href="/academics?faculty=natural" className="hover:text-white transition-colors">
                Natural & Applied Sciences
              </Link>
            </li>
            <li>
              <Link href="/academics?faculty=law" className="hover:text-white transition-colors">
                Faculty of Law
              </Link>
            </li>
            <li>
              <Link href="/academics?faculty=arts" className="hover:text-white transition-colors">
                Faculty of Arts
              </Link>
            </li>
            <li>
              <Link href="/academics?faculty=agriculture" className="hover:text-white transition-colors">
                Agricultural Sciences
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Coordinates */}
        <div>
          <h3 className="font-display text-white text-[16px] font-bold tracking-wide mb-6 uppercase border-b border-brand-red pb-2 w-fit">
            Contact Us
          </h3>
          <ul className="flex flex-col gap-4 text-sm font-medium">
            <li className="flex gap-3 items-start">
              <MapPin size={20} className="text-brand-red shrink-0" />
              <span>6/8 Isaac Street, Ibereko, Badagry, Lagos State, Nigeria</span>
            </li>
            <li className="flex gap-3 items-center">
              <Phone size={18} className="text-brand-red shrink-0" />
              <div className="flex flex-col gap-1">
                <a href="tel:+2348155884804" className="hover:text-white transition-colors">
                  +234 (0) 815 588 4804
                </a>
                <a href="tel:+2348038617259" className="hover:text-white transition-colors">
                  +234 (0) 803 861 7259
                </a>
              </div>
            </li>
            <li className="flex gap-3 items-center">
              <Mail size={18} className="text-brand-red shrink-0" />
              <a href="mailto:info.crestoakcollege@gmail.com" className="hover:text-white transition-colors">
                info.crestoakcollege@gmail.com
              </a>
            </li>
            <li className="flex gap-3 items-center">
              <Globe size={18} className="text-brand-red shrink-0" />
              <a
                href="https://www.crestoak.com.ng"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
              >
                www.crestoak.com.ng
              </a>
            </li>
          </ul>
        </div>
      </div>

      <hr className="border-slate-800 my-8 max-w-7xl mx-auto opacity-50" />

      {/* Footer Bottom */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-semibold text-slate-500">
        <div className="text-center md:text-left">
          <div>© {new Date().getFullYear()} CrestOak College. All rights reserved.</div>
          <div className="mt-2 text-[10px] text-slate-600 flex flex-wrap justify-center md:justify-start items-center gap-2">
            <span>Secure Nigeria Fintech Integrated:</span>
            <span className="border border-slate-800 px-1.5 py-0.5 rounded uppercase">Paystack</span>
            <span className="border border-slate-800 px-1.5 py-0.5 rounded uppercase">Flutterwave</span>
            <span className="border border-slate-800 px-1.5 py-0.5 rounded uppercase">Verve / USSD</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex items-center gap-6">
            <Link href="/admissions" className="hover:text-white transition-colors">
              Admissions Policy
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Map & Directions
            </Link>
          </div>
          
          {/* Social media links */}
          <div className="flex items-center gap-3">
            <a href="#" aria-label="Facebook link" className="p-2 bg-slate-800 hover:bg-brand-red rounded-full text-slate-400 hover:text-white transition-colors">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
              </svg>
            </a>
            <a href="#" aria-label="Twitter link" className="p-2 bg-slate-800 hover:bg-brand-red rounded-full text-slate-400 hover:text-white transition-colors">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
            <a href="#" aria-label="Instagram link" className="p-2 bg-slate-800 hover:bg-brand-red rounded-full text-slate-400 hover:text-white transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
