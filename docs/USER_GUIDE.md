## Ollama Voice Orchestrator (OVO) - User Guide

### 📖 Table of Contents

- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Voice Commands](#voice-commands)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Features](#features)
- [Settings](#settings)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

---

## 🎯 Introduction

Ollama Voice Orchestrator (OVO) is a powerful desktop application that provides voice control for Ollama language models. With OVO, you can manage your AI models, create chat sessions, and interact with language models using natural voice commands.

### Key Features

- 🎙️ **Voice Control**: Use wake word detection and natural language commands
- 💬 **Chat Interface**: Clean, intuitive chat interface for model interactions
- 📊 **Analytics Dashboard**: Real-time statistics and performance metrics
- 🔄 **Session Management**: Save and restore conversation sessions
- ⌨️ **Keyboard Shortcuts**: Efficient keyboard navigation
- 🎨 **Modern UI**: VS Code-inspired dark theme interface

---

## 🚀 Getting Started

### First Launch

1. **Start the Application**
   - Launch OVO from your application menu
   - Or run `ollama-voice-orchestrator` from terminal

2. **Initial Setup**
   - OVO will automatically detect installed Ollama models
   - If no models are found, you'll be prompted to install one

3. **Create Your First Session**
   - Click "New Session" or press `Ctrl+N`
   - Select a model from the dropdown
   - Enter a session title
   - Click "Create"

### System Requirements

- **Operating System**: Linux (Ubuntu 20.04+, Fedora 35+, or equivalent)
- **Ollama**: Version 0.1.0 or higher
- **RAM**: Minimum 4GB (8GB+ recommended)
- **Disk Space**: 500MB for application + model storage
- **Audio**: Microphone for voice input (optional)

---

## 🎙️ Voice Commands

### Wake Word

OVO uses "Hey Ollama" as the default wake word. Once activated, you can speak your command.

**Example**:
```
You: "Hey Ollama"
OVO: *listening indicator appears*
You: "List all available models"
OVO: *executes command and responds*
```

### Available Commands

#### Model Management

| Command | Description | Example |
|---------|-------------|---------|
| List models | Show all installed models | "List all models" |
| Run model | Start a specific model | "Run llama2" |
| Stop model | Stop a running model | "Stop the current model" |
| Pull model | Download a new model | "Download llama3" |
| Remove model | Delete an installed model | "Remove old-model" |
| Show model info | Display model details | "Show info for llama2" |

#### Session Management

| Command | Description | Example |
|---------|-------------|---------|
| New session | Create a new chat session | "Create new session" |
| Load session | Open an existing session | "Load my previous session" |
| Save session | Save current conversation | "Save this session" |
| Clear messages | Clear current chat | "Clear all messages" |

#### General Commands

| Command | Description | Example |
|---------|-------------|---------|
| Help | Show available commands | "Show help" |
| Settings | Open settings panel | "Open settings" |
| Quit | Exit the application | "Quit application" |

### Voice Input Tips

- **Speak Clearly**: Enunciate your words clearly
- **Reduce Background Noise**: Use in a quiet environment
- **Wait for Confirmation**: Wait for the listening indicator before speaking
- **Natural Language**: Use natural, conversational language
- **Retry if Needed**: If not understood, try rephrasing

---

## ⌨️ Keyboard Shortcuts

### Global Shortcuts

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+N` | New Session | Create a new chat session |
| `Ctrl+K` | Clear Messages | Clear current conversation |
| `Ctrl+B` | Toggle Sidebar | Show/hide the sidebar |
| `Ctrl+Shift+V` | Toggle Voice | Enable/disable voice input |
| `Ctrl+/` | Focus Search | Focus the search/command input |
| `Ctrl+,` | Open Settings | Open settings panel |
| `Ctrl+?` | Show Shortcuts | Display keyboard shortcuts help |
| `Escape` | Close Modal | Close any open modal/dialog |

### Chat Shortcuts

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Enter` | Send Message | Send the current message |
| `Shift+Enter` | New Line | Add a new line in message |
| `Ctrl+Enter` | Send Message | Alternative send shortcut |

### Navigation Shortcuts

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+1` | Focus Chat | Focus on chat panel |
| `Ctrl+2` | Focus Sidebar | Focus on sidebar |
| `Ctrl+3` | Focus Analytics | Focus on analytics panel |

---

## 🎨 Features

### Chat Interface

The chat interface provides a clean, intuitive way to interact with language models.

**Features**:
- Message history with timestamps
- Voice input indicator
- Processing time display
- Error handling and retry
- Auto-scroll to latest message
- Copy message content
- Message search

**Usage**:
1. Type your message in the input field
2. Press `Enter` or click the send button
3. View the model's response in the chat panel
4. Continue the conversation naturally

### Session Management

Sessions allow you to save and restore conversations.

**Creating a Session**:
1. Click "New Session" button
2. Select a model
3. Enter a descriptive title
4. Click "Create"

**Loading a Session**:
1. Click on a session in the sidebar
2. The conversation history will load
3. Continue where you left off

**Session Features**:
- Automatic saving
- Session search
- Session statistics
- Export/import sessions
- Session tags and categories

### Analytics Dashboard

The analytics dashboard provides insights into your usage.

**Metrics Displayed**:
- Total messages sent
- Average response time
- Context usage
- Model performance
- Session statistics
- Token usage

**Accessing Analytics**:
- Click the "Analytics" tab in the sidebar
- View real-time statistics
- Export data for analysis

### Context Monitoring

OVO monitors context length to prevent overflow.

**Context Indicators**:
- 🟢 **Normal** (0-60%): Plenty of context available
- 🟡 **Caution** (60-80%): Context filling up
- 🟠 **Warning** (80-95%): Context nearly full
- 🔴 **Critical** (95-100%): Context full, new session recommended

**When Context is Full**:
1. Save your current session
2. Create a new session
3. Continue your conversation

---

## ⚙️ Settings

### General Settings

- **Theme**: Light/Dark mode (Dark by default)
- **Language**: Interface language
- **Auto-save**: Automatically save sessions
- **Notifications**: Enable/disable notifications

### Voice Settings

- **Wake Word**: Customize wake word (default: "Hey Ollama")
- **Voice Feedback**: Enable audio responses
- **Microphone**: Select input device
- **Sensitivity**: Adjust wake word sensitivity
- **Language**: Voice recognition language

### Model Settings

- **Default Model**: Set default model for new sessions
- **Context Length**: Maximum context length
- **Temperature**: Model temperature (0.0-1.0)
- **Auto-load**: Automatically load last used model

### Advanced Settings

- **API Endpoint**: Custom Ollama API endpoint
- **Timeout**: Request timeout duration
- **Retry Attempts**: Number of retry attempts
- **Log Level**: Application log verbosity
- **Data Directory**: Location for user data

---

## 🔧 Troubleshooting

### Common Issues

#### Voice Recognition Not Working

**Problem**: Wake word not detected or voice commands not recognized

**Solutions**:
1. Check microphone permissions
2. Verify microphone is selected in settings
3. Reduce background noise
4. Adjust wake word sensitivity
5. Test microphone in system settings

#### Model Not Loading

**Problem**: Selected model fails to load

**Solutions**:
1. Verify Ollama is installed: `ollama --version`
2. Check if model is installed: `ollama list`
3. Try pulling the model: `ollama pull <model-name>`
4. Restart OVO application
5. Check system resources (RAM/CPU)

#### Connection Error

**Problem**: Cannot connect to Ollama service

**Solutions**:
1. Verify Ollama is running: `systemctl status ollama`
2. Start Ollama service: `systemctl start ollama`
3. Check API endpoint in settings
4. Verify firewall settings
5. Check Ollama logs: `journalctl -u ollama`

#### High Memory Usage

**Problem**: Application using too much memory

**Solutions**:
1. Close unused sessions
2. Clear message history
3. Reduce context length in settings
4. Restart the application
5. Check for memory leaks in logs

#### Slow Response Times

**Problem**: Model responses are slow

**Solutions**:
1. Check system resources (CPU/RAM)
2. Use a smaller model
3. Reduce context length
4. Close other applications
5. Check Ollama performance

---

## ❓ FAQ

### General Questions

**Q: Is OVO free to use?**
A: Yes, OVO is open-source and free to use under the MIT license.

**Q: Does OVO work offline?**
A: Yes, once models are downloaded, OVO works completely offline.

**Q: Can I use custom models?**
A: Yes, any model compatible with Ollama can be used with OVO.

**Q: Is my data private?**
A: Yes, all data is stored locally on your machine. No data is sent to external servers.

### Technical Questions

**Q: What models are supported?**
A: OVO supports all Ollama-compatible models including Llama, Mistral, CodeLlama, and more.

**Q: Can I run multiple models simultaneously?**
A: Yes, OVO supports running multiple models, limited by your system resources.

**Q: How much disk space do I need?**
A: The application requires ~500MB. Models vary from 2GB to 40GB+ depending on size.

**Q: Can I customize the wake word?**
A: Yes, you can customize the wake word in voice settings.

### Usage Questions

**Q: How do I export my sessions?**
A: Go to Settings > Data > Export Sessions, select sessions, and choose export format.

**Q: Can I use OVO without voice input?**
A: Yes, OVO works perfectly with keyboard and mouse input only.

**Q: How do I update OVO?**
A: Updates are available through your package manager or by downloading the latest release.

**Q: Can I use OVO on multiple computers?**
A: Yes, you can sync sessions by exporting/importing session files.

---

## 📞 Support

### Getting Help

- **Documentation**: [GitHub Wiki](https://github.com/Men6d656e/ibm_hackaton_bob_ide/wiki)
- **Issues**: [GitHub Issues](https://github.com/Men6d656e/ibm_hackaton_bob_ide/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Men6d656e/ibm_hackaton_bob_ide/discussions)

### Reporting Bugs

When reporting bugs, please include:
1. OVO version (`Help > About`)
2. Operating system and version
3. Ollama version
4. Steps to reproduce
5. Error messages or logs
6. Screenshots (if applicable)

### Feature Requests

We welcome feature requests! Please:
1. Check existing requests first
2. Describe the feature clearly
3. Explain the use case
4. Provide examples if possible

---

## 📄 License

Ollama Voice Orchestrator is licensed under the MIT License.

---

*Last Updated: 2026-05-02*
*Version: 1.0.0*

---

**Made with ❤️ by the OVO Team**