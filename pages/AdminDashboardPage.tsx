
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import PageWrapper from '../components/PageWrapper';
import {
  useApi, getCurrentStaff, staffLogout, 
  addStudent, updateStudent, deleteStudent,
  addStaff, updateStaff, deleteStaff,
  addCourse, updateCourse, deleteCourse,
  addFeeStructureItem, updateFeeStructureItem, deleteFeeStructureItem,
  addStudentToCourse, removeStudentFromCourse
} from '../hooks/useApi';
import { Department, Application, Course, StaffMember, StaffRole, Student, FeeStructureItem } from '../types';
import { useTheme } from '../hooks/useTheme';
import { TableSkeleton } from '../components/SkeletonLoader';
import Modal from '../components/Modal';

const AdminDashboardPage: React.FC = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [staffUser, setStaffUser] = useState<StaffMember | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'students' | 'staff' | 'courses' | 'fees'>('overview');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'student' | 'staff' | 'course' | 'fee' | null>(null);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formLoading, setFormLoading] = useState(false);

    // Course Management States
    const [managingCoursesStaff, setManagingCoursesStaff] = useState<StaffMember | null>(null);
    const [selectedCoursesToAssign, setSelectedCoursesToAssign] = useState<string[]>([]);
    
    // Course Enrollment Management State
    const [managingEnrollmentsCourse, setManagingEnrollmentsCourse] = useState<Course | null>(null);
    const [studentToEnroll, setStudentToEnroll] = useState('');

    useEffect(() => {
        const current = getCurrentStaff();
        if (!current) {
            navigate('/portal'); 
        } else {
            setStaffUser(current);
        }
    }, [navigate]);

    // Data Fetching
    const { data: applications, loading: appsLoading } = useApi<Application[]>('/api/applications'); 
    const { data: students, loading: studentsLoading, refetch: refetchStudents } = useApi<Student[]>('/api/student-enrollments');
    const { data: staffList, loading: staffLoading, refetch: refetchStaff } = useApi<StaffMember[]>('/api/staff');
    const { data: courses, loading: coursesLoading, refetch: refetchCourses } = useApi<Course[]>('/api/courses');
    const { data: departments } = useApi<Department[]>('/api/departments');
    const { data: feeStructure, loading: feesLoading, refetch: refetchFees } = useApi<FeeStructureItem[]>('/api/fee-structure');
    
    // Fetch enrolled students when managing a specific course
    const { data: enrolledStudents, refetch: refetchEnrolled } = useApi<Student[]>(
        '/api/course-enrollments', 
        managingEnrollmentsCourse?.id
    );

    const departmentMap = useMemo(() => {
        if (!departments) return {};
        return departments.reduce((acc, dept) => ({...acc, [dept.id]: dept.name}), {} as Record<string, string>);
    }, [departments]);

    const handleLogout = () => {
        staffLogout();
        navigate('/');
    };

    // --- CRUD Handlers ---

    const openAddModal = (type: 'student' | 'staff' | 'course' | 'fee') => {
        setModalType(type);
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const openEditModal = (type: 'student' | 'staff' | 'course' | 'fee', item: any) => {
        setModalType(type);
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (type: 'student' | 'staff' | 'course' | 'fee', id: string) => {
        if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) return;
        
        let result;
        switch(type) {
            case 'student': result = await deleteStudent(id); if(result.success) refetchStudents(); break;
            case 'staff': result = await deleteStaff(id); if(result.success) refetchStaff(); break;
            case 'course': result = await deleteCourse(id); if(result.success) refetchCourses(); break;
            case 'fee': result = await deleteFeeStructureItem(id); if(result.success) refetchFees(); break;
        }
        if (result && !result.success) alert(result.message);
    };

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormLoading(true);
        const formData = new FormData(e.currentTarget);
        const data: any = Object.fromEntries(formData.entries());

        let result;
        if (modalType === 'student') {
            if (editingItem) result = await updateStudent(editingItem.id, data);
            else result = await addStudent(data);
            if (result.success) refetchStudents();
        } else if (modalType === 'staff') {
            if (editingItem) result = await updateStaff(editingItem.id, data);
            else result = await addStaff(data);
            if (result.success) refetchStaff();
        } else if (modalType === 'course') {
            data.creditHours = parseInt(data.creditHours, 10);
            if (editingItem) result = await updateCourse(editingItem.id, data);
            else result = await addCourse(data);
            if (result.success) refetchCourses();
        } else if (modalType === 'fee') {
            if (editingItem) result = await updateFeeStructureItem(editingItem.id, data);
            else result = await addFeeStructureItem(data);
            if (result.success) refetchFees();
        }

        setFormLoading(false);
        if (result?.success) {
            setIsModalOpen(false);
        } else {
            alert(result?.message || 'An error occurred');
        }
    };

    // --- Lecturer Course Management Handlers ---
    
    const handleManageCourses = (staff: StaffMember) => {
        setManagingCoursesStaff(staff);
        setSelectedCoursesToAssign([]);
    };

    const handleToggleCourseSelection = (courseId: string) => {
        setSelectedCoursesToAssign(prev => 
            prev.includes(courseId) 
                ? prev.filter(id => id !== courseId) 
                : [...prev, courseId]
        );
    };

    const handleAssignCourses = async () => {
        if (selectedCoursesToAssign.length === 0 || !managingCoursesStaff) return;
        setFormLoading(true);
        
        try {
            await Promise.all(selectedCoursesToAssign.map(courseId => 
                updateCourse(courseId, { lecturerId: managingCoursesStaff.id })
            ));
            
            setSelectedCoursesToAssign([]);
            refetchCourses();
        } catch (error) {
            console.error("Failed to assign courses", error);
            alert("Some courses could not be assigned.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleUnassignCourse = async (courseId: string) => {
        if (!confirm('Are you sure you want to remove this course from the lecturer?')) return;
        const result = await updateCourse(courseId, { lecturerId: undefined }); // Setting to undefined removes assignment
        if (result.success) {
            refetchCourses();
        } else {
            alert(result.message);
        }
    };
    
    // --- Course Enrollment Management Handlers ---
    const handleManageEnrollments = (course: Course) => {
        setManagingEnrollmentsCourse(course);
        setStudentToEnroll('');
    }

    const handleAddStudentToCourse = async () => {
        if (!managingEnrollmentsCourse || !studentToEnroll) return;
        setFormLoading(true);
        const result = await addStudentToCourse(managingEnrollmentsCourse.id, studentToEnroll);
        setFormLoading(false);
        if (result.success) {
            setStudentToEnroll('');
            refetchEnrolled();
        } else {
            alert(result.message);
        }
    };

    const handleRemoveStudentFromCourse = async (studentId: string) => {
        if (!managingEnrollmentsCourse) return;
        if (!confirm('Are you sure you want to remove this student from the course?')) return;
        const result = await removeStudentFromCourse(managingEnrollmentsCourse.id, studentId);
        if (result.success) {
            refetchEnrolled();
        } else {
            alert(result.message);
        }
    };

    // Charts Data
    const appStatusData = useMemo(() => {
        if (!applications) return [];
        const counts: Record<string, number> = { 'Pending': 0, 'Approved': 0, 'Rejected': 0 };
        applications.forEach(app => {
            const status = app.status || 'Pending';
            counts[status] = (counts[status] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [applications]);

    const COLORS = ['#FBBF24', '#10B981', '#EF4444'];

    if (!staffUser) return <div className="p-12 text-center text-gray-500">Loading Dashboard...</div>;

    const tabButtonClass = (tab: string) => `px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap ${activeTab === tab ? `${theme.button.primary.background} ${theme.button.primary.text}` : `${theme.textMuted} hover:bg-gray-100 dark:hover:bg-white/5`}`;
    const inputClass = `w-full px-3 py-2 border rounded-md ${theme.input.background} ${theme.input.border} ${theme.input.text} focus:outline-none focus:ring-2 focus:ring-blue-500`;
    const textAreaClass = `w-full px-3 py-2 border rounded-md ${theme.input.background} ${theme.input.border} ${theme.input.text} focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]`;
    const labelClass = `block text-sm font-medium ${theme.textMuted} mb-1`;

    // Filter available courses for the modal
    const availableCourses = courses
        ?.filter(c => c.lecturerId !== managingCoursesStaff?.id)
        .sort((a, b) => {
            // Sort by department match first
            const aMatch = managingCoursesStaff && a.departmentId === managingCoursesStaff.departmentId;
            const bMatch = managingCoursesStaff && b.departmentId === managingCoursesStaff.departmentId;
            if (aMatch && !bMatch) return -1;
            if (!aMatch && bMatch) return 1;
            return a.code.localeCompare(b.code);
        }) || [];
    
    // Filter available students for enrollment (not already in list)
    const availableStudentsForEnrollment = students?.filter(s => 
        !enrolledStudents?.some(es => es.id === s.id)
    ) || [];

    return (
        <PageWrapper title="Admin Dashboard" subtitle={`Welcome back, ${staffUser.name}`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="flex space-x-2 overflow-x-auto pb-2 w-full md:w-auto">
                    <button onClick={() => setActiveTab('overview')} className={tabButtonClass('overview')}>Overview</button>
                    <button onClick={() => setActiveTab('applications')} className={tabButtonClass('applications')}>Applications</button>
                    <button onClick={() => setActiveTab('students')} className={tabButtonClass('students')}>Students</button>
                    <button onClick={() => setActiveTab('staff')} className={tabButtonClass('staff')}>Staff</button>
                    <button onClick={() => setActiveTab('courses')} className={tabButtonClass('courses')}>Courses</button>
                    <button onClick={() => setActiveTab('fees')} className={tabButtonClass('fees')}>Fees</button>
                </div>
                <button onClick={handleLogout} className="text-red-500 hover:text-red-700 font-medium text-sm px-4 self-end md:self-auto">Logout</button>
            </div>

            <div className="min-h-[500px]">
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className={`${theme.card.background} p-6 rounded-xl shadow-sm border ${theme.card.border}`}>
                                <h3 className={`text-sm font-medium ${theme.textMuted}`}>Total Applications</h3>
                                <p className={`text-3xl font-bold ${theme.text} mt-2`}>{applications?.length || 0}</p>
                            </div>
                            <div className={`${theme.card.background} p-6 rounded-xl shadow-sm border ${theme.card.border}`}>
                                <h3 className={`text-sm font-medium ${theme.textMuted}`}>Total Students</h3>
                                <p className={`text-3xl font-bold ${theme.text} mt-2`}>{students?.length || 0}</p> 
                            </div>
                             <div className={`${theme.card.background} p-6 rounded-xl shadow-sm border ${theme.card.border}`}>
                                <h3 className={`text-sm font-medium ${theme.textMuted}`}>Active Staff</h3>
                                <p className={`text-3xl font-bold ${theme.text} mt-2`}>{staffList?.length || 0}</p>
                            </div>
                        </div>

                        {applications && applications.length > 0 && (
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className={`${theme.card.background} p-6 rounded-xl shadow-sm border ${theme.card.border} h-96`}>
                                    <h3 className={`text-lg font-bold ${theme.text} mb-4`}>Application Status</h3>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={appStatusData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {appStatusData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div className={`${theme.card.background} p-6 rounded-xl shadow-sm border ${theme.card.border} h-96`}>
                                     <h3 className={`text-lg font-bold ${theme.text} mb-4`}>Enrollment Trends</h3>
                                     <div className="h-[300px] w-full">
                                         <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={[
                                                {name: '2020', students: 800},
                                                {name: '2021', students: 950},
                                                {name: '2022', students: 1100},
                                                {name: '2023', students: students?.length || 1245},
                                            ]}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="students" fill="#3B82F6" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                     </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'applications' && (
                    <div className={`${theme.card.background} rounded-lg shadow border ${theme.card.border} overflow-hidden`}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className={theme.name === 'light' ? 'bg-gray-100' : 'bg-white/5'}>
                                    <tr>
                                        <th className="p-4 font-semibold text-sm">Name</th>
                                        <th className="p-4 font-semibold text-sm">Department</th>
                                        <th className="p-4 font-semibold text-sm">Status</th>
                                        <th className="p-4 font-semibold text-sm">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appsLoading ? (
                                        <tr><td colSpan={4}><TableSkeleton /></td></tr>
                                    ) : applications?.map(app => (
                                        <tr key={app.id} className={`border-t ${theme.input.border}`}>
                                            <td className={`p-4 ${theme.text}`}>{app.name}</td>
                                            <td className={`p-4 ${theme.textMuted}`}>{departmentMap[app.departmentId]}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${app.status === 'Approved' ? 'bg-green-100 text-green-800' : app.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className={`p-4 ${theme.textMuted}`}>{new Date(app.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'students' && (
                    <div>
                        <button onClick={() => openAddModal('student')} className={`mb-4 px-4 py-2 rounded-md ${theme.button.primary.background} ${theme.button.primary.text} font-medium`}>Add Student</button>
                        <div className={`${theme.card.background} rounded-lg shadow border ${theme.card.border} overflow-hidden`}>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className={theme.name === 'light' ? 'bg-gray-100' : 'bg-white/5'}>
                                        <tr>
                                            <th className="p-4 font-semibold text-sm">Name</th>
                                            <th className="p-4 font-semibold text-sm">Matric Number</th>
                                            <th className="p-4 font-semibold text-sm">Department</th>
                                            <th className="p-4 font-semibold text-sm">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentsLoading ? (
                                            <tr><td colSpan={4}><TableSkeleton /></td></tr>
                                        ) : students?.map(student => (
                                            <tr key={student.id} className={`border-t ${theme.input.border}`}>
                                                <td className={`p-4 ${theme.text}`}>{student.name}</td>
                                                <td className={`p-4 ${theme.textMuted}`}>{student.studentId}</td>
                                                <td className={`p-4 ${theme.textMuted}`}>{departmentMap[student.departmentId]}</td>
                                                <td className="p-4 flex gap-2">
                                                    <button onClick={() => openEditModal('student', student)} className="text-blue-500 hover:text-blue-700 text-sm font-medium">Edit</button>
                                                    <button onClick={() => handleDelete('student', student.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'staff' && (
                    <div>
                        <button onClick={() => openAddModal('staff')} className={`mb-4 px-4 py-2 rounded-md ${theme.button.primary.background} ${theme.button.primary.text} font-medium`}>Add Staff</button>
                        <div className={`${theme.card.background} rounded-lg shadow border ${theme.card.border} overflow-hidden`}>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className={theme.name === 'light' ? 'bg-gray-100' : 'bg-white/5'}>
                                        <tr>
                                            <th className="p-4 font-semibold text-sm">Name</th>
                                            <th className="p-4 font-semibold text-sm">Role</th>
                                            <th className="p-4 font-semibold text-sm">Email</th>
                                            <th className="p-4 font-semibold text-sm">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {staffLoading ? (
                                            <tr><td colSpan={4}><TableSkeleton /></td></tr>
                                        ) : staffList?.map(staff => (
                                            <tr key={staff.id} className={`border-t ${theme.input.border}`}>
                                                <td className={`p-4 ${theme.text}`}>{staff.name}</td>
                                                <td className={`p-4 ${theme.textMuted}`}>{staff.role}</td>
                                                <td className={`p-4 ${theme.textMuted}`}>{staff.email}</td>
                                                <td className="p-4 flex gap-2">
                                                    {staff.role === StaffRole.Lecturer && (
                                                        <button onClick={() => handleManageCourses(staff)} className="text-green-600 hover:text-green-800 text-sm font-medium">Courses</button>
                                                    )}
                                                    <button onClick={() => openEditModal('staff', staff)} className="text-blue-500 hover:text-blue-700 text-sm font-medium">Edit</button>
                                                    <button onClick={() => handleDelete('staff', staff.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'courses' && (
                    <div>
                        <button onClick={() => openAddModal('course')} className={`mb-4 px-4 py-2 rounded-md ${theme.button.primary.background} ${theme.button.primary.text} font-medium`}>Add Course</button>
                        <div className={`${theme.card.background} rounded-lg shadow border ${theme.card.border} overflow-hidden`}>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className={theme.name === 'light' ? 'bg-gray-100' : 'bg-white/5'}>
                                        <tr>
                                            <th className="p-4 font-semibold text-sm">Code</th>
                                            <th className="p-4 font-semibold text-sm">Title</th>
                                            <th className="p-4 font-semibold text-sm">Units</th>
                                            <th className="p-4 font-semibold text-sm">Department</th>
                                            <th className="p-4 font-semibold text-sm text-center">Details</th>
                                            <th className="p-4 font-semibold text-sm">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {coursesLoading ? (
                                            <tr><td colSpan={6}><TableSkeleton /></td></tr>
                                        ) : courses?.map(course => (
                                            <tr key={course.id} className={`border-t ${theme.input.border}`}>
                                                <td className={`p-4 ${theme.text}`}>{course.code}</td>
                                                <td className={`p-4 ${theme.textMuted}`}>{course.title}</td>
                                                <td className={`p-4 ${theme.textMuted}`}>{course.creditHours}</td>
                                                <td className={`p-4 ${theme.textMuted}`}>{departmentMap[course.departmentId]}</td>
                                                <td className="p-4 text-center">
                                                    <div className="flex justify-center gap-1">
                                                        {course.prerequisites && <span title="Has Prerequisites" className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>}
                                                        {course.learningOutcomes && <span title="Has Learning Outcomes" className="inline-block w-2 h-2 rounded-full bg-green-500"></span>}
                                                        {course.recommendedTextbooks && <span title="Has Textbooks" className="inline-block w-2 h-2 rounded-full bg-purple-500"></span>}
                                                        {(!course.prerequisites && !course.learningOutcomes && !course.recommendedTextbooks) && <span className="text-xs text-gray-400">-</span>}
                                                    </div>
                                                </td>
                                                <td className="p-4 flex gap-2">
                                                    <button onClick={() => handleManageEnrollments(course)} className="text-green-600 hover:text-green-800 text-sm font-medium">Students</button>
                                                    <button onClick={() => openEditModal('course', course)} className="text-blue-500 hover:text-blue-700 text-sm font-medium">Edit</button>
                                                    <button onClick={() => handleDelete('course', course.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="mt-2 flex gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Prerequisites</div>
                            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Learning Outcomes</div>
                            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Textbooks</div>
                        </div>
                    </div>
                )}

                {activeTab === 'fees' && (
                    <div>
                        <button onClick={() => openAddModal('fee')} className={`mb-4 px-4 py-2 rounded-md ${theme.button.primary.background} ${theme.button.primary.text} font-medium`}>Add Fee Item</button>
                        <div className={`${theme.card.background} rounded-lg shadow border ${theme.card.border} overflow-hidden`}>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className={theme.name === 'light' ? 'bg-gray-100' : 'bg-white/5'}>
                                        <tr>
                                            <th className="p-4 font-semibold text-sm">Category</th>
                                            <th className="p-4 font-semibold text-sm">Item</th>
                                            <th className="p-4 font-semibold text-sm">Amount</th>
                                            <th className="p-4 font-semibold text-sm">Note</th>
                                            <th className="p-4 font-semibold text-sm">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {feesLoading ? (
                                            <tr><td colSpan={5}><TableSkeleton /></td></tr>
                                        ) : feeStructure?.map(fee => (
                                            <tr key={fee.id} className={`border-t ${theme.input.border}`}>
                                                <td className={`p-4 ${theme.textMuted}`}>{fee.category}</td>
                                                <td className={`p-4 ${theme.text}`}>{fee.item}</td>
                                                <td className={`p-4 font-medium ${theme.text}`}>{fee.amount}</td>
                                                <td className={`p-4 ${theme.textMuted}`}>{fee.note}</td>
                                                <td className="p-4 flex gap-2">
                                                    <button onClick={() => openEditModal('fee', fee)} className="text-blue-500 hover:text-blue-700 text-sm font-medium">Edit</button>
                                                    <button onClick={() => handleDelete('fee', fee.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* General CRUD Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`${editingItem ? 'Edit' : 'Add'} ${modalType === 'student' ? 'Student' : modalType === 'staff' ? 'Staff' : modalType === 'course' ? 'Course' : 'Fee Item'}`}
            >
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    {modalType === 'student' && (
                        <>
                            <div>
                                <label className={labelClass}>Full Name</label>
                                <input name="name" defaultValue={editingItem?.name} required className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Matric Number</label>
                                <input name="studentId" defaultValue={editingItem?.studentId} required className={inputClass} placeholder="e.g., COC/24/001" />
                            </div>
                            <div>
                                <label className={labelClass}>Email</label>
                                <input name="email" type="email" defaultValue={editingItem?.email} required className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Department</label>
                                <select name="departmentId" defaultValue={editingItem?.departmentId} className={inputClass}>
                                    {departments?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                        </>
                    )}

                    {modalType === 'staff' && (
                        <>
                            <div>
                                <label className={labelClass}>Full Name</label>
                                <input name="name" defaultValue={editingItem?.name} required className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Email</label>
                                <input name="email" type="email" defaultValue={editingItem?.email} required className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Role</label>
                                <select name="role" defaultValue={editingItem?.role} className={inputClass}>
                                    {Object.values(StaffRole).map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Department</label>
                                <select name="departmentId" defaultValue={editingItem?.departmentId} className={inputClass}>
                                    <option value="">None</option>
                                    {departments?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                        </>
                    )}

                    {modalType === 'course' && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Course Code</label>
                                    <input name="code" defaultValue={editingItem?.code} required className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Credit Units</label>
                                    <input name="creditHours" type="number" defaultValue={editingItem?.creditHours} required className={inputClass} />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Title</label>
                                <input name="title" defaultValue={editingItem?.title} required className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Department</label>
                                <select name="departmentId" defaultValue={editingItem?.departmentId} className={inputClass}>
                                    {departments?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Program Type</label>
                                <select name="programType" defaultValue={editingItem?.programType} className={inputClass}>
                                    <option value="Degree">Degree</option>
                                    <option value="Diploma">Diploma</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Prerequisites</label>
                                <textarea name="prerequisites" rows={2} defaultValue={editingItem?.prerequisites} className={textAreaClass} placeholder="e.g., None or CSC 101" />
                            </div>
                            <div>
                                <label className={labelClass}>Learning Outcomes</label>
                                <textarea name="learningOutcomes" rows={3} defaultValue={editingItem?.learningOutcomes} className={textAreaClass} placeholder="What will students learn?" />
                            </div>
                            <div>
                                <label className={labelClass}>Recommended Textbooks</label>
                                <textarea name="recommendedTextbooks" rows={3} defaultValue={editingItem?.recommendedTextbooks} className={textAreaClass} placeholder="List of books..." />
                            </div>
                        </>
                    )}

                    {modalType === 'fee' && (
                        <>
                            <div>
                                <label className={labelClass}>Category</label>
                                <select name="category" defaultValue={editingItem?.category} className={inputClass}>
                                    <option value="General">General</option>
                                    <option value="Administrative">Administrative</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Item Name</label>
                                <input name="item" defaultValue={editingItem?.item} required className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Amount</label>
                                <input name="amount" defaultValue={editingItem?.amount} required className={inputClass} placeholder="e.g., ₦5,000" />
                            </div>
                            <div>
                                <label className={labelClass}>Note</label>
                                <input name="note" defaultValue={editingItem?.note} className={inputClass} placeholder="Optional" />
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={() => setIsModalOpen(false)} className={`px-4 py-2 rounded-md ${theme.name === 'light' ? 'bg-gray-200 hover:bg-gray-300' : 'bg-white/10 hover:bg-white/20'}`}>Cancel</button>
                        <button type="submit" disabled={formLoading} className={`px-4 py-2 rounded-md ${theme.button.primary.background} ${theme.button.primary.text} disabled:opacity-50`}>{formLoading ? 'Saving...' : 'Save Changes'}</button>
                    </div>
                </form>
            </Modal>

            {/* Manage Lecturer Courses Modal */}
            {managingCoursesStaff && (
                <Modal
                    isOpen={!!managingCoursesStaff}
                    onClose={() => setManagingCoursesStaff(null)}
                    title={`Manage Courses for ${managingCoursesStaff.name}`}
                >
                    <div className="space-y-6">
                        <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                            <h4 className={`font-semibold ${theme.text}`}>Assigned Courses</h4>
                            {courses?.filter(c => c.lecturerId === managingCoursesStaff.id).length === 0 ? (
                                <p className={theme.textMuted}>No courses assigned.</p>
                            ) : (
                                courses?.filter(c => c.lecturerId === managingCoursesStaff.id).map(course => (
                                    <div key={course.id} className={`flex justify-between items-center p-3 rounded border ${theme.input.border} ${theme.name === 'light' ? 'bg-gray-50' : 'bg-white/5'}`}>
                                        <div>
                                            <p className={`font-medium ${theme.text}`}>{course.code}</p>
                                            <p className={`text-sm ${theme.textMuted}`}>{course.title}</p>
                                        </div>
                                        <button onClick={() => handleUnassignCourse(course.id)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className={`pt-6 border-t ${theme.input.border}`}>
                            <h4 className={`font-semibold ${theme.text} mb-3`}>Assign New Courses</h4>
                            <div className="flex flex-col gap-4">
                                <div className={`flex-grow border rounded-md ${theme.input.border} ${theme.input.background} max-h-60 overflow-y-auto p-2`}>
                                    {availableCourses.length === 0 ? (
                                        <p className={`text-center py-4 ${theme.textMuted}`}>No available courses found.</p>
                                    ) : (
                                        availableCourses.map(c => (
                                            <label key={c.id} className={`flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded cursor-pointer transition-colors`}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedCoursesToAssign.includes(c.id)}
                                                    onChange={() => handleToggleCourseSelection(c.id)}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                                />
                                                <div className="flex-grow">
                                                    <span className={`block font-medium ${theme.text}`}>{c.code} - {c.title}</span>
                                                    {c.lecturerId && <span className="text-xs text-red-500 font-semibold">(Assigned to another lecturer)</span>}
                                                </div>
                                            </label>
                                        ))
                                    )}
                                </div>
                                <button 
                                    onClick={handleAssignCourses} 
                                    disabled={selectedCoursesToAssign.length === 0 || formLoading}
                                    className={`w-full py-3 rounded-md font-bold ${theme.button.primary.background} ${theme.button.primary.text} disabled:opacity-50 transition-all`}
                                >
                                    {formLoading ? 'Assigning...' : `Assign Selected Courses (${selectedCoursesToAssign.length})`}
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                             <button onClick={() => setManagingCoursesStaff(null)} className={`px-4 py-2 rounded-md border ${theme.input.border} hover:bg-gray-100 dark:hover:bg-white/10`}>Close</button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Manage Course Enrollments Modal */}
            {managingEnrollmentsCourse && (
                <Modal
                    isOpen={!!managingEnrollmentsCourse}
                    onClose={() => setManagingEnrollmentsCourse(null)}
                    title={`Manage Students: ${managingEnrollmentsCourse.code}`}
                >
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <h4 className={`font-semibold ${theme.text}`}>Enrolled Students ({enrolledStudents?.length || 0})</h4>
                            <div className={`max-h-60 overflow-y-auto border rounded-md ${theme.input.border} p-2`}>
                                {enrolledStudents && enrolledStudents.length > 0 ? (
                                    enrolledStudents.map(student => (
                                        <div key={student.id} className={`flex justify-between items-center p-2 border-b last:border-0 ${theme.input.border}`}>
                                            <div>
                                                <p className={`text-sm font-semibold ${theme.text}`}>{student.name}</p>
                                                <p className={`text-xs ${theme.textMuted}`}>{student.studentId}</p>
                                            </div>
                                            <button onClick={() => handleRemoveStudentFromCourse(student.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20">Remove</button>
                                        </div>
                                    ))
                                ) : (
                                    <p className={`text-center py-4 text-sm ${theme.textMuted}`}>No students enrolled yet.</p>
                                )}
                            </div>
                        </div>

                        <div className={`pt-4 border-t ${theme.input.border}`}>
                            <h4 className={`font-semibold ${theme.text} mb-2`}>Add Student</h4>
                            <div className="flex gap-2">
                                <select 
                                    className={inputClass} 
                                    value={studentToEnroll} 
                                    onChange={(e) => setStudentToEnroll(e.target.value)}
                                >
                                    <option value="">Select a student...</option>
                                    {availableStudentsForEnrollment.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.studentId})</option>
                                    ))}
                                </select>
                                <button 
                                    onClick={handleAddStudentToCourse} 
                                    disabled={!studentToEnroll || formLoading} 
                                    className={`px-4 py-2 rounded-md font-semibold ${theme.button.primary.background} ${theme.button.primary.text} disabled:opacity-50 whitespace-nowrap`}
                                >
                                    {formLoading ? '...' : 'Enroll'}
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                             <button onClick={() => setManagingEnrollmentsCourse(null)} className={`px-4 py-2 rounded-md border ${theme.input.border} hover:bg-gray-100 dark:hover:bg-white/10`}>Close</button>
                        </div>
                    </div>
                </Modal>
            )}
        </PageWrapper>
    );
};

export default AdminDashboardPage;
