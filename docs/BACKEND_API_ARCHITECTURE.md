# Backend API Architecture - Ollama Voice Orchestrator

## Overview

This document defines the complete backend API architecture for the OVO application, including Express.js server structure, API endpoints, data models, and integration patterns.

---

## Technology Stack

- **Runtime**: Node.js 20+ LTS
- **Framework**: Express.js 4.18+
- **Language**: TypeScript 5.3+
- **Database**: SQLite3
- **Logging**: Winston
- **Validation**: Joi or Zod
- **Process Management**: child_process for Ollama CLI

---

## Server Architecture

```
┌─────────────────────────────────────────────┐
│           Express.js Server                 │
├─────────────────────────────────────────────┤
│  Middleware Layer                           │
│  ├── CORS                                   │
│  ├── Body Parser                            │
│  ├── Request Logger                         │
│  ├── Error Handler                          │
│  └── Validation                             │
├─────────────────────────────────────────────┤
│  Routes Layer                               │
│  ├── /api/ollama/*                          │
│  ├── /api/sessions/*                        │
│  ├── /api/voice/*                           │
│  └── /api/analytics/*                       │
├─────────────────────────────────────────────┤
│  Controllers Layer                          │
│  ├── OllamaController                       │
│  ├── SessionController                      │
│  ├── VoiceController                        │
│  └── AnalyticsController                    │
├─────────────────────────────────────────────┤
│  Services Layer                             │
│  ├── OllamaWrapper                          │
│  ├── SessionManager                         │
│  ├── WatsonxService                         │
│  ├── WhisperService                         │
│  └── TTSService                             │
├─────────────────────────────────────────────┤
│  Data Layer                                 │
│  ├── Database Connection                    │
│  ├── Models                                 │
│  └── Repositories                           │
└─────────────────────────────────────────────┘
```

---

## API Endpoints

### 1. Ollama Operations

#### GET /api/ollama/models
List all installed Ollama models.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "name": "llama2",
      "size": "3.8GB",
      "modified": "2024-01-15T10:30:00Z",
      "digest": "sha256:abc123..."
    }
  ]
}
```

#### GET /api/ollama/models/:name
Get detailed information about a specific model.

**Parameters**:
- `name` (string): Model name

**Response**:
```json
{
  "success": true,
  "data": {
    "name": "llama2",
    "size": "3.8GB",
    "parameters": "7B",
    "quantization": "Q4_0",
    "family": "llama",
    "modified": "2024-01-15T10:30:00Z"
  }
}
```

#### POST /api/ollama/models/run
Start running a model.

**Request Body**:
```json
{
  "modelName": "llama2",
  "options": {
    "temperature": 0.7,
    "context_length": 4096
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Model llama2 started successfully",
  "data": {
    "pid": 12345,
    "status": "running"
  }
}
```

#### POST /api/ollama/models/stop
Stop a running model.

**Request Body**:
```json
{
  "modelName": "llama2"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Model llama2 stopped successfully"
}
```

#### POST /api/ollama/models/pull
Download a model from the registry.

**Request Body**:
```json
{
  "modelName": "llama3",
  "tag": "latest"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Downloading llama3...",
  "data": {
    "status": "downloading",
    "progress": 0
  }
}
```

#### DELETE /api/ollama/models/:name
Remove an installed model.

**Parameters**:
- `name` (string): Model name

**Response**:
```json
{
  "success": true,
  "message": "Model llama2 removed successfully"
}
```

#### GET /api/ollama/running
List all currently running models.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "name": "llama2",
      "pid": 12345,
      "memory": "2.1GB",
      "uptime": "00:15:32"
    }
  ]
}
```

---

### 2. Session Management

#### GET /api/sessions
Get all sessions.

**Query Parameters**:
- `limit` (number, optional): Max sessions to return
- `offset` (number, optional): Pagination offset
- `active` (boolean, optional): Filter by active status

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "sess_123",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z",
      "contextLength": 1024,
      "isActive": true,
      "messageCount": 15
    }
  ],
  "pagination": {
    "total": 50,
    "limit": 10,
    "offset": 0
  }
}
```

#### GET /api/sessions/:id
Get a specific session by ID.

**Parameters**:
- `id` (string): Session ID

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "sess_123",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "contextLength": 1024,
    "maxContextLength": 4096,
    "isActive": true,
    "messages": []
  }
}
```

