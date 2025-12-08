import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';

const Header: React.FC = () => {
    const { theme, themeName, setThemeName } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigation = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Departments', path: '/departments' },
        { name: 'Courses', path: '/courses' },
        { name: 'Admissions', path: '/admissions' },
        { name: 'News', path: '/news' },
        { name: 'Contact', path: '/contact' },
    ];

    return (
        <header className={`sticky top-0 z-50 ${theme.card.background} ${theme.card.border} border-b shadow-md`}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-full ${theme.button.primary.background} flex items-center justify-center`}>
                            <span className="text-white font-bold text-xl">C</span>
                        </div>
                        <span className={`text-xl font-bold ${theme.text}`}>CrestOAK College</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`${theme.text} hover:${theme.primary} transition-colors font-medium`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Theme Switcher & Mobile Menu Button */}
                    <div className="flex items-center gap-4">
                        <select
                            value={themeName}
                            onChange={(e) => setThemeName(e.target.value)}
                            className={`px-3 py-2 rounded-lg ${theme.card.background} ${theme.text} border ${theme.card.border}`}
                        >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="modern">Modern</option>
                            <option value="faith">Faith</option>
                        </select>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className={`md:hidden p-2 rounded-lg ${theme.button.primary.background} ${theme.button.primary.text}`}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <nav className="md:hidden py-4 border-t ${theme.card.border}">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`block py-2 ${theme.text} hover:${theme.primary} transition-colors`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                )}
            </div>
        </header>
    );
};

export default Header;
