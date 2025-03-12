// src/context/ThemeContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';

// Define los tipos de temas disponibles
//type ThemeType = 'light' | 'dark';
type ColorScheme = 'purple' | 'blue' | 'green' | 'amber';

type ThemeContextType = {
  darkMode: boolean;
  colorScheme: ColorScheme;
  toggleDarkMode: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
  themeColors: {
    primary: string;
    secondary: string;
    gradient: string;
    hover: string;
    ring: string;
  };
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Inicializa con la preferencia del sistema o del localStorage para el modo
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Inicializa el esquema de color (por defecto: púrpura)
  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => {
    const savedColorScheme = localStorage.getItem('colorScheme');
    return (savedColorScheme as ColorScheme) || 'purple';
  });

  // Colores para cada esquema según el modo claro/oscuro
  const getThemeColors = () => {
    const themes = {
      purple: {
        light: {
          primary: 'from-indigo-600 to-purple-600',
          secondary: 'text-indigo-600',
          gradient: 'bg-gradient-to-r from-indigo-600 to-purple-600',
          hover: 'hover:from-indigo-700 hover:to-purple-700',
          ring: 'ring-indigo-500',
        },
        dark: {
          primary: 'from-violet-600 to-fuchsia-600',
          secondary: 'text-violet-400',
          gradient: 'bg-gradient-to-r from-violet-600 to-fuchsia-600',
          hover: 'hover:from-violet-700 hover:to-fuchsia-700',
          ring: 'ring-violet-500',
        },
      },
      blue: {
        light: {
          primary: 'from-blue-500 to-cyan-500',
          secondary: 'text-blue-600',
          gradient: 'bg-gradient-to-r from-blue-500 to-cyan-500',
          hover: 'hover:from-blue-600 hover:to-cyan-600',
          ring: 'ring-blue-500',
        },
        dark: {
          primary: 'from-blue-600 to-cyan-600',
          secondary: 'text-blue-400',
          gradient: 'bg-gradient-to-r from-blue-600 to-cyan-600',
          hover: 'hover:from-blue-700 hover:to-cyan-700',
          ring: 'ring-blue-500',
        },
      },
      green: {
        light: {
          primary: 'from-emerald-500 to-teal-500',
          secondary: 'text-emerald-600',
          gradient: 'bg-gradient-to-r from-emerald-500 to-teal-500',
          hover: 'hover:from-emerald-600 hover:to-teal-600',
          ring: 'ring-emerald-500',
        },
        dark: {
          primary: 'from-emerald-600 to-teal-600',
          secondary: 'text-emerald-400',
          gradient: 'bg-gradient-to-r from-emerald-600 to-teal-600',
          hover: 'hover:from-emerald-700 hover:to-teal-700',
          ring: 'ring-emerald-500',
        },
      },
      amber: {
        light: {
          primary: 'from-amber-500 to-red-500',
          secondary: 'text-amber-600',
          gradient: 'bg-gradient-to-r from-amber-500 to-red-500',
          hover: 'hover:from-amber-600 hover:to-red-600',
          ring: 'ring-amber-500',
        },
        dark: {
          primary: 'from-amber-600 to-red-600',
          secondary: 'text-amber-400',
          gradient: 'bg-gradient-to-r from-amber-600 to-red-600',
          hover: 'hover:from-amber-700 hover:to-red-700',
          ring: 'ring-amber-500',
        },
      },
    };

    const mode = darkMode ? 'dark' : 'light';
    return themes[colorScheme][mode];
  };

  // Escucha cambios en la preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setDarkMode(e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Guarda la preferencia en localStorage cuando cambia
  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Guarda el esquema de color en localStorage cuando cambia
  useEffect(() => {
    localStorage.setItem('colorScheme', colorScheme);
  }, [colorScheme]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const changeColorScheme = (scheme: ColorScheme) => {
    setColorScheme(scheme);
  };

  return (
    <ThemeContext.Provider value={{ 
      darkMode, 
      colorScheme, 
      toggleDarkMode, 
      setColorScheme: changeColorScheme,
      themeColors: getThemeColors()
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook personalizado para acceder al contexto
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
};