

import React, { useState, useEffect, useCallback } from 'react';
// FIX: Added 'Payment', 'Student' to types import for new endpoints
import { 
  Course, Department, ContactMessage, Application, ApplicationStatus, ApplicationFormData, 
  StaffMember, StaffRole, Announcement, TimetableEntry, Student, JobOpening, Alumni, Fee,
  FeeStatus, CalendarEvent, CourseMaterial, LibraryBook, BookStatus, StudentClub, AnalyticsData,
  Mentor, StudentGrade, ClubDetail, NewClubMemberData, ClubMember, DynamicApplicationData, Payment,
  Testimonial,
  Visitation,
  JobApplicationData,
  GalleryItem,
  CourseGrade
} from '../types';

let MOCK_DEPARTMENTS: Department[] = [
  {
    id: 'd1',
    name: 'Faculty of Management & Social Sciences (B.Sc.)',
    description: 'Developing ethical leaders and skilled managers to navigate the complexities of the modern economy and public sector.',
    imageUrl: 'https://picsum.photos/seed/management/800/600',
    programType: 'Degree',
  },
  {
    id: 'd2',
    name: 'Faculty of Applied Science & Engineering (B.Sc.)',
    description: 'Driving innovation and solving real-world problems through rigorous scientific inquiry and engineering excellence.',
    imageUrl: 'https://picsum.photos/seed/science-eng/800/600',
    programType: 'Degree',
  },
  {
    id: 'd3',
    name: 'Faculty of Education, Arts & Humanities (B.A.)',
    description: 'Cultivating critical thinking, creativity, and cultural understanding to enrich society and the human experience.',
    imageUrl: 'https://picsum.photos/seed/arts/800/600',
    programType: 'Degree',
  },
  {
    id: 'd4',
    name: 'Faculty of Health Sciences (B.Sc.)',
    description: 'Training compassionate and competent healthcare professionals to improve health outcomes and serve communities.',
    imageUrl: 'https://i.imgur.com/k2ms4bH.jpeg',
    programType: 'Degree',
  },
  // Diploma Faculties
  {
    id: 'd5',
    name: 'Faculty of Health Sciences (N.D.)',
    description: 'Providing hands-on training for essential healthcare support roles and community health services.',
    imageUrl: 'https://picsum.photos/seed/health-diploma/800/600',
    programType: 'Diploma',
  },
  {
    id: 'd6',
    name: 'Faculty of Management Sciences (N.D.)',
    description: 'Equipping students with practical business and administrative skills for the modern workplace.',
    imageUrl: 'https://picsum.photos/seed/management-diploma/800/600',
    programType: 'Diploma',
  },
  {
    id: 'd7',
    name: 'Faculty of Science and Technology (N.D.)',
    description: 'Fostering technical proficiency and scientific knowledge for roles in technology and laboratory settings.',
    imageUrl: 'https://picsum.photos/seed/sci-tech-diploma/800/600',
    programType: 'Diploma',
  },
  {
    id: 'd8',
    name: 'Faculty of Social Sciences (N.D.)',
    description: 'Exploring human society and communication, preparing students for careers in media and social services.',
    imageUrl: 'https://picsum.photos/seed/social-sci-diploma/800/600',
    programType: 'Diploma',
  }
];

let MOCK_COURSES: Course[] = [
  // Management & Social Science (d1)
  { id: 'c1', code: 'ACC401', title: 'B.Sc. Accounting', description: 'Comprehensive study of financial principles, auditing, taxation, and corporate governance.', creditHours: 4, departmentId: 'd1', programType: 'Degree' },
  { id: 'c2', code: 'BUS410', title: 'B.Sc. Business Administration', description: 'A broad-based degree covering all aspects of business operations, including marketing, finance, and human resources.', creditHours: 4, departmentId: 'd1', programType: 'Degree' },
  { id: 'c3', code: 'BFN320', title: 'B.Sc. Banking & Finance', description: 'In-depth analysis of financial markets, banking operations, investment strategies, and risk management.', creditHours: 3, departmentId: 'd1', programType: 'Degree' },
  { id: 'c4', code: 'MGT305', title: 'B.Sc. Management', description: 'Focuses on organizational leadership, strategic planning, and operational efficiency.', creditHours: 3, departmentId: 'd1', programType: 'Degree', lecturerId: 'staff-lecturer-1' },
  { id: 'c5', code: 'PAD400', title: 'B.Sc. Public Administration', description: 'The study of government policy implementation, public sector management, and civic leadership.', creditHours: 3, departmentId: 'd1', programType: 'Degree' },
  { id: 'c6', code: 'TRP210', title: 'B.Sc. Transport & Regional Planning', description: 'Examines the planning, design, and management of transportation systems and urban development.', creditHours: 4, departmentId: 'd1', programType: 'Degree' },
  { id: 'c7', code: 'TRL220', title: 'B.Sc. Transport & Logistics', description: 'Specialized study of supply chain management, logistics operations, and global transport networks.', creditHours: 4, departmentId: 'd1', programType: 'Degree' },

  // Applied Science & Engineering (d2)
  { id: 'c8', code: 'CSD350', title: 'B.Sc. Computer Software Development', description: 'Hands-on training in software engineering, mobile app development, and web technologies.', creditHours: 4, departmentId: 'd2', programType: 'Degree', lecturerId: 'staff-academic' },
  { id: 'c9', code: 'MCB230', title: 'B.Sc. Microbiology', description: 'The study of microorganisms and their role in health, environment, and industry.', creditHours: 3, departmentId: 'd2', programType: 'Degree' },
  { id: 'c10', code: 'CSC111', title: 'B.Sc. Computer Science', description: 'A foundational degree in programming, algorithms, data structures, and computer theory.', creditHours: 4, departmentId: 'd2', programType: 'Degree', lecturerId: 'staff-academic' },
  { id: 'c11', code: 'MLT300', title: 'B.Tech. Medical Laboratory Technology', description: 'Focuses on the technological aspects of laboratory equipment and advanced diagnostic techniques.', creditHours: 4, departmentId: 'd2', programType: 'Degree' },
  { id: 'c12', code: 'ESM450', title: 'B.Sc. Estate Management', description: 'Valuation, management, and development of real estate assets and properties.', creditHours: 3, departmentId: 'd2', programType: 'Degree' },
  { id: 'c13', code: 'CVE500', title: 'B.Eng. Civil Engineering', description: 'Design, construction, and maintenance of infrastructure projects like roads, bridges, and buildings.', creditHours: 5, departmentId: 'd2', programType: 'Degree' },

  // Education, Art & Humanities (d3)
  { id: 'c14', code: 'MAC201', title: 'B.A. Mass Communication', description: 'Study of journalism, public relations, broadcasting, and digital media.', creditHours: 3, departmentId: 'd3', programType: 'Degree' },
  { id: 'c15', code: 'ECO101', title: 'B.Sc. Economics', description: 'Analysis of market trends, economic policies, and financial systems at micro and macro levels.', creditHours: 3, departmentId: 'd3', programType: 'Degree' },
  { id: 'c16', code: 'LAW500', title: 'LL.B. Law', description: 'A comprehensive legal education covering constitutional, criminal, corporate, and international law.', creditHours: 5, departmentId: 'd3', programType: 'Degree' },
  { id: 'c17', code: 'PSY220', title: 'B.Sc. Psychology', description: 'Exploration of human behavior, mental processes, and psychological theories.', creditHours: 3, departmentId: 'd3', programType: 'Degree' },
  { id: 'c18', code: 'VSA150', title: 'B.A. Visual and Studio Art', description: 'Creative expression and technical skill development in painting, sculpture, and digital art.', creditHours: 3, departmentId: 'd3', programType: 'Degree' },

  // Health Sciences (d4)
  { id: 'c19', code: 'NUR101', title: 'B.NSc. Nursing', description: 'Fundamental and advanced concepts of nursing practice, patient care, and clinical skills.', creditHours: 4, departmentId: 'd4', programType: 'Degree', lecturerId: 'staff-lecturer-1' },
  { id: 'c20', code: 'PHA310', title: 'B.Pharm. Pharmacy', description: 'Study of drug actions, pharmaceutical sciences, and their effects on the human body.', creditHours: 5, departmentId: 'd4', programType: 'Degree' },
  { id: 'c21', code: 'MLS202', title: 'B.MLS. Medical Laboratory Science', description: 'Core principles of clinical laboratory diagnostics, procedures, and disease identification.', creditHours: 4, departmentId: 'd4', programType: 'Degree', lecturerId: 'staff-lecturer-1' },
  { id: 'c22', code: 'PBH250', title: 'B.Sc. Public Health', description: 'Focuses on community health, epidemiology, health policy, and disease prevention.', creditHours: 3, departmentId: 'd4', programType: 'Degree' },

  // --- DIPLOMA COURSES ---
  // Health Sciences (d5)
  { id: 'c23', code: 'NUR090', title: 'N.D. Nursing', description: 'Foundational nursing skills for patient care in various healthcare settings.', creditHours: 3, departmentId: 'd5', programType: 'Diploma' },
  { id: 'c24', code: 'PBH095', title: 'N.D. Public Health', description: 'Introduction to community health, disease prevention, and health promotion.', creditHours: 3, departmentId: 'd5', programType: 'Diploma' },
  { id: 'c25', code: 'PHT110', title: 'N.D. Pharmacy Technician', description: 'Training in dispensing medications and managing pharmacy operations under pharmacist supervision.', creditHours: 4, departmentId: 'd5', programType: 'Diploma' },
  { id: 'c26', code: 'MLT101', title: 'N.D. Medical Laboratory Technician', description: 'Practical skills in conducting routine laboratory tests to aid in diagnosis and treatment.', creditHours: 4, departmentId: 'd5', programType: 'Diploma' },
  { id: 'c27', code: 'HIM120', title: 'N.D. Health Information Management', description: 'Managing patient health information and medical records with a focus on data quality and security.', creditHours: 3, departmentId: 'd5', programType: 'Diploma' },
  { id: 'c28', code: 'NDT130', title: 'N.D. Nutrition & Dietetics', description: 'Fundamentals of nutritional science and dietary management for individuals and groups.', creditHours: 3, departmentId: 'd5', programType: 'Diploma' },
  { id: 'c29', code: 'CHEW140', title: 'N.D. Community Health Extension Worker', description: 'Training to provide primary healthcare services and health education in community settings.', creditHours: 4, departmentId: 'd5', programType: 'Diploma' },

  // Management Sciences (d6)
  { id: 'c30', code: 'ACC101', title: 'N.D. Accounting', description: 'Basic principles of accounting, bookkeeping, and financial statement preparation.', creditHours: 3, departmentId: 'd6', programType: 'Diploma' },
  { id: 'c31', code: 'BUS110', title: 'N.D. Business Administration', description: 'Core concepts of business management, administration, and organizational behavior.', creditHours: 3, departmentId: 'd6', programType: 'Diploma' },
  { id: 'c32', code: 'OTM120', title: 'N.D. Office Technology & Management (OTM)', description: 'Skills in modern office procedures, document processing, and administrative support.', creditHours: 3, departmentId: 'd6', programType: 'Diploma' },
  { id: 'c33', code: 'BFN130', title: 'N.D. Banking & Finance', description: 'Introduction to banking operations, financial services, and principles of finance.', creditHours: 3, departmentId: 'd6', programType: 'Diploma' },
  { id: 'c34', code: 'ESBM140', title: 'N.D. Entrepreneurship & Small Business Management', description: 'Learn to start, operate, and grow a small business with practical entrepreneurship skills.', creditHours: 4, departmentId: 'd6', programType: 'Diploma' },

  // Science and Technology (d7)
  { id: 'c35', code: 'CSC101', title: 'N.D. Computer Science', description: 'An introduction to programming, computer hardware, and software applications.', creditHours: 4, departmentId: 'd7', programType: 'Diploma' },
  { id: 'c36', code: 'SLT110', title: 'N.D. Science Laboratory Technology (SLT)', description: 'Hands-on training in laboratory techniques across biology, chemistry, and physics.', creditHours: 4, departmentId: 'd7', programType: 'Diploma' },
  { id: 'c37', code: 'ICH120', title: 'N.D. Industrial Chemistry', description: 'Principles of chemical processes and their application in industrial manufacturing.', creditHours: 3, departmentId: 'd7', programType: 'Diploma' },
  { id: 'c38', code: 'BCM130', title: 'N.D. Biochemistry / Microbiology', description: 'A combined study of the chemical processes in living organisms and the world of microorganisms.', creditHours: 4, departmentId: 'd7', programType: 'Diploma' },
  { id: 'c39', code: 'CYS140', title: 'N.D. Cyber Security', description: 'Fundamental concepts of network security, ethical hacking, and digital forensics.', creditHours: 4, departmentId: 'd7', programType: 'Diploma' },
  { id: 'c40', code: 'ICT150', title: 'N.D. Information & Communication Technology', description: 'A broad overview of IT, including networking, database management, and web development.', creditHours: 4, departmentId: 'd7', programType: 'Diploma' },

  // Social Sciences (d8)
  { id: 'c41', code: 'PSY101', title: 'N.D. Psychology', description: 'An introduction to the scientific study of mind and behavior, and its application.', creditHours: 3, departmentId: 'd8', programType: 'Diploma' },
  { id: 'c42', code: 'SOC110', title: 'N.D. Sociology', description: 'Examines social structures, human interaction, and the dynamics of society.', creditHours: 3, departmentId: 'd8', programType: 'Diploma' },
  { id: 'c43', code: 'MAC120', title: 'N.D. Mass Communication', description: 'Basic skills in journalism, broadcasting, and public relations.', creditHours: 3, departmentId: 'd8', programType: 'Diploma' },
  { id: 'c44', code: 'INR130', title: 'N.D. International Relations', description: 'An introduction to global politics, diplomacy, and international organizations.', creditHours: 3, departmentId: 'd8', programType: 'Diploma' },
];

