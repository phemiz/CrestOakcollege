"use client";

import React from "react";
import { BookOpen, Users, GraduationCap, Award } from "lucide-react";
import { useCountUp } from "@/hooks";

interface StatItemProps {
  value: string;
  label: string;
  icon: React.ElementType;
}

const StatCounter = ({ value, label, icon: Icon }: StatItemProps) => {
  const animatedValue = useCountUp(value);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-3 bg-brand-blue-dark/5 text-brand-blue rounded-xl shrink-0">
        <Icon size={26} className="text-brand-blue-light" />
      </div>
      <div>
        <p className="text-3xl font-extrabold text-brand-blue-dark font-display">
          {animatedValue}
        </p>
        <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
};

export const StatisticsSection = () => {
  return (
    <section className="bg-brand-bg-light pt-20 pb-10 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCounter value="25+" label="Accredited Programs" icon={BookOpen} />
          <StatCounter value="1200+" label="Active Students" icon={Users} />
          <StatCounter value="85+" label="Experienced Lecturers" icon={GraduationCap} />
          <StatCounter value="98%" label="Graduate Placement" icon={Award} />
        </div>
      </div>
    </section>
  );
};
