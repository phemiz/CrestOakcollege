
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import PageWrapper from '../components/PageWrapper';
import { getCurrentStudent, studentLogout, updateStudentProfile, enrollInCourse, dropCourse } from '../hooks/useApi';
import { useApi } from '../hooks/useApi';
import { Department, Student, TimetableEntry, Course, Fee, FeeStatus, CourseMaterial, StudentGrade, StaffMember, Announcement, Payment } from '../types';
import { useTheme } from '../hooks/useTheme';
import Modal from '../components/Modal';
import FeePaymentModal from '../components/FeePaymentModal';
import DigitalIDCard from '../components/DigitalIDCard';
import TodayFeed from '../components/TodayFeed';
import CourseRecommenderModal from '../components/CourseRecommenderModal';
import OnboardingTour from '../components/OnboardingTour';
import SkeletonLoader from '../components/SkeletonLoader';

const EditProfileModal: React.FC<{
    student: Student;
    isOpen: boolean;
    onClose: () => void;
    onProfileUpdate: (updatedStudent: Student) => void;
}> = ({ student, isOpen, onClose, onProfileUpdate }) => {
    const { theme } = useTheme();
    const [formData, setFormData] = useState({ name: student.name, phone: student.phone || '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (isOpen) {
            setFormData({ name: student.name, phone: student.phone || '' });
            setError('');
            setSuccess('');
        }
    }, [isOpen, student]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        
        const result = await updateStudentProfile(student.id, formData);

        if (result.success && result.student) {
            setSuccess('Profile updated successfully!');
            onProfileUpdate(result.student);
            setTimeout(() => {
                onClose();
            }, 1500);
        } else {
            setError(result.message || 'Failed to update profile.');
        }
        setLoading(false);
    };

    const inputClasses = `mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none ${theme.input.background} ${theme.input.text} ${theme.input.border} ${theme.input.focus} ${theme.input.placeholder}`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
             <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className={`block text-sm font-medium ${theme.textMuted}`}>Full Name</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={inputClasses} required />
                </div>
                <div>
                    <label htmlFor="phone" className={`block text-sm font-medium ${theme.textMuted}`}>Phone Number</label>
                    <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className={inputClasses} />
                </div>

                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                {success && <p className="text-sm text-green-600 text-center">{success}</p>}

                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className={`py-2 px-6 rounded-full border ${theme.name === 'light' ? 'border-gray-300' : 'border-white/50'} hover:bg-gray-100`}>Cancel</button>
                    <button type="submit" disabled={loading} className={`py-2 px-6 rounded-full ${theme.button.primary.background} ${theme.button.primary.text} ${theme.button.primary.hover} disabled:opacity-50`}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
