"use client";

import React from "react";
import { X } from "lucide-react";

interface OtpModalProps {
  email: string;
  phone: string;
  otpInput: string;
  setOtpInput: (val: string) => void;
  otpError: string;
  onClose: () => void;
  onVerify: () => void;
}

export const OtpModal: React.FC<OtpModalProps> = ({
  email,
  phone,
  otpInput,
  setOtpInput,
  otpError,
  onClose,
  onVerify
}) => {
  return (
    <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-sm flex justify-center items-center px-4">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col gap-6 relative">
        <button
          onClick={onClose}
          className="absolute top-0 right-0 p-4 text-slate-400 hover:text-slate-600"
        >
          <X size={18} />
        </button>
        
        <div className="text-center flex flex-col gap-2">
          <h4 className="font-display font-extrabold text-brand-blue-dark text-lg">OTP Verification Audit</h4>
          <p className="text-slate-500 text-xs leading-relaxed font-semibold">
            We sent a 4-digit code to <strong className="text-brand-blue-dark">{email}</strong> and SMS to <strong className="text-brand-blue-dark">{phone}</strong>.
          </p>
        </div>

        {otpError && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs font-bold text-center">
            {otpError}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <input
            type="text"
            maxLength={4}
            placeholder="Enter 4-digit Code"
            value={otpInput}
            onChange={(e) => setOtpInput(e.target.value)}
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg font-black focus:outline-none focus:border-brand-blue"
          />
          <p className="text-[10px] text-slate-400 text-center font-bold">Use code <strong className="text-brand-blue-dark font-black">1234</strong> or <strong className="text-brand-blue-dark font-black">4321</strong> for testing</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-display font-bold py-3.5 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onVerify}
            className="flex-1 bg-brand-red hover:bg-brand-red/90 text-white font-display font-bold py-3.5 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Verify Code
          </button>
        </div>
      </div>
    </div>
  );
};
