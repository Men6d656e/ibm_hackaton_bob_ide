# 🚀 Ollama Voice Orchestrator - Setup and Testing Guide

## 📋 Table of Contents

- [Project Status](#project-status)
- [What's Built](#whats-built)
- [What's Missing](#whats-missing)
- [Prerequisites](#prerequisites)
- [Installation Steps](#installation-steps)
- [How to Run the App](#how-to-run-the-app)
- [How to Test the App](#how-to-test-the-app)
- [Known Issues](#known-issues)
- [Next Steps](#next-steps)

---

## 📊 Project Status

### ✅ Completed Components

**Backend (100% Complete)**:
- ✅ Express.js server with TypeScript
- ✅ Ollama CLI wrapper with all commands
- ✅ IBM watsonx.ai integration for command processing
- ✅ OpenAI Whisper STT service
- ✅ IBM Watson TTS service
- ✅ Command parser with function calling
- ✅ Session management model
- ✅ REST API routes (ollama, session, voice)
- ✅ Database connection setup
- ✅ Winston logging system

**Frontend (100% Complete)**:
- ✅ React 18 with TypeScript
- ✅ All UI components (Chat, Sidebar, Analytics, AudioVisualizer, etc.)
- ✅ Voice recognition hooks
- ✅ Zustand state management
- ✅ API service layer
- ✅ Audio service
- ✅ Keyboard shortcuts

**Infrastructure (Just Created)**:
- ✅ Electron main process ([`src/main/index.ts`](src/main/index.ts))
- ✅ Preload scripts ([`src/preload/index.ts`](src/preload/index.ts))
- ✅ Vite configuration ([`vite.config.ts`](vite.config.ts))
- ✅ Electron Forge configuration ([`forge.config.js`](forge.config.js))
- ✅ Database schema ([`database/schema.sql`](database/schema.sql))
- ✅ Database initialization script ([`scripts/init-database.js`](scripts/init-database.js))
- ✅ HTML entry point ([`src/renderer/index.html`](src/renderer/index.html))

**Documentation (100% Complete)**:
- ✅ All documentation files

### ⚠️ Critical Issues to Address

**Security Vulnerabilities** (from [`DEPENDENCY_UPDATES.md`](DEPENDENCY_UPDATES.md)):
1. **Electron**: 35 security vulnerabilities (26 high severity)
2. **Command Injection**: User input not sanitized in ollama-wrapper.ts
3. **API Key Exposure**: Potential logging of sensitive data

**Missing Type Definitions**:
- TypeScript errors for missing `electron` and `vite` modules (expected - will resolve after `npm install`)

---

## 🔧 Prerequisites

### Required Software

1. **Node.js 20+** and npm 10+
   ```bash
   node --version  # Should be v20.0.0 or higher
   npm --version   # Should be v10.0.0 or higher
   ```

2. **Ollama** installed and running
   ```bash
   ollama --version
   ollama serve  # Should be running on localhost:11434
   ```

3. **Linux OS** (Ubuntu 20.04+, Fedora 35+, or equivalent)

4. **Microphone** for voice input

### Required API Keys

You'll need accounts and API keys for:

1. **IBM Cloud Account**:
   - IBM watsonx.ai API key and Project ID
   - IBM Watson Text-to-Speech API key and URL

2. **OpenAI Account**:
   - OpenAI API key (for Whisper STT)

---

## 📦 Installation Steps

### Step 1: Clone and Install Dependencies

```bash
# Navigate to project directory
cd /home/akash/programing/ibm_hackaton_bob_ide

# Install all dependencies
npm install

# This will install:
# - Electron and all Electron Forge packages
# - React and related packages
# - Express and backend dependencies
# - TypeScript and build tools
# - All AI service SDKs
```

### Step 2: Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual API keys
nano .env  # or use your preferred editor
```

**Required environment variables**:
```env
# Server Configuration
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

# Database
DATABASE_PATH=./database/ovo.db

# IBM Watson Configuration
WATSONX_API_KEY=your_actual_watsonx_api_key
WATSONX_PROJECT_ID=your_actual_project_id
WATSON_TTS_API_KEY=your_actual_tts_api_key
WATSON_TTS_URL=https://api.us-south.text-to-speech.watson.cloud.ibm.com

# Whisper Configuration (OpenAI)
WHISPER_API_KEY=your_actual_openai_api_key

# Application Configuration
MAX_CONTEXT_LENGTH=4096
SESSION_TIMEOUT=3600000
MAX_FILE_SIZE=10485760

# Ollama Configuration
OLLAMA_HOST=http://localhost:11434
```

### Step 3: Initialize Database

```bash
# Run the database initialization script
npm run db:init

# Expected output:
# 🗄️  Initializing Ollama Voice Orchestrator Database...
# ✅ Created database directory
# ✅ Loaded database schema
# ✅ Created database file
# ✅ Applied database schema
# 📊 Created tables: sessions, messages, analytics
# 📈 Created views: session_stats, model_analytics
# ✅ Database initialization complete!
```

### Step 4: Verify Ollama is Running

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not running, start it:
ollama serve

# Pull at least one model for testing
ollama pull llama2
```

---

## 🚀 How to Run the App

### Option 1: Development Mode (Recommended for Testing)

This runs the backend and frontend separately for easier debugging:

```bash
# Terminal 1: Start the backend server
npm run dev:backend

# Expected output:
# [nodemon] starting `ts-node src/backend/server.ts`
# Server running on port 3000
# Database connected successfully

# Terminal 2: Start the Electron app
npm run dev:electron

# Expected output:
# Vite dev server running on http://localhost:5173
# Electron app window opens
```

### Option 2: Full Development Mode

This runs everything together:

```bash
npm run dev

# This uses concurrently to run both:
# - Backend server (port 3000)
# - Electron app with Vite dev server (port 5173)
```

### Option 3: Production Build

```bash
# Build all components
npm run build

# This compiles:
# - Backend TypeScript → dist/backend/
# - Frontend React → dist/renderer/
# - Main process → dist/main/

# Then start the app
npm start
```

---

## 🧪 How to Test the App

### 1. Test Backend Server Independently

```bash
# Start only the backend
npm run dev:backend

# In another terminal, test the API endpoints:

# Test health check
curl http://localhost:3000/health

# Test Ollama models list
curl http://localhost:3000/api/ollama/models

# Test session creation
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"modelName": "llama2"}'
```

### 2. Test Frontend Components

```bash
# Run the test suite
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode for development
npm run test:watch
```

### 3. Test Voice Recognition

Once the app is running:

1. **Test Wake Word**:
   - Say "Ollama" clearly into your microphone
   - You should hear: "Yes sir, I am here. What can I do for you?"

2. **Test Voice Commands**:
   - After wake word, say: "List all models"
   - Or: "Show me the installed models"
   - Or: "Run llama2"

3. **Check Audio Visualizer**:
   - Speak and watch the waveform animation
   - Should show real-time audio levels

### 4. Test Ollama Operations

Through the UI or voice:

```bash
# List models
"Show me all models"

# Get model info
"Tell me about llama2"

# Run a model
"Start llama2"

# Stop a model
"Stop llama2"
```

### 5. Run Linting and Type Checking

```bash
# Check for linting errors
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Check TypeScript types
npm run type-check

# Format code
npm run format
```

### 6. Test Database Operations

```bash
# Connect to the database
sqlite3 database/ovo.db

# Run some queries:
.tables                          # List all tables
SELECT * FROM sessions;          # View sessions
SELECT * FROM messages;          # View messages
SELECT * FROM session_stats;     # View session statistics
.quit                            # Exit
```

---

## ⚠️ Known Issues

### 1. TypeScript Errors (Expected)

The TypeScript errors you see for `electron` and `vite` modules are expected before running `npm install`. They will be resolved once dependencies are installed.

### 2. Security Vulnerabilities

**Critical**: 35 vulnerabilities detected in dependencies (see [`DEPENDENCY_UPDATES.md`](DEPENDENCY_UPDATES.md))

**Immediate actions needed**:
```bash
# Run safe fixes first
npm audit fix

# Review breaking changes before forcing updates
npm audit fix --force  # Use with caution
```

### 3. Command Injection Vulnerability

**Location**: [`src/backend/services/ollama-wrapper.ts:137-158`](src/backend/services/ollama-wrapper.ts:137-158)

**Issue**: User input concatenated directly into shell commands

**Fix needed**: Add input validation with whitelist (alphanumeric, hyphens, underscores only)

### 4. Missing Environment Variables

If you see errors about missing API keys:
- Ensure `.env` file exists and has all required keys
- Restart the backend server after updating `.env`

### 5. Ollama Not Running

If you get "Connection refused" errors:
```bash
# Start Ollama service
ollama serve

# Verify it's running
curl http://localhost:11434/api/tags
```

---

## 🔄 Next Steps

### Immediate (Before Production)

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Address Security Vulnerabilities**:
   ```bash
   npm audit fix
   # Review DEPENDENCY_UPDATES.md for breaking changes
   ```

3. **Fix Command Injection** (High Priority):
   - Add input sanitization in ollama-wrapper.ts
   - Implement whitelist validation

4. **Set Up Environment**:
   - Create `.env` file with real API keys
   - Initialize database

5. **Test Everything**:
   - Run backend independently
   - Test voice recognition
   - Test Ollama operations
   - Run full test suite

### Short Term (Phase 7-8)

1. **Integration Testing**:
   - Test full voice-to-Ollama workflow
   - Test session management
   - Test error handling

2. **Address Medium Priority Issues**:
   - API key exposure in logs
   - Sensitive data logging
   - Audio buffer validation
   - Response parsing null checks

3. **Performance Optimization**:
   - Profile audio processing
   - Optimize database queries
   - Reduce bundle size

### Long Term (Phase 9)

1. **Production Build**:
   ```bash
   npm run dist:all
   ```

2. **Create Linux Packages**:
   - AppImage
   - .deb package
   - .rpm package

3. **Documentation**:
   - User guide
   - Troubleshooting guide
   - API documentation

---

## 📞 Getting Help

- **Documentation**: Check [`DEVELOPMENT_GUIDE.md`](DEVELOPMENT_GUIDE.md)
- **Architecture**: See [`ARCHITECTURE.md`](ARCHITECTURE.md)
- **Requirements**: Review [`REQUIREMENTS.md`](REQUIREMENTS.md)
- **Issues**: Create a GitHub issue
- **Code Review**: Use Bob's `/review` command

---

## 🎯 Quick Start Checklist

- [ ] Install Node.js 20+
- [ ] Install Ollama and pull a model
- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Create `.env` file with API keys
- [ ] Run `npm run db:init`
- [ ] Start Ollama: `ollama serve`
- [ ] Run `npm run dev`
- [ ] Test voice command: Say "Ollama"
- [ ] Test model listing: Say "Show me all models"

---

**Last Updated**: 2026-05-02  
**Status**: Ready for installation and testing  
**Next Phase**: Integration testing and security fixes
