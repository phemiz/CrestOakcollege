import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { getCurrentStudent, useApi } from '../hooks/useApi';
import { Course, CourseMaterial } from '../types';
import { useTheme } from '../hooks/useTheme';
import SkeletonLoader from '../components/SkeletonLoader';

const ELearningPage: React.FC = () => {
    const [student, setStudent] = useState(getCurrentStudent());
    const navigate = useNavigate();
    const { theme } = useTheme();

    // Redirect if not logged in
    useEffect(() => {
        if (!student) {
            navigate('/admin');
        }
    }, [student, navigate]);

    const { data: allCourses, loading: coursesLoading } = useApi<Course[]>('/api/courses');
    const { data: allMaterials, loading: materialsLoading } = useApi<CourseMaterial[]>('/api/course-materials');
    const { data: enrolledCourseIds, loading: enrollmentsLoading } = useApi<string[]>('/api/student-enrollments', student?.id);

    const loading = coursesLoading || materialsLoading || enrollmentsLoading;

    const enrolledCourses = useMemo(() => {
        if (!enrolledCourseIds || !allCourses) return [];
        return allCourses.filter(course => enrolledCourseIds.includes(course.id));
    }, [enrolledCourseIds, allCourses]);

    const getFileTypeIcon = (fileType: 'PDF' | 'DOCX' | 'PPT') => {
        switch (fileType) {
            case 'PDF': return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
            case 'DOCX': return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
            case 'PPT': return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
            default: return null;
        }
    };

    if (!student) return null; // Render nothing while redirecting

    return (
        <PageWrapper
            title="E-Learning Hub"
            subtitle="Access all your course materials in one place."
        >
            <div className="max-w-4xl mx-auto space-y-8">
                {loading && (
                    <>
                        <SkeletonLoader type="card" className="h-32" />
                        <SkeletonLoader type="card" className="h-32" />
                    </>
                )}
                
                {!loading && enrolledCourses.length > 0 && (
                    enrolledCourses.map(course => {
                        const materialsForCourse = allMaterials?.filter(m => m.courseId === course.id);
                        return (
                             <div key={course.id} className={`${theme.card.background} ${theme.card.rounded} ${theme.card.shadow} ${theme.card.border} p-6`}>
                                <h2 className={`text-2xl font-bold ${theme.text} mb-1`}>{course.code}: {course.title}</h2>
                                <p className={`text-sm ${theme.textMuted} mb-4`}>{course.description}</p>
                                
                                {materialsForCourse && materialsForCourse.length > 0 ? (
                                    <ul className="space-y-3">
                                        {materialsForCourse.map(material => (
                                            <li key={material.id}>
                                                <a href={material.fileUrl} download className={`flex items-center gap-3 p-3 rounded-md transition-colors ${theme.name === 'light' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-white/5 hover:bg-white/10'}`}>
                                                    {getFileTypeIcon(material.fileType)}
                                                    <span className={`font-semibold ${theme.text}`}>{material.title}</span>
                                                    <span className="ml-auto text-sm text-gray-400">Download</span>
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className={theme.textMuted}>No materials uploaded for this course yet.</p>
                                )}
                            </div>
                        )
                    })
                )}

                {!loading && enrolledCourses.length === 0 && (
                    <div className="text-center py-12">
                        <h3 className={`text-2xl font-semibold ${theme.text}`}>No Courses Found</h3>
                        <p className={`${theme.textMuted} mt-2`}>You are not enrolled in any courses. Please visit your dashboard to enroll.</p>
                    </div>
                )}
            </div>
        </PageWrapper>
    );
};

export default ELearningPage;