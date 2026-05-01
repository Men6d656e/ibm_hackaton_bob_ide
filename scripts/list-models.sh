#!/bin/bash

###############################################################################
# Ollama List Models Script
#
# Description: Lists all installed Ollama models
# Usage: ./list-models.sh
# Output: JSON array of models
#
# Author: OVO Team
# Version: 1.0.0
###############################################################################

set -e  # Exit on error

# Check if ollama is installed
if ! command -v ollama &> /dev/null; then
    echo '{"error": "Ollama CLI not found. Please install Ollama."}' >&2
    exit 1
fi

# Execute ollama list command and capture output
output=$(ollama list 2>&1)

# Check if command was successful
if [ $? -ne 0 ]; then
    echo "{\"error\": \"Failed to list models: $output\"}" >&2
    exit 1
fi

# Output the result
echo "$output"
exit 0

# Made with Bob
