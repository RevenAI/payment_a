#!/usr/bin/env bash

# payments.sh - curl requests for payment endpoints
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ------------------------------------------
# Globals
# ------------------------------------------
BASE_URL=http://127.0.0.1:3500
JSON_HEADER="Content-Type: application/json"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoiYXlvbWlkZTMwMzBAZ21haWwuY29tIiwiZXhwIjoxNzY5MzMwNzM0fQ.f0PGv-pq-zwJG4CwzEqbZPtwr3jQ0tPwtHwIlYWEOS4"

# ------------------------------------------
# Initialize a payment
# POST /payments
# ------------------------------------------
# curl -X POST $BASE_URL/payments \
#   -H "$JSON_HEADER" \
#   -H "Authorization: Bearer $TOKEN" \
#   -d @"$SCRIPT_DIR/../../payloads/payments.init.json"

# ------------------------------------------
# Pay for a product
# POST /payments/pay-product
# ------------------------------------------
# curl -X POST $BASE_URL/payments/pay-product \
#   -H "$JSON_HEADER" \
#   -H "Authorization: Bearer $TOKEN" \
#   -d @"$SCRIPT_DIR/../../payloads/payments.product.json"

# ------------------------------------------
# Fetch all payments
# GET /payments
# ------------------------------------------
curl -X GET $BASE_URL/payments \
  -H "$JSON_HEADER" \
  ${TOKEN:+-H "Authorization: Bearer $TOKEN"}

# ------------------------------------------
# Fetch single payment (by paymentId)
# GET /payments/:paymentId
# ------------------------------------------
# curl -X GET $BASE_URL/payments/1 \
#   -H "$JSON_HEADER" \
#   -H "Authorization: Bearer $TOKEN"

# ------------------------------------------
# Verify payment
# GET /payments/verify/:reference
# ------------------------------------------
# curl -X GET $BASE_URL/payments/verify/PAY_1700000000000_123456 \
#   -H "$JSON_HEADER" \
#   -H "Authorization: Bearer $TOKEN"
