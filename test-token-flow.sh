#!/bin/bash

# Token Flow Diagnostic Test Script
# This script tests the entire authentication flow to identify where tokens break

echo "╔════════════════════════════════════════════════════════╗"
echo "║   Token Flow Diagnostic Test                          ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Configuration
BACKEND_URL="${BACKEND_URL:-http://localhost:3005/api}"
TEST_EMAIL="${TEST_EMAIL:-test@example.com}"
TEST_PASSWORD="${TEST_PASSWORD:-Test@1234}"

echo "Configuration:"
echo "  Backend URL: $BACKEND_URL"
echo "  Test Email: $TEST_EMAIL"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
PASS=0
FAIL=0

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
        ((PASS++))
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
        ((FAIL++))
    fi
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Test 1: Backend Connectivity
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 1: Backend Connectivity"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/v1/auth/login" -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test","password":"test"}')

if [ "$HTTP_CODE" == "000" ]; then
    print_result 1 "Backend is not reachable at $BACKEND_URL"
    echo ""
    echo "Please ensure:"
    echo "  1. Backend server is running"
    echo "  2. Backend URL is correct"
    echo "  3. No firewall blocking the connection"
    exit 1
else
    print_result 0 "Backend is reachable (HTTP $HTTP_CODE)"
fi
echo ""

