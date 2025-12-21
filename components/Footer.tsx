

import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import ThemeSwitcher from './ThemeSwitcher';

const Footer: React.FC = () => {
  const { theme } = useTheme();
  
  const ACADEMIC_LINKS = [
      { name: 'Admissions', path: '/admissions' },
      { name: 'Departments', path: '/departments' },
      { name: 'Courses', path: '/courses' },
      { name: 'Library', path: '/library' },
  ];

  const CAMPUS_LIFE_LINKS = [
      { name: 'News & Events', path: '/news' },
      { name: 'Student Clubs', path: '/clubs' },
      { name: 'Alumni Network', path: '/alumni' },
      { name: 'Careers', path: '/careers' },
  ];

  return (
    <footer className={`${theme.footer.background} ${theme.footer.text} pt-12 pb-8`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          {/* About Section */}
          <div className="md:col-span-1">
            <h3 className={`text-lg font-semibold ${theme.footer.accent} mb-4`}>CrestOAK College</h3>
            <p className="text-sm">
              CrestOAK College of Health Science, Administration, and Technology. Empowering the next generation of leaders in Lagos, Nigeria.
            </p>
          </div>

          {/* Academic Links Section */}
          <div>
            <h3 className={`text-lg font-semibold ${theme.footer.accent} mb-4`}>Academic</h3>
            <ul className="space-y-2">
              {ACADEMIC_LINKS.map(link => (
                 <li key={link.name}>
                    <Link to={link.path} className={`hover:${theme.footer.accent} transition-colors duration-300 text-sm`}>{link.name}</Link>
                 </li>
              ))}
            </ul>
          </div>

          {/* Campus Life Links Section */}
          <div>
            <h3 className={`text-lg font-semibold ${theme.footer.accent} mb-4`}>Campus Life</h3>
            <ul className="space-y-2">
              {CAMPUS_LIFE_LINKS.map(link => (
                 <li key={link.name}>
                    <Link to={link.path} className={`hover:${theme.footer.accent} transition-colors duration-300 text-sm`}>{link.name}</Link>
                 </li>
              ))}
            </ul>
          </div>

          {/* Contact Info & Theme Section */}
          <div>
            <h3 className={`text-lg font-semibold ${theme.footer.accent} mb-4`}>Contact Us</h3>
            <address className="not-italic text-sm space-y-3">
              <div className="flex items-center justify-center md:justify-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                  <a href="mailto:info.crestoakcollege25@gmail.com" className={`hover:${theme.footer.accent}`}>info.crestoakcollege25@gmail.com</a>
              </div>
            </address>
             <div className="mt-6 flex flex-col items-center md:items-start">
                <ThemeSwitcher />
             </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-700 pt-6 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} CrestOAK College of Health Science, Administration, and Technology. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
