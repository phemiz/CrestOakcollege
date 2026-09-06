"use client";

import React, { useState, useEffect } from "react";
import { Logo } from "@/components/ui/logo";
import { portalAvailableCourses, portalResultsData, portalTimetableSlots } from "@/data/portalData";
import BillingClientView from "@/app/portal/billing/BillingClientView";
import { 
  User, 
  BookOpen, 
  HelpCircle, 
  Wallet, 
  Calendar, 
  Lock, 
  Plus, 
  Download, 
  Check, 
  Send, 
  Clock, 
  CheckCircle2
} from "lucide-react";

interface StudentProfile {
  fullName: string;
  regNumber: string;
  email: string;
  phone: string;
  faculty: string;
  semester: string;
  level: string;
  gpa: string;
}

interface Invoice {
  id: string;
  description: string;
  amount: number;
  status: string;
  category: string;
  date: string;
}

interface Ticket {
  id: string;
  subject: string;
  category: string;
  message: string;
  status: string;
  dateCreated: string;
}

interface RequestItem {
  id: string;
  type: string;
  status: string;
  date: string;
}


export default function PortalDashboard({ initialUser }: { initialUser?: any }) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "academics" | "billing" | "services">("dashboard");
  const [activeAcademicSubTab, setActiveAcademicSubTab] = useState<"registration" | "results" | "timetable">("registration");

  // Authentication Mock
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [studentPass, setStudentPass] = useState("");
  const [studentError, setStudentError] = useState("");
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [cgpa, setCgpa] = useState<string | null>(null);

  // Course registration
  const [registeredCourses, setRegisteredCourses] = useState<string[]>([]);
  const [availableCourses] = useState(portalAvailableCourses);
  const [registrationSubmitted, setRegistrationSubmitted] = useState(false);

  // Invoices & Billing
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [dynamicResultsList, setDynamicResultsList] = useState<any[]>([]);
  const [billingData, setBillingData] = useState<any>(null);

  // Tickets support
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState("Academic");
  const [ticketMessage, setTicketMessage] = useState("");
  
  // Requests support
  const [requestsList, setRequestsList] = useState<RequestItem[]>([]);
  const [requestType, setRequestType] = useState("transcript");

  // Initialize client side data with live PHP MySQL API integration
  useEffect(() => {
    if (initialUser) {
      const mockProfile: StudentProfile = {
        fullName: initialUser.name || "Adebayo Chukwuma",
        regNumber: initialUser.registrationNumber || initialUser.username || "STU-2026-001",
        email: initialUser.email || "student@crestoakcollege.com.ng",
        phone: "+234 815 588 4804",
        faculty: initialUser.faculty || "health",
        semester: "1st Semester, 2026/2027",
        level: "Year 1 / 100 Level",
        gpa: "3.82"
      };

      setStudentProfile(mockProfile);
      setIsLoggedIn(true);

      const reg = initialUser.registrationNumber || initialUser.username || "STU-2026-001";
      fetch(`/api/student/dashboard.php?regNumber=${encodeURIComponent(reg)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.student) {
            setStudentProfile({
              fullName: `${data.student.firstName || ''} ${data.student.lastName || ''}`.trim() || mockProfile.fullName,
              regNumber: data.student.regNumber || mockProfile.regNumber,
              email: data.student.email || mockProfile.email,
              phone: data.student.phone || mockProfile.phone,
              faculty: data.student.faculty || mockProfile.faculty,
              semester: "1st Semester, 2026/2027",
              level: data.student.level || mockProfile.level,
              gpa: data.student.gpa || mockProfile.gpa
            });
            if (data.invoices && data.invoices.length > 0) {
              setInvoices(data.invoices);
            }
          }
        })
        .catch((err) => console.warn("Live student API fetch notice:", err));

      fetch("/api/bursary/dashboard.php", { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success !== false) {
            setBillingData(data);
          }
        })
        .catch((err) => console.warn("Bursary dashboard fetch notice:", err));

      let tuitionRate = 400000;
      const loadedFaculty = mockProfile.faculty;
      if (loadedFaculty === "natural" || loadedFaculty === "physical") tuitionRate = 300000;
      else if (["arts_social_management", "education", "agriculture", "management", "social"].includes(loadedFaculty)) tuitionRate = 250000;
      else if (loadedFaculty === "law") tuitionRate = 400000;

      const defaultInvoices = [
        { id: "INV-001", description: "Acceptance Fee & Clearance Token *", amount: 50000, status: "Pending", category: "Acceptance", date: "June 01, 2026" },
        { id: "INV-002", description: "Medical Examination & Health Insurance *", amount: 35000, status: "Pending", category: "Medical", date: "June 02, 2026" },
        { id: "INV-003", description: "Administrative & Matriculation Charges *", amount: 25000, status: "Pending", category: "Administrative", date: "June 03, 2026" },
        { id: "INV-004", description: "First Semester Tuition Fee (70% Upfront Requirement)", amount: 280000, status: "Pending", category: "School Fees", date: "June 04, 2026" },
        { id: "INV-005", description: "Second Installment Tuition Fee (30% Exam Balance)", amount: 120000, status: "Pending", category: "School Fees", date: "June 05, 2026" },
        { id: "INV-006", description: "Hostel Accommodation & Facilities (Optional)", amount: 260000, status: "Pending", category: "Hostel", date: "June 06, 2026" }
      ];

      const savedInvoices = localStorage.getItem("cchsmt_student_invoices");
      const savedTickets = localStorage.getItem("cchsmt_student_tickets");
      const savedRequests = localStorage.getItem("cchsmt_student_requests");

      if (savedInvoices) {
        setInvoices(JSON.parse(savedInvoices));
      } else {
        setInvoices(defaultInvoices);
        localStorage.setItem("cchsmt_student_invoices", JSON.stringify(defaultInvoices));
      }

      if (savedTickets) setTickets(JSON.parse(savedTickets));
      if (savedRequests) setRequestsList(JSON.parse(savedRequests));
      return;
    }

    // Check local storage logins
    const sessionData =
      localStorage.getItem("user") ||
      localStorage.getItem("crestoak_session") ||
      localStorage.getItem("cchsmt_user_session");

    let parsedSessionUser: any = null;
    if (sessionData) {
      try {
        parsedSessionUser = JSON.parse(sessionData);
      } catch (e) {}
    }

    const profile = localStorage.getItem("cchsmt_student_profile");
    // Default Invoices (Updated for 2026/2027 Approved Fee Structure)
    let tuitionRate = 400000; // default for health
    let loadedFaculty = "health";
    if (parsedSessionUser) {
      loadedFaculty = parsedSessionUser.department?.name || parsedSessionUser.department || "health";
    } else if (profile) {
      try {
        const prof = JSON.parse(profile);
        loadedFaculty = prof.faculty;
        if (prof.faculty === "natural" || prof.faculty === "physical") tuitionRate = 300000;
        else if (["arts_social_management", "education", "agriculture", "management", "social"].includes(prof.faculty)) tuitionRate = 250000;
        else if (prof.faculty === "law") tuitionRate = 400000;
      } catch {
        // ignore
      }
    }

    const defaultInvoices = [
      { id: "INV-001", description: "Acceptance Fee & Clearance Token *", amount: 50000, status: "Pending", category: "Acceptance", date: "June 01, 2026" },
      { id: "INV-002", description: "Medical Examination & Health Insurance *", amount: 35000, status: "Pending", category: "Medical", date: "June 02, 2026" },
      { id: "INV-003", description: "Administrative & Matriculation Charges *", amount: 25000, status: "Pending", category: "Administrative", date: "June 03, 2026" },
      { id: "INV-004", description: "First Semester Tuition Fee (70% Upfront Requirement)", amount: 280000, status: "Pending", category: "School Fees", date: "June 04, 2026" },
      { id: "INV-005", description: "Second Installment Tuition Fee (30% Exam Balance)", amount: 120000, status: "Pending", category: "School Fees", date: "June 05, 2026" },
      { id: "INV-006", description: "Hostel Accommodation & Facilities (Optional)", amount: 260000, status: "Pending", category: "Hostel", date: "June 06, 2026" }
    ];

    const savedInvoices = localStorage.getItem("cchsmt_student_invoices");
    const savedTickets = localStorage.getItem("cchsmt_student_tickets");
    const savedRequests = localStorage.getItem("cchsmt_student_requests");

    const timer = setTimeout(() => {
      if (parsedSessionUser) {
        const studentName =
          parsedSessionUser.name ||
          `${parsedSessionUser.user?.firstName || parsedSessionUser.firstName || ''} ${parsedSessionUser.user?.lastName || parsedSessionUser.lastName || ''}`.trim() ||
          "Student User";
        const matricNo = parsedSessionUser.matricNo || parsedSessionUser.user?.matricNo || parsedSessionUser.username || "CCHMS/2026/SCS/0001";
        const dept = parsedSessionUser.department?.name || parsedSessionUser.department || parsedSessionUser.user?.department || "Department of Nursing Sciences";
        const level = parsedSessionUser.level ? `${parsedSessionUser.level} Level` : "100 Level";
        const gpa = parsedSessionUser.cgpa ? String(parsedSessionUser.cgpa) : "";
        const email = parsedSessionUser.email || parsedSessionUser.user?.email || "student@crestoakcollege.com.ng";

        setStudentProfile({
          fullName: studentName,
          regNumber: matricNo,
          email: email,
          phone: parsedSessionUser.phoneNumber || "+234 815 588 4804",
          faculty: dept,
          semester: "1st Semester, 2026/2027",
          level: level,
          gpa: gpa
        });
        setIsLoggedIn(true);
      } else if (profile) {
        setStudentProfile(JSON.parse(profile));
        setIsLoggedIn(true);
      } else if (localStorage.getItem("isAuthenticated") === "true") {
        setIsLoggedIn(true);
      }

      // Real-Time Results & CGPA Fetch (Single Source of Truth)
      const activeMatric = parsedSessionUser?.matricNo || parsedSessionUser?.username || "CCHMS/2026/NUR/0042";
      let isMounted = true;
      fetch(`/api/student/results.php?matricNo=${encodeURIComponent(activeMatric)}`)
        .then((res) => res.json())
        .then((data) => {
          if (!isMounted) return;
          const dynamicCgpa = data?.cgpa || data?.results?.summary?.cgpa;
          if (dynamicCgpa !== undefined && dynamicCgpa !== null) {
            const formatted = parseFloat(String(dynamicCgpa)).toFixed(2);
            setCgpa(formatted);
          }
          if (data?.results?.semesters && Array.isArray(data.results.semesters)) {
            const allCourses = data.results.semesters.flatMap((s: any) => s.courses || []);
            if (allCourses.length > 0) {
              setDynamicResultsList(allCourses);
            }
          }
        })
        .catch((err) => console.error("CGPA Fetch Error:", err));

      // Real-Time Finance Fetch (live bursary API)
      fetch("/api/bursary/dashboard.php", { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success !== false) {
            setBillingData(data);
            if (data.invoices && data.invoices.length > 0) {
              setInvoices(data.invoices);
            } else if (savedInvoices) {
              setInvoices(JSON.parse(savedInvoices));
            } else {
              setInvoices(defaultInvoices);
            }
          } else if (savedInvoices) {
            setInvoices(JSON.parse(savedInvoices));
          } else {
            setInvoices(defaultInvoices);
          }
        })
        .catch((err) => {
          console.warn("Bursary dashboard fetch notice:", err);
          if (savedInvoices) {
            setInvoices(JSON.parse(savedInvoices));
          } else {
            setInvoices(defaultInvoices);
          }
        });

      // Tickets
      if (savedTickets) {
        setTickets(JSON.parse(savedTickets));
      }

      // Requests
      if (savedRequests) {
        setRequestsList(JSON.parse(savedRequests));
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [initialUser]);

  // Login Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim() || !studentPass.trim()) {
      setStudentError("Please enter both portal credentials.");
      return;
    }

    // Check admissions database to mock match
    const savedAppsStr = localStorage.getItem("cchsmt_submitted_applications") || "[]";
    let matchedName = "Olawale Tunde Joseph";
    let matchedReg = studentId.toUpperCase();
    let matchedFaculty = "health";

    try {
      const apps: any[] = JSON.parse(savedAppsStr);
      const match = apps.find(
        (a: any) => a.regNumber && a.regNumber.toUpperCase() === studentId.toUpperCase()
      );
      if (match) {
        matchedName = match.fullName;
        matchedReg = match.regNumber;
        matchedFaculty = match.faculty;
      }
    } catch {
      // ignore
    }

    const mockProfile = {
      fullName: matchedName,
      regNumber: matchedReg,
      email: "student@crestoakcollege.com.ng",
      phone: "+234 815 588 4804",
      faculty: matchedFaculty,
      semester: "1st Semester, 2025/2026",
      level: "Year 1 / 100 Level",

      gpa: "3.82"
    };

    setStudentProfile(mockProfile);
    localStorage.setItem("cchsmt_student_profile", JSON.stringify(mockProfile));

    // Dynamically update user invoices based on faculty
    let loggedTuition = 400000;
    if (matchedFaculty === "natural" || matchedFaculty === "physical") loggedTuition = 300000;
    else if (["arts_social_management", "education", "agriculture", "management", "social"].includes(matchedFaculty)) loggedTuition = 250000;
    else if (matchedFaculty === "law") loggedTuition = 400000;

    const matchedInvoices = [
      { id: "INV-001", description: "Acceptance Fee & Clearance Token *", amount: 50000, status: "Pending", category: "Acceptance", date: "June 01, 2026" },
      { id: "INV-002", description: "Medical Examination & Health Insurance *", amount: 35000, status: "Pending", category: "Medical", date: "June 02, 2026" },
      { id: "INV-003", description: "Administrative & Matriculation Charges *", amount: 25000, status: "Pending", category: "Administrative", date: "June 03, 2026" },
      { id: "INV-004", description: "First Semester Tuition Fee (70% Upfront Requirement)", amount: 280000, status: "Pending", category: "School Fees", date: "June 04, 2026" },
      { id: "INV-005", description: "Second Installment Tuition Fee (30% Exam Balance)", amount: 120000, status: "Pending", category: "School Fees", date: "June 05, 2026" },
      { id: "INV-006", description: "Hostel Accommodation & Facilities (Optional)", amount: 260000, status: "Pending", category: "Hostel", date: "June 06, 2026" }
    ];
    setInvoices(matchedInvoices);
    localStorage.setItem("cchsmt_student_invoices", JSON.stringify(matchedInvoices));

    setIsLoggedIn(true);
    setStudentError("");
  };

  // Logout Handler
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("crestoak_session");
      localStorage.removeItem("cchsmt_user_session");
      localStorage.removeItem("cchsmt_student_profile");
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("userRole");
      sessionStorage.clear();

      window.location.href = "/login/?gateway=portal";
    }
  };

  // Course Pick Toggles
  const toggleCourseSelect = (code: string) => {
    if (registeredCourses.includes(code)) {
      setRegisteredCourses(registeredCourses.filter(c => c !== code));
    } else {
      setRegisteredCourses([...registeredCourses, code]);
    }
  };

  // Submit Courses
  const submitCourseRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (registeredCourses.length === 0) {
      alert("Please select at least one course.");
      return;
    }
    setRegistrationSubmitted(true);
  };

  // Submit IT support ticket
  const submitITSupportTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      alert("Please fill all ticket fields.");
      return;
    }

    const newTicket = {
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: ticketSubject,
      category: ticketCategory,
      message: ticketMessage,
      status: "Open",
      dateCreated: new Date().toLocaleDateString()
    };

    const updatedTickets = [newTicket, ...tickets];
    setTickets(updatedTickets);
    localStorage.setItem("cchsmt_student_tickets", JSON.stringify(updatedTickets));

    setTicketSubject("");
    setTicketMessage("");
  };

  // Submit Clearance/Transcript requests
  const submitDocumentRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const newRequest = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      type: requestType,
      status: "Pending Review",
      date: new Date().toLocaleDateString()
    };

    const updated = [newRequest, ...requestsList];
    setRequestsList(updated);
    localStorage.setItem("cchsmt_student_requests", JSON.stringify(updated));
  };

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <>
      <div className="w-full flex flex-col gap-6">
        {!isLoggedIn || !studentProfile ? (
          // LOGIN SCREEN CONTAINER
          <section className="py-24 flex justify-center items-center px-4">
            <div className="bg-white border border-slate-200 shadow-xl rounded-3xl p-8 w-full max-w-md relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-red" />
              
              <div className="flex flex-col items-center text-center gap-6 mb-8">
                <Logo size={60} showText={false} />
                <div>
                  <h3 className="font-display font-black text-2xl text-brand-blue-dark">Student Portal Login</h3>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed font-semibold">
                    Enter your Registration Number to register courses, check grades, and make Naira (₦) invoice payments.
                  </p>
                </div>
              </div>

              {studentError && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl text-xs font-bold mb-5 text-center">
                  {studentError}
                </div>
              )}

              <form onSubmit={handleLogin} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Registration Number</label>
                  <input
                    type="text"
                    placeholder="e.g. CCHMS/2026/SCS/0001"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue font-bold text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5 font-semibold">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Portal Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={studentPass}
                    onChange={(e) => setStudentPass(e.target.value)}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue font-semibold text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-brand-red hover:bg-brand-red/90 text-white font-display font-bold py-3.5 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <span>Authenticate Portal</span>
                  <Lock size={15} />
                </button>
              </form>

              <div className="mt-6 border-t border-slate-100 pt-4 text-center">
                <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                  * Note: If you don&apos;t have a registration number, apply first via the Admissions tab, or type a mock number like <strong className="text-brand-blue">CCHMS/2026/SCS/0001</strong> with any password to try the simulator.
                </p>
              </div>
            </div>
          </section>
        ) : (
          // PORTAL LOGGED IN LAYOUT
          <div className="w-full flex flex-col gap-6">
            
            {/* Quick Action Navigation Pills */}
            <div className="flex overflow-x-auto no-scrollbar whitespace-nowrap gap-2 pb-2 border-b border-slate-100">
              {[
                { id: "dashboard", label: "Dashboard Overview", icon: User },
                { id: "academics", label: "Academics & Courses", icon: BookOpen },
                { id: "billing", label: "Financial Services", icon: Wallet },
                { id: "services", label: "Student Services & Clearance", icon: HelpCircle }
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as "dashboard" | "academics" | "billing" | "services")}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      isActive
                        ? "border-brand-red bg-brand-red-light/10 text-brand-red shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-brand-blue"
                    }`}
                  >
                    <Icon size={15} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Main Content Workspace */}
            <div className="w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm min-h-[60vh]">
              
              {/* DASHBOARD TAB */}
              {activeTab === "dashboard" && (
                <div className="flex flex-col gap-8">
                  {/* Banner */}
                  <div className="bg-brand-blue text-white rounded-3xl p-6 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-brand-red/25 rounded-full blur-3xl translate-x-1/4 -translate-y-1/4" />
                    <div>
                      <span className="text-brand-gold font-bold text-xs uppercase tracking-widest">Active Semester Session</span>
                      <h3 className="font-display font-extrabold text-lg sm:text-xl mt-1">{studentProfile.semester}</h3>
                      <p className="text-slate-200 text-xs mt-1.5 font-medium">Program Level: {studentProfile.level} • Department: {studentProfile.faculty.toUpperCase()}</p>
                    </div>
                    <div className="bg-white/10 px-4 py-2.5 rounded-2xl border border-white/10 text-right shrink-0">
                      <p className="text-slate-300 text-[10px] font-bold uppercase tracking-wider">Current CGPA</p>
                      <p className="text-2xl font-black text-white mt-0.5 font-display">
                        {cgpa !== null ? cgpa : "..."}
                      </p>
                    </div>
                  </div>

                  {/* Quick Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="border border-slate-100 p-5 rounded-2xl shadow-sm bg-slate-50/50 flex flex-col justify-between h-32">
                      <div className="flex justify-between items-start">
                        <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Course Registrations</span>
                        <BookOpen className="text-brand-blue-light" size={18} />
                      </div>
                      <div>
                        <p className="text-2xl font-extrabold text-brand-blue-dark">{registrationSubmitted ? `${registeredCourses.length} Courses` : "Not Registered"}</p>
                        <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">{registrationSubmitted ? "Approved" : "Action Required"}</p>
                      </div>
                    </div>

                    <div className="border border-slate-100 p-5 rounded-2xl shadow-sm bg-slate-50/50 flex flex-col justify-between h-32">
                      <div className="flex justify-between items-start">
                        <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Fee Invoices</span>
                        <Wallet className="text-brand-red" size={18} />
                      </div>
                      <div>
                        <p className="text-2xl font-extrabold text-brand-blue-dark">
                          {formatNaira(
                            billingData?.outstandingBalance ??
                            invoices.filter(i => i.status === "Pending").reduce((acc, i) => acc + i.amount, 0)
                          )}
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">Outstanding Balance</p>
                      </div>
                    </div>

                    <div className="border border-slate-100 p-5 rounded-2xl shadow-sm bg-slate-50/50 flex flex-col justify-between h-32">
                      <div className="flex justify-between items-start">
                        <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Notices & Alerts</span>
                        <Calendar className="text-emerald-600" size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-brand-blue-dark leading-snug">Acceptance Fee Deadline is June 21</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">2 Weeks remaining</p>
                      </div>
                    </div>
                  </div>

                  {/* Academic Notices Box */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <h4 className="font-display font-extrabold text-brand-blue-dark text-xs uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">
                      Academic Announcements Hub
                    </h4>
                    
                    <div className="flex flex-col gap-4 font-semibold text-slate-600 text-xs">
                      <div className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-red mt-1.5 shrink-0" />
                        <div>
                          <p className="font-bold text-brand-blue-dark">First Semester Lecture Timetable Released</p>
                          <p className="text-slate-400 mt-0.5">Please check the Academics tab to review weekly lecture slots.</p>
                        </div>
                      </div>
                      <hr className="border-slate-100" />
                      <div className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-red mt-1.5 shrink-0" />
                        <div>
                          <p className="font-bold text-brand-blue-dark">Physical Screenings Credentials Audits</p>
                          <p className="text-slate-400 mt-0.5">Bring WAEC/NECO originals alongside passport copies to registry desks before portal access lockouts.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ACADEMICS TAB */}
              {activeTab === "academics" && (
                <div className="flex flex-col gap-6">
                  {/* Sub tabs */}
                  <div className="flex gap-4 border-b border-slate-100 pb-2 overflow-x-auto no-scrollbar whitespace-nowrap justify-start">
                    {[
                      { id: "registration", label: "Course Registration" },
                      { id: "results", label: "Results Checker" },
                      { id: "timetable", label: "Timetable View" }
                    ].map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => setActiveAcademicSubTab(sub.id as "registration" | "results" | "timetable")}
                        className={`pb-2 text-xs font-bold transition-all cursor-pointer shrink-0 ${
                          activeAcademicSubTab === sub.id
                            ? "text-brand-red border-b-2 border-brand-red font-extrabold"
                            : "text-slate-400 hover:text-brand-blue-dark"
                        }`}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>

                  {/* Course Registration picker */}
                  {activeAcademicSubTab === "registration" && (
                    <div className="flex flex-col gap-6">
                      {!registrationSubmitted ? (
                        <form onSubmit={submitCourseRegistration} className="flex flex-col gap-6">
                          <div>
                            <h4 className="font-display font-extrabold text-brand-blue-dark text-base">Select Semester Courses</h4>
                            <p className="text-slate-400 text-xs mt-1">Pick courses to register. Credit limits range between 12 to 24 units.</p>
                          </div>

                          <div className="flex flex-col gap-3">
                            {availableCourses.map((course) => {
                              const isSelected = registeredCourses.includes(course.code);
                              return (
                                <div
                                  key={course.code}
                                  onClick={() => toggleCourseSelect(course.code)}
                                  className={`flex justify-between items-center p-4 rounded-xl border transition-all cursor-pointer ${
                                    isSelected
                                      ? "border-brand-red bg-brand-red-light/10 text-brand-blue-dark"
                                      : "border-slate-150 hover:bg-slate-50 text-slate-700"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                      isSelected ? "bg-brand-red border-brand-red text-white" : "border-slate-350 bg-white"
                                    }`}>
                                      {isSelected && <Check size={10} />}
                                    </div>
                                    <div>
                                      <p className="font-bold text-xs sm:text-sm">{course.code}: {course.title}</p>
                                      <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider">{course.credits} Credits</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="border-t border-slate-150 pt-4 flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-400 uppercase">
                              Total units selected: <strong className="text-brand-blue-dark font-black font-display text-sm">{registeredCourses.reduce((acc, c) => acc + (availableCourses.find(ac => ac.code === c)?.credits || 0), 0)} Units</strong>
                            </span>
                            <button
                              type="submit"
                              className="bg-brand-red hover:bg-brand-red/90 text-white font-display font-bold px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
                            >
                              Submit Registration
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center py-10 gap-5">
                          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
                            <CheckCircle2 size={40} />
                          </div>
                          <div>
                            <h4 className="font-display font-extrabold text-brand-blue-dark text-lg">Course Schedule Approved!</h4>
                            <p className="text-slate-500 text-xs mt-1 leading-relaxed max-w-sm mx-auto font-semibold">
                              Your registered curriculum has been serialized and successfully approved. View course details inside your dashboard cards.
                            </p>
                          </div>
                          <div className="w-full max-w-sm border border-slate-100 rounded-2xl bg-slate-50 p-4 text-left font-semibold text-xs flex flex-col gap-2 text-slate-700">
                            {registeredCourses.map(c => (
                              <div key={c} className="flex justify-between items-center">
                                <span>{availableCourses.find(ac => ac.code === c)?.title}</span>
                                <span className="font-display font-bold text-brand-blue-dark">{c}</span>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() => setRegistrationSubmitted(false)}
                            className="text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-wider cursor-pointer"
                          >
                            Update Registration
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Results checker */}
                  {activeAcademicSubTab === "results" && (
                    <div className="flex flex-col gap-6">
                      <div>
                        <h4 className="font-display font-extrabold text-brand-blue-dark text-base">Results Sheet & Grades</h4>
                        <p className="text-slate-400 text-xs mt-1">Audit final grades and download official transcripts.</p>
                      </div>

                      <div className="overflow-x-auto border border-slate-150 rounded-2xl">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 font-bold uppercase tracking-wider">
                              <th className="p-3.5 px-4">Course Code</th>
                              <th className="p-3.5 px-4">Title</th>
                              <th className="p-3.5 px-4 text-center">Credits</th>
                              <th className="p-3.5 px-4 text-center">Assign (10)</th>
                              <th className="p-3.5 px-4 text-center">CA Test (20)</th>
                              <th className="p-3.5 px-4 text-center">Project (10)</th>
                              <th className="p-3.5 px-4 text-center">Exam (60)</th>
                              <th className="p-3.5 px-4 text-center">Total (100)</th>
                              <th className="p-3.5 px-4 text-center">Grade</th>
                              <th className="p-3.5 px-4 text-right">Points</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                            {dynamicResultsList.length > 0 ? (
                              dynamicResultsList.map((r: any) => (
                                <tr key={r.code} className="hover:bg-slate-50/60 transition-colors">
                                  <td className="p-3.5 px-4 font-bold text-brand-blue-dark font-mono">{r.code}</td>
                                  <td className="p-3.5 px-4">{r.title}</td>
                                  <td className="p-3.5 px-4 text-center font-display">{r.units}</td>
                                  <td className="p-3.5 px-4 text-center text-slate-500 font-mono">{r.assignment ?? 0}</td>
                                  <td className="p-3.5 px-4 text-center text-slate-500 font-mono">{r.caTest ?? 0}</td>
                                  <td className="p-3.5 px-4 text-center text-slate-500 font-mono">{r.project ?? 0}</td>
                                  <td className="p-3.5 px-4 text-center text-slate-500 font-mono">{r.exam ?? 0}</td>
                                  <td className="p-3.5 px-4 text-center font-black text-slate-900 font-mono">{r.score ?? 0}</td>
                                  <td className="p-3.5 px-4 text-center">
                                    <span className={`px-2 py-0.5 rounded font-black text-[11px] ${
                                      (r.grade === "A") ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                                      (r.grade === "B") ? "bg-blue-100 text-blue-800 border border-blue-200" :
                                      (r.grade === "C") ? "bg-amber-100 text-amber-800 border border-amber-200" :
                                      "bg-rose-100 text-rose-800 border border-rose-200"
                                    }`}>{r.grade}</span>
                                  </td>
                                  <td className="p-3.5 px-4 text-right font-display text-brand-blue-dark font-bold">
                                    {Number(r.gradePoint ?? r.gp ?? 0).toFixed(1)}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={10} className="p-8 text-center text-slate-500 font-bold uppercase tracking-wider text-xs bg-slate-50/50">
                                  No course grades published yet for this session.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 text-xs">
                        <div>
                          <p className="font-bold text-brand-blue-dark uppercase">Semester Summary</p>
                          <p className="text-slate-500 font-semibold mt-1">Total Registered: 15 Units • Earned: 15 Units • Semester GPA: 3.73</p>
                        </div>
                        <button
                          onClick={() => alert("Mock export PDF triggered.")}
                          className="bg-brand-blue hover:bg-brand-blue-dark text-white px-5 py-2.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                        >
                          <Download size={14} />
                          <span>Export Transcript</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Timetable view */}
                  {activeAcademicSubTab === "timetable" && (
                    <div className="flex flex-col gap-6">
                      <div>
                        <h4 className="font-display font-extrabold text-brand-blue-dark text-base">Weekly Class Schedule</h4>
                        <p className="text-slate-400 text-xs mt-1">Review lecture timings across departments.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                        {portalTimetableSlots.map((slot) => (
                          <div key={slot.day} className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex flex-col gap-2 font-semibold">
                            <span className="text-[10px] font-black uppercase text-brand-red tracking-wider">{slot.day}</span>
                            <p className="text-brand-blue-dark font-extrabold text-sm">{slot.course}</p>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                              <Clock size={12} />
                              <span>{slot.time}</span>
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* FINANCIAL SERVICES TAB */}
              {activeTab === "billing" && (
                <BillingClientView
                  invoices={billingData?.invoices ?? []}
                  payments={billingData?.payments ?? []}
                  studentName={billingData?.studentName ?? studentProfile.fullName}
                  matricNo={billingData?.matricNo ?? studentProfile.regNumber}
                />
              )}

              {/* STUDENT SERVICES TAB */}
              {activeTab === "services" && (
                <div className="flex flex-col gap-8">
                  {/* Support Ticketing */}
                  <div className="bg-slate-50 border border-slate-150 rounded-3xl p-6 shadow-sm">
                    <h4 className="font-display font-extrabold text-brand-blue-dark text-base mb-4 flex items-center gap-2">
                      <HelpCircle size={18} className="text-brand-red" />
                      IT Support Desk & Ticketing
                    </h4>

                    <form onSubmit={submitITSupportTicket} className="grid grid-cols-1 gap-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="font-bold text-slate-600">Ticket Category</label>
                          <select
                            value={ticketCategory}
                            onChange={(e) => setTicketCategory(e.target.value)}
                            className="p-3 bg-white border border-slate-200 rounded-xl font-bold focus:outline-none text-slate-800"
                          >
                            <option value="Academic">Academic Questions</option>
                            <option value="Billing">Fee/Invoice Queries</option>
                            <option value="IT Access">Portal Login / Device Access</option>
                            <option value="Other">General Admin Inquiries</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="font-bold text-slate-600">Ticket Subject</label>
                          <input
                            type="text"
                            placeholder="e.g. Cannot view course grade CNS 103"
                            value={ticketSubject}
                            onChange={(e) => setTicketSubject(e.target.value)}
                            className="p-3 bg-white border border-slate-200 rounded-xl font-semibold focus:outline-none text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-slate-600">Detailed Message</label>
                        <textarea
                          rows={4}
                          placeholder="Provide all details including error codes..."
                          value={ticketMessage}
                          onChange={(e) => setTicketMessage(e.target.value)}
                          className="p-3 bg-white border border-slate-200 rounded-xl font-medium focus:outline-none text-slate-800"
                        />
                      </div>

                      <div className="text-right">
                        <button
                          type="submit"
                          className="bg-brand-red hover:bg-brand-red/90 text-white font-display font-bold px-6 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ml-auto"
                        >
                          <Send size={14} />
                          <span>Submit Ticket</span>
                        </button>
                      </div>
                    </form>

                    {/* Active Tickets List */}
                    {tickets.length > 0 && (
                      <div className="mt-6 border-t border-slate-200/60 pt-4 flex flex-col gap-3 text-xs">
                        <p className="font-black text-slate-400 uppercase tracking-widest mb-1">Filed Tickets ({tickets.length})</p>
                        {tickets.map(t => (
                          <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between items-center font-semibold text-slate-700">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-slate-100 text-slate-500 rounded-xl shrink-0 mt-0.5">
                                <Clock size={16} />
                              </div>
                              <div>
                                <p className="font-bold text-brand-blue-dark">{t.subject} ({t.id})</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">Category: {t.category} • Created: {t.dateCreated}</p>
                              </div>
                            </div>
                            <span className="bg-brand-red-light text-brand-red px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-extrabold">
                              {t.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Document Requests Clearance */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
                    <h4 className="font-display font-extrabold text-brand-blue-dark text-base border-b border-slate-100 pb-3">
                      Academic Clearances & Transcripts Requests
                    </h4>

                    <form onSubmit={submitDocumentRequest} className="flex flex-col sm:flex-row gap-4 items-end text-xs">
                      <div className="flex flex-col gap-1 flex-grow">
                        <label className="font-bold text-slate-600">Request Document Type</label>
                        <select
                          value={requestType}
                          onChange={(e) => setRequestType(e.target.value)}
                          className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none text-slate-800"
                        >
                          <option value="transcript">Official Academic Transcript (₦5,000 Processing)</option>
                          <option value="clearance">Graduation Clearance Slip</option>
                          <option value="id_card">Student ID Card Replacement (₦2,000 Processing)</option>
                          <option value="hostel">Hostel Accommodation Re-allocation</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="bg-brand-blue hover:bg-brand-blue-dark text-white px-6 py-3.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                      >
                        <Plus size={15} />
                        <span>Submit Request</span>
                      </button>
                    </form>

                    {requestsList.length > 0 && (
                      <div className="flex flex-col gap-2.5 text-xs font-semibold">
                        <p className="font-black text-slate-400 uppercase tracking-widest mb-1">Active Requests</p>
                        {requestsList.map(req => (
                          <div key={req.id} className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl flex justify-between items-center text-slate-700">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse" />
                              <span className="capitalize">{req.type.replace("_", " ")} ({req.id})</span>
                            </div>
                            <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-black uppercase tracking-wider text-[9px]">{req.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>

    </>
  );
}
