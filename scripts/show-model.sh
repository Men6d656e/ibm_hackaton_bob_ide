#!/bin/bash

###############################################################################
# Ollama Show Model Script
#
# Description: Shows detailed information about a specific Ollama model
# Usage: ./show-model.sh <model_name>
# Output: Model information
#
# Author: OVO Team
# Version: 1.0.0
###############################################################################

set -e  # Exit on error

# Check if model name is provided
if [ -z "$1" ]; then
    echo '{"error": "Model name is required"}' >&2
    exit 1
fi

MODEL_NAME="$1"

# Check if ollama is installed
if ! command -v ollama &> /dev/null; then
    echo '{"error": "Ollama CLI not found. Please install Ollama."}' >&2
    exit 1
fi

# Execute ollama show command
output=$(ollama show "$MODEL_NAME" 2>&1)

# Check if command was successful
if [ $? -ne 0 ]; then
    echo "{\"error\": \"Failed to show model: $output\"}" >&2
    exit 1
fi

# Output the result
echo "$output"
exit 0

# Made with Bob
