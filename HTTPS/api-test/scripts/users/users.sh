#!/bin/bash
# users.sh - curl requests for user endpoints

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Create a user
curl -X POST http://127.0.0.1:3500/users \
  -H "Content-Type: application/json" \
  -d @"$SCRIPT_DIR/../../payloads/users.json"

# Fetch all users
curl -X GET http://127.0.0.1:3500/users \
    -H "Content-Type: application/json" 

# Fetch single user (id = 1)
curl -X GET http://127.0.0.1:3500/users/1 \
    -H "Content-Type: application/json" 
