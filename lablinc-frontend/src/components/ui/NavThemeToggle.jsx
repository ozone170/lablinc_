import { useTheme } from '../../contexts/ThemeContext';
import './NavThemeToggle.css';

const NavThemeToggle = () => {
  const { actualTheme, toggleTheme } = useTheme();
  const isDark = actualTheme === 'dark';

  return (
    <button
      className="nav-theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span className="theme-icon">
        {isDark ? '☀️' : '🌙'}
      </span>
    </button>
  );
};

export default NavThemeToggle;