import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Course, Department, Student } from '../types';
import Modal from './Modal';
import { useTheme } from '../hooks/useTheme';

interface CourseRecommenderModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student;
    enrolledCourses: Course[];
    allCourses: Course[];
    department: Department | undefined;
}

interface Recommendation {
    courseName: string;
    reason: string;
}

const CourseRecommenderModal: React.FC<CourseRecommenderModalProps> = ({
    isOpen,
    onClose,
    student,
    enrolledCourses,
    allCourses,
    department
}) => {
    const { theme } = useTheme();
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchRecommendations();
        }
    }, [isOpen]);

    const fetchRecommendations = async () => {
        if (!department) {
            setError("Could not determine your department.");
            return;
        }

        setLoading(true);
        setError('');
        setRecommendations([]);

        const enrolledCourseTitles = enrolledCourses.map(c => c.title).join(', ');
        const availableCourses = allCourses
            .filter(c => c.departmentId === student.departmentId && !enrolledCourses.find(ec => ec.id === c.id))
            .map(c => `- ${c.title}: ${c.description}`)
            .join('\n');

        const prompt = `
            I am a student at Crestview College in the "${department.name}" department.
            I am currently enrolled in the following courses: ${enrolledCourseTitles || 'None'}.
            
            Here are some of the other available courses in my department:
            ${availableCourses}

            Based on my department and current enrollment, please recommend 3 relevant elective courses that would complement my studies.
            For each recommendation, provide a brief, one-sentence reason why it's a good choice.
            
            Return the response ONLY as a valid JSON array of objects in the following format: [{"courseName": "Course Title", "reason": "Reason for recommendation."}]. Do not include any other text, markdown, or explanations outside of the JSON array.
        `;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            const responseText = response.text.trim();
            const jsonResponse = JSON.parse(responseText);
            setRecommendations(jsonResponse);
        } catch (err) {
            console.error(err);
            setError("Sorry, I couldn't generate recommendations at this time. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="AI Course Recommendations">
            <div>
                {loading && (
                    <div className="text-center p-8">
                        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${theme.name === 'light' ? 'border-blue-600' : 'border-white'} mx-auto`}></div>
                        <p className={`mt-4 ${theme.textMuted}`}>Analyzing your profile...</p>
                    </div>
                )}
                {error && <p className="text-center text-red-500">{error}</p>}

                {!loading && !error && (
                    <div className="space-y-4">
                        {recommendations.map((rec, index) => (
                             <div key={index} className={`p-4 rounded-lg border ${theme.input.border} ${theme.name === 'light' ? 'bg-gray-50' : 'bg-white/5'}`}>
                                <h4 className={`font-bold ${theme.text}`}>{rec.courseName}</h4>
                                <p className={`text-sm ${theme.textMuted} mt-1`}>{rec.reason}</p>
                            </div>
                        ))}
                    </div>
                )}
                 <div className="flex justify-end gap-4 pt-6">
                    <button type="button" onClick={onClose} className={`py-2 px-6 rounded-full border ${theme.name === 'light' ? 'border-gray-300' : 'border-white/50'} hover:bg-gray-100`}>Close</button>
                </div>
            </div>
        </Modal>
    );
};

export default CourseRecommenderModal;
