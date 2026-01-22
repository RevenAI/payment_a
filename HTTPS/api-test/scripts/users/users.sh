#!/usr/bin/env bash

# users.sh - curl requests for user endpoints
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ------------------------------------------
# Globals
# ------------------------------------------
#API="$BASE_URL"
BASE_URL=http://127.0.0.1:3500
JSON_HEADER="Content-Type: application/json"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoiYXlvbWlkZTMwMzBAZ21haWwuY29tIiwiZXhwIjoxNzY5MzMwNzM0fQ.f0PGv-pq-zwJG4CwzEqbZPtwr3jQ0tPwtHwIlYWEOS4"

# Create a user
# curl -X POST $BASE_URL/users/ \
#   -H "$JSON_HEADER" \
#   -d @"$SCRIPT_DIR/../../payloads/users.json"

# update existing user
# curl -X PUT $BASE_URL/users/2 \
#   -H "$JSON_HEADER" \
#   -d @"$SCRIPT_DIR/../../payloads/users.json"

# Fetch all users
curl -X GET $BASE_URL/users \
    -H "$JSON_HEADER" \
     ${TOKEN:+-H "Authorization: Bearer $TOKEN"}

# Fetch single user (id = 1)
# curl -X GET $BASE_URL/users/1 \
#     -H "$JSON_HEADER" 

#delete a user
# curl -X DELETE $BASE_URL/users/1 \
#     -H "$JSON_HEADER"

#login user
# curl -X POST $BASE_URL/users/login \
#     -H "$JSON_HEADER" \
#     -d '{ "email": "ayomide3030@gmail.com", "password": "testing@user" }'
