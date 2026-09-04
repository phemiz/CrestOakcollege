"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { 
  CreditCard, 
  CheckCircle2, 
  X, 
  Printer, 
  RefreshCw, 
  AlertTriangle,
  Receipt,
  FileText,
  ShieldCheck,
  ExternalLink,
  Loader2
} from "lucide-react";

interface Invoice {
  id: string;
  invoiceNo: string;
  amount: number;
  description: string;
  feeType: string;
  status: string;
  dueDate: string;
}

interface Payment {
  id: string;
  reference: string;
  amountPaid: number;
  method: string;
  status: string;
  paidAt: string;
  invoice: {
    invoiceNo: string;
    description: string;
  };
}

interface BillingClientViewProps {
  invoices: Invoice[];
  payments: Payment[];
  studentName: string;
  matricNo: string;
}

export default function BillingClientView({ invoices, payments, studentName, matricNo }: BillingClientViewProps) {
  const router = useRouter();

  const getCsrfToken = () => {
    if (typeof document === "undefined") return "";
    return document.cookie.split("; ").find(r => r.startsWith("cchsmt_csrf_token="))?.split("=")[1] || "";
  };
  
  // URL status states
  const [alertState, setAlertState] = useState<{ status: string | null; reference: string | null; error: string | null }>({ status: null, reference: null, error: null });

  // Checkout Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Manual payment recovery verification spinner
  const [verifyingPaymentId, setVerifyingPaymentId] = useState<string | null>(null);
  const [verificationFeedback, setVerificationFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Active receipt print state
  const [receiptToPrint, setReceiptToPrint] = useState<Payment | null>(null);

  // Extract URL parameters on load and clear them from history to avoid loops
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const status = params.get("status");
      const reference = params.get("reference");
      const error = params.get("error");

      if (status || error) {
        setAlertState({ status, reference, error });
        
        // Remove search params from browser URL bar without page reload
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, []);

  const openCheckout = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setCheckoutModalOpen(true);
    setErrorMessage(null);
    setIsProcessing(false);
  };

  const handlePaystackCheckout = async () => {
    if (!selectedInvoice) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/bursary/dashboard.php", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": getCsrfToken() },
        body: JSON.stringify({
          action: "initialize_payment",
          student_fee_id: selectedInvoice.id,
          amount: selectedInvoice.amount
        })
      });
      const data = await res.json();
      if (data.success && data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        setIsProcessing(false);
        setErrorMessage(data.message || "Could not initialize checkout with Paystack gateway.");
      }
    } catch {
      setIsProcessing(false);
      setErrorMessage("Network error initializing payment with server.");
    }
  };

  const handleRecoverPayment = async (paymentId: string, reference: string) => {
    setVerifyingPaymentId(paymentId);
    setVerificationFeedback(null);

    try {
      const res = await fetch("/api/bursary/dashboard.php", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": getCsrfToken() },
        body: JSON.stringify({ action: "verify_payment", reference })
      });
      const data = await res.json();
      setVerifyingPaymentId(null);

      if (data.success) {
        setVerificationFeedback({
          success: true,
          message: `Reference ${reference} verified successfully! Your account has been updated.`
        });
        router.refresh();
      } else {
        setVerificationFeedback({
          success: false,
          message: data.message || `Could not settle reference ${reference}. If you were charged, please contact Bursary.`
        });
      }
    } catch {
      setVerifyingPaymentId(null);
      setVerificationFeedback({
        success: false,
        message: `Network error verifying reference ${reference}.`
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* Dynamic payment completion alert banners */}
      {alertState.status === "success" && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 animate-fade-in-up print:hidden">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <div className="text-xs font-semibold">
            <p className="font-bold text-sm">Payment Successful!</p>
            <p className="mt-0.5">Your transaction with reference <code className="font-mono bg-emerald-100/50 px-1 py-0.5 rounded text-emerald-900">{alertState.reference}</code> has been verified and settled.</p>
          </div>
          <button onClick={() => setAlertState({ status: null, reference: null, error: null })} className="ml-auto p-1 text-emerald-600 hover:text-emerald-800 rounded-lg">
            <X size={14} />
          </button>
        </div>
      )}

      {alertState.status === "failed" && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-center gap-3 animate-fade-in-up print:hidden">
          <AlertTriangle size={20} className="text-red-600 shrink-0" />
          <div className="text-xs font-semibold">
            <p className="font-bold text-sm">Payment Verification Failed</p>
            <p className="mt-0.5">Reason: {alertState.error || "The gateway transaction was cancelled or declined."}</p>
          </div>
          <button onClick={() => setAlertState({ status: null, reference: null, error: null })} className="ml-auto p-1 text-red-600 hover:text-red-800 rounded-lg">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Manual verification feedback message */}
      {verificationFeedback && (
        <div className={`border p-4 rounded-2xl flex items-center gap-3 animate-fade-in print:hidden ${
          verificationFeedback.success 
            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
            : "bg-amber-50 border-amber-200 text-amber-800"
        }`}>
          {verificationFeedback.success ? (
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle size={20} className="text-amber-600 shrink-0" />
          )}
          <span className="text-xs font-semibold">{verificationFeedback.message}</span>
          <button onClick={() => setVerificationFeedback(null)} className="ml-auto p-1 rounded-lg">
            <X size={14} />
          </button>
        </div>
      )}

      {/* 1. OUTSTANDING INVOICES */}
      <div className="flex flex-col gap-4 print:hidden">
        <div>
          <h4 className="font-display font-black text-brand-blue-dark text-sm sm:text-base">Pending Invoices</h4>
          <p className="text-slate-400 text-xs mt-1">Review outstanding invoices and clear payments using secured gateways.</p>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4 py-3">Invoice No</th>
                <th className="p-4 py-3">Description</th>
                <th className="p-4 py-3">Fee Category</th>
                <th className="p-4 py-3 text-right">Amount</th>
                <th className="p-4 py-3 text-center">Due Date</th>
                <th className="p-4 py-3 text-center">Status</th>
                <th className="p-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {invoices.filter(i => i.status !== "PAID").length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-emerald-700 py-10 font-bold bg-emerald-50/20">
                    No pending invoices! All of your accounts are fully paid.
                  </td>
                </tr>
              ) : (
                invoices.filter(i => i.status !== "PAID").map((inv) => (
                  <tr key={inv.id}>
                    <td className="p-4 font-bold text-brand-blue-dark">{inv.invoiceNo}</td>
                    <td className="p-4">{inv.description}</td>
                    <td className="p-4 uppercase tracking-wider text-[10px] text-slate-500">{inv.feeType}</td>
                    <td className="p-4 text-right font-display text-brand-blue-dark">{formatNaira(inv.amount)}</td>
                    <td className="p-4 text-center text-slate-400">{inv.dueDate}</td>
                    <td className="p-4 text-center">
                      <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-black text-[10px]">
                        UNPAID
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openCheckout(inv)}
                        className="bg-brand-red hover:bg-brand-red/90 text-white font-display font-bold px-4 py-1.5 rounded-xl transition-all cursor-pointer text-[10px] uppercase shadow-sm flex items-center gap-1.5 ml-auto"
                      >
                        <CreditCard size={12} />
                        <span>Pay Invoice</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. PAYMENTS HISTORY & RECEIPTS */}
      <div className="flex flex-col gap-4 print:hidden">
        <div>
          <h4 className="font-display font-black text-brand-blue-dark text-sm sm:text-base">Transactions History & Receipts</h4>
          <p className="text-slate-400 text-xs mt-1">Audit past transactions, references, and verify or download e-receipts.</p>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4 py-3">Reference ID</th>
                <th className="p-4 py-3">Fee Description</th>
                <th className="p-4 py-3 text-right">Amount Paid</th>
                <th className="p-4 py-3 text-center">Date Paid/Created</th>
                <th className="p-4 py-3 text-center">Gateway Status</th>
                <th className="p-4 py-3 text-right">Receipt / Recovery</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-slate-400 py-10 font-bold bg-slate-50/50">
                    No transaction records exist.
                  </td>
                </tr>
              ) : (
                payments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50/40 transition-all">
                    <td className="p-4 font-mono font-bold text-brand-blue-dark truncate max-w-[180px]">{pay.reference}</td>
                    <td className="p-4">{pay.invoice.description}</td>
                    <td className="p-4 text-right font-display text-brand-blue-dark">{formatNaira(pay.amountPaid)}</td>
                    <td className="p-4 text-center text-slate-400">{pay.paidAt}</td>
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
                    <td className="p-4 text-right">
                      {pay.status === "PAID" ? (
                        <button
                          onClick={() => setReceiptToPrint(pay)}
                          className="border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold p-1.5 px-3 rounded-lg transition-all cursor-pointer text-[10px] uppercase flex items-center gap-1.5 ml-auto shadow-sm"
                        >
                          <Receipt size={12} className="text-brand-blue" />
                          <span>View Receipt</span>
                        </button>
                      ) : (
                        <button
                          disabled={verifyingPaymentId === pay.id}
                          onClick={() => handleRecoverPayment(pay.id, pay.reference)}
                          className="bg-brand-blue/10 border border-brand-blue/30 text-brand-blue hover:bg-brand-blue hover:text-white font-bold p-1.5 px-3 rounded-lg transition-all cursor-pointer text-[10px] uppercase flex items-center gap-1.5 ml-auto disabled:opacity-50"
                        >
                          {verifyingPaymentId === pay.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <RefreshCw size={12} />
                          )}
                          <span>Verify Payment</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. GATEWAY REDIRECTION CHEKOUT MODAL */}
      {checkoutModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setCheckoutModalOpen(false)} />
          
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 w-full max-w-md relative z-10 shadow-2xl overflow-hidden animate-scale-in">
            <button
              onClick={() => setCheckoutModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex flex-col gap-5">
              <div>
                <span className="text-[10px] text-brand-red font-black uppercase tracking-widest">Gateway Checkout</span>
                <h4 className="font-display font-black text-brand-blue-dark text-base mt-0.5 truncate" title={selectedInvoice.description}>
                  Pay {selectedInvoice.invoiceNo}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-normal truncate" title={selectedInvoice.description}>{selectedInvoice.description}</p>
              </div>

              {/* Amount display */}
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl text-center">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Total Payable Amount</span>
                <p className="text-2xl font-black font-display text-brand-blue-dark mt-0.5">{formatNaira(selectedInvoice.amount)}</p>
              </div>

              {/* Secure Info Box */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-[10px] font-semibold text-slate-500 leading-relaxed flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Secure Paystack Merchant Checkout</span>
                </div>
                <p>
                  You are about to be redirected to the secure **Paystack checkout gateway** to settle your tuition/school fees. You can pay using your debit cards, bank transfers, USSD, or QR codes.
                </p>
                <p className="text-[9px] text-slate-400">
                  * Note: Once payment is completed, you will be redirected back to the Student Portal to download your financial clearance receipt.
                </p>
              </div>

              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle size={14} className="text-red-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                onClick={handlePaystackCheckout}
                disabled={isProcessing}
                className="bg-brand-red hover:bg-brand-red/90 disabled:bg-slate-300 text-white font-display font-bold py-3 rounded-xl transition-colors cursor-pointer text-xs flex justify-center items-center gap-2 mt-2 shadow-md"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Connecting Paystack...</span>
                  </>
                ) : (
                  <>
                    <ExternalLink size={14} />
                    <span>Proceed to Paystack Checkout</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. PRINTABLE RECEIPTS RENDER overlay */}
      {receiptToPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:relative print:bg-white print:p-0 print:inset-auto">
          {/* Close button for UI */}
          <button
            onClick={() => setReceiptToPrint(null)}
            className="fixed top-4 right-4 p-2 bg-white rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 print:hidden cursor-pointer shadow-lg z-50 animate-fade-in"
          >
            <X size={18} />
          </button>

          {/* Printable Receipt template */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 w-full max-w-xl shadow-2xl relative overflow-hidden print:border-none print:shadow-none print:p-0">
            <div className="absolute top-0 left-0 right-0 h-2 bg-brand-blue" />
            
            <div className="flex justify-between items-start border-b border-slate-200 pb-5 mb-5 mt-2">
              <div>
                <h3 className="font-display font-black text-brand-blue-dark text-base sm:text-lg">CrestOak College Receipt</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Bursary Department Portal E-Receipt</p>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Receipt Number</span>
                <span className="text-sm font-black text-brand-blue font-display block">REC-{receiptToPrint.id.substring(0, 5).toUpperCase()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-150 p-4 rounded-xl mb-5">
              <div>
                <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider block">Student Name</span>
                <span className="font-bold text-brand-blue-dark block mt-0.5">{studentName}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider block">Matric Number</span>
                <span className="font-mono font-bold text-brand-blue-dark block mt-0.5">{matricNo}</span>
              </div>
              <div className="border-t border-slate-150 pt-2">
                <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider block">Payment Date</span>
                <span className="block mt-0.5">{receiptToPrint.paidAt}</span>
              </div>
              <div className="border-t border-slate-150 pt-2">
                <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider block">Payment Channel</span>
                <span className="font-bold text-brand-blue-light block mt-0.5 uppercase">{receiptToPrint.method}</span>
              </div>
            </div>

            <div className="border border-slate-150 rounded-xl overflow-hidden mb-6 text-xs font-semibold">
              <div className="bg-slate-50 border-b border-slate-150 p-3 text-slate-400 font-bold uppercase tracking-wider">Payment Details</div>
              <div className="p-4 flex flex-col gap-3 text-slate-700">
                <div className="flex justify-between">
                  <span>Description:</span>
                  <span className="font-bold text-brand-blue-dark">{receiptToPrint.invoice.description}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2">
                  <span>Reference ID:</span>
                  <span className="font-mono font-bold text-brand-blue-dark">{receiptToPrint.reference}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2">
                  <span>Invoice settled:</span>
                  <span className="font-mono font-bold text-brand-blue-dark">{receiptToPrint.invoice.invoiceNo}</span>
                </div>
              </div>
              <div className="bg-brand-blue text-white p-3 px-4 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">Amount Paid In Full</span>
                <span className="font-display font-black text-brand-gold text-sm sm:text-base">{formatNaira(receiptToPrint.amountPaid)}</span>
              </div>
            </div>

            {/* Receipt Footer stamp mockup */}
            <div className="flex justify-between items-center pt-2">
              <div className="text-[9px] text-slate-400 font-semibold leading-normal max-w-[280px]">
                * Note: This is a system-generated electronic receipt issued from CrestOak College Bursary server. It has been signed electronically and is legally binding.
              </div>
              <div className="h-16 w-16 border-2 border-dashed border-emerald-500 rounded-full flex flex-col justify-center items-center font-display text-[7px] font-black text-emerald-600 rotate-12 shrink-0 select-none opacity-85">
                <CheckCircle2 size={12} className="mb-0.5" />
                <span className="uppercase">PAID</span>
                <span className="uppercase text-[5px] text-slate-400 font-bold">BURSARY</span>
              </div>
            </div>

            {/* Print trigger button for modal visual view */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end gap-3 print:hidden">
              <button
                onClick={() => setReceiptToPrint(null)}
                className="border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold py-2.5 px-5 rounded-xl transition-all cursor-pointer text-xs"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="bg-brand-blue hover:bg-brand-blue-dark text-white font-display font-bold py-2.5 px-5 rounded-xl transition-all cursor-pointer text-xs flex items-center gap-1.5"
              >
                <Printer size={14} />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}