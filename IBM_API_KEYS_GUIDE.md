# 🔑 IBM Cloud API Keys Setup Guide

## Step-by-Step: Getting Your IBM Watson API Keys

### 1. Watson X AI (for AI Model Integration)

#### A. Login to IBM Cloud
1. Go to https://cloud.ibm.com/
2. Login with your IBM Cloud account

#### B. Create Watson X AI Service
1. Click **"Catalog"** in top menu
2. Search for **"Watson X.ai"** or **"watsonx.ai"**
3. Click on the service
4. Select a plan (Lite/Free tier available)
5. Click **"Create"**

#### C. Get API Key and Project ID
1. After creation, go to **"Resource list"** (hamburger menu → Resource list)
2. Find your Watson X.ai service under **"AI / Machine Learning"**
3. Click on the service name
4. Click **"Manage"** tab on the left
5. Click **"API key"** → **"Create"** (or copy existing key)
6. **Copy the API Key** - this is your `WATSONX_API_KEY`

#### D. Get Project ID
1. In the same service page, click **"Launch watsonx.ai"**
2. Create a new project or select existing one
3. Click on project name → **"Manage"** tab
4. Find **"Project ID"** in the General section
5. **Copy the Project ID** - this is your `WATSONX_PROJECT_ID`

### 2. Watson Text-to-Speech (for Voice Output)

#### A. Create TTS Service
1. Go to IBM Cloud Catalog: https://cloud.ibm.com/catalog
2. Search for **"Text to Speech"**
3. Click on the service
4. Select region (e.g., Dallas, London, Frankfurt)
5. Select plan (Lite/Free tier available - 10,000 characters/month free)
6. Click **"Create"**

#### B. Get TTS API Key and URL
1. After creation, you'll see the service dashboard
2. Click **"Manage"** tab on the left
3. You'll see:
   - **API Key** - Copy this as `WATSON_TTS_API_KEY`
   - **URL** - Copy this as `WATSON_TTS_URL`
   
Example URL formats:
- US South: `https://api.us-south.text-to-speech.watson.cloud.ibm.com`
- US East: `https://api.us-east.text-to-speech.watson.cloud.ibm.com`
- EU Germany: `https://api.eu-de.text-to-speech.watson.cloud.ibm.com`
- EU UK: `https://api.eu-gb.text-to-speech.watson.cloud.ibm.com`

## 🎤 Speech-to-Text Options (NO OpenAI Required!)

You have **3 options** for speech recognition, and **NONE require OpenAI**:

### Option 1: IBM Watson Speech-to-Text (RECOMMENDED)

#### A. Create Watson STT Service
1. Go to IBM Cloud Catalog: https://cloud.ibm.com/catalog
2. Search for **"Speech to Text"**
3. Click on the service
4. Select region
5. Select plan (Lite/Free tier available - 500 minutes/month free)
6. Click **"Create"**

#### B. Get STT API Key and URL
1. Click **"Manage"** tab
2. Copy **API Key** and **URL**

#### C. Update .env file
```bash
# Add these instead of WHISPER_API_KEY
WATSON_STT_API_KEY=your_watson_stt_api_key_here
WATSON_STT_URL=https://api.us-south.speech-to-text.watson.cloud.ibm.com
```

### Option 2: Browser Web Speech API (FREE, No API Key Needed)

The app already uses browser's built-in speech recognition! This is **completely free** and works offline.

**Just leave the Whisper/Watson STT keys empty:**
```bash
# Comment out or leave empty
# WHISPER_API_KEY=
# WATSON_STT_API_KEY=
```

The app will automatically use the browser's Web Speech API.

### Option 3: Local Whisper Model (Advanced, Offline)

If you want to run Whisper locally without OpenAI:

1. Install Whisper locally:
```bash
pip install openai-whisper
```

2. Download a model:
```bash
whisper --model base --language en --output_dir ./models
```

3. Update .env:
```bash
WHISPER_MODEL_PATH=/path/to/whisper/model
USE_LOCAL_WHISPER=true
```

## 📝 Final .env Configuration

### Minimal Setup (Using Browser Speech Recognition)
```bash
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

# Speech-to-Text: Using Browser Web Speech API (no key needed)
# Leave these commented out or empty

# Application Configuration
MAX_CONTEXT_LENGTH=4096
SESSION_TIMEOUT=3600000
MAX_FILE_SIZE=10485760

# Ollama Configuration
OLLAMA_HOST=http://localhost:11434
```

### Full Setup (Using Watson STT)
```bash
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

# Watson Speech-to-Text (Alternative to OpenAI Whisper)
WATSON_STT_API_KEY=your_watson_stt_api_key
WATSON_STT_URL=https://api.us-south.speech-to-text.watson.cloud.ibm.com

# Application Configuration
MAX_CONTEXT_LENGTH=4096
SESSION_TIMEOUT=3600000
MAX_FILE_SIZE=10485760

# Ollama Configuration
OLLAMA_HOST=http://localhost:11434
```

## 🎯 Quick Summary

### Required (Must Have):
1. ✅ **WATSONX_API_KEY** - From Watson X.ai service
2. ✅ **WATSONX_PROJECT_ID** - From Watson X.ai project
3. ✅ **WATSON_TTS_API_KEY** - From Watson Text-to-Speech service
4. ✅ **WATSON_TTS_URL** - From Watson Text-to-Speech service

### Optional (Choose One for Speech Recognition):
- 🎤 **Browser Web Speech API** (FREE, built-in, no setup)
- 🎤 **Watson STT** (FREE tier, 500 min/month)
- 🎤 **Local Whisper** (Advanced, offline)

### NOT Required:
- ❌ **OpenAI API Key** - Not needed at all!

## 🆓 Free Tier Limits

### Watson X.ai
- Lite plan available
- Check current limits at: https://cloud.ibm.com/catalog/services/watsonx-ai

### Watson Text-to-Speech
- **10,000 characters/month FREE**
- Enough for testing and light usage

### Watson Speech-to-Text
- **500 minutes/month FREE**
- Perfect for development and testing

### Browser Web Speech API
- **Completely FREE**
- No limits
- Works offline (after initial page load)

## 🔗 Useful Links

- IBM Cloud Console: https://cloud.ibm.com/
- Watson X.ai: https://cloud.ibm.com/catalog/services/watsonx-ai
- Watson TTS: https://cloud.ibm.com/catalog/services/text-to-speech
- Watson STT: https://cloud.ibm.com/catalog/services/speech-to-text
- IBM Cloud Docs: https://cloud.ibm.com/docs

## 🆘 Troubleshooting

### Can't find Watson X.ai in catalog?
- Make sure you're logged into IBM Cloud
- Try searching for "watsonx" or "watson machine learning"
- Check if your account has access to AI services

### API Key not working?
- Make sure you copied the entire key (no spaces)
- Check if the service is active in your resource list
- Verify the region matches your service URL

### TTS URL format?
- Must include `https://`
- Must match your service region
- Example: `https://api.us-south.text-to-speech.watson.cloud.ibm.com`

---

**Last Updated**: 2026-05-02  
**Status**: Complete Guide for IBM Cloud Setup  
**OpenAI Required**: NO ❌