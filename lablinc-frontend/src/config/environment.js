/**
 * Environment Configuration Management
 * Provides centralized, validated environment configuration with fallbacks
 */

// Environment types
export const ENV_TYPES = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  TEST: 'test'
};

// Detect current environment
const detectEnvironment = () => {
  const mode = import.meta.env.MODE;
  const isDev = import.meta.env.DEV;
  const isProd = import.meta.env.PROD;
  
  if (mode === 'test') return ENV_TYPES.TEST;
  if (mode === 'staging') return ENV_TYPES.STAGING;
  if (isProd) return ENV_TYPES.PRODUCTION;
  if (isDev) return ENV_TYPES.DEVELOPMENT;
  
  // Fallback detection
  return ENV_TYPES.DEVELOPMENT;
};

// Environment-specific configurations
const environmentConfigs = {
  [ENV_TYPES.DEVELOPMENT]: {
    apiUrl: 'http://localhost:5000/api',
    apiTimeout: 10000,
    enableLogging: true,
    enableDebugMode: true,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  [ENV_TYPES.STAGING]: {
    apiUrl: 'https://staging-api.lablinc.com/api',
    apiTimeout: 15000,
    enableLogging: true,
    enableDebugMode: false,
    retryAttempts: 3,
    retryDelay: 2000,
  },
  [ENV_TYPES.PRODUCTION]: {
    apiUrl: 'https://api.lablinc.com/api',
    apiTimeout: 20000,
    enableLogging: false,
    enableDebugMode: false,
    retryAttempts: 5,
    retryDelay: 3000,
  },
  [ENV_TYPES.TEST]: {
    apiUrl: 'http://localhost:5000/api',
    apiTimeout: 5000,
    enableLogging: false,
    enableDebugMode: false,
    retryAttempts: 1,
    retryDelay: 100,
  }
};

// Configuration validation schema
const configSchema = {
  apiUrl: {
    required: true,
    type: 'string',
    pattern: /^https?:\/\/.+/,
    fallback: 'http://localhost:5000/api'
  },
  apiTimeout: {
    required: false,
    type: 'number',
    min: 1000,
    max: 60000,
    fallback: 10000
  },
  enableLogging: {
    required: false,
    type: 'boolean',
    fallback: false
  },
  enableDebugMode: {
    required: false,
    type: 'boolean',
    fallback: false
  },
  retryAttempts: {
    required: false,
    type: 'number',
    min: 0,
    max: 10,
    fallback: 3
  },
  retryDelay: {
    required: false,
    type: 'number',
    min: 100,
    max: 10000,
    fallback: 1000
  }
};

// Validate configuration value
const validateConfigValue = (key, value, schema) => {
  const rule = schema[key];
  if (!rule) return { isValid: true, value };

  // Check if required
  if (rule.required && (value === undefined || value === null || value === '')) {
    return {
      isValid: false,
      error: `${key} is required`,
      value: rule.fallback
    };
  }

  // Use fallback if value is missing
  if (value === undefined || value === null || value === '') {
    return { isValid: true, value: rule.fallback };
  }

  // Type validation
  if (rule.type === 'string' && typeof value !== 'string') {
    return {
      isValid: false,
      error: `${key} must be a string`,
      value: rule.fallback
    };
  }

  if (rule.type === 'number') {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      return {
        isValid: false,
        error: `${key} must be a number`,
        value: rule.fallback
      };
    }
    value = numValue;
  }

  if (rule.type === 'boolean') {
    if (typeof value === 'string') {
      value = value.toLowerCase() === 'true';
    } else if (typeof value !== 'boolean') {
      return {
        isValid: false,
        error: `${key} must be a boolean`,
        value: rule.fallback
      };
    }
  }

  // Pattern validation for strings
  if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
    return {
      isValid: false,
      error: `${key} does not match required pattern`,
      value: rule.fallback
    };
  }

  // Range validation for numbers
  if (rule.type === 'number') {
    if (rule.min !== undefined && value < rule.min) {
      return {
        isValid: false,
        error: `${key} must be at least ${rule.min}`,
        value: rule.fallback
      };
    }
    if (rule.max !== undefined && value > rule.max) {
      return {
        isValid: false,
        error: `${key} must be at most ${rule.max}`,
        value: rule.fallback
      };
    }
  }

  return { isValid: true, value };
};