#### POST /api/sessions
Create a new session.

**Request Body**:
```json
{
  "modelName": "llama2",
  "maxContextLength": 4096
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "sess_124",
    "createdAt": "2024-01-15T11:00:00Z",
    "isActive": true
  }
}
```

#### PUT /api/sessions/:id
Update a session.

**Parameters**:
- `id` (string): Session ID

**Request Body**:
```json
{
  "isActive": false
}
```

**Response**:
```json
{
  "success": true,
  "message": "Session updated successfully"
}
```

#### DELETE /api/sessions/:id
Delete a session.

**Parameters**:
- `id` (string): Session ID

**Response**:
```json
{
  "success": true,
  "message": "Session deleted successfully"
}
```

#### GET /api/sessions/:id/messages
Get all messages in a session.

**Parameters**:
- `id` (string): Session ID

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "msg_001",
      "sessionId": "sess_123",
      "role": "user",
      "content": "List all models",
      "timestamp": "2024-01-15T10:15:00Z",
      "tokenCount": 4
    },
    {
      "id": "msg_002",
      "sessionId": "sess_123",
      "role": "assistant",
      "content": "You have 3 models installed...",
      "timestamp": "2024-01-15T10:15:05Z",
      "tokenCount": 25
    }
  ]
}
```

#### POST /api/sessions/:id/messages
Add a message to a session.

**Parameters**:
- `id` (string): Session ID

**Request Body**:
```json
{
  "role": "user",
  "content": "Show me llama2 details",
  "tokenCount": 5
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "msg_003",
    "sessionId": "sess_123",
    "role": "user",
    "content": "Show me llama2 details",
    "timestamp": "2024-01-15T10:20:00Z"
  }
}
```

---

### 3. Voice Operations

#### POST /api/voice/transcribe
Transcribe audio to text using Whisper.

**Request Body** (multipart/form-data):
- `audio` (file): Audio file (WAV, MP3, etc.)
- `language` (string, optional): Language code

**Response**:
```json
{
  "success": true,
  "data": {
    "text": "Show me the installed models",
    "confidence": 0.95,
    "language": "en",
    "duration": 2.5
  }
}
```

#### POST /api/voice/synthesize
Convert text to speech using IBM Watson TTS.

**Request Body**:
```json
{
  "text": "You have 3 models installed: llama2, mistral, and phi-3",
  "voice": "en-US_AllisonV3Voice",
  "format": "audio/wav"
}
```

**Response**: Audio file (binary)

#### POST /api/voice/process-command
Process a voice command end-to-end.

**Request Body** (multipart/form-data):
- `audio` (file): Audio file
- `sessionId` (string): Current session ID

**Response**:
```json
{
  "success": true,
  "data": {
    "transcript": "List all models",
    "intent": "list_models",
    "response": "You have 3 models installed...",
    "audioUrl": "/temp/response_123.wav",
    "executionTime": 8.5
  }
}
```

---

### 4. Analytics

#### GET /api/analytics/models
Get analytics for all models.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "modelName": "llama2",
      "memoryUsage": 2100,
      "cpuUsage": 45.5,
      "lastUsed": "2024-01-15T10:30:00Z",
      "totalRuns": 150
    }
  ]
}
```

#### GET /api/analytics/system
Get system-level analytics.

**Response**:
```json
{
  "success": true,
  "data": {
    "totalMemory": 16384,
    "usedMemory": 8192,
    "cpuUsage": 35.2,
    "diskSpace": {
      "total": 512000,
      "used": 256000,
      "available": 256000
    },
    "ollamaStatus": "running"
  }
}
```

