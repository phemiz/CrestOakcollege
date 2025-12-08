import React from 'react';
import { useTheme } from '../hooks/useTheme';

const ELearningPage: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <h1 className={`text-4xl font-bold ${theme.text} mb-8`}></h1>
        <p className={`text-lg ${theme.text} opacity-75`}>
          Welcome to the  page. Content coming soon.
        </p>
      </div>
    </div>
  );
};

export default ELearningPage;
