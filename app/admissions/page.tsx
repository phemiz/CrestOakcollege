"use client";

import React, { useState, useEffect } from "react";
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
  ShieldCheck,
  Upload,
  Lock,
  Search,
  Printer,
  QrCode,
  FileText,
  X
} from "lucide-react";


export default function Admissions() {
  // Tabs: 'guidelines' | 'apply' | 'track' | 'letter'
  const [activeTab, setActiveTab] = useState<"guidelines" | "apply" | "track" | "letter">("guidelines");

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
  const [verificationCode, setVerificationCode] = useState("");

  // OTP Verification States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);

  // File Upload States
  const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});

  // Search/Track State
  const [searchRegNum, setSearchRegNum] = useState("");
  const [trackingApplication, setTrackingApplication] = useState<any | null>(null);
  const [trackingError, setTrackingError] = useState("");

  // Load draft and submitted application logs on mount
  useEffect(() => {
    const draft = localStorage.getItem("cchsmt_admissions_draft");
    if (draft) {
      try {
        setFormData(JSON.parse(draft));
      } catch (e) {
        console.error("Failed to parse admissions draft", e);
      }
    }
  }, []);

  // Auto-save draft on form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const updated = {
      ...formData,
      [e.target.name]: e.target.value,
    };
    setFormData(updated);
    localStorage.setItem("cchsmt_admissions_draft", JSON.stringify(updated));

    // Clear error
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: "",
      });
    }
  };

  // Mock File Uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setFilePreviews(prev => ({
        ...prev,
        [key]: previewUrl
      }));
    }
  };

  // Validate Account & Trigger OTP
  const handleStartApplication = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) errors.fullName = "Full Name is required";
    if (!formData.email.trim()) {
      errors.email = "Email Address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }
    if (!formData.phone.trim()) errors.phone = "Phone Number is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Trigger OTP Popup
    setShowOtpModal(true);
  };

  // Confirm OTP Code
  const verifyOtpCode = () => {
    if (otpInput === "1234" || otpInput === "4321") {
      setOtpVerified(true);
      setShowOtpModal(false);
      setOtpError("");
    } else {
      setOtpError("Invalid verification code. Use '1234' for testing.");
    }
  };

  // Final Form Submit
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

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

    // Success Generation
    const randId = Math.floor(1000 + Math.random() * 9000);
    const generatedReg = `CCHSMT/2026/${randId}`;
    const generatedVerify = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    setRegNumber(generatedReg);
    setVerificationCode(generatedVerify);

    // Write to list of submitted applications in localStorage
    const savedAppsStr = localStorage.getItem("cchsmt_submitted_applications") || "[]";
    let savedApps = [];
    try {
      savedApps = JSON.parse(savedAppsStr);
    } catch (err) {
      savedApps = [];
    }

    const applicationRecord = {
      regNumber: generatedReg,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      faculty: formData.faculty,
      jambScore: formData.jambScore,
      olevelCredits: formData.olevelCredits,
      verificationCode: generatedVerify,
      status: "Submitted", // Steps: Submitted, Screened, Interviewed, Decided, Accepted, Paid
      dateSubmitted: new Date().toLocaleDateString(),
    };

    savedApps.push(applicationRecord);
    localStorage.setItem("cchsmt_submitted_applications", JSON.stringify(savedApps));
    
    // Clear draft
    localStorage.removeItem("cchsmt_admissions_draft");
    setIsSubmitted(true);
  };

  // Status Search
  const handleTrackSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchRegNum.trim()) {
      setTrackingError("Please enter a valid Registration Number.");
      setTrackingApplication(null);
      return;
    }

    const savedAppsStr = localStorage.getItem("cchsmt_submitted_applications") || "[]";
    let savedApps = [];
    try {
      savedApps = JSON.parse(savedAppsStr);
    } catch (err) {
      savedApps = [];
    }

    // Find in localStorage
    const matched = savedApps.find((app: any) => app.regNumber.toUpperCase() === searchRegNum.trim().toUpperCase());
    
    if (matched) {
      setTrackingApplication(matched);
      setTrackingError("");
    } else {
      // Create a mock application for demonstration if they query any valid code
      if (searchRegNum.startsWith("CCHSMT/")) {
        const mockApp = {
          regNumber: searchRegNum.toUpperCase(),
          fullName: "Mock Student Account",
          email: "student@cchsmt.edu.ng",
          phone: "08155884804",
          faculty: "health",
          jambScore: "185",
          olevelCredits: "5",
          verificationCode: "CCXT84",
          status: "Decided", // Let mock search result in offer letter immediately!
          dateSubmitted: "06/07/2026"
        };
        setTrackingApplication(mockApp);
        setTrackingError("");
      } else {
        setTrackingError("No application record found. Make sure format is CCHSMT/2026/XXXX");
        setTrackingApplication(null);
      }
    }
  };

  // Print Letter Action
  const triggerPrint = () => {
    window.print();
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
              Admissions Office
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto font-medium">
              Start your journey today. Apply online, track your status, and download your admission letters.
            </p>
          </div>
        </section>

        {/* Tab Selection */}
        <section className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex border-collapse justify-center sm:justify-start">
            {[
              { id: "guidelines", label: "General Guidelines" },
              { id: "apply", label: "Online Application" },
              { id: "track", label: "Admission Tracker" },
              { id: "letter", label: "Admission Letter" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-4 sm:px-6 font-display text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "border-brand-red text-brand-red font-extrabold"
                    : "border-transparent text-slate-500 hover:text-brand-blue-dark"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* PAGE CONTENT PANEL */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            
            {/* GUIDELINES TAB */}
            {activeTab === "guidelines" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-7 flex flex-col gap-8">
                  {/* Banner */}
                  <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex gap-4 items-start">
                    <div className="p-3 bg-brand-red-light text-brand-red rounded-xl shrink-0">
                      <AlertCircle size={24} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-brand-blue-dark text-base">Admission Eligibility</h3>
                      <p className="text-slate-500 text-xs sm:text-sm mt-1.5 leading-relaxed font-semibold">
                        All academic programmes are offered under the academic affiliation and supervision of <strong>Atiba University, Oyo</strong>. The general JAMB cut-off mark for the 2025/2026 academic calendar is <span className="text-brand-red font-black">140</span>. Candidates must possess credit level passes in at least 5 subjects at O'level (WAEC, NECO, or NABTEB) including English Language and Mathematics.
                      </p>
                    </div>
                  </div>

                  {/* Step by Step Flow */}
                  <div className="flex flex-col gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="font-display font-extrabold text-brand-blue-dark text-lg uppercase tracking-wider border-b border-slate-200 pb-2">
                      Admissions Process Flow
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-display font-bold shrink-0">1</div>
                        <div>
                          <p className="font-display font-bold text-brand-blue-dark">Submit Form</p>
                          <p className="text-slate-500 text-xs mt-1 font-semibold leading-relaxed">Fill account credentials, verify OTP, input details, and save draft.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-display font-bold shrink-0">2</div>
                        <div>
                          <p className="font-display font-bold text-brand-blue-dark">Document Screening</p>
                          <p className="text-slate-500 text-xs mt-1 font-semibold leading-relaxed">Admissions officers audit WAEC/NECO and JAMB uploads.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-display font-bold shrink-0">3</div>
                        <div>
                          <p className="font-display font-bold text-brand-blue-dark">Interview & Decision</p>
                          <p className="text-slate-500 text-xs mt-1 font-semibold leading-relaxed">Successful screening results in entrance exam schedules and decision release.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-display font-bold shrink-0">4</div>
                        <div>
                          <p className="font-display font-bold text-brand-blue-dark">Acceptance & Fee</p>
                          <p className="text-slate-500 text-xs mt-1 font-semibold leading-relaxed">Verify status, print offer letter, pay Acceptance Fee online, and start registration.</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                      <button
                        onClick={() => setActiveTab("apply")}
                        className="bg-brand-red hover:bg-brand-red/90 text-white font-display font-bold px-6 py-2.5 rounded-full text-xs transition-colors cursor-pointer"
                      >
                        Start Your Application Form
                      </button>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 flex flex-col gap-6">
                  {/* Affiliation info */}
                  <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col gap-5 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                    <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 w-fit">
                      <img src="/atiba-university-banner.png" alt="Atiba University Logo" className="h-10 w-auto object-contain" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-brand-blue-dark text-sm sm:text-base">
                        Affiliation Direct Contacts
                      </h4>
                      <p className="text-slate-500 text-xs mt-1 font-semibold leading-relaxed">
                        For direct confirmations and regulatory approvals:
                      </p>
                      <p className="text-brand-blue-dark font-extrabold text-sm mt-3">
                        📞 +234 (0) 816 938 2815, +234 (0) 905 844 8903
                      </p>
                      <p className="text-slate-400 text-xs mt-2 font-semibold">
                        Email: <a href="mailto:admissionsofficer@atibauniversity.edu.ng" className="text-brand-red hover:underline">admissionsofficer@atibauniversity.edu.ng</a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* APPLICATION FORM TAB */}
            {activeTab === "apply" && (
              <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-red" />
                
                {!otpVerified && !isSubmitted ? (
                  // Account creation / OTP Verification Panel
                  <form onSubmit={handleStartApplication} className="flex flex-col gap-6">
                    <div className="border-b border-slate-100 pb-4">
                      <h3 className="font-display font-extrabold text-brand-blue-dark text-lg sm:text-xl">
                        Create Application Account
                      </h3>
                      <p className="text-slate-400 text-xs mt-1">Create your profile and verify email/phone via a 4-digit code.</p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Candidate Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Surname first, followed by other names"
                        className={`w-full p-3.5 bg-slate-50 rounded-xl border text-sm font-semibold focus:outline-none focus:border-brand-blue transition-colors ${
                          formErrors.fullName ? "border-brand-red" : "border-slate-200"
                        }`}
                      />
                      {formErrors.fullName && <span className="text-brand-red text-xs font-bold">{formErrors.fullName}</span>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Active Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="candidate@gmail.com"
                          className={`w-full p-3.5 bg-slate-50 rounded-xl border text-sm font-semibold focus:outline-none focus:border-brand-blue transition-colors ${
                            formErrors.email ? "border-brand-red" : "border-slate-200"
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
                          placeholder="e.g. 08155884804"
                          className={`w-full p-3.5 bg-slate-50 rounded-xl border text-sm font-semibold focus:outline-none focus:border-brand-blue transition-colors ${
                            formErrors.phone ? "border-brand-red" : "border-slate-200"
                          }`}
                        />
                        {formErrors.phone && <span className="text-brand-red text-xs font-bold">{formErrors.phone}</span>}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="bg-brand-blue hover:bg-brand-blue-dark text-white font-display font-bold py-3.5 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Verify & Continue</span>
                      <Lock size={15} />
                    </button>
                  </form>
                ) : otpVerified && !isSubmitted ? (
                  // Detailed Application Form
                  <form onSubmit={handleFinalSubmit} className="flex flex-col gap-6">
                    <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-display font-extrabold text-brand-blue-dark text-lg sm:text-xl">
                          Candidate Application details
                        </h3>
                        <p className="text-slate-400 text-xs mt-1">OTP Verified. Fill scores and upload credentials.</p>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Verified
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Gender</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-brand-blue-dark focus:outline-none focus:border-brand-blue"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Target Faculty</label>
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
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">JAMB Score (Min 140)</label>
                        <input
                          type="number"
                          name="jambScore"
                          value={formData.jambScore}
                          onChange={handleChange}
                          placeholder="e.g. 195"
                          className={`w-full p-3.5 bg-slate-50 rounded-xl border text-sm font-semibold focus:outline-none focus:border-brand-blue transition-colors ${
                            formErrors.jambScore ? "border-brand-red" : "border-slate-200"
                          }`}
                        />
                        {formErrors.jambScore && <span className="text-brand-red text-xs font-bold">{formErrors.jambScore}</span>}
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">O'Level Credit count</label>
                        <select
                          name="olevelCredits"
                          value={formData.olevelCredits}
                          onChange={handleChange}
                          className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-brand-blue-dark focus:outline-none focus:border-brand-blue"
                        >
                          <option value="5">5 Credits or more (Eligible)</option>
                          <option value="4">4 Credits (Prerequisite audit needed)</option>
                          <option value="3">Less than 3 Credits (Ineligible)</option>
                        </select>
                      </div>
                    </div>

                    {/* Document Uploads with Previews */}
                    <div className="flex flex-col gap-4">
                      <h4 className="font-display font-extrabold text-brand-blue-dark text-xs uppercase tracking-wider">
                        Upload Document Files (WAEC/NECO/JAMB & Passport)
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* WAEC upload */}
                        <div className="border border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center gap-2 text-center bg-slate-50 hover:bg-slate-100 transition-colors relative">
                          {filePreviews.olevel ? (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                              <FileText className="text-brand-red" size={28} />
                              <span className="text-[10px] text-slate-500 font-bold overflow-hidden text-ellipsis max-w-full">O'Level Slip</span>
                            </div>
                          ) : (
                            <>
                              <Upload className="text-slate-400" size={20} />
                              <span className="text-[10px] font-bold text-slate-500 leading-snug">O'Level Result Sheet</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleFileChange(e, "olevel")}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>

                        {/* JAMB upload */}
                        <div className="border border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center gap-2 text-center bg-slate-50 hover:bg-slate-100 transition-colors relative">
                          {filePreviews.jamb ? (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                              <FileText className="text-brand-red" size={28} />
                              <span className="text-[10px] text-slate-500 font-bold overflow-hidden text-ellipsis max-w-full">JAMB Slip</span>
                            </div>
                          ) : (
                            <>
                              <Upload className="text-slate-400" size={20} />
                              <span className="text-[10px] font-bold text-slate-500 leading-snug">JAMB Result Slip</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleFileChange(e, "jamb")}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>

                        {/* Passport photo */}
                        <div className="border border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center gap-2 text-center bg-slate-50 hover:bg-slate-100 transition-colors relative">
                          {filePreviews.passport ? (
                            <img
                              src={filePreviews.passport}
                              alt="Passport Preview"
                              className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                            />
                          ) : (
                            <>
                              <Upload className="text-slate-400" size={20} />
                              <span className="text-[10px] font-bold text-slate-500 leading-snug">Passport Photograph</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, "passport")}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="bg-brand-red hover:bg-brand-red/90 text-white font-display font-bold py-3.5 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      <span>Submit Application Form</span>
                      <ArrowRight size={15} />
                    </button>
                  </form>
                ) : (
                  // Success Message and Portal navigation
                  <div className="flex flex-col items-center justify-center text-center py-6 gap-6">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full">
                      <ShieldCheck size={54} />
                    </div>
                    <div>
                      <h3 className="font-display font-black text-2xl text-brand-blue-dark">Application Lodged!</h3>
                      <p className="text-slate-500 text-sm mt-2 leading-relaxed font-semibold">
                        Your application details have been compiled and submitted. Write down your Registration details below.
                      </p>
                    </div>

                    <div className="w-full border border-slate-100 bg-slate-50 rounded-2xl p-5 flex flex-col gap-3.5 text-left text-xs font-semibold text-slate-700">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold uppercase">Registration Code</span>
                        <span className="text-brand-red font-black font-display text-sm">{regNumber}</span>
                      </div>
                      <hr className="border-slate-100" />
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold uppercase">Verification Key</span>
                        <span className="text-brand-blue-dark font-extrabold">{verificationCode}</span>
                      </div>
                      <hr className="border-slate-100" />
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold uppercase">Candidate Name</span>
                        <span className="text-brand-blue-dark font-extrabold">{formData.fullName}</span>
                      </div>
                      <hr className="border-slate-100" />
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold uppercase">Assigned Faculty</span>
                        <span className="text-brand-blue-dark font-extrabold uppercase">{formData.faculty}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full mt-2">
                      <button
                        onClick={() => {
                          setSearchRegNum(regNumber);
                          setActiveTab("track");
                          // Manually load matching status
                          setTrackingApplication({
                            regNumber,
                            fullName: formData.fullName,
                            email: formData.email,
                            faculty: formData.faculty,
                            verificationCode,
                            status: "Submitted",
                            dateSubmitted: new Date().toLocaleDateString()
                          });
                        }}
                        className="w-full bg-brand-blue hover:bg-brand-blue-dark text-white font-display font-bold py-3 rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Track Application Status
                      </button>
                      <button
                        onClick={() => {
                          setIsSubmitted(false);
                          setOtpVerified(false);
                          setFormData({
                            fullName: "",
                            email: "",
                            phone: "",
                            gender: "male",
                            faculty: "health",
                            jambScore: "",
                            olevelCredits: "5"
                          });
                        }}
                        className="text-slate-400 hover:text-slate-600 text-xs font-bold uppercase cursor-pointer"
                      >
                        Fill New Application
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TRACK STATUS TAB */}
            {activeTab === "track" && (
              <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md">
                <div className="border-b border-slate-100 pb-4 mb-6">
                  <h3 className="font-display font-extrabold text-brand-blue-dark text-lg sm:text-xl">
                    Track Application Status
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">Enter your Registration Number to view active status indicators.</p>
                </div>

                <form onSubmit={handleTrackSearch} className="flex gap-3 mb-8">
                  <input
                    type="text"
                    placeholder="e.g. CCHSMT/2026/1234"
                    value={searchRegNum}
                    onChange={(e) => setSearchRegNum(e.target.value)}
                    className="flex-grow p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-brand-blue"
                  />
                  <button
                    type="submit"
                    className="bg-brand-blue hover:bg-brand-blue-dark text-white px-5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Search size={14} />
                    <span>Track</span>
                  </button>
                </form>

                {trackingError && (
                  <div className="bg-red-50 text-red-700 p-4 rounded-xl text-xs font-bold mb-4">
                    {trackingError}
                  </div>
                )}

                {trackingApplication && (
                  <div className="flex flex-col gap-6">
                    {/* Candidate Details */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-semibold text-slate-700 grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-slate-400 font-bold block uppercase mb-0.5">Applicant Name</span>
                        <span className="text-brand-blue-dark font-extrabold">{trackingApplication.fullName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block uppercase mb-0.5">Faculty Choice</span>
                        <span className="text-brand-blue-dark font-extrabold uppercase">{trackingApplication.faculty}</span>
                      </div>
                    </div>

                    {/* Progress visualizer */}
                    <div>
                      <h4 className="font-display font-extrabold text-xs text-brand-blue-dark uppercase tracking-wider mb-4">
                        Admissions Pipeline Progress
                      </h4>
                      
                      <div className="flex flex-col gap-4">
                        {[
                          { key: "Submitted", label: "Form Submitted", desc: "Details received successfully" },
                          { key: "Screened", label: "Credential Screening", desc: "Verifying WAEC/NECO & JAMB credentials" },
                          { key: "Interviewed", label: "Entrance Interview", desc: "Candidate screening exercises" },
                          { key: "Decided", label: "Admission Decision Offer", desc: "Offer letter generated" }
                        ].map((step, idx) => {
                          const steps = ["Submitted", "Screened", "Interviewed", "Decided"];
                          const currentIdx = steps.indexOf(trackingApplication.status || "Submitted");
                          const stepIdx = steps.indexOf(step.key);
                          const isDone = stepIdx <= currentIdx;
                          const isActive = stepIdx === currentIdx;

                          return (
                            <div key={step.key} className="flex gap-4 items-start">
                              <div className="flex flex-col items-center shrink-0">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all ${
                                  isDone
                                    ? "bg-brand-red border-brand-red text-white"
                                    : "border-slate-200 text-slate-400"
                                }`}>
                                  {stepIdx + 1}
                                </div>
                                {idx < 3 && (
                                  <div className={`w-0.5 h-10 transition-colors ${
                                    stepIdx < currentIdx ? "bg-brand-red" : "bg-slate-200"
                                  }`} />
                                )}
                              </div>
                              <div className="text-xs pt-0.5">
                                <p className={`font-bold uppercase tracking-wide ${isDone ? "text-brand-blue-dark" : "text-slate-400"}`}>
                                  {step.label}
                                </p>
                                <p className="text-slate-500 font-semibold mt-0.5 leading-snug">{step.desc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Trigger Admission Letter if decided */}
                    {["Interviewed", "Decided", "Accepted", "Paid"].includes(trackingApplication.status) && (
                      <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
                        <div>
                          <p className="font-bold text-brand-blue-dark">Admission Offer Available!</p>
                          <p className="text-slate-500 font-semibold mt-1">Your Admission Letter has been signed by the Registrar.</p>
                        </div>
                        <button
                          onClick={() => {
                            setActiveTab("letter");
                          }}
                          className="bg-brand-red hover:bg-brand-red/90 text-white font-display font-bold px-4 py-2 rounded-lg text-[10px] uppercase tracking-wider shrink-0 transition-colors cursor-pointer"
                        >
                          View Offer Letter
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ADMISSION LETTER TAB */}
            {activeTab === "letter" && (
              <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-md">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6 print:hidden">
                  <div>
                    <h3 className="font-display font-extrabold text-brand-blue-dark text-lg sm:text-xl">
                      Admission Letter System
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">Print or download your official admission offer.</p>
                  </div>
                  <button
                    onClick={triggerPrint}
                    className="bg-brand-blue text-white hover:bg-brand-blue-dark p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer size={15} />
                    <span>Print Letter</span>
                  </button>
                </div>

                {/* Actual printable letterhead layout */}
                <div className="border border-slate-100 p-6 sm:p-10 rounded-2xl bg-white text-slate-800 leading-relaxed font-sans text-xs sm:text-sm print:border-none print:p-0">
                  {/* Letterhead Header */}
                  <div className="flex items-center justify-between border-b-2 border-brand-blue-dark pb-6 mb-8">
                    <div className="flex items-center gap-4">
                      <img src="/crestoak-logo.png" alt="CrestOak logo" className="w-16 h-16 object-contain rounded-full bg-white p-0.5 border border-slate-100" />
                      <div className="flex flex-col text-left">
                        <span className="font-display text-lg font-black tracking-tight text-brand-blue-dark leading-none">CRESTOAK</span>
                        <span className="text-[7px] tracking-wider font-extrabold text-brand-red uppercase leading-tight mt-0.5">
                          College of Health Sciences Management and Technology
                        </span>
                        <span className="text-[6px] tracking-tight font-semibold text-slate-500 leading-normal mt-0.5 max-w-[200px]">
                          Affiliated & Supervised by Atiba University, Oyo, Nigeria.
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right text-[8px] font-bold text-slate-500 flex flex-col">
                      <span>Ref: CCHSMT/ADM/2026/OFF</span>
                      <span>Date: June 07, 2026</span>
                      <span>Verification Code: CCXT84</span>
                    </div>
                  </div>

                  {/* Letter body */}
                  <div className="flex flex-col gap-6 text-slate-700">
                    <p className="font-bold text-brand-blue-dark">
                      Dear Applicant,
                    </p>

                    <div>
                      <h4 className="font-display font-black text-brand-blue-dark text-base uppercase text-center border-y border-slate-200 py-2 my-2 tracking-wide">
                        OFFER OF PROVISIONAL ADMISSION FOR 2025/2026 ACADEMIC SESSION
                      </h4>
                    </div>

                    <p>
                      Following your successful screening and eligibility audits, we are pleased to offer you provisional admission to study at <strong>CrestOak College of Health Sciences Management and Technology</strong> (Badagry, Lagos campus) under the academic supervision and affiliation of <strong>Atiba University, Oyo</strong>.
                    </p>

                    <p>
                      Your admission details are specified below:
                    </p>

                    <div className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                      <div>
                        <span className="text-slate-400 block uppercase mb-0.5">Full Name</span>
                        <span className="text-brand-blue-dark font-extrabold">Olawale Tunde Joseph</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block uppercase mb-0.5">Program assigned</span>
                        <span className="text-brand-blue-dark font-extrabold uppercase">Nursing Science (B.Sc. / B.N.Sc. Degree)</span>

                      </div>
                      <div>
                        <span className="text-slate-400 block uppercase mb-0.5">Registration Number</span>
                        <span className="text-brand-red font-black">CCHSMT/2026/8294</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block uppercase mb-0.5">Academic partnership</span>
                        <span className="text-brand-blue-dark font-extrabold">Atiba University, Oyo</span>
                      </div>
                    </div>

                    <p>
                      This offer is subject to the verification of your original certificates, credentials, and passport photographs at the administrative registry. To accept this offer, you are expected to pay a non-refundable Acceptance Fee of <strong>₦20,000</strong> using your student portal accounts dashboard within fourteen (14) days of this notice.
                    </p>

                    <p>
                      Accept our warm congratulations.
                    </p>

                    {/* Signature block */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-4">
                      <div>
                        <p className="font-bold text-slate-700">Dr. Ajisefinni E.O.</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Rector, CrestOak College</p>
                        <div className="w-16 h-8 bg-slate-100 rounded border border-slate-200 mt-1 flex items-center justify-center text-[7px] text-slate-400 font-black italic">
                          Signed
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-1.5 text-center text-[8px] font-bold text-slate-400">
                        <QrCode size={45} className="text-slate-600" />
                        <span>Scan to Verify Slip</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        </section>

        {/* OTP Modal popup */}
        {showOtpModal && (
          <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-sm flex justify-center items-center px-4">
            <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col gap-6 relative">
              <button
                onClick={() => setShowOtpModal(false)}
                className="absolute top-0 right-0 p-4 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
              
              <div className="text-center flex flex-col gap-2">
                <h4 className="font-display font-extrabold text-brand-blue-dark text-lg">OTP Verification Audit</h4>
                <p className="text-slate-500 text-xs leading-relaxed font-semibold">
                  We sent a 4-digit code to <strong className="text-brand-blue-dark">{formData.email}</strong> and SMS to <strong className="text-brand-blue-dark">{formData.phone}</strong>.
                </p>
              </div>

              {otpError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs font-bold text-center">
                  {otpError}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  maxLength={4}
                  placeholder="Enter 4-digit Code"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="w-full text-center p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-black tracking-widest focus:outline-none focus:border-brand-blue"
                />
                <p className="text-[10px] text-slate-400 font-bold text-center">
                  * Note: Use <strong className="text-brand-red">1234</strong> to bypass verification for testing.
                </p>
                <button
                  onClick={verifyOtpCode}
                  className="bg-brand-red hover:bg-brand-red/90 text-white font-display font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Verify Account
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </>
  );
}
