const winston = require('winston');
const path = require('path');

// Custom format to mask sensitive data
const maskSensitiveData = winston.format((info) => {
  const sensitiveFields = ['password', 'token', 'refreshToken', 'otp', 'secret', 'key'];
  
  if (typeof info.message === 'object') {
    info.message = maskObject(info.message, sensitiveFields);
  }
  
  if (info.meta && typeof info.meta === 'object') {
    info.meta = maskObject(info.meta, sensitiveFields);
  }
  
  return info;
});

const maskObject = (obj, sensitiveFields) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const masked = { ...obj };
  
  for (const key in masked) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      masked[key] = '[MASKED]';
    } else if (typeof masked[key] === 'object' && masked[key] !== null) {
      masked[key] = maskObject(masked[key], sensitiveFields);
    }
  }
  
  return masked;
};

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
require('fs').mkdirSync(logsDir, { recursive: true });

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  maskSensitiveData(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  maskSensitiveData(),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  })
);

// Create transports
const transports = [];

// Console transport (always enabled in development)
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: 'debug'
    })
  );
}

// File transports for production
if (process.env.NODE_ENV === 'production') {
  // Error log
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );
  
  // Combined log
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );
  
  // Console for production (errors only)
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: 'error'
    })
  );
}

// Create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: logFormat,
  transports,
  // Don't exit on handled exceptions
  exitOnError: false
});

// Handle uncaught exceptions and unhandled rejections
if (process.env.NODE_ENV === 'production') {
  logger.exceptions.handle(
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      format: logFormat
    })
  );
  
  logger.rejections.handle(
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      format: logFormat
    })
  );
}

// Add request logging helper
logger.logRequest = (req, res, responseTime) => {
  const logData = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    userId: req.user?.id || 'anonymous'
  };
  
  if (res.statusCode >= 400) {
    logger.warn('HTTP Request', logData);
  } else {
    logger.info('HTTP Request', logData);
  }
};

// Add auth logging helper
logger.logAuth = (action, userId, email, success, details = {}) => {
  logger.info('Auth Event', {
    action,
    userId,
    email: email ? email.replace(/(.{2}).*(@.*)/, '$1***$2') : undefined, // Mask email
    success,
    ...details
  });
};

module.exports = logger;