
import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';

interface ErrorDisplayProps {
    message: string;
    onRetry?: () => void;
    title?: string;
    isDismissible?: boolean;
    onDismiss?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
    message, 
    onRetry, 
    title = "An Error Occurred", 
    isDismissible = false,
    onDismiss 
}) => {
    const { theme } = useTheme();
    const [isVisible, setIsVisible] = useState(true);

    const handleDismiss = () => {
        setIsVisible(false);
        if (onDismiss) onDismiss();
    };

    if (!isVisible) return null;

    const isDark = theme.name === 'dark' || theme.name === 'faith';
    const bgClass = isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200';
    const textClass = isDark ? 'text-red-200' : 'text-red-800';
    const mutedTextClass = isDark ? 'text-red-300' : 'text-red-600';
    const buttonClass = isDark 
        ? 'bg-red-800 hover:bg-red-700 text-white' 
        : 'bg-white border border-red-300 hover:bg-red-50 text-red-700';

    return (
        <div role="alert" className={`flex flex-col sm:flex-row gap-4 p-4 rounded-lg border ${bgClass} shadow-sm transition-all duration-300 animate-fadeIn`}>
            <div className="flex-shrink-0 self-start">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${textClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <div className="flex-grow">
                <h3 className={`text-sm font-bold ${textClass}`}>{title}</h3>
                <p className={`text-sm mt-1 ${mutedTextClass}`}>{message}</p>
                {onRetry && (
                    <div className="mt-3">
                        <button
                            onClick={onRetry}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 ${buttonClass}`}
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
            {isDismissible && (
                <div className="flex-shrink-0 self-start">
                    <button 
                        onClick={handleDismiss}
                        aria-label="Dismiss error"
                        className={`p-1 rounded-md hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors ${mutedTextClass}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ErrorDisplay;
