#!/bin/bash

# Fix Electron sandbox permissions
echo "🔧 Fixing Electron sandbox permissions..."

SANDBOX_PATH="./node_modules/electron/dist/chrome-sandbox"

if [ -f "$SANDBOX_PATH" ]; then
    echo "📍 Found chrome-sandbox at: $SANDBOX_PATH"
    
    # Check if running with sudo
    if [ "$EUID" -ne 0 ]; then
        echo "⚠️  This script needs sudo privileges to fix permissions"
        echo "Running: sudo chown root:root $SANDBOX_PATH"
        sudo chown root:root "$SANDBOX_PATH"
        echo "Running: sudo chmod 4755 $SANDBOX_PATH"
        sudo chmod 4755 "$SANDBOX_PATH"
    else
        chown root:root "$SANDBOX_PATH"
        chmod 4755 "$SANDBOX_PATH"
    fi
    
    echo "✅ Sandbox permissions fixed!"
    echo ""
    echo "Permissions:"
    ls -la "$SANDBOX_PATH"
else
    echo "❌ chrome-sandbox not found at $SANDBOX_PATH"
    echo "Please run 'npm install' first"
    exit 1
fi

# Made with Bob
