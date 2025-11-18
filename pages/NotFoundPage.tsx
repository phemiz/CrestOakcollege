
import React from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { useTheme } from '../hooks/useTheme';

const NotFoundPage: React.FC = () => {
  const { theme } = useTheme();
  return (
    <PageWrapper title="404 - Page Not Found">
      <div className="text-center">
        <p className={`text-lg ${theme.textMuted} mb-8`}>
          Oops! The page you are looking for does not exist. It might have been moved or deleted.
        </p>
        <Link 
          to="/" 
          className={`inline-block ${theme.button.primary.background} ${theme.button.primary.text} font-bold py-3 px-8 rounded-full text-lg ${theme.button.primary.hover} transition-colors duration-300`}
        >
          Go Back to Home
        </Link>
      </div>
    </PageWrapper>
  );
};

export default NotFoundPage;
