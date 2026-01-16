const path = require('path');
const fs = require('fs');
const logger = require('./utils/logger');

// Load environment variables FIRST
const productionEnvPath = path.join(__dirname, '../.env.production');
if (fs.existsSync(productionEnvPath)) {
  require('dotenv').config({ path: productionEnvPath });
  console.log('📋 Loaded production environment configuration from .env.production');
} else {
  require('dotenv').config();
  console.log('📋 Loaded development environment configuration from .env');
}

const validateEnvironment = require('./utils/validateEnv');
const connectDB = require('./config/db');
const app = require('./app');

// Trust proxy MUST be after app exists
app.set('trust proxy', 1);

// Validate environment
validateEnvironment();

// Debug AWS credentials loading
console.log('🔒 EMAIL_FROM LOCKED TO:', process.env.EMAIL_FROM);
console.log('🔑 AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'LOADED' : 'MISSING');
console.log('🔑 AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'LOADED' : 'MISSING');
console.log('🌍 AWS_REGION:', process.env.AWS_REGION);

const PORT = process.env.PORT || 5000;

// Connect DB then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info('Server started', {
      port: PORT,
      environment: process.env.NODE_ENV,
      nodeVersion: process.version
    });
  });
}).catch(err => {
  logger.error('Failed to start server', err);
  process.exit(1);
});

