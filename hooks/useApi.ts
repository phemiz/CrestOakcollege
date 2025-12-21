
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
    Department, Course, StaffMember, Student, Announcement, TimetableEntry, 
    Application, Fee, Payment, CourseMaterial, JobOpening, Alumni, Mentor, 
    StudentClub, ClubDetail, LibraryBook, Visitation, CalendarEvent, Testimonial,
    ApplicationFormData, ContactMessage, StaffRole, ApplicationStatus, FeeStatus,
    DynamicApplicationData, NewClubMemberData, JobApplicationData, CourseGrade,
    BookStatus, FeeStructureItem
} from '../types';

// --- MOCK DATA ---

const MOCK_DEPARTMENTS: Department[] = [
    { id: 'd1', name: 'Department of Computer Science', description: 'Focusing on software engineering, data science, and AI.', imageUrl: 'https://picsum.photos/seed/dept1/800/600', programType: 'Degree' },
    { id: 'd2', name: 'Department of Nursing Science', description: 'Training compassionate and skilled nurses.', imageUrl: 'https://picsum.photos/seed/dept2/800/600', programType: 'Degree' },
    { id: 'd3', name: 'Department of Business Administration', description: 'Developing future business leaders and entrepreneurs.', imageUrl: 'https://picsum.photos/seed/dept3/800/600', programType: 'Degree' },
    { id: 'd4', name: 'Department of Medical Laboratory Science', description: 'Advanced diagnostic and laboratory skills.', imageUrl: 'https://picsum.photos/seed/dept4/800/600', programType: 'Degree' },
    { id: 'd5', name: 'Department of Public Health', description: 'Promoting health and preventing disease in communities.', imageUrl: 'https://picsum.photos/seed/dept5/800/600', programType: 'Degree' },
    { id: 'd6', name: 'Department of Computer Engineering', description: 'Hardware and systems engineering.', imageUrl: 'https://picsum.photos/seed/dept6/800/600', programType: 'Diploma' },
    { id: 'd7', name: 'Department of Science Laboratory Technology', description: 'Practical science skills for industry.', imageUrl: 'https://picsum.photos/seed/dept7/800/600', programType: 'Diploma' },
    { id: 'd8', name: 'Department of Accountancy', description: 'Financial reporting and management.', imageUrl: 'https://picsum.photos/seed/dept8/800/600', programType: 'Diploma' },
];

const MOCK_COURSES: Course[] = [
    { id: 'c1', code: 'CSC 101', title: 'Introduction to Computer Science', description: 'Basics of computing and programming.', creditHours: 3, departmentId: 'd1', programType: 'Degree', prerequisites: 'None', learningOutcomes: 'Understand basic algorithms.', recommendedTextbooks: 'Intro to Java Programming' },
    { id: 'c2', code: 'NSC 201', title: 'Human Anatomy', description: 'Study of the human body structure.', creditHours: 4, departmentId: 'd2', programType: 'Degree', lecturerId: 's2', prerequisites: 'BIO 101', learningOutcomes: 'Identify major organs.', recommendedTextbooks: 'Ross & Wilson Anatomy' },
    { id: 'c3', code: 'BUS 101', title: 'Principles of Management', description: 'Fundamentals of organizational management.', creditHours: 3, departmentId: 'd3', programType: 'Degree' },
    { id: 'c4', code: 'MLS 301', title: 'Clinical Chemistry', description: 'Analysis of bodily fluids.', creditHours: 4, departmentId: 'd4', programType: 'Degree' },
    { id: 'c5', code: 'PHS 202', title: 'Epidemiology', description: 'Study of disease patterns.', creditHours: 3, departmentId: 'd5', programType: 'Degree' },
    { id: 'c6', code: 'CPE 101', title: 'Digital Logic Design', description: 'Introduction to digital circuits.', creditHours: 3, departmentId: 'd6', programType: 'Diploma' },
    { id: 'c7', code: 'SLT 102', title: 'General Laboratory Techniques', description: 'Safety and equipment usage.', creditHours: 3, departmentId: 'd7', programType: 'Diploma' },
    { id: 'c8', code: 'ACC 101', title: 'Financial Accounting I', description: 'Introduction to accounting principles.', creditHours: 3, departmentId: 'd8', programType: 'Diploma' },
];

