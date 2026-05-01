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
import path from 'path';

// Load environment variables
dotenv.config();

// Import routes (will be created in Phase 3)
// import ollamaRoutes from './routes/ollama.routes';
// import sessionRoutes from './routes/session.routes';
// import voiceRoutes from './routes/voice.routes';
// import analyticsRoutes from './routes/analytics.routes';

// Import middleware (will be created)
// import { errorHandler } from './middleware/error-handler';
// import { requestLogger } from './middleware/logger';

/**
 * Application configuration constants
 */
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

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

// Request logging middleware (development only)
if (NODE_ENV === 'development') {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

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
// app.use('/api/ollama', ollamaRoutes);
// app.use('/api/sessions', sessionRoutes);
// app.use('/api/voice', voiceRoutes);
// app.use('/api/analytics', analyticsRoutes);

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
  console.error('Server Error:', err);

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
 * Start the server
 * 
 * @returns {void}
 */
const startServer = (): void => {
  try {
    app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log('🚀 Ollama Voice Orchestrator API Server');
      console.log('='.repeat(50));
      console.log(`📡 Server running on: http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${NODE_ENV}`);
      console.log(`⏰ Started at: ${new Date().toISOString()}`);
      console.log('='.repeat(50));
      console.log('\n✅ Server is ready to accept requests\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * Graceful shutdown handler
 */
const gracefulShutdown = (): void => {
  console.log('\n🛑 Received shutdown signal, closing server gracefully...');
  process.exit(0);
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
