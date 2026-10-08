"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, Loader2 } from "lucide-react";

function readCsrf(): string {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(/(?:^|;\s*)cchsmt_csrf_token=([^;]*)/);
  return m && m[1] ? decodeURIComponent(m[1]) : "";
}

export default function FeeDeadlineCard({
  feeType = "ACCEPTANCE_FEE",
  session = "2026/2027",
  label = "Acceptance Fee Deadline",
}: {
  feeType?: string;
  session?: string;
  label?: string;
}) {
  const [date, setDate] = useState("");
  const [current, setCurrent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const csrfRef = useRef("");

  const load = () => {
    fetch("/api/bursary/fee-deadlines.php", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.csrf) csrfRef.current = d.csrf;
        const hit = (d?.deadlines || []).find(
          (x: any) => x.fee_type === feeType && x.session === session
        );
        setCurrent(hit ? hit.deadline_date : null);
        if (hit) setDate(hit.deadline_date);
      })
      .catch(() => setCurrent(null))
      .finally(() => setLoading(false));
  };

  useEffect(load, [feeType, session]);

  const save = async () => {
    setMsg(null);
    if (!date) return setMsg({ ok: false, text: "Pick a date first." });
    setSaving(true);
    try {
      const res = await fetch("/api/bursary/fee-deadlines.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfRef.current || readCsrf() },
        body: JSON.stringify({ session, feeType, deadlineDate: date }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setMsg({ ok: true, text: "Deadline saved. Students will see it on their dashboard." });
        load();
      } else {
        setMsg({ ok: false, text: data.message || "Could not save the deadline." });
      }
    } catch {
      setMsg({ ok: false, text: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm max-w-md">
      <div className="flex items-center gap-2 mb-1">
        <Calendar className="h-4 w-4 text-emerald-600" />
        <h4 className="font-bold text-slate-900 text-sm">{label}</h4>
      </div>
      <p className="text-xs text-slate-500 mb-3">
        Session {session}.{" "}
        {loading ? "Loading..." : current ? "Currently set to " + current + "." : "No deadline set yet."}
      </p>
      <div className="flex gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-blue-900 text-white font-bold text-sm px-4 py-2 flex items-center gap-2 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save
        </button>
      </div>
      {msg && (
        <p className={"text-xs font-semibold mt-2 " + (msg.ok ? "text-green-700" : "text-red-700")}>{msg.text}</p>
      )}
    </div>
  );
}