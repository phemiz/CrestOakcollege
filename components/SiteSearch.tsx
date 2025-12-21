
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSiteSearch } from '../hooks/useSiteSearch';
import { useTheme } from '../hooks/useTheme';
import { SearchResultItem } from '../types';

interface SiteSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

const SiteSearch: React.FC<SiteSearchProps> = ({ isOpen, onClose }) => {
    const { query, setQuery, results, isLoading } = useSiteSearch();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);
    const [activeIndex, setActiveIndex] = useState(-1);

    const allResults: SearchResultItem[] = useMemo(() => {
        if (!results) return [];
        return [...results.pages, ...results.departments, ...(results.blog || []), ...results.courses];
    }, [results]);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        } else {
            setQuery('');
        }
    }, [isOpen, setQuery]);
    
    useEffect(() => {
        setActiveIndex(-1); // Reset index when query changes
    }, [query]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            onClose();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev < allResults.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault();
            const selectedItem = allResults[activeIndex];
            if (selectedItem) {
                navigate(selectedItem.path);
                onClose();
            }
        }
    };
    
    const handleClose = () => {
        setQuery('');
        onClose();
    };

    if (!isOpen) return null;

    const ResultItem: React.FC<{item: SearchResultItem; index: number}> = ({ item, index }) => (
        <li
            id={`search-result-${index}`}
            role="option"
            aria-selected={activeIndex === index}
            className={`${activeIndex === index ? (theme.name === 'light' ? 'bg-gray-100' : 'bg-white/10') : ''} rounded-lg mx-2`}
        >
            <Link to={item.path} onClick={handleClose} 
                    className="block p-4 transition-colors duration-200">
                <p className={`${theme.text} font-semibold`}>{item.title}</p>
                <p className={`${theme.textMuted} text-sm line-clamp-1`}>{item.description}</p>
            </Link>
        </li>
    );

    const hasResults = !isLoading && query && allResults.length > 0;
    
    let currentIndex = 0;

    return (
        <div className="fixed inset-0 z-50 bg-gray-800/70 backdrop-blur-sm" onClick={handleClose} role="dialog" aria-modal="true" aria-label="Site Search">
            <div className={`relative w-full max-w-2xl mx-auto mt-[10vh] rounded-xl shadow-2xl ${theme.card.background}`} onClick={e => e.stopPropagation()}>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${theme.textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input
                        ref={inputRef}
                        type="search"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search for courses, departments, pages..."
                        className={`w-full py-4 pl-12 pr-4 text-lg border-0 rounded-t-xl focus:ring-0 ${theme.input.background} ${theme.text} ${theme.input.placeholder}`}
                        role="combobox"
                        aria-expanded={hasResults}
                        aria-controls="search-results-listbox"
                        aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined}
                    />
                </div>
                <div id="search-results-listbox" role="listbox" className={`border-t ${theme.input.border} max-h-[60vh] overflow-y-auto`}>
                    {isLoading && query && <p className={`p-6 text-center ${theme.textMuted}`}>Searching...</p>}
                    
                    {hasResults ? (
                        <ul className="py-2">
                           {results.pages.length > 0 && (
                                <li role="presentation" className={`text-xs font-semibold uppercase ${theme.textMuted} px-4 pt-2 pb-1`}>Pages</li>
                           )}
                           {results.pages.map(item => <ResultItem key={`page-${item.id}`} item={item} index={currentIndex++} />)}
                           
                           {results.blog && results.blog.length > 0 && (
                                <li role="presentation" className={`text-xs font-semibold uppercase ${theme.textMuted} px-4 pt-4 pb-1`}>Blog</li>
                           )}
                           {results.blog?.map(item => <ResultItem key={`blog-${item.id}`} item={item} index={currentIndex++} />)}

                           {results.departments.length > 0 && (
                                <li role="presentation" className={`text-xs font-semibold uppercase ${theme.textMuted} px-4 pt-4 pb-1`}>Departments</li>
                           )}
                           {results.departments.map(item => <ResultItem key={`dept-${item.id}`} item={item} index={currentIndex++} />)}

                           {results.courses.length > 0 && (
                                <li role="presentation" className={`text-xs font-semibold uppercase ${theme.textMuted} px-4 pt-4 pb-1`}>Courses</li>
                           )}
                           {results.courses.map(item => <ResultItem key={`course-${item.id}`} item={item} index={currentIndex++} />)}
                        </ul>
                    ) : (
                        query && !isLoading && <p className={`p-6 text-center ${theme.textMuted}`}>No results found for "{query}".</p>
                    )}

                    {!query && <p className={`p-6 text-center ${theme.textMuted}`}>Start typing to search the site.</p>}
                </div>
            </div>
        </div>
    );
};

export default SiteSearch;
