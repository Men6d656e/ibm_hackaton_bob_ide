/**
 * Express.js Server for Ollama Voice Orchestrator
 * 
 * @description Main backend server that handles API requests for Ollama operations,
 * session management, and voice processing
 * 
 * @module backend/server
 */

import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase, closeDatabase } from './database/connection';
import logger from './utils/logger';

// Load environment variables
dotenv.config();

// Import routes
import ollamaRoutes from './routes/ollama.routes';
import sessionRoutes from './routes/session.routes';
import voiceRoutes from './routes/voice.routes';

/**
 * Application configuration constants
 */
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const SHUTDOWN_TIMEOUT_MS = 10000; // 10 seconds

/**
 * Initialize Express application
 */
const app: Express = express();

/**
 * Middleware Configuration
 */

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.http(`${req.method} ${req.path}`);
  next();
});

/**
 * Health Check Endpoint
 * 
 * @route GET /health
 * @returns {object} 200 - Server health status
 */
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Ollama Voice Orchestrator API is running',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: '1.0.0',
  });
});

/**
 * API Routes
 *
 * All API routes are prefixed with /api
 */
app.use('/api/ollama', ollamaRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/voice', voiceRoutes);

/**
 * Root endpoint
 */
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Ollama Voice Orchestrator API',
    version: '1.0.0',
    documentation: '/api/docs',
  });
});

/**
 * 404 Handler - Route not found
 */
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: 'The requested endpoint does not exist',
    },
  });
});

/**
 * Global Error Handler
 * 
 * Catches all errors and returns a consistent error response
 */
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Server Error:', { error: err.message, stack: err.stack });

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
      ...(NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
});

/**
 * Server instance
 */
let server: ReturnType<typeof app.listen> | null = null;

/**
 * Start the server
 *
 * @returns {Promise<void>}
 */
const startServer = async (): Promise<void> => {
  try {
    // Initialize database
    logger.info('🔧 Initializing database...');
    await initializeDatabase();
    logger.info('✅ Database initialized successfully');

    server = app.listen(PORT, () => {
      logger.info('='.repeat(50));
      logger.info('🚀 Ollama Voice Orchestrator API Server');
      logger.info('='.repeat(50));
      logger.info(`📡 Server running on: http://localhost:${PORT}`);
      logger.info(`🌍 Environment: ${NODE_ENV}`);
      logger.info(`⏰ Started at: ${new Date().toISOString()}`);
      logger.info('='.repeat(50));
      logger.info('\n✅ Server is ready to accept requests\n');
    });

    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`❌ Port ${PORT} is already in use`);
      } else {
        logger.error('❌ Server error:', error);
      }
      process.exit(1);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * Graceful shutdown handler
 *
 * @returns {Promise<void>}
 */
const gracefulShutdown = async (): Promise<void> => {
  logger.info('\n🛑 Received shutdown signal, closing server gracefully...');

  if (server) {
    server.close(async () => {
      logger.info('✅ Server closed successfully');
      
      // Close database connection
      try {
        await closeDatabase();
        logger.info('✅ Database connection closed');
      } catch (error) {
        logger.error('Error closing database:', error);
      }
      
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      logger.error('⚠️ Forced shutdown after timeout');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
  } else {
    process.exit(0);
  }
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

// Export app for testing
export default app;

// Made with Bob
