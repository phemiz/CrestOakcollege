import React from "react";
import Image from "next/image";

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  variant?: "crestoak" | "atiba";
  lightText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 60,
  showText = false,
  className,
  variant = "crestoak",
  lightText = false
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
        <div className="flex flex-col text-left max-w-[180px] sm:max-w-[260px] md:max-w-[320px] lg:max-w-none">
          <span className={`font-display text-lg font-bold tracking-tight leading-none ${lightText ? "text-white" : "text-brand-blue-dark"}`}>
            CRESTOAK
          </span>
          <span className={`text-[8px] tracking-[0.05em] font-semibold leading-tight mt-1 uppercase ${lightText ? "text-slate-300" : "text-brand-red"}`}>
            College of Health Sciences Management and Technology
          </span>
        </div>
      )}
    </div>
  );
};
