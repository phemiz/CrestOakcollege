"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { DEFAULT_FEE_TYPES } from "@/constants/institutionalData";

interface InvoiceItem {
  id: string;
  invoiceNo: string;
  amount: number;
  description: string;
  feeType: "TUITION" | "ACCOMMODATION" | "APPLICATION" | "ACCEPTANCE" | "LATE_REGISTRATION" | "TRANSCRIPT" | "OTHER" | string;
  status: "UNPAID" | "PARTIALLY_PAID" | "PAID" | "CANCELLED" | string;
  dueDate: Date | string;
  createdAt: Date | string;
  user: {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  payments?: {
    reference: string;
    amountPaid: number;
    paidAt: Date | string | null;
  }[];
}

interface StudentItem {
  id: string;
  matricNo: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

interface FeesClientProps {
  invoices: InvoiceItem[];
  students: StudentItem[];
}

export default function FeesClient({ invoices: initialInvoices, students: rawStudents }: FeesClientProps) {
  const students = (rawStudents && rawStudents.length > 0)
    ? rawStudents
    : [
        { id: "user-001", matricNo: "CCHMS/2026/NUR/0042", user: { firstName: "Azeez", lastName: "Okunola" } },
        { id: "user-002", matricNo: "CCHMS/2026/CHEW/0081", user: { firstName: "Fatima", lastName: "Abubakar" } }
      ];

  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoiceItem[]>(initialInvoices);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    userId: students[0]?.id || "user-001",
    amount: 150000,
    description: "First Semester Course Administrative Charges",
    feeType: "TUITION" as any,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  });

  const openAddModal = () => {
    setFormData({
      userId: students[0]?.id || "user-001",
      amount: 150000,
      description: "First Semester Course Administrative Charges",
      feeType: "TUITION",
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/fees.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setInvoices((prev) => [data.invoice, ...prev]);
        setIsModalOpen(false);
        router.refresh();
      } else {
        alert("Error generating invoice: " + (data.message || "Failed"));
      }
    } catch (err: any) {
      alert("Submission error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    const fullName = `${inv.user.firstName} ${inv.user.lastName}`.toLowerCase();
    const searchMatch =
      fullName.includes(searchTerm.toLowerCase()) ||
      inv.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.description.toLowerCase().includes(searchTerm.toLowerCase());

    const statusMatch = statusFilter === "ALL" || inv.status === statusFilter;
    const typeMatch = typeFilter === "ALL" || inv.feeType === typeFilter;

    return searchMatch && statusMatch && typeMatch;
  });

  // Paginate items
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amt);
  };

  return (
    <div className="space-y-6">
      {/* Title & Add Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-black text-slate-900">Fee & Billing Management</h2>
          <p className="text-xs text-slate-500 mt-1">Audit tuition schedules, student invoices, and Bursary transaction logs in real time.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-red-600 hover:bg-red-700 text-white font-display font-bold py-2.5 px-5 rounded-xl text-xs transition-all flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <CreditCard className="h-4.5 w-4.5" />
          <span>Generate Custom Invoice</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="md:col-span-6 relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice number, student name, or fee description..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
          />
        </div>
        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors cursor-pointer"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="UNPAID">Unpaid</option>
            <option value="PAID">Paid</option>
            <option value="PARTIALLY_PAID">Partially Paid</option>
          </select>
        </div>
        <div className="md:col-span-3">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors cursor-pointer"
          >
            <option value="ALL">All Fee Types</option>
            <option value="TUITION">Tuition Fee</option>
            <option value="ACCEPTANCE">Acceptance Fee</option>
            <option value="ACCOMMODATION">Accommodation Fee</option>
          </select>
        </div>
      </div>

      {/* Invoices Data Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {paginatedInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs text-slate-800">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-5">Invoice No</th>
                  <th className="py-3.5 px-5">Student</th>
                  <th className="py-3.5 px-5">Description</th>
                  <th className="py-3.5 px-5">Amount</th>
                  <th className="py-3.5 px-5">Due Date</th>
                  <th className="py-3.5 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-900">{inv.invoiceNo}</td>
                    <td className="py-3.5 px-5 font-semibold text-slate-900">
                      {inv.user.firstName} {inv.user.lastName}
                      <span className="block text-[11px] text-slate-500 font-normal mt-0.5">
                        {inv.user.email}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-700 font-medium">{inv.description}</td>
                    <td className="py-3.5 px-5 font-bold font-mono text-slate-900">
                      {formatCurrency(Number(inv.amount))}
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 font-medium">
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          inv.status === "PAID"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {inv.status === "PAID" ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        <span>{inv.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-500 font-bold uppercase tracking-widest text-xs bg-white">
            No invoices found in billing registry.
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

      {/* Generate Custom Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white sticky top-0 z-10">
              <h3 className="font-display font-black text-sm tracking-widest uppercase text-slate-900">
                Generate Custom Student Invoice
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-semibold text-slate-800">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-700">Target Student *</label>
                <select
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 font-bold"
                >
                  {students && students.length > 0 ? (
                    students.map((stu) => (
                      <option key={stu.id} value={stu.id}>
                        {stu.user.firstName} {stu.user.lastName} ({stu.matricNo})
                      </option>
                    ))
                  ) : (
                    <option value="user-001">Prospective Applicant / Student</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">Fee Category *</label>
                  <select
                    value={formData.feeType}
                    onChange={(e) => setFormData({ ...formData, feeType: e.target.value as any })}
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 font-bold"
                  >
                    <option value="TUITION">TUITION</option>
                    <option value="ACCEPTANCE">ACCEPTANCE</option>
                    <option value="ACCOMMODATION">ACCOMMODATION</option>
                    <option value="APPLICATION">APPLICATION</option>
                    <option value="TRANSCRIPT">TRANSCRIPT</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">Amount (NGN ₦) *</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-700">Description *</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Late Registration Fine or Supplemental Lab Fee"
                  className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-700">Payment Due Date *</label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 font-bold"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-white hover:bg-slate-100 border border-slate-300 px-5 py-2.5 rounded-xl text-slate-700 font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  <span>{isSubmitting ? "Generating..." : "Generate Invoice"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
