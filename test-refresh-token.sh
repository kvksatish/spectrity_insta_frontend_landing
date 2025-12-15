#!/bin/bash

# Test Refresh Token Flow
# This script helps diagnose why sessions are expiring

API_BASE="http://localhost:3005/api/v1"

echo "=========================================="
echo "Refresh Token Diagnostic Test"
echo "=========================================="
echo ""

# Check if user provided a refresh token
if [ -z "$1" ]; then
  echo "Usage: ./test-refresh-token.sh <refresh_token>"
  echo ""
  echo "To get your refresh token:"
  echo "1. Login to the app"
  echo "2. Open DevTools → Application → Local Storage"
  echo "3. Copy the value of 'rt' key"
  echo "4. Run: ./test-refresh-token.sh <paste-token-here>"
  echo ""
  exit 1
fi

REFRESH_TOKEN="$1"

echo "Testing refresh token endpoint..."
echo "POST $API_BASE/auth/refresh"
echo ""

# Test the refresh endpoint
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo ""
echo "Response Body:"
echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" -eq 200 ]; then
  echo "✅ SUCCESS - Refresh token is valid"
  echo ""

  # Check response structure
  if echo "$BODY" | grep -q "access_token"; then
    echo "⚠️  WARNING: Response uses snake_case (access_token)"
    echo "   Frontend expects camelCase (accessToken)"
    echo ""
    echo "   FIX NEEDED in src/api/client.ts line 109:"
    echo "   Change: const { accessToken, refreshToken: newRefreshToken } = data.data;"
    echo "   To:     const { access_token, refresh_token } = data.data;"
  elif echo "$BODY" | grep -q "accessToken"; then
    echo "✓ Response uses camelCase (correct)"
  fi

else
  echo "❌ FAILED - Refresh token is invalid or expired"
  echo ""

  if [ "$HTTP_CODE" -eq 401 ]; then
    echo "Token is expired or invalid. User needs to login again."
  fi
fi

echo ""
echo "=========================================="
