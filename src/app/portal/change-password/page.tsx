"use client";

import { useState } from "react";
import { Loader2, Lock } from "lucide-react";

function readCsrf(): string {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(/(?:^|;\s*)cchsmt_csrf_token=([^;]*)/);
  if (m && m[1]) return decodeURIComponent(m[1]);
  try {
    return localStorage.getItem("csrfToken") || "";
  } catch {
    return "";
  }
}

function clearMustChangeFlag() {
  for (const key of ["user", "cchsmt_user_session", "crestoak_session"]) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const obj = JSON.parse(raw);
      if (obj && typeof obj === "object") {
        obj.mustChangePassword = false;
        localStorage.setItem(key, JSON.stringify(obj));
      }
    } catch {}
  }
}

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cur = currentPassword.trim();
    const next = newPassword.trim();
    if (!cur || !next) return setError("Please fill in all fields.");
    if (next.length < 8) return setError("New password must be at least 8 characters.");
    if (!/[A-Za-z]/.test(next) || !/[0-9]/.test(next)) {
      return setError("New password must contain at least one letter and one number.");
    }
    if (next !== confirmPassword.trim()) return setError("New password and confirmation do not match.");
    if (next === cur) return setError("New password must be different from your current password.");

    setLoading(true);
    try {
      const res = await fetch("/api/student/change-password.php", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": readCsrf(),
        },
        body: JSON.stringify({ currentPassword: cur, newPassword: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        clearMustChangeFlag();
        setDone(true);
        setTimeout(() => {
          window.location.href = "/portal/dashboard/";
        }, 1200);
      } else {
        setError(data.message || "Could not change password. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
          <Lock className="h-5 w-5" />
        </div>
        <h1 className="font-display font-extrabold text-slate-900 text-xl">Set Your New Password</h1>
      </div>
      <p className="text-slate-500 text-sm mb-6">
        For your security, replace the temporary password from your welcome email before using the portal.
      </p>

      {done ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 text-green-800 text-sm font-semibold p-4">
          Password changed. Taking you to your dashboard...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 text-sm font-semibold p-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Temporary password</label>
            <input
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">New password</label>
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">At least 8 characters, with a letter and a number.</p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Confirm new password</label>
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-900 text-white font-bold text-sm py-3 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? "Saving..." : "Change Password"}
          </button>
        </form>
      )}
    </div>
  );
}