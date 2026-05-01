# 🎙️ Ollama Voice Orchestrator (OVO)

> A professional voice-controlled desktop application for managing Ollama language models on Linux

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Electron](https://img.shields.io/badge/Electron-28-47848F.svg)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Architecture](#architecture)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

**Ollama Voice Orchestrator (OVO)** is a cutting-edge desktop application that brings voice control to Ollama model management on Linux. Say goodbye to command-line interfaces and hello to natural, conversational AI interactions.

### Why OVO?

- 🎤 **Voice-First Interface**: Control everything with your voice
- 📊 **Real-Time Analytics**: Monitor model performance and resource usage
- 💬 **Conversational AI**: Natural language interactions powered by IBM watsonx.ai
- 🎨 **Modern UI**: VS Code-inspired interface with audio visualization
- 🔒 **Professional Grade**: Enterprise-quality code with comprehensive documentation

---

## ✨ Features

### Core Capabilities

- **🎙️ Voice Control**
  - Wake word detection ("Ollama")
  - Natural language command processing
  - High-quality text-to-speech responses
  - Varied, non-repetitive feedback

- **📦 Model Management**
  - List installed models
  - View detailed model information
  - Run and stop models
  - Download new models
  - Remove unwanted models
  - Monitor running processes

- **💬 Chat Interface**
  - Conversation history
  - Session management
  - Context length monitoring
  - Multi-session support

- **📊 Analytics Dashboard**
  - Current model status
  - Memory consumption
  - CPU usage
  - System metrics

- **🎵 Audio Visualization**
  - Real-time waveform display
  - Voice activity indicators
  - Professional audio feedback

---

## 🛠️ Tech Stack

### Frontend
- **Electron 28+** - Desktop application framework
- **React 18+** - UI library
- **TypeScript 5+** - Type-safe development
- **Styled Components** - Component styling
- **Zustand** - State management
- **Web Audio API** - Audio visualization

### Backend
- **Node.js 20+** - Runtime environment
- **Express.js 4+** - REST API server
- **TypeScript 5+** - Type-safe backend
- **SQLite3** - Local database
- **Winston** - Logging system

### AI & Voice Services
- **IBM watsonx.ai** - Function calling and command processing
- **OpenAI Whisper** - Speech-to-text transcription
- **IBM Watson TTS** - Text-to-speech synthesis
- **Web Speech API** - Wake word detection

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **TypeDoc** - Documentation generation
- **electron-builder** - Application packaging

---

## 📋 Prerequisites

Before installing OVO, ensure you have:

### Required
- **Linux OS** (Ubuntu 20.04+, Fedora 35+, or equivalent)
- **Node.js 20+** and npm/pnpm
- **Ollama** installed and configured ([Installation Guide](https://ollama.ai/download))
- **Microphone** for voice input

### Optional
- **IBM Cloud Account** for watsonx.ai and Watson TTS
- **OpenAI API Key** for Whisper (or use local Whisper)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone git@github.com:Men6d656e/ibm_hackaton_bob_ide.git
cd ibm_hackaton_bob_ide
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# IBM Watson Configuration
WATSONX_API_KEY=your_watsonx_api_key
WATSONX_PROJECT_ID=your_project_id
WATSON_TTS_API_KEY=your_tts_api_key
WATSON_TTS_URL=your_tts_url

# Whisper Configuration
WHISPER_API_KEY=your_openai_api_key
# OR for local Whisper
WHISPER_MODEL_PATH=/path/to/whisper/model

# Application Configuration
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
```

### 4. Initialize Database

```bash
npm run db:init
```

### 5. Start Development Server

```bash
npm run dev
```

---

## 🎯 Usage

### Starting the Application

```bash
npm start
```

### Voice Commands

1. **Wake the Assistant**
   - Say: "Ollama"
   - Wait for response: "Yes sir, I am here. What can I do for you?"

2. **List Models**
   - Say: "Show me the installed models"
   - Or: "List all models"

3. **Run a Model**
   - Say: "Run llama2"
   - Or: "Start the mistral model"

4. **Stop a Model**
   - Say: "Stop llama2"
   - Or: "Stop the running model"

5. **Download a Model**
   - Say: "Download llama3"
   - Or: "Pull the phi-3 model"

6. **Remove a Model**
   - Say: "Remove mistral"
   - Or: "Delete the llama2 model"

7. **Get Model Info**
   - Say: "Show me information about llama2"
   - Or: "Tell me about the mistral model"

### Keyboard Shortcuts

- `Ctrl+N` - New session
- `Ctrl+L` - Clear chat
- `Ctrl+M` - Toggle microphone
- `Ctrl+,` - Open settings
- `Ctrl+Q` - Quit application

---

## 🏗️ Architecture

OVO follows a modular, layered architecture:

```
┌─────────────────────────────────────────┐
│         Electron Main Process           │
│  (Application Lifecycle & IPC)          │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
┌───────▼────────┐    ┌────────▼────────┐
│  React UI      │    │  Express API    │
│  (Renderer)    │◄───┤  (Backend)      │
└────────────────┘    └─────────────────┘
        │                       │
        │                       ├─► IBM watsonx.ai
        │                       ├─► IBM Watson TTS
        │                       ├─► Whisper STT
        │                       └─► Ollama CLI
        │
┌───────▼────────┐
│  Web Audio API │
│  (Visualizer)  │
└────────────────┘
```

For detailed architecture documentation, see [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## 💻 Development

### Project Structure

```
ollama-voice-orchestrator/
├── src/
│   ├── main/           # Electron main process
│   ├── renderer/       # React frontend
│   ├── backend/        # Express backend
│   ├── shared/         # Shared code
│   └── preload/        # Preload scripts
├── scripts/            # CLI wrapper scripts
├── database/           # Database schemas
├── docs/               # Documentation
├── tests/              # Test files
└── assets/             # Static assets
```

### Development Workflow

This project follows a **phased development approach** with code reviews at each milestone:

#### Phase-Based Development

1. **Complete a Phase** - Implement all tasks in the current phase
2. **Create Feature Branch** - Branch from main for the phase work
3. **Push to GitHub** - Push the feature branch to remote
4. **Create Pull Request** - Open PR for the completed phase
5. **Code Review with Bob** - Use Bob's review feature to analyze code
6. **Address Feedback** - Make necessary improvements
7. **Merge to Main** - Merge approved PR to main branch
8. **Sync and Continue** - Pull latest main and start next phase

#### Development Phases

- **Phase 1**: Project Setup and Documentation
- **Phase 2**: Backend Foundation
- **Phase 3**: Database and Session Management
- **Phase 4**: AI Integration Layer
- **Phase 5**: Frontend Core
- **Phase 6**: Voice Interaction System
- **Phase 7**: Integration and Features
- **Phase 8**: Testing and Polish
- **Phase 9**: Deployment and Documentation

### Development Commands

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format

# Type check
npm run type-check

# Build for production
npm run build

# Generate documentation
npm run docs
```

### Git Workflow

```bash
# Start a new phase
git checkout main
git pull origin main
git checkout -b phase-2-backend-foundation

# Make changes and commit
git add .
git commit -m "feat(backend): implement Express server with TypeScript"

# Push to GitHub
git push -u origin phase-2-backend-foundation

# Create PR on GitHub
# Use Bob's /review command to analyze the PR
# Address any feedback
# Merge PR after approval

# Sync with main
git checkout main
git pull origin main
```

### Code Style Guidelines

- **TypeScript**: Strict mode enabled
- **Naming**: camelCase for functions, PascalCase for classes
- **Comments**: JSDoc for all public APIs
- **Testing**: Minimum 70% coverage for critical paths
- **Commits**: Conventional commits format

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
6. Use Bob's review feature for code analysis
7. Address feedback and get approval
8. Merge after approval

### Contribution Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass
- Use conventional commit messages
- Request code review using Bob

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Build process or auxiliary tool changes

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Ollama](https://ollama.ai/) - For the amazing LLM runtime
- [IBM Watson](https://www.ibm.com/watson) - For AI services
- [Electron](https://www.electronjs.org/) - For the desktop framework
- [React](https://reactjs.org/) - For the UI library
- [Bob IDE](https://github.com/Men6d656e/ibm_hackaton_bob_ide) - For code review capabilities

---

## 📞 Support

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/Men6d656e/ibm_hackaton_bob_ide/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Men6d656e/ibm_hackaton_bob_ide/discussions)

---

## 🗺️ Roadmap

### Version 1.0 (Current Development)
- 🔄 Voice control for Ollama
- 🔄 Real-time analytics
- 🔄 Session management
- 🔄 Audio visualization

### Version 1.1 (Planned)
- 📋 Multi-language support
- 📋 Custom wake word training
- 📋 Model performance benchmarking
- 📋 Cloud sync for sessions

### Version 2.0 (Future)
- 📋 Plugin system
- 📋 Advanced analytics
- 📋 Model comparison tools
- 📋 Export/import functionality

---

<div align="center">

**Made with ❤️ for the IBM Hackathon**

**Repository**: [github.com/Men6d656e/ibm_hackaton_bob_ide](https://github.com/Men6d656e/ibm_hackaton_bob_ide)

[⬆ Back to Top](#-ollama-voice-orchestrator-ovo)

</div>