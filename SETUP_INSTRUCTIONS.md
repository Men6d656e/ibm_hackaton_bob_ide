# 🚀 Ollama Voice Orchestrator - Setup Instructions

## Critical Fixes Applied

### 1. ✅ Updated Dependencies to Latest Versions
- **better-sqlite3**: `^11.8.1` (replaced sqlite3 for better performance and no native compilation issues)
- **uuid**: `^11.0.5` (latest version)
- **@types/express**: `^5.0.0` (latest)
- All other packages already at latest versions

### 2. ✅ Database Migration
- Migrated from `sqlite3` to `better-sqlite3`
- Updated [`src/backend/database/connection.ts`](src/backend/database/connection.ts)
- Synchronous API (no more callbacks/promises for DB operations)
- Better performance and reliability

### 3. ✅ Created Environment File
- Created [`.env`](.env) from [`.env.example`](.env.example)
- **IMPORTANT**: You must add your API keys before running!

### 4. ✅ Fixed Electron Sandbox Issue
- Created [`fix-electron-sandbox.sh`](fix-electron-sandbox.sh) script
- This fixes the SUID sandbox error you encountered

## 📋 Installation Steps

### Step 1: Install Dependencies
```bash
# Remove old node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Install fresh dependencies
npm install
```

### Step 2: Fix Electron Sandbox Permissions
```bash
# Make the script executable
chmod +x fix-electron-sandbox.sh

# Run the fix script (requires sudo)
./fix-electron-sandbox.sh
```

### Step 3: Configure API Keys
Edit the [`.env`](.env) file and add your actual API keys:

```bash
# Edit .env file
nano .env

# Or use your preferred editor
code .env
```

**Required API Keys:**
- `WATSONX_API_KEY` - Your IBM Watson X API key
- `WATSONX_PROJECT_ID` - Your Watson X project ID
- `WATSON_TTS_API_KEY` - Your Watson Text-to-Speech API key
- `WHISPER_API_KEY` - Your OpenAI API key (for Whisper STT)

### Step 4: Initialize Database
```bash
npm run db:init
```

### Step 5: Start Ollama Service
In a **separate terminal**, start Ollama:
```bash
ollama serve
```

### Step 6: Run the Application
```bash
npm run dev
```

## 🎯 What Should Happen

When you run `npm run dev`, you should see:

1. **Backend starts** on port 3000
2. **Electron window opens** with the UI
3. **No sandbox errors**
4. **Application UI loads** successfully

## 🐛 Troubleshooting

### Issue: Sandbox Error Still Appears
```bash
# Verify sandbox permissions
ls -la node_modules/electron/dist/chrome-sandbox

# Should show: -rwsr-xr-x 1 root root
# If not, run the fix script again with sudo
sudo ./fix-electron-sandbox.sh
```

### Issue: Database Errors
```bash
# Reinitialize database
rm -f database/ovo.db
npm run db:init
```

### Issue: API Key Errors
- Make sure you've edited [`.env`](.env) with real API keys
- Check that there are no extra spaces or quotes around keys
- Verify keys are valid in your IBM Cloud and OpenAI accounts

### Issue: Port Already in Use
```bash
# Change PORT in .env file
PORT=3001

# Or kill the process using port 3000
lsof -ti:3000 | xargs kill -9
```

## 📊 Verification Checklist

Before running the app, verify:

- [ ] `npm install` completed without errors
- [ ] [`fix-electron-sandbox.sh`](fix-electron-sandbox.sh) ran successfully
- [ ] [`.env`](.env) file has real API keys (not placeholder values)
- [ ] `npm run db:init` created `database/ovo.db`
- [ ] `ollama serve` is running in separate terminal
- [ ] Port 3000 is available

## 🎉 Success Indicators

You'll know it's working when:

1. ✅ Backend logs show: `Server running on port 3000`
2. ✅ Electron window opens without errors
3. ✅ UI displays with sidebar, chat panel, and controls
4. ✅ No red error messages in terminal
5. ✅ Console shows: `Connected to SQLite database`

## 📝 Next Steps After Successful Launch

1. Test voice recognition (click microphone button)
2. Try sending a chat message
3. Test Ollama model management
4. Check analytics dashboard
5. Review logs in terminal for any warnings

## 🔗 Additional Resources

- **Architecture**: [`ARCHITECTURE.md`](ARCHITECTURE.md)
- **Development Guide**: [`DEVELOPMENT_GUIDE.md`](DEVELOPMENT_GUIDE.md)
- **Testing Guide**: [`SETUP_AND_TESTING_GUIDE.md`](SETUP_AND_TESTING_GUIDE.md)
- **Project Status**: [`PROJECT_STATUS_SUMMARY.md`](PROJECT_STATUS_SUMMARY.md)

## 💡 Pro Tips

1. **Keep Ollama running**: Always have `ollama serve` running in a separate terminal
2. **Check logs**: Monitor both backend and Electron logs for issues
3. **Hot reload**: Changes to backend code will auto-reload with nodemon
4. **Frontend changes**: Vite will hot-reload React components
5. **Database inspection**: Use `sqlite3 database/ovo.db` to inspect data

## 🆘 Still Having Issues?

If you encounter problems:

1. Check the terminal output for specific error messages
2. Review [`TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md)
3. Ensure all prerequisites are installed (Node.js 20+, npm 10+, Ollama)
4. Try running `npm run type-check` to catch TypeScript errors
5. Run `npm audit` to check for security issues

---

**Last Updated**: 2026-05-02  
**Status**: Ready to Run  
**Dependencies**: Latest versions installed