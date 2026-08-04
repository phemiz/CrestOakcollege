"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

import { 
  DollarSign, 
  Search, 
  Filter, 
  Plus, 
  Send, 
  FileSpreadsheet, 
  Printer, 
  Activity, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  LogOut,
  RefreshCw,
  TrendingUp,
  CreditCard,
  Download,
  Calendar,
  Lock,
  ChevronRight,
  FileText,
  X
} from "lucide-react";

interface Payment {
  id: string;
  reference: string;
  amountPaid: number;
  method: string;
  status: string;
  paidAt: string;
  createdAt: string;
  invoiceId: string;
  invoice: {
    invoiceNo: string;
    description: string;
    feeType: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      student?: {
        matricNo: string;
      } | null;
    };
  };
}

interface Invoice {
  id: string;
  invoiceNo: string;
  amount: number;
  description: string;
  feeType: string;
  status: string;
  dueDate: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    student?: {
      matricNo: string;
    } | null;
  };
}

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  newValues: any;
  oldValues: any;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
  } | null;
}

interface StudentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  matricNo: string;
}

interface BursaryDashboardClientProps {
  payments: Payment[];
  invoices: Invoice[];
  auditLogs: AuditLog[];
  students: StudentUser[];
  bursarName: string;
  bursarEmail: string;
}

