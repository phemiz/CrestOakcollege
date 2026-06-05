import React from "react";
import Image from "next/image";

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 60, showText = false, className }) => {
  return (
    <div className={`flex items-center gap-3 ${className || ""}`}>
      <div 
        className="relative flex items-center justify-center bg-white rounded-full p-0.5 shadow-sm border border-slate-100 overflow-hidden"
        style={{ width: size, height: size }}
      >
        <Image
          src="/crestoak-logo.png"
          alt="CrestOak College Seal Logo"
          width={size}
          height={size}
          className="object-contain rounded-full"
          priority
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="font-display text-lg font-bold tracking-tight text-brand-blue-dark leading-none">
            CRESTOAK
          </span>
          <span className="text-[8px] tracking-widest font-semibold text-brand-red leading-none mt-1 uppercase">
            College of Health Sciences
          </span>
        </div>
      )}
    </div>
  );
};
