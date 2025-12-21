
import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';

export type ThemeName = 'light' | 'faith' | 'modern' | 'dark';

export interface Theme {
  name: ThemeName;
  background: string;
  text: string;
  textMuted: string;
  accent: string;
  card: {
    background: string;
    text: string;
    textMuted: string;
    shadow: string;
    border: string;
    rounded: string;
    hover: string;
    transition: string;
  };
  header: {
    background: string;
    text: string;
    accent: string;
    ringOffsetColor: string;
  };
  footer: {
    background: string;
    text: string;
    accent: string;
  };
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
      border: string;
    }
  },
  input: {
    background: string;
    text: string;
    border: string;
    focus: string;
    placeholder: string;
  }
}

const lightTheme: Theme = {
  name: 'light',
  background: 'bg-white',
  text: 'text-gray-900',
  textMuted: 'text-gray-600',
  accent: 'text-blue-600',
  card: {
    background: 'bg-gray-50',
    text: 'text-gray-900',
    textMuted: 'text-gray-600',
    shadow: 'shadow-sm',
    border: 'border border-gray-200',
    rounded: 'rounded-xl',
    hover: 'hover:shadow-md hover:-translate-y-1',
    transition: 'transition-all duration-300'
  },
  header: {
    background: 'bg-white/80 backdrop-blur-sm border-b border-gray-200',
    text: 'text-gray-900',
    accent: 'text-blue-600',
    ringOffsetColor: 'ring-offset-white',
  },
  footer: {
    background: 'bg-gray-800',
    text: 'text-gray-200',
    accent: 'text-blue-400',
  },
  button: {
    primary: {
      background: 'bg-blue-600',
      text: 'text-white',
      hover: 'hover:bg-blue-700'
    },
    secondary: {
      background: 'bg-transparent',
      text: 'text-blue-600',
      hover: 'hover:bg-blue-600 hover:text-white',
      border: 'border-2 border-blue-600'
    }
  },
  input: {
    background: 'bg-white',
    text: 'text-gray-900',
    border: 'border-gray-300',
    focus: 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    placeholder: 'placeholder-gray-400'
  }
};

const darkTheme: Theme = {
  name: 'dark',
  background: 'bg-gray-900',
  text: 'text-gray-100',
  textMuted: 'text-gray-400',
  accent: 'text-blue-400',
  card: {
    background: 'bg-gray-800',
    text: 'text-gray-100',
    textMuted: 'text-gray-400',
    shadow: 'shadow-lg',
    border: 'border border-gray-700',
    rounded: 'rounded-xl',
    hover: 'hover:shadow-xl hover:border-gray-600',
    transition: 'transition-all duration-300'
  },
  header: {
    background: 'bg-gray-900/80 backdrop-blur-sm border-b border-gray-700',
    text: 'text-gray-100',
    accent: 'text-blue-400',
    ringOffsetColor: 'ring-offset-gray-900',
  },
  footer: {
    background: 'bg-gray-900',
    text: 'text-gray-300',
    accent: 'text-blue-400',
  },
  button: {
    primary: {
      background: 'bg-blue-600',
      text: 'text-white',
      hover: 'hover:bg-blue-500'
    },
    secondary: {
      background: 'bg-transparent',
      text: 'text-white',
      hover: 'hover:bg-gray-700',
      border: 'border-2 border-white'
    }
  },
  input: {
    background: 'bg-gray-700',
    text: 'text-gray-100',
    border: 'border-gray-600',
    focus: 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    placeholder: 'placeholder-gray-400'
  }
};

const faithTheme: Theme = {
    name: 'faith',
    background: 'bg-gradient-to-br from-blue-700 to-blue-900',
    text: 'text-white',
    textMuted: 'text-blue-200',
    accent: 'text-yellow-400',
    card: {
        background: 'bg-white/10 backdrop-blur-lg',
        text: 'text-white',
        textMuted: 'text-blue-200',
        shadow: 'shadow-2xl',
        border: 'border border-white/20',
        rounded: 'rounded-2xl',
        hover: 'hover:shadow-xl hover:border-white/30 hover:bg-white/20',
        transition: 'transition-all duration-300'
    },
    header: {
        background: 'bg-blue-900/50 backdrop-blur-sm border-b border-white/10',
        text: 'text-white',
        accent: 'text-yellow-400',
        ringOffsetColor: 'ring-offset-blue-900',
    },
    footer: {
        background: 'bg-transparent',
        text: 'text-blue-100',
        accent: 'text-yellow-400',
    },
    button: {
        primary: {
            background: 'bg-yellow-400',
            text: 'text-blue-900',
            hover: 'hover:bg-yellow-300'
        },
        secondary: {
            background: 'bg-transparent',
            text: 'text-white',
            hover: 'hover:bg-white/20',
            border: 'border-2 border-white'
        }
    },
    input: {
        background: 'bg-white/10',
        text: 'text-white',
        border: 'border-white/50',
        focus: 'focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400',
        placeholder: 'placeholder-blue-300'
    }
};

const modernMinimalTheme: Theme = {
    name: 'modern',
    background: 'bg-neutral-100',
    text: 'text-neutral-800',
    textMuted: 'text-neutral-500',
    accent: 'text-cyan-600',
    card: {
        background: 'bg-white',
        text: 'text-neutral-800',
        textMuted: 'text-neutral-500',
        shadow: 'shadow-md',
        border: '',
        rounded: 'rounded-xl',
        hover: 'hover:shadow-lg',
        transition: 'transition-all duration-300'
    },
    header: {
        background: 'bg-white/70 backdrop-blur-sm border-b border-neutral-200',
        text: 'text-neutral-800',
        accent: 'text-cyan-600',
        ringOffsetColor: 'ring-offset-white',
    },
    footer: {
        background: 'bg-neutral-900',
        text: 'text-neutral-300',
        accent: 'text-cyan-400',
    },
    button: {
        primary: {
            background: 'bg-cyan-600',
            text: 'text-white',
            hover: 'hover:bg-cyan-700'
        },
        secondary: {
            background: 'bg-transparent',
            text: 'text-cyan-600',
            hover: 'hover:bg-cyan-600 hover:text-white',
            border: 'border-2 border-cyan-600'
        }
    },
    input: {
        background: 'bg-white',
        text: 'text-neutral-800',
        border: 'border-neutral-300',
        focus: 'focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500',
        placeholder: 'placeholder-neutral-400'
    }
};


const themes: Record<ThemeName, Theme> = {
  light: lightTheme,
  dark: darkTheme,
  faith: faithTheme,
  modern: modernMinimalTheme,
};

interface ThemeContextType {
  theme: Theme;
  switchTheme: (name: ThemeName) => void;
  isReaderMode: boolean;
  toggleReaderMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'crestoak_theme';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && ['light', 'dark', 'faith', 'modern'].includes(savedTheme)) {
            return savedTheme as ThemeName;
        }
    }
    return 'light';
  });
  
  const [isReaderMode, setIsReaderMode] = useState(false);

  const switchTheme = (name: ThemeName) => {
    setThemeName(name);
    localStorage.setItem(THEME_STORAGE_KEY, name);
  };

  const toggleReaderMode = () => {
    setIsReaderMode(prev => !prev);
  }
  
  const theme = useMemo(() => themes[themeName], [themeName]);

  return (
    <ThemeContext.Provider value={{ theme, switchTheme, isReaderMode, toggleReaderMode }}>
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
