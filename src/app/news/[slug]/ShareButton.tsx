"use client";

import React from "react";
import { Share2 } from "lucide-react";

interface ShareButtonProps {
  title?: string;
}

export default function ShareButton({ title }: ShareButtonProps) {
  const handleShare = () => {
    if (typeof window !== "undefined") {
      if (navigator.share) {
        navigator
          .share({
            title: title || "CrestOak College News",
            url: window.location.href,
          })
          .catch(console.error);
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert("Article link copied to clipboard!");
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-xs font-bold text-slate-600 cursor-pointer"
    >
      <Share2 size={13} />
      <span>Share Article</span>
    </button>
  );
}
