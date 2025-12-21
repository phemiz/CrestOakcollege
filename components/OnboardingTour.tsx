import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import Modal from './Modal';

interface OnboardingTourProps {
    onComplete: () => void;
}

const TOUR_STEPS = [
    { id: 'profile', title: 'Update Your Profile', description: 'Make sure your contact information is up to date.', target: '#profile' },
    { id: 'courses', title: 'View Your Courses', description: 'See your enrolled courses and course materials.', target: '#courses' },
    { id: 'enroll', title: 'Enroll in a New Course', description: 'Explore and add new courses for the semester.', target: '#enroll' },
    { id: 'timetable', title: 'Check Your Timetable', description: 'Find out where your classes are and when.', target: '#timetable' },
];

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
    const { theme } = useTheme();
    const [completedSteps, setCompletedSteps] = useState<string[]>([]);

    const handleStepClick = (stepId: string, target: string) => {
        setCompletedSteps(prev => [...new Set([...prev, stepId])]);
        
        const element = document.querySelector(target);
        if (element) {
            const headerOffset = 90;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
    };
    
    return (
        <Modal isOpen={true} onClose={onComplete} title="Welcome to Your Dashboard!">
            <div className="space-y-4">
                <p className={theme.textMuted}>Let's get you set up. Complete these steps to get familiar with your new student portal.</p>
                <ul className="space-y-3">
                    {TOUR_STEPS.map(step => {
                        const isCompleted = completedSteps.includes(step.id);
                        return (
                            <li key={step.id}>
                                <button
                                    onClick={() => handleStepClick(step.id, step.target)}
                                    className={`w-full text-left flex items-center gap-4 p-4 border rounded-lg transition-all duration-200 ${theme.input.border} ${isCompleted ? 'bg-green-50 dark:bg-green-900/30 border-green-300' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
                                >
                                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2 ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>
                                        {isCompleted && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                    <div>
                                        <p className={`font-semibold ${theme.text} ${isCompleted ? 'line-through' : ''}`}>{step.title}</p>
                                        <p className={`text-sm ${theme.textMuted}`}>{step.description}</p>
                                    </div>
                                </button>
                            </li>
                        );
                    })}
                </ul>

                <div className="flex justify-end pt-4">
                    <button onClick={onComplete} className={`py-2 px-6 rounded-full ${theme.button.primary.background} ${theme.button.primary.text} ${theme.button.primary.hover}`}>
                       {completedSteps.length === TOUR_STEPS.length ? 'Finish Tour' : 'Skip For Now'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default OnboardingTour;
