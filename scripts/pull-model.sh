#!/bin/bash

###############################################################################
# Ollama Pull Model Script
#
# Description: Downloads/pulls an Ollama model from the registry
# Usage: ./pull-model.sh <model_name> [tag]
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
TAG="${2:-latest}"

# Construct full model name
if [ "$TAG" != "latest" ]; then
    FULL_NAME="${MODEL_NAME}:${TAG}"
else
    FULL_NAME="$MODEL_NAME"
fi

# Check if ollama is installed
if ! command -v ollama &> /dev/null; then
    echo '{"error": "Ollama CLI not found. Please install Ollama."}' >&2
    exit 1
fi

# Execute ollama pull command
output=$(ollama pull "$FULL_NAME" 2>&1)

# Check if command was successful
if [ $? -ne 0 ]; then
    echo "{\"error\": \"Failed to pull model: $output\"}" >&2
    exit 1
fi

# Output success message
echo "{\"success\": true, \"message\": \"Model $FULL_NAME downloaded successfully\"}"
exit 0

# Made with Bob
