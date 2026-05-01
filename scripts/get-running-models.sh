#!/bin/bash

###############################################################################
# Ollama Get Running Models Script
#
# Description: Lists all currently running Ollama models
# Usage: ./get-running-models.sh
# Output: List of running models with details
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

# Execute ollama ps command
output=$(ollama ps 2>&1)

# Check if command was successful
if [ $? -ne 0 ]; then
    echo "{\"error\": \"Failed to get running models: $output\"}" >&2
    exit 1
fi

# Output the result
echo "$output"
exit 0

# Made with Bob
