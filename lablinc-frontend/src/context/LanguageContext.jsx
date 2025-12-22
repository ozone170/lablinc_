import { createContext, useState, useEffect } from 'react';

export const LanguageContext = createContext();

// Translation strings (can be moved to separate files)
const translations = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      search: 'Search',
      filter: 'Filter',
      submit: 'Submit',
    },
    nav: {
      home: 'Home',
      equipment: 'Equipment',
      bookings: 'Bookings',
      dashboard: 'Dashboard',
      profile: 'Profile',
      settings: 'Settings',
      logout: 'Logout',
    },
    auth: {
      login: 'Login',
      register: 'Register',
      forgotPassword: 'Forgot Password',
      resetPassword: 'Reset Password',
    },
  },
  hi: {
    common: {
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      success: 'सफलता',
      save: 'सहेजें',
      cancel: 'रद्द करें',
      delete: 'हटाएं',
      edit: 'संपादित करें',
      view: 'देखें',
      search: 'खोजें',
      filter: 'फ़िल्टर',
      submit: 'जमा करें',
    },
    nav: {
      home: 'होम',
      equipment: 'उपकरण',
      bookings: 'बुकिंग',
      dashboard: 'डैशबोर्ड',
      profile: 'प्रोफ़ाइल',
      settings: 'सेटिंग्स',
      logout: 'लॉगआउट',
    },
    auth: {
      login: 'लॉगिन',
      register: 'पंजीकरण',
      forgotPassword: 'पासवर्ड भूल गए',
      resetPassword: 'पासवर्ड रीसेट करें',
    },
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];

    for (const k of keys) {
      value = value?.[k];
    }

    return value || key;
  };

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
    }
  };

  const value = {
    language,
    setLanguage: changeLanguage,
    t,
    availableLanguages: Object.keys(translations),
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
