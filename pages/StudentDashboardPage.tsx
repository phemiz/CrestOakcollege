
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { useTheme } from '../hooks/useTheme';
import { useApi, getCurrentStudent } from '../hooks/useApi';
import { Student, Course, TimetableEntry, Fee, FeeStatus, Notification, Announcement } from '../types';
import DigitalIDCard from '../components/DigitalIDCard';
import TodayFeed from '../components/TodayFeed';
import NotificationCenter from '../components/NotificationCenter';
import OnboardingTour from '../components/OnboardingTour';
import FeePaymentModal from '../components/FeePaymentModal';
import CourseRecommenderModal from '../components/CourseRecommenderModal';
import SkeletonLoader from '../components/SkeletonLoader';

const StudentDashboardPage: React.FC = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [student, setStudent] = useState<Student | null>(null);
    
    // Modals and UI State
    const [showFeeModal, setShowFeeModal] = useState(false);
    const [showRecommender, setShowRecommender] = useState(false);
    const [showTour, setShowTour] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'timetable'>('overview');

    // Data Fetching
    const { data: departments } = useApi<any[]>('/api/departments');
    const { data: allCourses, loading: coursesLoading } = useApi<Course[]>('/api/courses');
    const { data: timetable, loading: timetableLoading } = useApi<TimetableEntry[]>('/api/timetable');
    const { data: fees, loading: feesLoading, refetch: refetchFees } = useApi<Fee[]>('/api/fees');
    const { data: announcements } = useApi<Announcement[]>('/api/announcements');
    
    // Mock Enrolled Courses (In a real app, this would be a dedicated endpoint)
    const enrolledCourses = useMemo(() => {
        if (!student || !allCourses) return [];
        return allCourses.filter(c => c.departmentId === student.departmentId).slice(0, 4);
    }, [student, allCourses]);

    // Mock Notifications
    const [notifications, setNotifications] = useState<Notification[]>([
        { id: 'n1', type: 'announcement', title: 'New Semester', content: 'Welcome back to campus!', createdAt: new Date().toISOString(), read: false },
        { id: 'n2', type: 'fee', title: 'Fee Due', content: 'Tuition fee is due next week.', createdAt: new Date().toISOString(), read: false },
    ]);

    // Mock Recent Grades
    const recentGrades = [
        { id: 'g1', courseCode: 'CSC 101', title: 'Introduction to Computer Science', score: 82, grade: 'A' },
        { id: 'g2', courseCode: 'GNS 101', title: 'Use of English', score: 68, grade: 'B' },
        { id: 'g3', courseCode: 'MTH 101', title: 'General Mathematics', score: 75, grade: 'A' },
    ];

    useEffect(() => {
        const current = getCurrentStudent();
        if (!current) {
            navigate('/portal');
        } else {
            setStudent(current);
            // Check if first time login for tour
            const hasSeenTour = localStorage.getItem(`tour_completed_${current.id}`);
            if (!hasSeenTour) {
                setShowTour(true);
            }
        }
    }, [navigate]);

    const department = departments?.find(d => d.id === student?.departmentId);
    const unreadNotificationsCount = notifications.filter(n => !n.read).length;

    const handleMarkAsRead = (id?: string) => {
        if (id) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } else {
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }
    };

    const handleTourComplete = () => {
        setShowTour(false);
        if (student) {
            localStorage.setItem(`tour_completed_${student.id}`, 'true');
        }
    };

    const getGradeColor = (grade: string) => {
        if (grade === 'A') return 'text-green-600 bg-green-100';
        if (grade === 'B') return 'text-blue-600 bg-blue-100';
        if (grade === 'C') return 'text-yellow-600 bg-yellow-100';
        return 'text-gray-600 bg-gray-100';
    };

    if (!student) return null;

    const studentFees = fees?.filter(f => f.studentId === student.id) || [];

    return (
        <PageWrapper title={`Welcome, ${student.name.split(' ')[0]}`}>
             {/* Header Actions */}
             <div className="flex justify-end items-center gap-4 mb-8 -mt-8 relative">
                 <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
                     <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${theme.textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                     {unreadNotificationsCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>}
                 </button>
                 <NotificationCenter isOpen={showNotifications} onClose={() => setShowNotifications(false)} notifications={notifications} onMarkAsRead={handleMarkAsRead} />
                 <button onClick={() => { localStorage.removeItem('crestoak_student_user'); navigate('/'); }} className="text-sm font-semibold text-red-500 hover:text-red-700">Logout</button>
             </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Profile & Quick Actions */}
                <div className="lg:col-span-1 space-y-8">
                    <div id="profile">
                        <DigitalIDCard student={student} department={department} />
                    </div>
                    
                    <div className={`${theme.card.background} ${theme.card.rounded} ${theme.card.shadow} ${theme.card.border} p-6`}>
                        <h3 className={`font-bold ${theme.text} mb-4`}>Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setShowFeeModal(true)} className={`p-3 rounded-lg text-sm font-medium transition-colors ${theme.button.secondary.background} ${theme.button.secondary.text} ${theme.button.secondary.border} ${theme.button.secondary.hover}`}>
                                Pay Fees
                            </button>
                            <button onClick={() => navigate('/e-learning')} className={`p-3 rounded-lg text-sm font-medium transition-colors ${theme.button.secondary.background} ${theme.button.secondary.text} ${theme.button.secondary.border} ${theme.button.secondary.hover}`}>
                                E-Learning
                            </button>
                            <button onClick={() => setShowRecommender(true)} className={`p-3 rounded-lg text-sm font-medium transition-colors ${theme.button.secondary.background} ${theme.button.secondary.text} ${theme.button.secondary.border} ${theme.button.secondary.hover}`}>
                                Course Advisor
                            </button>
                             <button onClick={() => navigate('/library')} className={`p-3 rounded-lg text-sm font-medium transition-colors ${theme.button.secondary.background} ${theme.button.secondary.text} ${theme.button.secondary.border} ${theme.button.secondary.hover}`}>
                                Library
                            </button>
                        </div>
                    </div>
                </div>

                {/* Middle/Right Column: Tabs & Content */}
                <div className="lg:col-span-2">
                    <div className="flex space-x-4 border-b border-gray-200 dark:border-white/10 mb-6">
                        <button onClick={() => setActiveTab('overview')} className={`pb-2 px-1 text-sm font-medium transition-colors ${activeTab === 'overview' ? `border-b-2 ${theme.name === 'light' ? 'border-blue-500 text-blue-600' : 'border-blue-400 text-blue-400'}` : theme.textMuted}`}>Overview</button>
                        <button onClick={() => setActiveTab('courses')} className={`pb-2 px-1 text-sm font-medium transition-colors ${activeTab === 'courses' ? `border-b-2 ${theme.name === 'light' ? 'border-blue-500 text-blue-600' : 'border-blue-400 text-blue-400'}` : theme.textMuted}`} id="courses">My Courses</button>
                        <button onClick={() => setActiveTab('timetable')} className={`pb-2 px-1 text-sm font-medium transition-colors ${activeTab === 'timetable' ? `border-b-2 ${theme.name === 'light' ? 'border-blue-500 text-blue-600' : 'border-blue-400 text-blue-400'}` : theme.textMuted}`} id="timetable">Timetable</button>
                    </div>

                    {activeTab === 'overview' && (
                         <div className="space-y-8">
                            <TodayFeed 
                                timetable={timetable || []} 
                                courses={allCourses || []} 
                                announcements={announcements || []} 
                                fees={studentFees}
                            />
                            
                            {/* Recent Grades */}
                            <div className={`${theme.card.background} ${theme.card.rounded} ${theme.card.shadow} ${theme.card.border} p-6`}>
                                <h3 className={`font-bold ${theme.text} mb-4`}>Recent Grades</h3>
                                <div className="space-y-3">
                                    {recentGrades.map(grade => (
                                        <div key={grade.id} className={`flex justify-between items-center p-3 rounded-lg border ${theme.input.border} ${theme.name === 'light' ? 'bg-gray-50' : 'bg-white/5'}`}>
                                            <div>
                                                <p className={`font-semibold ${theme.text}`}>{grade.courseCode}</p>
                                                <p className={`text-xs ${theme.textMuted}`}>{grade.title}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`text-sm font-medium ${theme.text}`}>{grade.score}%</span>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getGradeColor(grade.grade)}`}>{grade.grade}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                         </div>
                    )}

                    {activeTab === 'courses' && (
                        <div className="grid sm:grid-cols-2 gap-4">
                            {coursesLoading && <SkeletonLoader type="card" className="h-32" />}
                            {!coursesLoading && enrolledCourses.map(course => (
                                <div key={course.id} className={`${theme.card.background} ${theme.card.rounded} ${theme.card.shadow} ${theme.card.border} p-5`}>
                                    <h4 className={`font-bold ${theme.text}`}>{course.code}</h4>
                                    <p className={`text-sm ${theme.textMuted} mb-3`}>{course.title}</p>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className={`px-2 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`}>{course.creditHours} Units</span>
                                    </div>
                                </div>
                            ))}
                            <div id="enroll" className={`flex items-center justify-center p-5 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${theme.name === 'light' ? 'border-gray-300 hover:bg-gray-50' : 'border-gray-600 hover:bg-white/5'}`}>
                                <div className="text-center">
                                    <span className={`text-2xl font-bold ${theme.textMuted}`}>+</span>
                                    <p className={`text-sm font-medium ${theme.textMuted}`}>Enroll in Course</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'timetable' && (
                         <div className={`${theme.card.background} ${theme.card.rounded} ${theme.card.shadow} ${theme.card.border} p-6`}>
                             {timetableLoading ? <SkeletonLoader type="line" className="h-64" /> : (
                                 <div className="space-y-4">
                                     {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
                                         const dayClasses = timetable?.filter(t => t.dayOfWeek === day).sort((a,b) => a.startTime.localeCompare(b.startTime));
                                         if (!dayClasses || dayClasses.length === 0) return null;
                                         return (
                                             <div key={day}>
                                                 <h4 className={`font-bold ${theme.accent} mb-2`}>{day}</h4>
                                                 <div className="space-y-2">
                                                     {dayClasses.map(cls => (
                                                         <div key={cls.id} className={`flex justify-between p-2 rounded ${theme.name === 'light' ? 'bg-gray-100' : 'bg-white/5'}`}>
                                                             <div>
                                                                 <p className={`text-sm font-semibold ${theme.text}`}>{allCourses?.find(c => c.id === cls.courseId)?.code}</p>
                                                                 <p className={`text-xs ${theme.textMuted}`}>{cls.location}</p>
                                                             </div>
                                                             <p className={`text-sm font-mono ${theme.text}`}>{cls.startTime} - {cls.endTime}</p>
                                                         </div>
                                                     ))}
                                                 </div>
                                             </div>
                                         )
                                     })}
                                 </div>
                             )}
                         </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showFeeModal && <FeePaymentModal 
                isOpen={showFeeModal} 
                onClose={() => setShowFeeModal(false)} 
                fees={studentFees} 
                onPaymentSuccess={refetchFees} 
            />}
            
            {showRecommender && <CourseRecommenderModal 
                isOpen={showRecommender} 
                onClose={() => setShowRecommender(false)} 
                student={student}
                enrolledCourses={enrolledCourses}
                allCourses={allCourses || []}
                department={department}
            />}
            
            {showTour && <OnboardingTour onComplete={handleTourComplete} />}
        </PageWrapper>
    );
};

export default StudentDashboardPage;
