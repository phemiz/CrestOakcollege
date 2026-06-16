"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GraduationCap, 
  BookOpen, 
  Atom, 
  Scale, 
  Briefcase, 
  Cpu, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw,
  ShieldCheck, 
  Calendar, 
  Wallet,
  Sparkles,
  Award
} from "lucide-react";

interface PathwayResult {
  courseName: string;
  code: string;
  faculty: string;
  level: string;
  duration: string;
  tuition: number;
  jambCutoff?: number;
  accreditation: string;
  outcomes: string[];
  desc: string;
}

export const PathwayFinder: React.FC = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  
  // Selection States
  const [level, setLevel] = useState<"undergraduate" | "postgraduate" | "">("");
  const [interest, setInterest] = useState<string>("");
  const [background, setBackground] = useState<string>("");

  const handleReset = () => {
    setStep(1);
    setLevel("");
    setInterest("");
    setBackground("");
  };

  const getRecommendation = (): PathwayResult | null => {
    if (level === "undergraduate") {
      if (interest === "health") {
        if (background === "science") {
          return {
            courseName: "Nursing Sciences (B.Sc.)",
            code: "nursing",
            faculty: "health",
            level: "undergraduate",
            duration: "5 Years",
            tuition: 400000,
            jambCutoff: 200,
            accreditation: "NMCN / NUC Accredited",
            outcomes: ["Clinical Nurse Specialist", "Nurse Educator", "Health Consultant"],
            desc: "A premium clinical training pathway preparing licensed nursing professionals under the academic partnership and supervision of Atiba University."
          };
        } else {
          return {
            courseName: "Public Health (B.Sc.)",
            code: "pubhealth",
            faculty: "health",
            level: "undergraduate",
            duration: "4 Years",
            tuition: 400000,
            jambCutoff: 140,
            accreditation: "NUC Aligned",
            outcomes: ["Epidemiologist", "Community Health Officer", "NGO Health Program Coordinator"],
            desc: "Focuses on community health assessments, environmental health, and preventative clinical frameworks."
          };
        }
      } else if (interest === "tech") {
        return {
          courseName: "Computer Science (B.Sc.)",
          code: "compsci",
          faculty: "natural",
          level: "undergraduate",
          duration: "4 Years",
          tuition: 300000,
          jambCutoff: 140,
          accreditation: "NUC Approved",
          outcomes: ["Software Engineer", "Database Administrator", "Systems Analyst"],
          desc: "Deep-dive into computing theory, algorithms, practical web application building, and software testing modules."
        };
      } else if (interest === "management") {
        if (background === "commercial") {
          return {
            courseName: "Accounting (B.Sc.)",
            code: "accounting",
            faculty: "arts_social_management",
            level: "undergraduate",
            duration: "4 Years",
            tuition: 250000,
            jambCutoff: 140,
            accreditation: "ICAN Pathway Aligned",
            outcomes: ["Financial Auditor", "Tax Consultant", "Corporate Accountant"],
            desc: "Covers managerial accounting, corporate finance structures, tax audits, and financial reporting guidelines."
          };
        } else {
          return {
            courseName: "Business Administration (B.Sc.)",
            code: "busadmin",
            faculty: "arts_social_management",
            level: "undergraduate",
            duration: "4 Years",
            tuition: 250000,
            jambCutoff: 140,
            accreditation: "NUC Aligned",
            outcomes: ["Operations Manager", "HR Coordinator", "Entrepreneurship Leader"],
            desc: "Empowers candidates with organizational strategies, leadership ethics, and venture launching skillsets."
          };
        }
      } else if (interest === "law") {
        return {
          courseName: "LL.B Law (Bachelor of Laws)",
          code: "law",
          faculty: "law",
          level: "undergraduate",
          duration: "5 Years",
          tuition: 400000,
          jambCutoff: 200,
          accreditation: "Council of Legal Education Aligned",
          outcomes: ["Corporate Legal Counsel", "Advocate / Litigator", "Judicial Officer"],
          desc: "Comprehensive study of legal theory, constitutional law, and practice court simulation drills inside our Moot Chambers."
        };
      } else {
        // Fallback default
        return {
          courseName: "Medical Laboratory Science (BMLs)",
          code: "medlab",
          faculty: "health",
          level: "undergraduate",
          duration: "5 Years",
          tuition: 400000,
          jambCutoff: 180,
          accreditation: "MLSCN / NUC Supervised",
          outcomes: ["Medical Lab Scientist", "Diagnostic Researcher", "Pathology Specialist"],
          desc: "Hands-on diagnostic drills inside certified clinical labs, covering hematology, pathology, and clinical chemistry."
        };
      }
    } else if (level === "postgraduate") {
      if (interest === "pgd") {
        return {
          courseName: "Postgraduate Diploma in Computer Science (PGD)",
          code: "pgd_compsci",
          faculty: "pgd",
          level: "postgraduate",
          duration: "1 Year",
          tuition: 250000,
          accreditation: "NUC Approved",
          outcomes: ["Tech System Administrator", "Systems Developer", "IT Operations Lead"],
          desc: "Bridging course for graduates looking to transition into the computing and software design industry."
        };
      } else if (interest === "msc") {
        return {
          courseName: "M.Sc. Computer Science",
          code: "msc_compsci",
          faculty: "msc",
          level: "postgraduate",
          duration: "2 Years",
          tuition: 300000,
          accreditation: "Atiba University Partnered",
          outcomes: ["Senior Software Architect", "Data Scientist", "Research Academic"],
          desc: "Advanced modules in computing science, cloud architectures, artificial intelligence, and database design."
        };
      } else if (interest === "mba") {
        return {
          courseName: "MBA Business Administration",
          code: "mba_busadmin",
          faculty: "mba",
          level: "postgraduate",
          duration: "2 Years",
          tuition: 300000,
          accreditation: "NUC Approved",
          outcomes: ["Chief Operations Officer", "Management Consultant", "Business Strategist"],
          desc: "The ultimate leadership credential focusing on executive management, international trade, and market expansions."
        };
      } else {
        return {
          courseName: "Ph.D. Public Administration",
          code: "phd_pubadmin",
          faculty: "phd",
          level: "postgraduate",
          duration: "3 Years",
          tuition: 400000,
          accreditation: "Doctoral Board Certified",
          outcomes: ["Public Policy Advisor", "Senior Administrator", "University Professor"],
          desc: "Highest academic research pathway exploring governance structures, policy metrics, and decentralization strategies."
        };
      }
    }
    return null;
  };

  const recommendation = getRecommendation();

  // Helper values for calculations
  const calculateFees = (tuition: number) => {
    const adminFees = level === "undergraduate" 
      ? (interest === "health" ? 225000 : (interest === "tech" ? 180000 : 170000))
      : 150000;
    const total = tuition + adminFees;
    // 70% tuition + 100% admin
    const initial = Math.round((tuition * 0.70) + adminFees);
    const balance = Math.round(tuition * 0.30);
    return { total, initial, balance };
  };

  const handleApply = () => {
    if (recommendation) {
      router.push(
        `/admissions?tab=apply&level=${recommendation.level}&faculty=${recommendation.faculty}&course=${recommendation.code}`
      );
    }
  };

  return (
    <section className="py-20 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Title */}
        <div className="text-center max-w-xl mx-auto flex flex-col gap-4 mb-12">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="text-brand-red animate-pulse" size={16} />
            <span className="text-brand-red font-bold text-xs uppercase tracking-widest">Interactive Advisor</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-blue-dark tracking-tight">
            Find Your Career Pathway
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            Answer a few quick questions to discover your recommended program, entry requirements, and fee breakdown in real-time.
          </p>
        </div>

        {/* Wizard Card Wrapper */}
        <div className="max-w-3xl mx-auto bg-slate-50 border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-blue-light via-brand-blue to-brand-red" />
          
          {/* Step Progress Indicators */}
          <div className="flex items-center justify-between mb-8 max-w-md mx-auto">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-display text-xs font-bold transition-all ${
                  step > s
                    ? "bg-brand-blue border-brand-blue text-white"
                    : step === s
                    ? "border-brand-red text-brand-red font-black shadow-[0_0_10px_rgba(239,68,68,0.25)]"
                    : "border-slate-200 text-slate-400 bg-white"
                }`}>
                  {s}
                </div>
                {s < 3 && (
                  <div className={`h-0.5 flex-grow mx-2 transition-colors ${
                    step > s ? "bg-brand-blue" : "bg-slate-200"
                  }`} />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-6"
              >
                <div className="text-center">
                  <h3 className="font-display font-extrabold text-brand-blue-dark text-lg sm:text-xl">What is your target study level?</h3>
                  <p className="text-slate-400 text-xs mt-1">Select the admission cycle you want to explore.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <button
                    onClick={() => {
                      setLevel("undergraduate");
                      setStep(2);
                    }}
                    className="flex flex-col items-center gap-4 p-6 bg-white hover:bg-brand-red-light/5 border-2 border-slate-100 hover:border-brand-red/35 rounded-2xl text-center transition-all duration-300 group hover:-translate-y-0.5 cursor-pointer shadow-sm"
                  >
                    <div className="p-4 bg-slate-50 text-brand-blue group-hover:bg-brand-red group-hover:text-white rounded-2xl transition-colors">
                      <GraduationCap size={28} />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-brand-blue-dark text-base">Undergraduate B.Sc. / Diploma</h4>
                      <p className="text-slate-500 text-xs mt-1 leading-relaxed">For secondary school leavers, JUPEB candidates, and direct entry applicants.</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setLevel("postgraduate");
                      setStep(2);
                    }}
                    className="flex flex-col items-center gap-4 p-6 bg-white hover:bg-brand-red-light/5 border-2 border-slate-100 hover:border-brand-red/35 rounded-2xl text-center transition-all duration-300 group hover:-translate-y-0.5 cursor-pointer shadow-sm"
                  >
                    <div className="p-4 bg-slate-50 text-brand-blue group-hover:bg-brand-red group-hover:text-white rounded-2xl transition-colors">
                      <BookOpen size={28} />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-brand-blue-dark text-base">Postgraduate PGD / M.Sc. / Ph.D.</h4>
                      <p className="text-slate-500 text-xs mt-1 leading-relaxed">For university graduates seeking professional specialization and research degrees.</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-6"
              >
                <div className="text-center">
                  <h3 className="font-display font-extrabold text-brand-blue-dark text-lg sm:text-xl">
                    {level === "undergraduate" ? "Choose your primary area of interest" : "Choose your target postgraduate path"}
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">Select the field that aligns with your career goals.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  {level === "undergraduate" ? (
                    <>
                      {[
                        { id: "health", label: "Health Sciences", desc: "Nursing, Med Lab, Pub Health", icon: Atom },
                        { id: "tech", label: "Sciences & Tech", desc: "Computer Science, Microbio", icon: Cpu },
                        { id: "management", label: "Business & Management", desc: "Accounting, Admin, Criminology", icon: Briefcase },
                        { id: "law", label: "Law & Legal Studies", desc: "LL.B Law Studies", icon: Scale }
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setInterest(item.id);
                              setStep(3);
                            }}
                            className="flex flex-col items-center justify-center p-5 bg-white border border-slate-200 hover:border-brand-red/40 rounded-2xl text-center transition-all duration-300 hover:bg-slate-50 cursor-pointer group gap-3"
                          >
                            <div className="p-2.5 bg-slate-50 text-brand-blue-light group-hover:bg-brand-red-light/10 group-hover:text-brand-red rounded-xl transition-colors">
                              <Icon size={20} />
                            </div>
                            <div>
                              <p className="font-display font-bold text-brand-blue-dark text-xs sm:text-sm">{item.label}</p>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-snug hidden sm:block">{item.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </>
                  ) : (
                    <>
                      {[
                        { id: "pgd", label: "Postgraduate Diploma (PGD)", desc: "Bridging pathways for careers", icon: GraduationCap },
                        { id: "msc", label: "Master of Science (M.Sc.)", desc: "Advanced science/nursing tracks", icon: BookOpen },
                        { id: "mba", label: "Master of Business (MBA)", desc: "Executive business courses", icon: Briefcase },
                        { id: "phd", label: "Doctor of Philosophy (Ph.D.)", desc: "High-level doctoral research", icon: Award }
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setInterest(item.id);
                              setStep(3);
                            }}
                            className="flex flex-col items-center justify-center p-5 bg-white border border-slate-200 hover:border-brand-red/40 rounded-2xl text-center transition-all duration-300 hover:bg-slate-50 cursor-pointer group gap-3"
                          >
                            <div className="p-2.5 bg-slate-50 text-brand-blue-light group-hover:bg-brand-red-light/10 group-hover:text-brand-red rounded-xl transition-colors">
                              <Icon size={20} />
                            </div>
                            <div>
                              <p className="font-display font-bold text-brand-blue-dark text-xs sm:text-sm">{item.label}</p>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-snug hidden sm:block">{item.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </>
                  )}
                </div>

                <button
                  onClick={() => setStep(1)}
                  className="mt-4 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 self-center cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  <span>Back to Study Level</span>
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-6"
              >
                <div className="text-center">
                  <h3 className="font-display font-extrabold text-brand-blue-dark text-lg sm:text-xl">
                    {level === "undergraduate" 
                      ? "Select your secondary school O'Level focus" 
                      : "Select your first degree classification"}
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">This helps us audit eligibility criteria.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                  {level === "undergraduate" ? (
                    <>
                      {[
                        { id: "science", label: "Science Division", desc: "Physics, Chem, Biology, Maths" },
                        { id: "commercial", label: "Commercial Division", desc: "Accounting, Commerce, Economics" },
                        { id: "arts", label: "Arts & Humanities", desc: "Literature, Government, History" }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setBackground(item.id);
                            setStep(4);
                          }}
                          className="flex flex-col p-4 bg-white border border-slate-200 hover:border-brand-red/40 rounded-xl text-left transition-all duration-300 hover:bg-slate-50 cursor-pointer shadow-sm gap-2"
                        >
                          <span className="font-display font-bold text-brand-blue-dark text-xs sm:text-sm">{item.label}</span>
                          <span className="text-[10px] text-slate-400 font-semibold leading-relaxed">{item.desc}</span>
                        </button>
                      ))}
                    </>
                  ) : (
                    <>
                      {[
                        { id: "first_class", label: "First Class / Distinction", desc: "GPA of 4.50 and above" },
                        { id: "second_upper", label: "Second Class (Upper Division)", desc: "GPA of 3.50 to 4.49" },
                        { id: "second_lower", label: "Second Class Lower / Third Class", desc: "GPA of 2.00 to 3.49" }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setBackground(item.id);
                            setStep(4);
                          }}
                          className="flex flex-col p-4 bg-white border border-slate-200 hover:border-brand-red/40 rounded-xl text-left transition-all duration-300 hover:bg-slate-50 cursor-pointer shadow-sm gap-2"
                        >
                          <span className="font-display font-bold text-brand-blue-dark text-xs sm:text-sm">{item.label}</span>
                          <span className="text-[10px] text-slate-400 font-semibold leading-relaxed">{item.desc}</span>
                        </button>
                      ))}
                    </>
                  )}
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="mt-4 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 self-center cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  <span>Back to Interests</span>
                </button>
              </motion.div>
            )}

            {step === 4 && recommendation && (
              <motion.div
                key="result"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, type: "spring" }}
                className="flex flex-col gap-6"
              >
                {/* Congratulatory badge */}
                <div className="flex flex-col items-center text-center gap-2 mb-2">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 shadow-sm animate-bounce-slow">
                    <ShieldCheck size={32} />
                  </div>
                  <h3 className="font-display font-black text-brand-blue-dark text-xl sm:text-2xl">Your Recommended Pathway</h3>
                  <p className="text-slate-400 text-xs">Based on your academic profile, you qualify for enrollment in:</p>
                </div>

                {/* Recommendation Box */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                    <div>
                      <span className="text-[8px] font-black uppercase tracking-wider text-brand-red bg-brand-red-light px-2.5 py-0.5 rounded-md border border-brand-red/10">
                        {recommendation.accreditation}
                      </span>
                      <h4 className="font-display font-black text-brand-blue-dark text-base sm:text-lg mt-2">{recommendation.courseName}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{recommendation.duration} study cycle • {recommendation.level}</p>
                    </div>
                    
                    {recommendation.jambCutoff && (
                      <div className="bg-brand-blue/5 border border-brand-blue/10 px-4 py-2 rounded-xl text-right self-start sm:self-center shrink-0">
                        <span className="text-[8px] text-slate-400 font-bold block uppercase tracking-wider">JAMB Threshold</span>
                        <span className="text-lg font-black text-brand-blue-dark font-display">{recommendation.jambCutoff}+</span>
                      </div>
                    )}
                  </div>

                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                    {recommendation.desc}
                  </p>

                  {/* Financial projections */}
                  <div>
                    <h5 className="font-display font-bold text-brand-blue-dark text-xs uppercase tracking-wider flex items-center gap-1.5 mb-3">
                      <Wallet size={14} className="text-brand-red" />
                      <span>Estimated Naira (₦) Fee Schedule</span>
                    </h5>
                    
                    {(() => {
                      const fees = calculateFees(recommendation.tuition);
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 border border-slate-150 p-4 rounded-xl font-semibold text-xs text-slate-600">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-slate-400">Resumption Deposit</span>
                            <span className="text-sm font-extrabold text-brand-blue-dark">₦{fees.initial.toLocaleString()}</span>
                            <span className="text-[8px] text-slate-400 font-medium leading-none mt-0.5">(70% tuition + 100% dues)</span>
                          </div>
                          
                          <div className="flex flex-col gap-0.5 border-t sm:border-t-0 sm:border-x border-slate-200/80 pt-2 sm:pt-0 sm:px-4">
                            <span className="text-slate-400">Exam Balance</span>
                            <span className="text-sm font-extrabold text-brand-blue-dark">₦{fees.balance.toLocaleString()}</span>
                            <span className="text-[8px] text-slate-400 font-medium leading-none mt-0.5">(30% tuition balance)</span>
                          </div>

                          <div className="flex flex-col gap-0.5 border-t sm:border-t-0 pt-2 sm:pt-0">
                            <span className="text-slate-400">Session Est. Total</span>
                            <span className="text-sm font-black text-brand-red">₦{fees.total.toLocaleString()}</span>
                            <span className="text-[8px] text-slate-400 font-medium leading-none mt-0.5">(Tuition + admin charges)</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Outcomes */}
                  <div>
                    <h5 className="font-display font-bold text-brand-blue-dark text-xs uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                      <Award size={14} className="text-brand-blue-light animate-pulse" />
                      <span>Direct Employability Careers</span>
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {recommendation.outcomes.map((role, rIdx) => (
                        <span key={rIdx} className="bg-slate-100 text-slate-700 font-semibold text-[10px] px-2.5 py-1 rounded-full border border-slate-200/60 uppercase">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Final CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-2">
                  <button
                    onClick={handleApply}
                    className="flex-grow bg-brand-red hover:bg-brand-red/90 text-white font-display font-bold py-3.5 rounded-xl transition-all shadow-md shadow-brand-red/15 flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    <span>Proceed to Online Application</span>
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={handleReset}
                    className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 font-semibold px-6 py-3.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs uppercase tracking-wider shrink-0"
                  >
                    <RotateCcw size={14} />
                    <span>Reset Quiz</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
