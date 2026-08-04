import React from "react";
import ProfileForm from "./ProfileForm";
import { GraduationCap, Phone } from "lucide-react";

export const dynamic = "force-static";

export default function StudentProfilePage() {
  const student = {
    id: "student-1",
    matricNo: "CCHMS/2026/SCS/0001",
    level: "200",
    user: {
      firstName: "Student",
      lastName: "User",
      middleName: "Demo",
      email: "student@crestoakcollege.com.ng",
      phoneNumber: "+234 815 588 4804"
    },
    department: {
      name: "Community Health",
      faculty: { name: "School of Public Health & Community Science" }
    },
    programme: { name: "Community Health Extension (CHEW)" },
    entrySession: { name: "2024/2025" }
  };

  const initialUser = {
    middleName: student.user.middleName,
    phoneNumber: student.user.phoneNumber,
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">
      {/* Page Title */}
      <div>
        <h3 className="font-display font-black text-brand-blue-dark text-lg sm:text-xl">Academic & Personal Profile</h3>
        <p className="text-slate-400 text-xs mt-1">Review your official academic registrations and update your contact information.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Static Official Registrations Card */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col gap-5">
          <div className="flex items-center gap-3 border-b border-slate-150 pb-4">
            <div className="p-2 bg-brand-blue-light/10 text-brand-blue-light rounded-xl">
              <GraduationCap size={20} />
            </div>
            <div>
              <h4 className="font-display font-black text-brand-blue-dark text-xs sm:text-sm uppercase tracking-wider">Academic Record</h4>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase">Verified by Registrar Office</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 font-semibold text-xs text-slate-600">
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400 font-bold">Matric Number</span>
              <span className="font-display font-black text-brand-blue-dark">{student.matricNo}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-slate-150">
              <span className="text-slate-400 font-bold">Faculty</span>
              <span className="text-right max-w-[180px] truncate" title={student.department.faculty.name}>{student.department.faculty.name}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-slate-150">
              <span className="text-slate-400 font-bold">Department</span>
              <span className="text-right max-w-[180px] truncate" title={student.department.name}>{student.department.name}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-slate-150">
              <span className="text-slate-400 font-bold">Programme</span>
              <span className="text-right max-w-[180px] truncate" title={student.programme.name}>{student.programme.name}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-slate-150">
              <span className="text-slate-400 font-bold">Current Level</span>
              <span>{student.level} Level</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-slate-150">
              <span className="text-slate-400 font-bold">Entry Session</span>
              <span>{student.entrySession.name} Academic Session</span>
            </div>
          </div>
        </div>

        {/* Right Side: Update Contact Details Card */}
        <div className="lg:col-span-7 border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col gap-6 bg-white">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2 bg-brand-red/10 text-brand-red rounded-xl">
              <Phone size={20} />
            </div>
            <div>
              <h4 className="font-display font-black text-brand-blue-dark text-xs sm:text-sm uppercase tracking-wider">Contact & Bio Details</h4>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase">Updates require re-auditing verification</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 font-semibold text-xs text-slate-600 mb-2">
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400 font-bold">First Name</span>
              <span className="font-bold text-brand-blue-dark">{student.user.firstName}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-slate-100">
              <span className="text-slate-400 font-bold">Last Name</span>
              <span className="font-bold text-brand-blue-dark">{student.user.lastName}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-slate-100">
              <span className="text-slate-400 font-bold">Email Address</span>
              <span className="font-bold text-brand-blue-dark">{student.user.email}</span>
            </div>
          </div>

          <ProfileForm initialUser={initialUser} />
        </div>

      </div>
    </div>
  );
}
