"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { 
  Calculator, 
  CreditCard, 
  Check, 
  Copy, 
  Printer, 
  AlertCircle, 
  Building, 
  GraduationCap, 
  Info, 
  Coins,
  FileText,
  QrCode
} from "lucide-react";

// Raw data structures
const facultyTuitions = [
  { name: "Education", amount: 250000, key: "education" },
  { name: "Health Sciences", amount: 400000, key: "health" },
  { name: "Management Sciences", amount: 250000, key: "management" },
  { name: "Physical Sciences", amount: 300000, key: "physical" },
  { name: "Social Sciences", amount: 250000, key: "social" },
  { name: "Law", amount: 400000, key: "law" }
];

const hostelOptions = [
  { name: "No Hostel Accommodation", amount: 0, key: "none" },
  { name: "6 Persons Per Room (One-Off)", amount: 200000, key: "six_persons" },
  { name: "4 Persons Per Room (One-Off)", amount: 250000, key: "four_persons" }
];

// Admin and Academic Charges
// Fees marked with * must be paid in full (mustPaidInFull: true)
const administrativeCharges = [
  { name: "Application Fee/Registration", amount: 20000, mustPaidInFull: true, key: "app_fee", defaultSelected: true },
  { name: "Acceptance Fee", amount: 50000, mustPaidInFull: true, key: "acceptance_fee", defaultSelected: true },
  { name: "Medical Test", amount: 10000, mustPaidInFull: true, key: "medical", defaultSelected: true },
  { name: "ID Card", amount: 10000, mustPaidInFull: true, key: "id_card", defaultSelected: true },
  { name: "Matriculation Fee", amount: 20000, mustPaidInFull: true, key: "matric", defaultSelected: true },
  { name: "Portal Maintenance Fee", amount: 10000, mustPaidInFull: true, key: "portal", defaultSelected: true },
  { name: "Departmental Dues (Per Semester)", amount: 5000, mustPaidInFull: true, key: "dept_dues", defaultSelected: true },
  { name: "Library Fee", amount: 10000, mustPaidInFull: false, key: "library", defaultSelected: true },
  { name: "Course Form", amount: 10000, mustPaidInFull: false, key: "course_form", defaultSelected: true },
  { name: "Polo Shirts", amount: 25000, mustPaidInFull: true, key: "polo", defaultSelected: true },
  { name: "Lab/Workshop Fee", amount: 15000, mustPaidInFull: false, key: "lab", defaultSelected: false, categorySpecific: ["health", "physical"] },
  { name: "Manual (Sciences)", amount: 15000, mustPaidInFull: true, key: "manual", defaultSelected: false, categorySpecific: ["health", "physical"] },
  { name: "Nursing Procedure", amount: 20000, mustPaidInFull: true, key: "nursing_proc", defaultSelected: false, categorySpecific: ["health"] },
  { name: "Entrepreneurship", amount: 60000, mustPaidInFull: false, key: "entrepreneurship", defaultSelected: false },
  { name: "Carryover Fees (Per Semester)", amount: 20000, mustPaidInFull: true, key: "carryover", defaultSelected: false }
];

