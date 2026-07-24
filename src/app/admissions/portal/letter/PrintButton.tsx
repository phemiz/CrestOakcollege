"use client";

import React from "react";
import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-indigo-650 hover:bg-indigo-700 text-white font-display font-bold py-2.5 px-5 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-900/10"
    >
      <Printer className="h-4 w-4" />
      <span>Print PDF Letter</span>
    </button>
  );
}
