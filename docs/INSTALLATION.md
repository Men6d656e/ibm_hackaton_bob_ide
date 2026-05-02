# Ollama Voice Orchestrator (OVO) - Installation Guide

## 📦 Installation Methods

OVO provides multiple installation methods for Linux systems. Choose the one that best fits your distribution and preferences.

---

## 🐧 Linux Installation

### Prerequisites

Before installing OVO, ensure you have:

1. **Ollama** installed and running
   ```bash
   # Install Ollama
   curl https://ollama.ai/install.sh | sh
   
   # Verify installation
   ollama --version
   ```

2. **System Requirements**
   - Linux kernel 4.15 or higher
   - 4GB RAM minimum (8GB+ recommended)
   - 500MB free disk space (plus space for models)
   - Audio device (for voice features)

---

### Method 1: AppImage (Recommended)

AppImage is the easiest way to run OVO on any Linux distribution.

**Download and Run**:
```bash
# Download the latest AppImage
wget https://github.com/Men6d656e/ibm_hackaton_bob_ide/releases/latest/download/Ollama-Voice-Orchestrator-1.0.0-x86_64.AppImage

# Make it executable
chmod +x Ollama-Voice-Orchestrator-1.0.0-x86_64.AppImage

# Run the application
./Ollama-Voice-Orchestrator-1.0.0-x86_64.AppImage
```

**Optional: Integrate with System**:
```bash
# Move to /opt
sudo mv Ollama-Voice-Orchestrator-1.0.0-x86_64.AppImage /opt/ovo.AppImage

# Create desktop entry
cat > ~/.local/share/applications/ovo.desktop << EOF
[Desktop Entry]
Name=Ollama Voice Orchestrator
Exec=/opt/ovo.AppImage
Icon=ollama-voice-orchestrator
Type=Application
Categories=Utility;Development;
EOF

# Update desktop database
update-desktop-database ~/.local/share/applications/
```

---

### Method 2: Debian/Ubuntu (.deb)

For Debian-based distributions (Ubuntu, Linux Mint, Pop!_OS, etc.).

**Install via Package Manager**:
```bash
# Download the .deb package
wget https://github.com/Men6d656e/ibm_hackaton_bob_ide/releases/latest/download/ollama-voice-orchestrator_1.0.0_amd64.deb

# Install the package
sudo dpkg -i ollama-voice-orchestrator_1.0.0_amd64.deb

# Install dependencies if needed
sudo apt-get install -f
```

**Verify Installation**:
```bash
# Check if installed
dpkg -l | grep ollama-voice-orchestrator

# Run the application
ollama-voice-orchestrator
```

**Uninstall**:
```bash
sudo apt-get remove ollama-voice-orchestrator
```

---

### Method 3: Fedora/RHEL (.rpm)

For RPM-based distributions (Fedora, RHEL, CentOS, openSUSE, etc.).

**Install via Package Manager**:
```bash
# Download the .rpm package
wget https://github.com/Men6d656e/ibm_hackaton_bob_ide/releases/latest/download/ollama-voice-orchestrator-1.0.0.x86_64.rpm

# Install the package (Fedora/RHEL)
sudo dnf install ollama-voice-orchestrator-1.0.0.x86_64.rpm

# Or for older systems
sudo yum install ollama-voice-orchestrator-1.0.0.x86_64.rpm
```

**Verify Installation**:
```bash
# Check if installed
rpm -qa | grep ollama-voice-orchestrator

# Run the application
ollama-voice-orchestrator
```

**Uninstall**:
```bash
sudo dnf remove ollama-voice-orchestrator
```

---

### Method 4: Tarball (.tar.gz)

For manual installation or custom setups.

**Extract and Install**:
```bash
# Download the tarball
wget https://github.com/Men6d656e/ibm_hackaton_bob_ide/releases/latest/download/ollama-voice-orchestrator-1.0.0-linux-x64.tar.gz

# Extract to /opt
sudo tar -xzf ollama-voice-orchestrator-1.0.0-linux-x64.tar.gz -C /opt/

# Create symlink
sudo ln -s /opt/ollama-voice-orchestrator/ollama-voice-orchestrator /usr/local/bin/ovo

# Run the application
ovo
```

**Uninstall**:
```bash
sudo rm -rf /opt/ollama-voice-orchestrator
sudo rm /usr/local/bin/ovo
```

---

## 🔧 Post-Installation Setup

### 1. Configure Environment Variables

Create or edit `~/.config/ollama-voice-orchestrator/.env`:

```bash
# Ollama Configuration
OLLAMA_HOST=http://localhost:11434
OLLAMA_TIMEOUT=30000

# IBM Watson Configuration (Optional)
WATSONX_API_KEY=your_api_key_here
WATSONX_PROJECT_ID=your_project_id_here
WATSONX_URL=https://us-south.ml.cloud.ibm.com

# Whisper Configuration (Optional)
WHISPER_MODEL=base
WHISPER_LANGUAGE=en

# Application Settings
LOG_LEVEL=info
MAX_CONTEXT_LENGTH=4096
AUTO_SAVE_SESSIONS=true
```

### 2. Install Ollama Models

Download at least one model to use with OVO:

```bash
# Popular models
ollama pull llama2          # 7B parameters, good balance
ollama pull llama2:13b      # 13B parameters, better quality
ollama pull mistral         # Fast and efficient
ollama pull codellama       # Optimized for code

# List installed models
ollama list
```

### 3. Configure Audio Permissions

Ensure OVO has access to your microphone:

```bash
# Check audio devices
arecord -l

# Test microphone
arecord -d 5 test.wav
aplay test.wav

# If using PulseAudio
pactl list sources

# If using PipeWire
pw-cli list-objects
```