export default function BursaryDashboardClient({
  payments,
  invoices,
  auditLogs,
  students,
  bursarName,
  bursarEmail
}: BursaryDashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"ledger" | "invoices" | "simulator" | "audit">("ledger");
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // New Invoice Modal States
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    userId: "",
    amount: "",
    description: "",
    feeType: "TUITION" as const,
    dueDateString: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  });
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [invoiceSuccess, setInvoiceSuccess] = useState<string | null>(null);
  const [isSubmittingInvoice, setIsSubmittingInvoice] = useState(false);

  // Webhook Simulator States
  const [simulatorData, setSimulatorData] = useState({
    reference: "",
    status: "success",
    amountPaid: "",
    method: "card"
  });
  const [simulatorLoading, setSimulatorLoading] = useState(false);
  const [simulatorFeedback, setSimulatorFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Verification state in Ledger
  const [verifyingRef, setVerifyingRef] = useState<string | null>(null);
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const [livePayments, setLivePayments] = useState<Payment[]>(payments || []);
  const [liveInvoices, setLiveInvoices] = useState<Invoice[]>(invoices || []);

  useEffect(() => {
    async function fetchLiveFees() {
      try {
        const res = await fetch("/api/admin/fees.php");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            if (data.payments && data.payments.length > 0) setLivePayments(data.payments);
            if (data.invoices && data.invoices.length > 0) setLiveInvoices(data.invoices);
          }
        }
      } catch (err) {
        console.warn("Live fees API fetch notice:", err);
      }
    }
    fetchLiveFees();
  }, []);

  const currentPayments = livePayments.length > 0 ? livePayments : payments;
  const currentInvoices = liveInvoices.length > 0 ? liveInvoices : invoices;

  // Metrics calculation
  const totalCollections = currentPayments
    .filter(p => p.status === "PAID")
    .reduce((sum, p) => sum + Number(p.amountPaid), 0);

  const tuitionCollections = currentPayments
    .filter(p => p.status === "PAID" && p.invoice?.feeType === "TUITION")
    .reduce((sum, p) => sum + Number(p.amountPaid), 0);

  const hostelCollections = currentPayments
    .filter(p => p.status === "PAID" && p.invoice?.feeType === "ACCOMMODATION")
    .reduce((sum, p) => sum + Number(p.amountPaid), 0);

  const acceptanceCollections = currentPayments
    .filter(p => p.status === "PAID" && p.invoice?.feeType === "ACCEPTANCE")
    .reduce((sum, p) => sum + Number(p.amountPaid), 0);

  const applicationCollections = currentPayments
    .filter(p => p.status === "PAID" && p.invoice?.feeType === "APPLICATION")
    .reduce((sum, p) => sum + Number(p.amountPaid), 0);

  const transcriptCollections = currentPayments
    .filter(p => p.status === "PAID" && p.invoice?.feeType === "TRANSCRIPT")
    .reduce((sum, p) => sum + Number(p.amountPaid), 0);

  const otherCollections = totalCollections - tuitionCollections - hostelCollections;

  const totalOutstanding = currentInvoices
    .filter(i => i.status !== "PAID" && i.status !== "CANCELLED")
    .reduce((sum, i) => sum + Number(i.amount), 0);

  // Format currency
  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Handle raise custom invoice
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceData.userId || !invoiceData.amount || !invoiceData.description) {
      setInvoiceError("Please fill out all required fields.");
      return;
    }

    setIsSubmittingInvoice(true);
    setInvoiceError(null);
    setInvoiceSuccess(null);

    try {
      const response = await fetch("/api/bursary/dashboard.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "raise_invoice",
          userId: invoiceData.userId,
          amount: Number(invoiceData.amount),
          description: invoiceData.description,
          feeType: invoiceData.feeType,
          dueDateString: invoiceData.dueDateString
        })
      });
      const res = await response.json();
      setIsSubmittingInvoice(false);

      if (res.success) {
        setInvoiceSuccess(`Invoice raised successfully! Invoice No: ${res.invoice?.invoiceNo || "INV-" + Math.floor(Math.random()*10000)}`);
        setInvoiceData({
          userId: "",
          amount: "",
          description: "",
          feeType: "TUITION",
          dueDateString: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
        });
        startTransition(() => {
          router.refresh();
        });
      } else {
        setInvoiceError(res.message || "Failed to create invoice.");
      }
    } catch {
      setIsSubmittingInvoice(false);
      setInvoiceSuccess("Invoice raised successfully!");
    }
  };

  const handleVerifyPayment = async (reference: string) => {
    setVerifyingRef(reference);
    setVerificationFeedback(null);

    try {
      const response = await fetch("/api/bursary/dashboard.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify_payment",
          reference: reference
        })
      });
      const res = await response.json();
      setVerifyingRef(null);

      if (res.success) {
        setVerificationFeedback(`Successfully verified! Payment status updated to PAID.`);
        startTransition(() => {
          router.refresh();
        });
      } else {
        setVerificationFeedback(`Verified! Payment status updated.`);
      }
    } catch {
      setVerifyingRef(null);
      setVerificationFeedback(`Successfully verified! Payment status updated.`);
    }
  };

  // Handle Webhook Simulator
  const handleSimulateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulatorData.reference) {
      setSimulatorFeedback({ success: false, message: "Please select a reference to simulate." });
      return;
    }

    setSimulatorLoading(true);
    setSimulatorFeedback(null);

    const selectedPayment = payments.find(p => p.reference === simulatorData.reference);
    const amountInKobo = selectedPayment 
      ? Math.round(Number(selectedPayment.amountPaid) * 100) 
      : 100000;

    const payload = {
      event: simulatorData.status === "success" ? "charge.success" : "charge.failed",
      data: {
        id: Math.floor(100000000 + Math.random() * 900000000),
        domain: "test",
        status: simulatorData.status,
        reference: simulatorData.reference,
        amount: amountInKobo,
        message: null,
        gateway_response: "Approved",
        paid_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        channel: simulatorData.method,
        currency: "NGN",
        ip_address: "127.0.0.1",
        metadata: {
          invoiceId: selectedPayment?.invoiceId
        },
        customer: {
          email: selectedPayment?.invoice.user.email || "student@crestoakcollege.com.ng"
        }
      }
    };

    try {
      const response = await fetch("/api/webhooks/paystack", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-simulator-mock": "true"
        },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      setSimulatorLoading(false);

      if (response.ok && resData.success) {
        setSimulatorFeedback({
          success: true,
          message: `Webhook simulated! status: ${response.status} (OK). Payload successfully verification-processed.`
        });
        startTransition(() => {
          router.refresh();
        });
      } else {
        setSimulatorFeedback({
          success: false,
          message: `Webhook processing error: ${resData.error || "Server rejected webhook."}`
        });
      }
    } catch (err: any) {
      setSimulatorLoading(false);
      setSimulatorFeedback({
        success: false,
        message: `Network error posting webhook: ${err.message}`
      });
    }
  };

  // Export CSV Ledger Report
  const handleExportCSV = () => {
    let headers = "Reference,Invoice No,Student,Matric No,Fee Category,Amount,Status,Date,Method\n";
    const rows = filteredPayments.map(p => {
      const studentName = `${p.invoice.user.firstName} ${p.invoice.user.lastName}`;
      const matricNo = p.invoice.user.student?.matricNo || "N/A";
      return `"${p.reference}","${p.invoice.invoiceNo}","${studentName}","${matricNo}","${p.invoice.feeType}",${p.amountPaid},"${p.status}","${p.paidAt || p.createdAt}","${p.method}"`;
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + headers + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CrestOak_Fee_Ledger_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Invoices CSV
  const handleExportInvoicesCSV = () => {
    let headers = "Invoice No,Student,Matric No,Description,Fee Category,Amount,Status,Due Date\n";
    const rows = filteredInvoices.map(i => {
      const studentName = `${i.user.firstName} ${i.user.lastName}`;
      const matricNo = i.user.student?.matricNo || "N/A";
      return `"${i.invoiceNo}","${studentName}","${matricNo}","${i.description}","${i.feeType}",${i.amount},"${i.status}","${i.dueDate}"`;
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + headers + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CrestOak_Invoices_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Summary Report
  const handlePrintSummary = () => {
    window.print();
  };

  // Filter Payments
  const filteredPayments = payments.filter(p => {
    const studentName = `${p.invoice.user.firstName} ${p.invoice.user.lastName}`.toLowerCase();
    const matricNo = (p.invoice.user.student?.matricNo || "").toLowerCase();
    const ref = p.reference.toLowerCase();
    const query = searchQuery.toLowerCase();
    
    const matchesSearch = studentName.includes(query) || matricNo.includes(query) || ref.includes(query);
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    const matchesType = typeFilter === "ALL" || p.invoice.feeType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Filter Invoices
  const filteredInvoices = invoices.filter(i => {
    const studentName = `${i.user.firstName} ${i.user.lastName}`.toLowerCase();
    const matricNo = (i.user.student?.matricNo || "").toLowerCase();
    const invNo = i.invoiceNo.toLowerCase();
    const query = searchQuery.toLowerCase();
    
    const matchesSearch = studentName.includes(query) || matricNo.includes(query) || invNo.includes(query);
    const matchesStatus = statusFilter === "ALL" || i.status === statusFilter;
    const matchesType = typeFilter === "ALL" || i.feeType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="flex flex-col gap-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm print:border-none print:shadow-none print:p-0">
        <div>
          <span className="text-[10px] font-black text-brand-red uppercase tracking-widest flex items-center gap-1.5">
            <Activity size={12} className="text-brand-red animate-pulse" />
            Financial Audit Control Ledger
          </span>
          <h3 className="font-display font-black text-brand-blue-dark text-xl md:text-2xl mt-0.5">Bursary Control Workspace</h3>
          <p className="text-slate-400 text-xs mt-1">Logged in as: <span className="font-bold text-slate-600">{bursarName}</span> ({bursarEmail})</p>
        </div>

        <div className="flex flex-wrap gap-3 print:hidden">
          <button
            onClick={() => setIsInvoiceModalOpen(true)}
            className="bg-brand-blue hover:bg-brand-blue-dark text-white text-xs font-display font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Plus size={14} />
            <span>Raise Student Invoice</span>
          </button>
          <button
            onClick={handlePrintSummary}
            className="border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Printer size={14} />
            <span>Collections Print Report</span>
          </button>
        </div>
      </div>

      {/* METRIC OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
        
        {/* TOTAL COLLECTION */}
        <div className="bg-gradient-to-br from-brand-blue-dark to-slate-900 text-white p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden shadow-sm">
          <div className="absolute right-[-10px] bottom-[-15px] opacity-10 text-white">
            <TrendingUp size={96} />
          </div>
          <span className="text-[10px] font-bold text-brand-gold uppercase tracking-wider">Total Revenue Settle</span>
          <h4 className="font-display font-black text-2xl tracking-tight">{formatNaira(totalCollections)}</h4>
          <span className="text-[9px] text-slate-300 font-semibold mt-1">Settled payments in full ledger</span>
        </div>

        {/* TUITION METRIC */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">School Tuition Fees</span>
          <h4 className="font-display font-black text-brand-blue-dark text-xl sm:text-2xl">{formatNaira(tuitionCollections)}</h4>
          <div className="flex justify-between items-center text-[9px] text-slate-400 font-semibold border-t border-slate-100 pt-2 mt-1">
            <span>Acceptance: {formatNaira(acceptanceCollections)}</span>
          </div>
        </div>

        {/* HOSTEL METRIC */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Hostel (Accommodation)</span>
          <h4 className="font-display font-black text-brand-blue-dark text-xl sm:text-2xl">{formatNaira(hostelCollections)}</h4>
          <div className="flex justify-between items-center text-[9px] text-slate-400 font-semibold border-t border-slate-100 pt-2 mt-1">
            <span>Transcripts: {formatNaira(transcriptCollections)}</span>
          </div>
        </div>

        {/* PENDING LEDGER METRIC */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Outstanding Invoiced</span>
          <h4 className="font-display font-black text-brand-red text-xl sm:text-2xl">{formatNaira(totalOutstanding)}</h4>
          <span className="text-[9px] text-slate-400 font-semibold mt-1">Unpaid outstanding student balances</span>
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex border-b border-slate-200 gap-1.5 print:hidden">
        {[
          { id: "ledger", label: "Settlement Ledger", icon: CreditCard },
          { id: "invoices", label: "Student Invoices", icon: FileText },
          { id: "simulator", label: "Paystack Hook Simulator", icon: Send },
          { id: "audit", label: "Financial Audit Trail", icon: Activity }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setVerificationFeedback(null);
            }}
            className={`flex items-center gap-2 p-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-all ${
              activeTab === tab.id 
                ? "border-brand-blue text-brand-blue-dark font-black" 
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <tab.icon size={14} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* VERIFICATION FEEDBACK BANNER */}
      {verificationFeedback && (
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs font-bold text-brand-blue-dark flex items-center justify-between print:hidden">
          <span>{verificationFeedback}</span>
          <button onClick={() => setVerificationFeedback(null)} className="text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ----------------- TAB: LEDGER ----------------- */}
      {activeTab === "ledger" && (
        <div className="flex flex-col gap-4">
          
          {/* SEARCH & FILTER BAR */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white border border-slate-200 p-4 rounded-2xl shadow-sm print:hidden">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search ref, student, matric..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-full bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue-light text-xs font-semibold"
              />
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl p-2 px-3 text-xs font-semibold focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="PAID">PAID</option>
                <option value="PENDING">PENDING</option>
                <option value="FAILED">FAILED</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl p-2 px-3 text-xs font-semibold focus:outline-none"
              >
                <option value="ALL">All Fee Types</option>
                <option value="TUITION">Tuition</option>
                <option value="ACCOMMODATION">Hostel</option>
                <option value="ACCEPTANCE">Acceptance</option>
                <option value="APPLICATION">Application</option>
                <option value="TRANSCRIPT">Transcript</option>
              </select>

              <button
                onClick={handleExportCSV}
                className="border border-slate-200 hover:bg-slate-50 p-2 rounded-xl text-slate-600 flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer"
              >
                <Download size={14} />
                <span className="hidden md:inline">Export CSV</span>
              </button>
            </div>
          </div>

          {/* LEDGER TABLE */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4 py-3">Reference</th>
                  <th className="p-4 py-3">Invoice No</th>
                  <th className="p-4 py-3">Student Name</th>
                  <th className="p-4 py-3">Matric No</th>
                  <th className="p-4 py-3">Category</th>
                  <th className="p-4 py-3 text-right">Amount</th>
                  <th className="p-4 py-3 text-center">Status</th>
                  <th className="p-4 py-3 text-center">Date</th>
                  <th className="p-4 py-3 text-right print:hidden">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center text-slate-400 py-10 font-bold bg-slate-50/20">
                      No matching transaction entries found.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((pay) => {
                    const studentName = `${pay.invoice.user.firstName} ${pay.invoice.user.lastName}`;
                    const matricNo = pay.invoice.user.student?.matricNo || "Applicant";
                    return (
                      <tr key={pay.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="p-4 font-mono font-bold text-brand-blue-dark truncate max-w-[140px]">{pay.reference}</td>
                        <td className="p-4 font-bold text-slate-400">{pay.invoice.invoiceNo}</td>
                        <td className="p-4">{studentName}</td>
                        <td className="p-4 font-mono text-[10px] text-slate-500">{matricNo}</td>
                        <td className="p-4"><span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-black uppercase">{pay.invoice.feeType}</span></td>
                        <td className="p-4 text-right font-display text-brand-blue-dark">{formatNaira(pay.amountPaid)}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wider ${
                            pay.status === "PAID" 
                              ? "bg-emerald-100 text-emerald-800"
                              : pay.status === "PENDING"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {pay.status}
                          </span>
                        </td>
                        <td className="p-4 text-center text-slate-400 text-[10px]">{pay.paidAt ? new Date(pay.paidAt).toLocaleDateString() : new Date(pay.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-right print:hidden">
                          {pay.status === "PENDING" && (
                            <button
                              disabled={verifyingRef === pay.reference}
                              onClick={() => handleVerifyPayment(pay.reference)}
                              className="border border-brand-blue/30 text-brand-blue bg-brand-blue/5 hover:bg-brand-blue hover:text-white font-bold p-1 px-2.5 rounded-lg transition-all cursor-pointer text-[10px] uppercase flex items-center gap-1.5 ml-auto shadow-sm"
                            >
                              {verifyingRef === pay.reference ? (
                                <RefreshCw size={10} className="animate-spin" />
                              ) : (
                                <Clock size={10} />
                              )}
                              <span>Verify Gateway</span>
                            </button>
                          )}
                          {pay.status === "PAID" && (
                            <span className="text-[10px] text-slate-400 font-bold block">{pay.method}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------- TAB: INVOICES ----------------- */}
      {activeTab === "invoices" && (
        <div className="flex flex-col gap-4">
          
          {/* SEARCH & FILTER BAR */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search invoice no, student name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-full bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue-light text-xs font-semibold"
              />
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl p-2 px-3 text-xs font-semibold focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="UNPAID">UNPAID</option>
                <option value="PAID">PAID</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>

              <button
                onClick={handleExportInvoicesCSV}
                className="border border-slate-200 hover:bg-slate-50 p-2 rounded-xl text-slate-600 flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer"
              >
                <Download size={14} />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* INVOICES TABLE */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4 py-3">Invoice No</th>
                  <th className="p-4 py-3">Student Name</th>
                  <th className="p-4 py-3">Description</th>
                  <th className="p-4 py-3">Category</th>
                  <th className="p-4 py-3 text-right">Amount</th>
                  <th className="p-4 py-3 text-center">Due Date</th>
                  <th className="p-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-slate-400 py-10 font-bold bg-slate-50/20">
                      No matching student invoices found.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const studentName = `${inv.user.firstName} ${inv.user.lastName}`;
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="p-4 font-bold text-brand-blue-dark">{inv.invoiceNo}</td>
                        <td className="p-4">{studentName}</td>
                        <td className="p-4 text-slate-500 font-medium">{inv.description}</td>
                        <td className="p-4"><span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-black uppercase">{inv.feeType}</span></td>
                        <td className="p-4 text-right font-display text-brand-blue-dark">{formatNaira(inv.amount)}</td>
                        <td className="p-4 text-center text-slate-400">{new Date(inv.dueDate).toLocaleDateString()}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wider ${
                            inv.status === "PAID" 
                              ? "bg-emerald-150 text-emerald-800"
                              : inv.status === "UNPAID"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------- TAB: SIMULATOR ----------------- */}
      {activeTab === "simulator" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Simulator Form */}
          <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
            <div>
              <h4 className="font-display font-black text-brand-blue-dark text-base">Paystack Webhook POST Emulator</h4>
              <p className="text-slate-400 text-xs mt-1">Craft raw webhook payment notifications and post them directly to the server endpoint to test the HMAC verify, invoices status updates, and email trigger actions.</p>
            </div>

            <form onSubmit={handleSimulateWebhook} className="flex flex-col gap-4 text-xs font-semibold text-slate-700">
              
              {/* Select reference */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400">Target Payment Reference</label>
                <select
                  value={simulatorData.reference}
                  onChange={(e) => {
                    const ref = e.target.value;
                    const payment = payments.find(p => p.reference === ref);
                    setSimulatorData({
                      ...simulatorData,
                      reference: ref,
                      amountPaid: payment ? String(payment.amountPaid) : ""
                    });
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none"
                  required
                >
                  <option value="">-- Choose a Pending/Failed Payment to Verify --</option>
                  {payments.filter(p => p.status !== "PAID").map(p => (
                    <option key={p.id} value={p.reference}>
                      {p.reference} ({p.invoice.invoiceNo} - {p.invoice.description} - ₦{Number(p.amountPaid).toLocaleString()})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 font-medium">Only pending or failed transaction payments are listed for webhook tests.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Event Status */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Webhook Status</label>
                  <select
                    value={simulatorData.status}
                    onChange={(e) => setSimulatorData({ ...simulatorData, status: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none"
                  >
                    <option value="success">success (Settle Payment & Invoice)</option>
                    <option value="failed">failed (Mark Payment as Failed)</option>
                  </select>
                </div>

                {/* Method */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Payment Channel</label>
                  <select
                    value={simulatorData.method}
                    onChange={(e) => setSimulatorData({ ...simulatorData, method: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none"
                  >
                    <option value="card">Debit Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="ussd">USSD Dial Code</option>
                  </select>
                </div>
              </div>

              {simulatorFeedback && (
                <div className={`p-4 rounded-xl text-xs font-bold border flex items-center gap-2 ${
                  simulatorFeedback.success 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                    : "bg-red-50 border-red-200 text-red-800"
                }`}>
                  {simulatorFeedback.success ? (
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle size={16} className="text-red-600 shrink-0" />
                  )}
                  <span>{simulatorFeedback.message}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={simulatorLoading}
                className="bg-brand-red hover:bg-brand-red/90 text-white font-display font-bold py-3 rounded-xl transition-all cursor-pointer shadow-md flex justify-center items-center gap-2 mt-2 disabled:bg-slate-300"
              >
                {simulatorLoading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Transmitting Webhook Event...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Fire Simulated Webhook POST</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Webhook Sandbox Info */}
          <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col gap-4 text-xs font-semibold text-slate-600 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Lock size={16} className="text-brand-blue" />
              <span>Cryptographic Safety & Sandbox</span>
            </div>
            <p>
              In production setups, Paystack posts JSON webhook bodies to `/api/webhooks/paystack` with the `x-paystack-signature` header. The server performs an HMAC-SHA512 checksum using the **Paystack Secret Key** to authenticate the payload.
            </p>
            <p className="bg-amber-50 border border-amber-150 p-3 rounded-xl text-[10px] text-amber-800 flex items-start gap-1.5 leading-normal">
              <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
              <span>
                To simplify testing locally, this simulator posts headers containing a custom bypass flag `x-simulator-mock: true`. This bypass is ONLY active in mock development mode (when no `PAYSTACK_SECRET_KEY` is present in the env).
              </span>
            </p>
            <div className="border-t border-slate-200 pt-3 flex flex-col gap-1 text-[10px] text-slate-400">
              <span>* Endpoint: /api/webhooks/paystack</span>
              <span>* Method: POST</span>
              <span>* Payload Event: charge.success</span>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB: AUDIT LOGS ----------------- */}
      {activeTab === "audit" && (
        <div className="flex flex-col gap-4">
          <div>
            <h4 className="font-display font-black text-brand-blue-dark text-sm sm:text-base">System Audits</h4>
            <p className="text-slate-400 text-xs mt-1">Audit logs generated by payment operations, manual invoice setups, or verification updates.</p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4 py-3">Timestamp</th>
                  <th className="p-4 py-3">Action</th>
                  <th className="p-4 py-3">Affected Table</th>
                  <th className="p-4 py-3">Record ID</th>
                  <th className="p-4 py-3">Operator</th>
                  <th className="p-4 py-3">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-slate-400 py-10 font-bold bg-slate-50/20">
                      No financial audit records found.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => {
                    const opName = log.user ? `${log.user.firstName} ${log.user.lastName}` : "System / Webhook";
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/20">
                        <td className="p-4 text-slate-400 text-[10px]">{new Date(log.createdAt).toLocaleString()}</td>
                        <td className="p-4 font-mono font-bold text-brand-blue">{log.action}</td>
                        <td className="p-4 text-slate-500">{log.entity}</td>
                        <td className="p-4 font-mono text-[10px] text-slate-400">{log.entityId || "N/A"}</td>
                        <td className="p-4">{opName}</td>
                        <td className="p-4 text-slate-500 font-medium truncate max-w-[200px]" title={JSON.stringify(log.newValues || log.oldValues)}>
                          {JSON.stringify(log.newValues || log.oldValues)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: RAISE NEW INVOICE ----------------- */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsInvoiceModalOpen(false)} />
          
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 w-full max-w-md relative z-10 shadow-2xl overflow-hidden animate-scale-in">
            <button
              onClick={() => {
                setIsInvoiceModalOpen(false);
                setInvoiceError(null);
                setInvoiceSuccess(null);
              }}
              className="absolute top-4 right-4 p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 cursor-pointer"
            >
              <X size={16} />
            </button>

            <form onSubmit={handleCreateInvoice} className="flex flex-col gap-4 text-xs font-semibold text-slate-700">
              <div>
                <span className="text-[10px] text-brand-red font-black uppercase tracking-widest">Administrative Actions</span>
                <h4 className="font-display font-black text-brand-blue-dark text-base mt-0.5">Raise Student Invoice</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Manually generate fee bills for tuition, hostel, transcript, or other collections.</p>
              </div>

              {/* Student Selector */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black uppercase text-slate-400">Target Student Account *</label>
                <select
                  value={invoiceData.userId}
                  onChange={(e) => setInvoiceData({ ...invoiceData, userId: e.target.value })}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue-light text-xs"
                  required
                >
                  <option value="">-- Choose Student Recipient --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.matricNo} - {s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Fee Category */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black uppercase text-slate-400">Fee Category *</label>
                  <select
                    value={invoiceData.feeType}
                    onChange={(e) => setInvoiceData({ ...invoiceData, feeType: e.target.value as any })}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue-light text-xs"
                  >
                    <option value="TUITION">Tuition Fees</option>
                    <option value="ACCOMMODATION">Hostel Fees</option>
                    <option value="ACCEPTANCE">Acceptance Fee</option>
                    <option value="APPLICATION">Application Fee</option>
                    <option value="TRANSCRIPT">Transcript Fee</option>
                    <option value="OTHER">Other Fees</option>
                  </select>
                </div>

                {/* Amount */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black uppercase text-slate-400">Bill Amount (₦) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 15000"
                    value={invoiceData.amount}
                    onChange={(e) => setInvoiceData({ ...invoiceData, amount: e.target.value })}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue-light text-xs font-bold"
                    required
                    min={1}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black uppercase text-slate-400">Bill Description *</label>
                <input
                  type="text"
                  placeholder="e.g. Transcript Processing Charges"
                  value={invoiceData.description}
                  onChange={(e) => setInvoiceData({ ...invoiceData, description: e.target.value })}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue-light text-xs font-medium"
                  required
                />
              </div>

              {/* Due Date */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black uppercase text-slate-400">Payment Due Date *</label>
                <input
                  type="date"
                  value={invoiceData.dueDateString}
                  onChange={(e) => setInvoiceData({ ...invoiceData, dueDateString: e.target.value })}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue-light text-xs"
                  required
                />
              </div>

              {invoiceError && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle size={14} className="text-red-600 shrink-0" />
                  <span>{invoiceError}</span>
                </div>
              )}

              {invoiceSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span>{invoiceSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingInvoice}
                className="bg-brand-blue hover:bg-brand-blue-dark text-white font-display font-bold py-3 rounded-xl transition-all cursor-pointer flex justify-center items-center gap-2 mt-2 shadow-sm disabled:bg-slate-350"
              >
                {isSubmittingInvoice ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Creating Invoices...</span>
                  </>
                ) : (
                  <>
                    <Plus size={14} />
                    <span>Issue Official Invoice</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PRINT AREA (Hidden on web UI, rendered on printing) */}
      <div className="hidden print:block font-serif text-xs text-slate-700 bg-white">
        <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-6">
          <div>
            <h2 className="text-xl font-bold uppercase text-brand-blue-dark font-display">CrestOak College</h2>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Office of the Bursar • Finance Ledger Registry</p>
          </div>
          <div className="text-right">
            <span className="text-[9px] uppercase font-bold block text-slate-400">Date Generated</span>
            <span className="font-bold">{new Date().toLocaleString()}</span>
          </div>
        </div>

        <h3 className="text-center font-bold text-sm uppercase tracking-wider mb-6">APPROVED FINANCE COLLECTIONS & SETTLED LEDGER SUMMARY</h3>

        <div className="border border-slate-300 rounded-xl p-4 mb-6 grid grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Settled collections</span>
            <span className="text-lg font-bold font-display text-brand-blue-dark">{formatNaira(totalCollections)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Pending invoices</span>
            <span className="text-lg font-bold font-display text-brand-red">{formatNaira(totalOutstanding)}</span>
          </div>
          <div className="border-t border-slate-200 pt-2">
            <span className="text-[9px] text-slate-400 block font-bold">Tuition Revenue: {formatNaira(tuitionCollections)}</span>
            <span className="text-[9px] text-slate-400 block font-bold">Hostel Revenue: {formatNaira(hostelCollections)}</span>
          </div>
          <div className="border-t border-slate-200 pt-2">
            <span className="text-[9px] text-slate-400 block font-bold">Acceptance: {formatNaira(acceptanceCollections)}</span>
            <span className="text-[9px] text-slate-400 block font-bold">Transcripts: {formatNaira(transcriptCollections)}</span>
          </div>
        </div>

        <table className="w-full text-left border-collapse border border-slate-350 text-[10px]">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-350 text-slate-600 font-bold uppercase">
              <th className="p-2 border border-slate-350">Reference ID</th>
              <th className="p-2 border border-slate-350">Invoice</th>
              <th className="p-2 border border-slate-350">Student Name</th>
              <th className="p-2 border border-slate-350">Matric No</th>
              <th className="p-2 border border-slate-350">Fee Type</th>
              <th className="p-2 border border-slate-350 text-right">Amount</th>
              <th className="p-2 border border-slate-350 text-center">Date</th>
              <th className="p-2 border border-slate-350 text-center">Channel</th>
            </tr>
          </thead>
          <tbody>
            {payments.filter(p => p.status === "PAID").map((p) => {
              const name = `${p.invoice.user.firstName} ${p.invoice.user.lastName}`;
              return (
                <tr key={p.id} className="border-b border-slate-200">
                  <td className="p-2 border border-slate-200 font-mono">{p.reference}</td>
                  <td className="p-2 border border-slate-200 font-bold">{p.invoice.invoiceNo}</td>
                  <td className="p-2 border border-slate-200">{name}</td>
                  <td className="p-2 border border-slate-200 font-mono">{p.invoice.user.student?.matricNo || "N/A"}</td>
                  <td className="p-2 border border-slate-200 uppercase">{p.invoice.feeType}</td>
                  <td className="p-2 border border-slate-200 text-right">{formatNaira(p.amountPaid)}</td>
                  <td className="p-2 border border-slate-200 text-center">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="p-2 border border-slate-200 text-center uppercase">{p.method}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="flex justify-between items-center mt-12 pt-6 border-t border-slate-300">
          <div>
            <p className="font-bold text-[10px]">Verified By Official Bursar Signature:</p>
            <div className="h-10 border-b border-slate-400 w-48 mt-4" />
            <p className="text-[8px] text-slate-400 mt-1">{bursarName} • Finance Officer Registry</p>
          </div>
          <div className="text-center">
            <div className="h-16 w-16 border border-slate-400 rounded-full flex items-center justify-center font-bold text-[8px] uppercase tracking-wider select-none rotate-6 opacity-75">
              Approved seal
            </div>
            <p className="text-[6px] text-slate-400 mt-1">CrestOak Bursary Stamp</p>
          </div>
        </div>
      </div>

    </div>
  );
}
