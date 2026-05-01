# Ollama Voice Orchestrator (OVO) - Project Requirements

## Project Overview

**Project Name:** Ollama Voice Orchestrator (OVO)  
**Version:** 1.0.0  
**Platform:** Linux Desktop Application  
**Purpose:** Voice-controlled desktop application for managing Ollama models with real-time analytics and conversational AI interface

## Executive Summary

OVO is a professional-grade Electron desktop application designed to provide Linux users with an intuitive, voice-controlled interface for managing Ollama language models. The application eliminates the need for command-line interactions by offering a modern UI with voice commands, real-time analytics, and conversational AI capabilities.

---

## Core Features

### 1. Voice Interaction System
- **Wake Word Detection:** "Ollama" triggers the assistant
- **Voice Responses:** Varied, natural responses (not repetitive)
- **Speech-to-Text:** Whisper integration for accurate transcription
- **Text-to-Speech:** IBM Watson TTS for high-quality voice output
- **Response Time:** 5-15 seconds for model listing and operations

### 2. User Interface
- **Layout:** VS Code/Bob-style side panel design
- **Chat Panel:** Conversation history between user and AI
- **Audio Visualizer:** Real-time audio waveform display
- **Analytics Dashboard:** 
  - Current model information
  - Memory consumption metrics
  - System resource usage
  - Model status indicators

### 3. Ollama Management
Voice-controlled operations for:
- List installed models
- Show model information
- Run/start models
- Stop running models
- Download/pull models
- Remove models
- Copy models
- View running processes

### 4. Session Management
- Store current conversation session
- Context length monitoring
- Automatic session overflow detection
- Manual "New Session" button
- Session history persistence

---

## Technical Architecture

### Tech Stack

#### Frontend
- **Framework:** Electron 28+ with React 18+
- **Language:** TypeScript 5+
- **UI Library:** React with styled-components or Tailwind CSS
- **State Management:** Zustand or Redux Toolkit
- **Audio Visualization:** Web Audio API + Canvas/WebGL
- **Build Tool:** Vite or Webpack 5

#### Backend
- **Runtime:** Node.js 20+ LTS
- **Framework:** Express.js 4+
- **Language:** TypeScript 5+
- **Database:** SQLite3 (for session storage)
- **Process Management:** child_process for Ollama CLI

#### AI & Voice Services
- **LLM Backend:** IBM watsonx.ai (function calling model)
- **Speech-to-Text:** OpenAI Whisper (local or API)
- **Text-to-Speech:** IBM Watson Text-to-Speech
- **Wake Word:** Web Speech API (browser-based)

#### Development Tools
- **Linting:** ESLint with TypeScript rules
- **Formatting:** Prettier
- **Testing:** Jest + React Testing Library
- **Documentation:** JSDoc + TypeDoc
- **Version Control:** Git
- **Package Manager:** npm or pnpm

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     ELECTRON MAIN PROCESS                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Application Orchestrator                   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────────┐    ┌─────────────┐
│   RENDERER   │    │  BACKEND SERVER  │    │  OLLAMA CLI │
│   (React)    │◄───┤   (Express.js)   │◄───┤   WRAPPER   │
└──────────────┘    └──────────────────┘    └─────────────┘
        │                     │                     │
        │                     ▼                     │
        │            ┌──────────────────┐          │
        │            │  IBM watsonx.ai  │          │
        │            │ (Function Calls) │          │
        │            └──────────────────┘          │
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────────┐    ┌─────────────┐
│ Web Speech   │    │  IBM Watson TTS  │    │   SQLite    │
│     API      │    │                  │    │  Database   │
└──────────────┘    └──────────────────┘    └─────────────┘
        │                     │
        ▼                     ▼
