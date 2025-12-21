import React from 'react';
import { useTheme, ThemeName } from '../hooks/useTheme';

const THEME_OPTIONS: {
  name: ThemeName;
  label: string;
  preview: {
    base: string;
    accent: string;
  };
}[] = [
  { name: 'light', label: 'Classic', preview: { base: 'bg-white border border-gray-300', accent: 'bg-blue-600' } },
  { name: 'dark', label: 'Dark', preview: { base: 'bg-gray-700', accent: 'bg-blue-400' } },
  { name: 'faith', label: 'Faith', preview: { base: 'bg-blue-800 border border-blue-400', accent: 'bg-yellow-400' } },
  { name: 'modern', label: 'Modern', preview: { base: 'bg-neutral-200', accent: 'bg-cyan-600' } },
];

const ThemeSwitcher: React.FC = () => {
    const { theme, switchTheme } = useTheme();

    // Safely transform text color utility to ring color utility
    const ringColorClass = theme.footer.accent.replace(/text-(.+?)(?=\s|$)/, 'ring-$1');

    return (
        <div>
            <h3 className={`text-lg font-semibold ${theme.footer.accent} mb-4`}>Switch Theme</h3>
            <div className="grid grid-cols-4 gap-x-3 gap-y-2">
                {THEME_OPTIONS.map(option => (
                    <div key={option.name} className="flex flex-col items-center">
                        <button
                            onClick={() => switchTheme(option.name)}
                            aria-pressed={theme.name === option.name}
                            aria-label={`Switch to ${option.label} theme`}
                            className={`w-10 h-10 rounded-full p-1 transition-all duration-200 ring-offset-2 ${theme.footer.background} focus:outline-none focus:ring-2 focus:${ringColorClass} ${
                                theme.name === option.name
                                ? `ring-2 ${ringColorClass}`
                                : `ring-0 hover:ring-2 hover:${ringColorClass}`
                            }`}
                        >
                            <div
                                className={`w-full h-full rounded-full flex items-center justify-center ${option.preview.base}`}
                                aria-hidden="true"
                            >
                                <div className={`w-4 h-4 rounded-full ${option.preview.accent}`}></div>
                            </div>
                        </button>
                        <span className={`mt-2 text-xs font-medium ${theme.footer.text}`}>{option.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ThemeSwitcher;