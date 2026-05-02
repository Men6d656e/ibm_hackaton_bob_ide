#!/usr/bin/env node

/**
 * Test Database Connection
 */

console.log('🧪 Testing database connection...\n');

try {
  // Test require
  console.log('1. Testing better-sqlite3 import...');
  const Database = require('better-sqlite3');
  console.log('✅ better-sqlite3 imported successfully');

  // Test database creation
  console.log('\n2. Testing database creation...');
  const db = new Database('./database/ovo.db');
  console.log('✅ Database opened successfully');

  // Test query
  console.log('\n3. Testing query...');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('✅ Query executed successfully');
  console.log('📊 Tables found:', tables.map(t => t.name).join(', '));

  // Close
  db.close();
  console.log('\n✅ All database tests passed!');
  
} catch (error) {
  console.error('\n❌ Database test failed:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

// Made with Bob
