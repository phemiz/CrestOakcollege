"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Wallet, 
  Calendar, 
  FileText, 
  Save, 
  Plus, 
  Trash2, 
  UserCheck, 
  RefreshCw,
  Award,
  BookOpen
} from "lucide-react";

export default function AdminCMS() {
  const [activeTab, setActiveTab] = useState<"admissions" | "fees" | "news" | "applications">("admissions");

  // CMS States
  const [sessionName, setSessionName] = useState("2025/2026");
  const [jambCutoff, setJambCutoff] = useState("140");
  const [deadlineText, setDeadlineText] = useState("Admission in Progress 2025/2026 Session");

  // Fees State
  const [feesData, setFeesData] = useState({
    healthTuition: 135000,
    socialTuition: 95000,
    naturalTuition: 105000,
    lawTuition: 180000,
    artsTuition: 90000,
    agricTuition: 85000,
    applicationFee: 10000,
    acceptanceFee: 20000
  });

  // Applications list from admissions
  const [submittedApps, setSubmittedApps] = useState<any[]>([]);

  // News states
  const [newsList, setNewsList] = useState<any[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [newAlert, setNewAlert] = useState("New");

  // Loading indicator
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Load config from localStorage
    const savedSession = localStorage.getItem("cchsmt_cms_session");
    if (savedSession) setSessionName(savedSession);

    const savedCutoff = localStorage.getItem("cchsmt_cms_jamb_cutoff");
    if (savedCutoff) setJambCutoff(savedCutoff);

    const savedDeadline = localStorage.getItem("cchsmt_cms_deadline_text");
    if (savedDeadline) setDeadlineText(savedDeadline);

    // Load fees
    const savedFees = localStorage.getItem("cchsmt_cms_fees");
    if (savedFees) {
      try {
        setFeesData(JSON.parse(savedFees));
      } catch (e) {
        console.error(e);
      }
    }

    // Load applications
    const savedAppsStr = localStorage.getItem("cchsmt_submitted_applications") || "[]";
    try {
      setSubmittedApps(JSON.parse(savedAppsStr));
    } catch (e) {
      setSubmittedApps([]);
    }

    // Load news
    const defaultNews = [
      { id: 1, title: "2025/2026 Admissions Screening Dates Released", desc: "First batch entrance screenings and interviews will commence at the Badagry campus.", category: "Screening", alert: "Urgent", date: "June 15, 2026" },
      { id: 2, title: "Academic Affiliation Review by Atiba University Board", desc: "A delegation from Atiba University visited CCHSMT laboratories to certify the curriculum.", category: "Affiliation", alert: "Update", date: "June 02, 2026" }
    ];
    const savedNews = localStorage.getItem("cchsmt_cms_news");
    if (savedNews) {
      try {
        setNewsList(JSON.parse(savedNews));
      } catch (e) {
        setNewsList(defaultNews);
      }
    } else {
      setNewsList(defaultNews);
    }
  }, []);

  // Save General Admissions details
  const saveAdmissionsConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("cchsmt_cms_session", sessionName);
    localStorage.setItem("cchsmt_cms_jamb_cutoff", jambCutoff);
    localStorage.setItem("cchsmt_cms_deadline_text", deadlineText);
    triggerSuccessIndicator();
  };

  // Save Fee updates
  const saveFeesConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("cchsmt_cms_fees", JSON.stringify(feesData));
    
    // Also modify outstanding template invoices for students portal
    const defaultInvoices = [
      { id: "INV-001", description: "Acceptance Fee", amount: Number(feesData.acceptanceFee), status: "Pending", category: "Acceptance", date: "June 01, 2026" },
      { id: "INV-002", description: "First Semester School Fees", amount: Number(feesData.healthTuition), status: "Pending", category: "School Fees", date: "June 02, 2026" },
      { id: "INV-003", description: "Examination & Practical Assessment", amount: 15000, status: "Pending", category: "Examination", date: "June 03, 2026" },
      { id: "INV-004", description: "Hostel Accommodation Fee (Optional)", amount: 50000, status: "Pending", category: "Hostel", date: "June 04, 2026" }
    ];
    localStorage.setItem("cchsmt_student_invoices", JSON.stringify(defaultInvoices));
    
    triggerSuccessIndicator();
  };

  // Add news post
  const addNewsPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) {
      alert("Please fill in news credentials.");
      return;
    }

    const post = {
      id: Date.now(),
      title: newTitle,
      desc: newDesc,
      category: newCategory,
      alert: newAlert,
      date: new Date().toLocaleDateString()
    };

    const updated = [post, ...newsList];
    setNewsList(updated);
    localStorage.setItem("cchsmt_cms_news", JSON.stringify(updated));

    setNewTitle("");
    setNewDesc("");
    triggerSuccessIndicator();
  };

  // Delete news post
  const deleteNewsPost = (id: number) => {
    const updated = newsList.filter(n => n.id !== id);
    setNewsList(updated);
    localStorage.setItem("cchsmt_cms_news", JSON.stringify(updated));
  };

  // Update Application status (Approve/Reject)
  const updateApplicationStatus = (regNum: string, newStatus: string) => {
    const updated = submittedApps.map(app => {
      if (app.regNumber === regNum) {
        return { ...app, status: newStatus };
      }
      return app;
    });

    setSubmittedApps(updated);
    localStorage.setItem("cchsmt_submitted_applications", JSON.stringify(updated));
    triggerSuccessIndicator();
  };

  const triggerSuccessIndicator = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <>
      <Header />

      <main className="flex-grow bg-slate-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          
          {/* Admin Header */}
          <div className="bg-brand-blue-dark text-white rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:3rem_3rem]" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 bg-brand-red text-white rounded-2xl">
                <ShieldCheck size={28} />
              </div>
              <div>
                <h2 className="font-display font-black text-xl sm:text-2xl leading-tight">Admin CMS Console</h2>
                <p className="text-slate-400 text-xs mt-1 font-semibold">CrestOak College website administration and content adjustments dashboard.</p>
              </div>
            </div>
            {saveSuccess && (
              <div className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 relative z-10 shadow-lg">
                <ShieldCheck size={14} />
                <span>Changes Serialized!</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Sidebar navigation */}
            <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col gap-2">
              {[
                { id: "admissions", label: "Admissions Setup", icon: Calendar },
                { id: "fees", label: "School Fees Setup", icon: Wallet },
                { id: "news", label: "News & Alerts Publisher", icon: FileText },
                { id: "applications", label: "Manage Applications", icon: UserCheck }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? "border-brand-red bg-brand-red-light/10 text-brand-red shadow-sm"
                        : "border-transparent text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* CMS Workspaces */}
            <div className="lg:col-span-9 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm min-h-[50vh]">
              
              {/* ADMISSIONS TAB */}
              {activeTab === "admissions" && (
                <form onSubmit={saveAdmissionsConfig} className="flex flex-col gap-6 text-xs font-semibold text-slate-600">
                  <div>
                    <h3 className="font-display font-extrabold text-brand-blue-dark text-base">Admissions & Session Parameters</h3>
                    <p className="text-slate-400 text-xs mt-1">Configure session labels, cutoffs, and header scroll alerts.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label>Academic Session Label</label>
                      <input
                        type="text"
                        value={sessionName}
                        onChange={(e) => setSessionName(e.target.value)}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue text-slate-800 font-bold"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label>JAMB Cut-Off Mark Threshold</label>
                      <input
                        type="number"
                        value={jambCutoff}
                        onChange={(e) => setJambCutoff(e.target.value)}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue text-slate-800 font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label>Scrollbar Alert Announcement Banner Text</label>
                    <input
                      type="text"
                      value={deadlineText}
                      onChange={(e) => setDeadlineText(e.target.value)}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue text-slate-800 font-bold"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-brand-blue hover:bg-brand-blue-dark text-white font-display font-bold py-3.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 mt-4 shadow-md w-fit px-6"
                  >
                    <Save size={14} />
                    <span>Save Parameters</span>
                  </button>
                </form>
              )}

              {/* FEES TAB */}
              {activeTab === "fees" && (
                <form onSubmit={saveFeesConfig} className="flex flex-col gap-6 text-xs font-semibold text-slate-600">
                  <div>
                    <h3 className="font-display font-extrabold text-brand-blue-dark text-base">Naira (₦) Fees & Invoices Schedules</h3>
                    <p className="text-slate-400 text-xs mt-1">Modify session tuition amounts. When saved, new tuition indices automatically overwrite portal invoicing grids.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label>Applied Health Sciences Tuition (₦)</label>
                      <input
                        type="number"
                        value={feesData.healthTuition}
                        onChange={(e) => setFeesData({ ...feesData, healthTuition: Number(e.target.value) })}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue text-slate-800 font-bold"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label>Social & Management Sciences Tuition (₦)</label>
                      <input
                        type="number"
                        value={feesData.socialTuition}
                        onChange={(e) => setFeesData({ ...feesData, socialTuition: Number(e.target.value) })}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue text-slate-800 font-bold"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label>Natural & Applied Sciences Tuition (₦)</label>
                      <input
                        type="number"
                        value={feesData.naturalTuition}
                        onChange={(e) => setFeesData({ ...feesData, naturalTuition: Number(e.target.value) })}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue text-slate-800 font-bold"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label>Faculty of Law LL.B Tuition (₦)</label>
                      <input
                        type="number"
                        value={feesData.lawTuition}
                        onChange={(e) => setFeesData({ ...feesData, lawTuition: Number(e.target.value) })}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue text-slate-800 font-bold"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label>Application Processing Fee (₦)</label>
                      <input
                        type="number"
                        value={feesData.applicationFee}
                        onChange={(e) => setFeesData({ ...feesData, applicationFee: Number(e.target.value) })}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue text-slate-800 font-bold"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label>Acceptance Offer Fee (₦)</label>
                      <input
                        type="number"
                        value={feesData.acceptanceFee}
                        onChange={(e) => setFeesData({ ...feesData, acceptanceFee: Number(e.target.value) })}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue text-slate-800 font-bold"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-brand-blue hover:bg-brand-blue-dark text-white font-display font-bold py-3.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 mt-4 shadow-md w-fit px-6"
                  >
                    <Save size={14} />
                    <span>Apply Fee Updates</span>
                  </button>
                </form>
              )}

              {/* NEWS PUBLISHER */}
              {activeTab === "news" && (
                <div className="flex flex-col gap-8 text-xs font-semibold text-slate-600">
                  <form onSubmit={addNewsPost} className="flex flex-col gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-150">
                    <h4 className="font-display font-extrabold text-brand-blue-dark text-sm mb-2">Publish New Announcement</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label>Post Headline Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Post-UTME Entrance Examination Schedules"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          className="p-3 bg-white border border-slate-200 rounded-xl focus:outline-none text-slate-800 font-semibold"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label>Category Label</label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="p-3 bg-white border border-slate-200 rounded-xl focus:outline-none text-slate-800 font-bold"
                        >
                          <option value="Screening">Admissions Screening</option>
                          <option value="Finance">Tuition & Financials</option>
                          <option value="Affiliation">Atiba Affiliation</option>
                          <option value="Clinical">Clinical Placements</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label>Brief Announcement Summary</label>
                        <input
                          type="text"
                          placeholder="Provide details about dates, documents needed..."
                          value={newDesc}
                          onChange={(e) => setNewDesc(e.target.value)}
                          className="p-3 bg-white border border-slate-200 rounded-xl focus:outline-none text-slate-800 font-semibold"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label>Urgency Alert Level</label>
                        <select
                          value={newAlert}
                          onChange={(e) => setNewAlert(e.target.value)}
                          className="p-3 bg-white border border-slate-200 rounded-xl focus:outline-none text-slate-800 font-bold"
                        >
                          <option value="Urgent">Urgent Action Required</option>
                          <option value="Update">General Update</option>
                          <option value="New Partnership">New Partnership</option>
                          <option value="Portal Alert">Portal Warning</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="bg-brand-red hover:bg-brand-red/90 text-white font-display font-bold py-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 w-fit px-5 mt-2"
                    >
                      <Plus size={14} />
                      <span>Publish Article</span>
                    </button>
                  </form>

                  {/* Existing News list */}
                  <div>
                    <h4 className="font-display font-extrabold text-brand-blue-dark text-sm mb-4">Published Articles ({newsList.length})</h4>
                    <div className="flex flex-col gap-3">
                      {newsList.map(item => (
                        <div
                          key={item.id}
                          className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between items-center text-xs text-slate-700"
                        >
                          <div>
                            <p className="font-bold text-brand-blue-dark">{item.title}</p>
                            <p className="text-[10px] text-slate-400 mt-1 font-bold">Category: {item.category} • Date: {item.date} • Alert: {item.alert}</p>
                          </div>
                          <button
                            onClick={() => deleteNewsPost(item.id)}
                            className="text-red-500 hover:text-red-700 p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* MANAGE APPLICATIONS */}
              {activeTab === "applications" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-display font-extrabold text-brand-blue-dark text-base">Candidate Admission Audit pipeline</h3>
                    <p className="text-slate-400 text-xs mt-1">Review active applications submitted via the online admissions form. Approve to offer admission letter credentials immediately.</p>
                  </div>

                  {submittedApps.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {submittedApps.map((app) => (
                        <div
                          key={app.regNumber}
                          className="bg-slate-50 border border-slate-150 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs font-semibold text-slate-700"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-display font-extrabold text-sm text-brand-blue-dark">{app.fullName}</span>
                              <span className="bg-brand-red-light text-brand-red text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                                {app.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">ID: {app.regNumber} • Faculty: {app.faculty.toUpperCase()} • JAMB Score: {app.jambScore} • Date: {app.dateSubmitted}</p>
                          </div>

                          <div className="flex gap-2">
                            {app.status === "Submitted" && (
                              <button
                                onClick={() => updateApplicationStatus(app.regNumber, "Screened")}
                                className="bg-brand-blue hover:bg-brand-blue-dark text-white px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer"
                              >
                                Certify Credentials
                              </button>
                            )}
                            {app.status === "Screened" && (
                              <button
                                onClick={() => updateApplicationStatus(app.regNumber, "Interviewed")}
                                className="bg-brand-blue hover:bg-brand-blue-dark text-white px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer"
                              >
                                Confirm Interview Completion
                              </button>
                            )}
                            {app.status === "Interviewed" && (
                              <button
                                onClick={() => updateApplicationStatus(app.regNumber, "Decided")}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer flex items-center gap-1"
                              >
                                <UserCheck size={12} />
                                <span>Approve Admission Offer</span>
                              </button>
                            )}
                            {["Decided", "Accepted", "Paid"].includes(app.status) ? (
                              <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider">
                                Offer Dispatched
                              </span>
                            ) : (
                              <button
                                onClick={() => updateApplicationStatus(app.regNumber, "Rejected")}
                                className="text-slate-400 hover:text-red-600 px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer"
                              >
                                Decline Admission
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-16 border border-dashed border-slate-200 rounded-3xl text-center text-slate-400 font-bold text-xs uppercase tracking-widest bg-slate-50">
                      Awaiting candidates submission records.
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
