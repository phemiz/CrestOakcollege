"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Phone, Mail, GraduationCap, MapPin } from "lucide-react";
import { Logo } from "../ui/logo";

const navigationItems = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  {
    name: "Academics",
    href: "/academics",
    dropdown: [
      { name: "Faculty of Applied Health Sciences", href: "/academics?faculty=health" },
      { name: "Faculty of Social & Management Sciences", href: "/academics?faculty=social" },
      { name: "Faculty of Natural & Applied Sciences", href: "/academics?faculty=natural" },
      { name: "Faculty of Law", href: "/academics?faculty=law" },
      { name: "Faculty of Arts", href: "/academics?faculty=arts" },
      { name: "Faculty of Agricultural Sciences", href: "/academics?faculty=agriculture" },
    ],
  },
  { name: "Admissions", href: "/admissions" },
  { name: "Contact", href: "/contact" },
];

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when page changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="w-full z-50">
      {/* Top Banner (Contact info & session announcement) */}
      <div className="bg-brand-blue-dark text-white text-xs py-2 px-4 sm:px-6 md:px-8 flex flex-col md:flex-row justify-between items-center gap-2 border-b border-white/10">
        <div className="flex flex-wrap items-center justify-center gap-4 text-center md:text-left">
          <a href="tel:+2348155884804" className="flex items-center gap-1.5 hover:text-brand-gold transition-colors">
            <Phone size={13} className="text-brand-gold" />
            <span>+234 815 588 4804</span>
          </a>
          <span className="hidden sm:inline opacity-30">|</span>
          <a href="mailto:info.crestoakcollege@gmail.com" className="flex items-center gap-1.5 hover:text-brand-gold transition-colors">
            <Mail size={13} className="text-brand-gold" />
            <span>info.crestoakcollege@gmail.com</span>
          </a>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-brand-gold font-medium animate-pulse">
            <GraduationCap size={14} />
            <span>Admission in Progress 2025/2026 Session</span>
          </div>
          <span className="hidden md:inline opacity-30">|</span>
          <div className="hidden md:flex items-center gap-1.5 opacity-80">
            <MapPin size={13} />
            <span>Badagry, Lagos</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav
        className={`w-full py-4 px-4 sm:px-6 md:px-8 flex justify-between items-center transition-all duration-300 ${
          scrolled
            ? "fixed top-0 bg-white shadow-lg py-3 backdrop-blur-md border-b border-slate-100"
            : "relative bg-white border-b border-slate-100"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Logo variant="atiba" size={scrolled ? 48 : 60} showText={true} />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          <ul className="flex items-center gap-6">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              
              if (item.dropdown) {
                return (
                  <li
                    key={item.name}
                    className="relative"
                    onMouseEnter={() => setActiveDropdown(item.name)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button
                      className={`flex items-center gap-1 py-2 font-display text-[15px] font-semibold transition-colors duration-200 cursor-pointer ${
                        isActive ? "text-brand-red" : "text-brand-blue-dark hover:text-brand-red"
                      }`}
                    >
                      {item.name}
                      <ChevronDown size={15} className={`transition-transform duration-200 ${activeDropdown === item.name ? "rotate-180" : ""}`} />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {activeDropdown === item.name && (
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 15 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 mt-1 w-72 bg-white rounded-xl shadow-2xl border border-slate-100 py-3 z-50 overflow-hidden"
                        >
                          {item.dropdown.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className="block px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-red transition-all duration-200"
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              }

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`py-2 font-display text-[15px] font-semibold transition-colors duration-200 ${
                      isActive ? "text-brand-red" : "text-brand-blue-dark hover:text-brand-red"
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>

          <Link href="/admissions">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="bg-brand-red hover:bg-brand-red/90 text-white font-display text-sm font-bold px-6 py-2.5 rounded-full shadow-lg shadow-brand-red/20 transition-all cursor-pointer"
            >
              Apply Now
            </motion.button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden text-brand-blue-dark p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {/* Spacing spacer for fixed header */}
      {scrolled && <div className="h-[97px] lg:h-[105px]" />}

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />

            {/* Side Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-4/5 max-w-sm bg-white z-50 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto lg:hidden"
            >
              <div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                  <Logo variant="atiba" size={45} showText={true} />
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X size={22} />
                  </button>
                </div>

                <ul className="flex flex-col gap-4">
                  {navigationItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                    
                    if (item.dropdown) {
                      return (
                        <li key={item.name} className="flex flex-col">
                          <button
                            onClick={() => setActiveDropdown(activeDropdown === item.name ? null : item.name)}
                            className={`flex justify-between items-center py-2 font-display text-base font-semibold border-b border-slate-50 cursor-pointer ${
                              isActive ? "text-brand-red" : "text-brand-blue-dark"
                            }`}
                          >
                            {item.name}
                            <ChevronDown
                              size={18}
                              className={`transition-transform duration-200 ${
                                activeDropdown === item.name ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          <AnimatePresence>
                            {activeDropdown === item.name && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="pl-4 mt-2 border-l-2 border-brand-red-light overflow-hidden flex flex-col gap-2.5"
                              >
                                {item.dropdown.map((subItem) => (
                                  <Link
                                    key={subItem.name}
                                    href={subItem.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block text-sm font-medium text-slate-600 hover:text-brand-red py-1"
                                  >
                                    {subItem.name}
                                  </Link>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </li>
                      );
                    }

                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`block py-2 font-display text-base font-semibold border-b border-slate-50 ${
                            isActive ? "text-brand-red" : "text-brand-blue-dark hover:text-brand-red"
                          }`}
                        >
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <Link href="/admissions" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full bg-brand-red text-white py-3 rounded-full font-display font-bold text-center shadow-lg shadow-brand-red/10 cursor-pointer">
                    Apply Now
                  </button>
                </Link>
                <div className="flex flex-col gap-2 mt-6 text-xs text-slate-500 text-center">
                  <p>Igniting Changes Through Knowledge</p>
                  <p className="font-semibold text-brand-blue-dark">info.crestoakcollege@gmail.com</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
