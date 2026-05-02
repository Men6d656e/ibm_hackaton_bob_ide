#!/usr/bin/env node

/**
 * Test Backend Startup
 * Run this to see the actual error
 */

const { spawn } = require('child_process');

console.log('🧪 Testing backend startup...\n');

const backend = spawn('npx', ['ts-node', 'src/backend/server.ts'], {
  stdio: 'inherit',
  shell: true
});

backend.on('error', (error) => {
  console.error('❌ Backend error:', error);
});

backend.on('exit', (code) => {
  console.log(`\n❌ Backend exited with code: ${code}`);
  process.exit(code);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.log('\n✅ Backend started successfully!');
  backend.kill();
  process.exit(0);
}, 10000);

// Made with Bob
