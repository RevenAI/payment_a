#!/bin/bash
# user-routes.sh - curl requests for user endpoints

# Create a user
curl -X POST http://127.0.0.1:3500/users \
     -H "Content-Type: application/json" \
     -d @../payloads/create-user.json

# Fetch all users
curl -X GET http://127.0.0.1:3500/users

# Fetch single user (id = 1)
curl -X GET http://127.0.0.1:3500/users/1
