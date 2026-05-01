# Ollama Voice Orchestrator (OVO) - Architecture Documentation

## System Architecture Overview

This document provides detailed architectural diagrams and explanations for the OVO application.

---

## High-Level Architecture

```mermaid
graph TB
    subgraph "Electron Application"
        Main[Main Process]
        Renderer[Renderer Process - React UI]
        Preload[Preload Scripts]
    end
    
    subgraph "Backend Services"
        Express[Express.js Server]
        DB[(SQLite Database)]
    end
    
    subgraph "External Services"
        Watson[IBM watsonx.ai]
        TTS[IBM Watson TTS]
        Whisper[Whisper STT]
    end
    
    subgraph "System Integration"
        Ollama[Ollama CLI]
        System[Linux System]
    end
    
    Renderer -->|IPC| Main
    Main -->|IPC| Renderer
    Renderer -->|Context Bridge| Preload
    Main -->|HTTP| Express
    Express -->|SQL| DB
    Express -->|API| Watson
    Express -->|API| TTS
    Express -->|API| Whisper
    Express -->|Shell| Ollama
    Ollama -->|Commands| System
```

---

## Component Architecture

```mermaid
graph LR
    subgraph "Frontend Layer"
        UI[React Components]
        State[State Management]
        Audio[Audio Services]
    end
    
    subgraph "Communication Layer"
        IPC[IPC Handlers]
        API[REST API Client]
    end
    
    subgraph "Backend Layer"
        Routes[Express Routes]
        Controllers[Controllers]
        Services[Business Logic]
    end
    
    subgraph "Data Layer"
        Models[Data Models]
        DB[(SQLite)]
    end
    
    UI --> State
    State --> IPC
    IPC --> API
    API --> Routes
    Routes --> Controllers
    Controllers --> Services
    Services --> Models
    Models --> DB
```

---

## Voice Interaction Flow

```mermaid
sequenceDiagram
    participant User
    participant WebSpeech as Web Speech API
    participant UI as React UI
    participant Main as Main Process
    participant Backend as Express Server
    participant Whisper as Whisper STT
    participant Watson as watsonx.ai
    participant TTS as Watson TTS
    participant Ollama as Ollama CLI
    
    User->>WebSpeech: Says "Ollama"
    WebSpeech->>UI: Wake word detected
    UI->>TTS: Request greeting
    TTS->>User: "Yes sir, I am here..."
    
    User->>UI: Speaks command
    UI->>Main: Audio data via IPC
    Main->>Backend: Forward audio
    Backend->>Whisper: Transcribe audio
    Whisper->>Backend: Text transcript
    
    Backend->>Watson: Process command
    Watson->>Backend: Function call + params
    Backend->>Ollama: Execute CLI command
    Ollama->>Backend: Command result
    
    Backend->>Watson: Format response
    Watson->>Backend: Natural language response
    Backend->>TTS: Generate speech
    TTS->>Backend: Audio data
    Backend->>Main: Response + audio
    Main->>UI: Update display
    UI->>User: Play audio response
```

---

## Data Flow Architecture

```mermaid
graph TD
    A[User Voice Input] --> B[Wake Word Detection]
    B --> C{Wake Word?}
    C -->|No| B
    C -->|Yes| D[Play Greeting]
    D --> E[Listen for Command]
    E --> F[Whisper STT]
    F --> G[Text Command]
    G --> H[watsonx.ai Processing]
    H --> I{Intent Recognition}
    I --> J[Function Call]
    J --> K[Ollama CLI Wrapper]
    K --> L[Execute Command]
    L --> M[Parse Result]
    M --> N[Store in Session]
    N --> O[Generate Response]
    O --> P[Watson TTS]
    P --> Q[Play Audio]
    Q --> R[Update UI]
    R --> S[Wait for Next Command]
    S --> B
```

---

## Session Management Flow

```mermaid
stateDiagram-v2
    [*] --> NewSession: App Start
    NewSession --> Active: Create Session
    Active --> Processing: User Command
    Processing --> Active: Command Complete
    Active --> CheckContext: After Each Message
    CheckContext --> Active: Context OK
    CheckContext --> ContextWarning: Near Limit
    ContextWarning --> Active: Continue
    ContextWarning --> NewSession: User Creates New
    Active --> Archived: Manual Close
    Archived --> [*]
```

---

## Module Dependencies

```mermaid
graph TD
    subgraph "Main Process Modules"
        MainEntry[index.ts]
        WindowMgr[window-manager.ts]
        IPCHandlers[ipc-handlers.ts]
    end
    
    subgraph "Renderer Modules"
        App[App.tsx]
        Components[Components]
        Hooks[Custom Hooks]
        Services[Frontend Services]
    end
    
    subgraph "Backend Modules"
        Server[server.ts]
        Routes[Routes]
        Controllers[Controllers]
        BizLogic[Services]
        DBModels[Models]
    end
    
    MainEntry --> WindowMgr
    MainEntry --> IPCHandlers
    IPCHandlers --> Server
    
    App --> Components
    Components --> Hooks
    Hooks --> Services
    Services --> IPCHandlers
    
    Server --> Routes
    Routes --> Controllers
    Controllers --> BizLogic
    BizLogic --> DBModels
```

