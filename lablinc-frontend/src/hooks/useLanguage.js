import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';

/**
 * Custom hook to use language context
 * @returns {object} - Language context value
 */
export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }

  return context;
};
