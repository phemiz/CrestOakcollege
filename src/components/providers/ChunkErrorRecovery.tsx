"use client";

import { useEffect } from "react";

export function ChunkErrorRecovery() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleWindowError = (event: ErrorEvent) => {
      const errorMsg = event?.message || event?.error?.message || "";
      if (
        errorMsg.includes("ChunkLoadError") ||
        errorMsg.includes("Loading chunk") ||
        errorMsg.includes("Failed to load chunk")
      ) {
        console.warn("ChunkLoadError detected. Hard reloading page to clear stale build cache...");
        const hasReloaded = sessionStorage.getItem("chunk_reload_attempt");
        if (!hasReloaded) {
          sessionStorage.setItem("chunk_reload_attempt", "true");
          window.location.reload();
        }
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event?.reason;
      const errorMsg = reason?.message || String(reason || "");
      if (
        reason?.name === "ChunkLoadError" ||
        errorMsg.includes("ChunkLoadError") ||
        errorMsg.includes("Loading chunk") ||
        errorMsg.includes("Failed to load chunk")
      ) {
        console.warn("Unhandled ChunkLoadError rejection detected. Reloading page...");
        const hasReloaded = sessionStorage.getItem("chunk_reload_attempt");
        if (!hasReloaded) {
          sessionStorage.setItem("chunk_reload_attempt", "true");
          window.location.reload();
        }
      }
    };

    window.addEventListener("error", handleWindowError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleWindowError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}
