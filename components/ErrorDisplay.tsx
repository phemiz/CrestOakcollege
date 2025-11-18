
import React from 'react';
import { useTheme } from '../hooks/useTheme';

interface ErrorDisplayProps {
    message: string;
    onRetry?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry }) => {
    const { theme } = useTheme();
    return (
        <div role="alert" className={`p-6 rounded-lg border text-center ${theme.name === 'light' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-red-900/20 border-red-500/30 text-red-300'}`}>
            <h3 className="font-bold">An Error Occurred</h3>
            <p className="text-sm mt-2">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className={`mt-4 ${theme.button.secondary.background} ${theme.button.secondary.text} ${theme.button.secondary.border} font-bold py-2 px-6 rounded-full ${theme.button.secondary.hover} transition-colors duration-300`}
                >
                    Try Again
                </button>
            )}
        </div>
    );
};

export default ErrorDisplay;
