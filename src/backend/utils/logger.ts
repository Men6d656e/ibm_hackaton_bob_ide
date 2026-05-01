/**
 * Logger Utility
 * 
 * @description Winston-based logging system with multiple transports
 * @module backend/utils/logger
 */

import winston from 'winston';
import path from 'path';
import fs from 'fs';

/**
 * Log directory path
 */
const LOG_DIR = path.join(process.cwd(), 'logs');

/**
 * Maximum log file size (5MB)
 */
const MAX_LOG_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Maximum number of log files to keep
 */
const MAX_LOG_FILES = 5;

/**
 * Ensure log directory exists
 */
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * Custom log format
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

/**
 * Console log format (colorized for development)
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

/**
 * Winston logger instance
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'ollama-voice-orchestrator' },
  transports: [
    // Write all logs to combined.log
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'combined.log'),
      maxsize: MAX_LOG_FILE_SIZE,
      maxFiles: MAX_LOG_FILES,
    }),
    // Write error logs to error.log
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'error.log'),
      level: 'error',
      maxsize: MAX_LOG_FILE_SIZE,
      maxFiles: MAX_LOG_FILES,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'exceptions.log'),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'rejections.log'),
    }),
  ],
});

/**
 * Add console transport in development
 */
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

/**
 * Logger interface for type safety
 */
export interface ILogger {
  error(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  http(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}

/**
 * Export logger instance
 */
export default logger as ILogger;

/**
 * Create a child logger with additional metadata
 * 
 * @param {object} meta - Additional metadata
 * @returns {ILogger} Child logger instance
 */
export function createChildLogger(meta: object): ILogger {
  return logger.child(meta) as ILogger;
}

/**
 * Log HTTP request
 * 
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @param {number} statusCode - Response status code
 * @param {number} responseTime - Response time in ms
 */
export function logHttpRequest(
  method: string,
  url: string,
  statusCode: number,
  responseTime: number
): void {
  logger.http('HTTP Request', {
    method,
    url,
    statusCode,
    responseTime: `${responseTime}ms`,
  });
}

/**
 * Log database operation
 * 
 * @param {string} operation - Database operation
 * @param {string} table - Table name
 * @param {number} duration - Operation duration in ms
 */
export function logDatabaseOperation(
  operation: string,
  table: string,
  duration: number
): void {
  logger.debug('Database Operation', {
    operation,
    table,
    duration: `${duration}ms`,
  });
}

/**
 * Log Ollama operation
 * 
 * @param {string} operation - Ollama operation
 * @param {string} modelName - Model name
 * @param {boolean} success - Operation success status
 * @param {number} duration - Operation duration in ms
 */
export function logOllamaOperation(
  operation: string,
  modelName: string,
  success: boolean,
  duration: number
): void {
  const level = success ? 'info' : 'error';
  logger[level]('Ollama Operation', {
    operation,
    modelName,
    success,
    duration: `${duration}ms`,
  });
}

/**
 * Log voice command
 * 
 * @param {string} command - Voice command text
 * @param {string} intent - Detected intent
 * @param {number} confidence - Confidence score
 */
export function logVoiceCommand(
  command: string,
  intent: string,
  confidence: number
): void {
  logger.info('Voice Command', {
    command,
    intent,
    confidence,
  });
}

// Made with Bob