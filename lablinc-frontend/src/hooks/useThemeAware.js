/**
 * Theme-aware utility hooks
 * Provides utilities for components to adapt to theme changes
 */

import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext.jsx';

// Hook for theme-aware styling
export const useThemeAware = () => {
  const { theme, actualTheme, isDark, isLight } = useTheme();
  
  // Get theme-specific values
  const getThemeValue = (lightValue, darkValue) => {
    return isDark ? darkValue : lightValue;
  };

  // Get CSS custom property value
  const getCSSVariable = (property) => {
    return getComputedStyle(document.documentElement).getPropertyValue(property).trim();
  };

  // Set CSS custom property
  const setCSSVariable = (property, value) => {
    document.documentElement.style.setProperty(property, value);
  };

  return {
    theme,
    actualTheme,
    isDark,
    isLight,
    getThemeValue,
    getCSSVariable,
    setCSSVariable
  };
};

// Hook for theme-aware colors
export const useThemeColors = () => {
  const { isDark } = useTheme();
  const [colors, setColors] = useState({});

  useEffect(() => {
    const updateColors = () => {
      const computedStyle = getComputedStyle(document.documentElement);
      
      setColors({
        primary: computedStyle.getPropertyValue('--color-primary').trim(),
        secondary: computedStyle.getPropertyValue('--color-secondary').trim(),
        background: computedStyle.getPropertyValue('--color-bg-primary').trim(),
        surface: computedStyle.getPropertyValue('--color-bg-secondary').trim(),
        text: computedStyle.getPropertyValue('--color-text-primary').trim(),
        textSecondary: computedStyle.getPropertyValue('--color-text-secondary').trim(),
        border: computedStyle.getPropertyValue('--color-border-primary').trim(),
        success: computedStyle.getPropertyValue('--color-success').trim(),
        warning: computedStyle.getPropertyValue('--color-warning').trim(),
        error: computedStyle.getPropertyValue('--color-error').trim(),
        info: computedStyle.getPropertyValue('--color-info').trim()
      });
    };

    updateColors();

    // Update colors when theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          updateColors();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, [isDark]);

  return colors;
};

// Hook for theme-aware media queries
export const useThemeMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = (e) => setMatches(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
};

// Hook for system theme detection
export const useSystemTheme = () => {
  const prefersDark = useThemeMediaQuery('(prefers-color-scheme: dark)');
  const prefersLight = useThemeMediaQuery('(prefers-color-scheme: light)');
  
  return {
    prefersDark,
    prefersLight,
    systemTheme: prefersDark ? 'dark' : 'light'
  };
};

// Hook for theme-aware animations
export const useThemeAnimations = () => {
  const { isDark } = useTheme();
  const prefersReducedMotion = useThemeMediaQuery('(prefers-reduced-motion: reduce)');
  
  const getAnimationDuration = (duration = 'normal') => {
    if (prefersReducedMotion) return '0ms';
    
    const durations = {
      fast: '150ms',
      normal: '250ms',
      slow: '350ms'
    };
    
    return durations[duration] || duration;
  };

  const getAnimationEasing = (easing = 'ease-out') => {
    const easings = {
      'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
      'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
      'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)'
    };
    
    return easings[easing] || easing;
  };

  return {
    isDark,
    prefersReducedMotion,
    getAnimationDuration,
    getAnimationEasing,
    shouldAnimate: !prefersReducedMotion
  };
};

// Hook for theme-aware localStorage
export const useThemeStorage = (key, defaultValue) => {
  const { theme } = useTheme();
  const storageKey = `${key}-${theme}`;
  
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(storageKey);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setStoredValue = (newValue) => {
    try {
      setValue(newValue);
      localStorage.setItem(storageKey, JSON.stringify(newValue));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  };

  return [value, setStoredValue];
};

// Hook for theme-aware component classes
export const useThemeClasses = (baseClasses = '', themeClasses = {}) => {
  const { actualTheme } = useTheme();
  
  const getClasses = () => {
    const classes = [baseClasses];
    
    if (themeClasses[actualTheme]) {
      classes.push(themeClasses[actualTheme]);
    }
    
    return classes.filter(Boolean).join(' ');
  };

  return getClasses();
};

// Hook for theme transition effects
export const useThemeTransition = (duration = 300) => {
  const { actualTheme } = useTheme();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [actualTheme, duration]);

  return {
    isTransitioning,
    transitionClass: isTransitioning ? 'theme-transitioning' : ''
  };
};

export default useThemeAware;