let MOCK_APPLICATIONS: Application[] = [
  { id: 'app-a1b2c3d4', name: 'John Doe', email: 'john.doe@example.com', phone: '+2348012345678', gender: 'M', departmentId: 'd4', transcriptUrl: '/transcripts/john_doe.pdf', status: ApplicationStatus.Pending, createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
  { id: 'app-e5f6g7h8', name: 'Jane Smith', email: 'jane.smith@example.com', phone: '+2348023456789', gender: 'F', departmentId: 'd2', transcriptUrl: '/transcripts/jane_smith.pdf', status: ApplicationStatus.Approved, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'app-i9j0k1l2', name: 'Sam Wilson', email: 'sam.wilson@example.com', phone: '+2348034567890', gender: 'M', departmentId: 'd1', transcriptUrl: '/transcripts/sam_wilson.pdf', status: ApplicationStatus.Rejected, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
];

let MOCK_STAFF: (StaffMember & { passwordHash: string })[] = [
  { id: 'staff-admin', role: StaffRole.Admin, name: 'Dr. Adanna Okoro', email: 'admin@crestview.edu.ng', phone: '+2348000000001', createdAt: new Date().toISOString(), passwordHash: 'AdminPass1!', departmentId: 'd1', bio: 'Provost of Crestview College, dedicated to fostering academic excellence and innovation.', imageUrl: 'https://picsum.photos/seed/provost/200/200' },
  { id: 'staff-academic', role: StaffRole.AcademicOfficer, name: 'Prof. Chinua Achebe', email: 'academic@crestview.edu.ng', phone: '+2348000000002', createdAt: new Date().toISOString(), passwordHash: 'AcademicPass1!', departmentId: 'd2', bio: 'Head of the Faculty of Applied Science & Engineering, specializing in artificial intelligence.', imageUrl: 'https://picsum.photos/seed/prof1/200/200' },
  { id: 'staff-admissions', role: StaffRole.AdmissionsOfficer, name: 'Ms. Ada Lovelace', email: 'admissions@crestview.edu.ng', phone: '+2348000000003', createdAt: new Date().toISOString(), passwordHash: 'AdmissionsPass1!', departmentId: 'd1', bio: 'Lead Admissions Officer, passionate about helping students begin their academic journey.', imageUrl: 'https://picsum.photos/seed/admin1/200/200' },
  { id: 'staff-lecturer-1', role: StaffRole.Lecturer, name: 'Dr. Bisi Adebayo', email: 'b.adebayo@crestview.edu.ng', phone: '+2348000000004', createdAt: new Date().toISOString(), passwordHash: 'StaffPass1!', departmentId: 'd4', bio: 'Senior Lecturer in the Faculty of Health Sciences with a focus on public health.', imageUrl: 'https://picsum.photos/seed/lecturer1/200/200' },
  { id: 'staff-librarian-1', role: StaffRole.Librarian, name: 'Mr. Femi Adekunle', email: 'f.adekunle@crestview.edu.ng', phone: '+2348000000005', createdAt: new Date().toISOString(), passwordHash: 'StaffPass1!', bio: 'Head Librarian, committed to providing students with the best resources for their research.', imageUrl: 'https://picsum.photos/seed/librarian1/200/200' },
];

let MOCK_STUDENTS: (Student & { passwordHash: string })[] = [
    { id: 'student-1', studentId: 'CST/21/001', name: 'Alice Johnson', email: 'alice.j@student.crestview.edu.ng', departmentId: 'd2', createdAt: new Date().toISOString(), passwordHash: 'StudentPass1!', phone: '+2349012345678' },
    { id: 'student-2', studentId: 'CST/21/002', name: 'Bob Williams', email: 'bob.w@student.crestview.edu.ng', departmentId: 'd4', createdAt: new Date().toISOString(), passwordHash: 'StudentPass2!', phone: '' },
];

let MOCK_ANNOUNCEMENTS: Announcement[] = [
    { id: 'ann-1', title: 'Mid-term Break', content: 'The college will be on a mid-term break from October 25th to October 29th.', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'ann-2', title: 'Library Renovation', content: 'The main library will be closed for renovation starting November 1st. A temporary library is set up in Hall B.', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
];

let MOCK_TIMETABLE: TimetableEntry[] = [
    { id: 'tt-1', courseId: 'c19', dayOfWeek: 'Monday', startTime: '09:00', endTime: '11:00', location: 'Hall A', lecturerId: 'staff-lecturer-1' },
    { id: 'tt-2', courseId: 'c4', dayOfWeek: 'Monday', startTime: '11:00', endTime: '13:00', location: 'Room 201', lecturerId: 'staff-lecturer-1' },
    { id: 'tt-3', courseId: 'c10', dayOfWeek: 'Tuesday', startTime: '10:00', endTime: '12:00', location: 'Lab 3', lecturerId: 'staff-academic' },
    { id: 'tt-4', courseId: 'c8', dayOfWeek: 'Wednesday', startTime: '14:00', endTime: '16:00', location: 'Lab 1', lecturerId: 'staff-academic' },
];

let MOCK_CAREERS: JobOpening[] = [
  { id: 'job-1', title: 'Senior Lecturer, Computer Science', department: 'Faculty', location: 'Lagos, Nigeria', type: 'Full-time', description: 'We are seeking an experienced and passionate Senior Lecturer to join our Faculty of Technology.', responsibilities: [ 'Deliver lectures, tutorials, and lab sessions.', 'Develop and update course materials.', 'Supervise student projects.', 'Engage in research.' ], qualifications: [ 'PhD in Computer Science or a related field.', 'Minimum of 5 years of teaching experience.', 'Proven track record of research.' ], featured: true },
  { id: 'job-2', title: 'Admissions Officer', department: 'Administration', location: 'Lagos, Nigeria', type: 'Full-time', description: 'The Admissions Officer will play a key role in the student recruitment and admissions process.', responsibilities: [ 'Process student applications.', 'Respond to inquiries from prospective students.', 'Assist in recruitment events.', 'Maintain accurate records.' ], qualifications: [ 'Bachelor\'s degree in Business Administration, Education, or a related field.', 'At least 2 years of experience in an administrative role.', 'Strong proficiency in MS Office Suite.' ] },
  { id: 'job-3', title: 'IT Support Technician', department: 'IT Support', location: 'Lagos, Nigeria', type: 'Contract', description: 'A 6-month contract position for an IT Support Technician to provide technical assistance.', responsibilities: [ 'Provide first-level technical support.', 'Install, configure, and troubleshoot computer systems.', 'Manage user accounts.', 'Assist with classroom AV equipment.' ], qualifications: [ 'Diploma or degree in Information Technology.', 'CompTIA A+ or similar certification is a plus.', 'Experience with Windows and macOS environments.' ] },
];

let MOCK_JOB_APPLICATIONS: JobApplicationData[] = [];

let MOCK_ENROLLMENTS: Record<string, string[]> = {
    // Student 1 is enrolled in a mix of courses, some on the timetable, some not.
    'student-1': ['c19', 'c4', 'c10', 'c8', 'c5'], 
    // Student 2 is enrolled in one course.
    'student-2': ['c21'],
};

// --- NEW MOCK DATA ---
const MOCK_ALUMNI: Alumni[] = [
    { id: 'alumni-1', name: 'Chinedu Okoro', graduationYear: 2018, departmentId: 'd2', occupation: 'Software Engineer, Google', testimonial: 'Crestview gave me the foundational skills and confidence to excel in the global tech industry. The hands-on projects were invaluable.', imageUrl: 'https://picsum.photos/seed/alumni1/200/200' },
    { id: 'alumni-2', name: 'Amina Bello', graduationYear: 2019, departmentId: 'd4', occupation: 'Lead Nurse, Lagos University Teaching Hospital', testimonial: 'The practical training and dedicated lecturers at Crestview prepared me for the challenges of a fast-paced hospital environment.', imageUrl: 'https://picsum.photos/seed/alumni2/200/200' },
];
let MOCK_FEES: Fee[] = [
    { id: 'fee-1', studentId: 'student-1', description: 'Tuition Fee - First Semester', amount: 250000, dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), status: FeeStatus.Due },
    { id: 'fee-2', studentId: 'student-1', description: 'Accomodation Fee', amount: 80000, dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), status: FeeStatus.Overdue },
    { id: 'fee-3', studentId: 'student-1', description: 'Library Fee', amount: 5000, dueDate: new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000).toISOString(), status: FeeStatus.Overdue },
    { id: 'fee-4', studentId: 'student-2', description: 'Lab Equipment Fee', amount: 50000, dueDate: new Date(Date.now() - 2 * 30 * 24 * 60 * 60 * 1000).toISOString(), status: FeeStatus.Overdue },
    { id: 'fee-5', studentId: 'student-1', description: 'Tuition Fee - Second Semester', amount: 300000, dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), status: FeeStatus.Due },
];
// FIX: Added mock payment data for /api/payments endpoint
let MOCK_PAYMENTS: Payment[] = [
    { id: 'pay-1', studentId: 'student-1', date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), amount: 250000, description: 'Tuition Fee - Previous Semester' },
    { id: 'pay-2', studentId: 'student-2', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), amount: 80000, description: 'Accommodation Fee' },
    { id: 'pay-3', studentId: 'student-1', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), amount: 250000, description: 'Tuition Fee - First Semester' },
];
let MOCK_EVENTS: CalendarEvent[] = [
    { id: 'event-1', title: 'Matriculation Ceremony', date: '2024-10-15', description: 'Official welcome ceremony for all new students.', category: 'Campus Life', rsvps: 128 },
    { id: 'event-2', title: 'Mid-Semester Exams Begin', date: '2024-11-04', description: 'First semester examinations for all departments.', category: 'Academic', rsvps: 0 },
    { id: 'event-3', title: 'Independence Day', date: '2024-10-01', description: 'Public holiday. College closed.', category: 'Holiday', rsvps: 0 },
];
let MOCK_COURSE_MATERIALS: CourseMaterial[] = [
    { id: 'cm-1', courseId: 'c10', title: 'Lecture 1: Intro to Algorithms', fileUrl: '#', fileType: 'PDF', uploadedAt: new Date().toISOString() },
    { id: 'cm-2', courseId: 'c10', title: 'Lab 1: Sorting Algorithms', fileUrl: '#', fileType: 'DOCX', uploadedAt: new Date().toISOString() },
];
const MOCK_LIBRARY_BOOKS: LibraryBook[] = [
    { id: 'book-1', title: 'Clean Code', author: 'Robert C. Martin', isbn: '978-0132350884', description: 'A handbook of agile software craftsmanship.', status: BookStatus.Available },
    { id: 'book-2', title: 'Gray\'s Anatomy for Students', author: 'Richard Drake', isbn: '978-0323393041', description: 'A clinical-based anatomy textbook.', status: BookStatus.CheckedOut, dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() },
];
const MOCK_CLUBS: StudentClub[] = [
    { id: 'club-1', name: 'Crestview Coders', description: 'A community for students passionate about coding, competitive programming, and hackathons.', imageUrl: 'https://picsum.photos/seed/club1/800/600', contactEmail: 'coders@student.crestview.edu.ng', category: 'Academic' },
    { id: 'club-2', name: 'Future Health Leaders', description: 'Dedicated to community health outreach, medical volunteering, and health advocacy.', imageUrl: 'https://picsum.photos/seed/club2/800/600', contactEmail: 'health@student.crestview.edu.ng', category: 'Academic' },
    { id: 'club-3', name: 'Crestview Christian Fellowship', description: 'A fellowship for Christian students to grow in faith, worship, and community service. All are welcome.', imageUrl: 'https://picsum.photos/seed/club3/800/600', contactEmail: 'ccf@student.crestview.edu.ng', category: 'Religious' },
    { id: 'club-4', name: 'Muslim Students\' Society of Crestview', description: 'Promoting Islamic values, brotherhood, and educational development among Muslim students on campus.', imageUrl: 'https://picsum.photos/seed/club4/800/600', contactEmail: 'mssn@student.crestview.edu.ng', category: 'Religious' },
];
const MOCK_TESTIMONIALS: Testimonial[] = [
    { id: 't1', studentName: 'Fatima Abdul', program: 'B.NSc. Nursing', graduationYear: 2022, quote: 'The hands-on clinical experience I gained at Crestview was second to none. The instructors were supportive and pushed me to be the best nurse I can be. I felt confident and prepared from day one in my career.', imageUrl: 'https://picsum.photos/seed/testimonial1/100/100' },
    { id: 't2', studentName: 'David Obinna', program: 'B.Sc. Computer Science', graduationYear: 2023, quote: 'Crestview\'s tech program is incredibly relevant. The focus on practical projects and modern technologies gave me a huge advantage when I started job hunting. I landed my dream role as a software developer even before I graduated.', imageUrl: 'https://picsum.photos/seed/testimonial2/100/100' },
    { id: 't3', studentName: 'Sarah Johnson', program: 'N.D. Business Administration', graduationYear: 2022, quote: 'The diploma program was perfect for me. It was practical, focused, and equipped me with the real-world skills needed to manage a small business. The entrepreneurship module was a game-changer!', imageUrl: 'https://picsum.photos/seed/testimonial3/100/100' }
];
const MOCK_MENTORS: Mentor[] = [
    { ...MOCK_ALUMNI[0], expertise: ['Software Engineering', 'Cloud Computing', 'AI/ML'] },
    { ...MOCK_ALUMNI[1], expertise: ['Clinical Nursing', 'Hospital Administration', 'Public Health'] },
    { id: 'alumni-3', name: 'Tunde Adebayo', graduationYear: 2017, departmentId: 'd1', occupation: 'Senior Consultant, PwC', testimonial: 'Crestview taught me how to think critically and solve complex business problems.', imageUrl: 'https://picsum.photos/seed/alumni3/200/200', expertise: ['Management Consulting', 'Financial Analysis'] },
];
let MOCK_COURSE_GRADES: CourseGrade[] = [
    // student-1 grades
    { studentId: 'student-1', courseId: 'c19', semester: 'Y1S1', score: 85 },
    { studentId: 'student-1', courseId: 'c4', semester: 'Y1S1', score: 78 },
    { studentId: 'student-1', courseId: 'c5', semester: 'Y1S2', score: 65 },
    { studentId: 'student-1', courseId: 'c10', semester: 'Y2S1', score: 92 },
    { studentId: 'student-1', courseId: 'c8', semester: 'Y2S1', score: 88 },
    // student-2 grades
    { studentId: 'student-2', courseId: 'c21', semester: 'Y1S1', score: 72 },
];
let MOCK_CLUB_DETAILS: ClubDetail[] = [
    { 
        ...MOCK_CLUBS[0], 
        announcements: [{id: 'ca-1', title: 'Hackathon Prep Session this Friday!', date: new Date().toISOString()}], 
        members: Array.from({length: 15}, (_, i) => ({id: `cm-1-${i}`, name: `Member ${i+1}`, imageUrl: `https://picsum.photos/seed/cm1-${i}/40/40`})),
        galleryImages: [
            { imageUrl: 'https://picsum.photos/seed/gallery1-1/800/600', caption: 'Our team at the National Hackathon 2023.' },
            { imageUrl: 'https://picsum.photos/seed/gallery1-2/800/600', caption: 'Weekly coding session in the tech lab.' },
            { imageUrl: 'https://picsum.photos/seed/gallery1-3/800/600', caption: 'Guest lecture from a Google software engineer.' },
            { imageUrl: 'https://picsum.photos/seed/gallery1-4/800/600', caption: 'Collaborative project brainstorming.' },
        ]
    },
    { 
        ...MOCK_CLUBS[1], 
        announcements: [{id: 'ca-2', title: 'Community Health Drive next month.', date: new Date().toISOString()}], 
        members: Array.from({length: 22}, (_, i) => ({id: `cm-2-${i}`, name: `Member ${i+1}`, imageUrl: `https://picsum.photos/seed/cm2-${i}/40/40`})),
        galleryImages: [
            { imageUrl: 'https://picsum.photos/seed/gallery2-1/800/600', caption: 'Blood pressure screening at the community outreach.' },
            { imageUrl: 'https://picsum.photos/seed/gallery2-2/800/600', caption: 'Health awareness talk at a local school.' },
            { imageUrl: 'https://picsum.photos/seed/gallery2-3/800/600', caption: 'First-aid training workshop for members.' },
        ]
    },
    { 
        ...MOCK_CLUBS[2], 
        announcements: [{id: 'ca-3', title: 'Weekly Bible Study: Wednesdays at 5 PM in Chapel Hall.', date: new Date().toISOString()}], 
        members: Array.from({length: 18}, (_, i) => ({id: `cm-3-${i}`, name: `Member ${i+1}`, imageUrl: `https://picsum.photos/seed/cm3-${i}/40/40`})),
        galleryImages: [
            { imageUrl: 'https://picsum.photos/seed/gallery3-1/800/600', caption: 'Annual fellowship conference.' },
            { imageUrl: 'https://picsum.photos/seed/gallery3-2/800/600', caption: 'Community service and outreach program.' },
        ]
    },
    { 
        ...MOCK_CLUBS[3], 
        announcements: [{id: 'ca-4', title: 'Jummah Prayer Reminder: Friday at 1 PM at the campus mosque.', date: new Date().toISOString()}], 
        members: Array.from({length: 25}, (_, i) => ({id: `cm-4-${i}`, name: `Member ${i+1}`, imageUrl: `https://picsum.photos/seed/cm4-${i}/40/40`})),
        galleryImages: [
            { imageUrl: 'https://picsum.photos/seed/gallery4-1/800/600', caption: 'Ramadan Iftar event with the community.' },
            { imageUrl: 'https://picsum.photos/seed/gallery4-2/800/600', caption: 'Lecture series on Islamic history and culture.' },
            { imageUrl: 'https://picsum.photos/seed/gallery4-3/800/600', caption: 'Eid celebration on campus.' },
        ]
    }
]
let MOCK_DYNAMIC_APPLICATIONS: DynamicApplicationData[] = [];
let MOCK_VISITATIONS: Visitation[] = [
    { id: 'vis-1', title: 'Lekki Conservation Centre Trip', description: 'Explore the famous canopy walk and observe Nigeria\'s rich biodiversity. A great way to unwind and connect with nature.', category: 'Recreational', date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), imageUrl: 'https://picsum.photos/seed/lekki/800/600', gallery: [ { imageUrl: 'https://picsum.photos/seed/lekki-g1/800/600', caption: 'The famous canopy walk.' }, { imageUrl: 'https://picsum.photos/seed/lekki-g2/800/600', caption: 'Spotting a monkey in the trees.' } ] },
    { id: 'vis-2', title: 'Visit to National Assembly Complex', description: 'An educational tour for Public Administration students to understand the legislative process of Nigeria firsthand.', category: 'Educational', date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(), imageUrl: 'https://picsum.photos/seed/assembly/800/600', relatedDepartmentId: 'd1', gallery: [] },
    { id: 'vis-3', title: 'Excursion to Badagry Slave Museum', description: 'A historical trip to the first-storey building and slave museum in Badagry to learn about the region\'s profound history.', category: 'Educational', date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(), imageUrl: 'https://picsum.photos/seed/badagry/800/600', gallery: [ { imageUrl: 'https://picsum.photos/seed/badagry-g1/800/600', caption: 'The first-storey building in Nigeria.' }, { imageUrl: 'https://picsum.photos/seed/badagry-g2/800/600', caption: 'Inside the museum.' }, { imageUrl: 'https://picsum.photos/seed/badagry-g3/800/600', caption: 'Point of No Return.' } ] },
    { id: 'vis-4', title: 'Faculty of Health Sciences Outreach', description: 'A departmental outreach program to a local community, providing basic health checks and education.', category: 'Departmental', date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), imageUrl: 'https://picsum.photos/seed/outreach/800/600', relatedDepartmentId: 'd4' },
];

