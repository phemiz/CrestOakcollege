"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
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
  Loader2
} from "lucide-react";

interface ApplicationItem {
  id: string;
  applicationNo: string;
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | string;
  paymentStatus?: "PENDING" | "PAID" | "FAILED" | string;
  createdAt: Date | string;
  applicant: {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
  };
  programme: {
    id?: string;
    name: string;
    code?: string;
    degreeAwarded?: string;
  };
  documents?: {
    id: string;
    documentName: string;
    documentUrl: string;
  }[];
  screeningSchedule?: {
    screeningDate: Date | string;
    venue: string;
    status: string;
    notes?: string | null;
  } | null;
}

interface AdmissionsClientProps {
  applications: ApplicationItem[];
}

export default function AdmissionsClient({ applications: initialApps }: AdmissionsClientProps) {
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationItem[]>(initialApps);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);

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
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/admissions.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: id, decision })
      });
      const data = await res.json();
      if (data.success) {
        setApplications((prev) =>
          prev.map((app) => (app.id === id ? { ...app, status: decision } : app))
        );
        setSelectedApp(null);
        router.refresh();
      } else {
        alert("Operation failed: " + (data.message || "Failed"));
      }
    } catch (err: any) {
      alert("Decision error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-black text-slate-900">Admissions Desk</h2>
          <p className="text-xs text-slate-500 mt-1">Review, screen, and process candidate applications for CrestOak College in real time.</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="md:col-span-8 relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate by name, application tracking number, or programme..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
          />
        </div>
        <div className="md:col-span-4">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors cursor-pointer"
          >
            <option value="ALL">All Application Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Declined</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {paginatedApps.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs text-slate-800">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-5">Tracking No</th>
                  <th className="py-3.5 px-5">Applicant Name</th>
                  <th className="py-3.5 px-5">Target Programme</th>
                  <th className="py-3.5 px-5">Submitted Date</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-900">{app.applicationNo}</td>
                    <td className="py-3.5 px-5 font-semibold text-slate-900">
                      {app.applicant.firstName} {app.applicant.lastName}
                      <span className="block text-[11px] text-slate-500 font-normal mt-0.5">
                        {app.applicant.email}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-700 font-medium">{app.programme.name}</td>
                    <td className="py-3.5 px-5 text-slate-500 font-medium">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          app.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : app.status === "REJECTED"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {app.status === "APPROVED" ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : app.status === "REJECTED" ? (
                          <XCircle className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        <span>{app.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="p-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition-all cursor-pointer shadow-xs"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      {app.status !== "APPROVED" && (
                        <button
                          disabled={isSubmitting}
                          onClick={() => handleDecision(app.id, "APPROVED")}
                          className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {app.status !== "REJECTED" && (
                        <button
                          disabled={isSubmitting}
                          onClick={() => handleDecision(app.id, "REJECTED")}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-500 font-bold uppercase tracking-widest text-xs bg-white">
            No applications found matching search filter.
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-5 py-3.5 border-t border-slate-200 text-xs font-bold text-slate-600 bg-slate-50">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((c) => Math.max(c - 1, 1))}
                className="p-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((c) => Math.min(c + 1, totalPages))}
                className="p-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Application Detail View Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white sticky top-0 z-10">
              <div>
                <h3 className="font-display font-black text-sm tracking-widest uppercase text-slate-900">
                  Application Dossier Review
                </h3>
                <p className="text-[10px] font-mono text-slate-500">{selectedApp.applicationNo}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs text-slate-800">
              {/* Applicant Info Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-display font-bold text-slate-900 uppercase text-[11px] tracking-wider">Candidate Bio</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Full Name</span>
                    <strong className="text-slate-900 font-semibold">{selectedApp.applicant.firstName} {selectedApp.applicant.lastName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Email</span>
                    <strong className="text-slate-900 font-semibold">{selectedApp.applicant.email}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Phone</span>
                    <strong className="text-slate-900 font-semibold">{selectedApp.applicant.phoneNumber || "Not provided"}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Programme Choice</span>
                    <strong className="text-slate-900 font-semibold">{selectedApp.programme.name}</strong>
                  </div>
                </div>
              </div>

              {/* Action Decisions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="bg-white hover:bg-slate-100 border border-slate-300 px-5 py-2.5 rounded-xl text-slate-700 font-bold cursor-pointer"
                >
                  Close
                </button>
                {selectedApp.status !== "APPROVED" && (
                  <button
                    disabled={isSubmitting}
                    onClick={() => handleDecision(selectedApp.id, "APPROVED")}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    <span>Approve Admission</span>
                  </button>
                )}
                {selectedApp.status !== "REJECTED" && (
                  <button
                    disabled={isSubmitting}
                    onClick={() => handleDecision(selectedApp.id, "REJECTED")}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                    <span>Decline Application</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
