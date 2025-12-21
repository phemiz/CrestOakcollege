import React from 'react';
import { useTheme } from '../hooks/useTheme';

interface SkeletonLoaderProps {
    type: 'card' | 'line';
    className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type, className }) => {
    const { theme } = useTheme();
    // FIX: Removed check for non-existent 'highContrast' theme.
    const baseClass = `animate-pulse ${theme.name === 'light' ? 'bg-gray-200' : 'bg-white/10'}`;

    if (type === 'card') {
        return (
            <div className={`${baseClass} rounded-xl p-6 ${className}`}>
                <div className="h-4 bg-gray-300 dark:bg-white/20 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-300 dark:bg-white/20 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-white/20 rounded w-full"></div>
                <div className="h-3 bg-gray-300 dark:bg-white/20 rounded w-full mt-1"></div>
            </div>
        );
    }

    if (type === 'line') {
        return <div className={`${baseClass} rounded ${className}`}></div>;
    }

    return null;
};

export const SkeletonGrid: React.FC<{ count: number; type: 'card' | 'line' }> = ({ count, type }) => {
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonLoader key={i} type={type} />
            ))}
        </div>
    );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
    const { theme } = useTheme();
    // FIX: Removed check for non-existent 'highContrast' theme.
    const baseClass = `animate-pulse ${theme.name === 'light' ? 'bg-gray-200' : 'bg-white/10'}`;

    return (
        <div className={`w-full p-4 border rounded-lg ${theme.input.border}`}>
            {/* Header */}
            <div className="flex space-x-4 mb-4 pb-2 border-b border-gray-200 dark:border-white/10">
                <div className={`${baseClass} h-4 rounded w-1/4`}></div>
                <div className={`${baseClass} h-4 rounded w-1/4`}></div>
                <div className={`${baseClass} h-4 rounded w-1/4`}></div>
                <div className={`${baseClass} h-4 rounded w-1/4`}></div>
            </div>
            {/* Body */}
            <div className="space-y-4">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                        <div className="flex-1 space-y-2">
                           <div className={`${baseClass} h-3 rounded w-3/4`}></div>
                           <div className={`${baseClass} h-2 rounded w-1/2`}></div>
                        </div>
                         <div className={`${baseClass} h-3 rounded w-1/4`}></div>
                         <div className={`${baseClass} h-3 rounded w-1/4`}></div>
                         <div className={`${baseClass} h-3 rounded w-1/4`}></div>
                    </div>
                ))}
            </div>
        </div>
    );
};


export default SkeletonLoader;