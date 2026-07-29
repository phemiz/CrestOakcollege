"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  FileText, 
  Upload, 
  Lock, 
  ArrowRight, 
  ShieldCheck
} from "lucide-react";
import { OtpModal } from "./OtpModal";
import { 
  getCoursesForFaculty, 
  getCoursesForPostgrad, 
  getCourseLabel 
} from "@/data/admissionsData";
import { Admission } from "@/types";

interface ApplicationFormTabProps {
  onTrack: (regNumber: string, application: Admission) => void;
  prefilledLevel?: string;
  prefilledFaculty?: string;
  prefilledCourse?: string;
}

export const ApplicationFormTab: React.FC<ApplicationFormTabProps> = ({
  onTrack,
  prefilledLevel,
  prefilledFaculty,
  prefilledCourse
}) => {
  // Form States
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "male",
    level: "undergraduate", // 'undergraduate' | 'postgraduate'
    faculty: "health",
    course: "nursing",
    jambScore: "",
    olevelCredits: "5",
    firstDegreeInstitution: "",
    firstDegreeClass: "second_upper",
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

  // Sync default course when level or faculty changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.level === "undergraduate") {
        const courses = getCoursesForFaculty(formData.faculty);
        if (courses.length > 0) {
          setFormData(prev => ({ ...prev, course: courses[0].value }));
        }
      } else {
        const defaultType = ["pgd", "msc", "mba", "ma", "phd"].includes(formData.faculty) ? formData.faculty : "pgd";
        const courses = getCoursesForPostgrad(defaultType);
        if (courses.length > 0) {
          setFormData(prev => ({ ...prev, faculty: defaultType, course: courses[0].value }));
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [formData.level, formData.faculty]);

  // Load draft and prefill details
  useEffect(() => {
    // Read draft
    const draft = localStorage.getItem("cchsmt_admissions_draft");

    const timer = setTimeout(() => {
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          setFormData(prev => ({ ...prev, ...parsed }));
        } catch (e) {
          console.error("Failed to parse admissions draft", e);
        }
      }

      if (prefilledLevel || prefilledFaculty || prefilledCourse) {
        setFormData(prev => ({
          ...prev,
          ...(prefilledLevel && ["undergraduate", "postgraduate"].includes(prefilledLevel) ? { level: prefilledLevel } : {}),
          ...(prefilledFaculty ? { faculty: prefilledFaculty } : {}),
          ...(prefilledCourse ? { course: prefilledCourse } : {})
        }));
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [prefilledLevel, prefilledFaculty, prefilledCourse]);

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
      setFormErrors(prev => ({ ...prev, [e.target.name]: "" }));
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

    if (formData.level === "undergraduate") {
      const score = parseInt(formData.jambScore, 10);
      if (!formData.jambScore.trim()) {
        errors.jambScore = "JAMB Score is required";
      } else if (isNaN(score) || score < 140 || score > 400) {
        errors.jambScore = "JAMB Score must be between 140 and 400 for eligibility";
      } else if (formData.course === "nursing" && score < 200) {
        errors.jambScore = "Nursing Sciences requires a minimum JAMB score of 200";
      }
    } else {
      if (!formData.firstDegreeInstitution.trim()) {
        errors.firstDegreeInstitution = "First Degree Institution is required";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Success Generation
    const randId = Math.floor(1000 + Math.random() * 9000);
    const generatedReg = `CCHMS/2026/ADM/${String(Math.floor(1 + Math.random() * 999)).padStart(4, "0")}`;
    const generatedVerify = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    setRegNumber(generatedReg);
    setVerificationCode(generatedVerify);

    const savedAppsStr = localStorage.getItem("cchsmt_submitted_applications") || "[]";
    let savedApps = [];
    try {
      savedApps = JSON.parse(savedAppsStr);
    } catch {
      savedApps = [];
    }

    const applicationRecord: Admission = {
      regNumber: generatedReg,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      level: formData.level as "undergraduate" | "postgraduate",
      faculty: formData.faculty,
      course: formData.course,
      jambScore: formData.level === "undergraduate" ? formData.jambScore : null,
      firstDegreeInstitution: formData.level === "postgraduate" ? formData.firstDegreeInstitution : null,
      firstDegreeClass: formData.level === "postgraduate" ? formData.firstDegreeClass : null,
      olevelCredits: formData.olevelCredits,
      verificationCode: generatedVerify,
      status: "Decided",
      dateSubmitted: new Date().toLocaleDateString(),
    };

    savedApps.push(applicationRecord);
    localStorage.setItem("cchsmt_submitted_applications", JSON.stringify(savedApps));
    
    // Clear draft
    localStorage.removeItem("cchsmt_admissions_draft");
    setIsSubmitted(true);
  };

  return (
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
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Application Level</label>
            <select
              name="level"
              value={formData.level}
              onChange={(e) => {
                const lvl = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  level: lvl,
                  faculty: lvl === "undergraduate" ? "health" : "pgd",
                  jambScore: "",
                  firstDegreeInstitution: "",
                }));
              }}
              className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-brand-blue-dark focus:outline-none focus:border-brand-blue"
            >
              <option value="undergraduate">Undergraduate Admission (2026/2027)</option>
              <option value="postgraduate">Postgraduate Admission (2025/2026)</option>
            </select>
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
                Candidate Application Details
              </h3>
              <p className="text-slate-400 text-xs mt-1">OTP Verified. Fill academic records and upload credentials.</p>
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
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                {formData.level === "undergraduate" ? "Target Faculty" : "Degree Program Group"}
              </label>
              <select
                name="faculty"
                value={formData.faculty}
                onChange={handleChange}
                className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-brand-blue-dark focus:outline-none focus:border-brand-blue"
              >
                {formData.level === "undergraduate" ? (
                  <>
                    <option value="health">Faculty of Health Sciences</option>
                    <option value="natural">Faculty of Natural and Applied Sciences</option>
                    <option value="arts_social_management">Faculty of Arts, Social and Management Sciences</option>
                    <option value="law">Faculty of Law</option>
                    <option value="education">Faculty of Education</option>
                    <option value="agriculture">Faculty of Agricultural Sciences</option>
                  </>
                ) : (
                  <>
                    <option value="pgd">Postgraduate Diploma (PGD)</option>
                    <option value="msc">Master of Science (M.Sc.)</option>
                    <option value="mba">Master of Business Administration (MBA)</option>
                    <option value="ma">Master of Arts (M.A.)</option>
                    <option value="phd">Doctor of Philosophy (Ph.D.)</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Choose Programme</label>
            <select
              name="course"
              value={formData.course}
              onChange={handleChange}
              className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-brand-blue-dark focus:outline-none focus:border-brand-blue"
            >
              {formData.level === "undergraduate"
                ? getCoursesForFaculty(formData.faculty).map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))
                : getCoursesForPostgrad(formData.faculty).map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))
              }
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {formData.level === "undergraduate" ? (
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
            ) : (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">First Degree Institution</label>
                <input
                  type="text"
                  name="firstDegreeInstitution"
                  value={formData.firstDegreeInstitution}
                  onChange={handleChange}
                  placeholder="e.g. University of Lagos"
                  className={`w-full p-3.5 bg-slate-50 rounded-xl border text-sm font-semibold focus:outline-none focus:border-brand-blue transition-colors ${
                    formErrors.firstDegreeInstitution ? "border-brand-red" : "border-slate-200"
                  }`}
                />
                {formErrors.firstDegreeInstitution && <span className="text-brand-red text-xs font-bold">{formErrors.firstDegreeInstitution}</span>}
              </div>
            )}

            <div className="flex flex-col gap-2">
              {formData.level === "undergraduate" ? (
                <>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">O&apos;Level Credit count</label>
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
                </>
              ) : (
                <>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">First Degree Class</label>
                  <select
                    name="firstDegreeClass"
                    value={formData.firstDegreeClass}
                    onChange={handleChange}
                    className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-brand-blue-dark focus:outline-none focus:border-brand-blue"
                  >
                    <option value="first_class">First Class Honours</option>
                    <option value="second_upper">Second Class Upper Division</option>
                    <option value="second_lower">Second Class Lower Division</option>
                    <option value="pass">Third Class / Pass</option>
                  </select>
                </>
              )}
            </div>
          </div>

          {/* Document Uploads with Previews */}
          <div className="flex flex-col gap-4">
            <h4 className="font-display font-extrabold text-brand-blue-dark text-xs uppercase tracking-wider">
              Upload Document Files (Certificates & Passport)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* WAEC upload */}
              <div className="border border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center gap-2 text-center bg-slate-50 hover:bg-slate-100 transition-colors relative">
                {filePreviews.olevel ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                    <FileText className="text-brand-red" size={28} />
                    <span className="text-[10px] text-slate-500 font-bold overflow-hidden text-ellipsis max-w-full">O&apos;Level Slip</span>
                  </div>
                ) : (
                  <>
                    <Upload className="text-slate-400" size={20} />
                    <span className="text-[10px] font-bold text-slate-500 leading-snug">O&apos;Level Result Sheet</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(e, "olevel")}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              {/* JAMB/Degree Certificate upload */}
              <div className="border border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center gap-2 text-center bg-slate-50 hover:bg-slate-100 transition-colors relative">
                {filePreviews.jamb ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                    <FileText className="text-brand-red" size={28} />
                    <span className="text-[10px] text-slate-500 font-bold overflow-hidden text-ellipsis max-w-full">
                      {formData.level === "undergraduate" ? "JAMB Slip" : "Degree Certificate"}
                    </span>
                  </div>
                ) : (
                  <>
                    <Upload className="text-slate-400" size={20} />
                    <span className="text-[10px] font-bold text-slate-500 leading-snug">
                      {formData.level === "undergraduate" ? "JAMB Result Slip" : "Degree Certificate / Transcript"}
                    </span>
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
                  <Image
                    src={filePreviews.passport}
                    alt="Passport Preview"
                    width={64}
                    height={64}
                    unoptimized
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
              <span className="text-slate-400 font-bold uppercase">Chosen Course</span>
              <span className="text-brand-blue-dark font-extrabold uppercase">
                {getCourseLabel(formData.level, formData.faculty, formData.course)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full mt-2">
            <button
              onClick={() => {
                const application: Admission = {
                  regNumber,
                  fullName: formData.fullName,
                  email: formData.email,
                  phone: formData.phone,
                  level: formData.level as "undergraduate" | "postgraduate",
                  faculty: formData.faculty,
                  course: formData.course,
                  jambScore: formData.level === "undergraduate" ? formData.jambScore : null,
                  firstDegreeInstitution: formData.level === "postgraduate" ? formData.firstDegreeInstitution : null,
                  firstDegreeClass: formData.level === "postgraduate" ? formData.firstDegreeClass : null,
                  olevelCredits: formData.olevelCredits,
                  verificationCode,
                  status: "Decided",
                  dateSubmitted: new Date().toLocaleDateString()
                };
                onTrack(regNumber, application);
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
                  level: "undergraduate",
                  faculty: "health",
                  course: "nursing",
                  jambScore: "",
                  olevelCredits: "5",
                  firstDegreeInstitution: "",
                  firstDegreeClass: "second_upper"
                });
              }}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold uppercase cursor-pointer"
            >
              Fill New Application
            </button>
          </div>
        </div>
      )}

      {showOtpModal && (
        <OtpModal
          email={formData.email}
          phone={formData.phone}
          otpInput={otpInput}
          setOtpInput={setOtpInput}
          otpError={otpError}
          onClose={() => setShowOtpModal(false)}
          onVerify={verifyOtpCode}
        />
      )}
    </div>
  );
};