const calculateGpa = (scores: { score: number; creditHours: number }[]): number => {
    if (scores.length === 0) return 0;
    const getGradePoint = (score: number): number => {
        if (score >= 70) return 5.0;
        if (score >= 60) return 4.0;
        if (score >= 50) return 3.0;
        if (score >= 45) return 2.0;
        return 0.0;
    };
    let totalGradePoints = 0;
    let totalCreditHours = 0;
    for (const s of scores) {
        totalGradePoints += getGradePoint(s.score) * s.creditHours;
        totalCreditHours += s.creditHours;
    }
    if (totalCreditHours === 0) return 0;
    return parseFloat((totalGradePoints / totalCreditHours).toFixed(2));
};

// FIX: Added '/api/students' to ApiEndpoint type.
type ApiEndpoint = 
  '/api/courses' | '/api/departments' | '/api/announcements' | '/api/timetable' | '/api/careers' |
  '/api/alumni' | '/api/fees' | '/api/events' | '/api/course-materials' | '/api/library-books' |
  '/api/clubs' | '/api/staff' | '/api/analytics' | '/api/mentors' | '/api/student-grades' |
  '/api/club-details' | '/api/student-enrollments' | '/api/payments' | '/api/testimonials' |
  '/api/students' | '/api/visitations' | '/api/course-grades-for-student';

