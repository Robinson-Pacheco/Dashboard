const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./infrastructure/database/connection');
const authRoutes = require('./presentation/routes/authRoutes');
const admissionRoutes = require('./presentation/routes/admissionRoutes');
const biRoutes = require('./presentation/routes/biRoutes');
const dataMiningRoutes = require('./presentation/routes/dataMiningRoutes');
const advancedAnalyticsRoutes = require('./presentation/routes/advancedAnalyticsRoutes');
const statisticalDistributionRoutes = require('./presentation/routes/statisticalDistributionRoutes');
const aiRoutes = require('./presentation/routes/ai/aiRoutes');
const { errorHandler } = require('./presentation/middleware/errorHandler');
const mongoose = require('mongoose');

// Swagger imports for development mode
let swaggerUi, swaggerSpec;
if (process.env.NODE_ENV === 'development') {
  swaggerUi = require('swagger-ui-express');
  swaggerSpec = require('./config/swagger');
}

const app = express();

connectDB();

// CORS configuration - MUST be before helmet
const allowedOrigins = [
  'http://localhost:4200',
  'http://localhost:3000',
  process.env.CORS_ORIGIN
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Origin blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false
};
app.use(cors(corsOptions));

// Helmet configuration - MUST be after CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginEmbedderPolicy: false
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

app.use('/api/auth', authRoutes);
app.use('/api/admission', admissionRoutes);
app.use('/api/bi', biRoutes);
app.use('/api/data-mining', dataMiningRoutes);
app.use('/api/advanced-analytics', advancedAnalyticsRoutes);
app.use('/api/statistical', statisticalDistributionRoutes);
app.use('/api/ai', aiRoutes);

// Dev-only AI testing routes (curl-friendly, no JWT auth required)
if (process.env.NODE_ENV === 'development') {
  const aiDevTestController = require('./presentation/controllers/ai/AIDevTestController');
  const devRouter = express.Router();

  devRouter.get('/providers', aiDevTestController.listProviders.bind(aiDevTestController));
  devRouter.get('/connection', aiDevTestController.testConnection.bind(aiDevTestController));
  devRouter.post('/chat', aiDevTestController.testProvider.bind(aiDevTestController));
  devRouter.post('/chat/stream', (req, res, next) => {
    req.body.stream = true;
    aiDevTestController.testProvider(req, res);
  });

  app.use('/api/dev/ai', devRouter);
  console.log('AI dev test endpoints available at /api/dev/ai');
}

app.use(errorHandler);

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  if (process.env.NODE_ENV === 'production') {
    console.log('Shutting down server due to unhandled rejection...');
    server.close(() => {
      mongoose.connection.close();
      process.exit(1);
    });
  }
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  if (process.env.NODE_ENV === 'production') {
    console.log('Shutting down server due to uncaught exception...');
    mongoose.connection.close();
    process.exit(1);
  }
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV === 'development') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
});

const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  server.close(() => {
    console.log('HTTP server closed');
    
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });

  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = { app, server };