const MOCK_STAFF: StaffMember[] = [
    { id: 's1', role: StaffRole.Admin, name: 'Dr. Adanna Okoro', email: 'provost@crestoak.edu.ng', phone: '+234 801 111 1111', createdAt: new Date().toISOString(), departmentId: 'd1', imageUrl: 'https://picsum.photos/seed/staff1/200/200' },
    { id: 's2', role: StaffRole.Lecturer, name: 'Prof. Chinua Achebe', email: 'c.achebe@crestoak.edu.ng', phone: '+234 802 222 2222', createdAt: new Date().toISOString(), departmentId: 'd2', imageUrl: 'https://picsum.photos/seed/staff2/200/200', bio: 'Expert in Clinical Nursing with 15 years experience.', officeHours: [{day: 'Monday', time: '10:00 AM - 12:00 PM'}] },
    { id: 's3', role: StaffRole.AdmissionsOfficer, name: 'Mr. Emeka Nwadike', email: 'admissions@crestoak.edu.ng', phone: '+234 803 333 3333', createdAt: new Date().toISOString(), imageUrl: 'https://picsum.photos/seed/staff3/200/200' },
];

const MOCK_STUDENTS: Student[] = [
    { id: 'st1', studentId: 'COC/24/001', name: 'Chioma Adebayo', email: 'chioma.a@student.crestoak.edu.ng', departmentId: 'd1', createdAt: new Date().toISOString(), phone: '+234 701 234 5678' },
    { id: 'st2', studentId: 'COC/24/002', name: 'Yusuf Ibrahim', email: 'yusuf.i@student.crestoak.edu.ng', departmentId: 'd2', createdAt: new Date().toISOString(), phone: '+234 702 345 6789' },
    { id: 'st3', studentId: 'COC/24/003', name: 'Grace Okafor', email: 'grace.o@student.crestoak.edu.ng', departmentId: 'd1', createdAt: new Date().toISOString(), phone: '+234 703 456 7890' },
];

// Central enrollment store: { studentId, courseId }
const MOCK_ENROLLMENTS: { studentId: string; courseId: string; }[] = [
    { studentId: 'st1', courseId: 'c1' },
    { studentId: 'st1', courseId: 'c2' },
    { studentId: 'st2', courseId: 'c2' },
];

const MOCK_ANNOUNCEMENTS: Announcement[] = [
    { id: 'a1', title: 'Resumption Date for 2024/2025 Session', content: 'All students are expected to return to campus on October 15th, 2024.', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'a2', title: 'New Library Opening Hours', content: 'The library will now be open until 9 PM on weekdays.', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
];

const MOCK_TIMETABLE: TimetableEntry[] = [
    { id: 't1', courseId: 'c1', dayOfWeek: 'Monday', startTime: '09:00', endTime: '11:00', location: 'Room 101' },
    { id: 't2', courseId: 'c2', dayOfWeek: 'Tuesday', startTime: '12:00', endTime: '14:00', location: 'Lab 2' },
];

const MOCK_APPLICATIONS: Application[] = [
    { id: 'app1', name: 'John Doe', email: 'john@example.com', phone: '08012345678', gender: 'M', departmentId: 'd1', transcriptUrl: '#', status: ApplicationStatus.Pending, createdAt: new Date().toISOString() },
];

const MOCK_FEES: Fee[] = [
    { id: 'f1', studentId: 'st1', description: 'Tuition Fee - 1st Semester', amount: 150000, dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), status: FeeStatus.Due },
    { id: 'f2', studentId: 'st1', description: 'Departmental Dues', amount: 5000, dueDate: new Date().toISOString(), status: FeeStatus.Overdue },
];

const MOCK_PAYMENTS: Payment[] = [
    { id: 'p1', studentId: 'st1', date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), amount: 20000, description: 'Acceptance Fee' },
];

const MOCK_CLUBS: StudentClub[] = [
    { id: 'c1', name: 'Tech Innovators Club', description: 'Building the future with code.', imageUrl: 'https://picsum.photos/seed/club1/800/600', contactEmail: 'techclub@crestoak.edu.ng', category: 'Academic' },
    { id: 'c2', name: 'Red Cross Society', description: 'Humanitarian aid and health awareness.', imageUrl: 'https://picsum.photos/seed/club2/800/600', contactEmail: 'redcross@crestoak.edu.ng', category: 'Social' },
    { id: 'c3', name: 'Christian Fellowship', description: 'Spiritual growth and community.', imageUrl: 'https://picsum.photos/seed/club3/800/600', contactEmail: 'fellowship@crestoak.edu.ng', category: 'Religious' },
    { id: 'c4', name: 'Muslim Students Society', description: 'Unity and faith.', imageUrl: 'https://picsum.photos/seed/club4/800/600', contactEmail: 'mssn@crestoak.edu.ng', category: 'Religious' },
];

