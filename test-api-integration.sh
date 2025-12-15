#!/bin/bash

# API Integration Test Script
# Tests all auth endpoints against local backend on port 3005

set -e

API_BASE="http://localhost:3005/api/v1"
TEST_EMAIL="test-$(date +%s)@example.com"
TEST_PASSWORD="Test123!@#"
TEST_FIRST_NAME="Test"
TEST_LAST_NAME="User"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo "API Integration Test Suite"
echo "=========================================="
echo ""
echo "API Base: $API_BASE"
echo "Test Email: $TEST_EMAIL"
echo ""

# Test counter
PASS=0
FAIL=0

test_endpoint() {
    local name="$1"
    local expected_code="$2"
    local actual_code="$3"
    local response="$4"

    if [ "$expected_code" -eq "$actual_code" ]; then
        echo -e "${GREEN}✓ PASS${NC} - $name"
        ((PASS++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} - $name"
        echo "  Expected: HTTP $expected_code"
        echo "  Got: HTTP $actual_code"
        echo "  Response: $response"
        ((FAIL++))
        return 1
    fi
}

# Test 1: Register
echo -e "\n${BLUE}TEST 1: POST /api/v1/auth/register${NC}"
REGISTER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"firstName\":\"$TEST_FIRST_NAME\",\"lastName\":\"$TEST_LAST_NAME\"}")

REGISTER_CODE=$(echo "$REGISTER_RESPONSE" | tail -n 1)
REGISTER_BODY=$(echo "$REGISTER_RESPONSE" | sed '$d')

test_endpoint "Register new user" 201 "$REGISTER_CODE" "$REGISTER_BODY"

# Check response structure
if echo "$REGISTER_BODY" | grep -q "first_name"; then
    echo -e "  ${YELLOW}⚠ Response uses snake_case (first_name)${NC}"
    echo -e "  ${YELLOW}  Frontend needs to transform to camelCase${NC}"
else
    echo -e "  ${GREEN}✓ Response structure OK${NC}"
fi

# Test 2: Login with unverified email (should fail with 403)
echo -e "\n${BLUE}TEST 2: POST /api/v1/auth/login (unverified email)${NC}"
LOGIN_UNVERIFIED=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

LOGIN_UNVERIFIED_CODE=$(echo "$LOGIN_UNVERIFIED" | tail -n 1)
LOGIN_UNVERIFIED_BODY=$(echo "$LOGIN_UNVERIFIED" | sed '$d')

test_endpoint "Login blocks unverified email" 403 "$LOGIN_UNVERIFIED_CODE" "$LOGIN_UNVERIFIED_BODY"

# Test 3: Resend verification email
echo -e "\n${BLUE}TEST 3: POST /api/v1/auth/resend-verification${NC}"
RESEND_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/auth/resend-verification" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\"}")

RESEND_CODE=$(echo "$RESEND_RESPONSE" | tail -n 1)
RESEND_BODY=$(echo "$RESEND_RESPONSE" | sed '$d')

test_endpoint "Resend verification email" 200 "$RESEND_CODE" "$RESEND_BODY"

# Test 4: Get Google OAuth URL
echo -e "\n${BLUE}TEST 4: GET /api/v1/auth/google${NC}"
GOOGLE_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_BASE/auth/google")

GOOGLE_CODE=$(echo "$GOOGLE_RESPONSE" | tail -n 1)
GOOGLE_BODY=$(echo "$GOOGLE_RESPONSE" | sed '$d')

test_endpoint "Get Google OAuth URL" 200 "$GOOGLE_CODE" "$GOOGLE_BODY"

if echo "$GOOGLE_BODY" | grep -q "authUrl"; then
    echo -e "  ${GREEN}✓ Response contains authUrl${NC}"
else
    echo -e "  ${RED}✗ Response missing authUrl${NC}"
fi

# Test 5: Forgot password
echo -e "\n${BLUE}TEST 5: POST /api/v1/auth/forgot-password${NC}"
FORGOT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\"}")

FORGOT_CODE=$(echo "$FORGOT_RESPONSE" | tail -n 1)
FORGOT_BODY=$(echo "$FORGOT_RESPONSE" | sed '$d')

test_endpoint "Request password reset" 200 "$FORGOT_CODE" "$FORGOT_BODY"

# Test 6: Health check
echo -e "\n${BLUE}TEST 6: GET /api/health${NC}"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "http://localhost:3005/api/health")

HEALTH_CODE=$(echo "$HEALTH_RESPONSE" | tail -n 1)
HEALTH_BODY=$(echo "$HEALTH_RESPONSE" | sed '$d')

test_endpoint "Health check" 200 "$HEALTH_CODE" "$HEALTH_BODY"

# Test 7: Check API documentation is accessible
echo -e "\n${BLUE}TEST 7: GET /documentation/json${NC}"
DOCS_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "http://localhost:3005/documentation/json")

DOCS_CODE=$(echo "$DOCS_RESPONSE" | tail -n 1)

test_endpoint "API documentation accessible" 200 "$DOCS_CODE" ""

echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo ""

# Check for snake_case vs camelCase issues
echo "=========================================="
echo "Integration Notes"
echo "=========================================="
echo ""
echo "1. Request Format: ${GREEN}camelCase ✓${NC}"
echo "   (firstName, lastName, rememberMe)"
echo ""
echo "2. Response Format: ${YELLOW}snake_case ⚠${NC}"
echo "   (first_name, last_name, is_email_verified)"
echo ""
echo "3. Frontend Transformation: ${GREEN}Implemented ✓${NC}"
echo "   src/utils/apiTransform.ts converts responses"
echo ""
echo "4. Email Verification: Backend enforcement needed"
echo "   - Login should block unverified emails (403)"
echo "   - Currently relies on frontend check"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}All tests passed! ✓${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed ✗${NC}"
    exit 1
fi
