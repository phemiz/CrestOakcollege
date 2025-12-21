import React from 'react';
import { useTheme } from '../hooks/useTheme';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    const { theme } = useTheme();

    const getPageNumbers = () => {
        const pageNumbers: (number | string)[] = [];
        const maxPagesToShow = 5;
        const halfPagesToShow = Math.floor(maxPagesToShow / 2);

        if (totalPages <= maxPagesToShow + 2) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            pageNumbers.push(1);
            if (currentPage > halfPagesToShow + 2) {
                pageNumbers.push('...');
            }

            let startPage = Math.max(2, currentPage - halfPagesToShow);
            let endPage = Math.min(totalPages - 1, currentPage + halfPagesToShow);

            if (currentPage <= halfPagesToShow + 1) {
                endPage = maxPagesToShow;
            }

            if (currentPage >= totalPages - halfPagesToShow) {
                startPage = totalPages - maxPagesToShow + 1;
            }

            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }

            if (currentPage < totalPages - halfPagesToShow - 1) {
                pageNumbers.push('...');
            }
            pageNumbers.push(totalPages);
        }
        return pageNumbers;
    };

    const pages = getPageNumbers();

    const baseButtonClasses = `mx-1 px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed`;
    const pageButtonClasses = `${baseButtonClasses} ${theme.input.background} ${theme.text} border ${theme.input.border} hover:bg-gray-100 dark:hover:bg-white/10`;
    const activeButtonClasses = `${baseButtonClasses} ${theme.button.primary.background} ${theme.button.primary.text} border border-transparent`;

    return (
        <nav aria-label="Pagination" className="flex justify-center items-center mt-12">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={pageButtonClasses}
                aria-label="Go to previous page"
            >
                Previous
            </button>
            {pages.map((page, index) =>
                typeof page === 'number' ? (
                    <button
                        key={index}
                        onClick={() => onPageChange(page)}
                        className={page === currentPage ? activeButtonClasses : pageButtonClasses}
                        aria-current={page === currentPage ? 'page' : undefined}
                         aria-label={`Go to page ${page}`}
                    >
                        {page}
                    </button>
                ) : (
                    <span key={index} className={`mx-1 px-4 py-2 text-sm font-semibold ${theme.textMuted}`} aria-hidden="true">
                        {page}
                    </span>
                )
            )}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={pageButtonClasses}
                aria-label="Go to next page"
            >
                Next
            </button>
        </nav>
    );
};

export default Pagination;