const MOCK_CLUB_DETAILS: ClubDetail[] = MOCK_CLUBS.map(club => ({
    ...club,
    announcements: [{ id: 'ca1', title: 'Welcome Meeting', date: new Date().toISOString() }],
    members: [{ id: 'cm1', name: 'Student Member', imageUrl: 'https://picsum.photos/seed/mem1/40/40' }],
    galleryImages: [
        { imageUrl: 'https://picsum.photos/seed/cg1/800/600', caption: 'Club Activity 1' },
        { imageUrl: 'https://picsum.photos/seed/cg2/800/600', caption: 'Club Activity 2' }
    ]
}));

const MOCK_VISITATIONS: Visitation[] = [
    { id: 'v1', title: 'Badagry Heritage Museum', description: 'Educational trip to learn about local history.', category: 'Educational', date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), imageUrl: 'https://picsum.photos/seed/visit1/800/600' },
    { id: 'v2', title: 'Whispering Palms Resort', description: 'Annual recreational excursion.', category: 'Recreational', date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), imageUrl: 'https://picsum.photos/seed/visit2/800/600' },
];

const MOCK_ALUMNI: Alumni[] = [
    { id: 'al1', name: 'Tunde Bakare', graduationYear: 2015, departmentId: 'd1', occupation: 'Senior Software Engineer at Paystack', testimonial: 'CrestOAK gave me the foundation I needed to excel in tech.', imageUrl: 'https://picsum.photos/seed/alumni1/200/200' },
    { id: 'al2', name: 'Ngozi Eze', graduationYear: 2018, departmentId: 'd2', occupation: 'Nurse Practitioner in UK', testimonial: 'The practical training was world-class.', imageUrl: 'https://picsum.photos/seed/alumni2/200/200' },
];

const MOCK_MENTORS: Mentor[] = [
    { ...MOCK_ALUMNI[0], expertise: ['Software Development', 'Career Planning'] },
];

const MOCK_TESTIMONIALS: Testimonial[] = [
    { id: 't1', studentName: 'Ibrahim Musa', program: 'Computer Science', graduationYear: 2022, quote: 'My time at CrestOAK was transformative.', imageUrl: 'https://picsum.photos/seed/student1/100/100' },
    { id: 't2', studentName: 'Sarah Okon', program: 'Nursing', graduationYear: 2023, quote: 'The faculty are incredibly supportive.', imageUrl: 'https://picsum.photos/seed/student2/100/100' },
    { id: 't3', studentName: 'David West', program: 'Business Admin', graduationYear: 2021, quote: 'Prepared me well for the corporate world.', imageUrl: 'https://picsum.photos/seed/student3/100/100' },
];

const MOCK_EVENTS: CalendarEvent[] = [
    { id: 'e1', title: 'Matriculation Ceremony', date: '2024-11-15', description: 'Official welcome for new students.', category: 'Academic', rsvps: 120, attendees: ['John Doe', 'Jane Smith'] },
    { id: 'e2', title: 'Career Fair', date: '2024-12-05', description: 'Meet top employers.', category: 'Campus Life', rsvps: 50, attendees: ['Tunde Bakare', 'Ngozi Eze'] },
    { id: 'e3', title: 'Christmas Break', date: '2024-12-20', description: 'School closed for holidays.', category: 'Holiday', rsvps: 0, attendees: [] },
];

const MOCK_JOB_OPENINGS: JobOpening[] = [
    { id: 'j1', title: 'Senior Lecturer - Computer Science', department: 'Faculty', location: 'Main Campus', type: 'Full-time', description: 'Seeking an experienced lecturer.', responsibilities: ['Teaching', 'Research'], qualifications: ['PhD in CS', '5 years experience'] },
    { id: 'j2', title: 'Administrative Assistant', department: 'Administration', location: 'Main Campus', type: 'Full-time', description: 'Support daily operations.', responsibilities: ['Filing', 'Scheduling'], qualifications: ['BSc in Business Admin', 'Proficient in Office'] },
];

