"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isChunkError =
    error?.name === "ChunkLoadError" ||
    error?.message?.includes("ChunkLoadError") ||
    error?.message?.includes("Loading chunk") ||
    error?.message?.includes("Failed to load chunk");

  useEffect(() => {
    console.error("Application error boundary caught:", error);
    if (isChunkError) {
      const hasReloaded = sessionStorage.getItem("chunk_boundary_reload");
      if (!hasReloaded) {
        sessionStorage.setItem("chunk_boundary_reload", "true");
        window.location.reload();
      }
    }
  }, [error, isChunkError]);

  const handleRetry = () => {
    if (isChunkError) {
      window.location.reload();
    } else {
      reset();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-sans p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-100">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600">Application Error</span>
          <h1 className="text-2xl font-display font-extrabold text-slate-900">
            {isChunkError ? "Updating Application Assets..." : "Something Went Wrong"}
          </h1>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {isChunkError
              ? "A new version of the website is available. Click below to refresh your session."
              : "An unexpected client-side error occurred. You can retry loading the component or return to the main dashboard."}
          </p>
        </div>
        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleRetry}
            className="inline-flex items-center justify-center gap-2 bg-brand-blue hover:bg-brand-blue-dark text-white font-bold px-5 py-3 rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{isChunkError ? "Reload Page" : "Try Again"}</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-5 py-3 rounded-xl text-xs transition-colors no-underline"
          >
            <Home className="w-4 h-4" />
            <span>Go Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

