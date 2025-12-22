import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import './ThemeToggle.css';

const ThemeToggle = ({ 
  variant = 'button', 
  showLabel = false, 
  className = '',
  size = 'md'
}) => {
  const { theme, actualTheme, setTheme, themes, getThemeDisplayName, isAuto } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  // Simple toggle button (light/dark only)
  if (variant === 'toggle') {
    return (
      <button
        className={`theme-toggle theme-toggle-${size} ${className}`}
        onClick={() => setTheme(actualTheme === themes.light ? themes.dark : themes.light)}
        aria-label={`Switch to ${actualTheme === themes.light ? 'dark' : 'light'} mode`}
        title={`Switch to ${actualTheme === themes.light ? 'dark' : 'light'} mode`}
      >
        <div className="theme-toggle-track">
          <div className={`theme-toggle-thumb ${actualTheme === themes.dark ? 'dark' : 'light'}`}>
            {actualTheme === themes.light ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </div>
        </div>
        {showLabel && (
          <span className="theme-toggle-label">
            {getThemeDisplayName(actualTheme)}
          </span>
        )}
      </button>
    );
  }

  // Dropdown selector (light/dark/auto)
  if (variant === 'dropdown') {
    return (
      <div className={`theme-dropdown ${isOpen ? 'open' : ''} ${className}`}>
        <button
          className={`theme-dropdown-trigger theme-dropdown-${size}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Select theme"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <div className="theme-icon">
            {actualTheme === themes.light ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </div>
          {showLabel && (
            <span className="theme-label">
              {getThemeDisplayName(theme)}
              {isAuto && ` (${getThemeDisplayName(actualTheme)})`}
            </span>
          )}
          <svg className="theme-dropdown-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6,9 12,15 18,9"/>
          </svg>
        </button>

        {isOpen && (
          <div className="theme-dropdown-menu" role="listbox">
            {Object.values(themes).map((themeOption) => (
              <button
                key={themeOption}
                className={`theme-option ${theme === themeOption ? 'active' : ''}`}
                onClick={() => {
                  setTheme(themeOption);
                  setIsOpen(false);
                }}
                role="option"
                aria-selected={theme === themeOption}
              >
                <div className="theme-option-icon">
                  {themeOption === themes.light && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="5"/>
                      <line x1="12" y1="1" x2="12" y2="3"/>
                      <line x1="12" y1="21" x2="12" y2="23"/>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                      <line x1="1" y1="12" x2="3" y2="12"/>
                      <line x1="21" y1="12" x2="23" y2="12"/>
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                    </svg>
                  )}
                  {themeOption === themes.dark && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                  )}
                  {themeOption === themes.auto && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                      <line x1="8" y1="21" x2="16" y2="21"/>
                      <line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                  )}
                </div>
                <span className="theme-option-label">
                  {getThemeDisplayName(themeOption)}
                </span>
                {themeOption === themes.auto && (
                  <span className="theme-option-sublabel">
                    Currently {getThemeDisplayName(actualTheme).toLowerCase()}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Default button variant
  return (
    <button
      className={`theme-button theme-button-${size} ${className}`}
      onClick={() => setTheme(actualTheme === themes.light ? themes.dark : themes.light)}
      aria-label={`Switch to ${actualTheme === themes.light ? 'dark' : 'light'} mode`}
      title={`Switch to ${actualTheme === themes.light ? 'dark' : 'light'} mode`}
    >
      <div className="theme-button-icon">
        {actualTheme === themes.light ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        )}
      </div>
      {showLabel && (
        <span className="theme-button-label">
          {actualTheme === themes.light ? 'Dark' : 'Light'} Mode
        </span>
      )}
    </button>
  );
};

// Compound components for different use cases
ThemeToggle.Button = (props) => <ThemeToggle variant="button" {...props} />;
ThemeToggle.Toggle = (props) => <ThemeToggle variant="toggle" {...props} />;
ThemeToggle.Dropdown = (props) => <ThemeToggle variant="dropdown" {...props} />;

export default ThemeToggle;