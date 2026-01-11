// Load environment variables - prioritize production file on production server
const path = require('path');
const fs = require('fs');

const productionEnvPath = path.join(__dirname, '../.env.production');
const defaultEnvPath = path.join(__dirname, '../.env');

// Check if we're on production server by looking for production env file
// and if default env doesn't exist (typical production setup)
const isProductionServer = fs.existsSync(productionEnvPath) && !fs.existsSync(defaultEnvPath);
const forceProduction = process.env.NODE_ENV === 'production';

if (isProductionServer || forceProduction) {
  require('dotenv').config({ path: productionEnvPath });
  console.log('📋 Loaded production environment configuration from .env.production');
} else {
  require('dotenv').config();
  console.log('📋 Loaded development environment configuration from .env');
}

// Ensure NODE_ENV is set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = isProductionServer ? 'production' : 'development';
  console.log('📋 Set NODE_ENV to:', process.env.NODE_ENV);
}

const validateEnvironment = require('./utils/validateEnv');
const logger = require('./utils/logger');
const app = require('./app');
const connectDB = require('./config/db');

// Validate environment variables
validateEnvironment();

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Start server
app.listen(PORT, () => {
  logger.info('Server started', {
    port: PORT,
    environment: process.env.NODE_ENV,
    nodeVersion: process.version
  });
});
