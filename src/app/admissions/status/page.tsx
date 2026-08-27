"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Search, 
  CheckCircle, 
  Clock, 
  XCircle, 
  FileText, 
  AlertCircle, 
  Download, 
  ArrowRight,
  ShieldCheck,
  Building,
  User,
  BookOpen
} from "lucide-react";

interface ApplicationRecord {
  appNo: string;
  fullName: string;
  email: string;
  phone: string;
  faculty: string;
  course: string;
  status: "pending" | "approved" | "rejected";
  dateSubmitted: string;
}

export default function ApplicationStatusPage() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [record, setRecord] = useState<ApplicationRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    setIsLoading(true);
    setErrorMessage(null);
    setRecord(null);

    try {
      const response = await fetch(`/api/admissions/status.php?query=${encodeURIComponent(cleanQuery)}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.record) {
          setRecord(data.record);
        } else {
          setErrorMessage(data.message || "No application found matching that Application ID or Phone Number.");
        }
      } else {
        setErrorMessage("We couldn't verify status right now. Please try again shortly.");
      }
    } catch (err) {
      console.warn("Backend status API call error:", err);
      setErrorMessage("We couldn't verify status right now. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            PROVISIONALLY ADMITTED
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-4 h-4 text-rose-600" />
            NOT ADMITTED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-4 h-4 text-amber-600" />
            UNDER REVIEW / PENDING
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold tracking-widest text-emerald-700 uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            Admissions Portal
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Check Application Status
          </h1>
          <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
            Enter your Application ID (e.g. CCHSMT-2026-8205) or the phone number used during registration to verify your admission status.
          </p>
        </div>

        {/* SEARCH FORM */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="query" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Application ID or Phone Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="query"
                  placeholder="e.g. CCHSMT-2026-8205 or 08012345678"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                  required
                />
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying Status...
                </>
              ) : (
                <>
                  Verify Application Status
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* STATUS RECORD CARD */}
        {record && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden space-y-6 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <span className="text-xs font-mono text-slate-500 block uppercase">Application ID</span>
                <span className="text-xl font-bold text-slate-900">{record.appNo}</span>
              </div>
              <div>{getStatusBadge(record.status)}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div className="space-y-1">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Applicant Name
                </span>
                <p className="font-semibold text-slate-800">{record.fullName}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" /> Faculty
                </span>
                <p className="font-semibold text-slate-800">{record.faculty}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" /> Programme / Course
                </span>
                <p className="font-semibold text-slate-800">{record.course}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" /> Date Submitted
                </span>
                <p className="font-semibold text-slate-800">{record.dateSubmitted || "N/A"}</p>
              </div>
            </div>

            {/* ACTION FOOTER ACCORDING TO STATUS */}
            {record.status === "approved" && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900">Congratulations!</h4>
                    <p className="text-xs text-emerald-800 mt-1">
                      You have been provisionally admitted to CrestOak College of Health Sciences & Technology. Download your admission letter below for payment instructions.
                    </p>
                  </div>
                </div>
                <div className="pt-2">
                  <Link
                    href={`/admissions/portal/letter?appNo=${encodeURIComponent(record.appNo)}`}
                    className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Admission Letter
                  </Link>
                </div>
              </div>
            )}

            {record.status === "pending" && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3 text-xs text-amber-800">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-900 text-sm">Application Under Review</h4>
                  <p className="mt-1">
                    Your application is currently being evaluated by the Admissions Board. Please check back periodically or contact the Admissions Office if you require assistance.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ERROR / NOT FOUND STATE */}
        {!isLoading && !record && errorMessage && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3 shadow-md">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-800">{errorMessage}</p>
            <p className="text-xs text-slate-500">
              Please double-check your Application ID or Phone Number and try again.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
