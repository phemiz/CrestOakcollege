
import React from 'react';
import { useTheme } from '../hooks/useTheme';

interface FormErrorProps {
    message?: string;
    id?: string;
}

const FormError: React.FC<FormErrorProps> = ({ message, id }) => {
    const { theme } = useTheme();

    if (!message) return null;

    return (
        <div 
            id={id}
            role="alert" 
            className="flex items-center gap-2 mt-1.5 animate-fadeIn"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-600 font-medium">{message}</p>
        </div>
    );
};

export default FormError;
