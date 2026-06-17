"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { facultyTuitions, hostelOptions } from "@/data/admissionsData";

export const FeesCalculatorTab = () => {
  const [admFeeFaculty, setAdmFeeFaculty] = useState("health");
  const [admFeeHostel, setAdmFeeHostel] = useState("none");

  const selectedFacultyAmount = facultyTuitions.find(f => f.key === admFeeFaculty)?.amount || 0;
  const selectedHostelAmount = hostelOptions.find(o => o.key === admFeeHostel)?.amount || 0;

  // Administrative charges
  const getAdminChargesTotal = () => {
    let totalCharges = 170000; // default sum
    if (admFeeFaculty === "health") totalCharges += 55000;
    else if (admFeeFaculty === "physical") totalCharges += 30000;
    return totalCharges;
  };

  const grandTotal = selectedFacultyAmount + selectedHostelAmount + getAdminChargesTotal();

  const getUpfrontPayment = () => {
    const tuition = selectedFacultyAmount;
    const hostel = selectedHostelAmount;
    
    let splitAdminTotal = 20000; // Library 10k + Course Form 10k
    if (admFeeFaculty === "health" || admFeeFaculty === "physical") {
      splitAdminTotal += 15000; // Lab 15k
    }
    
    let fullAdminTotal = 150000; // default full admin charges
    if (admFeeFaculty === "health") {
      fullAdminTotal += 35000; // Manual 15k + Nursing 20k
    } else if (admFeeFaculty === "physical") {
      fullAdminTotal += 15000; // Manual 15k
    }

    const upfrontSplittable = (tuition + splitAdminTotal) * 0.70;
    return Math.round(upfrontSplittable + fullAdminTotal + hostel);
  };

  const getRemainingBalance = () => {
    const tuition = selectedFacultyAmount;
    let splitAdminTotal = 20000;
    if (admFeeFaculty === "health" || admFeeFaculty === "physical") {
      splitAdminTotal += 15000;
    }
    return Math.round((tuition + splitAdminTotal) * 0.30);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display font-extrabold text-brand-blue-dark text-lg">Approved Fee Structure (2026/2027)</h3>
              <p className="text-slate-400 text-xs mt-1">Review the dynamic tuition calculator for customized estimates.</p>
            </div>
            <Link href="/bursary">
              <button className="text-[10px] font-bold tracking-wider uppercase text-brand-blue-light hover:underline flex items-center gap-1">
                Full Guide <ArrowRight size={12} />
              </button>
            </Link>
          </div>

          {/* Faculty Select */}
          <div className="flex flex-col gap-2.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Select Faculty Pathway</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {facultyTuitions.map(fac => (
                <button
                  key={fac.key}
                  type="button"
                  onClick={() => setAdmFeeFaculty(fac.key)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    admFeeFaculty === fac.key
                      ? "border-brand-red bg-brand-red-light/10 text-brand-blue-dark font-bold"
                      : "border-slate-100 bg-slate-50 text-slate-600 font-semibold"
                  }`}
                >
                  <p>{fac.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">₦{fac.amount.toLocaleString()}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Hostel Accommodation */}
          <div className="flex flex-col gap-2.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Hostel Accommodation Options</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {hostelOptions.map(opt => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setAdmFeeHostel(opt.key)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    admFeeHostel === opt.key
                      ? "border-brand-red bg-brand-red-light/10 text-brand-blue-dark font-bold"
                      : "border-slate-100 bg-slate-50 text-slate-600 font-semibold"
                  }`}
                >
                  <p>{opt.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{opt.amount > 0 ? `₦${opt.amount.toLocaleString()}` : "₦0"}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Split Results */}
          <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex flex-col gap-3 font-semibold text-xs text-slate-600">
            <div className="flex justify-between items-center text-sm font-bold text-brand-blue-dark">
              <span>Grand Total Estimate</span>
              <span className="font-display font-black text-brand-red text-base">
                ₦{grandTotal.toLocaleString()}
              </span>
            </div>
            <hr className="border-slate-200" />
            
            {/* Upfront split */}
            <div className="flex justify-between items-center text-brand-blue-dark">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold">Initial Upfront Deposit (70% Upfront + 100% * Fees)</span>
                <span className="text-[10px] text-slate-400 font-medium">Due upon provisional admission offer acceptance</span>
              </div>
              <span className="font-display font-black text-sm bg-brand-red-light text-brand-red px-2.5 py-1.5 rounded-xl">
                ₦{getUpfrontPayment().toLocaleString()}
              </span>
            </div>

            {/* Balance split */}
            <div className="flex justify-between items-center text-brand-blue-dark">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold">Remaining Balance Due (30% Tuition)</span>
                <span className="text-[10px] text-slate-400 font-medium">Payable before the commencement of semester examinations</span>
              </div>
              <span className="font-display font-black text-sm bg-emerald-50 text-emerald-800 px-2.5 py-1.5 rounded-xl">
                ₦{getRemainingBalance().toLocaleString()}
              </span>
            </div>
          </div>
          
          <div className="text-center pt-2">
            <Link href="/bursary" className="text-brand-red hover:underline text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1">
              <span>Open Detailed Fee Calculator & Bank Coordinates</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 flex flex-col gap-6">
        {/* Account detail card */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-gold" />
          <div>
            <h4 className="font-display font-bold text-brand-blue-dark text-[13px] sm:text-sm">Installment Regulation</h4>
            <p className="text-slate-400 text-[10px] mt-1 leading-relaxed">
              70% upfront payment is required upon receiving admission, while the remaining 30% balance must be paid before examinations. Fees marked with (*) must be paid in full.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
