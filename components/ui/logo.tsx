import React from "react";
import Image from "next/image";

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  variant?: "crestoak" | "atiba";
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 60, 
  showText = false, 
  className,
  variant = "crestoak" 
}) => {
  const imgSrc = variant === "atiba" ? "/atiba-logo.png" : "/crestoak-logo.png";
  const imgAlt = variant === "atiba" ? "Atiba University Seal" : "CrestOak College Seal";

  return (
    <div className={`flex items-center gap-3 ${className || ""}`}>
      <div 
        className="relative flex items-center justify-center bg-white rounded-full p-0.5 shadow-sm border border-slate-100 overflow-hidden"
        style={{ width: size, height: size }}
      >
        <Image
          src={imgSrc}
          alt={imgAlt}
          width={size}
          height={size}
          className="object-contain rounded-full"
          priority
        />
      </div>
      {showText && (
        <div className="flex flex-col text-left">
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
