import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';

const Footer: React.FC = () => {
    const { theme } = useTheme();
    const currentYear = new Date().getFullYear();

    return (
        <footer className={`${theme.card.background} ${theme.card.border} border-t mt-auto`}>
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* About Section */}
                    <div>
                        <h3 className={`text-lg font-bold ${theme.text} mb-4`}>CrestOAK College</h3>
                        <p className={`${theme.text} opacity-75 text-sm`}>
                            Empowering minds, shaping futures. Excellence in education since 1985.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className={`font-semibold ${theme.text} mb-4`}>Quick Links</h4>
                        <ul className="space-y-2">
                            <li><Link to="/about" className={`${theme.text} opacity-75 hover:opacity-100 text-sm`}>About Us</Link></li>
                            <li><Link to="/departments" className={`${theme.text} opacity-75 hover:opacity-100 text-sm`}>Departments</Link></li>
                            <li><Link to="/admissions" className={`${theme.text} opacity-75 hover:opacity-100 text-sm`}>Admissions</Link></li>
                            <li><Link to="/careers" className={`${theme.text} opacity-75 hover:opacity-100 text-sm`}>Careers</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className={`font-semibold ${theme.text} mb-4`}>Resources</h4>
                        <ul className="space-y-2">
                            <li><Link to="/library" className={`${theme.text} opacity-75 hover:opacity-100 text-sm`}>Library</Link></li>
                            <li><Link to="/e-learning" className={`${theme.text} opacity-75 hover:opacity-100 text-sm`}>E-Learning</Link></li>
                            <li><Link to="/portal" className={`${theme.text} opacity-75 hover:opacity-100 text-sm`}>Student Portal</Link></li>
                            <li><Link to="/blog" className={`${theme.text} opacity-75 hover:opacity-100 text-sm`}>Blog</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className={`font-semibold ${theme.text} mb-4`}>Contact</h4>
                        <ul className="space-y-2 text-sm">
                            <li className={`${theme.text} opacity-75`}>123 Education Street</li>
                            <li className={`${theme.text} opacity-75`}>Academic City, AC 12345</li>
                            <li className={`${theme.text} opacity-75`}>Phone: (555) 123-4567</li>
                            <li className={`${theme.text} opacity-75`}>Email: info@crestoak.edu</li>
                        </ul>
                    </div>
                </div>

                <div className={`mt-8 pt-8 border-t ${theme.card.border} text-center`}>
                    <p className={`${theme.text} opacity-75 text-sm`}>
                        © {currentYear} CrestOAK College. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
