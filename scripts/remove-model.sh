#!/bin/bash

###############################################################################
# Ollama Remove Model Script
#
# Description: Removes/deletes an installed Ollama model
# Usage: ./remove-model.sh <model_name>
# Output: Success or error message
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

# Execute ollama rm command
output=$(ollama rm "$MODEL_NAME" 2>&1)

# Check if command was successful
if [ $? -ne 0 ]; then
    echo "{\"error\": \"Failed to remove model: $output\"}" >&2
    exit 1
fi

# Output success message
echo "{\"success\": true, \"message\": \"Model $MODEL_NAME removed successfully\"}"
exit 0

# Made with Bob