### 4. Start Ollama Service

Ensure Ollama is running:

```bash
# Start Ollama service
systemctl start ollama

# Enable on boot
systemctl enable ollama

# Check status
systemctl status ollama
```

---

## 🚀 First Run

### Launch the Application

```bash
# From terminal
ollama-voice-orchestrator

# Or from application menu
# Search for "Ollama Voice Orchestrator"
```

### Initial Configuration Wizard

On first launch, OVO will guide you through:

1. **Model Selection**: Choose your default model
2. **Voice Setup**: Configure wake word and microphone
3. **Preferences**: Set theme and language
4. **Tutorial**: Quick walkthrough of features

---

## 🔄 Updating OVO

### AppImage

```bash
# Download latest version
wget https://github.com/Men6d656e/ibm_hackaton_bob_ide/releases/latest/download/Ollama-Voice-Orchestrator-latest-x86_64.AppImage

# Replace old version
mv Ollama-Voice-Orchestrator-latest-x86_64.AppImage /opt/ovo.AppImage
chmod +x /opt/ovo.AppImage
```

### Debian/Ubuntu

```bash
# Download latest .deb
wget https://github.com/Men6d656e/ibm_hackaton_bob_ide/releases/latest/download/ollama-voice-orchestrator_latest_amd64.deb

# Install update
sudo dpkg -i ollama-voice-orchestrator_latest_amd64.deb
```

### Fedora/RHEL

```bash
# Download latest .rpm
wget https://github.com/Men6d656e/ibm_hackaton_bob_ide/releases/latest/download/ollama-voice-orchestrator-latest.x86_64.rpm

# Install update
sudo dnf upgrade ollama-voice-orchestrator-latest.x86_64.rpm
```

---

## 🐛 Troubleshooting Installation

### Issue: "Command not found: ollama-voice-orchestrator"

**Solution**:
```bash
# Check if installed
which ollama-voice-orchestrator

# If not in PATH, add symlink
sudo ln -s /opt/ollama-voice-orchestrator/ollama-voice-orchestrator /usr/local/bin/

# Or add to PATH
echo 'export PATH="/opt/ollama-voice-orchestrator:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Issue: "Permission denied"

**Solution**:
```bash
# Make executable
chmod +x /path/to/ollama-voice-orchestrator

# Or for AppImage
chmod +x Ollama-Voice-Orchestrator.AppImage
```

### Issue: "Missing dependencies"

**Debian/Ubuntu**:
```bash
sudo apt-get install -f
sudo apt-get install libnotify4 libappindicator1 libxtst6 libnss3 libxss1 libasound2
```

**Fedora/RHEL**:
```bash
sudo dnf install libXScrnSaver libnotify libappindicator libXtst nss alsa-lib
```

### Issue: "Cannot connect to Ollama"

**Solution**:
```bash
# Check if Ollama is running
systemctl status ollama

# Start Ollama
systemctl start ollama

# Check Ollama endpoint
curl http://localhost:11434/api/tags

# Verify in OVO settings
# Settings > Advanced > API Endpoint: http://localhost:11434
```

### Issue: "Audio/Microphone not working"

**Solution**:
```bash
# Check audio permissions
groups $USER | grep audio

# Add user to audio group if needed
sudo usermod -a -G audio $USER

# Restart session or reboot
```

---

## 🗑️ Complete Uninstallation

### Remove Application

**AppImage**:
```bash
rm /opt/ovo.AppImage
rm ~/.local/share/applications/ovo.desktop
```

**Debian/Ubuntu**:
```bash
sudo apt-get remove --purge ollama-voice-orchestrator
```

**Fedora/RHEL**:
```bash
sudo dnf remove ollama-voice-orchestrator
```

### Remove User Data (Optional)

```bash
# Remove configuration and sessions
rm -rf ~/.config/ollama-voice-orchestrator

# Remove cache
rm -rf ~/.cache/ollama-voice-orchestrator

# Remove logs
rm -rf ~/.local/share/ollama-voice-orchestrator
```

---

## 📋 System Requirements Details

### Minimum Requirements

- **OS**: Linux kernel 4.15+
- **CPU**: 2 cores, 2.0 GHz
- **RAM**: 4GB
- **Storage**: 500MB (app) + 2GB+ (models)
- **Display**: 1280x720
- **Audio**: Any audio input device

### Recommended Requirements

- **OS**: Linux kernel 5.10+
- **CPU**: 4+ cores, 3.0 GHz+
- **RAM**: 8GB+
- **Storage**: 500MB (app) + 10GB+ (models)
- **Display**: 1920x1080+
- **Audio**: USB microphone or headset
- **GPU**: Optional, for faster model inference

### Tested Distributions

- ✅ Ubuntu 20.04, 22.04, 24.04
- ✅ Fedora 35, 36, 37, 38
- ✅ Debian 11, 12
- ✅ Linux Mint 20, 21
- ✅ Pop!_OS 22.04
- ✅ Arch Linux (latest)
- ✅ openSUSE Leap 15.4+

---

## 🆘 Getting Help

If you encounter issues during installation:

1. **Check Documentation**: [User Guide](./USER_GUIDE.md)
2. **Search Issues**: [GitHub Issues](https://github.com/Men6d656e/ibm_hackaton_bob_ide/issues)
3. **Ask Community**: [GitHub Discussions](https://github.com/Men6d656e/ibm_hackaton_bob_ide/discussions)
4. **Report Bug**: [New Issue](https://github.com/Men6d656e/ibm_hackaton_bob_ide/issues/new)

---

*Last Updated: 2026-05-02*
*Version: 1.0.0*