---

## Technology Stack Layers

```mermaid
graph TB
    subgraph "Presentation Layer"
        React[React 18]
        TS1[TypeScript]
        Styled[Styled Components]
    end
    
    subgraph "Application Layer"
        Electron[Electron 28]
        IPC[IPC Communication]
    end
    
    subgraph "Business Logic Layer"
        Express[Express.js]
        TS2[TypeScript]
        Winston[Winston Logger]
    end
    
    subgraph "Data Layer"
        SQLite[SQLite3]
        Sessions[Session Store]
    end
    
    subgraph "Integration Layer"
        WatsonX[watsonx.ai SDK]
        WatsonTTS[Watson TTS SDK]
        WhisperAPI[Whisper API]
        OllamaWrapper[Ollama CLI Wrapper]
    end
    
    React --> Electron
    Electron --> Express
    Express --> SQLite
    Express --> WatsonX
    Express --> WatsonTTS
    Express --> WhisperAPI
    Express --> OllamaWrapper
```

---

## File System Structure

```
ollama-voice-orchestrator/
│
├── src/
│   ├── main/                    # Electron Main Process
│   │   ├── index.ts            # Entry point, app lifecycle
│   │   ├── window-manager.ts   # Window creation and management
│   │   └── ipc-handlers.ts     # IPC communication handlers
│   │
│   ├── renderer/                # React Frontend
│   │   ├── components/
│   │   │   ├── AudioVisualizer/
│   │   │   │   ├── AudioVisualizer.tsx
│   │   │   │   ├── AudioVisualizer.styles.ts
│   │   │   │   └── index.ts
│   │   │   ├── ChatPanel/
│   │   │   │   ├── ChatPanel.tsx
│   │   │   │   ├── Message.tsx
│   │   │   │   ├── ChatInput.tsx
│   │   │   │   └── index.ts
│   │   │   ├── SidePanel/
│   │   │   │   ├── SidePanel.tsx
│   │   │   │   ├── ModelList.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Analytics/
│   │   │   │   ├── Analytics.tsx
│   │   │   │   ├── MetricCard.tsx
│   │   │   │   └── index.ts
│   │   │   └── VoiceIndicator/
│   │   │       ├── VoiceIndicator.tsx
│   │   │       └── index.ts
│   │   ├── hooks/
│   │   │   ├── useVoiceRecognition.ts
│   │   │   ├── useAudioVisualizer.ts
│   │   │   ├── useSession.ts
│   │   │   └── useOllama.ts
│   │   ├── services/
│   │   │   ├── ipc-service.ts
│   │   │   ├── audio-service.ts
│   │   │   └── api-client.ts
│   │   ├── store/
│   │   │   ├── index.ts
│   │   │   ├── session-store.ts
│   │   │   └── ui-store.ts
│   │   ├── App.tsx
│   │   └── index.tsx
│   │
│   ├── backend/                 # Express Backend
│   │   ├── controllers/
│   │   │   ├── ollama-controller.ts
│   │   │   ├── session-controller.ts
│   │   │   └── voice-controller.ts
│   │   ├── services/
│   │   │   ├── ollama-wrapper.ts
│   │   │   ├── watsonx-service.ts
│   │   │   ├── whisper-service.ts
│   │   │   ├── tts-service.ts
│   │   │   └── session-manager.ts
│   │   ├── models/
│   │   │   ├── session.model.ts
│   │   │   ├── message.model.ts
│   │   │   └── analytics.model.ts
│   │   ├── routes/
│   │   │   ├── ollama.routes.ts
│   │   │   ├── session.routes.ts
│   │   │   └── voice.routes.ts
│   │   ├── middleware/
│   │   │   ├── error-handler.ts
│   │   │   ├── logger.ts
│   │   │   └── validator.ts
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── watson.ts
│   │   │   └── constants.ts
│   │   └── server.ts
│   │
│   ├── shared/
│   │   ├── types/
│   │   │   ├── ollama.types.ts
│   │   │   ├── session.types.ts
│   │   │   └── voice.types.ts
│   │   └── constants/
│   │       └── app-constants.ts
│   │
│   └── preload/
│       └── index.ts
│
├── scripts/
│   ├── list-models.sh
│   ├── show-model.sh
│   ├── run-model.sh
│   ├── stop-model.sh
│   ├── pull-model.sh
│   ├── remove-model.sh
│   └── get-running-models.sh
│
└── database/
    └── schema.sql
```

---

## API Endpoints Design

### Ollama Operations
```
GET    /api/ollama/models              # List all models
GET    /api/ollama/models/:name        # Get model details
POST   /api/ollama/models/run          # Run a model
POST   /api/ollama/models/stop         # Stop a model
POST   /api/ollama/models/pull         # Download a model
DELETE /api/ollama/models/:name        # Remove a model
GET    /api/ollama/running             # List running models
```

