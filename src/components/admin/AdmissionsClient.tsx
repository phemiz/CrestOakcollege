"use client";

import React, { useState, useTransition } from "react";
import { processApplicationDecision } from "@/app/actions/admin-actions";
import { adminUpdateScreening } from "@/app/actions/admissions-actions";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
  X,
  FileText,
  Calendar,
  Save,
  Download
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ApplicationItem {
  id: string;
  applicationNo: string;
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  createdAt: Date;
  applicant: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
  };
  programme: {
    name: string;
    code: string;
  };
  documents: {
    id: string;
    documentName: string;
    documentUrl: string;
  }[];
  screening?: {
    screeningDate: Date;
    venue: string;
    status: string;
    notes: string | null;
  } | null;
}

interface AdmissionsClientProps {
  applications: ApplicationItem[];
}

export default function AdmissionsClient({ applications }: AdmissionsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);

  // Screening form states
  const [screeningStatus, setScreeningStatus] = useState("COMPLETED");
  const [screeningNotes, setScreeningNotes] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter and search logic
  const filteredApps = applications.filter((app) => {
    const fullName = `${app.applicant.firstName} ${app.applicant.lastName}`.toLowerCase();
    const searchMatch =
      fullName.includes(searchTerm.toLowerCase()) ||
      app.applicationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.programme.name.toLowerCase().includes(searchTerm.toLowerCase());

    const statusMatch = statusFilter === "ALL" || app.status === statusFilter;

    return searchMatch && statusMatch;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedApps = filteredApps.slice(startIndex, startIndex + itemsPerPage);

  const handleDecision = async (id: string, decision: "APPROVED" | "REJECTED") => {
    startTransition(async () => {
      const res = await processApplicationDecision(id, decision);
      if (res.success) {
        setSelectedApp(null);
        router.refresh();
      } else {
        alert("Operation failed: " + res.error);
      }
    });
  };

  const handleUpdateScreening = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    startTransition(async () => {
      const res = await adminUpdateScreening({
        applicationId: selectedApp.id,
        status: screeningStatus as any,
        notes: screeningNotes
      });

      if (res.success) {
        alert("Screening status updated successfully!");
        setSelectedApp(null);
        router.refresh();
      } else {
        alert("Failed to update screening: " + res.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-black text-white text-left uppercase tracking-wider">Admissions Management</h2>
          <p className="text-xs text-slate-400 mt-1">Screen candidate dossiers, audit entrance exams, and dispatch offer letters.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="md:col-span-8 relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search candidates by name, application number, or programme..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-850 rounded-xl text-xs font-semibold text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-red-600 transition-colors"
          />
        </div>
        <div className="md:col-span-4 flex gap-2">
          <div className="relative flex-1">
            <Filter className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-8 py-3 bg-slate-900 border border-slate-850 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:border-red-600 transition-colors appearance-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved (Admitted)</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dual Panel Layout: List and Preview details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main List */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Candidates List ({filteredApps.length})
          </h3>

          {paginatedApps.length > 0 ? (
            <div className="space-y-3">
              {paginatedApps.map((app) => (
                <div
                  key={app.id}
                  onClick={() => {
                    setSelectedApp(app);
                    setScreeningStatus(app.screening?.status || "COMPLETED");
                    setScreeningNotes(app.screening?.notes || "");
                  }}
                  className={`bg-slate-900/60 border p-4 rounded-xl cursor-pointer transition-all hover:bg-slate-900 flex justify-between items-center ${
                    selectedApp?.id === app.id ? "border-red-500 bg-slate-900" : "border-slate-850"
                  }`}
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200 truncate">
                        {app.applicant.firstName} {app.applicant.lastName}
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                          app.status === "APPROVED"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-900/30"
                            : app.status === "REJECTED"
                            ? "bg-rose-950 text-rose-400 border border-rose-900/30"
                            : app.status === "UNDER_REVIEW"
                            ? "bg-amber-950 text-amber-400 border border-amber-900/30"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">
                      App No: <strong className="text-slate-300">{app.applicationNo}</strong> • Programme: {app.programme.code}
                    </p>
                  </div>
                  <Eye className="h-4.5 w-4.5 text-slate-500 hover:text-slate-200 transition-colors" />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 border border-dashed border-slate-850 rounded-xl text-center text-slate-500 font-bold uppercase tracking-widest text-[11px] bg-slate-900/10">
              No applications match criteria.
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center pt-4 border-t border-slate-850 text-xs font-bold text-slate-400">
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((c) => Math.max(c - 1, 1))}
                  className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((c) => Math.min(c + 1, totalPages))}
                  className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Application Sidebar Preview */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-5 min-h-[300px]">
          {selectedApp ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                  Dossier Preview
                </h3>
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 space-y-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Candidate Name</span>
                    <p className="text-sm font-bold text-white mt-0.5">
                      {selectedApp.applicant.firstName} {selectedApp.applicant.lastName}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Application No</span>
                      <p className="text-xs font-semibold text-slate-200 mt-0.5">{selectedApp.applicationNo}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Course Enrolling</span>
                      <p className="text-xs font-semibold text-slate-200 mt-0.5">{selectedApp.programme.name}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Email Address</span>
                      <p className="text-xs font-semibold text-slate-200 mt-0.5 truncate">{selectedApp.applicant.email}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Phone Number</span>
                      <p className="text-xs font-semibold text-slate-200 mt-0.5">{selectedApp.applicant.phoneNumber || "—"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Application Payment</span>
                      <p className="text-xs font-semibold text-slate-200 mt-0.5 flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${selectedApp.paymentStatus === "PAID" ? "bg-emerald-500" : "bg-amber-500"}`} />
                        <span>{selectedApp.paymentStatus}</span>
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Submission Date</span>
                      <p className="text-xs font-semibold text-slate-200 mt-0.5">
                        {new Date(selectedApp.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents List */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Uploaded Dossiers ({selectedApp.documents.length})</span>
                {selectedApp.documents.length > 0 ? (
                  <div className="space-y-2">
                    {selectedApp.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex justify-between items-center bg-slate-900 border border-slate-850 px-3 py-2.5 rounded-xl text-[11px] text-slate-250 font-semibold"
                      >
                        <span className="truncate max-w-[180px]">{doc.documentName}</span>
                        <a
                          href={doc.documentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-red-400 hover:text-white transition-colors flex items-center gap-1 text-[10px] uppercase font-bold"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>View</span>
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl text-center text-slate-500 font-bold">
                    No files uploaded.
                  </div>
                )}
              </div>

              {/* Screening Scheduling Reviews Form */}
              {selectedApp.screening && (
                <form onSubmit={handleUpdateScreening} className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-850 text-xs text-slate-350">
                  <h4 className="font-display font-extrabold text-[10px] text-indigo-400 uppercase tracking-widest leading-none flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Entrance Exam Review</span>
                  </h4>
                  <div className="text-[10px] space-y-1">
                    <p>Date: <strong className="text-slate-200">{new Date(selectedApp.screening.screeningDate).toLocaleString()}</strong></p>
                    <p>Venue: <strong className="text-slate-200">{selectedApp.screening.venue}</strong></p>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider">Attendance Status</label>
                    <select
                      value={screeningStatus}
                      onChange={(e) => setScreeningStatus(e.target.value)}
                      className="p-2.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 font-bold"
                    >
                      <option value="PENDING">Pending Exam</option>
                      <option value="COMPLETED">Attended / Passed</option>
                      <option value="MISSED">Absent / Missed Slot</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Screening Notes</label>
                    <input
                      type="text"
                      value={screeningNotes}
                      onChange={(e) => setScreeningNotes(e.target.value)}
                      placeholder="e.g. Scored 78% in interview, certified fit."
                      className="p-2.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-display font-bold py-2 rounded-lg transition-colors cursor-pointer text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-md shadow-indigo-900/10"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{isPending ? "Saving..." : "Update Screening Info"}</span>
                  </button>
                </form>
              )}

              {/* Action Buttons */}
              {selectedApp.status !== "APPROVED" && selectedApp.status !== "REJECTED" ? (
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Decision Panel</span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      disabled={isPending}
                      onClick={() => handleDecision(selectedApp.id, "APPROVED")}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs shadow-md shadow-emerald-900/10"
                    >
                      <Check className="h-4 w-4" />
                      <span>{isPending ? "Processing..." : "Admit Candidate"}</span>
                    </button>
                    <button
                      disabled={isPending}
                      onClick={() => handleDecision(selectedApp.id, "REJECTED")}
                      className="bg-slate-900 border border-slate-800 hover:bg-red-950/40 hover:text-red-400 hover:border-red-900/30 disabled:opacity-50 text-slate-300 font-bold py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs"
                    >
                      <X className="h-4 w-4" />
                      <span>{isPending ? "Processing..." : "Reject Offer"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-850 flex items-center gap-3 text-xs text-slate-400 font-semibold">
                  <UserCheck className="h-5 w-5 text-slate-400 shrink-0" />
                  <span>This application decision has already been finalized and cannot be modified.</span>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-16">
              <Clock className="h-8 w-8 mb-3 text-slate-650" />
              <p className="text-xs font-bold uppercase tracking-wider">No dossier selected</p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">Select a candidate from the list to preview details and make decisions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
