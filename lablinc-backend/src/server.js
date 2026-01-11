// Load environment variables - check for production file first
const path = require('path');
const fs = require('fs');

const productionEnvPath = path.join(__dirname, '../.env.production');
const defaultEnvPath = path.join(__dirname, '../.env');

// Load production env if it exists and we're in production, otherwise load default
if (fs.existsSync(productionEnvPath) && (process.env.NODE_ENV === 'production' || !fs.existsSync(defaultEnvPath))) {
  require('dotenv').config({ path: productionEnvPath });
  console.log('📋 Loaded production environment configuration');
} else {
  require('dotenv').config();
  console.log('📋 Loaded development environment configuration');
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
