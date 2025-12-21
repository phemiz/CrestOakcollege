
import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';
import { useTheme } from '../hooks/useTheme';
import { useApi } from '../hooks/useApi';
import { Student, Course, Department } from '../types';

interface EnrollmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student;
    allCourses: Course[];
    departments: Department[];
    onSubmit: (studentId: string, courseIds: string[]) => Promise<{ success: boolean; message: string }>;
}

const EnrollmentModal: React.FC<EnrollmentModalProps> = ({ isOpen, onClose, student, allCourses, departments, onSubmit }) => {
    const { theme } = useTheme();
    // Fetch current enrollments when the modal is open for the specific student
    // useApi will automatically refetch when student.id changes (if isOpen is true)
    const { data: enrolledCourseIds, loading: enrollmentsLoading } = useApi<string[]>('/api/student-enrollments', isOpen ? student.id : undefined);
    
    const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (isOpen) {
            // When modal opens, we reset state
            setSuccess('');
            setError('');
        }
    }, [isOpen]);
    
    useEffect(() => {
        // When fetched data arrives, update our local state
        if (enrolledCourseIds) {
            setSelectedCourses(new Set(enrolledCourseIds));
        }
    }, [enrolledCourseIds]);

    const handleToggleCourse = (courseId: string) => {
        setSelectedCourses(prev => {
            const newSet = new Set(prev);
            if (newSet.has(courseId)) {
                newSet.delete(courseId);
            } else {
                newSet.add(courseId);
            }
            return newSet;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        const result = await onSubmit(student.id, Array.from(selectedCourses));
        if (result.success) {
            setSuccess(result.message);
            setTimeout(() => {
                onClose(); // Close modal on success after a short delay
            }, 1500);
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    const coursesByDepartment = useMemo(() => {
        return departments.map(dept => ({
            ...dept,
            courses: allCourses.filter(c => c.departmentId === dept.id)
        })).filter(dept => dept.courses.length > 0);
    }, [allCourses, departments]);
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Manage Courses for ${student.name}`}>
             <form onSubmit={handleSubmit}>
                <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                    {enrollmentsLoading ? (
                        <p>Loading enrolled courses...</p>
                    ) : (
                        coursesByDepartment.map(dept => (
                            <div key={dept.id}>
                                <h4 className={`text-lg font-bold ${theme.text} border-b ${theme.input.border} pb-2 mb-3`}>{dept.name}</h4>
                                <div className="space-y-2">
                                    {dept.courses.map(course => (
                                        <label key={course.id} className={`flex items-center p-2 rounded-md transition-colors duration-200 ${theme.name === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/5'}`}>
                                            <input
                                                type="checkbox"
                                                checked={selectedCourses.has(course.id)}
                                                onChange={() => handleToggleCourse(course.id)}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className={`ml-3 text-sm ${theme.text}`}>{course.code} - {course.title}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {error && <p className="mt-4 text-sm text-red-600 text-center">{error}</p>}
                {success && <p className="mt-4 text-sm text-green-600 text-center">{success}</p>}

                <div className={`flex justify-end gap-4 pt-6 border-t mt-6 ${theme.input.border}`}>
                    <button type="button" onClick={onClose} className={`py-2 px-6 rounded-full border ${theme.name === 'light' ? 'border-gray-300' : 'border-white/50'} hover:bg-gray-100`} disabled={loading}>
                        Cancel
                    </button>
                    <button type="submit" disabled={loading || enrollmentsLoading} className={`py-2 px-6 rounded-full ${theme.button.primary.background} ${theme.button.primary.text} ${theme.button.primary.hover} disabled:opacity-50`}>
                        {loading ? 'Saving...' : 'Save Enrollments'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EnrollmentModal;