// FIX: Added handlers for '/api/payments' and '/api/students' endpoints
const apiDataMap: Record<ApiEndpoint, (id?: string) => any> = {
  '/api/courses': () => MOCK_COURSES,
  '/api/departments': () => MOCK_DEPARTMENTS,
  '/api/announcements': () => [...MOCK_ANNOUNCEMENTS].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  '/api/timetable': () => MOCK_TIMETABLE,
  '/api/careers': () => MOCK_CAREERS,
  '/api/alumni': () => MOCK_ALUMNI,
  '/api/fees': () => MOCK_FEES,
  '/api/events': () => MOCK_EVENTS,
  '/api/course-materials': () => MOCK_COURSE_MATERIALS,
  '/api/library-books': () => MOCK_LIBRARY_BOOKS,
  '/api/clubs': () => MOCK_CLUBS,
  '/api/staff': () => MOCK_STAFF.map(({ passwordHash, ...staff }) => staff),
  '/api/analytics': (): AnalyticsData => ({
    applicationsByStatus: [
        { status: ApplicationStatus.Approved, count: 120 },
        { status: ApplicationStatus.Pending, count: 45 },
        { status: ApplicationStatus.Rejected, count: 30 },
    ],
    enrollmentByDepartment: [
        { departmentName: 'Health Sciences', count: 450 },
        { departmentName: 'Applied Science & Engineering', count: 620 },
        { departmentName: 'Management & Social Sciences', count: 350 },
        { departmentName: 'Education, Arts & Humanities', count: 280 },
    ]
  }),
  '/api/mentors': () => MOCK_MENTORS,
  '/api/student-grades': (studentId) => {
    if (!studentId) return [];
    const courseGrades = MOCK_COURSE_GRADES.filter(g => g.studentId === studentId);
    const gradesBySemester: Record<string, { score: number; creditHours: number }[]> = {};

    for (const grade of courseGrades) {
        const course = MOCK_COURSES.find(c => c.id === grade.courseId);
        if (course) {
            if (!gradesBySemester[grade.semester]) {
                gradesBySemester[grade.semester] = [];
            }
            gradesBySemester[grade.semester].push({ score: grade.score, creditHours: course.creditHours });
        }
    }

    const gpaResults: StudentGrade[] = Object.entries(gradesBySemester).map(([semester, scores]) => ({
        semester,
        gpa: calculateGpa(scores)
    }));

    return gpaResults.sort((a, b) => a.semester.localeCompare(b.semester));
  },
  '/api/course-grades-for-student': (studentId) => MOCK_COURSE_GRADES.filter(g => g.studentId === studentId),
  '/api/club-details': () => MOCK_CLUB_DETAILS,
  '/api/student-enrollments': (studentId) => MOCK_ENROLLMENTS[studentId || ''] || [],
  '/api/payments': () => MOCK_PAYMENTS,
  '/api/students': () => MOCK_STUDENTS.map(({ passwordHash, ...student }) => student),
  '/api/testimonials': () => MOCK_TESTIMONIALS,
  '/api/visitations': () => MOCK_VISITATIONS,
};