// Load and validate configuration
const loadConfiguration = () => {
  const currentEnv = detectEnvironment();
  const baseConfig = environmentConfigs[currentEnv];
  const errors = [];
  const warnings = [];
  
  // Override with environment variables
  const envOverrides = {
    apiUrl: import.meta.env.VITE_API_URL,
    apiTimeout: import.meta.env.VITE_API_TIMEOUT,
    enableLogging: import.meta.env.VITE_ENABLE_LOGGING,
    enableDebugMode: import.meta.env.VITE_ENABLE_DEBUG,
    retryAttempts: import.meta.env.VITE_RETRY_ATTEMPTS,
    retryDelay: import.meta.env.VITE_RETRY_DELAY,
  };

  // Merge and validate configuration
  const finalConfig = { ...baseConfig };
  
  Object.keys(configSchema).forEach(key => {
    const envValue = envOverrides[key];
    const baseValue = baseConfig[key];
    const valueToValidate = envValue !== undefined ? envValue : baseValue;
    
    const validation = validateConfigValue(key, valueToValidate, configSchema);
    
    if (!validation.isValid) {
      if (configSchema[key].required) {
        errors.push(`Configuration error for ${key}: ${validation.error}`);
      } else {
        warnings.push(`Configuration warning for ${key}: ${validation.error}, using fallback`);
      }
    }
    
    finalConfig[key] = validation.value;
  });

  // Log configuration status
  if (finalConfig.enableLogging) {
    console.group('🔧 Environment Configuration');
    console.log('Environment:', currentEnv);
    console.log('Configuration:', finalConfig);
    
    if (warnings.length > 0) {
      console.warn('Configuration warnings:', warnings);
    }
    
    if (errors.length > 0) {
      console.error('Configuration errors:', errors);
    }
    
    console.groupEnd();
  }

  return {
    config: finalConfig,
    environment: currentEnv,
    errors,
    warnings,
    isValid: errors.length === 0
  };
};

// Configuration instance
const configResult = loadConfiguration();

// Export configuration
export const config = configResult.config;
export const environment = configResult.environment;
export const configErrors = configResult.errors;
export const configWarnings = configResult.warnings;
export const isConfigValid = configResult.isValid;

// Configuration utilities
export const isProduction = () => environment === ENV_TYPES.PRODUCTION;
export const isDevelopment = () => environment === ENV_TYPES.DEVELOPMENT;
export const isStaging = () => environment === ENV_TYPES.STAGING;
export const isTest = () => environment === ENV_TYPES.TEST;

// API URL validation
export const validateApiUrl = (url = config.apiUrl) => {
  try {
    const urlObj = new URL(url);
    return {
      isValid: true,
      protocol: urlObj.protocol,
      host: urlObj.host,
      pathname: urlObj.pathname
    };
  } catch (error) {
    return {
      isValid: false,
      error: error.message
    };
  }
};

// Configuration health check
export const getConfigurationHealth = () => {
  const apiValidation = validateApiUrl();
  
  return {
    environment,
    isValid: isConfigValid && apiValidation.isValid,
    errors: [...configErrors, ...(apiValidation.isValid ? [] : [apiValidation.error])],
    warnings: configWarnings,
    config: {
      apiUrl: config.apiUrl,
      apiTimeout: config.apiTimeout,
      enableLogging: config.enableLogging,
      enableDebugMode: config.enableDebugMode,
      retryAttempts: config.retryAttempts,
      retryDelay: config.retryDelay
    },
    apiStatus: apiValidation
  };
};

export default config;