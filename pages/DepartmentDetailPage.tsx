
import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { useApi } from '../hooks/useApi';
import { Department, StaffMember, Course } from '../types';
import { useTheme } from '../hooks/useTheme';
import NotFoundPage from './NotFoundPage';
import Breadcrumbs from '../components/Breadcrumbs';

// Simplified Staff Card for this page
const FacultyCard: React.FC<{ member: StaffMember }> = ({ member }) => {
    const { theme } = useTheme();
    return (
        <div className={`${theme.card.background} ${theme.card.rounded} ${theme.card.shadow} ${theme.card.border} p-4 text-center flex flex-col`}>
            <div className="flex-grow">
                <img src={member.imageUrl} alt={member.name} className="w-20 h-20 rounded-full mx-auto mb-3 object-cover" />
                <h4 className={`font-bold ${theme.text}`}>{member.name}</h4>
                <p className={`text-xs ${theme.textMuted}`}>{member.role}</p>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/10 space-y-2 text-xs">
                <div className="flex items-center justify-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${theme.textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <a href={`mailto:${member.email}`} className={`truncate ${theme.accent} hover:underline`}>{member.email}</a>
                </div>
                {member.phone && (
                    <div className="flex items-center justify-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${theme.textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        <a href={`tel:${member.phone}`} className={`${theme.accent} hover:underline`}>{member.phone}</a>
                    </div>
                )}
            </div>
        </div>
    );
};

// Simplified Course Card
const CourseCard: React.FC<{ course: Course }> = ({ course }) => {
    const { theme } = useTheme();
    const creditPillBg = theme.name === 'light' ? 'bg-gray-200' : 'bg-white/10';
    return (
        <div className={`${theme.card.background} ${theme.card.rounded} ${theme.card.shadow} ${theme.card.border} p-6 flex flex-col h-full`}>
            <div className="flex-grow">
                <p className={`text-sm font-semibold ${theme.accent}`}>{course.code}</p>
                <h3 className={`text-xl font-bold ${theme.card.text} mt-1`}>{course.title}</h3>
                <p className={`${theme.card.textMuted} mt-2 text-sm`}>{course.description}</p>
            </div>
            <div className={`mt-4 pt-4 border-t ${theme.name === 'light' ? 'border-gray-200' : 'border-white/20'} flex justify-end items-center`}>
                <span className={`${creditPillBg} ${theme.text} text-xs font-bold px-2.5 py-1 rounded-full`}>{course.creditHours} Credits</span>
            </div>
        </div>
    );
};

const DepartmentDetailPage: React.FC = () => {
    const { departmentId } = useParams<{ departmentId: string }>();
    const { theme } = useTheme();

    // Fetch all necessary data
    const { data: departments, loading: deptsLoading } = useApi<Department[]>('/api/departments');
    const { data: staff, loading: staffLoading } = useApi<StaffMember[]>('/api/staff');
    const { data: courses, loading: coursesLoading } = useApi<Course[]>('/api/courses');

    const loading = deptsLoading || staffLoading || coursesLoading;

    // Memoize derived data
    const department = useMemo(() => departments?.find(d => d.id === departmentId), [departments, departmentId]);
    const departmentFaculty = useMemo(() => staff?.filter(s => s.departmentId === departmentId) || [], [staff, departmentId]);
    const departmentCourses = useMemo(() => courses?.filter(c => c.departmentId === departmentId) || [], [courses, departmentId]);

    if (loading) {
        return <PageWrapper title="Loading Department..."><div className="text-center">Loading...</div></PageWrapper>;
    }

    if (!department) {
        return <NotFoundPage />;
    }
    
    const breadcrumbs = [
        { name: 'Home', path: '/' },
        { name: 'Departments', path: '/departments' },
        { name: department.name }
    ];

    const cardBg = theme.name === 'light' ? 'bg-white' : theme.card.background;

    return (
        <PageWrapper title={department.name}>
            <Breadcrumbs crumbs={breadcrumbs} />
            <div className="max-w-5xl mx-auto space-y-16">
                {/* About Section */}
                <section id="about">
                     <div className={`${cardBg} ${theme.card.shadow} ${theme.card.rounded} p-8 ${theme.card.border}`}>
                        <h2 className={`text-3xl font-bold ${theme.text} mb-4`}>About the Department</h2>
                        <p className={`${theme.textMuted} leading-relaxed`}>{department.description}</p>
                     </div>
                </section>

                {/* History Section */}
                <section id="history">
                     <div className={`${cardBg} ${theme.card.shadow} ${theme.card.rounded} p-8 ${theme.card.border}`}>
                        <h2 className={`text-3xl font-bold ${theme.text} mb-4`}>Department History</h2>
                        <div className={`space-y-4 ${theme.textMuted} leading-relaxed`}>
                            <p>
                                Established with the college's founding, the {department.name} has been a cornerstone of our academic offerings. Initially focused on foundational principles, the department has evolved to incorporate cutting-edge research and modern practices.
                            </p>
                            <p>
                                Over the decades, we have produced numerous distinguished alumni who have made significant contributions in their fields. Our commitment to excellence continues as we adapt to the changing demands of the industry and society.
                            </p>
                        </div>
                     </div>
                </section>

                {/* Faculty Section */}
                {departmentFaculty.length > 0 && (
                    <section id="faculty">
                        <h2 className={`text-3xl font-bold ${theme.text} text-center mb-8`}>Our Faculty</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {departmentFaculty.map(member => (
                                <FacultyCard key={member.id} member={member} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Courses Section */}
                {departmentCourses.length > 0 && (
                     <section id="courses">
                        <h2 className={`text-3xl font-bold ${theme.text} text-center mb-8`}>Courses Offered</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {departmentCourses.map(course => (
                                <CourseCard key={course.id} course={course} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </PageWrapper>
    );
};

export default DepartmentDetailPage;