const generateId = (prefix: 'app' | 'c' | 'ann' | 'tt' | 'staff') => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;

const validateCourse = (course: Omit<Course, 'id'>): { valid: boolean; message?: string } => {
    if (!/^[A-Z]{3}\d{3}$/.test(course.code)) return { valid: false, message: 'Course code must be in the format ABC123.' };
    if (!course.title || course.title.length < 3) return { valid: false, message: 'Title is required and must be at least 3 characters.' };
    if (course.creditHours < 1 || course.creditHours > 6) return { valid: false, message: 'Credit hours must be between 1 and 6.'};
    if (!course.departmentId) return { valid: false, message: 'Department is required.' };
    return { valid: true };
}

export const useApi = <T,>(endpoint: ApiEndpoint, id?: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Increased for skeleton loaders
      const dataFetcher = apiDataMap[endpoint];
      if (dataFetcher) {
        setData(dataFetcher(id) as T);
      } else {
        throw new Error('Endpoint not found');
      }
    } catch (err) {
      console.error(`API Hook Error (${endpoint}):`, err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [endpoint, id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export const postContactForm = async (formData: ContactMessage): Promise<{ success: boolean; message: string }> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return { success: true, message: 'Your message has been sent successfully!' };
};

// --- STAFF AUTH API MOCKS ---
export const getCurrentStaff = (): StaffMember | null => {
    const userJson = sessionStorage.getItem('currentStaff');
    if (!userJson) return null;
    try {
        return JSON.parse(userJson);
    } catch (e) {
        console.error("Failed to parse staff from sessionStorage", e);
        sessionStorage.removeItem('currentStaff');
        return null;
    }
}

export const staffLogin = async (email: string, password: string): Promise<{ success: boolean; message?: string; user?: StaffMember }> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const user = MOCK_STAFF.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user && user.passwordHash === password) {
        const { passwordHash, ...userToStore } = user;
        sessionStorage.setItem('currentStaff', JSON.stringify(userToStore));
        return { success: true, user: userToStore };
    }
    return { success: false, message: 'Incorrect email or password.' };
}

export const staffLogout = () => {
    sessionStorage.removeItem('currentStaff');
}

// --- STUDENT AUTH API MOCKS ---
export const getCurrentStudent = (): Student | null => {
    const studentJson = sessionStorage.getItem('currentStudent');
    if (!studentJson) return null;
    try {
        return JSON.parse(studentJson);
    } catch (e) {
        console.error("Failed to parse student from sessionStorage", e);
        sessionStorage.removeItem('currentStudent');
        return null;
    }
}

export const studentLogin = async (studentId: string, password: string): Promise<{ success: boolean; message?: string; student?: Student }> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const student = MOCK_STUDENTS.find(s => s.studentId.toLowerCase() === studentId.trim().toLowerCase());
    if (student && student.passwordHash === password) {
        const { passwordHash, ...studentToStore } = student;
        sessionStorage.setItem('currentStudent', JSON.stringify(studentToStore));
        return { success: true, student: studentToStore };
    }
    return { success: false, message: 'Incorrect Student ID or password.' };
}

export const studentLogout = () => {
    sessionStorage.removeItem('currentStudent');
}

export const updateStudentProfile = async (studentId: string, data: Partial<Pick<Student, 'name' | 'phone'>>): Promise<{ success: boolean; message: string; student?: Student }> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const currentStudent = getCurrentStudent();
    if (!currentStudent || currentStudent.id !== studentId) return { success: false, message: 'Unauthorized' };
    
    const studentIndex = MOCK_STUDENTS.findIndex(s => s.id === studentId);
    if (studentIndex === -1) return { success: false, message: 'Student not found.' };

    MOCK_STUDENTS[studentIndex] = { ...MOCK_STUDENTS[studentIndex], ...data };
    const { passwordHash, ...updatedStudent } = MOCK_STUDENTS[studentIndex];
    sessionStorage.setItem('currentStudent', JSON.stringify(updatedStudent));
    return { success: true, message: 'Profile updated successfully.', student: updatedStudent };
}


export const updateStaffProfile = async (userId: string, data: Partial<Pick<StaffMember, 'name' | 'phone'>>): Promise<{ success: boolean; message: string; user?: StaffMember }> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const currentUser = getCurrentStaff();
    if (!currentUser || currentUser.id !== userId) return { success: false, message: 'Unauthorized' };
    
    const userIndex = MOCK_STAFF.findIndex(u => u.id === userId);
    if (userIndex === -1) return { success: false, message: 'User not found.' };

    MOCK_STAFF[userIndex] = { ...MOCK_STAFF[userIndex], ...data };
    const { passwordHash, ...updatedUser } = MOCK_STAFF[userIndex];
    sessionStorage.setItem('currentStaff', JSON.stringify(updatedUser));
    return { success: true, message: 'Profile updated successfully.', user: updatedUser };
}