# Test 2: Login Endpoint Response Format
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 2: Login Endpoint Response Format"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/v1/auth/login" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"rememberMe\":true}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "Response HTTP Code: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "201" ]; then
    print_result 0 "Login request successful (HTTP $HTTP_CODE)"

    # Save response for detailed analysis
    echo "$BODY" > /tmp/login_response.json
    echo "Response body saved to: /tmp/login_response.json"
    echo ""

    # Pretty print response
    echo "Response body:"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    echo ""

    # Check for required fields
    echo "Checking response structure..."

    # Check for success field
    HAS_SUCCESS=$(echo "$BODY" | grep -o '"success"' | wc -l)
    if [ $HAS_SUCCESS -gt 0 ]; then
        print_result 0 "Response has 'success' field"
    else
        print_warning "Response missing 'success' field"
    fi

    # Check for data field
    HAS_DATA=$(echo "$BODY" | grep -o '"data"' | wc -l)
    if [ $HAS_DATA -gt 0 ]; then
        print_result 0 "Response has 'data' field"
    else
        print_result 1 "Response missing 'data' field"
    fi

    # Check for access_token (snake_case)
    HAS_ACCESS_TOKEN_SNAKE=$(echo "$BODY" | grep -o '"access_token"' | wc -l)
    # Check for accessToken (camelCase)
    HAS_ACCESS_TOKEN_CAMEL=$(echo "$BODY" | grep -o '"accessToken"' | wc -l)

    if [ $HAS_ACCESS_TOKEN_SNAKE -gt 0 ]; then
        print_result 0 "Response has 'access_token' (snake_case) ✓"
        ACCESS_TOKEN_FORMAT="snake_case"
    elif [ $HAS_ACCESS_TOKEN_CAMEL -gt 0 ]; then
        print_result 0 "Response has 'accessToken' (camelCase) ✓"
        ACCESS_TOKEN_FORMAT="camelCase"
    else
        print_result 1 "Response missing access token field"
        print_warning "Frontend expects: 'access_token' or 'accessToken'"
    fi

    # Check for refresh_token (snake_case)
    HAS_REFRESH_TOKEN_SNAKE=$(echo "$BODY" | grep -o '"refresh_token"' | wc -l)
    # Check for refreshToken (camelCase)
    HAS_REFRESH_TOKEN_CAMEL=$(echo "$BODY" | grep -o '"refreshToken"' | wc -l)

    if [ $HAS_REFRESH_TOKEN_SNAKE -gt 0 ]; then
        print_result 0 "Response has 'refresh_token' (snake_case) ✓"
        REFRESH_TOKEN_FORMAT="snake_case"
    elif [ $HAS_REFRESH_TOKEN_CAMEL -gt 0 ]; then
        print_result 0 "Response has 'refreshToken' (camelCase) ✓"
        REFRESH_TOKEN_FORMAT="camelCase"
    else
        print_result 1 "Response missing refresh token field"
        print_warning "Frontend expects: 'refresh_token' or 'refreshToken'"
    fi

    # Check for user field
    HAS_USER=$(echo "$BODY" | grep -o '"user"' | wc -l)
    if [ $HAS_USER -gt 0 ]; then
        print_result 0 "Response has 'user' field"
    else
        print_result 1 "Response missing 'user' field"
    fi

    echo ""

    # Extract tokens for next tests
    if [ $HAS_ACCESS_TOKEN_SNAKE -gt 0 ]; then
        ACCESS_TOKEN=$(echo "$BODY" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    elif [ $HAS_ACCESS_TOKEN_CAMEL -gt 0 ]; then
        ACCESS_TOKEN=$(echo "$BODY" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    fi

    if [ $HAS_REFRESH_TOKEN_SNAKE -gt 0 ]; then
        REFRESH_TOKEN=$(echo "$BODY" | grep -o '"refresh_token":"[^"]*"' | cut -d'"' -f4)
    elif [ $HAS_REFRESH_TOKEN_CAMEL -gt 0 ]; then
        REFRESH_TOKEN=$(echo "$BODY" | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)
    fi

    if [ -n "$ACCESS_TOKEN" ]; then
        print_info "Access token extracted (${#ACCESS_TOKEN} chars)"
        echo "  Preview: ${ACCESS_TOKEN:0:50}..."
    fi

    if [ -n "$REFRESH_TOKEN" ]; then
        print_info "Refresh token extracted (${#REFRESH_TOKEN} chars)"
        echo "  Preview: ${REFRESH_TOKEN:0:50}..."
    fi

else
    print_result 1 "Login request failed (HTTP $HTTP_CODE)"
    echo "Response body:"
    echo "$BODY"
    echo ""
    echo "Possible reasons:"
    echo "  1. Invalid test credentials"
    echo "  2. User not registered or email not verified"
    echo "  3. Backend authentication error"
    echo "  4. Wrong endpoint URL"
fi
echo ""

# Test 3: Check for Cookie-based Authentication
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 3: Cookie-based Authentication Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

HEADERS=$(curl -s -D - -o /dev/null "$BACKEND_URL/v1/auth/login" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"rememberMe\":true}")

HAS_SET_COOKIE=$(echo "$HEADERS" | grep -i "set-cookie" | wc -l)

if [ $HAS_SET_COOKIE -gt 0 ]; then
    print_warning "Backend sets cookies in response headers"
    echo ""
    echo "Set-Cookie headers found:"
    echo "$HEADERS" | grep -i "set-cookie"
    echo ""
    print_warning "If using cookies, frontend needs 'withCredentials: true'"

    # Check if cookies contain tokens
    HAS_REFRESH_COOKIE=$(echo "$HEADERS" | grep -i "set-cookie" | grep -i "refresh" | wc -l)
    HAS_ACCESS_COOKIE=$(echo "$HEADERS" | grep -i "set-cookie" | grep -i "access\|token" | wc -l)

    if [ $HAS_REFRESH_COOKIE -gt 0 ]; then
        print_info "Refresh token found in cookies"
    fi
    if [ $HAS_ACCESS_COOKIE -gt 0 ]; then
        print_info "Access token found in cookies"
    fi
else
    print_result 0 "No Set-Cookie headers (using response body)"
fi
echo ""

# Test 4: Refresh Token Endpoint
if [ -n "$REFRESH_TOKEN" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Test 4: Refresh Token Endpoint"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    REFRESH_RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/v1/auth/refresh" \
      -X POST \
      -H "Content-Type: application/json" \
      -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}")

    REFRESH_HTTP_CODE=$(echo "$REFRESH_RESPONSE" | tail -n1)
    REFRESH_BODY=$(echo "$REFRESH_RESPONSE" | sed '$d')

    if [ "$REFRESH_HTTP_CODE" == "200" ] || [ "$REFRESH_HTTP_CODE" == "201" ]; then
        print_result 0 "Refresh endpoint works (HTTP $REFRESH_HTTP_CODE)"
        echo ""
        echo "Refresh response:"
        echo "$REFRESH_BODY" | python3 -m json.tool 2>/dev/null || echo "$REFRESH_BODY"
    else
        print_result 1 "Refresh endpoint failed (HTTP $REFRESH_HTTP_CODE)"
        echo "Response: $REFRESH_BODY"
    fi
    echo ""
else
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Test 4: Refresh Token Endpoint"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    print_warning "Skipped (no refresh token available from login)"
    echo ""
fi

# Test 5: Get Current User Endpoint
if [ -n "$ACCESS_TOKEN" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Test 5: Get Current User Endpoint"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    USER_RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/v1/auth/me" \
      -H "Authorization: Bearer $ACCESS_TOKEN")

    USER_HTTP_CODE=$(echo "$USER_RESPONSE" | tail -n1)
    USER_BODY=$(echo "$USER_RESPONSE" | sed '$d')

    if [ "$USER_HTTP_CODE" == "200" ]; then
        print_result 0 "Get user endpoint works (HTTP $USER_HTTP_CODE)"
        echo ""
        echo "User data:"
        echo "$USER_BODY" | python3 -m json.tool 2>/dev/null || echo "$USER_BODY"
    else
        print_result 1 "Get user endpoint failed (HTTP $USER_HTTP_CODE)"
        echo "Response: $USER_BODY"
    fi
    echo ""
else
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Test 5: Get Current User Endpoint"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    print_warning "Skipped (no access token available from login)"
    echo ""
fi

# Summary
echo "╔════════════════════════════════════════════════════════╗"
echo "║                    TEST SUMMARY                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo -e "Tests Passed: ${GREEN}$PASS${NC}"
echo -e "Tests Failed: ${RED}$FAIL${NC}"
echo ""

# Diagnosis
if [ $FAIL -gt 0 ]; then
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║                     DIAGNOSIS                          ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo ""

    if [ -z "$ACCESS_TOKEN" ] && [ -z "$REFRESH_TOKEN" ]; then
        echo -e "${RED}🚨 CRITICAL ISSUE: No tokens found in login response${NC}"
        echo ""
        echo "Your backend is NOT sending tokens in the response body."
        echo ""
        echo "Frontend expects this format:"
        echo "{"
        echo "  \"success\": true,"
        echo "  \"data\": {"
        echo "    \"access_token\": \"...\",  // or \"accessToken\""
        echo "    \"refresh_token\": \"...\", // or \"refreshToken\""
        echo "    \"user\": { ... }"
        echo "  }"
        echo "}"
        echo ""
        echo "Check your backend login endpoint implementation!"

        if [ $HAS_SET_COOKIE -gt 0 ]; then
            echo ""
            echo "Note: Backend IS setting cookies."
            echo "If you want to use cookies, update frontend with:"
            echo "  - axios: withCredentials: true"
            echo "  - backend CORS: credentials: true"
        fi
    elif [ -z "$REFRESH_TOKEN" ]; then
        echo -e "${RED}🚨 ISSUE: No refresh token in response${NC}"
        echo ""
        echo "Backend is sending access token but NOT refresh token."
        echo "Auto-login will NOT work without refresh token."
    fi
fi

echo ""
echo "For detailed token flow analysis, see: TOKEN_FLOW_TRACE.md"
echo ""
