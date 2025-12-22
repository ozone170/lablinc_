import React, { createContext, useContext, useEffect, useState } from 'react';

// Theme configuration
const THEMES = {
  light: 'light',
  dark: 'dark',
  auto: 'auto'
};

const STORAGE_KEY = 'lablinc-theme';

// Create theme context
const ThemeContext = createContext({
  theme: THEMES.light,
  actualTheme: THEMES.light,
  setTheme: () => {},
  toggleTheme: () => {},
  themes: THEMES
});

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    // Get theme from localStorage or default to auto
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    return savedTheme && Object.values(THEMES).includes(savedTheme) 
      ? savedTheme 
      : THEMES.auto;
  });

  const [actualTheme, setActualTheme] = useState(THEMES.light);

  // Detect system theme preference
  const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? THEMES.dark 
      : THEMES.light;
  };

  // Update actual theme based on theme setting
  useEffect(() => {
    let newActualTheme;
    
    if (theme === THEMES.auto) {
      newActualTheme = getSystemTheme();
    } else {
      newActualTheme = theme;
    }

    setActualTheme(newActualTheme);
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', newActualTheme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', 
        newActualTheme === THEMES.dark ? '#0f172a' : '#ffffff'
      );
    }
  }, [theme]);

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (theme !== THEMES.auto) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      const newSystemTheme = e.matches ? THEMES.dark : THEMES.light;
      setActualTheme(newSystemTheme);
      document.documentElement.setAttribute('data-theme', newSystemTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme]);

  // Set theme and persist to localStorage
  const setTheme = (newTheme) => {
    if (!Object.values(THEMES).includes(newTheme)) {
      console.warn(`Invalid theme: ${newTheme}`);
      return;
    }

    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
  };

  // Toggle between light and dark (skip auto)
  const toggleTheme = () => {
    const newTheme = actualTheme === THEMES.light ? THEMES.dark : THEMES.light;
    setTheme(newTheme);
  };

  // Get theme display name
  const getThemeDisplayName = (themeName) => {
    const displayNames = {
      [THEMES.light]: 'Light',
      [THEMES.dark]: 'Dark',
      [THEMES.auto]: 'Auto'
    };
    return displayNames[themeName] || themeName;
  };

  // Check if theme is available
  const isThemeSupported = () => {
    return CSS.supports('color', 'var(--color-primary)');
  };

  const contextValue = {
    theme,
    actualTheme,
    setTheme,
    toggleTheme,
    themes: THEMES,
    getThemeDisplayName,
    isThemeSupported,
    isLight: actualTheme === THEMES.light,
    isDark: actualTheme === THEMES.dark,
    isAuto: theme === THEMES.auto
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

// Theme toggle hook with additional utilities
export const useThemeToggle = () => {
  const { theme, actualTheme, setTheme, toggleTheme, themes } = useTheme();
  
  return {
    theme,
    actualTheme,
    setTheme,
    toggleTheme,
    themes,
    cycleTheme: () => {
      const themeOrder = [themes.light, themes.dark, themes.auto];
      const currentIndex = themeOrder.indexOf(theme);
      const nextIndex = (currentIndex + 1) % themeOrder.length;
      setTheme(themeOrder[nextIndex]);
    }
  };
};

export default ThemeContext;