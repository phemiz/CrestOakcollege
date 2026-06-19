"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { scheduleScreening } from "@/app/actions/admissions-actions";
import {
  FileText,
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  XCircle,
  Mail,
  MessageSquare,
  AlertCircle,
  Printer,
  ChevronRight,
  BookOpen,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

interface NotificationLog {
  id: string;
  type: string;
  recipient: string;
  subject: string | null;
  message: string;
  createdAt: Date;
}

interface ApplicationData {
  id: string;
  applicationNo: string;
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  programme: {
    name: string;
    code: string;
    degreeAwarded: string;
  };
  screening?: {
    screeningDate: Date;
    venue: string;
    status: string;
    notes: string | null;
  } | null;
  admission?: {
    status: string;
    admittedAt: Date;
  } | null;
}

interface ApplicantDashboardClientProps {
  application: ApplicationData | null;
  notificationLogs: NotificationLog[];
}

export default function ApplicantDashboardClient({
  application,
  notificationLogs
}: ApplicantDashboardClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Booking states
  const [selectedDate, setSelectedDate] = useState("2026-06-25T10:00");
  const [selectedVenue, setSelectedVenue] = useState("College Main Hall A");

  // Tab state for notification logs
  const [activeLogTab, setActiveLogTab] = useState<"EMAIL" | "SMS">("EMAIL");

  const handleBookScreening = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application) return;

    startTransition(async () => {
      const res = await scheduleScreening({
        applicationId: application.id,
        screeningDate: new Date(selectedDate),
        venue: selectedVenue
      });

      if (res.success) {
        router.refresh();
      } else {
        alert("Booking failed: " + res.error);
      }
    });
  };

  // Get status steps
  const steps = [
    { label: "Draft Saved", status: "DRAFT", desc: "Application is in draft." },
    { label: "Submitted", status: "SUBMITTED", desc: "Registry checking credentials." },
    { label: "Screening", status: "UNDER_REVIEW", desc: "Entrance screening and reviews." },
    { label: "Decision", status: "APPROVED", desc: "Final admissions decision." }
  ];

  const getCurrentStepIndex = () => {
    if (!application) return -1;
    if (application.status === "DRAFT") return 0;
    if (application.status === "SUBMITTED") return 1;
    if (application.status === "UNDER_REVIEW") return 2;
    if (application.status === "APPROVED" || application.status === "REJECTED") return 3;
    return -1;
  };

  const currentStepIndex = getCurrentStepIndex();

  const filteredLogs = notificationLogs.filter(log => log.type === activeLogTab);

  return (
    <div className="space-y-8">
      {/* Title & Overview Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[10px] bg-indigo-600/15 border border-indigo-500/20 text-indigo-400 font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
              Admissions Portal
            </span>
            <h2 className="text-xl md:text-3xl font-display font-black text-white mt-4 uppercase tracking-tight">
              Applicant Dashboard
            </h2>
            <p className="text-slate-400 text-xs md:text-sm mt-2 max-w-lg font-medium">
              Welcome back! Complete your application wizard, monitor screening dates, and view communication alerts.
            </p>
          </div>
          {application && (
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col gap-1 text-xs">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Tracking Number</span>
              <strong className="text-white font-mono text-sm">{application.applicationNo}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Status Tracking & Screening scheduler */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Status tracker & Scheduler */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Status Tracker Steps Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Application Tracker
            </h3>

            {application ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
                {steps.map((step, idx) => {
                  const isCompleted = idx <= currentStepIndex;
                  const isActive = idx === currentStepIndex;
                  return (
                    <div
                      key={step.label}
                      className={`border rounded-xl p-4 flex flex-col justify-between min-h-[100px] transition-all ${
                        isActive
                          ? "border-indigo-500 bg-indigo-950/10"
                          : isCompleted
                          ? "border-emerald-500/30 bg-emerald-950/5 text-slate-300"
                          : "border-slate-850 text-slate-500"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Step {idx + 1}</span>
                        {isCompleted && !isActive ? (
                          <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
                        ) : isActive ? (
                          <Clock className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />
                        ) : (
                          <Clock className="h-4.5 w-4.5 text-slate-650" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white mt-3 leading-none">{step.label}</p>
                        <p className="text-[9px] text-slate-400 mt-1 font-semibold leading-tight">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl flex flex-col items-center text-center gap-4">
                <AlertCircle className="h-8 w-8 text-amber-500" />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Awaiting Application Form submission</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Please launch the admissions wizard to enter your details.</p>
                </div>
                <Link
                  href="/admissions/portal/apply"
                  className="bg-indigo-650 hover:bg-indigo-700 text-white font-display font-bold py-2 px-5 rounded-xl text-xs flex items-center gap-2 transition-colors cursor-pointer no-underline"
                >
                  <span>Start Application Form</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Action Context Box */}
          {application && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
              
              {/* Draft Status context */}
              {application.status === "DRAFT" && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-5 rounded-xl border border-slate-850">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Continue your application</h4>
                    <p className="text-[10px] text-slate-400 mt-1">Your draft has been saved. Complete all steps and submit to start the registry review.</p>
                  </div>
                  <Link
                    href="/admissions/portal/apply"
                    className="bg-indigo-650 hover:bg-indigo-700 text-white font-display font-bold py-2.5 px-5 rounded-xl text-xs cursor-pointer transition-colors no-underline"
                  >
                    Continue Wizard
                  </Link>
                </div>
              )}

              {/* Submitted & Needs Screening scheduling */}
              {application.status === "SUBMITTED" && !application.screening && (
                <div className="space-y-5">
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-850">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-indigo-400" />
                      <span>Book Screening Appointment</span>
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      All undergraduate & postgraduate applicants are required to attend screening examinations. Please select a convenient date and location from the options below.
                    </p>
                  </div>

                  <form onSubmit={handleBookScreening} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Available Examination Date</label>
                      <select
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="p-3 bg-slate-900 border border-slate-850 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-bold cursor-pointer"
                      >
                        <option value="2026-06-25T10:00">June 25, 2026 at 10:00 AM</option>
                        <option value="2026-06-26T10:00">June 26, 2026 at 10:00 AM</option>
                        <option value="2026-06-27T10:00">June 27, 2026 at 10:00 AM</option>
                        <option value="2026-06-29T10:00">June 29, 2026 at 10:00 AM</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Screening Location Venue</label>
                      <select
                        value={selectedVenue}
                        onChange={(e) => setSelectedVenue(e.target.value)}
                        className="p-3 bg-slate-900 border border-slate-850 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-bold cursor-pointer"
                      >
                        <option value="College Main Hall A">Main College Hall A (Badagry Campus)</option>
                        <option value="E-Learning Auditorium">E-Learning Computer Auditorium</option>
                        <option value="Postgraduate Seminar Room">Postgraduate Seminar Room (Special Group)</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={isPending}
                      className="sm:col-span-2 bg-indigo-650 hover:bg-indigo-700 disabled:opacity-50 text-white font-display font-bold py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-indigo-900/10 text-xs mt-2"
                    >
                      <Calendar className="h-4 w-4" />
                      <span>{isPending ? "Booking appointment..." : "Confirm Screening Appointment"}</span>
                    </button>
                  </form>
                </div>
              )}

              {/* Screening Scheduled */}
              {application.screening && application.status === "UNDER_REVIEW" && (
                <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] bg-indigo-600/20 border border-indigo-500/25 text-indigo-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                        Screening Active
                      </span>
                      <h4 className="text-xs font-bold text-white mt-2">Screening Seat Confirmed</h4>
                    </div>
                    <Calendar className="h-5 w-5 text-indigo-400 shrink-0" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-350">
                    <div className="flex items-center gap-2.5 bg-slate-950 p-3 rounded-xl border border-slate-850/60">
                      <Clock className="h-4.5 w-4.5 text-slate-500 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Screening Appointment</span>
                        <strong className="text-slate-200 mt-0.5 block">
                          {new Date(application.screening.screeningDate).toLocaleString(undefined, {
                            month: "long",
                            day: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </strong>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 bg-slate-950 p-3 rounded-xl border border-slate-850/60">
                      <MapPin className="h-4.5 w-4.5 text-slate-500 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Venue Room</span>
                        <strong className="text-slate-200 mt-0.5 block">{application.screening.venue}</strong>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-semibold italic">
                    Note: Please print your slip and arrive at the venue 30 minutes before your time slot with original files of all uploaded credentials.
                  </p>
                </div>
              )}

              {/* Decided - APPROVED */}
              {application.status === "APPROVED" && (
                <div className="bg-emerald-950/15 border border-emerald-900/30 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                        Offer Granted
                      </span>
                      <h4 className="text-sm font-bold text-white mt-2">Congratulations! Admission Offered</h4>
                    </div>
                    <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                  </div>
                  <p className="text-xs text-slate-350 leading-relaxed">
                    We are pleased to offer you admission to CrestOak College to study <strong className="text-white">{application.programme.name}</strong>. Your official offer details and admission letters are available below.
                  </p>
                  <Link
                    href="/admissions/portal/letter"
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold py-2.5 px-5 rounded-xl text-xs transition-colors cursor-pointer no-underline shadow-md shadow-emerald-950/20"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Print Admission Letter</span>
                  </Link>
                </div>
              )}

              {/* Decided - REJECTED */}
              {application.status === "REJECTED" && (
                <div className="bg-rose-950/10 border border-rose-900/20 p-5 rounded-2xl space-y-3 flex items-start gap-4">
                  <XCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide">Application Declined</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      We regret to inform you that your application for admission into CrestOak College was not successful for this session cycle. We wish you the best in your future academic pursuits.
                    </p>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Right Side: Simulated Email/SMS logs */}
        <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between min-h-[350px]">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-850">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Alert Notification Logs</h3>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Simulated Outbox logs</span>
              </div>
            </div>

            {/* Logs Tab Toggle */}
            <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl border border-slate-850">
              <button
                onClick={() => setActiveLogTab("EMAIL")}
                className={`py-2 text-[10px] font-bold rounded-lg uppercase tracking-wider cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
                  activeLogTab === "EMAIL" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Emails</span>
              </button>
              <button
                onClick={() => setActiveLogTab("SMS")}
                className={`py-2 text-[10px] font-bold rounded-lg uppercase tracking-wider cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
                  activeLogTab === "SMS" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>SMS Alerts</span>
              </button>
            </div>

            {/* Logs Scroll container */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-slate-900/50 border border-slate-850 p-3.5 rounded-xl space-y-2 text-[11px] text-slate-350"
                  >
                    <div className="flex justify-between items-start text-[9px] text-slate-500">
                      <span className="font-mono text-slate-450">{log.recipient}</span>
                      <span>
                        {new Date(log.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric"
                        })}
                      </span>
                    </div>
                    {log.subject && <p className="font-bold text-slate-200 leading-none">{log.subject}</p>}
                    <p className="leading-normal text-slate-400 font-semibold">{log.message}</p>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-650 font-bold uppercase tracking-widest text-[9px]">
                  No outbound logs.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
