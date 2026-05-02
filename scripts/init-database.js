#!/usr/bin/env node

/**
 * Database Initialization Script
 * 
 * @description Creates and initializes the SQLite database with schema
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Configuration
const DB_DIR = path.join(__dirname, '../database');
const DB_PATH = path.join(DB_DIR, 'ovo.db');
const SCHEMA_PATH = path.join(DB_DIR, 'schema.sql');

/**
 * Initialize the database
 */
async function initDatabase() {
  try {
    console.log('🗄️  Initializing Ollama Voice Orchestrator Database...\n');

    // Ensure database directory exists
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
      console.log('✅ Created database directory');
    }

    // Check if database already exists
    const dbExists = fs.existsSync(DB_PATH);
    if (dbExists) {
      console.log('⚠️  Database already exists at:', DB_PATH);
      console.log('   To recreate, delete the file and run this script again.\n');
      process.exit(0);
    }

    // Read schema file
    if (!fs.existsSync(SCHEMA_PATH)) {
      console.error('❌ Schema file not found at:', SCHEMA_PATH);
      process.exit(1);
    }

    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    console.log('✅ Loaded database schema');

    // Create database
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('❌ Error creating database:', err.message);
        process.exit(1);
      }
      console.log('✅ Created database file');
    });

    // Execute schema
    await new Promise((resolve, reject) => {
      db.exec(schema, (err) => {
        if (err) {
          console.error('❌ Error executing schema:', err.message);
          reject(err);
        } else {
          console.log('✅ Applied database schema');
          resolve();
        }
      });
    });

    // Verify tables
    await new Promise((resolve, reject) => {
      db.all(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
        [],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            console.log('\n📊 Created tables:');
            rows.forEach((row) => {
              console.log(`   - ${row.name}`);
            });
            resolve();
          }
        }
      );
    });

    // Verify views
    await new Promise((resolve, reject) => {
      db.all(
        "SELECT name FROM sqlite_master WHERE type='view' ORDER BY name",
        [],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            console.log('\n📈 Created views:');
            rows.forEach((row) => {
              console.log(`   - ${row.name}`);
            });
            resolve();
          }
        }
      );
    });

    // Close database
    db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err.message);
        process.exit(1);
      }
    });

    console.log('\n✅ Database initialization complete!');
    console.log(`📍 Database location: ${DB_PATH}\n`);

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
}

// Run initialization
initDatabase();

// Made with Bob
