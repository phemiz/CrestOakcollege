import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';

interface Crumb {
    name: string;
    path?: string;
}

interface BreadcrumbsProps {
    crumbs: Crumb[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ crumbs }) => {
    const { theme } = useTheme();

    return (
        <nav aria-label="Breadcrumb" className="max-w-6xl mx-auto mb-8">
            <ol className="flex items-center space-x-2 text-sm">
                {crumbs.map((crumb, index) => {
                    const isLast = index === crumbs.length - 1;
                    return (
                        <li key={index} className="flex items-center">
                            {!isLast && crumb.path ? (
                                <Link to={crumb.path} className={`${theme.textMuted} hover:${theme.accent} transition-colors duration-200`}>
                                    {crumb.name}
                                </Link>
                            ) : (
                                <span className={theme.text} aria-current="page">{crumb.name}</span>
                            )}
                            {!isLast && (
                                <svg className={`w-4 h-4 mx-2 ${theme.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
