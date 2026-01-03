require('dotenv').config();
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