---

## Data Models

### Session Model

```typescript
interface ISession {
  id: string;
  sessionId: string;
  createdAt: Date;
  updatedAt: Date;
  contextLength: number;
  maxContextLength: number;
  isActive: boolean;
  modelName?: string;
}
```

### Message Model

```typescript
interface IMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokenCount: number;
}
```

### OllamaModel Model

```typescript
interface IOllamaModel {
  name: string;
  size: string;
  modified: Date;
  digest: string;
  parameters?: string;
  quantization?: string;
  family?: string;
}
```

### Analytics Model

```typescript
interface IModelAnalytics {
  id: string;
  modelName: string;
  memoryUsage: number;
  cpuUsage: number;
  timestamp: Date;
}
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "OLLAMA_NOT_FOUND",
    "message": "Ollama CLI not found. Please ensure Ollama is installed.",
    "details": {
      "path": "/usr/bin/ollama",
      "suggestion": "Install Ollama from https://ollama.ai"
    }
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `OLLAMA_NOT_FOUND` | 503 | Ollama CLI not available |
| `MODEL_NOT_FOUND` | 404 | Requested model doesn't exist |
| `MODEL_ALREADY_RUNNING` | 409 | Model is already running |
| `SESSION_NOT_FOUND` | 404 | Session doesn't exist |
| `INVALID_REQUEST` | 400 | Request validation failed |
| `TRANSCRIPTION_FAILED` | 500 | Audio transcription error |
| `TTS_FAILED` | 500 | Text-to-speech error |
| `WATSONX_ERROR` | 500 | watsonx.ai API error |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Middleware Stack

### 1. CORS Middleware
```typescript
app.use(cors({
  origin: 'http://localhost:*',
  credentials: true
}));
```

### 2. Body Parser
```typescript
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
```

### 3. Request Logger
```typescript
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});
```

### 4. Error Handler
```typescript
app.use((err, req, res, next) => {
  logger.error('Request error', { error: err });
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message
    }
  });
});
```

---

## Service Layer Architecture

### OllamaWrapper Service

```typescript
class OllamaWrapper {
  async listModels(): Promise<IOllamaModel[]>
  async showModel(name: string): Promise<IOllamaModel>
  async runModel(name: string, options?: any): Promise<void>
  async stopModel(name: string): Promise<void>
  async pullModel(name: string): Promise<void>
  async removeModel(name: string): Promise<void>
  async getRunningModels(): Promise<IOllamaModel[]>
}
```

### SessionManager Service

```typescript
class SessionManager {
  async createSession(modelName?: string): Promise<ISession>
  async getSession(id: string): Promise<ISession>
  async updateSession(id: string, data: Partial<ISession>): Promise<void>
  async deleteSession(id: string): Promise<void>
  async addMessage(sessionId: string, message: IMessage): Promise<void>
  async getMessages(sessionId: string): Promise<IMessage[]>
  async checkContextLength(sessionId: string): Promise<boolean>
}
```

---

## Configuration

### Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

# Database
DATABASE_PATH=./database/ovo.db

# IBM Watson
WATSONX_API_KEY=your_key
WATSONX_PROJECT_ID=your_project
WATSON_TTS_API_KEY=your_key
WATSON_TTS_URL=your_url

# Whisper
WHISPER_API_KEY=your_key
WHISPER_MODEL_PATH=/path/to/model

# Application
MAX_CONTEXT_LENGTH=4096
SESSION_TIMEOUT=3600000
```

---

## Logging Strategy

### Log Levels
- **ERROR**: Critical errors requiring immediate attention
- **WARN**: Warning conditions
- **INFO**: Informational messages
- **DEBUG**: Debug-level messages
- **TRACE**: Very detailed trace information

### Log Format
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "message": "Model started successfully",
  "context": {
    "modelName": "llama2",
    "pid": 12345
  }
}
```

---

*Last Updated: 2026-05-01*