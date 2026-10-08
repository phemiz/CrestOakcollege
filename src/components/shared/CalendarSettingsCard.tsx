"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, Loader2 } from "lucide-react";

export type CalendarSettings = {
  session: string;
  semester: string;
  regStartDate: string;
  regEndDate: string;
  lateRegEndDate: string;
  examStartDate: string;
  examEndDate: string;
  examPublishStatus: "Draft" | "Published" | "Under Revision";
};

const dateFields: { key: keyof CalendarSettings; label: string }[] = [
  { key: "regStartDate", label: "Registration opens" },
  { key: "regEndDate", label: "Registration deadline" },
  { key: "lateRegEndDate", label: "Late registration cut-off" },
  { key: "examStartDate", label: "Exams start" },
  { key: "examEndDate", label: "Exams end" },
];

export default function CalendarSettingsCard({
  initial,
  onChange,
}: {
  initial: CalendarSettings;
  onChange?: (s: CalendarSettings) => void;
}) {
  const [form, setForm] = useState<CalendarSettings>(initial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const csrfRef = useRef("");

  useEffect(() => {
    fetch("/api/registrar/calendar-settings.php", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.csrf) csrfRef.current = d.csrf;
        if (d?.settings) {
          setForm(d.settings);
          onChange?.(d.settings);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k: keyof CalendarSettings, v: string) =>
    setForm((p) => ({ ...p, [k]: v }) as CalendarSettings);

  const save = async () => {
    setMsg(null);
    setSaving(true);
    try {
      const res = await fetch("/api/registrar/calendar-settings.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfRef.current },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setMsg({ ok: true, text: "Academic calendar saved." });
        onChange?.(form);
      } else {
        setMsg({ ok: false, text: data.message || "Could not save the calendar." });
      }
    } catch {
      setMsg({ ok: false, text: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const input = "w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <CalendarDays className="h-4 w-4 text-emerald-600" />
        <h4 className="font-bold text-slate-900 text-sm">Edit Academic Calendar</h4>
      </div>
      <p className="text-xs text-slate-500 mb-4">{loading ? "Loading saved dates..." : "Changes are saved for everyone."}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="text-xs font-bold text-slate-700">
          Session
          <input className={input} value={form.session} onChange={(e) => set("session", e.target.value)} />
        </label>
        <label className="text-xs font-bold text-slate-700">
          Semester
          <input className={input} value={form.semester} onChange={(e) => set("semester", e.target.value)} />
        </label>
        {dateFields.map((f) => (
          <label key={f.key} className="text-xs font-bold text-slate-700">
            {f.label}
            <input type="date" className={input} value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} />
          </label>
        ))}
        <label className="text-xs font-bold text-slate-700">
          Exam timetable status
          <select className={input} value={form.examPublishStatus} onChange={(e) => set("examPublishStatus", e.target.value)}>
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
            <option value="Under Revision">Under Revision</option>
          </select>
        </label>
      </div>
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="mt-4 rounded-xl bg-blue-900 text-white font-bold text-sm px-5 py-2 flex items-center gap-2 disabled:opacity-60"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Save Calendar
      </button>
      {msg && (
        <p className={"text-xs font-semibold mt-2 " + (msg.ok ? "text-green-700" : "text-red-700")}>{msg.text}</p>
      )}
    </div>
  );
}