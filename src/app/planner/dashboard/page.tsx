"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Lock, Unlock, Trash2, Send, Plus, Move } from "lucide-react";
import { useAuth } from "@/components/providers/session-provider";

export const dynamic = "force-static";

interface Version { id: number; name: string; sessionLabel: string; semester: string; status: string; }
interface Slot { id: number; courseId: number; day: number; period: number; locked: boolean; code: string; title: string; level: number; lecturerName: string | null; }
interface Period { period: number; label: string; }
interface Course { id: number; code: string; title: string; level: number; lecturerName: string | null; sessionsPerWeek: number; }
interface Lecturer { id: number; fullName: string; email: string | null; phone: string | null; isPermanent: boolean; availability: { day: number; start: string; end: string }[]; }
type Pending = { type: "course" | "slot"; id: number } | null;

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const INPUT = "border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white";
const EMPTY_LECTURER = { fullName: "", email: "", phone: "", isPermanent: false, days: [] as number[], start: "08:00", end: "16:00" };
const EMPTY_COURSE = { code: "", title: "", programmeCode: "", department: "", level: "100", sessionsPerWeek: "1", lecturerId: "" };

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
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [pending, setPending] = useState<Pending>(null);
  const [msg, setMsg] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", sessionLabel: "", semester: "" });
  const [lecForm, setLecForm] = useState(EMPTY_LECTURER);
  const [courseForm, setCourseForm] = useState(EMPTY_COURSE);

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

  const loadLecturers = useCallback(async () => {
    const d = await api("/api/planner/lecturers.php");
    if (d.success) setLecturers(d.lecturers); else setMsg(d.message || "Could not load lecturers.");
  }, []);

  useEffect(() => { loadVersions(); }, [loadVersions]);
  useEffect(() => { loadLecturers(); }, [loadLecturers]);
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

  const addLecturer = async () => {
    const availability = lecForm.days.map((day) => ({ day, start: lecForm.start, end: lecForm.end }));
    const d = await run("/api/planner/lecturers.php", {
      action: "save",
      fullName: lecForm.fullName,
      email: lecForm.email,
      phone: lecForm.phone,
      isPermanent: lecForm.isPermanent,
      availability,
    }, async () => {});
    if (d.success) { setLecForm(EMPTY_LECTURER); await loadLecturers(); }
  };

  const addCourse = async () => {
    const d = await run("/api/planner/courses.php", {
      action: "save",
      versionId: vid,
      code: courseForm.code,
      title: courseForm.title,
      programmeCode: courseForm.programmeCode,
      department: courseForm.department,
      level: Number(courseForm.level),
      sessionsPerWeek: Number(courseForm.sessionsPerWeek),
      lecturerId: Number(courseForm.lecturerId) || 0,
    }, async () => {});
    if (d.success) { setCourseForm(EMPTY_COURSE); await loadVersion(vid); }
  };

  const toggleDay = (day: number) =>
    setLecForm((f) => ({ ...f, days: f.days.includes(day) ? f.days.filter((x) => x !== day) : [...f.days, day].sort() }));

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

      {isPlanner && (
        <div className="grid md:grid-cols-2 gap-6">
          {canEdit && (
            <section className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
              <h2 className="font-bold text-slate-900 text-sm">Add a course to this timetable</h2>
              <div className="flex flex-wrap gap-2">
                <input placeholder="Code e.g. CSC101" value={courseForm.code} onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })} className={`${INPUT} w-36`} />
                <input placeholder="Course title" value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} className={`${INPUT} flex-1 min-w-[180px]`} />
              </div>
              <div className="flex flex-wrap gap-2">
                <input placeholder="Programme code (optional)" value={courseForm.programmeCode} onChange={(e) => setCourseForm({ ...courseForm, programmeCode: e.target.value })} className={`${INPUT} w-48`} />
                <input placeholder="Department (optional)" value={courseForm.department} onChange={(e) => setCourseForm({ ...courseForm, department: e.target.value })} className={`${INPUT} flex-1 min-w-[160px]`} />
              </div>
              <div className="flex flex-wrap gap-2 items-end">
                <label className="text-xs text-slate-600">Level
                  <select value={courseForm.level} onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })} className={`${INPUT} block mt-1`}>
                    {[100, 200, 300, 400, 500, 600].map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </label>
                <label className="text-xs text-slate-600">Sessions per week
                  <select value={courseForm.sessionsPerWeek} onChange={(e) => setCourseForm({ ...courseForm, sessionsPerWeek: e.target.value })} className={`${INPUT} block mt-1`}>
                    {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </label>
                <label className="text-xs text-slate-600">Lecturer
                  <select value={courseForm.lecturerId} onChange={(e) => setCourseForm({ ...courseForm, lecturerId: e.target.value })} className={`${INPUT} block mt-1`}>
                    <option value="">No lecturer</option>
                    {lecturers.map((l) => <option key={l.id} value={l.id}>{l.fullName}</option>)}
                  </select>
                </label>
              </div>
              <button onClick={addCourse} disabled={busy || !courseForm.code.trim() || !courseForm.title.trim()} className="flex items-center gap-1 bg-slate-900 text-white text-sm px-3 py-2 rounded-lg disabled:opacity-50"><Plus className="h-4 w-4" />Add course</button>
            </section>
          )}

          <section className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
            <h2 className="font-bold text-slate-900 text-sm">Lecturers ({lecturers.length})</h2>
            <div className="flex flex-wrap gap-2">
              <input placeholder="Full name" value={lecForm.fullName} onChange={(e) => setLecForm({ ...lecForm, fullName: e.target.value })} className={`${INPUT} flex-1 min-w-[180px]`} />
              <input placeholder="Email (optional)" value={lecForm.email} onChange={(e) => setLecForm({ ...lecForm, email: e.target.value })} className={`${INPUT} w-48`} />
              <input placeholder="Phone (optional)" value={lecForm.phone} onChange={(e) => setLecForm({ ...lecForm, phone: e.target.value })} className={`${INPUT} w-40`} />
            </div>
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input type="checkbox" checked={lecForm.isPermanent} onChange={(e) => setLecForm({ ...lecForm, isPermanent: e.target.checked })} />
              Permanent staff
            </label>
            <div>
              <p className="text-xs text-slate-600 mb-1">Available days (leave all unticked if available at any time)</p>
              <div className="flex flex-wrap gap-3 items-end">
                {DAYS.map((d, i) => (
                  <label key={d} className="flex items-center gap-1 text-xs text-slate-700">
                    <input type="checkbox" checked={lecForm.days.includes(i + 1)} onChange={() => toggleDay(i + 1)} />{d}
                  </label>
                ))}
                <label className="text-xs text-slate-600">From
                  <input type="time" min="08:00" max="16:00" value={lecForm.start} onChange={(e) => setLecForm({ ...lecForm, start: e.target.value })} className={`${INPUT} block mt-1`} />
                </label>
                <label className="text-xs text-slate-600">To
                  <input type="time" min="08:00" max="16:00" value={lecForm.end} onChange={(e) => setLecForm({ ...lecForm, end: e.target.value })} className={`${INPUT} block mt-1`} />
                </label>
              </div>
            </div>
            <button onClick={addLecturer} disabled={busy || !lecForm.fullName.trim()} className="flex items-center gap-1 bg-slate-900 text-white text-sm px-3 py-2 rounded-lg disabled:opacity-50"><Plus className="h-4 w-4" />Add lecturer</button>
            {lecturers.length > 0 && (
              <ul className="divide-y divide-slate-100 border-t border-slate-100 text-xs">
                {lecturers.map((l) => (
                  <li key={l.id} className="py-2">
                    <div className="font-semibold text-slate-900">{l.fullName} <span className="font-normal text-slate-500">{l.isPermanent ? "Permanent" : "Part-time"}</span></div>
                    <div className="text-slate-500">
                      {l.availability.length
                        ? l.availability.map((a) => `${DAYS[a.day - 1]} ${a.start}-${a.end}`).join(", ")
                        : "Available at any time"}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