┌──────────────┐    ┌──────────────────┐
│   Whisper    │    │  Audio Visualizer│
│     STT      │    │   (Web Audio)    │
└──────────────┘    └──────────────────┘
```

---

## Data Flow

### Voice Command Flow
1. User says "Ollama" → Web Speech API detects wake word
2. System responds with varied greeting via IBM Watson TTS
3. User speaks command → Whisper transcribes to text
4. Text sent to IBM watsonx.ai for intent recognition
5. watsonx.ai returns function call with parameters
6. Backend executes Ollama CLI command via wrapper
7. Result processed and sent to IBM Watson TTS
8. Voice response played to user
9. UI updated with conversation history and analytics

### Session Management Flow
1. Each conversation stored in SQLite with timestamp
2. Context length tracked per session
3. When limit approached, system notifies user
4. User can manually start new session via button
5. Previous sessions archived and retrievable

---

## Project Structure

```
ollama-voice-orchestrator/
├── src/
│   ├── main/                    # Electron main process
│   │   ├── index.ts            # Main entry point
│   │   ├── ipc-handlers.ts     # IPC communication handlers
│   │   └── window-manager.ts   # Window lifecycle management
│   │
│   ├── renderer/                # Electron renderer (React)
│   │   ├── components/         # React components
│   │   │   ├── AudioVisualizer/
│   │   │   ├── ChatPanel/
│   │   │   ├── SidePanel/
│   │   │   ├── Analytics/
│   │   │   └── VoiceIndicator/
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # Frontend services
│   │   ├── store/              # State management
│   │   ├── styles/             # Global styles
│   │   ├── types/              # TypeScript types
│   │   ├── utils/              # Utility functions
│   │   ├── App.tsx             # Root component
│   │   └── index.tsx           # Renderer entry
│   │
│   ├── backend/                 # Express.js backend
│   │   ├── controllers/        # Route controllers
│   │   ├── services/           # Business logic
│   │   │   ├── ollama-wrapper.ts
│   │   │   ├── watsonx-service.ts
│   │   │   ├── whisper-service.ts
│   │   │   ├── tts-service.ts
│   │   │   └── session-manager.ts
│   │   ├── models/             # Database models
│   │   ├── routes/             # API routes
│   │   ├── middleware/         # Express middleware
│   │   ├── utils/              # Backend utilities
│   │   ├── config/             # Configuration
│   │   └── server.ts           # Server entry point
│   │
│   ├── shared/                  # Shared code
│   │   ├── types/              # Shared TypeScript types
│   │   ├── constants/          # Shared constants
│   │   └── utils/              # Shared utilities
│   │
│   └── preload/                 # Electron preload scripts
│       └── index.ts
│
├── scripts/                     # Ollama CLI wrapper scripts
│   ├── list-models.sh
│   ├── show-model.sh
│   ├── run-model.sh
│   ├── stop-model.sh
│   ├── pull-model.sh
│   ├── remove-model.sh
│   └── get-running-models.sh
│
├── database/                    # SQLite database
│   └── schema.sql
│
├── docs/                        # Documentation
│   ├── architecture.md
│   ├── api-reference.md
│   ├── user-guide.md
│   └── development.md
│
├── tests/                       # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── assets/                      # Static assets
│   ├── icons/
│   ├── sounds/
│   └── images/
│
├── .eslintrc.js                # ESLint configuration
├── .prettierrc                 # Prettier configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Project dependencies
├── electron-builder.json       # Build configuration
├── README.md                   # Project README
├── REQUIREMENTS.md             # This file
└── .gitignore                  # Git ignore rules
```

---

## Ollama CLI Operations

### Available Commands (from `ollama --help`)

| Command | Purpose | Script |
|---------|---------|--------|
| `list` | List all installed models | `list-models.sh` |
| `show` | Show information for a model | `show-model.sh` |
| `run` | Run a model | `run-model.sh` |
| `stop` | Stop a running model | `stop-model.sh` |
| `pull` | Download a model from registry | `pull-model.sh` |
| `push` | Push a model to registry | `push-model.sh` |
| `ps` | List running models | `get-running-models.sh` |
| `cp` | Copy a model | `copy-model.sh` |
| `rm` | Remove a model | `remove-model.sh` |
| `create` | Create a custom model | `create-model.sh` |

---

## Function Calling Schema (watsonx.ai)

### Tool Definitions

```typescript
const tools = [
  {
    name: "list_models",
    description: "List all installed Ollama models",
    parameters: {}
  },
  {
    name: "show_model",
    description: "Show detailed information about a specific model",
    parameters: {
      model_name: { type: "string", required: true }
    }
  },
  {
    name: "run_model",
    description: "Start running a specific model",
    parameters: {
      model_name: { type: "string", required: true }
    }
  },
  {
    name: "stop_model",
    description: "Stop a running model",
    parameters: {
      model_name: { type: "string", required: true }
    }
  },
  {
    name: "pull_model",
    description: "Download a model from the registry",
    parameters: {
      model_name: { type: "string", required: true }
    }
  },
  {
    name: "remove_model",
    description: "Remove an installed model",
    parameters: {
      model_name: { type: "string", required: true }
    }
  },
  {
    name: "list_running_models",
    description: "List all currently running models",
    parameters: {}
  }
];
```

---

## Database Schema

### Sessions Table
```sql
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  context_length INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  token_count INTEGER,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);
```

### Model Analytics Table
```sql
CREATE TABLE model_analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  model_name TEXT NOT NULL,
  memory_usage INTEGER,
  cpu_usage REAL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Voice Response Variations

### Wake Word Responses (Random Selection)
- "Yes sir, I am here. What can I do for you?"
- "Hello! I'm ready to assist. What do you need?"
- "At your service! How may I help you today?"
- "I'm listening. What would you like to know?"
- "Ready when you are! What's on your mind?"
- "Here and ready! What can I help you with?"