export const updateStaffPassword = async (userId: string, newPassword: string): Promise<{ success: boolean; message: string; }> => {
    if (newPassword.length < 8) return { success: false, message: 'Password must be at least 8 characters.' };
    
    await new Promise(resolve => setTimeout(resolve, 200));
    const currentUser = getCurrentStaff();
    if (!currentUser || currentUser.id !== userId) return { success: false, message: 'Unauthorized' };

    const userIndex = MOCK_STAFF.findIndex(u => u.id === userId);
    if (userIndex === -1) return { success: false, message: 'User not found.' };

    MOCK_STAFF[userIndex].passwordHash = newPassword;
    return { success: true, message: 'Password updated successfully.' };
}

// --- ADMISSIONS API MOCKS ---
export const postApplication = async (formData: ApplicationFormData): Promise<{ success: boolean; message: string; applicationId?: string }> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  const newApplication: Application = { id: generateId('app'), name: formData.name, email: formData.email, phone: formData.phone, gender: formData.gender as 'M' | 'F', departmentId: formData.departmentId, transcriptUrl: `/uploads/${formData.transcript!.name}`, status: ApplicationStatus.Pending, createdAt: new Date().toISOString() };
  MOCK_APPLICATIONS.unshift(newApplication);
  console.log(`Mock Email confirmation sent to: ${formData.email} with ID: ${newApplication.id}`);
  return {  success: true,  message: 'Application submitted successfully! Please save your Application ID.', applicationId: newApplication.id };
};
export const fetchApplicationStatus = async (identifier: string): Promise<{ success: boolean; message?: string; application?: Application }> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const application = MOCK_APPLICATIONS.find(app => app.id.toLowerCase() === identifier.toLowerCase() || app.email.toLowerCase() === identifier.toLowerCase());
  if (application) return { success: true, application };
  return { success: false, message: 'Application not found. Please check your ID or email.' };
};
export const fetchAdminAdmissions = async (): Promise<{ success: boolean; applications?: Application[], message?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const user = getCurrentStaff();
    if (!user || ![StaffRole.Admin, StaffRole.AdmissionsOfficer].includes(user.role)) {
        return { success: false, message: 'Unauthorized. Required roles: Admin or Admissions Officer.' };
    }
    return { success: true, applications: [...MOCK_APPLICATIONS].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) };
};
export const updateApplicationStatus = async (id: string, status: ApplicationStatus.Approved | ApplicationStatus.Rejected): Promise<{ success: boolean, message?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const user = getCurrentStaff();
    if (!user || ![StaffRole.Admin, StaffRole.AdmissionsOfficer].includes(user.role)) {
       return { success: false, message: 'Unauthorized' };
    }
    const appIndex = MOCK_APPLICATIONS.findIndex(app => app.id === id);
    if (appIndex !== -1) { MOCK_APPLICATIONS[appIndex].status = status; return { success: true, message: 'Status updated successfully.' }; }
    return { success: false, message: 'Application not found.' };
};

// --- DYNAMIC APPLICATION API MOCK ---
export const postDynamicApplication = async (formData: DynamicApplicationData): Promise<{ success: boolean; message: string; applicationId?: string }> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  if (!formData.fullName || !formData.email || !formData.phone || !formData.gender || formData.programTypes.length === 0 || !formData.firstChoiceCourseId || formData.studyModes.length === 0 || !formData.transcript) {
      return { success: false, message: 'Incomplete application data. Please fill all fields.' };
  }
  const newApplicationId = `dyn-app-${crypto.randomUUID().slice(0, 8)}`;
  MOCK_DYNAMIC_APPLICATIONS.push(formData);
  console.log('New dynamic application submitted:', formData);
  return { success: true, message: 'Your application has been received! We will contact you shortly.', applicationId: newApplicationId };
};

// --- JOB APPLICATION API MOCK ---
export const postJobApplication = async (formData: Omit<JobApplicationData, 'jobTitle'>): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 600));

    if (!formData.name || !formData.email || !formData.resume) {
        return { success: false, message: 'Missing required fields. Please fill out your name, email, and upload a resume.' };
    }

    const job = MOCK_CAREERS.find(j => j.id === formData.jobId);
    if (!job) {
        return { success: false, message: 'Job opening not found. It may have been filled.' };
    }

    const newApplication: JobApplicationData = {
        ...formData,
        jobTitle: job.title,
    };

    console.log(`Received job application for ${newApplication.jobTitle} from ${newApplication.name} with resume: ${newApplication.resume.name}`);
    MOCK_JOB_APPLICATIONS.push(newApplication);

    return { success: true, message: `Your application for the ${job.title} position has been submitted successfully! We will contact you if your qualifications match our needs.` };
};


// --- COURSE MANAGEMENT API MOCKS ---
export const addCourse = async (courseData: Omit<Course, 'id'>): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const user = getCurrentStaff();
    if (!user || ![StaffRole.Admin, StaffRole.AcademicOfficer].includes(user.role)) return { success: false, message: 'Unauthorized' };
    const validation = validateCourse(courseData);
    if (!validation.valid) return { success: false, message: validation.message! };
    if(MOCK_COURSES.some(c => c.code.toLowerCase() === courseData.code.toLowerCase())) return { success: false, message: `Course with code ${courseData.code} already exists.` };
    const newCourse: Course = { ...courseData, id: generateId('c') };
    MOCK_COURSES.unshift(newCourse);
    return { success: true, message: 'Course added successfully.' };
}
export const updateCourse = async (id: string, courseData: Omit<Course, 'id'>): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const user = getCurrentStaff();
    if (!user || ![StaffRole.Admin, StaffRole.AcademicOfficer].includes(user.role)) return { success: false, message: 'Unauthorized' };
    const validation = validateCourse(courseData);
    if (!validation.valid) return { success: false, message: validation.message! };
    const courseIndex = MOCK_COURSES.findIndex(c => c.id === id);
    if (courseIndex === -1) return { success: false, message: 'Course not found.' };
    if(MOCK_COURSES.some(c => c.id !== id && c.code.toLowerCase() === courseData.code.toLowerCase())) return { success: false, message: `Another course with code ${courseData.code} already exists.` };
    MOCK_COURSES[courseIndex] = { ...MOCK_COURSES[courseIndex], ...courseData, id };
    return { success: true, message: 'Course updated successfully.' };
}
export const deleteCourse = async (id: string): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const user = getCurrentStaff();
    if (!user || ![StaffRole.Admin, StaffRole.AcademicOfficer].includes(user.role)) return { success: false, message: 'Unauthorized' };
    const initialLength = MOCK_COURSES.length;
    MOCK_COURSES = MOCK_COURSES.filter(c => c.id !== id);
    if (MOCK_COURSES.length === initialLength) return { success: false, message: 'Course not found.' };
    return { success: true, message: 'Course deleted successfully.' };
}
export const allocateCourse = async (courseId: string, lecturerId: string): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const user = getCurrentStaff();
    if (!user || ![StaffRole.Admin, StaffRole.AcademicOfficer].includes(user.role)) return { success: false, message: 'Unauthorized' };
    const courseIndex = MOCK_COURSES.findIndex(c => c.id === courseId);
    if (courseIndex === -1) return { success: false, message: 'Course not found.' };
    MOCK_COURSES[courseIndex].lecturerId = lecturerId;
    return { success: true, message: 'Lecturer allocated successfully.' };
};
export const unallocateCourse = async (courseId: string): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const user = getCurrentStaff();
    if (!user || ![StaffRole.Admin, StaffRole.AcademicOfficer].includes(user.role)) return { success: false, message: 'Unauthorized' };
    const courseIndex = MOCK_COURSES.findIndex(c => c.id === courseId);
    if (courseIndex === -1) return { success: false, message: 'Course not found.' };
    delete MOCK_COURSES[courseIndex].lecturerId;
    return { success: true, message: 'Lecturer unallocated successfully.' };
};

