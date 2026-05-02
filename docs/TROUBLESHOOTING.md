# Ollama Voice Orchestrator (OVO) - Troubleshooting Guide

## 🔧 Common Issues and Solutions

This guide helps you resolve common issues with OVO. Issues are organized by category for easy navigation.

---

## 📑 Table of Contents

- [Installation Issues](#installation-issues)
- [Connection Issues](#connection-issues)
- [Voice Recognition Issues](#voice-recognition-issues)
- [Model Issues](#model-issues)
- [Performance Issues](#performance-issues)
- [UI/Display Issues](#ui-display-issues)
- [Audio Issues](#audio-issues)
- [Session Issues](#session-issues)
- [Error Messages](#error-messages)
- [Advanced Troubleshooting](#advanced-troubleshooting)

---

## 🔌 Installation Issues

### Cannot Install Package

**Symptoms**: Package installation fails with dependency errors

**Solutions**:

1. **Update package lists**:
   ```bash
   # Debian/Ubuntu
   sudo apt-get update
   
   # Fedora/RHEL
   sudo dnf update
   ```

2. **Install missing dependencies**:
   ```bash
   # Debian/Ubuntu
   sudo apt-get install -f
   
   # Fedora/RHEL
   sudo dnf install --best --allowerasing
   ```

3. **Check system requirements**:
   ```bash
   # Check kernel version
   uname -r  # Should be 4.15+
   
   # Check available RAM
   free -h  # Should have 4GB+
   
   # Check disk space
   df -h  # Should have 500MB+ free
   ```

### AppImage Won't Run

**Symptoms**: Double-clicking AppImage does nothing

**Solutions**:

1. **Make executable**:
   ```bash
   chmod +x Ollama-Voice-Orchestrator.AppImage
   ```

2. **Run from terminal to see errors**:
   ```bash
   ./Ollama-Voice-Orchestrator.AppImage
   ```

3. **Install FUSE** (if needed):
   ```bash
   # Debian/Ubuntu
   sudo apt-get install fuse libfuse2
   
   # Fedora/RHEL
   sudo dnf install fuse fuse-libs
   ```

4. **Extract and run**:
   ```bash
   ./Ollama-Voice-Orchestrator.AppImage --appimage-extract
   ./squashfs-root/AppRun
   ```

---

## 🌐 Connection Issues

### Cannot Connect to Ollama

**Symptoms**: "Connection refused" or "Cannot reach Ollama service"

**Solutions**:

1. **Check if Ollama is running**:
   ```bash
   systemctl status ollama
   # or
   ps aux | grep ollama
   ```

2. **Start Ollama service**:
   ```bash
   systemctl start ollama
   # or
   ollama serve
   ```

3. **Verify Ollama endpoint**:
   ```bash
   curl http://localhost:11434/api/tags
   ```

4. **Check firewall**:
   ```bash
   # Check if port 11434 is open
   sudo netstat -tlnp | grep 11434
   
   # Allow port if needed
   sudo ufw allow 11434
   ```

5. **Update API endpoint in OVO**:
   - Open Settings
   - Go to Advanced
   - Set API Endpoint: `http://localhost:11434`

### Network Timeout Errors

**Symptoms**: Requests timeout or take too long

**Solutions**:

1. **Increase timeout in settings**:
   - Settings > Advanced > Timeout: 60000 (60 seconds)

2. **Check network latency**:
   ```bash
   ping localhost
   curl -w "@-" -o /dev/null -s http://localhost:11434/api/tags <<'EOF'
   time_total: %{time_total}
   EOF
   ```

3. **Restart Ollama service**:
   ```bash
   systemctl restart ollama
   ```

---

## 🎙️ Voice Recognition Issues

### Wake Word Not Detected

**Symptoms**: "Hey Ollama" doesn't activate voice input

**Solutions**:

1. **Check microphone permissions**:
   ```bash
   # List audio devices
   arecord -l
   
   # Test recording
   arecord -d 5 test.wav
   aplay test.wav
   ```

2. **Verify microphone in settings**:
   - Settings > Voice > Microphone
   - Select correct input device
   - Test microphone

3. **Adjust sensitivity**:
   - Settings > Voice > Sensitivity
   - Increase if not detecting
   - Decrease if too sensitive

4. **Reduce background noise**:
   - Use in quiet environment
   - Use noise-canceling microphone
   - Adjust microphone position

5. **Check browser permissions** (if using web version):
   - Allow microphone access
   - Check site permissions

### Voice Commands Not Recognized

**Symptoms**: Commands are heard but not understood

**Solutions**:

1. **Speak clearly and slowly**:
   - Enunciate words
   - Pause between words
   - Use natural language

2. **Check language settings**:
   - Settings > Voice > Language
   - Match your speaking language

3. **Review available commands**:
   - Press `Ctrl+?` for shortcuts
   - Say "show help" for voice commands

4. **Try alternative phrasings**:
   - "List models" → "Show all models"
   - "Run llama2" → "Start llama2 model"

---

## 🤖 Model Issues

### Model Not Found

**Symptoms**: "Model not found" or "Model not available"

**Solutions**:

1. **List installed models**:
   ```bash
   ollama list
   ```

2. **Pull the model**:
   ```bash
   ollama pull llama2
   # or
   ollama pull mistral
   ```

3. **Verify model name**:
   - Use exact name from `ollama list`
   - Include tag if needed: `llama2:13b`

4. **Refresh model list in OVO**:
   - Click refresh button in model selector
   - Or restart OVO

### Model Won't Load

**Symptoms**: Model fails to start or crashes

**Solutions**:

1. **Check system resources**:
   ```bash
   # Check RAM usage
   free -h
   
   # Check CPU usage
   top
   
   # Check disk space
   df -h
   ```

2. **Try smaller model**:
   ```bash
   # Instead of llama2:70b, try:
   ollama pull llama2:7b
   ```

3. **Increase system limits**:
   ```bash
   # Edit /etc/security/limits.conf
   * soft nofile 65536
   * hard nofile 65536
   ```

4. **Check Ollama logs**:
   ```bash
   journalctl -u ollama -f
   ```

### Model Responses Are Slow

**Symptoms**: Long wait times for responses

**Solutions**:

1. **Use smaller model**:
   - 7B models are faster than 13B or 70B
   - Try `mistral` for speed

2. **Reduce context length**:
   - Settings > Model > Context Length: 2048

3. **Close other applications**:
   - Free up RAM and CPU
   - Stop other Ollama instances

4. **Check system performance**:
   ```bash
   # Monitor resources
   htop
   
   # Check for thermal throttling
   sensors
   ```

---

## ⚡ Performance Issues

### High Memory Usage

**Symptoms**: OVO uses excessive RAM

**Solutions**:

1. **Close unused sessions**:
   - Right-click session > Close
   - Keep only active sessions open

2. **Clear message history**:
   - Press `Ctrl+K` to clear current chat
   - Or Settings > Data > Clear History

3. **Reduce context length**:
   - Settings > Model > Context Length: 2048

4. **Restart application**:
   ```bash
   killall ollama-voice-orchestrator
   ollama-voice-orchestrator
   ```

### Application Freezes

**Symptoms**: UI becomes unresponsive

**Solutions**:

1. **Check for long-running operations**:
   - Wait for model loading to complete
   - Cancel long-running requests

2. **Increase system resources**:
   - Close other applications
   - Add more RAM if possible

3. **Check logs for errors**:
   ```bash
   tail -f ~/.config/ollama-voice-orchestrator/logs/app.log
   ```

4. **Force restart**:
   ```bash
   killall -9 ollama-voice-orchestrator
   ollama-voice-orchestrator
   ```

### Slow UI Response

**Symptoms**: UI lags or stutters

**Solutions**:

1. **Disable animations**:
   - Settings > Appearance > Animations: Off

2. **Reduce visual effects**:
   - Disable audio visualizer
   - Minimize analytics updates

3. **Update graphics drivers**:
   ```bash
   # Check current driver
   glxinfo | grep "OpenGL version"
   
   # Update drivers (varies by distribution)
   ```

---

## 🖥️ UI/Display Issues

### Window Won't Open

**Symptoms**: Application starts but no window appears

**Solutions**:

1. **Check if already running**:
   ```bash
   ps aux | grep ollama-voice-orchestrator
   killall ollama-voice-orchestrator
   ```

2. **Reset window position**:
   ```bash
   rm ~/.config/ollama-voice-orchestrator/window-state.json
   ```

3. **Run from terminal**:
   ```bash
   ollama-voice-orchestrator --verbose
   ```

### Display Scaling Issues

**Symptoms**: UI elements too large or too small

**Solutions**:

1. **Adjust zoom level**:
   - Press `Ctrl++` to zoom in
   - Press `Ctrl+-` to zoom out
   - Press `Ctrl+0` to reset

2. **Set display scaling**:
   - Settings > Appearance > Scale: 100%

3. **Check system DPI settings**:
   ```bash
   xdpyinfo | grep resolution
   ```

### Dark Mode Not Working

**Symptoms**: Application stays in light mode

**Solutions**:

1. **Check theme settings**:
   - Settings > Appearance > Theme: Dark

2. **Restart application**:
   ```bash
   killall ollama-voice-orchestrator
   ollama-voice-orchestrator
   ```

3. **Clear cache**:
   ```bash
   rm -rf ~/.cache/ollama-voice-orchestrator
   ```

---

## 🔊 Audio Issues

### No Audio Output

**Symptoms**: TTS responses have no sound

**Solutions**:

1. **Check system volume**:
   ```bash
   # Check volume
   amixer get Master
   
   # Unmute if needed
   amixer set Master unmute
   ```

2. **Verify audio output device**:
   - Settings > Audio > Output Device
   - Select correct device

3. **Test system audio**:
   ```bash
   speaker-test -t wav -c 2
   ```

4. **Check PulseAudio/PipeWire**:
   ```bash
   # PulseAudio
   pactl list sinks
   
   # PipeWire
   pw-cli list-objects
   ```

### Microphone Not Working

**Symptoms**: Voice input not captured

**Solutions**:

1. **Check microphone permissions**:
   ```bash
   # Test microphone
   arecord -d 5 test.wav
   aplay test.wav
   ```

2. **Add user to audio group**:
   ```bash
   sudo usermod -a -G audio $USER
   # Logout and login again
   ```

3. **Check input levels**:
   ```bash
   alsamixer
   # Press F4 for capture devices
   # Adjust input levels
   ```

4. **Select correct input device**:
   - Settings > Voice > Microphone
   - Test different devices

---

## 💾 Session Issues

### Sessions Won't Save

**Symptoms**: Sessions don't persist after restart

**Solutions**:

1. **Check auto-save setting**:
   - Settings > General > Auto-save: On

2. **Verify data directory permissions**:
   ```bash
   ls -la ~/.config/ollama-voice-orchestrator/
   chmod -R u+rw ~/.config/ollama-voice-orchestrator/
   ```

3. **Check disk space**:
   ```bash
   df -h ~/.config
   ```

4. **Manually save session**:
   - File > Save Session
   - Or press `Ctrl+S`

### Cannot Load Session

**Symptoms**: Session fails to load or shows errors

**Solutions**:

1. **Check session file integrity**:
   ```bash
   cat ~/.config/ollama-voice-orchestrator/sessions/session-id.json
   ```

2. **Restore from backup**:
   ```bash
   cp ~/.config/ollama-voice-orchestrator/backups/session-id.json \
      ~/.config/ollama-voice-orchestrator/sessions/
   ```

3. **Clear corrupted sessions**:
   - Settings > Data > Clear Corrupted Sessions

---

## ⚠️ Error Messages

### "ECONNREFUSED"

**Meaning**: Cannot connect to Ollama service

**Solution**: Start Ollama service
```bash
systemctl start ollama
```

### "Model not found"

**Meaning**: Requested model is not installed

**Solution**: Install the model
```bash
ollama pull <model-name>
```

### "Out of memory"

**Meaning**: Insufficient RAM for operation

**Solution**: 
- Close other applications
- Use smaller model
- Reduce context length

### "Permission denied"

**Meaning**: Insufficient permissions for operation

**Solution**:
```bash
# Fix permissions
chmod -R u+rw ~/.config/ollama-voice-orchestrator/

# Or run with sudo (not recommended)
sudo ollama-voice-orchestrator
```

### "Context length exceeded"

**Meaning**: Conversation too long for model

**Solution**:
- Start new session
- Reduce context length in settings
- Clear some messages

---

## 🔬 Advanced Troubleshooting

### Enable Debug Logging

```bash
# Set log level to debug
export LOG_LEVEL=debug
ollama-voice-orchestrator

# Or in settings
Settings > Advanced > Log Level: debug
```

### View Application Logs

```bash
# Application logs
tail -f ~/.config/ollama-voice-orchestrator/logs/app.log

# Error logs
tail -f ~/.config/ollama-voice-orchestrator/logs/error.log

# Ollama logs
journalctl -u ollama -f
```

### Reset to Defaults

```bash
# Backup current config
cp -r ~/.config/ollama-voice-orchestrator ~/.config/ollama-voice-orchestrator.backup

# Remove config
rm -rf ~/.config/ollama-voice-orchestrator

# Restart application (will create new config)
ollama-voice-orchestrator
```

### Check System Compatibility

```bash
# Check kernel version
uname -r

# Check glibc version
ldd --version

# Check OpenGL support
glxinfo | grep "OpenGL version"

# Check audio system
pactl info  # PulseAudio
pw-cli info  # PipeWire
```

### Collect Diagnostic Information

```bash
# Create diagnostic report
cat > ovo-diagnostic.txt << EOF
=== System Information ===
$(uname -a)
$(lsb_release -a)

=== OVO Version ===
$(ollama-voice-orchestrator --version)

=== Ollama Status ===
$(systemctl status ollama)
$(ollama list)

=== Audio Devices ===
$(arecord -l)
$(aplay -l)

=== Recent Logs ===
$(tail -n 50 ~/.config/ollama-voice-orchestrator/logs/app.log)
EOF

# Share this file when reporting issues
```

---

## 🆘 Getting Further Help

If you've tried these solutions and still have issues:

1. **Search existing issues**: [GitHub Issues](https://github.com/Men6d656e/ibm_hackaton_bob_ide/issues)
2. **Ask the community**: [GitHub Discussions](https://github.com/Men6d656e/ibm_hackaton_bob_ide/discussions)
3. **Report a bug**: [New Issue](https://github.com/Men6d656e/ibm_hackaton_bob_ide/issues/new)

When reporting issues, include:
- OVO version
- Operating system and version
- Ollama version
- Steps to reproduce
- Error messages
- Relevant logs
- Diagnostic report (see above)

---

*Last Updated: 2026-05-02*
*Version: 1.0.0*