
import React, { ReactNode } from 'react';
import { useTheme } from '../hooks/useTheme';

interface PageWrapperProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  bgClass?: string;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ title, subtitle, children, bgClass }) => {
  const { theme } = useTheme();

  // For light theme, page sections have distinct backgrounds. For others, they use the card background.
  const effectiveBgClass = bgClass ?? (theme.name === 'light' ? 'bg-white' : theme.card.background);

  return (
    <div className={`${effectiveBgClass} py-8 sm:py-12`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-extrabold ${theme.text} sm:text-5xl lg:text-6xl tracking-tight`}>{title}</h1>
          {subtitle && <p className={`mt-4 max-w-2xl mx-auto text-lg ${theme.textMuted}`}>{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
};

export default PageWrapper;