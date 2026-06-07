"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Phone, Mail, GraduationCap, MapPin, Search, ArrowRight, BookOpen } from "lucide-react";
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
  { name: "Gallery & Tour", href: "/gallery" },
  { name: "Contact", href: "/contact" },
];

const searchDatabase = [
  // Programs
  { title: "Nursing Science", category: "Program", href: "/academics?faculty=health", details: "Faculty of Applied Health Sciences program." },
  { title: "Medical Laboratory Science", category: "Program", href: "/academics?faculty=health", details: "Medical Lab Science diagnostics." },
  { title: "Public Health", category: "Program", href: "/academics?faculty=health", details: "Public health, hygiene, and community health." },
  { title: "Physiology", category: "Program", href: "/academics?faculty=health", details: "Human body functions and sciences." },
  { title: "Computer Science", category: "Program", href: "/academics?faculty=natural", details: "Physical & Computer Sciences Department." },
  { title: "Microbiology", category: "Program", href: "/academics?faculty=natural", details: "Microscopic organisms and laboratory research." },
  { title: "Biochemistry", category: "Program", href: "/academics?faculty=natural", details: "Chemical processes within living organisms." },
  { title: "Mathematics", category: "Program", href: "/academics?faculty=natural", details: "Mathematics studies." },
  { title: "Physics with Electronics", category: "Program", href: "/academics?faculty=natural", details: "Physics modules with electronics focus." },
  { title: "Law (LL.B)", category: "Program", href: "/academics?faculty=law", details: "Five years standard comprehensive law degree." },
  { title: "Business Administration", category: "Program", href: "/academics?faculty=social", details: "Faculty of Social & Management Sciences." },
  { title: "Criminology & Security Studies", category: "Program", href: "/academics?faculty=social", details: "Security, police systems, criminology studies." },
  { title: "Banking and Finance", category: "Program", href: "/academics?faculty=social", details: "Commercial banking, public finance, economics." },
  { title: "Hospitality & Tourism Management", category: "Program", href: "/academics?faculty=social", details: "Hotel, tourism and service industry management." },
  { title: "International Relations", category: "Program", href: "/academics?faculty=social", details: "Global politics, foreign policies, diplomacy." },
  { title: "Agricultural Extension & Rural Development", category: "Program", href: "/academics?faculty=agriculture", details: "Faculty of Agricultural Sciences." },
  { title: "Theatre Arts", category: "Program", href: "/academics?faculty=arts", details: "Performance, stage writing, creative arts." },
  { title: "English Language", category: "Program", href: "/academics?faculty=arts", details: "English literature, grammar, communication." },
  
  // Admissions
  { title: "How to Apply", category: "Admissions", href: "/admissions", details: "Step-by-step registration guidelines." },
  { title: "JAMB Cut-Off Mark (140+)", category: "Admissions", href: "/admissions", details: "Minimum JAMB eligibility score is 140." },
  { title: "Tuition and School Fees", category: "Admissions", href: "/academics", details: "Find school fees, acceptance fees, application fees." },
  { title: "Screening Dates & Entry Exams", category: "Admissions", href: "/admissions", details: "Admission screening schedules." },
  { title: "Atiba University Affiliation Details", category: "Admissions", href: "/about", details: "Official degrees supervised by Atiba University, Oyo." },

  // Portal & Info
  { title: "Student Portal Login", category: "Portal", href: "/portal", details: "Course registration, results, fee payment portal." },
  { title: "Fee Payment (Paystack / Flutterwave)", category: "Portal", href: "/portal?tab=billing", details: "Pay tuition, acceptance fees, and download receipts." },
  { title: "Result Checker Dashboard", category: "Portal", href: "/portal?tab=results", details: "Check semester results and GPA online." },
  { title: "Academic Calendar", category: "Info", href: "/about", details: "Important dates, semesters, exams." },
  { title: "IT Support Ticketing System", category: "Portal", href: "/portal?tab=services", details: "Submit academic requests and IT help tickets." },
  { title: "Rector Message & Provost Profile", category: "About", href: "/about", details: "Dr. Ajisefinni E.O. Rector PhD profile." }
];

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof searchDatabase>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
    setSearchOpen(false);
  }, [pathname]);

  // Handle search focus
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Run Search Filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const filtered = searchDatabase.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.details.toLowerCase().includes(q)
    );
    setSearchResults(filtered.slice(0, 6));
  }, [searchQuery]);

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
          <div className="flex items-center gap-3 font-semibold">
            <Link href="/portal" className="text-white hover:text-brand-gold hover:underline transition-all flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Student Portal
            </Link>
            <span className="opacity-30">|</span>
            <Link href="/admin" className="text-slate-300 hover:text-brand-gold hover:underline transition-all">
              Admin CMS
            </Link>
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
            ? "fixed top-0 bg-white/95 backdrop-blur-md shadow-lg py-3 border-b border-slate-100"
            : "relative bg-white border-b border-slate-100"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Logo variant="atiba" size={scrolled ? 48 : 60} showText={true} />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6">
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

          <div className="flex items-center gap-4 border-l border-slate-200 pl-6">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="text-brand-blue-dark hover:text-brand-red p-2 transition-colors cursor-pointer rounded-full hover:bg-slate-50"
              aria-label="Search website"
            >
              <Search size={19} />
            </button>

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
        </div>

        {/* Mobile Navbar Elements */}
        <div className="lg:hidden flex items-center gap-2">
          {/* Mobile Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="text-brand-blue-dark p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Search website"
          >
            <Search size={22} />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-brand-blue-dark p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
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
                  
                  {/* Additional Mobile Navigation links */}
                  <li className="pt-2">
                    <Link
                      href="/portal"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 py-2 font-display text-base font-extrabold border-b border-slate-50 text-emerald-600"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Student Portal
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 font-display text-base font-semibold border-b border-slate-50 text-slate-600 hover:text-brand-red"
                    >
                      Admin CMS Panel
                    </Link>
                  </li>
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

      {/* Global Search Modal Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex justify-center items-start pt-16 sm:pt-24 px-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col"
            >
              {/* Search Header Input bar */}
              <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50">
                <Search className="text-slate-400 shrink-0" size={22} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search programs, admissions, fees, calendars..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-grow bg-transparent text-slate-800 placeholder-slate-400 font-semibold focus:outline-none text-base sm:text-lg"
                />
                <button
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search results body */}
              <div className="max-h-[60vh] overflow-y-auto p-4 flex flex-col gap-2">
                {!searchQuery.trim() ? (
                  <div className="py-10 text-center flex flex-col items-center gap-3">
                    <div className="p-3 bg-brand-blue-light/5 text-brand-blue rounded-full">
                      <BookOpen size={28} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-600">Quick Academic Search</p>
                      <p className="text-xs text-slate-400 max-w-[280px] mt-1 mx-auto leading-relaxed">
                        Type any course (e.g., Nursing, Computer Science) or keywords like "fees" and "JAMB".
                      </p>
                    </div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1">
                      Search Results ({searchResults.length})
                    </p>
                    {searchResults.map((result, index) => (
                      <Link
                        key={index}
                        href={result.href}
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery("");
                        }}
                        className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 hover:bg-brand-red-light/10 border border-transparent hover:border-brand-red/10 rounded-2xl transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-slate-100 group-hover:bg-brand-red/10 text-slate-600 group-hover:text-brand-red rounded-xl shrink-0 mt-0.5 transition-colors">
                            <BookOpen size={16} />
                          </div>
                          <div>
                            <p className="font-display text-sm font-bold text-brand-blue-dark group-hover:text-brand-red transition-colors">
                              {result.title}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5 leading-snug">{result.details}</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase bg-slate-100 group-hover:bg-brand-red/20 group-hover:text-brand-red px-2 py-1 rounded-md shrink-0 w-fit">
                          {result.category}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 font-semibold text-sm">
                    No results found for "<span className="text-slate-600">{searchQuery}</span>".
                  </div>
                )}
              </div>

              {/* Search Footer links */}
              <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
                <span>CrestOak Information Hub</span>
                <Link
                  href="/academics"
                  onClick={() => setSearchOpen(false)}
                  className="text-brand-red hover:underline flex items-center gap-1 group"
                >
                  <span>Explore Programs</span>
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
