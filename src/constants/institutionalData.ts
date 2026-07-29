export const DEFAULT_FACULTIES = [
  "Faculty of Health Sciences",
  "Faculty of Management & Law",
  "Faculty of Applied Technology & Computing",
  "Faculty of Natural & Applied Sciences",
  "Faculty of Education"
];

export const DEFAULT_DEPARTMENTS = [
  "Department of Nursing Sciences",
  "Department of Medical Laboratory Science",
  "Department of Community Health Sciences",
  "Department of Computer Science & IT",
  "Department of Business Administration",
  "Department of Law & Criminology"
];

export const DEFAULT_PROGRAMMES = [
  "Nursing Sciences (B.Sc.)",
  "Medical Laboratory Science (B.Sc.)",
  "Community Health (Diploma / B.Sc.)",
  "Computer Science & IT (B.Sc.)",
  "Business Administration (B.Sc.)",
  "Criminology & Security Studies (B.Sc.)"
];

export const DEFAULT_SESSIONS = [
  "2025/2026 Academic Session",
  "2026/2027 Academic Session"
];

export const DEFAULT_SEMESTERS = [
  "First Semester",
  "Second Semester"
];

export const DEFAULT_LEVELS = [
  "100 Level",
  "200 Level",
  "300 Level",
  "400 Level",
  "500 Level (Clinical)"
];

export const DEFAULT_STAFF_ROLES = [
  "ADMIN",
  "LECTURER",
  "BURSARY",
  "REGISTRAR",
  "SUPERADMIN"
];

export const DEFAULT_FEE_TYPES = [
  "Tuition Fee",
  "Acceptance Fee",
  "Accommodation Fee",
  "Laboratory & Practical Fee",
  "Matriculation Fee",
  "Examination Fee"
];

export const DEFAULT_STAFF_MEMBERS = [
  {
    id: "staff-001",
    staffNo: "CCHMS/STAFF/NUR/001",
    designation: "Senior Lecturer & Clinical Supervisor",
    joiningDate: "2024-09-01",
    user: {
      id: "u-staff-001",
      username: "emmanuel.adeyemi",
      firstName: "Dr. Emmanuel",
      lastName: "Adeyemi",
      middleName: "Oluwaseun",
      email: "emmanuel.adeyemi@crestoakcollege.com.ng",
      phoneNumber: "08023456789",
      role: { name: "LECTURER" }
    },
    department: { id: "dept-health-001", name: "Department of Nursing Sciences" },
    lecturer: {
      rank: "SENIOR_LECTURER",
      specialization: "Clinical Nursing & Maternal Health"
    }
  },
  {
    id: "staff-002",
    staffNo: "CCHMS/STAFF/SCS/001",
    designation: "Head of Department & Senior Lecturer",
    joiningDate: "2024-10-15",
    user: {
      id: "u-staff-002",
      username: "femi.adebayo",
      firstName: "Femi",
      lastName: "Adebayo",
      middleName: "Olayinka",
      email: "femi.adebayo@crestoakcollege.com.ng",
      phoneNumber: "08034567890",
      role: { name: "LECTURER" }
    },
    department: { id: "dept-tech-001", name: "Department of Computer Science & IT" },
    lecturer: {
      rank: "SENIOR_LECTURER",
      specialization: "Software Engineering & Systems Architecture"
    }
  },
  {
    id: "staff-003",
    staffNo: "CCHMS/STAFF/BUS/001",
    designation: "Bursary Financial Accountant",
    joiningDate: "2025-01-15",
    user: {
      id: "u-staff-003",
      username: "grace.okoro",
      firstName: "Grace",
      lastName: "Okoro",
      middleName: "Chidimma",
      email: "grace.okoro@crestoakcollege.com.ng",
      phoneNumber: "08129876543",
      role: { name: "BURSAR" }
    },
    department: { id: "dept-mgmt-001", name: "Department of Business Administration" },
    lecturer: null
  }
];
