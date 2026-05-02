/**
 * Database Connection Module
 * 
 * @description Manages SQLite database connection and initialization
 * @module backend/database/connection
 */

import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';

/**
 * Database connection instance
 */
let db: sqlite3.Database | null = null;

/**
 * Database configuration
 */
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'ovo.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

/**
 * Initialize database connection and create tables
 * 
 * @returns {Promise<sqlite3.Database>} Database instance
 * @throws {Error} If database initialization fails
 */
export async function initializeDatabase(): Promise<sqlite3.Database> {
  if (db) {
    return db;
  }

  try {
    // Ensure data directory exists
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Create database connection
    db = await new Promise<sqlite3.Database>((resolve, reject) => {
      const database = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          logger.error('Failed to connect to database', { error: err });
          reject(err);
        } else {
          logger.info('Connected to SQLite database', { path: DB_PATH });
          resolve(database);
        }
      });
    });

    // Enable foreign keys
    await runQuery(db, 'PRAGMA foreign_keys = ON');

    // Read and execute schema
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    await execQuery(db, schema);

    logger.info('Database schema initialized');

    return db;
  } catch (error) {
    logger.error('Database initialization failed', { error });
    throw error;
  }
}

/**
 * Get database instance
 * 
 * @returns {sqlite3.Database} Database instance
 * @throws {Error} If database is not initialized
 */
export function getDatabase(): sqlite3.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

/**
 * Close database connection
 * 
 * @returns {Promise<void>}
 */
export async function closeDatabase(): Promise<void> {
  if (!db) {
    return;
  }

  return new Promise((resolve, reject) => {
    db!.close((err) => {
      if (err) {
        logger.error('Error closing database', { error: err });
        reject(err);
      } else {
        logger.info('Database connection closed');
        db = null;
        resolve();
      }
    });
  });
}

/**
 * Execute a query that doesn't return rows (CREATE, INSERT, UPDATE, DELETE)
 * 
 * @param {sqlite3.Database} database - Database instance
 * @param {string} sql - SQL query
 * @param {any[]} params - Query parameters
 * @returns {Promise<void>}
 */
export function runQuery(
  database: sqlite3.Database,
  sql: string,
  params: any[] = []
): Promise<void> {
  return new Promise((resolve, reject) => {
    database.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Execute multiple SQL statements
 * 
 * @param {sqlite3.Database} database - Database instance
 * @param {string} sql - SQL statements
 * @returns {Promise<void>}
 */
export function execQuery(database: sqlite3.Database, sql: string): Promise<void> {
  return new Promise((resolve, reject) => {
    database.exec(sql, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Get a single row from database
 * 
 * @param {sqlite3.Database} database - Database instance
 * @param {string} sql - SQL query
 * @param {any[]} params - Query parameters
 * @returns {Promise<T | undefined>} Single row or undefined
 */
export function getOne<T = any>(
  database: sqlite3.Database,
  sql: string,
  params: any[] = []
): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    database.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row as T | undefined);
      }
    });
  });
}

/**
 * Get all rows from database
 * 
 * @param {sqlite3.Database} database - Database instance
 * @param {string} sql - SQL query
 * @param {any[]} params - Query parameters
 * @returns {Promise<T[]>} Array of rows
 */
export function getAll<T = any>(
  database: sqlite3.Database,
  sql: string,
  params: any[] = []
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    database.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows as T[]);
      }
    });
  });
}

/**
 * Begin a transaction
 * 
 * @param {sqlite3.Database} database - Database instance
 * @returns {Promise<void>}
 */
export async function beginTransaction(database: sqlite3.Database): Promise<void> {
  await runQuery(database, 'BEGIN TRANSACTION');
}

/**
 * Commit a transaction
 *
 * @param {sqlite3.Database} database - Database instance
 * @returns {Promise<void>}
 */
export async function commitTransaction(database: sqlite3.Database): Promise<void> {
  await runQuery(database, 'COMMIT');
}

/**
 * Rollback a transaction
 *
 * @param {sqlite3.Database} database - Database instance
 * @returns {Promise<void>}
 */
export async function rollbackTransaction(database: sqlite3.Database): Promise<void> {
  await runQuery(database, 'ROLLBACK');
}

// Made with Bob