### Session Management
```
GET    /api/sessions                   # Get all sessions
GET    /api/sessions/:id               # Get session by ID
POST   /api/sessions                   # Create new session
PUT    /api/sessions/:id               # Update session
DELETE /api/sessions/:id               # Delete session
GET    /api/sessions/:id/messages      # Get session messages
POST   /api/sessions/:id/messages      # Add message to session
```

### Voice Operations
```
POST   /api/voice/transcribe           # Transcribe audio to text
POST   /api/voice/synthesize           # Convert text to speech
POST   /api/voice/process-command      # Process voice command
```

### Analytics
```
GET    /api/analytics/models           # Get model analytics
GET    /api/analytics/system           # Get system metrics
```

---

## IPC Communication Channels

### Main → Renderer
```typescript
// Window events
'window:ready'
'window:focus'
'window:blur'

// Ollama events
'ollama:model-list-updated'
'ollama:model-started'
'ollama:model-stopped'

// Session events
'session:created'
'session:updated'
'session:context-warning'

// Voice events
'voice:wake-word-detected'
'voice:transcription-complete'
'voice:response-ready'
```

### Renderer → Main
```typescript
// Ollama commands
'ollama:list-models'
'ollama:show-model'
'ollama:run-model'
'ollama:stop-model'
'ollama:pull-model'
'ollama:remove-model'

// Session commands
'session:create'
'session:get-current'
'session:add-message'

// Voice commands
'voice:start-listening'
'voice:stop-listening'
'voice:process-audio'
```

---

## State Management Structure

```typescript
// Global Application State
interface AppState {
  // UI State
  ui: {
    sidebarOpen: boolean;
    activeView: 'chat' | 'models' | 'settings';
    theme: 'light' | 'dark';
  };
  
  // Session State
  session: {
    currentSessionId: string | null;
    sessions: Session[];
    messages: Message[];
    contextLength: number;
    maxContextLength: number;
  };
  
  // Ollama State
  ollama: {
    models: OllamaModel[];
    runningModels: RunningModel[];
    currentModel: string | null;
  };
  
  // Voice State
  voice: {
    isListening: boolean;
    isProcessing: boolean;
    wakeWordDetected: boolean;
    lastTranscript: string | null;
  };
  
  // Analytics State
  analytics: {
    modelMetrics: ModelMetrics[];
    systemMetrics: SystemMetrics;
  };
}
```

---

## Error Handling Strategy

```mermaid
graph TD
    A[Error Occurs] --> B{Error Type}
    B -->|Network Error| C[Retry Logic]
    B -->|CLI Error| D[Parse Error Message]
    B -->|Voice Error| E[Fallback to Text]
    B -->|Session Error| F[Create New Session]
    B -->|Unknown Error| G[Log and Notify]
    
    C --> H[Max Retries?]
    H -->|No| C
    H -->|Yes| G
    
    D --> I[User-Friendly Message]
    E --> I
    F --> I
    G --> I
    
    I --> J[Display in UI]
    J --> K[Log to File]
```

---

## Security Architecture

```mermaid
graph TB
    subgraph "Security Layers"
        A[Input Validation]
        B[Command Sanitization]
        C[API Key Management]
        D[IPC Security]
        E[Data Encryption]
    end
    
    User[User Input] --> A
    A --> B
    B --> CLI[CLI Execution]
    
    Config[Config Files] --> C
    C --> APIs[External APIs]
    
    Renderer[Renderer Process] --> D
    D --> Main[Main Process]
    
    DB[Database] --> E
    E --> Storage[Encrypted Storage]
```

---

## Performance Optimization Strategy

### Frontend Optimizations
- React.memo for expensive components
- Virtual scrolling for chat history
- Web Workers for audio processing
- RequestAnimationFrame for visualizer
- Lazy loading for routes

### Backend Optimizations
- Connection pooling for database
- Caching for frequent queries
- Async/await for non-blocking operations
- Stream processing for large responses
- Rate limiting for API calls

### Memory Management
- Cleanup old sessions periodically
- Limit message history in memory
- Release audio buffers after use
- Garbage collection hints
- Monitor memory usage

---

## Deployment Architecture

```mermaid
graph LR
    subgraph "Development"
        Dev[Developer Machine]
        Git[Git Repository]
    end
    
    subgraph "Build Process"
        CI[CI/CD Pipeline]
        Build[Electron Builder]
        Test[Automated Tests]
    end
    
    subgraph "Distribution"
        AppImage[AppImage]
        DEB[.deb Package]
        RPM[.rpm Package]
    end
    
    Dev --> Git
    Git --> CI
    CI --> Test
    Test --> Build
    Build --> AppImage
    Build --> DEB
    Build --> RPM
```

---

## Monitoring and Logging

```typescript
// Logging Levels
enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace'
}

// Log Structure
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  metadata?: Record<string, any>;
  error?: Error;
}

// Monitoring Metrics
interface Metrics {
  // Performance
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  
  // Usage
  commandsExecuted: number;
  sessionsCreated: number;
  voiceInteractions: number;
  
  // Errors
  errorCount: number;
  errorRate: number;
}
```

---

*This architecture document will be updated as the project evolves.*