export default function BursaryPage() {
  const [selectedFaculty, setSelectedFaculty] = useState("health");
  const [selectedHostel, setSelectedHostel] = useState("none");
  const [selectedCharges, setSelectedCharges] = useState<Record<string, boolean>>(() => {
    const initialCharges: Record<string, boolean> = {};
    administrativeCharges.forEach(charge => {
      if (charge.defaultSelected) {
        initialCharges[charge.key] = true;
      } else if (charge.categorySpecific && charge.categorySpecific.includes("health")) {
        initialCharges[charge.key] = true;
      } else {
        initialCharges[charge.key] = false;
      }
    });
    return initialCharges;
  });
  
  // Interactive UI feedbacks
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleFacultyChange = (facultyKey: string) => {
    setSelectedFaculty(facultyKey);
    const updatedCharges: Record<string, boolean> = {};
    administrativeCharges.forEach(charge => {
      if (charge.defaultSelected) {
        updatedCharges[charge.key] = true;
      } else if (charge.categorySpecific && charge.categorySpecific.includes(facultyKey)) {
        updatedCharges[charge.key] = true;
      } else {
        updatedCharges[charge.key] = false;
      }
    });
    setSelectedCharges(updatedCharges);
  };

  const toggleCharge = (key: string) => {
    setSelectedCharges(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getFacultyAmount = () => {
    return facultyTuitions.find(f => f.key === selectedFaculty)?.amount || 0;
  };

  const getHostelAmount = () => {
    return hostelOptions.find(h => h.key === selectedHostel)?.amount || 0;
  };

  // Calculations:
  // 1. Faculty Tuition is split 70% upfront, 30% balance
  // 2. All other fees marked as * mustPaidInFull are paid 100% upfront
  // 3. Optional fees not marked as * (e.g. Library Fee, Course Form, Lab, Entrepreneurship) are split 70% upfront, 30% balance (or we can assume tuition only has the 70/30 split, but here we'll split Tuition & other non-asterisk fees, and require asterisk fees in full)
  // Let's do:
  // - Tuition Upfront: 70% of Faculty Tuition
  // - Tuition Balance: 30% of Faculty Tuition
  // - Hostel: 100% Upfront (One-Off payment)
  // - Must Paid In Full Administrative Charges: 100% upfront
  // - Non-Must Paid In Full Administrative Charges: 100% upfront (usually registrations etc are paid fully upfront, but let's assume they are fully paid upfront as they are administrative, while only tuition is split. Wait, the prompt says "70% upfront payment is required upon receiving admission, while the remaining 30% balance must be paid before the semester examinations. Fees marked with (*) must be paid in full."
  // This implies that the Tuition itself and other standard fees are split, except those marked with (*). So:
  // Total Tuition = Faculty Fee
  // Total Admin/Other Split Fees = Sum of selected fees without (*)
  // Total Must Paid In Full Fees = Sum of selected fees with (*) + Hostel Fee
  // Upfront = 70% of (Tuition + Admin Split Fees) + 100% of Must Paid In Full Fees
  // Balance = 30% of (Tuition + Admin Split Fees)
  
  const getSplitCalculations = () => {
    const tuition = getFacultyAmount();
    const hostel = getHostelAmount();
    
    let splitAdminTotal = 0;
    let fullAdminTotal = 0;
    
    administrativeCharges.forEach(charge => {
      if (selectedCharges[charge.key]) {
        if (charge.mustPaidInFull) {
          fullAdminTotal += charge.amount;
        } else {
          splitAdminTotal += charge.amount;
        }
      }
    });

    const splittableTotal = tuition + splitAdminTotal;
    const upfrontSplittable = splittableTotal * 0.70;
    const balanceSplittable = splittableTotal * 0.30;
    
    const totalUpfront = upfrontSplittable + fullAdminTotal + hostel;
    const totalBalance = balanceSplittable;
    const grandTotal = tuition + hostel + splitAdminTotal + fullAdminTotal;

    return {
      tuition,
      hostel,
      splitAdminTotal,
      fullAdminTotal,
      totalUpfront,
      totalBalance,
      grandTotal
    };
  };

  const calcs = getSplitCalculations();

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0
    }).format(amount);
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <>
      <Header />

      <main className="flex-grow bg-slate-50 print:bg-white">
        {/* HERO SECTION */}
        <section className="bg-brand-blue-dark text-white py-20 relative overflow-hidden print:hidden">
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-blue/40 via-slate-900 to-slate-950" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10 text-center flex flex-col gap-4">
            <span className="text-brand-gold font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-1.5">
              <Coins size={14} className="text-brand-gold animate-bounce" />
              Bursary Department
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight">
              Approved Fee Structure
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto font-medium">
              Official fees schedules and installment payment pathways for the 2026/2027 Academic Session. Plan your education finances transparently.
            </p>
          </div>
        </section>

        {/* MAIN LAYOUT CONTAINER */}
        <section className="py-12 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: INTERACTIVE CALCULATOR (lg:col-span-7) */}
            <div className="lg:col-span-7 flex flex-col gap-8 print:col-span-12 print:w-full">
              
              {/* CALCULATOR CARD */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden print:border-none print:shadow-none print:p-0">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-blue print:hidden" />
                
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6 print:hidden">
                  <div className="p-2.5 bg-brand-blue-light/10 text-brand-blue-light rounded-2xl">
                    <Calculator size={22} />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-brand-blue-dark text-lg sm:text-xl">
                      Interactive Fees Calculator
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5">Select your faculty, hostel preferences, and extra fees to view splits.</p>
                  </div>
                </div>

                <div className="flex flex-col gap-6 print:hidden">
                  {/* Select Faculty */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <GraduationCap size={14} className="text-slate-400" />
                      1. Select Program Faculty
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {facultyTuitions.map((fac) => (
                        <button
                          key={fac.key}
                          onClick={() => handleFacultyChange(fac.key)}
                          className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col justify-center items-center gap-1 ${
                            selectedFaculty === fac.key
                              ? "border-brand-red bg-brand-red-light/10 text-brand-blue-dark font-bold shadow-sm"
                              : "border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold"
                          }`}
                        >
                          <span className="text-xs">{fac.name}</span>
                          <span className="text-[10px] text-slate-400">{formatNaira(fac.amount)}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Select Hostel Option */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Building size={14} className="text-slate-400" />
                      2. Hostel Accommodation Preferences (One-Off Payment)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {hostelOptions.map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => setSelectedHostel(opt.key)}
                          className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col justify-center items-center gap-1 ${
                            selectedHostel === opt.key
                              ? "border-brand-red bg-brand-red-light/10 text-brand-blue-dark font-bold shadow-sm"
                              : "border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold"
                          }`}
                        >
                          <span className="text-xs">{opt.name}</span>
                          <span className="text-[10px] text-slate-400">{opt.amount > 0 ? formatNaira(opt.amount) : "₦0"}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Optional and Administrative Charges */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText size={14} className="text-slate-400" />
                      3. Administrative & Academic Charges
                    </label>
                    <p className="text-[10px] text-slate-400 italic">Toggle charges to customize your calculation. Note: items marked with (*) must be paid in full upfront.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto border border-slate-100 p-3 rounded-2xl bg-slate-50/50">
                      {administrativeCharges.map((charge) => {
                        const isSelected = !!selectedCharges[charge.key];
                        return (
                          <div
                            key={charge.key}
                            onClick={() => toggleCharge(charge.key)}
                            className={`flex justify-between items-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? "border-brand-blue bg-white text-brand-blue-dark shadow-sm font-semibold"
                                : "border-slate-100 bg-white/50 hover:bg-white text-slate-500"
                            }`}
                          >
                            <div className="flex items-center gap-2 max-w-[70%]">
                              <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-all ${
                                isSelected ? "bg-brand-blue border-brand-blue text-white" : "border-slate-350 bg-white"
                              }`}>
                                {isSelected && <Check size={10} />}
                              </div>
                              <span className="text-[11px] truncate leading-tight">
                                {charge.name}{charge.mustPaidInFull ? " *" : ""}
                              </span>
                            </div>
                            <span className="text-[11px] font-display font-bold shrink-0">
                              {formatNaira(charge.amount)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* CALCULATIONS RESULTS PANEL */}
                <div className="mt-6 border-t border-slate-100 pt-6 flex flex-col gap-5">
                  <h4 className="font-display font-bold text-xs text-brand-blue-dark uppercase tracking-widest print:hidden">
                    Payment Invoice Breakdown
                  </h4>
                  
                  {/* Print invoice letterhead header (Visible ONLY when printing) */}
                  <div className="hidden print:flex items-center justify-between border-b-2 border-brand-blue-dark pb-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-brand-blue-dark font-bold font-display text-xs">
                        CCHSMT
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="font-display text-base font-black tracking-tight text-brand-blue-dark leading-none">CRESTOAK</span>
                        <div className="flex flex-col mt-0.5 gap-0.5">
                          <span className="text-[6.5px] tracking-wider font-extrabold text-brand-red uppercase leading-none">
                            College of Health Sciences
                          </span>
                          <span className="text-[5.5px] tracking-[0.05em] font-bold text-brand-blue uppercase leading-none">
                            Management and Technology
                          </span>
                        </div>
                        <span className="text-[5px] text-slate-400 leading-normal font-semibold mt-0.5">
                          Partnered & Supervised by Atiba University, Oyo.
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right text-[7px] font-bold text-slate-500 flex flex-col">
                      <span>Bursary Invoice Statement</span>
                      <span>Session: 2026/2027 Academic Session</span>
                      <span>Date Generated: {new Date().toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Split Summary Layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* TOTAL */}
                    <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl flex flex-col justify-between min-h-24">
                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Grand Total Amount</span>
                      <div>
                        <p className="text-lg sm:text-xl font-black text-brand-blue-dark font-display">{formatNaira(calcs.grandTotal)}</p>
                        <p className="text-[9px] text-slate-400 font-semibold mt-1">Tuition + Hostel + Charges</p>
                      </div>
                    </div>

                    {/* UPFRONT 70% */}
                    <div className="bg-brand-red-light/40 border border-brand-red/10 p-4 rounded-2xl flex flex-col justify-between min-h-24 relative overflow-hidden">
                      <div className="absolute top-0 right-0 px-2 py-0.5 bg-brand-red text-white text-[8px] font-bold rounded-bl-lg">
                        70% UPFRONT + 100% * FEES
                      </div>
                      <span className="text-slate-500 font-bold uppercase text-[9px] tracking-wider">Initial Upfront Deposit</span>
                      <div>
                        <p className="text-lg sm:text-xl font-black text-brand-red font-display">{formatNaira(calcs.totalUpfront)}</p>
                        <p className="text-[9px] text-brand-red/80 font-bold mt-1 uppercase">Required for Admission Seat</p>
                      </div>
                    </div>

                    {/* BALANCE 30% */}
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex flex-col justify-between min-h-24">
                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Remaining Balance</span>
                      <div>
                        <p className="text-lg sm:text-xl font-black text-emerald-800 font-display">{formatNaira(calcs.totalBalance)}</p>
                        <p className="text-[9px] text-emerald-600 font-bold mt-1 uppercase">Pay Before Examinations</p>
                      </div>
                    </div>
                  </div>

                  {/* Printable Detailed Table in Invoice mode */}
                  <div className="mt-4 border border-slate-150 rounded-2xl overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-150 flex justify-between">
                      <span>Item Description</span>
                      <span>Amount</span>
                    </div>
                    <div className="divide-y divide-slate-100 text-xs font-semibold text-slate-700 bg-white">
                      <div className="p-3 py-2.5 flex justify-between">
                        <span>Faculty Tuition ({facultyTuitions.find(f => f.key === selectedFaculty)?.name})</span>
                        <span className="font-display font-bold text-brand-blue-dark">{formatNaira(calcs.tuition)}</span>
                      </div>
                      {calcs.hostel > 0 && (
                        <div className="p-3 py-2.5 flex justify-between">
                          <span>Hostel Accommodation ({hostelOptions.find(h => h.key === selectedHostel)?.name})</span>
                          <span className="font-display font-bold text-brand-blue-dark">{formatNaira(calcs.hostel)}</span>
                        </div>
                      )}
                      {administrativeCharges.map((charge) => {
                        if (selectedCharges[charge.key]) {
                          return (
                            <div key={charge.key} className="p-3 py-2.5 flex justify-between pl-6 text-slate-500 bg-slate-50/30">
                              <span>{charge.name}{charge.mustPaidInFull ? " (*)" : ""}</span>
                              <span className="font-display font-bold">{formatNaira(charge.amount)}</span>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>

                  {/* Payment Policy Highlights */}
                  <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl text-[11px] leading-relaxed font-semibold text-slate-500 flex gap-2.5 items-start">
                    <Info size={16} className="text-brand-blue shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-brand-blue-dark">Installment Regulation Notes:</p>
                      <ul className="list-disc list-inside space-y-1 mt-1 font-medium text-slate-600">
                        <li>A minimum of <strong className="text-brand-blue-dark">70% upfront payment</strong> is required upon receiving admission.</li>
                        <li>The remaining <strong className="text-brand-blue-dark">30% balance</strong> must be paid in full before semester examinations.</li>
                        <li>Fees marked with <strong className="text-brand-red">(*)</strong> are administrative / regulatory charges and <strong className="text-brand-red">must be paid in full</strong> during the first installment.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-3 justify-end mt-2 print:hidden">
                    <button
                      onClick={triggerPrint}
                      className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-5 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Printer size={14} />
                      <span>Print Fee Invoice</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        // Show instructions overlay
                        const paymentSection = document.getElementById("bank-payment-info");
                        if (paymentSection) {
                          paymentSection.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                      className="bg-brand-red hover:bg-brand-red/90 text-white px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <CreditCard size={14} />
                      <span>View Payment Details</span>
                    </button>
                  </div>

                  {/* Print Footer Signature (Visible ONLY when printing) */}
                  <div className="hidden print:flex justify-between items-end border-t border-slate-200 pt-8 mt-8">
                    <div className="text-left">
                      <p className="font-bold text-slate-700">Official Bursary Department Seal</p>
                      <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">CrestOak College, Lagos Campus</p>
                      <div className="w-20 h-10 border border-dashed border-slate-300 rounded mt-2 flex items-center justify-center text-[7px] font-black text-slate-400 italic">
                        Bursar Signed
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-1 text-[7px] font-bold text-slate-400">
                      <QrCode size={40} className="text-slate-600" />
                      <span>Verify Invoice Credentials</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: RAW FEE SCHEDULES & PAYMENT DETAILS (lg:col-span-5) */}
            <div className="lg:col-span-5 flex flex-col gap-8 print:col-span-12 print:w-full print:mt-12">
              
              {/* BANK PAYMENT INFO CARD */}
              <div 
                id="bank-payment-info"
                className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden print:border-none print:shadow-none print:p-0"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-gold print:hidden" />
                
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                  <div className="p-2.5 bg-brand-gold/10 text-brand-gold rounded-2xl">
                    <Building size={22} className="text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-brand-blue-dark text-base sm:text-lg">
                      Official Bank Transfer Details
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5">Use this account details for all bank deposits & transfers.</p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 flex flex-col gap-4 font-semibold text-slate-700 text-xs">
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Bank Name</span>
                    <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100">
                      <span className="font-bold text-brand-blue-dark">First Bank of Nigeria</span>
                      <button 
                        onClick={() => copyToClipboard("First Bank of Nigeria", "bank")}
                        className="text-slate-400 hover:text-brand-blue p-1 rounded transition-colors cursor-pointer"
                      >
                        {copiedField === "bank" ? <span className="text-emerald-600 text-[10px] font-bold">Copied!</span> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Account Name</span>
                    <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100">
                      <span className="font-bold text-brand-blue-dark truncate max-w-[80%]">CrestOak College of Health Sciences Management and Technology</span>
                      <button 
                        onClick={() => copyToClipboard("CrestOak College of Health Sciences Management and Technology", "name")}
                        className="text-slate-400 hover:text-brand-blue p-1 rounded transition-colors cursor-pointer shrink-0"
                      >
                        {copiedField === "name" ? <span className="text-emerald-600 text-[10px] font-bold">Copied!</span> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Account Number</span>
                    <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100">
                      <span className="font-display font-black text-brand-red text-sm">1023948576</span>
                      <button 
                        onClick={() => copyToClipboard("1023948576", "number")}
                        className="text-slate-400 hover:text-brand-blue p-1 rounded transition-colors cursor-pointer"
                      >
                        {copiedField === "number" ? <span className="text-emerald-600 text-[10px] font-bold">Copied!</span> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-amber-50 text-amber-800 p-4 rounded-xl text-[11px] leading-relaxed font-semibold flex gap-2 items-start print:hidden">
                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Payment Notice Guidelines:</p>
                    <p className="mt-0.5 text-slate-600 font-medium">After performing a bank transfer, students must submit their transaction receipts to the Bursary Office or upload them via the Student Portal billing panel for invoice clearance.</p>
                  </div>
                </div>
              </div>

              {/* STATICS SCHEDULES DETAILS CARD */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden print:hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-blue-light" />
                
                <h3 className="font-display font-black text-brand-blue-dark text-base sm:text-lg border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                  <FileText size={18} className="text-brand-blue-light" />
                  Official Fee Structure Tables
                </h3>

                <div className="flex flex-col gap-6">
                  {/* Faculty Table */}
                  <div>
                    <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 mb-2.5">A. Faculty Fees (New Students)</h4>
                    <div className="border border-slate-150 rounded-xl overflow-hidden text-xs">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="p-3 py-2">Faculty</th>
                            <th className="p-3 py-2 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                          <tr>
                            <td className="p-3 py-2 bg-white">Education</td>
                            <td className="p-3 py-2 text-right font-display text-brand-blue-dark bg-white">₦250,000</td>
                          </tr>
                          <tr>
                            <td className="p-3 py-2 bg-slate-50/20">Health Sciences</td>
                            <td className="p-3 py-2 text-right font-display text-brand-blue-dark bg-slate-50/20">₦400,000</td>
                          </tr>
                          <tr>
                            <td className="p-3 py-2 bg-white">Management Sciences</td>
                            <td className="p-3 py-2 text-right font-display text-brand-blue-dark bg-white">₦250,000</td>
                          </tr>
                          <tr>
                            <td className="p-3 py-2 bg-slate-50/20">Physical Sciences</td>
                            <td className="p-3 py-2 text-right font-display text-brand-blue-dark bg-slate-50/20">₦300,000</td>
                          </tr>
                          <tr>
                            <td className="p-3 py-2 bg-white">Social Sciences</td>
                            <td className="p-3 py-2 text-right font-display text-brand-blue-dark bg-white">₦250,000</td>
                          </tr>
                          <tr>
                            <td className="p-3 py-2 bg-slate-50/20">Law</td>
                            <td className="p-3 py-2 text-right font-display text-brand-blue-dark bg-slate-50/20">₦400,000</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Hostel Table */}
                  <div>
                    <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 mb-2.5">B. Hostel Accommodation</h4>
                    <div className="border border-slate-150 rounded-xl overflow-hidden text-xs">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="p-3 py-2">Hostel Room Type</th>
                            <th className="p-3 py-2 text-right">One-Off Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                          <tr>
                            <td className="p-3 py-2 bg-white">6 Persons Per Room</td>
                            <td className="p-3 py-2 text-right font-display text-brand-blue-dark bg-white">₦200,000</td>
                          </tr>
                          <tr>
                            <td className="p-3 py-2 bg-slate-50/20">4 Persons Per Room</td>
                            <td className="p-3 py-2 text-right font-display text-brand-blue-dark bg-slate-50/20">₦250,000</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
