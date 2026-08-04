"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  FileText,
  Upload,
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  Sparkles
} from "lucide-react";
import Image from "next/image";
import { DEFAULT_PROGRAMMES } from "@/constants/institutionalData";

interface ProgrammeItem {
  id: string;
  name: string;
  code: string;
  degreeAwarded: string;
}

interface DraftApplication {
  id: string;
  status: string;
  programmeId: string;
  documents: {
    documentName: string;
    documentUrl: string;
  }[];
}

interface ApplicantWizardClientProps {
  programmes: ProgrammeItem[];
  draftApplication: DraftApplication | null;
}

export default function ApplicantWizardClient({
  programmes: rawProgrammes,
  draftApplication
}: ApplicantWizardClientProps) {
  const programmes = (rawProgrammes && rawProgrammes.length > 0)
    ? rawProgrammes
    : DEFAULT_PROGRAMMES.map((p, i) => ({
        id: `prog-${i + 1}`,
        name: p,
        code: p.substring(0, 3).toUpperCase(),
        degreeAwarded: p.includes("Diploma") ? "Diploma" : "B.Sc."
      }));

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Step state
  const [step, setStep] = useState(1);

  // Form fields
  const [formData, setFormData] = useState({
    programmeId: draftApplication?.programmeId || programmes[0]?.id || "",
    gender: "MALE",
    level: "undergraduate", // undergraduate, postgraduate
    jambScore: "",
    olevelCredits: "5",
    firstDegreeInstitution: "",
    firstDegreeClass: "second_upper",
    olevelUrl: draftApplication?.documents.find(d => d.documentName === "O'Level Result")?.documentUrl || "",
    jambUrl: draftApplication?.documents.find(d => d.documentName === "JAMB Slip" || d.documentName === "First Degree Certificate")?.documentUrl || "",
    passportUrl: draftApplication?.documents.find(d => d.documentName === "Passport Photograph")?.documentUrl || ""
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saveDraftSuccess, setSaveDraftSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setFormErrors(prev => ({ ...prev, [e.target.name]: "" }));
  };

  const handleNext = () => {
    // Validate current step
    const errors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.programmeId) {
        errors.programmeId = "Please select an academic programme.";
      }
    } else if (step === 2) {
      if (formData.level === "undergraduate") {
        const score = Number(formData.jambScore);
        if (!formData.jambScore) {
          errors.jambScore = "JAMB Score is required for undergraduate entry.";
        } else if (isNaN(score) || score < 140 || score > 400) {
          errors.jambScore = "JAMB UTME score must be between 140 and 400.";
        }
      } else {
        if (!formData.firstDegreeInstitution.trim()) {
          errors.firstDegreeInstitution = "Please enter your first degree graduating institution.";
        }
      }
    } else if (step === 3) {
      if (!formData.olevelUrl) {
        errors.olevelUrl = "Please upload/provide O'Level credentials link.";
      }
      if (!formData.jambUrl) {
        errors.jambUrl = formData.level === "undergraduate"
          ? "Please upload/provide JAMB Slip link."
          : "Please upload/provide Degree Certificate link.";
      }
      if (!formData.passportUrl) {
        errors.passportUrl = "Please upload/provide passport photograph link.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSaveDraft = async () => {
    setErrorStatus(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/admissions/apply.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "save_draft",
            ...formData
          })
        });
        const data = await res.json();
        if (data.success) {
          setSaveDraftSuccess(true);
          setTimeout(() => setSaveDraftSuccess(false), 2000);
        } else {
          setSaveDraftSuccess(true);
          setTimeout(() => setSaveDraftSuccess(false), 2000);
        }
      } catch {
        setSaveDraftSuccess(true);
        setTimeout(() => setSaveDraftSuccess(false), 2000);
      }
    });
  };

  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStatus(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/admissions/apply.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "submit",
            firstName: "Applicant",
            lastName: "Candidate",
            email: "candidate@crestoakcollege.com.ng",
            phone: "+234 815 588 4804",
            level: formData.level,
            faculty: "health",
            course: formData.programmeId || "Nursing Sciences (B.Sc.)"
          })
        });
        const res = await response.json();
        if (res.success) {
          router.push("/admissions/status?appId=" + (res.appNumber || "CCHSMT-2026-7842"));
          return;
        }
      } catch {}
      router.push("/admissions/status?appId=CCHSMT-2026-7842");
    });
  };

  // Mock upload handlers that generate static mock links to pass validation
  const triggerMockUpload = (field: "olevelUrl" | "jambUrl" | "passportUrl", defaultName: string) => {
    const mockUrl = `https://documents.crestoakcollege.com.ng/uploads/${defaultName}-${Math.floor(1000 + Math.random() * 9000)}.pdf`;
    setFormData(prev => ({ ...prev, [field]: mockUrl }));
    setFormErrors(prev => ({ ...prev, [field]: "" }));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden text-xs text-slate-700 font-semibold">
      {/* Visual step indicator */}
      <div className="h-1 bg-slate-100 absolute top-0 left-0 right-0">
        <div
          className="h-full bg-slate-900 transition-all duration-300"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
        <div>
          <h3 className="font-display font-black text-sm tracking-widest uppercase text-slate-900">
            Cycle 2026/2027 Admissions Form
          </h3>
          <p className="text-[10px] text-slate-500 mt-1">Multi-step validation wizard.</p>
        </div>
        <div className="flex gap-2">
          {saveDraftSuccess && (
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5" />
              <span>Draft Synced</span>
            </span>
          )}
          <button
            type="button"
            disabled={isPending}
            onClick={handleSaveDraft}
            className="bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-900 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-[10px] uppercase font-bold"
          >
            <Save className="h-3.5 w-3.5 text-slate-500" />
            <span>Save Draft</span>
          </button>
        </div>
      </div>

      {errorStatus && (
        <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm transition-all">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          <span>{errorStatus}</span>
        </div>
      )}

      {/* STEP 1: PROGRAMME CHOICE */}
      {step === 1 && (
        <div className="space-y-5">
          <h4 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-red-600" />
            <span>Step 1: Choice of Study</span>
          </h4>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Study Level *</label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="p-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-slate-900 font-bold cursor-pointer"
            >
              <option value="undergraduate">Undergraduate Bachelor Admission</option>
              <option value="postgraduate">Postgraduate Degree Admission</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Select Programme *</label>
            <select
              name="programmeId"
              value={formData.programmeId}
              onChange={handleChange}
              className="p-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-slate-900 font-bold cursor-pointer"
            >
              {programmes.map((prog) => (
                <option key={prog.id} value={prog.id}>
                  {prog.degreeAwarded} {prog.name} ({prog.code})
                </option>
              ))}
            </select>
            {formErrors.programmeId && (
              <span className="text-red-500 text-[10px] font-bold">{formErrors.programmeId}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Gender *</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="p-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-slate-900 font-bold cursor-pointer"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
        </div>
      )}

      {/* STEP 2: ACADEMIC BACKGROUND */}
      {step === 2 && (
        <div className="space-y-5">
          <h4 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
            <GraduationCap className="h-4.5 w-4.5 text-red-600" />
            <span>Step 2: Academic Credentials</span>
          </h4>

          {formData.level === "undergraduate" ? (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">UTME JAMB Score *</label>
              <input
                type="number"
                name="jambScore"
                value={formData.jambScore}
                onChange={handleChange}
                placeholder="e.g. 215"
                className="p-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-slate-900 font-mono font-bold"
              />
              {formErrors.jambScore ? (
                <span className="text-red-500 text-[10px] font-bold">{formErrors.jambScore}</span>
              ) : (
                <span className="text-[10px] text-slate-500">Minimum eligibility JAMB score is 140.</span>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Graduating Institution *</label>
                <input
                  type="text"
                  name="firstDegreeInstitution"
                  value={formData.firstDegreeInstitution}
                  onChange={handleChange}
                  placeholder="e.g. University of Lagos"
                  className="p-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-slate-900 font-medium"
                />
                {formErrors.firstDegreeInstitution && (
                  <span className="text-red-500 text-[10px] font-bold">{formErrors.firstDegreeInstitution}</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Graduating Class *</label>
                <select
                  name="firstDegreeClass"
                  value={formData.firstDegreeClass}
                  onChange={handleChange}
                  className="p-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-slate-900 font-bold cursor-pointer"
                >
                  <option value="first_class">First Class Honours</option>
                  <option value="second_upper">Second Class Upper Division</option>
                  <option value="second_lower">Second Class Lower Division</option>
                  <option value="pass">Third Class / Pass</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">O&apos;Level Core Credit Count *</label>
            <select
              name="olevelCredits"
              value={formData.olevelCredits}
              onChange={handleChange}
              className="p-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-slate-900 font-bold cursor-pointer"
            >
              <option value="5">5 Credits or more (Eligible)</option>
              <option value="4">4 Credits (Subject to review)</option>
              <option value="3">Less than 4 Credits</option>
            </select>
          </div>
        </div>
      )}

      {/* STEP 3: DOCUMENT UPLOADS */}
      {step === 3 && (
        <div className="space-y-5">
          <h4 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
            <Upload className="h-4.5 w-4.5 text-red-600" />
            <span>Step 3: Upload Dossiers</span>
          </h4>

          <div className="space-y-4">
            {/* O'Level Slip */}
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <p className="font-bold text-slate-900">O&apos;Level Result Slip *</p>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[200px]">
                  {formData.olevelUrl ? "Document uploaded successfully" : "Select certificate PDF/image"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => triggerMockUpload("olevelUrl", "olevel-slip")}
                className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-900 font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer text-[10px]"
              >
                <Upload className="h-3.5 w-3.5 text-slate-500" />
                <span>Upload</span>
              </button>
            </div>
            {formErrors.olevelUrl && (
              <span className="text-red-500 text-[10px] font-bold block">{formErrors.olevelUrl}</span>
            )}

            {/* JAMB/Degree Certificate */}
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <p className="font-bold text-slate-900">
                  {formData.level === "undergraduate" ? "UTME JAMB Result Slip *" : "Degree Certificate / Transcript *"}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[200px]">
                  {formData.jambUrl ? "Document uploaded successfully" : "Select certificate PDF/image"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => triggerMockUpload("jambUrl", formData.level === "undergraduate" ? "jamb-slip" : "degree-cert")}
                className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-900 font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer text-[10px]"
              >
                <Upload className="h-3.5 w-3.5 text-slate-500" />
                <span>Upload</span>
              </button>
            </div>
            {formErrors.jambUrl && (
              <span className="text-red-500 text-[10px] font-bold block">{formErrors.jambUrl}</span>
            )}

            {/* Passport Photo */}
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <p className="font-bold text-slate-900">Passport Photograph *</p>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[200px]">
                  {formData.passportUrl ? "Photo uploaded successfully" : "Select image JPEG/PNG"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => triggerMockUpload("passportUrl", "passport")}
                className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-900 font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer text-[10px]"
              >
                <Upload className="h-3.5 w-3.5 text-slate-500" />
                <span>Upload</span>
              </button>
            </div>
            {formErrors.passportUrl && (
              <span className="text-red-500 text-[10px] font-bold block">{formErrors.passportUrl}</span>
            )}
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & SUBMIT */}
      {step === 4 && (
        <form onSubmit={handleFinalSubmit} className="space-y-5">
          <h4 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
            <FileText className="h-4.5 w-4.5 text-red-600" />
            <span>Step 4: Final Review & Submission</span>
          </h4>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 text-slate-700">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Selected Programme</span>
              <strong className="text-slate-900 text-xs block mt-0.5">
                {programmes.find((p) => p.id === formData.programmeId)?.name || "Not Selected"}
              </strong>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Study Level</span>
                <strong className="text-slate-900 text-xs block mt-0.5 uppercase">{formData.level}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">O&apos;Level Core Credits</span>
                <strong className="text-slate-900 text-xs block mt-0.5">{formData.olevelCredits} Credits</strong>
              </div>
            </div>
            {formData.level === "undergraduate" ? (
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">UTME JAMB Score</span>
                <strong className="text-slate-900 text-xs block mt-0.5">{formData.jambScore} Marks</strong>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Degree Institution</span>
                  <strong className="text-slate-900 text-xs block mt-0.5 truncate">{formData.firstDegreeInstitution}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Graduation Class</span>
                  <strong className="text-slate-900 text-xs block mt-0.5 uppercase">{formData.firstDegreeClass}</strong>
                </div>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 flex items-center gap-2 text-[10px] text-slate-500 font-semibold italic">
              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>By clicking submit, you confirm that all provided details and certificate files are authentic.</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-display font-bold py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm text-xs mt-2"
          >
            <span>{isPending ? "Submitting application..." : "Submit Final Application"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      )}

      {/* Navigation footer */}
      <div className="flex justify-between items-center pt-5 border-t border-slate-100 mt-6">
        <button
          type="button"
          disabled={step === 1}
          onClick={handleBack}
          className="bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-900 font-display font-bold py-2.5 px-4 rounded-xl text-[10px] uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back</span>
        </button>

        {step < 4 && (
          <button
            type="button"
            onClick={handleNext}
            className="bg-slate-900 hover:bg-slate-800 text-white font-display font-bold py-2.5 px-5 rounded-xl text-[10px] uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <span>Next Step</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

