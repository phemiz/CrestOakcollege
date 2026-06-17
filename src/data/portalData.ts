export interface PortalCourse {
  code: string;
  title: string;
  credits: number;
}

export interface PortalResult {
  code: string;
  title: string;
  units: number;
  grade: string;
  gp: number;
}

export interface TimetableSlot {
  day: string;
  time: string;
  course: string;
}

export const portalAvailableCourses: PortalCourse[] = [
  { code: "CNS 101", title: "Introduction to Nursing Care", credits: 3 },
  { code: "CNS 103", title: "General Anatomy & Physiology", credits: 4 },
  { code: "CNS 105", title: "Community Health Nursing", credits: 3 },
  { code: "MLS 101", title: "Introduction to Medical Lab Science", credits: 3 },
  { code: "GST 111", title: "Communication in English", credits: 2 },
  { code: "GST 112", title: "Logic & Critical Thinking", credits: 2 }
];

export const portalResultsData: PortalResult[] = [
  { code: "CNS 101", title: "Introduction to Nursing Care", units: 3, grade: "A", gp: 12.0 },
  { code: "CNS 103", title: "General Anatomy & Physiology", units: 4, grade: "B+", gp: 14.0 },
  { code: "CNS 105", title: "Community Health Nursing", units: 3, grade: "A", gp: 12.0 },
  { code: "MLS 101", title: "Introduction to Medical Lab Science", units: 3, grade: "A", gp: 12.0 },
  { code: "GST 111", title: "Communication in English", units: 2, grade: "B", gp: 6.0 },
];

export const portalTimetableSlots: TimetableSlot[] = [
  { day: "Monday", time: "09:00 AM - 12:00 PM", course: "CNS 101 (Hall A)" },
  { day: "Tuesday", time: "10:00 AM - 01:00 PM", course: "CNS 103 (Lab B)" },
  { day: "Wednesday", time: "01:00 PM - 03:00 PM", course: "GST 111 (Hall C)" },
  { day: "Thursday", time: "09:00 AM - 11:00 AM", course: "MLS 101 (Lab A)" },
  { day: "Friday", time: "11:00 AM - 01:00 PM", course: "GST 112 (Hall B)" }
];
