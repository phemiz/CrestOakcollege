import React from "react";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 80, showText = false, className, ...props }) => {
  return (
    <div className={`flex items-center gap-3 ${className || ""}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-md"
        {...props}
      >
        {/* Background Circle */}
        <circle cx="250" cy="250" r="230" fill="white" />

        {/* Definitions for Text Paths */}
        <defs>
          {/* Top arc (clockwise) for "CrestOak College of Health Sciences" */}
          <path
            id="topTextPath"
            d="M 90,250 A 160,160 0 1,1 410,250"
            fill="none"
          />
          {/* Bottom arc (clockwise but path goes left to right along the bottom) */}
          <path
            id="bottomTextPath"
            d="M 90,250 A 160,160 0 0,0 410,250"
            fill="none"
          />
        </defs>

        {/* 5 Stars at the Top */}
        <g fill="#081C36">
          <polygon points="250,30 254,39 264,39 256,45 259,54 250,48 241,54 244,45 236,39 246,39" /> {/* Center - Big */}
          <polygon points="215,38 218,46 227,46 220,51 222,59 215,54 208,59 210,51 203,46 212,46" transform="rotate(-8 215 48)" />
          <polygon points="285,38 288,46 297,46 290,51 292,59 285,54 278,59 280,51 273,46 282,46" transform="rotate(8 285 48)" />
          <polygon points="180,52 183,59 191,59 185,64 187,71 180,67 173,71 175,64 169,59 177,59" transform="rotate(-16 180 62)" />
          <polygon points="320,52 323,59 331,59 325,64 327,71 320,67 313,71 315,64 309,59 317,59" transform="rotate(16 320 62)" />
        </g>

        {/* Laurel Wreath (Laurel Leaves on Left and Right) */}
        <g stroke="#081C36" strokeWidth="4" fill="#081C36" strokeLinecap="round">
          {/* Left Wreath Branch */}
          <path d="M 110,360 C 70,300 70,180 115,110" fill="none" strokeWidth="6" />
          {/* Leaves Left */}
          <path d="M 102,345 C 90,340 85,325 95,320 C 105,315 108,330 102,345 Z" />
          <path d="M 90,310 C 80,305 75,290 85,285 C 95,280 98,295 90,310 Z" />
          <path d="M 82,270 C 72,265 67,250 77,245 C 87,240 90,255 82,270 Z" />
          <path d="M 80,225 C 70,220 65,205 75,200 C 85,195 88,210 80,225 Z" />
          <path d="M 83,180 C 73,175 68,160 78,155 C 88,150 91,165 83,180 Z" />
          <path d="M 91,140 C 81,135 78,120 88,115 C 98,110 101,125 91,140 Z" />
          <path d="M 108,105 C 100,98 97,85 107,80 C 117,75 120,90 108,105 Z" />

          {/* Right Wreath Branch */}
          <path d="M 390,360 C 430,300 430,180 385,110" fill="none" strokeWidth="6" />
          {/* Leaves Right */}
          <path d="M 398,345 C 410,340 415,325 405,320 C 395,315 392,330 398,345 Z" />
          <path d="M 410,310 C 420,305 425,290 415,285 C 405,280 402,295 410,310 Z" />
          <path d="M 418,270 C 428,265 433,250 423,245 C 413,240 410,255 418,270 Z" />
          <path d="M 420,225 C 430,220 435,205 425,200 C 415,195 412,210 420,225 Z" />
          <path d="M 417,180 C 427,175 432,160 422,155 C 412,150 409,165 417,180 Z" />
          <path d="M 409,140 C 419,135 422,120 412,115 C 402,110 399,125 409,140 Z" />
          <path d="M 392,105 C 400,98 403,85 393,80 C 383,75 380,90 392,105 Z" />
        </g>

        {/* Inner Circle Frame (Red & Blue Double Ring) */}
        <circle cx="250" cy="250" r="185" stroke="#081C36" strokeWidth="4" />
        <circle cx="250" cy="250" r="180" stroke="#D62246" strokeWidth="3" />
        <circle cx="250" cy="250" r="145" stroke="#D62246" strokeWidth="2" />
        <circle cx="250" cy="250" r="140" stroke="#081C36" strokeWidth="4" fill="#ffffff" />

        {/* Text inside the ring */}
        {/* Top Text: "CrestOak College of Health Sciences" */}
        <text fontFamily="var(--font-montserrat), sans-serif" fontSize="18" fontWeight="bold" fill="#D62246">
          <textPath href="#topTextPath" startOffset="50%" textAnchor="middle">
            CrestOak College of Health Sciences
          </textPath>
        </text>

        {/* Separator Dots (Red) */}
        <circle cx="95" cy="250" r="6" fill="#D62246" />
        <circle cx="405" cy="250" r="6" fill="#D62246" />

        {/* Bottom Text: "Management and Technology" */}
        {/* We invert path direction to keep bottom text upright */}
        <path id="bottomTextPathCorrected" d="M 400,262 A 160,160 0 0,1 100,262" fill="none" />
        <text fontFamily="var(--font-montserrat), sans-serif" fontSize="18" fontWeight="bold" fill="#D62246">
          <textPath href="#bottomTextPathCorrected" startOffset="50%" textAnchor="middle">
            Management and Technology
          </textPath>
        </text>

        {/* INNER CORE DESIGN */}
        {/* Rising Sun Background */}
        <g>
          {/* Sun Rays */}
          <line x1="250" y1="230" x2="250" y2="150" stroke="#EEB902" strokeWidth="4" strokeLinecap="round" />
          <line x1="250" y1="230" x2="210" y2="160" stroke="#EEB902" strokeWidth="4" strokeLinecap="round" />
          <line x1="250" y1="230" x2="290" y2="160" stroke="#EEB902" strokeWidth="4" strokeLinecap="round" />
          <line x1="250" y1="230" x2="180" y2="185" stroke="#EEB902" strokeWidth="4" strokeLinecap="round" />
          <line x1="250" y1="230" x2="320" y2="185" stroke="#EEB902" strokeWidth="4" strokeLinecap="round" />
          <line x1="250" y1="230" x2="160" y2="220" stroke="#EEB902" strokeWidth="4" strokeLinecap="round" />
          <line x1="250" y1="230" x2="340" y2="220" stroke="#EEB902" strokeWidth="4" strokeLinecap="round" />

          {/* Golden/Orange Sun Dome */}
          <path d="M 185,240 A 65,65 0 0,1 315,240 Z" fill="#E8A838" />
          <path d="M 190,240 A 60,60 0 0,1 310,240 Z" fill="#EEB902" />
        </g>

        {/* Open Book */}
        {/* Outer Pages Shadow */}
        <path
          d="M 250,290 C 220,260 170,260 150,265 L 150,335 C 170,330 220,330 250,358 C 280,330 330,330 350,335 L 350,265 C 330,260 280,260 250,290 Z"
          fill="#081C36"
        />
        {/* Inner Pages (White) */}
        <path
          d="M 250,285 C 222,258 175,258 155,262 L 155,328 C 175,324 222,324 250,350 C 278,324 325,324 345,328 L 345,262 C 325,258 278,258 250,285 Z"
          fill="white"
          stroke="#081C36"
          strokeWidth="3"
        />
        {/* Book Lines (Left and Right) */}
        <path d="M 170,280 C 190,278 215,278 235,285" stroke="#081C36" strokeWidth="2" strokeLinecap="round" />
        <path d="M 170,295 C 190,293 215,293 235,300" stroke="#081C36" strokeWidth="2" strokeLinecap="round" />
        <path d="M 170,310 C 190,308 215,308 235,315" stroke="#081C36" strokeWidth="2" strokeLinecap="round" />

        <path d="M 330,280 C 310,278 285,278 265,285" stroke="#081C36" strokeWidth="2" strokeLinecap="round" />
        <path d="M 330,295 C 310,293 285,293 265,300" stroke="#081C36" strokeWidth="2" strokeLinecap="round" />
        <path d="M 330,310 C 310,308 285,308 265,315" stroke="#081C36" strokeWidth="2" strokeLinecap="round" />

        {/* Fountain Pen Tip (Placed vertically in the center) */}
        <g stroke="#081C36" strokeWidth="3" strokeLinejoin="round">
          {/* Pen Body & Tip Base */}
          <path d="M 242,325 L 242,350 L 258,350 L 258,325 L 250,300 Z" fill="#081C36" />
          {/* Nib Detail (Silver/White part in center) */}
          <path d="M 246,325 L 246,345 L 254,345 L 254,325 L 250,308 Z" fill="white" />
          {/* Slit line */}
          <line x1="250" y1="308" x2="250" y2="340" stroke="#081C36" strokeWidth="2" />
          {/* Breather Hole */}
          <circle cx="250" cy="322" r="3" fill="#081C36" />
        </g>

        {/* CCHS-MT Label */}
        <text
          x="250"
          y="390"
          fontFamily="var(--font-montserrat), sans-serif"
          fontSize="24"
          fontWeight="900"
          fill="#081C36"
          textAnchor="middle"
          letterSpacing="1"
        >
          CCHSMT
        </text>

        {/* Slogan Banner Ribbons (Outer Bottom) */}
        {/* Ribbon Left fold */}
        <path d="M 60,420 L 90,390 L 90,440 Z" fill="#030A14" />
        {/* Ribbon Right fold */}
        <path d="M 440,420 L 410,390 L 410,440 Z" fill="#030A14" />

        {/* Main Ribbon Center */}
        <path
          d="M 80,410 C 150,440 350,440 420,410 L 440,450 C 360,485 140,485 60,450 Z"
          fill="#133B68"
          stroke="#081C36"
          strokeWidth="3"
        />

        {/* Slogan text: "IGNITING CHANGES THROUGH KNOWLEDGE" */}
        <path id="sloganPath" d="M 85,446 C 155,472 345,472 415,446" fill="none" />
        <text fontFamily="var(--font-montserrat), sans-serif" fontSize="14" fontWeight="bold" fill="white">
          <textPath href="#sloganPath" startOffset="50%" textAnchor="middle">
            IGNITING CHANGES THROUGH KNOWLEDGE
          </textPath>
        </text>
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className="font-display text-xl font-bold tracking-tight text-brand-blue-dark leading-none">
            CRESTOAK
          </span>
          <span className="text-[10px] tracking-widest font-semibold text-brand-red leading-none mt-1">
            COLLEGE OF HEALTH SCIENCES
          </span>
        </div>
      )}
    </div>
  );
};
