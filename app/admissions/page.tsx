"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  // Tabs: 'guidelines' | 'fees' | 'apply' | 'track' | 'letter'
  const [activeTab, setActiveTab] = useState<"guidelines" | "fees" | "apply" | "track" | "letter">("guidelines");

  // Admissions Fee Calculator States
  const [admFeeFaculty, setAdmFeeFaculty] = useState("health");
  const [admFeeHostel, setAdmFeeHostel] = useState("none");
  const [admSelectedCharges, setAdmSelectedCharges] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const initialCharges: Record<string, boolean> = {};
    const chargesList = [
      { name: "Application Fee/Registration", amount: 20000, mustPaidInFull: true, key: "app_fee", defaultSelected: true },
      { name: "Acceptance Fee", amount: 50000, mustPaidInFull: true, key: "acceptance_fee", defaultSelected: true },
      { name: "Medical Test", amount: 10000, mustPaidInFull: true, key: "medical", defaultSelected: true },
      { name: "ID Card", amount: 10000, mustPaidInFull: true, key: "id_card", defaultSelected: true },
      { name: "Matriculation Fee", amount: 20000, mustPaidInFull: true, key: "matric", defaultSelected: true },
      { name: "Portal Maintenance Fee", amount: 10000, mustPaidInFull: true, key: "portal", defaultSelected: true },
      { name: "Departmental Dues (Per Semester)", amount: 5000, mustPaidInFull: true, key: "dept_dues", defaultSelected: true },
      { name: "Library Fee", amount: 10000, mustPaidInFull: false, key: "library", defaultSelected: true },
      { name: "Course Form", amount: 10000, mustPaidInFull: false, key: "course_form", defaultSelected: true },
      { name: "Polo Shirts", amount: 25000, mustPaidInFull: true, key: "polo", defaultSelected: true },
      { name: "Lab/Workshop Fee", amount: 15000, mustPaidInFull: false, key: "lab", defaultSelected: false, categorySpecific: ["health", "physical"] },
      { name: "Manual (Sciences)", amount: 15000, mustPaidInFull: true, key: "manual", defaultSelected: false, categorySpecific: ["health", "physical"] },
      { name: "Nursing Procedure", amount: 20000, mustPaidInFull: true, key: "nursing_proc", defaultSelected: false, categorySpecific: ["health"] },
      { name: "Entrepreneurship", amount: 60000, mustPaidInFull: false, key: "entrepreneurship", defaultSelected: false },
      { name: "Carryover Fees (Per Semester)", amount: 20000, mustPaidInFull: true, key: "carryover", defaultSelected: false }
    ];
    chargesList.forEach(charge => {
      if (charge.defaultSelected) {
        initialCharges[charge.key] = true;
      } else if (charge.categorySpecific && charge.categorySpecific.includes(admFeeFaculty)) {
        initialCharges[charge.key] = true;
      } else {
        initialCharges[charge.key] = false;
      }
    });
    setAdmSelectedCharges(initialCharges);
  }, [admFeeFaculty]);

  // Form States
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "male",
    level: "undergraduate", // 'undergraduate' | 'postgraduate'
    faculty: "health", // Undergrad: health, natural, arts_social_management, law, education, agriculture. Postgrad: pgd, msc, mba, ma, phd.
    course: "nursing",
    jambScore: "",
    olevelCredits: "5",
    // Postgraduate specific fields
    firstDegreeInstitution: "",
    firstDegreeClass: "second_upper", // 'first_class' | 'second_upper' | 'second_lower' | 'pass'
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

  // Course helpers
  const getCoursesForFaculty = (faculty: string) => {
    switch (faculty) {
      case "health":
        return [
          { value: "nursing", label: "Nursing Sciences (B.Sc.)" },
          { value: "medlab", label: "Medical Laboratory Science (BMLs)" },
          { value: "pubhealth", label: "Public Health" },
          { value: "physiology", label: "Physiology" }
        ];
      case "natural":
        return [
          { value: "biochem", label: "Biochemistry" },
          { value: "chemistry", label: "Chemistry" },
          { value: "microbio", label: "Microbiology" },
          { value: "compsci", label: "Computer Science" },
          { value: "maths", label: "Mathematics" },
          { value: "physics", label: "Physics" },
          { value: "physics_elec", label: "Physics with Electronics" }
        ];
      case "arts_social_management":
        return [
          { value: "english", label: "English" },
          { value: "theater", label: "Theater" },
          { value: "accounting", label: "Accounting" },
          { value: "finance", label: "Banking and Finance" },
          { value: "busadmin", label: "Business Administration" },
          { value: "criminology", label: "Criminology and Security Studies" },
          { value: "entrepreneurship", label: "Entrepreneurship" },
          { value: "economics", label: "Economics" },
          { value: "hospitality", label: "Hospitality and Tourism Management" },
          { value: "intl_relations", label: "International Relations" },
          { value: "marketing", label: "Marketing" },
          { value: "political_sci", label: "Political Science" },
          { value: "pub_admin", label: "Public Administration" },
          { value: "psychology", label: "Psychology" },
          { value: "sociology", label: "Sociology" },
          { value: "transport", label: "Transport Management" }
        ];
      case "law":
        return [{ value: "law", label: "LL.B Law" }];
      case "education":
        return [
          { value: "edu_mgmt", label: "Educational Management" },
          { value: "lib_sci", label: "Library & Information Science" }
        ];
      case "agriculture":
        return [{ value: "agric_ext", label: "Agricultural Extension and Rural Development" }];
      default:
        return [];
    }
  };

  const getCoursesForPostgrad = (degreeType: string) => {
    switch (degreeType) {
      case "pgd":
        return [
          { value: "pgd_accounting", label: "PGD Accounting" },
          { value: "pgd_busadmin", label: "PGD Business Administration" },
          { value: "pgd_pubadmin", label: "PGD Public Administration" },
          { value: "pgd_compsci", label: "PGD Computer Science" }
        ];
      case "msc":
        return [
          { value: "msc_pubadmin", label: "M.Sc. Public Administration" },
          { value: "msc_compsci", label: "M.Sc. Computer Science" },
          { value: "msc_busadmin", label: "M.Sc. Business Administration" },
          { value: "msc_nursing", label: "M.Sc. Nursing" },
          { value: "msc_political", label: "M.Sc. Political Science" },
          { value: "msc_economics", label: "M.Sc. Economics" },
          { value: "msc_intl_relations", label: "M.Sc. International Relations" },
          { value: "msc_sociology", label: "M.Sc. Sociology" }
        ];
      case "mba":
        return [{ value: "mba_busadmin", label: "MBA Business Administration" }];
      case "ma":
        return [{ value: "ma_english", label: "M.A. English" }];
      case "phd":
        return [
          { value: "phd_pubadmin", label: "Ph.D. Public Administration" },
          { value: "phd_compsci", label: "Ph.D. Computer Science" },
          { value: "phd_political", label: "Ph.D. Political Science" },
          { value: "phd_economics", label: "Ph.D. Economics" },
          { value: "phd_intl_relations", label: "Ph.D. International Relations" },
          { value: "phd_sociology", label: "Ph.D. Sociology" },
          { value: "phd_english", label: "Ph.D. English" }
        ];
      default:
        return [];
    }
  };

  const getCourseLabel = (level: string, faculty: string, value: string) => {
    const list = level === "undergraduate" ? getCoursesForFaculty(faculty) : getCoursesForPostgrad(faculty);
    const item = list.find(c => c.value === value);
    return item ? item.label : value;
  };

  // Sync default course when level or faculty changes
  useEffect(() => {
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
  }, [formData.level, formData.faculty]);

  // Load draft and submitted application logs on mount
  useEffect(() => {
    const draft = localStorage.getItem("cchsmt_admissions_draft");
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setFormData(prev => ({ ...prev, ...parsed }));
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
      level: formData.level,
      faculty: formData.faculty,
      course: formData.course,
      jambScore: formData.level === "undergraduate" ? formData.jambScore : null,
      firstDegreeInstitution: formData.level === "postgraduate" ? formData.firstDegreeInstitution : null,
      firstDegreeClass: formData.level === "postgraduate" ? formData.firstDegreeClass : null,
      olevelCredits: formData.olevelCredits,
      verificationCode: generatedVerify,
      status: "Decided", // Auto-decided for easy testing in mock system!
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
          level: "undergraduate",
          faculty: "health",
          course: "nursing",
          jambScore: "185",
          olevelCredits: "5",
          verificationCode: "CCXT84",
          status: "Decided", 
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
            <span className="text-brand-gold font-bold text-xs uppercase tracking-widest">Enrollment Portal</span>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight">
              Admissions Office
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto font-medium">
              Start your journey today. Apply online for Undergraduate (2026/2027) or Postgraduate (2025/2026) cycles, track your status, and print offer letters.
            </p>
          </div>
        </section>

        {/* Tab Selection */}
        <section className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex border-collapse justify-center sm:justify-start">
            {[
              { id: "guidelines", label: "General Guidelines" },
              { id: "fees", label: "Fees & Bursary" },
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
                <div className="lg:col-span-8 flex flex-col gap-8">
                  {/* Undergraduate Guidelines */}
                  <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col gap-4 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-red" />
                    <div className="flex gap-3 items-center">
                      <GraduationCap className="text-brand-red shrink-0" size={24} />
                      <h3 className="font-display font-black text-brand-blue-dark text-lg">Undergraduate Admission Guidelines (2026/2027)</h3>
                    </div>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-semibold">
                      Applications are invited from suitably qualified candidates for admission into NUC-approved undergraduate courses.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block uppercase mb-1">General JAMB Cut-off</span>
                        <span className="text-brand-red font-black text-sm">140+ (Nursing Sciences requires 200)</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block uppercase mb-1">O'Level Requirements</span>
                        <span className="text-brand-blue-dark font-extrabold">5 credits in WAEC/NECO/NABTEB including English & Mathematics in max 2 sittings</span>
                      </div>
                      <div className="sm:col-span-2 border-t border-slate-200/60 pt-3 mt-1">
                        <span className="text-slate-400 block uppercase mb-1">Tuition Scholarship Program</span>
                        <span className="text-emerald-700 font-extrabold">Tuition scholarship options are available for undergraduate students.</span>
                      </div>
                      <div className="sm:col-span-2 border-t border-slate-200/60 pt-3">
                        <span className="text-slate-400 block uppercase mb-1">Payment Structure</span>
                        <span className="text-brand-blue-dark font-extrabold">Diploma, JUPEB, and other students pay once.</span>
                      </div>
                    </div>
                  </div>

                  {/* Postgraduate Guidelines */}
                  <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col gap-4 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-blue" />
                    <div className="flex gap-3 items-center">
                      <FileCheck className="text-brand-blue shrink-0" size={24} />
                      <h3 className="font-display font-black text-brand-blue-dark text-lg">Postgraduate Admission Guidelines (2025/2026)</h3>
                    </div>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-semibold">
                      Applications are invited into NUC-approved Postgraduate Diploma (PGD), Master of Science (M.Sc.), Master of Business Administration (MBA), Master of Arts (M.A.), and Doctor of Philosophy (Ph.D.) programmes.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="sm:col-span-2">
                        <span className="text-slate-400 block uppercase mb-1">Academic Requirement</span>
                        <span className="text-brand-blue-dark font-extrabold">A good first degree (or Master's degree for Ph.D. path) from a recognized institution and fulfillment of specific departmental prerequisites.</span>
                      </div>
                      <div className="sm:col-span-2 border-t border-slate-200/60 pt-3">
                        <span className="text-slate-400 block uppercase mb-1">How to Apply</span>
                        <ul className="list-decimal list-inside space-y-1 mt-1 text-slate-600 font-semibold">
                          <li>Visit the official institution website.</li>
                          <li>Complete the online application form (under the Online Application tab).</li>
                          <li>Pay the prescribed non-refundable application fee.</li>
                        </ul>
                      </div>
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
                          <p className="text-slate-500 text-xs mt-1 font-semibold leading-relaxed">Fill account details, verify OTP, input academic details, and submit application.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-display font-bold shrink-0">2</div>
                        <div>
                          <p className="font-display font-bold text-brand-blue-dark">Credential Audit</p>
                          <p className="text-slate-500 text-xs mt-1 font-semibold leading-relaxed">Registry officers audit WAEC/NECO certificates or first-degree transcripts.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-display font-bold shrink-0">3</div>
                        <div>
                          <p className="font-display font-bold text-brand-blue-dark">Admissions Board Decision</p>
                          <p className="text-slate-500 text-xs mt-1 font-semibold leading-relaxed">Successful candidates receive academic clearance and offer release.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-display font-bold shrink-0">4</div>
                        <div>
                          <p className="font-display font-bold text-brand-blue-dark">Securing Seat</p>
                          <p className="text-slate-500 text-xs mt-1 font-semibold leading-relaxed">Print offer letter, pay Acceptance Fee online, and proceed with portal registration.</p>
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

                <div className="lg:col-span-4 flex flex-col gap-6">
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

            {/* FEES & BURSARY TAB */}
            {activeTab === "fees" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 flex flex-col gap-6">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
                    <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-display font-extrabold text-brand-blue-dark text-lg">Approved Fee Structure (2026/2027)</h3>
                        <p className="text-slate-400 text-xs mt-1">Review the dynamic tuition calculator for customized estimates.</p>
                      </div>
                      <Link href="/bursary">
                        <button className="text-[10px] font-bold tracking-wider uppercase text-brand-blue-light hover:underline flex items-center gap-1">
                          Full Guide <ArrowRight size={12} />
                        </button>
                      </Link>
                    </div>

                    {/* Faculty Select */}
                    <div className="flex flex-col gap-2.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Select Faculty Pathway</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        {[
                          { name: "Education", amount: 250000, key: "education" },
                          { name: "Health Sciences", amount: 400000, key: "health" },
                          { name: "Management Sciences", amount: 250000, key: "management" },
                          { name: "Physical Sciences", amount: 300000, key: "physical" },
                          { name: "Social Sciences", amount: 250000, key: "social" },
                          { name: "Law", amount: 400000, key: "law" }
                        ].map(fac => (
                          <button
                            key={fac.key}
                            type="button"
                            onClick={() => setAdmFeeFaculty(fac.key)}
                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                              admFeeFaculty === fac.key
                                ? "border-brand-red bg-brand-red-light/10 text-brand-blue-dark font-bold"
                                : "border-slate-100 bg-slate-50 text-slate-600 font-semibold"
                            }`}
                          >
                            <p>{fac.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">₦{fac.amount.toLocaleString()}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Hostel Accommodation */}
                    <div className="flex flex-col gap-2.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Hostel Accommodation Options</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        {[
                          { name: "No Hostel", amount: 0, key: "none" },
                          { name: "6 Persons / Room", amount: 200000, key: "six" },
                          { name: "4 Persons / Room", amount: 250000, key: "four" }
                        ].map(opt => (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => setAdmFeeHostel(opt.key)}
                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                              admFeeHostel === opt.key
                                ? "border-brand-red bg-brand-red-light/10 text-brand-blue-dark font-bold"
                                : "border-slate-100 bg-slate-50 text-slate-600 font-semibold"
                            }`}
                          >
                            <p>{opt.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{opt.amount > 0 ? `₦${opt.amount.toLocaleString()}` : "₦0"}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Split Results */}
                    <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex flex-col gap-3 font-semibold text-xs text-slate-600">
                      <div className="flex justify-between items-center text-sm font-bold text-brand-blue-dark">
                        <span>Grand Total Estimate</span>
                        <span className="font-display font-black text-brand-red text-base">
                          ₦{(
                            ([
                              { name: "Education", amount: 250000, key: "education" },
                              { name: "Health Sciences", amount: 400000, key: "health" },
                              { name: "Management Sciences", amount: 250000, key: "management" },
                              { name: "Physical Sciences", amount: 300000, key: "physical" },
                              { name: "Social Sciences", amount: 250000, key: "social" },
                              { name: "Law", amount: 400000, key: "law" }
                            ].find(f => f.key === admFeeFaculty)?.amount || 0) +
                            ([
                              { name: "No Hostel", amount: 0, key: "none" },
                              { name: "6 Persons / Room", amount: 200000, key: "six" },
                              { name: "4 Persons / Room", amount: 250000, key: "four" }
                            ].find(o => o.key === admFeeHostel)?.amount || 0) +
                            // Admin charges (defaults and faculty specific)
                            (() => {
                              let totalCharges = 170000; // default sum (App: 20k + Acceptance: 50k + Medical: 10k + ID: 10k + Matric: 20k + Portal: 10k + Dept: 5k + Lib: 10k + Course: 10k + Polo: 25k) = 170k
                              if (admFeeFaculty === "health") totalCharges += 55000; // Lab 15k + Manual 15k + Nursing 20k + extra 5k for departmental dues per sem? Wait, the base includes dept dues.
                              else if (admFeeFaculty === "physical") totalCharges += 30000; // Lab 15k + Manual 15k
                              return totalCharges;
                            })()
                          ).toLocaleString()}
                        </span>
                      </div>
                      <hr className="border-slate-200" />
                      
                      {/* Upfront split */}
                      <div className="flex justify-between items-center text-brand-blue-dark">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold">Initial Upfront Deposit (70% Upfront + 100% * Fees)</span>
                          <span className="text-[10px] text-slate-400 font-medium">Due upon provisional admission offer acceptance</span>
                        </div>
                        <span className="font-display font-black text-sm bg-brand-red-light text-brand-red px-2.5 py-1.5 rounded-xl">
                          ₦{(
                            (() => {
                              const tuition = [
                                { name: "Education", amount: 250000, key: "education" },
                                { name: "Health Sciences", amount: 400000, key: "health" },
                                { name: "Management Sciences", amount: 250000, key: "management" },
                                { name: "Physical Sciences", amount: 300000, key: "physical" },
                                { name: "Social Sciences", amount: 250000, key: "social" },
                                { name: "Law", amount: 400000, key: "law" }
                              ].find(f => f.key === admFeeFaculty)?.amount || 0;
                              
                              const hostel = [
                                { name: "No Hostel", amount: 0, key: "none" },
                                { name: "6 Persons / Room", amount: 200000, key: "six" },
                                { name: "4 Persons / Room", amount: 250000, key: "four" }
                              ].find(o => o.key === admFeeHostel)?.amount || 0;
                              
                              // Tuition split
                              const tuitionUpfront = tuition * 0.70;
                              
                              // Split admin fees (Library 10k, Course Form 10k, Lab/Workshop 15k)
                              // Full admin fees (App 20k, Acceptance 50k, Medical 10k, ID 10k, Matric 20k, Portal 10k, Dept 5k, Polo 25k, Manual 15k, Nursing 20k)
                              let splitAdminTotal = 20000; // Library 10k + Course Form 10k
                              if (admFeeFaculty === "health" || admFeeFaculty === "physical") {
                                splitAdminTotal += 15000; // Lab 15k
                              }
                              
                              let fullAdminTotal = 150000; // App 20k + Acceptance 50k + Medical 10k + ID 10k + Matric 20k + Portal 10k + Dept 5k + Polo 25k = 150k
                              if (admFeeFaculty === "health") {
                                fullAdminTotal += 35000; // Manual 15k + Nursing 20k
                              } else if (admFeeFaculty === "physical") {
                                fullAdminTotal += 15000; // Manual 15k
                              }

                              const upfrontSplittable = (tuition + splitAdminTotal) * 0.70;
                              return Math.round(upfrontSplittable + fullAdminTotal + hostel);
                            })()
                          ).toLocaleString()}
                        </span>
                      </div>

                      {/* Balance split */}
                      <div className="flex justify-between items-center text-brand-blue-dark">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold">Remaining Balance Due (30% Tuition)</span>
                          <span className="text-[10px] text-slate-400 font-medium">Payable before the commencement of semester examinations</span>
                        </div>
                        <span className="font-display font-black text-sm bg-emerald-50 text-emerald-800 px-2.5 py-1.5 rounded-xl">
                          ₦{(
                            (() => {
                              const tuition = [
                                { name: "Education", amount: 250000, key: "education" },
                                { name: "Health Sciences", amount: 400000, key: "health" },
                                { name: "Management Sciences", amount: 250000, key: "management" },
                                { name: "Physical Sciences", amount: 300000, key: "physical" },
                                { name: "Social Sciences", amount: 250000, key: "social" },
                                { name: "Law", amount: 400000, key: "law" }
                              ].find(f => f.key === admFeeFaculty)?.amount || 0;
                              
                              let splitAdminTotal = 20000; // Library 10k + Course Form 10k
                              if (admFeeFaculty === "health" || admFeeFaculty === "physical") {
                                splitAdminTotal += 15000; // Lab 15k
                              }
                              return Math.round((tuition + splitAdminTotal) * 0.30);
                            })()
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-center pt-2">
                      <Link href="/bursary" className="text-brand-red hover:underline text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                        <span>Open Detailed Fee Calculator & Bank Coordinates</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-6">
                  {/* Account detail card */}
                  <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex flex-col gap-4 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-gold" />
                    <div>
                      <h4 className="font-display font-bold text-brand-blue-dark text-[13px] sm:text-sm">Installment Regulation</h4>
                      <p className="text-slate-400 text-[10px] mt-1 leading-relaxed">
                        70% upfront payment is required upon receiving admission, while the remaining 30% balance must be paid before examinations. Fees marked with (*) must be paid in full.
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
                          Candidate Application details
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
                        <span className="text-slate-400 font-bold uppercase">Chosen Course</span>
                        <span className="text-brand-blue-dark font-extrabold uppercase">
                          {getCourseLabel(formData.level, formData.faculty, formData.course)}
                        </span>
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
                            level: formData.level,
                            faculty: formData.faculty,
                            course: formData.course,
                            verificationCode,
                            status: "Decided",
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
                        <span className="text-slate-400 font-bold block uppercase mb-0.5">Applied Course</span>
                        <span className="text-brand-blue-dark font-extrabold uppercase">
                          {getCourseLabel(trackingApplication.level || "undergraduate", trackingApplication.faculty || "health", trackingApplication.course || "nursing")}
                        </span>
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
                          { key: "Screened", label: "Credential Screening", desc: "Verifying credentials and result sheets" },
                          { key: "Interviewed", label: "Entrance Interview", desc: "Candidate academic reviews and screenings" },
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
                      <span>Date: {trackingApplication ? trackingApplication.dateSubmitted : "June 07, 2026"}</span>
                      <span>Verification Code: {trackingApplication ? trackingApplication.verificationCode : "CCXT84"}</span>
                    </div>
                  </div>

                  {/* Letter body */}
                  <div className="flex flex-col gap-6 text-slate-700">
                    <p className="font-bold text-brand-blue-dark">
                      Dear Applicant,
                    </p>

                    <div>
                      <h4 className="font-display font-black text-brand-blue-dark text-base uppercase text-center border-y border-slate-200 py-2 my-2 tracking-wide">
                        OFFER OF PROVISIONAL ADMISSION FOR {trackingApplication && trackingApplication.level === "postgraduate" ? "2025/2026" : "2026/2027"} ACADEMIC SESSION
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
                        <span className="text-brand-blue-dark font-extrabold">
                          {trackingApplication ? trackingApplication.fullName : "Olawale Tunde Joseph"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block uppercase mb-0.5">Program assigned</span>
                        <span className="text-brand-blue-dark font-extrabold uppercase">
                          {trackingApplication 
                            ? getCourseLabel(trackingApplication.level, trackingApplication.faculty, trackingApplication.course) 
                            : "Nursing Sciences (B.Sc.)"
                          }
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block uppercase mb-0.5">Registration Number</span>
                        <span className="text-brand-red font-black">
                          {trackingApplication ? trackingApplication.regNumber : "CCHSMT/2026/8294"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block uppercase mb-0.5">Academic partnership</span>
                        <span className="text-brand-blue-dark font-extrabold">Atiba University, Oyo</span>
                      </div>
                    </div>

                    <p>
                      This offer is subject to the verification of your original certificates, credentials, and passport photographs at the administrative registry. To accept this offer, you are expected to pay a non-refundable Acceptance Fee of <strong>₦50,000</strong> using your student portal accounts dashboard within fourteen (14) days of this notice.
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
