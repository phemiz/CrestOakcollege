import React from 'react';
import { useTheme } from '../hooks/useTheme';

const AboutPage: React.FC = () => {
    const { theme } = useTheme();

    return (
        <div className="min-h-screen py-16">
            <div className="container mx-auto px-4">
                <h1 className={`text-4xl font-bold ${theme.text} mb-8`}>About CrestOAK College</h1>
                <div className="prose max-w-none">
                    <p className={`text-lg ${theme.text} opacity-75 mb-6`}>
                        Founded in 1985, CrestOAK College has been at the forefront of higher education,
                        providing students with world-class academic programs and research opportunities.
                    </p>
                    <p className={`text-lg ${theme.text} opacity-75`}>
                        Our mission is to empower minds and shape futures through excellence in teaching,
                        research, and community engagement.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
