const validateEnvironment = () => {
  const requiredEnvVars = [
    'NODE_ENV',
    'PORT',
    'MONGODB_URI',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'EMAIL_FROM',
    'FRONTEND_URL'
  ];

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(envVar => {
      console.error(`   - ${envVar}`);
    });
    console.error('\nPlease check your .env file and ensure all required variables are set.');
    process.exit(1);
  }

  // Validate specific values
  const validations = [
    {
      key: 'NODE_ENV',
      valid: ['development', 'production', 'test'],
      current: process.env.NODE_ENV
    },
    {
      key: 'AWS_REGION',
      valid: ['ap-south-1'],
      current: process.env.AWS_REGION,
      warning: true
    }
  ];

  validations.forEach(({ key, valid, current, warning }) => {
    if (!valid.includes(current)) {
      const message = `Invalid ${key}: ${current}. Expected one of: ${valid.join(', ')}`;
      if (warning) {
        console.warn(`⚠️  ${message}`);
      } else {
        console.error(`❌ ${message}`);
        process.exit(1);
      }
    }
  });

  // Production-specific validations
  if (process.env.NODE_ENV === 'production') {
    const productionChecks = [
      {
        condition: !process.env.EMAIL_FROM.includes('@lablinc.in'),
        message: 'EMAIL_FROM should use verified domain @lablinc.in in production'
      },
      {
        condition: process.env.JWT_ACCESS_SECRET.length < 32,
        message: 'JWT_ACCESS_SECRET should be at least 32 characters in production'
      },
      {
        condition: process.env.JWT_REFRESH_SECRET.length < 32,
        message: 'JWT_REFRESH_SECRET should be at least 32 characters in production'
      }
    ];

    productionChecks.forEach(({ condition, message }) => {
      if (condition) {
        console.warn(`⚠️  ${message}`);
      }
    });
  }

  console.log('✅ Environment validation passed');
};

module.exports = validateEnvironment;