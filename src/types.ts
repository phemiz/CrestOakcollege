
export interface Department {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  programType: 'Degree' | 'Diploma';
}

export interface Course {
  id:string;
  code: string;
  title: string;
  description: string;
  creditHours: number;
  departmentId: string;
  programType: 'Degree' | 'Diploma';
  lecturerId?: string;
  prerequisites?: string;
  learningOutcomes?: string;
  recommendedTextbooks?: string;
}

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

export enum ApplicationStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export interface Application {
  id: string; // UUID
  name: string;
  email: string;
  phone: string;
  gender: 'M' | 'F';
  departmentId: string;
  transcriptUrl: string;
  status: ApplicationStatus;
  createdAt: string; // ISO string for timestamp
}

export interface ApplicationFormData {
  name: string;
  email: string;
  phone: string;
  gender: 'M' | 'F' | '';
  departmentId: string;
  transcript: File | null;
}

export interface DynamicApplicationData {
  fullName: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female';
  programTypes: ('Diploma' | 'Degree')[];
  firstChoiceCourseId: string;
  secondChoiceCourseId?: string;
  studyModes: ('Part-Time' | 'Full-Time')[];
  transcript: File | null;
}

export enum StaffRole {
  Admin = 'Admin',
  AcademicOfficer = 'Academic Officer',
  AdmissionsOfficer = 'Admissions Officer',
  Lecturer = 'Lecturer',
  Librarian = 'Librarian',
}

