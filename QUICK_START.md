# 🚀 Quick Start Guide

## ✅ Prerequisites Checklist

Before running, make sure you have:
- [x] Node.js 20+ installed
- [x] npm 10+ installed
- [x] Ollama installed and running
- [x] IBM Cloud account with API keys

## 📋 Step-by-Step Setup

### 1. Install Dependencies
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### 2. Fix Electron Sandbox
```bash
chmod +x fix-electron-sandbox.sh
./fix-electron-sandbox.sh
```

### 3. Initialize Database
```bash
npm run db:init
```

### 4. Configure API Keys

Edit the `.env` file and add your IBM Cloud API keys:

```bash
nano .env
```

**Required keys:**
```bash
WATSONX_API_KEY=your_actual_watsonx_api_key
WATSONX_PROJECT_ID=your_actual_project_id
WATSON_TTS_API_KEY=your_actual_tts_api_key
WATSON_TTS_URL=https://api.us-south.text-to-speech.watson.cloud.ibm.com
```

**Optional (for speech-to-text):**
- Leave empty to use browser's Web Speech API (FREE)
- Or add Watson STT keys (see [`IBM_API_KEYS_GUIDE.md`](IBM_API_KEYS_GUIDE.md))

### 5. Start Ollama

In a **separate terminal**:
```bash
ollama serve
```

Keep this running!

### 6. Run the Application
```bash
npm run dev
```

## 🎯 What Should Happen

1. **Terminal 1** (Ollama):
   ```
   time=... level=INFO msg="Listening on 127.0.0.1:11434"
   ```

2. **Terminal 2** (Application):
   ```
   [0] 🔧 Initializing database...
   [0] ✅ Database initialized successfully
   [0] 🚀 Server running on: http://localhost:3000
   [1] ✔ Launched Electron app
   ```

3. **Electron Window**: Opens with the application UI

## ❌ Common Issues & Fixes

### Issue: "Cannot find module 'better-sqlite3'"
```bash
npm install
```

### Issue: "Sandbox error"
```bash
./fix-electron-sandbox.sh
```

### Issue: "Port 3000 already in use"
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=3001
```

### Issue: "Database initialization failed"
```bash
# Remove old database and recreate
rm -f database/ovo.db
npm run db:init
```

### Issue: "Backend crashed"
Check that:
- `.env` file has valid API keys
- No syntax errors in API keys (no extra spaces/quotes)
- Ollama is running (`ollama serve`)

## 🔍 Verify Installation

### Check Database
```bash
ls -la database/ovo.db
# Should show the database file
```

### Check Sandbox Permissions
```bash
ls -la node_modules/electron/dist/chrome-sandbox
# Should show: -rwsr-xr-x 1 root root
```

### Check Environment
```bash
cat .env | grep -v "^#" | grep "="
# Should show your configured variables
```

## 📊 Testing the Application

Once running:

1. **Test Backend**: Open http://localhost:3000 in browser
   - Should see: `{"success":true,"message":"Welcome to Ollama Voice Orchestrator API"}`

2. **Test UI**: Electron window should show:
   - Sidebar with navigation
   - Chat panel in center
   - Status bar at bottom

3. **Test Voice**: Click microphone button
   - Should activate voice recognition
   - Speak a command
   - Should see transcription

4. **Test Ollama**: Try listing models
   - Should connect to Ollama
   - Should show available models

## 🆘 Still Not Working?

1. **Check all terminals for error messages**
2. **Review [`IBM_API_KEYS_GUIDE.md`](IBM_API_KEYS_GUIDE.md)** for API key setup
3. **Check [`SETUP_INSTRUCTIONS.md`](SETUP_INSTRUCTIONS.md)** for detailed troubleshooting
4. **Verify Ollama is running**: `curl http://localhost:11434/api/tags`

## 📝 Development Commands

```bash
# Run backend only
npm run dev:backend

# Run Electron only
npm run dev:electron

# Run tests
npm test

# Type check
npm run type-check

# Lint code
npm run lint

# Format code
npm run format
```

## 🎉 Success!

If you see:
- ✅ Backend running on port 3000
- ✅ Electron window opened
- ✅ No errors in terminal
- ✅ UI is responsive

**You're ready to use the Ollama Voice Orchestrator!**

---

**Need Help?** See [`IBM_API_KEYS_GUIDE.md`](IBM_API_KEYS_GUIDE.md) for API key setup or [`SETUP_INSTRUCTIONS.md`](SETUP_INSTRUCTIONS.md) for detailed instructions.