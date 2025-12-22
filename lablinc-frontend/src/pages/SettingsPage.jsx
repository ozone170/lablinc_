import { useState, useEffect } from 'react';
import { notificationsAPI } from '../api/notifications.api';
import { useToast } from '../hooks/useToast';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';
import { PasswordChangeForm } from '../components/profile';

const SettingsPage = () => {
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, availableLanguages } = useLanguage();
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await notificationsAPI.getPreferences();
      setPreferences(response.data.preferences);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = async (category, type, value) => {
    try {
      const updated = {
        ...preferences,
        [category]: {
          ...preferences[category],
          [type]: value,
        },
      };
      await notificationsAPI.updatePreferences({ notificationPreferences: updated });
      setPreferences(updated);
      showToast('Preferences updated', 'success');
    } catch (error) {
      showToast('Failed to update preferences', 'error');
    }
  };



  if (loading) {
    return <div className="container">Loading settings...</div>;
  }

  return (
    <div className="container settings-page">
      <h1>Settings</h1>

      {/* Appearance */}
      <section className="settings-section">
        <h2>Appearance</h2>
        <div className="setting-item">
          <label>Theme</label>
          <button onClick={toggleTheme} className="btn btn-secondary">
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
        </div>
        <div className="setting-item">
          <label>Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            {availableLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Notification Preferences */}
      {preferences && (
        <section className="settings-section">
          <h2>Notification Preferences</h2>
          <h3>Email Notifications</h3>
          {Object.entries(preferences.email || {}).map(([key, value]) => (
            <div key={key} className="setting-item">
              <label>{key.replace(/([A-Z])/g, ' $1').trim()}</label>
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => handlePreferenceChange('email', key, e.target.checked)}
              />
            </div>
          ))}

          <h3>Push Notifications</h3>
          {Object.entries(preferences.push || {}).map(([key, value]) => (
            <div key={key} className="setting-item">
              <label>{key.replace(/([A-Z])/g, ' $1').trim()}</label>
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => handlePreferenceChange('push', key, e.target.checked)}
              />
            </div>
          ))}
        </section>
      )}

      {/* Security */}
      <section className="settings-section">
        <h2>Security</h2>
        <PasswordChangeForm />
      </section>
    </div>
  );
};

export default SettingsPage;
