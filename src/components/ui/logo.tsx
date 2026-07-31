import React from "react";
import Image from "next/image";

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  variant?: "crestoak";
  lightText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 60,
  showText = false,
  className,
  variant = "crestoak",
  lightText = false
}) => {
  const imgSrc = "/crestoak-logo.png";
  const imgAlt = "CrestOak College Seal";

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
        <div className="flex flex-col text-left max-w-[185px] sm:max-w-[280px] md:max-w-[320px] lg:max-w-none">
          <span 
            className={`font-display text-lg sm:text-xl font-black tracking-widest leading-none ${
              lightText 
                ? "text-white" 
                : "text-transparent bg-clip-text bg-gradient-to-r from-brand-blue-dark via-brand-blue to-brand-blue-light"
            }`}
          >
            CRESTOAK
          </span>
          <div className="flex flex-col mt-1 gap-0.5">
            <span 
              className={`text-[8.5px] sm:text-[9.5px] tracking-wider font-extrabold uppercase leading-none ${
                lightText ? "text-red-300" : "text-brand-red"
              }`}
            >
              College of Health Sciences
            </span>
            <span 
              className={`text-[7.5px] sm:text-[8.5px] tracking-[0.07em] font-bold uppercase leading-none ${
                lightText ? "text-slate-300" : "text-brand-blue"
              }`}
            >
              Management and Technology
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
