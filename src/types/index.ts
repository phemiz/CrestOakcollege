// TypeScript interfaces for CrestOak College

export interface Faculty {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  facultyId: string;
}

export interface Programme {
  id: string;
  name: string;
  code: string;
  durationYears: number;
  facultyId: string;
  departmentId?: string;
  level: "undergraduate" | "postgraduate" | "diploma" | "jupeb";
  jambCutOff?: number;
}

export interface News {
  id: number;
  title: string;
  date: string;
  desc: string;
  category: string;
  alert?: string;
}

export interface Event {
  id: number;
  title: string;
  date: string;
  desc: string;
  location?: string;
}

export interface Testimonial {
  name: string;
  program?: string;
  relation?: string;
  company?: string;
  text: string;
  outcome: string;
}

export interface Student {
  id: string;
  regNumber: string;
  fullName: string;
  email: string;
  phone: string;
  gender: "male" | "female";
  faculty: string;
  course: string;
  level: "undergraduate" | "postgraduate";
}

export interface Admission {
  regNumber: string;
  fullName: string;
  email: string;
  phone: string;
  level: "undergraduate" | "postgraduate";
  faculty: string;
  course: string;
  jambScore?: string | null;
  firstDegreeInstitution?: string | null;
  firstDegreeClass?: string | null;
  olevelCredits: string;
  verificationCode: string;
  status: "Submitted" | "Screened" | "Interviewed" | "Decided" | "Accepted" | "Paid" | "Rejected";
  dateSubmitted: string;
}

export interface Payment {
  id: string;
  reference: string;
  studentId?: string;
  regNumber?: string;
  amount: number;
  purpose: string;
  status: "success" | "pending" | "failed";
  date: string;
}
