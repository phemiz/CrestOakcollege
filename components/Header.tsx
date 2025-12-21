
import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { NAV_LINKS, COMMUNITY_SUB_LINKS, NEWS_AND_EVENTS_SUB_LINKS, ACADEMICS_SUB_LINKS } from '../constants';
import { useTheme } from '../hooks/useTheme';
import SiteSearch from './SiteSearch';
import { getCurrentStudent } from '../hooks/useApi';

const Logo: React.FC = () => {
  const { theme } = useTheme();
  return (
      <Link to="/" className="flex items-center space-x-2">
        <svg className={`w-10 h-10 ${theme.header.accent}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="logoTitle">
          <title id="logoTitle">CrestOAK College Logo</title>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422A12.083 12.083 0 0112 21a12.083 12.083 0 01-6.16-10.422L12 14z"></path>
        </svg>
        <span className={`text-xl font-bold ${theme.header.text} tracking-tight`}>CrestOAK College</span>
      </Link>
  );
};

const DesktopNav: React.FC<{ isStudent: boolean; }> = ({ isStudent }) => {
    const { theme } = useTheme();
    const ringColorClass = theme.header.accent.replace(/text-(.+?)(?=\s|$)/, `ring-$1`);
    
    const [isAcademicsMenuOpen, setIsAcademicsMenuOpen] = useState(false);
    const academicsRef = useRef<HTMLDivElement>(null);
    
    const [isCommunityMenuOpen, setIsCommunityMenuOpen] = useState(false);
    const communityRef = useRef<HTMLDivElement>(null);
    
    const [isNewsMenuOpen, setIsNewsMenuOpen] = useState(false);
    const newsRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isAcademicsMenuOpen) {
                setIsAcademicsMenuOpen(false);
                const trigger = academicsRef.current?.querySelector('button');
                trigger?.focus();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isAcademicsMenuOpen]);
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isCommunityMenuOpen) {
                setIsCommunityMenuOpen(false);
                const trigger = communityRef.current?.querySelector('button');
                trigger?.focus();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isCommunityMenuOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isNewsMenuOpen) {
                setIsNewsMenuOpen(false);
                const trigger = newsRef.current?.querySelector('button');
                trigger?.focus();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isNewsMenuOpen]);

    const linkBaseClasses = `${theme.header.text} hover:${theme.header.accent} transition-all duration-300 font-medium p-1 rounded-sm ${theme.header.ringOffsetColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:${ringColorClass} active:scale-95 transform`;

    return (
        <nav className="hidden md:flex items-center space-x-1">
            {NAV_LINKS.map((link) => {
                if (link.name === 'Academics') {
                    return (
                        <div
                            key={link.name}
                            className="relative"
                            ref={academicsRef}
                            onMouseEnter={() => setIsAcademicsMenuOpen(true)}
                            onMouseLeave={() => setIsAcademicsMenuOpen(false)}
                            onFocus={() => setIsAcademicsMenuOpen(true)}
                            onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsAcademicsMenuOpen(false); }}
                        >
                            <button
                                aria-haspopup="true"
                                aria-expanded={isAcademicsMenuOpen}
                                className={`${linkBaseClasses} px-3 py-2 ${isAcademicsMenuOpen ? theme.header.accent : ''}`}
                            >
                                {link.name}
                            </button>
                            <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-all duration-300 ${isAcademicsMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                                <div className={`${theme.card.background} rounded-xl shadow-2xl border ${theme.card.border} p-2 w-64`}>
                                    <ul className="space-y-1">
                                        {ACADEMICS_SUB_LINKS.map(subLink => (
                                            <li key={subLink.name}>
                                                <Link 
                                                    to={subLink.path} 
                                                    onClick={() => setIsAcademicsMenuOpen(false)} 
                                                    className={`block p-3 rounded-lg text-sm group ${theme.text} hover:bg-gray-100 dark:hover:bg-white/10`}
                                                >
                                                    <span className="font-semibold block">{subLink.name}</span>
                                                    <span className={`text-xs ${theme.textMuted}`}>{subLink.description}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    );
                }

                if (link.name === 'News & Events') {
                    return (
                        <div
                            key={link.name}
                            className="relative"
                            ref={newsRef}
                            onMouseEnter={() => setIsNewsMenuOpen(true)}
                            onMouseLeave={() => setIsNewsMenuOpen(false)}
                            onFocus={() => setIsNewsMenuOpen(true)}
                            onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsNewsMenuOpen(false); }}
                        >
                            <button
                                aria-haspopup="true"
                                aria-expanded={isNewsMenuOpen}
                                className={`${linkBaseClasses} px-3 py-2 ${isNewsMenuOpen ? theme.header.accent : ''}`}
                            >
                                {link.name}
                            </button>
                            <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-all duration-300 ${isNewsMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                                <div className={`${theme.card.background} rounded-xl shadow-2xl border ${theme.card.border} p-2 w-64`}>
                                    <ul className="space-y-1">
                                        {NEWS_AND_EVENTS_SUB_LINKS.map(subLink => (
                                            <li key={subLink.name}>
                                                <Link 
                                                    to={subLink.path} 
                                                    onClick={() => setIsNewsMenuOpen(false)} 
                                                    className={`block p-3 rounded-lg text-sm group ${theme.text} hover:bg-gray-100 dark:hover:bg-white/10`}
                                                >
                                                    <span className="font-semibold block">{subLink.name}</span>
                                                    <span className={`text-xs ${theme.textMuted}`}>{subLink.description}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    );
                }

                if (link.name === 'Community') {
                    return (
                        <div
                            key={link.name}
                            className="relative"
                            ref={communityRef}
                            onMouseEnter={() => setIsCommunityMenuOpen(true)}
                            onMouseLeave={() => setIsCommunityMenuOpen(false)}
                            onFocus={() => setIsCommunityMenuOpen(true)}
                            onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsCommunityMenuOpen(false); }}
                        >
                            <button
                                aria-haspopup="true"
                                aria-expanded={isCommunityMenuOpen}
                                className={`${linkBaseClasses} px-3 py-2 ${isCommunityMenuOpen ? theme.header.accent : ''}`}
                            >
                                {link.name}
                            </button>
                            <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-all duration-300 ${isCommunityMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                                <div className={`${theme.card.background} rounded-xl shadow-2xl border ${theme.card.border} p-2 w-64`}>
                                    <ul className="space-y-1">
                                        {COMMUNITY_SUB_LINKS.map(subLink => (
                                            <li key={subLink.name}>
                                                <Link 
                                                    to={subLink.path} 
                                                    onClick={() => setIsCommunityMenuOpen(false)} 
                                                    className={`block p-3 rounded-lg text-sm group ${theme.text} hover:bg-gray-100 dark:hover:bg-white/10`}
                                                >
                                                    <span className="font-semibold block">{subLink.name}</span>
                                                    <span className={`text-xs ${theme.textMuted}`}>{subLink.description}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    );
                }
                
                if (link.name === 'Portals') {
                    if (isStudent) {
                        return (
                            <NavLink key="student-hub" to="/student-dashboard" className={({ isActive }) => `${linkBaseClasses} px-3 py-2 ${isActive ? theme.header.accent : ''}`}>
                                Student Hub
                            </NavLink>
                        );
                    }
                    // For guests or staff
                    return (
                        <NavLink key={link.name} to={link.path} className={({ isActive }) => `${linkBaseClasses} px-3 py-2 ${isActive ? theme.header.accent : ''}`}>
                            {link.name}
                        </NavLink>
                    );
                }

                // Default case for regular links
                return (
                    <NavLink key={link.name} to={link.path} className={({ isActive }) => `${linkBaseClasses} px-3 py-2 ${isActive ? theme.header.accent : ''}`}>
                        {link.name}
                    </NavLink>
                );
            })}
        </nav>
    );
};

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

const MobileNav: React.FC<{ isOpen: boolean; setIsOpen: React.Dispatch<React.SetStateAction<boolean>>; isStudent: boolean; }> = ({ isOpen, setIsOpen, isStudent }) => {
    const { theme } = useTheme();
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const ringColorClass = theme.header.accent.replace(/text-(.+?)(?=\s|$)/, `ring-$1`);

    const [openAccordion, setOpenAccordion] = useState<string | null>(null);

    const toggleAccordion = (name: string) => {
        setOpenAccordion(prev => (prev === name ? null : name));
    };

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => { closeButtonRef.current?.focus(); }, 100);
            return () => clearTimeout(timer);
        } else {
            // Reset accordion when menu is closed
            setOpenAccordion(null);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const menuNode = menuRef.current;
        if (!menuNode) return;

        const focusableElements = menuNode.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;
            if (e.shiftKey) { // Shift+Tab
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else { // Tab
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);
    
    const mainLinkClasses = `text-2xl ${theme.header.text} hover:${theme.header.accent} transition-all duration-300 font-semibold p-2 rounded-md ${theme.header.ringOffsetColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:${ringColorClass} active:scale-95 transform`;
    const accordionButtonClasses = `${mainLinkClasses} w-full flex items-center justify-center`;
    const subLinkClasses = `block text-xl ${theme.header.text} hover:${theme.header.accent} transition-colors duration-200 py-2`;


    return (
        <div id="mobile-nav" ref={menuRef} className={`absolute top-0 left-0 h-screen w-full ${theme.header.background} transform ${isOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out md:hidden z-50 flex flex-col`}>
            <div className="flex justify-end p-4 flex-shrink-0">
                <button ref={closeButtonRef} onClick={() => setIsOpen(false)} aria-label="Close menu">
                    <svg className={`h-8 w-8 ${theme.header.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            <nav className="flex flex-col items-center flex-1 space-y-4 overflow-y-auto pt-4 pb-8 px-4">
                {NAV_LINKS.map((link) => {
                    if (link.name === 'Academics') {
                        const isAccordionOpen = openAccordion === link.name;
                        return (
                            <div key={link.name} className="w-full text-center">
                                <button onClick={() => toggleAccordion(link.name)} aria-expanded={isAccordionOpen} className={accordionButtonClasses}>
                                    <span>{link.name}</span>
                                    <ChevronDownIcon className={`w-5 h-5 ml-2 transform transition-transform duration-300 ${isAccordionOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isAccordionOpen && (
                                    <div className="mt-2 space-y-2 bg-black/5 dark:bg-white/5 py-2 rounded-lg">
                                        {ACADEMICS_SUB_LINKS.map(subLink => (
                                            <NavLink key={subLink.name} to={subLink.path} onClick={() => setIsOpen(false)} className={subLinkClasses}>
                                                {subLink.name}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    }
                    if (link.name === 'News & Events') {
                        const isAccordionOpen = openAccordion === link.name;
                        return (
                            <div key={link.name} className="w-full text-center">
                                <button onClick={() => toggleAccordion(link.name)} aria-expanded={isAccordionOpen} className={accordionButtonClasses}>
                                    <span>{link.name}</span>
                                    <ChevronDownIcon className={`w-5 h-5 ml-2 transform transition-transform duration-300 ${isAccordionOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isAccordionOpen && (
                                    <div className="mt-2 space-y-2 bg-black/5 dark:bg-white/5 py-2 rounded-lg">
                                        {NEWS_AND_EVENTS_SUB_LINKS.map(subLink => (
                                            <NavLink key={subLink.name} to={subLink.path} onClick={() => setIsOpen(false)} className={subLinkClasses}>
                                                {subLink.name}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    }
                    if (link.name === 'Community') {
                         const isAccordionOpen = openAccordion === link.name;
                         return (
                            <div key={link.name} className="w-full text-center">
                                <button onClick={() => toggleAccordion(link.name)} aria-expanded={isAccordionOpen} className={accordionButtonClasses}>
                                    <span>{link.name}</span>
                                    <ChevronDownIcon className={`w-5 h-5 ml-2 transform transition-transform duration-300 ${isAccordionOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isAccordionOpen && (
                                    <div className="mt-2 space-y-2 bg-black/5 dark:bg-white/5 py-2 rounded-lg">
                                        {COMMUNITY_SUB_LINKS.map(subLink => (
                                            <NavLink key={subLink.name} to={subLink.path} onClick={() => setIsOpen(false)} className={subLinkClasses}>
                                                {subLink.name}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    }
                    if (link.name === 'Portals') {
                        return isStudent ? (
                            <NavLink key="student-hub" to="/student-dashboard" onClick={() => setIsOpen(false)} className={({ isActive }) => `${mainLinkClasses} ${isActive ? theme.header.accent : ''}`}>
                                Student Hub
                            </NavLink>
                        ) : (
                             <NavLink key={link.name} to={link.path} onClick={() => setIsOpen(false)} className={({ isActive }) => `${mainLinkClasses} ${isActive ? theme.header.accent : ''}`}>
                                {link.name}
                            </NavLink>
                        );
                    }

                    return (
                        <NavLink key={link.name} to={link.path} onClick={() => setIsOpen(false)} className={({ isActive }) => `${mainLinkClasses} ${isActive ? theme.header.accent : ''}`}>
                            {link.name}
                        </NavLink>
                    );
                })}

                <Link to="/apply" onClick={() => setIsOpen(false)} className={`mt-8 ${theme.button.secondary.background} ${theme.button.secondary.text} ${theme.button.secondary.border} font-bold py-3 px-8 rounded-full ${theme.button.secondary.hover} transition-colors duration-300`}>
                    Apply Now
                </Link>
            </nav>
        </div>
    );
};


const Header: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { theme } = useTheme();
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const wasOpen = useRef(false);
    
    const isStudent = !!getCurrentStudent();

    useEffect(() => {
        if (wasOpen.current && !isOpen) {
            menuButtonRef.current?.focus();
        }
        wasOpen.current = isOpen;
    }, [isOpen]);

    return (
        <>
        <header className={`${theme.header.background} shadow-lg sticky top-0 z-50`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
                <Logo />
                <DesktopNav isStudent={isStudent} />
                <div className="hidden md:flex items-center space-x-4">
                <button
                    onClick={() => setIsSearchOpen(true)}
                    aria-label="Open search"
                    className={`p-2 rounded-full ${theme.header.text} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </button>
                <Link to="/apply" className={`${theme.button.secondary.background} ${theme.button.secondary.text} ${theme.button.secondary.border} font-bold py-3 px-8 rounded-full ${theme.button.secondary.hover} transition-colors duration-300`}>
                    Apply Now
                </Link>
                </div>
                <div className="md:hidden flex items-center gap-4">
                <button
                    onClick={() => setIsSearchOpen(true)}
                    aria-label="Open search"
                    className={`p-2 rounded-full ${theme.header.text} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
                <button ref={menuButtonRef} onClick={() => setIsOpen(!isOpen)} aria-label="Open menu" aria-expanded={isOpen} aria-controls="mobile-nav" className={`h-8 w-8 flex items-center justify-center ${theme.header.text}`}>
                    <div className="flex flex-col items-center justify-center space-y-1.5">
                        <span className={`block w-6 h-0.5 bg-current transform transition duration-300 ease-in-out ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                        <span className={`block w-6 h-0.5 bg-current transition duration-300 ease-in-out ${isOpen ? 'opacity-0' : ''}`}></span>
                        <span className={`block w-6 h-0.5 bg-current transform transition duration-300 ease-in-out ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                    </div>
                </button>
                </div>
            </div>
            </div>
            <MobileNav isOpen={isOpen} setIsOpen={setIsOpen} isStudent={isStudent} />
        </header>
        <SiteSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
};

export default Header;
