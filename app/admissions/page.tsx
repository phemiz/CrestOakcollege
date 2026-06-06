"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { 
  ClipboardList, 
  FileCheck, 
  Wallet, 
  UserCheck, 
  AlertCircle, 
  GraduationCap, 
  ArrowRight,
  ShieldCheck
} from "lucide-react";

export default function Admissions() {
  // Form States
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "male",
    faculty: "health",
    jambScore: "",
    olevelCredits: "5",
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [regNumber, setRegNumber] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: "",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    // Validate fields
    if (!formData.fullName.trim()) errors.fullName = "Full Name is required";
    if (!formData.email.trim()) {
      errors.email = "Email Address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }
    if (!formData.phone.trim()) errors.phone = "Phone Number is required";
    
    const score = parseInt(formData.jambScore, 10);
    if (!formData.jambScore.trim()) {
      errors.jambScore = "JAMB Score is required";
    } else if (isNaN(score) || score < 140 || score > 400) {
      errors.jambScore = "JAMB Score must be between 140 and 400 for eligibility";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Success Mock Trigger
    const randomReg = "CCHSMT/2026/" + Math.floor(1000 + Math.random() * 9000);
    setRegNumber(randomReg);
    setIsSubmitted(true);
  };

  return (
    <>
      <Header />

      <main className="flex-grow bg-slate-50">
        {/* HERO HEADER */}
        <section className="bg-brand-blue-dark text-white py-20 relative overflow-hidden">
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-blue/40 via-slate-900 to-slate-950" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10 text-center flex flex-col gap-4">
            <span className="text-brand-gold font-bold text-xs uppercase tracking-widest">Enrollment 2025/2026</span>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight">
              Admissions Portal
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto font-medium">
              Start your journey today. Apply online in simple steps and secure your placement.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Guide & Requirements (Left Side) */}
            <div className="lg:col-span-6 flex flex-col gap-8">
              {/* Guide & Requirements (Left Side) */}
              <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-sm flex gap-4 items-start">
                <div className="p-3 bg-brand-red-light text-brand-red rounded-xl shrink-0">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-brand-blue-dark text-base">Admission Guidelines</h3>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1.5 leading-relaxed font-semibold">
                    All academic programmes are offered under the academic affiliation and supervision of <strong>Atiba University, Oyo</strong>. The general JAMB cut-off mark for the 2025/2026 academic calendar is <span className="text-brand-red font-black">140</span>. Candidates must possess credit level passes in at least 5 subjects at O'level (WAEC, NECO, or NABTEB) including English Language and Mathematics.
                  </p>
                </div>
              </div>

              {/* Atiba University Partnership Officers Card */}
              <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-5 items-start sm:items-center relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                <div className="bg-white px-3.5 py-2 rounded-xl border border-slate-100 shadow-sm flex items-center justify-center shrink-0">
                  <img
                    src="/atiba-university-banner.png"
                    alt="Atiba University Logo"
                    className="h-10 w-auto object-contain"
                  />
                </div>
                <div className="text-xs flex-grow">
                  <h4 className="font-display font-bold text-brand-blue-dark text-sm">Atiba University Partnership Officers</h4>
                  <p className="text-slate-500 mt-1 leading-relaxed font-semibold">
                    For affiliation inquiries and partnership confirmations:
                  </p>
                  <p className="text-brand-blue-dark font-extrabold text-sm mt-1">
                    📞 08169382815, 09058448903, 09055794403
                  </p>
                  <p className="text-slate-400 mt-1.5 font-semibold">
                    Email: <a href="mailto:admissionsofficer@atibauniversity.edu.ng" className="text-brand-red hover:underline">admissionsofficer@atibauniversity.edu.ng</a>
                  </p>
                </div>
              </div>

              {/* Step by Step Guide */}
              <div className="flex flex-col gap-6">
                <h3 className="font-display font-extrabold text-brand-blue-dark text-xl uppercase tracking-wider border-b border-slate-200 pb-2">
                  Application Steps
                </h3>
                
                <div className="flex flex-col gap-6">
                  {/* Step 1 */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-blue text-white flex items-center justify-center font-display font-bold shrink-0 shadow-md">
                      1
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-brand-blue-dark text-sm sm:text-base flex items-center gap-2">
                        <ClipboardList size={18} className="text-slate-400" />
                        Check Eligibility
                      </h4>
                      <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed font-semibold">
                        Confirm you meet the O'level subject combinations and the minimum JAMB cut-off score of 140.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-blue text-white flex items-center justify-center font-display font-bold shrink-0 shadow-md">
                      2
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-brand-blue-dark text-sm sm:text-base flex items-center gap-2">
                        <FileCheck size={18} className="text-slate-400" />
                        Fill Online Application Form
                      </h4>
                      <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed font-semibold">
                        Complete the online registration form on the right. Ensure all contact details and scores are accurate.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-blue text-white flex items-center justify-center font-display font-bold shrink-0 shadow-md">
                      3
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-brand-blue-dark text-sm sm:text-base flex items-center gap-2">
                        <Wallet size={18} className="text-slate-400" />
                        Payment of Processing Fee
                      </h4>
                      <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed font-semibold">
                        Upon review, pay the screening application fee at the college accounts office or online to obtain screening codes.
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-blue text-white flex items-center justify-center font-display font-bold shrink-0 shadow-md">
                      4
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-brand-blue-dark text-sm sm:text-base flex items-center gap-2">
                        <UserCheck size={18} className="text-slate-400" />
                        Campus Screening & Screening Slips
                      </h4>
                      <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed font-semibold">
                        Present your credential originals at the campus admin desk for verification and physical screening interview.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Application Form Card (Right Side) */}
            <div className="lg:col-span-6">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-red" />

                {!isSubmitted ? (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="border-b border-slate-100 pb-4">
                      <h3 className="font-display font-extrabold text-brand-blue-dark text-lg sm:text-xl">
                        Apply Now
                      </h3>
                      <p className="text-slate-400 text-xs mt-1">Please fill in candidate details accurately.</p>
                    </div>

                    {/* Full Name */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Surname First, Middle and Last Name"
                        className={`w-full p-3.5 bg-slate-50 rounded-xl border text-sm font-semibold focus:outline-none transition-colors ${
                          formErrors.fullName ? "border-brand-red focus:border-brand-red" : "border-slate-200 focus:border-brand-blue"
                        }`}
                      />
                      {formErrors.fullName && <span className="text-brand-red text-xs font-bold">{formErrors.fullName}</span>}
                    </div>

                    {/* Contact Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="example@mail.com"
                          className={`w-full p-3.5 bg-slate-50 rounded-xl border text-sm font-semibold focus:outline-none transition-colors ${
                            formErrors.email ? "border-brand-red focus:border-brand-red" : "border-slate-200 focus:border-brand-blue"
                          }`}
                        />
                        {formErrors.email && <span className="text-brand-red text-xs font-bold">{formErrors.email}</span>}
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+234..."
                          className={`w-full p-3.5 bg-slate-50 rounded-xl border text-sm font-semibold focus:outline-none transition-colors ${
                            formErrors.phone ? "border-brand-red focus:border-brand-red" : "border-slate-200 focus:border-brand-blue"
                          }`}
                        />
                        {formErrors.phone && <span className="text-brand-red text-xs font-bold">{formErrors.phone}</span>}
                      </div>
                    </div>

                    {/* Faculty Select & UTME details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Preferred Faculty</label>
                        <select
                          name="faculty"
                          value={formData.faculty}
                          onChange={handleChange}
                          className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-brand-blue-dark focus:outline-none focus:border-brand-blue"
                        >
                          <option value="health">Applied Health Sciences</option>
                          <option value="social">Social & Management Sciences</option>
                          <option value="natural">Natural & Applied Sciences</option>
                          <option value="law">Faculty of Law</option>
                          <option value="arts">Faculty of Arts</option>
                          <option value="agriculture">Agricultural Sciences</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">UTME (JAMB) Score</label>
                        <input
                          type="number"
                          name="jambScore"
                          value={formData.jambScore}
                          onChange={handleChange}
                          placeholder="e.g. 180"
                          className={`w-full p-3.5 bg-slate-50 rounded-xl border text-sm font-semibold focus:outline-none transition-colors ${
                            formErrors.jambScore ? "border-brand-red focus:border-brand-red" : "border-slate-200 focus:border-brand-blue"
                          }`}
                        />
                        {formErrors.jambScore && <span className="text-brand-red text-xs font-bold">{formErrors.jambScore}</span>}
                      </div>
                    </div>

                    {/* Olevel credit counts */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Number of O'Level Credits</label>
                      <select
                        name="olevelCredits"
                        value={formData.olevelCredits}
                        onChange={handleChange}
                        className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-brand-blue-dark focus:outline-none focus:border-brand-blue"
                      >
                        <option value="5">5 Credits or more (Recommended)</option>
                        <option value="4">4 Credits (Deficiency pathway required)</option>
                        <option value="3">Less than 3 Credits (Ineligible)</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-brand-red hover:bg-brand-red/90 text-white font-display font-bold py-4 rounded-xl shadow-lg shadow-brand-red/20 transition-colors flex items-center justify-center gap-2 cursor-pointer mt-4"
                    >
                      <span>Submit Application</span>
                      <ArrowRight size={16} />
                    </button>
                  </form>
                ) : (
                  // Registration Success Screen
                  <div className="flex flex-col items-center justify-center text-center py-8 gap-6">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full">
                      <ShieldCheck size={54} />
                    </div>
                    <div>
                      <h3 className="font-display font-black text-2xl text-brand-blue-dark">Application Submitted!</h3>
                      <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                        Congratulations, your application details have been received successfully. Below is your official registration record.
                      </p>
                    </div>

                    <div className="w-full border border-slate-100 bg-brand-bg-light rounded-2xl p-6 flex flex-col gap-3 text-left">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold uppercase tracking-wider">Registration Number</span>
                        <span className="text-brand-red font-black font-display text-sm">{regNumber}</span>
                      </div>
                      <hr className="border-slate-200/50" />
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold uppercase tracking-wider">Candidate Name</span>
                        <span className="text-brand-blue-dark font-extrabold">{formData.fullName}</span>
                      </div>
                      <hr className="border-slate-200/50" />
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold uppercase tracking-wider">Email Address</span>
                        <span className="text-brand-blue-dark font-extrabold">{formData.email}</span>
                      </div>
                      <hr className="border-slate-200/50" />
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold uppercase tracking-wider">Assigned Faculty</span>
                        <span className="text-brand-blue-dark font-extrabold uppercase">{formData.faculty}</span>
                      </div>
                      <hr className="border-slate-200/50" />
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold uppercase tracking-wider">Eligibility Verification</span>
                        <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">ELIGIBLE</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 italic">
                      Please print or copy this slip. Bring it alongside your credentials and 4 passport photographs to the CCHSMT campus administrative desk for physical screening.
                    </div>

                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="text-brand-blue hover:text-brand-blue-light text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Fill another application
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
