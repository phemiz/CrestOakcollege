"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCustomInvoice } from "@/app/actions/admin-actions";
import {
  Search,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  CreditCard,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface InvoiceItem {
  id: string;
  invoiceNo: string;
  amount: number;
  description: string;
  feeType: "TUITION" | "ACCOMMODATION" | "APPLICATION" | "ACCEPTANCE" | "LATE_REGISTRATION" | "TRANSCRIPT" | "OTHER";
  status: "UNPAID" | "PARTIALLY_PAID" | "PAID" | "CANCELLED";
  dueDate: Date;
  createdAt: Date;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  payments: {
    reference: string;
    amountPaid: number;
    paidAt: Date | null;
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

export default function FeesClient({ invoices, students }: FeesClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

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
    userId: students[0]?.id || "",
    amount: 150000,
    description: "First Semester Course Administrative Charges",
    feeType: "TUITION" as "TUITION" | "ACCOMMODATION" | "APPLICATION" | "ACCEPTANCE" | "LATE_REGISTRATION" | "TRANSCRIPT" | "OTHER",
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  });

  const openAddModal = () => {
    setFormData({
      userId: students[0]?.id || "",
      amount: 150000,
      description: "First Semester Course Administrative Charges",
      feeType: "TUITION",
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userId || !formData.amount || !formData.description) {
      alert("Please fill in all required fields.");
      return;
    }

    startTransition(async () => {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
        dueDate: new Date(formData.dueDate)
      };
      const res = await createCustomInvoice(payload);
      if (res.success) {
        setIsModalOpen(false);
        router.refresh();
      } else {
        alert("Error dispatching invoice: " + res.error);
      }
    });
  };

  // Filter invoicing data
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

  // Pagination calculation
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Title & Dispatch Invoice Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-black text-white">Fee & Collections Ledger</h2>
          <p className="text-xs text-slate-400 mt-1">Audit outstanding tuition structures, payment references, and generate invoices.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-red-600 hover:bg-red-700 text-white font-display font-bold py-2.5 px-5 rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-red-950/20"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Dispatch Custom Invoice</span>
        </button>
      </div>

      {/* Search & Filter bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="md:col-span-6 relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search ledger by name, invoice no, or description..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-850 rounded-xl text-xs font-semibold text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-red-600 transition-colors"
          />
        </div>
        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-850 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:border-red-600 transition-colors cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="PAID">Paid</option>
            <option value="UNPAID">Unpaid</option>
            <option value="PARTIALLY_PAID">Partially Paid</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div className="md:col-span-3">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-850 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:border-red-600 transition-colors cursor-pointer"
          >
            <option value="ALL">All Fee Types</option>
            <option value="TUITION">Tuition Fee</option>
            <option value="ACCOMMODATION">Accommodation Fee</option>
            <option value="ACCEPTANCE">Acceptance Fee</option>
            <option value="LATE_REGISTRATION">Late Registration</option>
            <option value="OTHER">Other Fees</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
        {paginatedInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-4 px-5">Student / Payee</th>
                  <th className="py-4 px-5">Invoice No</th>
                  <th className="py-4 px-5">Fee Type</th>
                  <th className="py-4 px-5">Amount</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {paginatedInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="py-4 px-5 font-semibold text-slate-200">
                      {inv.user.firstName} {inv.user.lastName}
                      <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                        {inv.description}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-mono font-bold text-slate-350">{inv.invoiceNo}</td>
                    <td className="py-4 px-5">
                      <span className="bg-slate-900 px-2 py-0.5 rounded text-slate-300 border border-slate-800 font-bold text-[10px]">
                        {inv.feeType}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-mono font-bold text-slate-200">
                      ₦{inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                          inv.status === "PAID"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-900/30"
                            : inv.status === "UNPAID"
                            ? "bg-rose-950 text-rose-400 border border-rose-900/30"
                            : inv.status === "PARTIALLY_PAID"
                            ? "bg-amber-950 text-amber-400 border border-amber-900/30"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-450 font-medium">
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-500 font-bold uppercase tracking-widest text-[11px] bg-slate-950">
            No invoicing records found.
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-5 py-4 border-t border-slate-800 text-xs font-bold text-slate-400 bg-slate-950/40">
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

      {/* Dispatch Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl">
            {/* Modal Header */}
            <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/50">
              <h3 className="font-display font-black text-sm tracking-widest uppercase text-white">
                Dispatch Student Invoice
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-semibold text-slate-350">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Select Student Payee *</label>
                <select
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="p-3 bg-slate-900 border border-slate-850 rounded-xl focus:outline-none focus:border-red-600 text-slate-200 font-bold"
                >
                  {students.map((stu) => (
                    <option key={stu.id} value={stu.id}>
                      {stu.user.firstName} {stu.user.lastName} ({stu.matricNo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Billing Amount (₦) *</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="p-3 bg-slate-900 border border-slate-850 rounded-xl focus:outline-none focus:border-red-600 text-slate-200 font-mono font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Fee Category *</label>
                  <select
                    value={formData.feeType}
                    onChange={(e) => setFormData({ ...formData, feeType: e.target.value as any })}
                    className="p-3 bg-slate-900 border border-slate-850 rounded-xl focus:outline-none focus:border-red-600 text-slate-200 font-bold"
                  >
                    <option value="TUITION">Tuition Fees</option>
                    <option value="ACCOMMODATION">Hostel Accommodation</option>
                    <option value="ACCEPTANCE">Offer Acceptance</option>
                    <option value="LATE_REGISTRATION">Late Registration</option>
                    <option value="TRANSCRIPT">Official Transcript Fees</option>
                    <option value="OTHER">Other Academic Levies</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Invoice Description *</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Administrative Fees, Laboratory Materials"
                  className="p-3 bg-slate-900 border border-slate-850 rounded-xl focus:outline-none focus:border-red-600 text-slate-200"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Payment Due Date *</label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="p-3 bg-slate-900 border border-slate-850 rounded-xl focus:outline-none focus:border-red-600 text-slate-200"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-800 px-5 py-3 rounded-xl text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-red-950/10"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>{isPending ? "Dispatching..." : "Dispatch Invoice"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
