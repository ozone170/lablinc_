// Form validation utilities

export const validators = {
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return 'Email is required';
    if (!emailRegex.test(value)) return 'Please enter a valid email address';
    return null;
  },

  password: (value) => {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    if (value.length > 100) return 'Password is too long';
    return null;
  },

  phone: (value) => {
    if (!value) return null; // Optional field
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ''))) {
      return 'Please enter a valid 10-digit Indian phone number';
    }
    return null;
  },

  required: (value, fieldName = 'This field') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} is required`;
    }
    return null;
  },

  minLength: (value, min, fieldName = 'This field') => {
    if (value && value.length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return null;
  },

  maxLength: (value, max, fieldName = 'This field') => {
    if (value && value.length > max) {
      return `${fieldName} must not exceed ${max} characters`;
    }
    return null;
  },

  date: {
    isFuture: (value, fieldName = 'Date') => {
      if (!value) return null;
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        return `${fieldName} must be in the future`;
      }
      return null;
    },

    isAfter: (value, compareDate, fieldName = 'Date') => {
      if (!value || !compareDate) return null;
      const date = new Date(value);
      const compare = new Date(compareDate);
      if (date <= compare) {
        return `${fieldName} must be after the start date`;
      }
      return null;
    },
  },

  number: {
    min: (value, min, fieldName = 'Value') => {
      if (value !== null && value !== undefined && value < min) {
        return `${fieldName} must be at least ${min}`;
      }
      return null;
    },

    max: (value, max, fieldName = 'Value') => {
      if (value !== null && value !== undefined && value > max) {
        return `${fieldName} must not exceed ${max}`;
      }
      return null;
    },
  },
};

// Validate multiple fields at once
export const validateForm = (formData, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach((field) => {
    const fieldRules = rules[field];
    const value = formData[field];
    
    for (const rule of fieldRules) {
      const error = rule(value);
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Sanitize input to prevent XSS
export const sanitizeInput = (value) => {
  if (typeof value !== 'string') return value;
  return value
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};