---

## Professional Code Standards

### Documentation Requirements
1. **JSDoc Comments:** All functions, classes, and modules
2. **Inline Comments:** Complex logic and algorithms
3. **README Files:** Each major directory
4. **API Documentation:** All endpoints and services
5. **Architecture Diagrams:** System design and data flow

### Code Quality Standards
1. **TypeScript:** Strict mode enabled
2. **ESLint:** No warnings or errors
3. **Prettier:** Consistent formatting
4. **Test Coverage:** Minimum 70% for critical paths
5. **Error Handling:** Comprehensive try-catch blocks
6. **Logging:** Structured logging with levels

### Naming Conventions
- **Files:** kebab-case (e.g., `ollama-wrapper.ts`)
- **Classes:** PascalCase (e.g., `SessionManager`)
- **Functions:** camelCase (e.g., `listModels()`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_CONTEXT_LENGTH`)
- **Interfaces:** PascalCase with 'I' prefix (e.g., `ISession`)

---

## Performance Requirements

### Response Times
- Wake word detection: < 500ms
- Voice transcription: < 2 seconds
- Command execution: 5-15 seconds (depending on operation)
- UI updates: < 100ms
- Audio visualization: 60 FPS

### Resource Usage
- Memory: < 500MB idle, < 1GB active
- CPU: < 10% idle, < 30% during voice processing
- Disk: < 200MB application size

---

## Security Considerations

1. **API Keys:** Store in environment variables, never commit
2. **User Data:** Encrypt sensitive session data
3. **IPC Communication:** Validate all messages between processes
4. **CLI Execution:** Sanitize all user inputs before shell execution
5. **Network Requests:** Use HTTPS for all external API calls

---

## Development Phases

### Phase 1: Project Setup (Week 1)
- Initialize project structure
- Configure build tools and linters
- Set up development environment
- Create base documentation

### Phase 2: Backend Foundation (Week 2)
- Implement Express.js server
- Create Ollama CLI wrappers
- Set up database and session management
- Build API endpoints

### Phase 3: AI Integration (Week 3)
- Integrate IBM watsonx.ai
- Implement Whisper STT
- Integrate Watson TTS
- Create command processing pipeline

### Phase 4: Frontend Development (Week 4)
- Build React UI components
- Implement audio visualizer
- Create analytics dashboard
- Design chat interface

### Phase 5: Voice System (Week 5)
- Implement wake word detection
- Build voice command pipeline
- Add TTS response system
- Create voice feedback variations

### Phase 6: Integration (Week 6)
- Connect all components
- Implement real-time updates
- Add session management UI
- Error handling and notifications

### Phase 7: Testing & Polish (Week 7)
- Unit and integration tests
- UI/UX refinements
- Performance optimization
- Bug fixes

### Phase 8: Deployment (Week 8)
- Build Linux packages
- Create installation guides
- Write user documentation
- Final testing and release

---

## Dependencies

### Core Dependencies
```json
{
  "electron": "^28.0.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "express": "^4.18.0",
  "typescript": "^5.3.0",
  "@ibm-cloud/watsonx-ai": "^1.0.0",
  "ibm-watson": "^8.0.0",
  "sqlite3": "^5.1.0",
  "axios": "^1.6.0",
  "winston": "^3.11.0"
}
```

### Development Dependencies
```json
{
  "eslint": "^8.55.0",
  "prettier": "^3.1.0",
  "jest": "^29.7.0",
  "@types/node": "^20.10.0",
  "@types/react": "^18.2.0",
  "electron-builder": "^24.9.0",
  "vite": "^5.0.0"
}
```

---

## Success Criteria

1. ✅ Voice wake word detection works reliably
2. ✅ All Ollama commands executable via voice
3. ✅ Response time under 15 seconds for operations
4. ✅ UI is responsive and professional
5. ✅ Audio visualizer displays in real-time
6. ✅ Analytics show accurate model information
7. ✅ Session management handles context overflow
8. ✅ Application builds and runs on Linux
9. ✅ Code is well-documented with JSDoc
10. ✅ No critical bugs or crashes

---

## Future Enhancements (Post-MVP)

1. Multi-language support
2. Custom wake word training
3. Model performance benchmarking
4. Cloud sync for sessions
5. Plugin system for extensions
6. Dark/light theme toggle
7. Keyboard shortcuts
8. Export conversation history
9. Model comparison tools
10. Advanced analytics and insights

---

## Contact & Support

**Project Lead:** Development Team  
**Repository:** [GitHub URL]  
**Documentation:** [Docs URL]  
**Issues:** [Issues URL]

---

*Last Updated: 2026-05-01*  
*Version: 1.0.0*