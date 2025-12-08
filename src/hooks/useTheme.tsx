import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Theme {
    name: 'light' | 'dark' | 'modern' | 'faith';
    background: string;
    text: string;
    primary: string;
    secondary: string;
    accent: string;
    button: {
        primary: {
            background: string;
            text: string;
            hover: string;
        };
        secondary: {
            background: string;
            text: string;
            hover: string;
        };
    };
    card: {
        background: string;
        border: string;
    };
}

const themes: Record<string, Theme> = {
    light: {
        name: 'light',
        background: 'bg-white',
        text: 'text-gray-900',
        primary: 'text-blue-600',
        secondary: 'text-purple-600',
        accent: 'text-amber-500',
        button: {
            primary: {
                background: 'bg-blue-600',
                text: 'text-white',
                hover: 'hover:bg-blue-700',
            },
            secondary: {
                background: 'bg-purple-600',
                text: 'text-white',
                hover: 'hover:bg-purple-700',
            },
        },
        card: {
            background: 'bg-white',
            border: 'border-gray-200',
        },
    },
    dark: {
        name: 'dark',
        background: 'bg-gray-900',
        text: 'text-gray-100',
        primary: 'text-blue-400',
        secondary: 'text-purple-400',
        accent: 'text-amber-400',
        button: {
            primary: {
                background: 'bg-blue-600',
                text: 'text-white',
                hover: 'hover:bg-blue-700',
            },
            secondary: {
                background: 'bg-purple-600',
                text: 'text-white',
                hover: 'hover:bg-purple-700',
            },
        },
        card: {
            background: 'bg-gray-800',
            border: 'border-gray-700',
        },
    },
    modern: {
        name: 'modern',
        background: 'bg-gradient-to-br from-blue-50 to-purple-50',
        text: 'text-gray-900',
        primary: 'text-blue-600',
        secondary: 'text-purple-600',
        accent: 'text-amber-500',
        button: {
            primary: {
                background: 'bg-gradient-to-r from-blue-600 to-purple-600',
                text: 'text-white',
                hover: 'hover:from-blue-700 hover:to-purple-700',
            },
            secondary: {
                background: 'bg-gradient-to-r from-purple-600 to-pink-600',
                text: 'text-white',
                hover: 'hover:from-purple-700 hover:to-pink-700',
            },
        },
        card: {
            background: 'bg-white/80 backdrop-blur-sm',
            border: 'border-white/20',
        },
    },
    faith: {
        name: 'faith',
        background: 'bg-gradient-to-br from-indigo-900 to-purple-900',
        text: 'text-gray-100',
        primary: 'text-amber-400',
        secondary: 'text-purple-300',
        accent: 'text-amber-300',
        button: {
            primary: {
                background: 'bg-amber-500',
                text: 'text-gray-900',
                hover: 'hover:bg-amber-600',
            },
            secondary: {
                background: 'bg-purple-600',
                text: 'text-white',
                hover: 'hover:bg-purple-700',
            },
        },
        card: {
            background: 'bg-white/10 backdrop-blur-md',
            border: 'border-white/20',
        },
    },
};

interface ThemeContextType {
    theme: Theme;
    themeName: string;
    setThemeName: (name: string) => void;
    isReaderMode: boolean;
    toggleReaderMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [themeName, setThemeName] = useState<string>(() => {
        return localStorage.getItem('theme') || 'light';
    });
    const [isReaderMode, setIsReaderMode] = useState<boolean>(() => {
        return localStorage.getItem('readerMode') === 'true';
    });

    useEffect(() => {
        localStorage.setItem('theme', themeName);
    }, [themeName]);

    useEffect(() => {
        localStorage.setItem('readerMode', String(isReaderMode));
    }, [isReaderMode]);

    const toggleReaderMode = () => {
        setIsReaderMode(prev => !prev);
    };

    const theme = themes[themeName] || themes.light;

    return (
        <ThemeContext.Provider value={{ theme, themeName, setThemeName, isReaderMode, toggleReaderMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
