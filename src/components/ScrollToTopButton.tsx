import React, { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';

const ScrollToTopButton: React.FC = () => {
    const { theme } = useTheme();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    if (!isVisible) return null;

    return (
        <button
            onClick={scrollToTop}
            className={`fixed bottom-6 left-6 w-12 h-12 rounded-full ${theme.button.secondary.background} ${theme.button.secondary.text} shadow-lg flex items-center justify-center z-40 transition-transform hover:scale-110`}
            aria-label="Scroll to top"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
        </button>
    );
};

export default ScrollToTopButton;
