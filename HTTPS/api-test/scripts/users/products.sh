#!/usr/bin/env bash

# products.sh - curl requests for product endpoints
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ------------------------------------------
# Globals
# ------------------------------------------
BASE_URL=http://127.0.0.1:3500
JSON_HEADER="Content-Type: application/json"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoiYXlvbWlkZTMwMzBAZ21haWwuY29tIiwiZXhwIjoxNzY5MzMwNzM0fQ.f0PGv-pq-zwJG4CwzEqbZPtwr3jQ0tPwtHwIlYWEOS4"

# ------------------------------------------
# Create a product
# ------------------------------------------
# curl -X POST $BASE_URL/products \
#   -H "$JSON_HEADER" \
#   -H "Authorization: Bearer $TOKEN" \
#   -d @"$SCRIPT_DIR/../../payloads/products.create.json"

# ------------------------------------------
# Update existing product (PUT)
# ------------------------------------------
# curl -X PUT $BASE_URL/products/1 \
#   -H "$JSON_HEADER" \
#   -H "Authorization: Bearer $TOKEN" \
#   -d @"$SCRIPT_DIR/../../payloads/products.update.json"

# ------------------------------------------
# Partially update product (PATCH)
# ------------------------------------------
# curl -X PATCH $BASE_URL/products/1 \
#   -H "$JSON_HEADER" \
#   -H "Authorization: Bearer $TOKEN" \
#   -d '{ "price": 1500, "numberInStock": 20 }'

# ------------------------------------------
# Fetch all products
# ------------------------------------------
curl -X GET $BASE_URL/products \
  -H "$JSON_HEADER" 
 # ${TOKEN:+-H "Authorization: Bearer $TOKEN"}

# ------------------------------------------
# Fetch single product (id = 1)
# ------------------------------------------
# curl -X GET $BASE_URL/products/1 \
#   -H "$JSON_HEADER"

# ------------------------------------------
# Delete a product
# ------------------------------------------
# curl -X DELETE $BASE_URL/products/1 \
#   -H "$JSON_HEADER" \
#   -H "Authorization: Bearer $TOKEN"
