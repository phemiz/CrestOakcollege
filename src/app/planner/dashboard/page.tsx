"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Lock, Unlock, Trash2, Send, Plus, Move } from "lucide-react";
import { useAuth } from "@/components/providers/session-provider";

export const dynamic = "force-static";

interface Version { id: number; name: string; sessionLabel: string; semester: string; status: string; }
interface Slot { id: number; courseId: number; day: number; period: number; locked: boolean; code: string; title: string; level: number; lecturerName: string | null; }
interface Period { period: number; label: string; }
interface Course { id: number; code: string; title: string; level: number; lecturerName: string | null; sessionsPerWeek: number; }
type Pending = { type: "course" | "slot"; id: number } | null;

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

async function api(url: string, method = "GET", body?: unknown): Promise<any> {
  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": localStorage.getItem("csrfToken") || "",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return await res.json();
  } catch {
    return { success: false, message: "Network or server error." };
  }
}

export default function PlannerDashboard() {
  const { user } = useAuth();
  const isPlanner = (user?.role || "").toUpperCase() === "ACADEMIC_PLANNER";

  const [versions, setVersions] = useState<Version[]>([]);
  const [vid, setVid] = useState<number>(0);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [pending, setPending] = useState<Pending>(null);
  const [msg, setMsg] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", sessionLabel: "", semester: "" });

  const version = versions.find((v) => v.id === vid);
  const canEdit = isPlanner && version?.status === "DRAFT";

  const loadVersions = useCallback(async (keep?: number) => {
    const d = await api("/api/planner/versions.php");
    if (!d.success) { setMsg(d.message || "Could not load versions."); setLoading(false); return; }
    setVersions(d.versions);
    setVid((cur) => keep ?? (cur && d.versions.some((v: Version) => v.id === cur) ? cur : d.versions[0]?.id || 0));
    setLoading(false);
  }, []);

  const loadVersion = useCallback(async (id: number) => {
    if (!id) { setSlots([]); setCourses([]); return; }
    const [s, c] = await Promise.all([
      api(`/api/planner/slots.php?version_id=${id}`),
      api(`/api/planner/courses.php?version_id=${id}`),
    ]);
    if (s.success) { setSlots(s.slots); setPeriods(s.periods); } else setMsg(s.message || "Could not load slots.");
    if (c.success) setCourses(c.courses); else setMsg(c.message || "Could not load courses.");
  }, []);

  useEffect(() => { loadVersions(); }, [loadVersions]);
  useEffect(() => { loadVersion(vid); setPending(null); }, [vid, loadVersion]);

  const placedCount = useMemo(() => {
    const m: Record<number, number> = {};
    slots.forEach((s) => { m[s.courseId] = (m[s.courseId] || 0) + 1; });
    return m;
  }, [slots]);

  const run = async (url: string, body: unknown, after?: () => Promise<void>) => {
    setBusy(true); setMsg("");
    const d = await api(url, "POST", body);
    if (!d.success) setMsg(d.conflicts?.length ? d.conflicts.join(" | ") : d.message || "Action failed.");
    else if (after) await after();
    setBusy(false);
    return d;
  };

  const onCell = async (day: number, period: number) => {
    if (!canEdit || !pending || busy) return;
    if (pending.type === "course") {
      await run("/api/planner/slots.php", { action: "place", version_id: vid, courseId: pending.id, day, period }, () => loadVersion(vid));
    } else {
      await run("/api/planner/slots.php", { action: "move", id: pending.id, day, period }, () => loadVersion(vid));
    }
    setPending(null);
  };

  const slotAction = (action: string, s: Slot) =>
    run("/api/planner/slots.php", { action, id: s.id, locked: !s.locked }, () => loadVersion(vid));

  const createVersion = async () => {
    const d = await run("/api/planner/versions.php", { action: "create", ...form }, async () => {});
    if (d.success) { setForm({ name: "", sessionLabel: "", semester: "" }); await loadVersions(d.id); }
  };

  const versionAction = async (action: "publish" | "delete") => {
    if (!version) return;
    if (!window.confirm(`${action === "publish" ? "Publish" : "Delete"} "${version.name}"?`)) return;
    await run("/api/planner/versions.php", { action, id: version.id }, async () => {
      await loadVersions(action === "delete" ? 0 : version.id);
    });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 space-y-6">
      <header className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Timetable Planner</h1>
          <p className="text-xs text-slate-500">{isPlanner ? "Academic Planning Officer" : "Read-only view"}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={vid} onChange={(e) => setVid(Number(e.target.value))} className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
            {versions.length === 0 && <option value={0}>No timetables yet</option>}
            {versions.map((v) => (
              <option key={v.id} value={v.id}>{v.name} - {v.sessionLabel} {v.semester} ({v.status})</option>
            ))}
          </select>
          {canEdit && (
            <>
              <button onClick={() => versionAction("publish")} disabled={busy} className="flex items-center gap-1 bg-teal-700 text-white text-sm px-3 py-2 rounded-lg disabled:opacity-50"><Send className="h-4 w-4" />Publish</button>
              <button onClick={() => versionAction("delete")} disabled={busy} className="flex items-center gap-1 bg-red-700 text-white text-sm px-3 py-2 rounded-lg disabled:opacity-50"><Trash2 className="h-4 w-4" />Delete</button>
            </>
          )}
        </div>
      </header>

      {isPlanner && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap gap-2 items-end">
          <input placeholder="Timetable name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          <input placeholder="Session e.g. 2026/2027" value={form.sessionLabel} onChange={(e) => setForm({ ...form, sessionLabel: e.target.value })} className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          <input placeholder="Semester e.g. FIRST" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          <button onClick={createVersion} disabled={busy} className="flex items-center gap-1 bg-slate-900 text-white text-sm px-3 py-2 rounded-lg disabled:opacity-50"><Plus className="h-4 w-4" />New draft</button>
        </div>
      )}

      {msg && <div className="bg-amber-50 border border-amber-300 text-amber-900 text-sm rounded-xl px-4 py-3">{msg}</div>}
      {pending && canEdit && (
        <div className="bg-teal-50 border border-teal-300 text-teal-900 text-sm rounded-xl px-4 py-3 flex justify-between">
          <span>{pending.type === "course" ? "Click a cell to place the selected course." : "Click a cell to move the selected slot."}</span>
          <button className="underline" onClick={() => setPending(null)}>Cancel</button>
        </div>
      )}

      {!version ? (
        <p className="text-sm text-slate-500">Select or create a timetable to begin.</p>
      ) : (
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          <div className="overflow-x-auto bg-white border border-slate-200 rounded-2xl">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  <th className="p-2 border-b border-slate-200 text-left w-28">Period</th>
                  {DAYS.map((d) => <th key={d} className="p-2 border-b border-slate-200">{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {periods.map((p) => (
                  <tr key={p.period}>
                    <td className="p-2 border-b border-slate-100 font-semibold text-slate-600 align-top">{p.label}</td>
                    {DAYS.map((_, i) => {
                      const day = i + 1;
                      const here = slots.filter((s) => s.day === day && s.period === p.period);
                      return (
                        <td key={day} onClick={() => onCell(day, p.period)} className={`p-1 border-b border-l border-slate-100 align-top min-w-[130px] ${canEdit && pending ? "cursor-pointer hover:bg-teal-50" : ""}`}>
                          {here.map((s) => (
                            <div key={s.id} className="mb-1 rounded-lg bg-slate-100 p-2">
                              <div className="font-bold text-slate-900">{s.code} <span className="font-normal text-slate-500">L{s.level}</span></div>
                              <div className="text-slate-600 truncate">{s.lecturerName || "No lecturer"}</div>
                              {canEdit && (
                                <div className="flex gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
                                  <button title="Move" onClick={() => setPending({ type: "slot", id: s.id })}><Move className="h-3.5 w-3.5" /></button>
                                  <button title={s.locked ? "Unlock" : "Lock"} onClick={() => slotAction("lock", s)}>{s.locked ? <Lock className="h-3.5 w-3.5 text-amber-600" /> : <Unlock className="h-3.5 w-3.5" />}</button>
                                  <button title="Remove" onClick={() => slotAction("remove", s)}><Trash2 className="h-3.5 w-3.5 text-red-600" /></button>
                                </div>
                              )}
                              {!canEdit && s.locked && <Lock className="h-3 w-3 text-amber-600 mt-1" />}
                            </div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <aside className="bg-white border border-slate-200 rounded-2xl p-4 max-h-[70vh] overflow-y-auto">
            <h2 className="font-bold text-slate-900 text-sm mb-3">Courses ({courses.length})</h2>
            <ul className="space-y-2">
              {courses.map((c) => {
                const placed = placedCount[c.id] || 0;
                const done = placed >= c.sessionsPerWeek;
                const active = pending?.type === "course" && pending.id === c.id;
                return (
                  <li key={c.id}>
                    <button disabled={!canEdit} onClick={() => setPending({ type: "course", id: c.id })} className={`w-full text-left rounded-xl border p-2 text-xs ${active ? "border-teal-600 bg-teal-50" : "border-slate-200"} ${canEdit ? "hover:border-teal-400" : ""}`}>
                      <div className="font-bold text-slate-900">{c.code} <span className="font-normal text-slate-500">L{c.level}</span></div>
                      <div className="text-slate-600 truncate">{c.title}</div>
                      <div className="text-slate-500">{c.lecturerName || "No lecturer"}</div>
                      <div className={done ? "text-teal-700" : "text-amber-700"}>{placed}/{c.sessionsPerWeek} placed</div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>
      )}
    </div>
  );
}