export const uploadCourseMaterial = async (courseId: string, title: string, file: File): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = getCurrentStaff();
    if (!user || ![StaffRole.Admin, StaffRole.AcademicOfficer, StaffRole.Lecturer].includes(user.role)) {
        return { success: false, message: 'Unauthorized.' };
    }

    const course = MOCK_COURSES.find(c => c.id === courseId);
    if (!course) {
        return { success: false, message: 'Course not found.' };
    }
    // Authorization check
    if (user.role === StaffRole.AcademicOfficer && user.departmentId !== course.departmentId) {
         return { success: false, message: 'You can only upload materials for your department.' };
    }
    if (user.role === StaffRole.Lecturer && course.lecturerId !== user.id) {
        return { success: false, message: 'You can only upload materials for courses you are assigned to.' };
    }

    let fileType: 'PDF' | 'DOCX' | 'PPT' = 'PDF';
    if (file.type === 'application/pdf') fileType = 'PDF';
    else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') fileType = 'DOCX';
    else if (file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') fileType = 'PPT';

    const newMaterial: CourseMaterial = {
        id: `cm-${crypto.randomUUID().slice(0, 8)}`,
        courseId,
        title,
        fileUrl: '#', // Mock URL
        fileType,
        uploadedAt: new Date().toISOString(),
    };
    MOCK_COURSE_MATERIALS.push(newMaterial);
    return { success: true, message: 'Material uploaded successfully.' };
};

export const deleteCourseMaterial = async (materialId: string): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const user = getCurrentStaff();
    if (!user || ![StaffRole.Admin, StaffRole.AcademicOfficer, StaffRole.Lecturer].includes(user.role)) {
        return { success: false, message: 'Unauthorized.' };
    }
    
    const materialIndex = MOCK_COURSE_MATERIALS.findIndex(m => m.id === materialId);
    if (materialIndex === -1) {
        return { success: false, message: 'Material not found.' };
    }
    
    const material = MOCK_COURSE_MATERIALS[materialIndex];
    const course = MOCK_COURSES.find(c => c.id === material.courseId);

    // Authorization check
    if (user.role === StaffRole.AcademicOfficer && user.departmentId !== course?.departmentId) {
         return { success: false, message: 'You can only delete materials from your department.' };
    }
    if (user.role === StaffRole.Lecturer && course?.lecturerId !== user.id) {
        return { success: false, message: 'You can only delete materials from your assigned courses.' };
    }

    MOCK_COURSE_MATERIALS.splice(materialIndex, 1);
    return { success: true, message: 'Material deleted successfully.' };
};


// --- ANNOUNCEMENT API MOCKS ---
export const addAnnouncement = async (data: Omit<Announcement, 'id' | 'createdAt'>): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const user = getCurrentStaff();
    if (user?.role !== StaffRole.Admin) return { success: false, message: 'Unauthorized' };
    const newAnnouncement: Announcement = { ...data, id: generateId('ann'), createdAt: new Date().toISOString() };
    MOCK_ANNOUNCEMENTS.push(newAnnouncement);
    return { success: true, message: 'Announcement created.' };
}
export const updateAnnouncement = async (id: string, data: Omit<Announcement, 'id' | 'createdAt'>): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const user = getCurrentStaff();
    if (user?.role !== StaffRole.Admin) return { success: false, message: 'Unauthorized' };
    const index = MOCK_ANNOUNCEMENTS.findIndex(a => a.id === id);
    if (index === -1) return { success: false, message: 'Announcement not found.'};
    MOCK_ANNOUNCEMENTS[index] = { ...MOCK_ANNOUNCEMENTS[index], ...data };
    return { success: true, message: 'Announcement updated.' };
}
export const deleteAnnouncement = async (id: string): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const user = getCurrentStaff();
    if (user?.role !== StaffRole.Admin) return { success: false, message: 'Unauthorized' };
    MOCK_ANNOUNCEMENTS = MOCK_ANNOUNCEMENTS.filter(a => a.id !== id);
    return { success: true, message: 'Announcement deleted.' };
}

// --- TIMETABLE API MOCKS ---
export const addTimetableEntry = async (data: Omit<TimetableEntry, 'id'>): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const user = getCurrentStaff();
    if (!user || ![StaffRole.Admin, StaffRole.AcademicOfficer].includes(user.role)) return { success: false, message: 'Unauthorized' };
    const newEntry: TimetableEntry = { ...data, id: generateId('tt') };
    MOCK_TIMETABLE.push(newEntry);
    return { success: true, message: 'Timetable entry added.' };
};
export const updateTimetableEntry = async (id: string, data: Partial<Omit<TimetableEntry, 'id'>>): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const user = getCurrentStaff();
    if (!user || ![StaffRole.Admin, StaffRole.AcademicOfficer].includes(user.role)) return { success: false, message: 'Unauthorized' };
    const index = MOCK_TIMETABLE.findIndex(t => t.id === id);
    if (index === -1) return { success: false, message: 'Entry not found.'};
    MOCK_TIMETABLE[index] = { ...MOCK_TIMETABLE[index], ...data };
    return { success: true, message: 'Timetable updated.' };
}
export const deleteTimetableEntry = async (id: string): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const user = getCurrentStaff();
    if (!user || ![StaffRole.Admin, StaffRole.AcademicOfficer].includes(user.role)) return { success: false, message: 'Unauthorized' };
    MOCK_TIMETABLE = MOCK_TIMETABLE.filter(t => t.id !== id);
    return { success: true, message: 'Timetable entry deleted.' };
};

// --- DEPARTMENT IMAGE API MOCK ---
export const updateDepartmentImage = async (departmentId: string, imageFile: File): Promise<{ success: boolean; message: string; imageUrl?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const user = getCurrentStaff();
    if (!user || user.role !== StaffRole.Admin) {
        return { success: false, message: 'Unauthorized. Only Admins can change department images.' };
    }

    const deptIndex = MOCK_DEPARTMENTS.findIndex(d => d.id === departmentId);
    if (deptIndex === -1) {
        return { success: false, message: 'Department not found.' };
    }

    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const imageUrl = event.target?.result as string;
            if (imageUrl) {
                MOCK_DEPARTMENTS[deptIndex].imageUrl = imageUrl;
                resolve({ success: true, message: 'Image updated successfully.', imageUrl });
            } else {
                 resolve({ success: false, message: 'Failed to read image file.' });
            }
        };
        reader.onerror = () => {
            resolve({ success: false, message: 'Failed to read image file.' });
        };
        reader.readAsDataURL(imageFile);
    });
};

// --- EVENT RSVP MOCK ---
export const rsvpToEvent = async (eventId: string): Promise<{ success: boolean, newRsvpCount?: number }> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const eventIndex = MOCK_EVENTS.findIndex(e => e.id === eventId);
    if (eventIndex !== -1) {
        MOCK_EVENTS[eventIndex].rsvps += 1;
        return { success: true, newRsvpCount: MOCK_EVENTS[eventIndex].rsvps };
    }
    return { success: false };
};

// --- CLUB JOIN MOCK ---
export const joinStudentClub = async (clubId: string, memberData: NewClubMemberData): Promise<{ success: boolean; message: string; }> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const clubIndex = MOCK_CLUB_DETAILS.findIndex(c => c.id === clubId);
    if (clubIndex === -1) {
        return { success: false, message: 'Club not found.' };
    }
    const newMember: ClubMember = {
        id: `member-${crypto.randomUUID().slice(0, 8)}`,
        name: memberData.name,
        // Use student ID for a unique, consistent seed for the avatar
        imageUrl: `https://picsum.photos/seed/${memberData.studentId.replace(/[^a-zA-Z0-9]/g, '')}/40/40`,
    };
    MOCK_CLUB_DETAILS[clubIndex].members.push(newMember);
    return { success: true, message: 'Your request to join has been sent!' };
};

// --- Student Enrollment API Mocks ---
export const enrollInCourse = async (studentId: string, courseId: string): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (!MOCK_ENROLLMENTS[studentId]) {
        MOCK_ENROLLMENTS[studentId] = [];
    }
    if (MOCK_ENROLLMENTS[studentId].includes(courseId)) {
        return { success: false, message: 'You are already enrolled in this course.' };
    }
    MOCK_ENROLLMENTS[studentId].push(courseId);
    return { success: true, message: 'Successfully enrolled in course.' };
};

export const dropCourse = async (studentId: string, courseId: string): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (!MOCK_ENROLLMENTS[studentId] || !MOCK_ENROLLMENTS[studentId].includes(courseId)) {
        return { success: false, message: 'You are not enrolled in this course.' };
    }
    MOCK_ENROLLMENTS[studentId] = MOCK_ENROLLMENTS[studentId].filter(id => id !== courseId);
    return { success: true, message: 'Successfully dropped course.' };
};

export const updateStudentEnrollments = async (studentId: string, courseIds: string[]): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const user = getCurrentStaff();
    if (!user || ![StaffRole.Admin, StaffRole.AcademicOfficer].includes(user.role)) {
        return { success: false, message: 'Unauthorized.' };
    }

    // Optional: for Academic Officers, could add a check here to ensure they only enroll students in their department's courses

    MOCK_ENROLLMENTS[studentId] = courseIds;
    return { success: true, message: 'Student enrollments updated successfully.' };
};