export interface StaffMember {
  id: string;
  role: StaffRole;
  name:string;
  email: string;
  phone: string;
  createdAt: string;
  departmentId?: string;
  bio?: string;
  imageUrl?: string;
  officeHours?: { day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'; time: string; }[];
}


export interface Student {
    id: string;
    studentId: string;
    name: string;
    email: string;
    departmentId: string;
    createdAt: string;
    phone?: string;
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    createdAt: string;
}

export interface TimetableEntry {
    id: string;
    courseId: string;
    dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
    startTime: string; // "HH:MM"
    endTime: string; // "HH:MM"
    location: string;
    lecturerId?: string;
}

// FIX: Renamed AdminTask to Task for consistency and to resolve import error.
export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export type SearchResultType = 'Page' | 'Course' | 'Department' | 'Blog' | 'Staff' | 'Club' | 'Book';

export interface SearchResultItem {
    type: SearchResultType;
    id: string;
    title: string;
    description: string;
    path: string;
}

export interface SearchResults {
    pages: SearchResultItem[];
    courses: SearchResultItem[];
    departments: SearchResultItem[];
    blog?: SearchResultItem[];
    staff?: SearchResultItem[];
    clubs?: SearchResultItem[];
    books?: SearchResultItem[];
}

// --- Blog Types ---

export interface BlogCategory {
    id: string;
    name: string;
}

export interface BlogComment {
    id: string;
    author: string;
    content: string;
    createdAt: string; // ISO string
}

export interface BlogPost {
    id: string; // slug
    title: string;
    content: string; // markdown content
    excerpt: string;
    authorId: string; // from StaffMember
    authorName: string;
    categoryId: string;
    createdAt: string; // ISO string
    updatedAt: string; // ISO string
    comments: BlogComment[];
}

// --- Careers Types ---
export interface JobOpening {
  id: string;
  title: string;
  department: 'Faculty' | 'Administration' | 'IT Support' | 'Student Services';
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract';
  description: string;
  responsibilities: string[];
  qualifications: string[];
  featured?: boolean;
}

export interface JobApplicationData {
  jobId: string;
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  resume: File;
  coverLetter: string;
}

// --- Suggestion 1: Alumni Portal ---
export interface Alumni {
    id: string;
    name: string;
    graduationYear: number;
    departmentId: string;
    occupation: string;
    testimonial: string;
    imageUrl: string;
}

// --- Suggestion 2: Fee Payment ---
export enum FeeStatus {
    Paid = 'Paid',
    Due = 'Due',
    Overdue = 'Overdue'
}

export interface Fee {
    id: string;
    studentId: string;
    description: string;
    amount: number;
    dueDate: string; // ISO String
    status: FeeStatus;
}

export interface Payment {
    id: string;
    studentId: string;
    date: string; // ISO string
    amount: number;
    description: string;
}

export interface FeeStructureItem {
    id: string;
    category: 'General' | 'Administrative';
    item: string;
    amount: string;
    note: string;
}

// --- Suggestion 3: Events Calendar ---
export interface CalendarEvent {
    id: string;
    title: string;
    date: string; // ISO String "YYYY-MM-DD"
    description: string;
    category: 'Academic' | 'Campus Life' | 'Holiday';
    rsvps: number;
    attendees?: string[]; // List of names
}

// --- Suggestion 4: E-Learning Hub ---
export interface CourseMaterial {
    id: string;
    courseId: string;
    title: string;
    fileUrl: string;
    fileType: 'PDF' | 'DOCX' | 'PPT';
    uploadedAt: string;
}

// --- Suggestion 8: Library Portal ---
export enum BookStatus {
    Available = 'Available',
    CheckedOut = 'Checked Out'
}

export interface LibraryBook {
    id: string;
    title: string;
    author: string;
    isbn: string;
    description: string;
    status: BookStatus;
    dueDate?: string;
}

// --- Suggestion 9: Student Clubs ---
export interface StudentClub {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    contactEmail: string;
    category?: 'Academic' | 'Social' | 'Religious' | 'General';
}

export interface ClubAnnouncement {
    id: string;
    title: string;
    date: string;
}

export interface ClubMember {
    id: string;
    name: string;
    imageUrl: string;
}

export interface ClubDetail extends StudentClub {
    announcements: ClubAnnouncement[];
    members: ClubMember[];
    galleryImages: { imageUrl: string; caption: string; }[];
}

export interface NewClubMemberData {
    name: string;
    studentId: string;
    reason: string;
}


// --- Suggestion 10: Admin Analytics ---
export interface AnalyticsData {
    applicationsByStatus: { status: ApplicationStatus; count: number }[];
    enrollmentByDepartment: { departmentName: string; count: number }[];
}

// --- Professional Suggestions ---

// Represents a student's grade for a single course in a semester.
export interface CourseGrade {
    studentId: string;
    courseId: string;
    semester: string; // e.g., 'Y1S1' for Year 1, Semester 1
    score: number; // Score from 0-100
}

// Represents the calculated GPA for a semester, derived from CourseGrade data.
export interface StudentGrade {
    semester: string;
    gpa: number;
}

export interface Mentor extends Alumni {
    expertise: string[];
}

export interface Donation {
    amount: number;
    donorName?: string;
    isAnonymous: boolean;
}

export interface Testimonial {
    id: string;
    studentName: string;
    program: string;
    graduationYear: number;
    quote: string;
    imageUrl: string;
}

// --- NEW FEATURE TYPES ---

export interface CampusBuilding {
    id: string;
    name: string;
    description: string;
    svgPathId: string;
}

export interface Appointment {
    id: string;
    studentId: string;
    studentName: string;
    staffId: string;
    date: string;
    time: string;
    reason: string;
    status: 'Pending' | 'Confirmed' | 'Cancelled';
}

export interface Notification {
    id: string;
    type: 'grade' | 'announcement' | 'fee' | 'event' | 'appointment';
    title: string;
    content: string;
    createdAt: string; // ISO string
    read: boolean;
    path?: string;
}

export interface GalleryItem {
  imageUrl: string;
  caption: string;
}

export interface Visitation {
  id: string;
  title: string;
  description: string;
  category: 'Educational' | 'Recreational' | 'Departmental';
  date: string; // ISO String
  imageUrl: string;
  relatedDepartmentId?: string;
  gallery?: GalleryItem[];
}