const MOCK_LIBRARY_BOOKS: LibraryBook[] = [
    { id: 'b1', title: 'Introduction to Algorithms', author: 'Cormen et al.', isbn: '9780262033848', description: 'Essential for CS students.', status: BookStatus.Available },
    { id: 'b2', title: 'Anatomy and Physiology', author: 'Ross & Wilson', isbn: '9780702053252', description: 'Core nursing text.', status: BookStatus.CheckedOut, dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
];

const MOCK_COURSE_MATERIALS: CourseMaterial[] = [
    { id: 'm1', courseId: 'c1', title: 'Lecture Notes - Week 1', fileUrl: '#', fileType: 'PDF', uploadedAt: new Date().toISOString() },
];

const MOCK_FEE_STRUCTURE: FeeStructureItem[] = [
    { id: 'fs1', category: 'General', item: "Application Form", amount: "₦15,000", note: "Once" },
    { id: 'fs2', category: 'General', item: "Processing Fee", amount: "₦20,000", note: "Once" },
    { id: 'fs3', category: 'General', item: "Acceptance Fee", amount: "₦50,000", note: "Once" },
    { id: 'fs4', category: 'General', item: "Tuition Fee", amount: "₦250,000", note: "Health Student" },
    { id: 'fs5', category: 'General', item: "Tuition Fee", amount: "₦200,000", note: "Non-Health Student" },
    { id: 'fs6', category: 'Administrative', item: "Old/New Student Form", amount: "₦1,000", note: "Secretary office" },
    { id: 'fs7', category: 'Administrative', item: "Student Profile Update", amount: "₦1,000", note: "Admission office" },
    { id: 'fs8', category: 'Administrative', item: "Exam docket", amount: "₦1,000", note: "Bursar Office" },
    { id: 'fs9', category: 'Administrative', item: "Library Fee", amount: "₦5,000", note: "Bursar office" },
    { id: 'fs10', category: 'Administrative', item: "Library card/Pass", amount: "₦1,000", note: "Librarian office" },
    { id: 'fs11', category: 'Administrative', item: "Developmental fee", amount: "₦1,000", note: "Director of Corporate Affair" },
    { id: 'fs12', category: 'Administrative', item: "Examination Fee", amount: "₦10,000", note: "Exam and Record office" },
    { id: 'fs13', category: 'Administrative', item: "Clinic Fee", amount: "₦10,000", note: "Director of Health office" },
    { id: 'fs14', category: 'Administrative', item: "Internal Practical", amount: "₦5,000", note: "Bursar" },
    { id: 'fs15', category: 'Administrative', item: "Departmental Fee", amount: "₦2,000", note: "Deans' office" },
    { id: 'fs16', category: 'Administrative', item: "Welfare", amount: "₦3,000", note: "Bursar office" },
];

let MOCK_DYNAMIC_APPLICATIONS: DynamicApplicationData[] = [];

// --- HELPERS ---

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- API HOOK ---

export const useApi = <T>(endpoint: string, id?: string) => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            await delay(800); // Simulate network delay

            if (!isMounted.current) return;

            let result: any = null;

            // Simple routing mock based on endpoint
            switch (true) {
                case endpoint === '/api/departments':
                    result = MOCK_DEPARTMENTS;
                    break;
                case endpoint === '/api/courses':
                    result = MOCK_COURSES;
                    break;
                case endpoint === '/api/staff':
                    result = MOCK_STAFF;
                    break;
                case endpoint === '/api/announcements':
                    result = MOCK_ANNOUNCEMENTS;
                    break;
                case endpoint === '/api/timetable':
                    result = MOCK_TIMETABLE;
                    break;
                case endpoint === '/api/applications':
                    result = MOCK_APPLICATIONS;
                    break;
                case endpoint === '/api/fees':
                    result = MOCK_FEES;
                    break;
                case endpoint === '/api/payments':
                    result = MOCK_PAYMENTS;
                    break;
                case endpoint === '/api/clubs':
                    result = MOCK_CLUBS;
                    break;
                case endpoint === '/api/club-details':
                    result = MOCK_CLUB_DETAILS;
                    break;
                case endpoint === '/api/visitations':
                    result = MOCK_VISITATIONS;
                    break;
                case endpoint === '/api/alumni':
                    result = MOCK_ALUMNI;
                    break;
                case endpoint === '/api/mentors':
                    result = MOCK_MENTORS;
                    break;
                case endpoint === '/api/testimonials':
                    result = MOCK_TESTIMONIALS;
                    break;
                case endpoint === '/api/events':
                    result = MOCK_EVENTS;
                    break;
                case endpoint === '/api/careers':
                    result = MOCK_JOB_OPENINGS;
                    break;
                case endpoint === '/api/library-books':
                    result = MOCK_LIBRARY_BOOKS;
                    break;
                case endpoint === '/api/course-materials':
                    result = MOCK_COURSE_MATERIALS;
                    break;
                case endpoint === '/api/fee-structure':
                    result = MOCK_FEE_STRUCTURE;
                    break;
                 case endpoint === '/api/student-enrollments':
                    // If ID is provided, return courses for that student
                    if (id) {
                        const enrolledCourseIds = MOCK_ENROLLMENTS.filter(e => e.studentId === id).map(e => e.courseId);
                        result = enrolledCourseIds;
                    } else {
                        // If no ID, return all students (Admin List)
                        result = MOCK_STUDENTS;
                    }
                    break;
                case endpoint === '/api/course-enrollments':
                    if (id) {
                        const enrolledStudentIds = MOCK_ENROLLMENTS.filter(e => e.courseId === id).map(e => e.studentId);
                        result = MOCK_STUDENTS.filter(s => enrolledStudentIds.includes(s.id));
                    } else {
                        result = [];
                    }
                    break;
                default:
                    throw new Error(`Endpoint ${endpoint} not found`);
            }

            if (isMounted.current) {
                setData(result as T);
            }
        } catch (err: any) {
            if (isMounted.current) {
                setError(err.message || 'An error occurred');
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    }, [endpoint, id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
};

// --- AUTHENTICATION ---

export const staffLogin = async (email: string, password: string): Promise<{ success: boolean; user?: StaffMember; message?: string }> => {
    await delay(1000);
    // Mock logic: Accept any staff email with 'pass'
    const staff = MOCK_STAFF.find(s => s.email === email);
    if (staff && password === 'AdminPass1!') { // Simple hardcoded password for demo
        localStorage.setItem('crestoak_staff_user', JSON.stringify(staff));
        return { success: true, user: staff };
    }
    return { success: false, message: 'Incorrect email or password.' };
};

export const staffLogout = () => {
    localStorage.removeItem('crestoak_staff_user');
};

export const getCurrentStaff = (): StaffMember | null => {
    const stored = localStorage.getItem('crestoak_staff_user');
    return stored ? JSON.parse(stored) : null;
};

export const studentLogin = async (studentId: string, password: string): Promise<{ success: boolean; student?: Student; message?: string }> => {
    await delay(1000);
    const student = MOCK_STUDENTS.find(s => s.studentId === studentId);
    if (student && password === 'StudentPass1!') {
        localStorage.setItem('crestoak_student_user', JSON.stringify(student));
        return { success: true, student };
    }
    return { success: false, message: 'Incorrect Student ID or password.' };
};

export const getCurrentStudent = (): Student | null => {
    const stored = localStorage.getItem('crestoak_student_user');
    return stored ? JSON.parse(stored) : null;
};

// --- ACTIONS (MOCK MUTATIONS) ---

export const postApplication = async (data: ApplicationFormData): Promise<{ success: boolean; message: string; applicationId?: string }> => {
    await delay(1500);
    const newId = `app_${Date.now()}`;
    MOCK_APPLICATIONS.push({
        id: newId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        gender: data.gender as 'M' | 'F',
        departmentId: data.departmentId,
        transcriptUrl: '#',
        status: ApplicationStatus.Pending,
        createdAt: new Date().toISOString()
    });
    return { success: true, message: 'Application submitted successfully!', applicationId: newId };
};

export const fetchApplicationStatus = async (identifier: string): Promise<{ success: boolean; application?: Application; message?: string }> => {
    await delay(1000);
    const app = MOCK_APPLICATIONS.find(a => a.id === identifier || a.email === identifier);
    if (app) return { success: true, application: app };
    return { success: false, message: 'Application not found.' };
};

export const postContactForm = async (data: ContactMessage): Promise<{ success: boolean; message: string }> => {
    await delay(1000);
    return { success: true, message: 'Message sent successfully. We will get back to you shortly.' };
};

export const postDynamicApplication = async (data: DynamicApplicationData): Promise<{ success: boolean; message: string }> => {
    await delay(1500);
    MOCK_DYNAMIC_APPLICATIONS.push(data);
    return { success: true, message: 'Application submitted successfully!' };
};

export const fetchAdminAdmissions = async (): Promise<{ success: boolean; applications: Application[] }> => {
    await delay(1000);
    return { success: true, applications: MOCK_APPLICATIONS };
};

export const updateApplicationStatus = async (id: string, status: ApplicationStatus): Promise<{ success: boolean; message: string }> => {
    await delay(500);
    const app = MOCK_APPLICATIONS.find(a => a.id === id);
    if (app) {
        app.status = status;
        return { success: true, message: 'Status updated.' };
    }
    return { success: false, message: 'Application not found.' };
};

// --- CRUD HELPERS ---
export const addCourse = async (course: Partial<Course>): Promise<{ success: boolean; message: string }> => {
    await delay(500);
    MOCK_COURSES.push({ ...course, id: `c${Date.now()}` } as Course);
    return { success: true, message: 'Course added.' };
};
export const updateCourse = async (id: string, data: Partial<Course>): Promise<{ success: boolean; message: string }> => {
    await delay(500);
    const idx = MOCK_COURSES.findIndex(c => c.id === id);
    if (idx !== -1) { MOCK_COURSES[idx] = { ...MOCK_COURSES[idx], ...data }; return { success: true, message: 'Course updated.' }; }
    return { success: false, message: 'Course not found.' };
};
export const deleteCourse = async (id: string): Promise<{ success: boolean; message: string }> => {
    await delay(500);
    const idx = MOCK_COURSES.findIndex(c => c.id === id);
    if (idx !== -1) { MOCK_COURSES.splice(idx, 1); return { success: true, message: 'Course deleted.' }; }
    return { success: false, message: 'Course not found.' };
};

export const updateDepartmentImage = async (departmentId: string, file: File): Promise<{ success: boolean; message: string }> => {
    await delay(1500);
    // In a real app, upload file and get URL.
    return { success: true, message: 'Image updated successfully.' };
};

export const addStudent = async (data: Partial<Student>): Promise<{ success: boolean; message: string }> => { await delay(500); MOCK_STUDENTS.push({ ...data, id: `st${Date.now()}`, createdAt: new Date().toISOString() } as Student); return { success: true, message: 'Student added.' }; };
export const updateStudent = async (id: string, data: Partial<Student>): Promise<{ success: boolean; message: string }> => { await delay(500); const idx = MOCK_STUDENTS.findIndex(s => s.id === id); if(idx !== -1) { MOCK_STUDENTS[idx] = {...MOCK_STUDENTS[idx], ...data}; return { success: true, message: 'Student updated.' }; } return { success: false, message: 'Not found' }; };
export const deleteStudent = async (id: string): Promise<{ success: boolean; message: string }> => { await delay(500); const idx = MOCK_STUDENTS.findIndex(s => s.id === id); if(idx !== -1) { MOCK_STUDENTS.splice(idx, 1); return { success: true, message: 'Student deleted.' }; } return { success: false, message: 'Not found' }; };

export const addStaff = async (data: Partial<StaffMember>): Promise<{ success: boolean; message: string }> => { await delay(500); MOCK_STAFF.push({ ...data, id: `s${Date.now()}`, createdAt: new Date().toISOString() } as StaffMember); return { success: true, message: 'Staff added.' }; };
export const updateStaff = async (id: string, data: Partial<StaffMember>): Promise<{ success: boolean; message: string }> => { await delay(500); const idx = MOCK_STAFF.findIndex(s => s.id === id); if(idx !== -1) { MOCK_STAFF[idx] = {...MOCK_STAFF[idx], ...data}; return { success: true, message: 'Staff updated.' }; } return { success: false, message: 'Not found' }; };
export const deleteStaff = async (id: string): Promise<{ success: boolean; message: string }> => { await delay(500); const idx = MOCK_STAFF.findIndex(s => s.id === id); if(idx !== -1) { MOCK_STAFF.splice(idx, 1); return { success: true, message: 'Staff deleted.' }; } return { success: false, message: 'Not found' }; };

export const addAnnouncement = async (data: Partial<Announcement>): Promise<{ success: boolean; message: string }> => { await delay(500); MOCK_ANNOUNCEMENTS.unshift({ ...data, id: `a${Date.now()}`, createdAt: new Date().toISOString() } as Announcement); return { success: true, message: 'Announcement added.' }; };
export const updateAnnouncement = async (id: string, data: Partial<Announcement>): Promise<{ success: boolean; message: string }> => { await delay(500); const idx = MOCK_ANNOUNCEMENTS.findIndex(a => a.id === id); if(idx !== -1) { MOCK_ANNOUNCEMENTS[idx] = {...MOCK_ANNOUNCEMENTS[idx], ...data}; return { success: true, message: 'Announcement updated.' }; } return { success: false, message: 'Not found' }; };
export const deleteAnnouncement = async (id: string): Promise<{ success: boolean; message: string }> => { await delay(500); const idx = MOCK_ANNOUNCEMENTS.findIndex(a => a.id === id); if(idx !== -1) { MOCK_ANNOUNCEMENTS.splice(idx, 1); return { success: true, message: 'Announcement deleted.' }; } return { success: false, message: 'Not found' }; };

export const addTimetableEntry = async (data: Partial<TimetableEntry>): Promise<{ success: boolean; message: string }> => { await delay(500); MOCK_TIMETABLE.push({ ...data, id: `t${Date.now()}` } as TimetableEntry); return { success: true, message: 'Entry added.' }; };
export const updateTimetableEntry = async (id: string, data: Partial<TimetableEntry>): Promise<{ success: boolean; message: string }> => { await delay(500); const idx = MOCK_TIMETABLE.findIndex(t => t.id === id); if(idx !== -1) { MOCK_TIMETABLE[idx] = {...MOCK_TIMETABLE[idx], ...data}; return { success: true, message: 'Entry updated.' }; } return { success: false, message: 'Not found' }; };
export const deleteTimetableEntry = async (id: string): Promise<{ success: boolean; message: string }> => { await delay(500); const idx = MOCK_TIMETABLE.findIndex(t => t.id === id); if(idx !== -1) { MOCK_TIMETABLE.splice(idx, 1); return { success: true, message: 'Entry deleted.' }; } return { success: false, message: 'Not found' }; };

export const deleteCourseMaterial = async (id: string): Promise<{ success: boolean; message: string }> => { await delay(500); const idx = MOCK_COURSE_MATERIALS.findIndex(m => m.id === id); if(idx !== -1) { MOCK_COURSE_MATERIALS.splice(idx, 1); return { success: true, message: 'Material deleted.' }; } return { success: false, message: 'Not found' }; };

// Simplified Enrollment Update for Student Dashboard (Mocking simple update)
export const updateStudentEnrollments = async (studentId: string, courseIds: string[]): Promise<{ success: boolean; message: string }> => {
    await delay(800);
    // Remove existing enrollments for this student
    const filteredEnrollments = MOCK_ENROLLMENTS.filter(e => e.studentId !== studentId);
    // Add new enrollments
    courseIds.forEach(cId => filteredEnrollments.push({ studentId, courseId: cId }));
    
    // In a real app we'd replace the MOCK_ENROLLMENTS contents properly, but for this immutable-style mock
    // we have to mutate the array in place or use a state manager.
    MOCK_ENROLLMENTS.length = 0;
    MOCK_ENROLLMENTS.push(...filteredEnrollments);

    return { success: true, message: 'Enrollments updated successfully.' };
};

// Admin Action: Add single student to course
export const addStudentToCourse = async (courseId: string, studentId: string): Promise<{ success: boolean; message: string }> => {
    await delay(500);
    if (MOCK_ENROLLMENTS.some(e => e.courseId === courseId && e.studentId === studentId)) {
        return { success: false, message: 'Student is already enrolled.' };
    }
    MOCK_ENROLLMENTS.push({ studentId, courseId });
    return { success: true, message: 'Student enrolled.' };
};

// Admin Action: Remove student from course
export const removeStudentFromCourse = async (courseId: string, studentId: string): Promise<{ success: boolean; message: string }> => {
    await delay(500);
    const idx = MOCK_ENROLLMENTS.findIndex(e => e.courseId === courseId && e.studentId === studentId);
    if (idx !== -1) {
        MOCK_ENROLLMENTS.splice(idx, 1);
        return { success: true, message: 'Student removed.' };
    }
    return { success: false, message: 'Enrollment not found.' };
};

export const addOrUpdateCourseGrade = async (data: CourseGrade): Promise<{ success: boolean; message: string }> => {
    await delay(500);
    return { success: true, message: 'Grade saved.' };
};

export const joinStudentClub = async (clubId: string, data: NewClubMemberData): Promise<{ success: boolean; message: string }> => {
    await delay(1000);
    const club = MOCK_CLUB_DETAILS.find(c => c.id === clubId);
    if (club) {
        club.members.push({ id: `cm${Date.now()}`, name: data.name, imageUrl: `https://picsum.photos/seed/${data.name}/40/40` });
        return { success: true, message: 'Welcome to the club!' };
    }
    return { success: false, message: 'Club not found.' };
};

export const enrollInCourse = async (studentId: string, courseId: string): Promise<{ success: boolean; message: string }> => {
    await delay(500);
    if (MOCK_ENROLLMENTS.some(e => e.studentId === studentId && e.courseId === courseId)) {
        return { success: false, message: 'You are already enrolled in this course.' };
    }
    MOCK_ENROLLMENTS.push({ studentId, courseId });
    return { success: true, message: 'Successfully enrolled in course.' };
};

export const dropCourse = async (studentId: string, courseId: string): Promise<{ success: boolean; message: string }> => {
    await delay(500);
    const idx = MOCK_ENROLLMENTS.findIndex(e => e.studentId === studentId && e.courseId === courseId);
    if (idx !== -1) {
        MOCK_ENROLLMENTS.splice(idx, 1);
        return { success: true, message: 'Successfully dropped course.' };
    }
    return { success: false, message: 'You are not enrolled in this course.' };
};

export const uploadCourseMaterial = async (courseId: string, title: string, file: File): Promise<{ success: boolean; message: string }> => {
    await delay(1500);
    MOCK_COURSE_MATERIALS.push({
        id: `m${Date.now()}`,
        courseId,
        title,
        fileUrl: '#',
        fileType: file.name.endsWith('pdf') ? 'PDF' : 'DOCX',
        uploadedAt: new Date().toISOString()
    });
    return { success: true, message: 'Material uploaded successfully.' };
};

export const postPayment = async (feeIds: string[], amount: number, studentId: string): Promise<{ success: boolean; message: string }> => {
    await delay(2000);
    feeIds.forEach(id => {
        const fee = MOCK_FEES.find(f => f.id === id);
        if (fee) fee.status = FeeStatus.Paid;
    });
    MOCK_PAYMENTS.unshift({
        id: `p${Date.now()}`,
        studentId,
        amount,
        date: new Date().toISOString(),
        description: `Payment for ${feeIds.length} items`
    });
    return { success: true, message: 'Payment successful.' };
};

export const rsvpToEvent = async (eventId: string, userName?: string): Promise<{ success: boolean; newRsvpCount?: number; message?: string }> => {
    await delay(500);
    const event = MOCK_EVENTS.find(e => e.id === eventId);
    if (event) {
        event.rsvps += 1;
        if (!event.attendees) event.attendees = [];
        event.attendees.push(userName || 'Guest');
        return { success: true, newRsvpCount: event.rsvps };
    }
    return { success: false, message: 'Event not found' };
};

export const postJobApplication = async (data: Omit<JobApplicationData, 'jobTitle'>): Promise<{ success: boolean; message: string }> => {
    await delay(1500);
    return { success: true, message: 'Application submitted successfully.' };
};

export const addFeeStructureItem = async (item: Partial<FeeStructureItem>): Promise<{ success: boolean; message: string }> => {
    await delay(500);
    MOCK_FEE_STRUCTURE.push({ ...item, id: `fs${Date.now()}` } as FeeStructureItem);
    return { success: true, message: 'Fee item added.' };
};

export const updateFeeStructureItem = async (id: string, data: Partial<FeeStructureItem>): Promise<{ success: boolean; message: string }> => {
    await delay(500);
    const idx = MOCK_FEE_STRUCTURE.findIndex(i => i.id === id);
    if (idx !== -1) { MOCK_FEE_STRUCTURE[idx] = { ...MOCK_FEE_STRUCTURE[idx], ...data }; return { success: true, message: 'Fee item updated.' }; }
    return { success: false, message: 'Item not found.' };
};

export const deleteFeeStructureItem = async (id: string): Promise<{ success: boolean; message: string }> => {
    await delay(500);
    const idx = MOCK_FEE_STRUCTURE.findIndex(i => i.id === id);
    if (idx !== -1) { MOCK_FEE_STRUCTURE.splice(idx, 1); return { success: true, message: 'Fee item deleted.' }; }
    return { success: false, message: 'Item not found.' };
};