// --- Fee Payment Mock ---
export const postPayment = async (feeIds: string[], amount: number, studentId: string): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let updatedCount = 0;
    MOCK_FEES.forEach((fee, index) => {
        if (feeIds.includes(fee.id)) {
            MOCK_FEES[index].status = FeeStatus.Paid;
            updatedCount++;
        }
    });

    MOCK_PAYMENTS.push({
        id: `pay-${crypto.randomUUID().slice(0, 8)}`,
        studentId: studentId,
        date: new Date().toISOString(),
        amount: amount,
        description: `Payment for ${updatedCount} fee(s)`
    });

    return { success: true, message: 'Payment successful!' };
};

// --- STUDENT MANAGEMENT API MOCKS ---
export const addStudent = async (studentData: Omit<Student, 'id' | 'createdAt'> & { password?: string }): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const user = getCurrentStaff();
    if (!user || ![StaffRole.Admin, StaffRole.AcademicOfficer].includes(user.role)) return { success: false, message: 'Unauthorized' };

    if (!studentData.studentId || !studentData.name || !studentData.email || !studentData.departmentId || !studentData.password) {
        return { success: false, message: 'All fields are required.' };
    }
    if (MOCK_STUDENTS.some(s => s.studentId.toLowerCase() === studentData.studentId.toLowerCase())) {
        return { success: false, message: `Student with ID ${studentData.studentId} already exists.` };
    }
    if (MOCK_STUDENTS.some(s => s.email.toLowerCase() === studentData.email.toLowerCase())) {
        return { success: false, message: `Student with email ${studentData.email} already exists.` };
    }

    const newStudent: (Student & { passwordHash: string }) = {
        id: `student-${crypto.randomUUID().slice(0, 8)}`,
        studentId: studentData.studentId.toUpperCase(),
        name: studentData.name,
        email: studentData.email,
        phone: studentData.phone || '',
        departmentId: studentData.departmentId,
        createdAt: new Date().toISOString(),
        passwordHash: studentData.password,
    };
    MOCK_STUDENTS.unshift(newStudent);
    return { success: true, message: 'Student added successfully.' };
}

export const updateStudent = async (id: string, studentData: Partial<Omit<Student, 'id' | 'createdAt'>>): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const user = getCurrentStaff();
    if (!user || ![StaffRole.Admin, StaffRole.AcademicOfficer].includes(user.role)) return { success: false, message: 'Unauthorized' };

    const studentIndex = MOCK_STUDENTS.findIndex(s => s.id === id);
    if (studentIndex === -1) return { success: false, message: 'Student not found.' };

    if (studentData.studentId && MOCK_STUDENTS.some(s => s.id !== id && s.studentId.toLowerCase() === studentData.studentId!.toLowerCase())) {
        return { success: false, message: `Another student with ID ${studentData.studentId} already exists.` };
    }
    if (studentData.email && MOCK_STUDENTS.some(s => s.id !== id && s.email.toLowerCase() === studentData.email!.toLowerCase())) {
        return { success: false, message: `Another student with email ${studentData.email} already exists.` };
    }

    MOCK_STUDENTS[studentIndex] = { ...MOCK_STUDENTS[studentIndex], ...studentData };
    
    const currentStudent = getCurrentStudent();
    if (currentStudent && currentStudent.id === id) {
        const { passwordHash, ...studentToStore } = MOCK_STUDENTS[studentIndex];
        sessionStorage.setItem('currentStudent', JSON.stringify(studentToStore));
    }
    
    return { success: true, message: 'Student updated successfully.' };
}

export const deleteStudent = async (id: string): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const user = getCurrentStaff();
    if (!user || ![StaffRole.Admin, StaffRole.AcademicOfficer].includes(user.role)) return { success: false, message: 'Unauthorized' };
    
    const initialLength = MOCK_STUDENTS.length;
    MOCK_STUDENTS = MOCK_STUDENTS.filter(s => s.id !== id);
    if (MOCK_STUDENTS.length === initialLength) return { success: false, message: 'Student not found.' };
    
    delete MOCK_ENROLLMENTS[id];

    return { success: true, message: 'Student deleted successfully.' };
}

// --- STAFF MANAGEMENT API MOCKS ---
export const addStaff = async (staffData: Omit<StaffMember, 'id' | 'createdAt'> & { password?: string }): Promise<{ success: boolean; message: string; }> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const user = getCurrentStaff();
    if (user?.role !== StaffRole.Admin) return { success: false, message: 'Unauthorized' };
    if (MOCK_STAFF.some(s => s.email.toLowerCase() === staffData.email.toLowerCase())) {
        return { success: false, message: `Staff with email ${staffData.email} already exists.` };
    }

    const newStaff: (StaffMember & { passwordHash: string }) = {
        id: generateId('staff'),
        ...staffData,
        createdAt: new Date().toISOString(),
        passwordHash: staffData.password || 'DefaultPass1!',
        imageUrl: `https://picsum.photos/seed/${staffData.email}/200/200`,
    };
    delete (newStaff as any).password;
    MOCK_STAFF.unshift(newStaff);
    return { success: true, message: 'Staff member added successfully.' };
};
export const updateStaff = async (id: string, staffData: Partial<Omit<StaffMember, 'id' | 'createdAt'>>): Promise<{ success: boolean; message: string; }> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const user = getCurrentStaff();
    if (user?.role !== StaffRole.Admin) return { success: false, message: 'Unauthorized' };
    const staffIndex = MOCK_STAFF.findIndex(s => s.id === id);
    if (staffIndex === -1) return { success: false, message: 'Staff member not found.' };
     if (staffData.email && MOCK_STAFF.some(s => s.id !== id && s.email.toLowerCase() === staffData.email!.toLowerCase())) {
        return { success: false, message: `Another staff member with email ${staffData.email} already exists.` };
    }
    MOCK_STAFF[staffIndex] = { ...MOCK_STAFF[staffIndex], ...staffData };
    return { success: true, message: 'Staff member updated successfully.' };
};
export const deleteStaff = async (id: string): Promise<{ success: boolean; message: string; }> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const user = getCurrentStaff();
    if (user?.role !== StaffRole.Admin) return { success: false, message: 'Unauthorized' };
    if (id === 'staff-admin') return { success: false, message: 'Cannot delete the main administrator account.' };
    MOCK_STAFF = MOCK_STAFF.filter(s => s.id !== id);
    return { success: true, message: 'Staff member deleted successfully.' };
};

// --- GRADE MANAGEMENT API MOCKS ---
export const addOrUpdateCourseGrade = async (gradeData: CourseGrade): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const user = getCurrentStaff();
    if (!user || ![StaffRole.Admin, StaffRole.AcademicOfficer, StaffRole.Lecturer].includes(user.role)) {
        return { success: false, message: 'Unauthorized.' };
    }
    
    const student = MOCK_STUDENTS.find(s => s.id === gradeData.studentId);
    const course = MOCK_COURSES.find(c => c.id === gradeData.courseId);

    if (!student || !course) {
        return { success: false, message: 'Student or Course not found.' };
    }

    // Authorization checks
    if (user.role === StaffRole.AcademicOfficer && student.departmentId !== user.departmentId) {
        return { success: false, message: 'You can only manage grades for students in your department.' };
    }
    if (user.role === StaffRole.Lecturer && course.lecturerId !== user.id) {
        return { success: false, message: 'You can only manage grades for courses you are assigned to.' };
    }
    
    const gradeIndex = MOCK_COURSE_GRADES.findIndex(g => g.studentId === gradeData.studentId && g.courseId === gradeData.courseId);
    
    if (gradeIndex !== -1) {
        // Update existing grade
        MOCK_COURSE_GRADES[gradeIndex] = { ...MOCK_COURSE_GRADES[gradeIndex], ...gradeData };
    } else {
        // Add new grade
        MOCK_COURSE_GRADES.push(gradeData);
    }

    return { success: true, message: 'Grade saved successfully.' };
};

export const deleteStudentGrade = async (studentId: string, semester: string): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const user = getCurrentStaff();
    if (!user || ![StaffRole.Admin, StaffRole.AcademicOfficer].includes(user.role)) {
        return { success: false, message: 'Unauthorized.' };
    }

    if (user.role === StaffRole.AcademicOfficer) {
        const student = MOCK_STUDENTS.find(s => s.id === studentId);
        if (!student || student.departmentId !== user.departmentId) {
            return { success: false, message: 'You can only manage grades for students in your department.' };
        }
    }

    return { success: false, message: 'This function is deprecated. Please manage grades by course.' };
};