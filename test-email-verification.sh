#!/bin/bash

# Email Verification Backend Diagnostic Script
# Tests whether backend properly blocks unverified email logins

set -e

API_BASE="https://spectrity.com/api/v1"
TEST_EMAIL="test-$(date +%s)@example.com"
TEST_PASSWORD="Test123!@#"
TEST_FIRST_NAME="Test"
TEST_LAST_NAME="User"

echo "=========================================="
echo "Email Verification Backend Test"
echo "=========================================="
echo ""
echo "API Base: $API_BASE"
echo "Test Email: $TEST_EMAIL"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Register a new user
echo "=========================================="
echo "TEST 1: Register New User"
echo "=========================================="
echo "POST $API_BASE/auth/register"
echo ""

REGISTER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"firstName\": \"$TEST_FIRST_NAME\",
    \"lastName\": \"$TEST_LAST_NAME\"
  }")

REGISTER_HTTP_CODE=$(echo "$REGISTER_RESPONSE" | tail -n 1)
REGISTER_BODY=$(echo "$REGISTER_RESPONSE" | sed '$d')

echo "HTTP Status: $REGISTER_HTTP_CODE"
echo "Response: $REGISTER_BODY"
echo ""

if [ "$REGISTER_HTTP_CODE" -eq 201 ] || [ "$REGISTER_HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✓ Registration successful${NC}"
else
  echo -e "${RED}✗ Registration failed${NC}"
  echo "Expected: 200 or 201"
  echo "Got: $REGISTER_HTTP_CODE"
  exit 1
fi

echo ""
echo "Waiting 2 seconds before attempting login..."
sleep 2
echo ""

# Test 2: Try to login with unverified email
echo "=========================================="
echo "TEST 2: Login with Unverified Email"
echo "=========================================="
echo "POST $API_BASE/auth/login"
echo ""
echo "This should FAIL with 403 Forbidden if backend is working correctly"
echo ""

LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

LOGIN_HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n 1)
LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')

echo "HTTP Status: $LOGIN_HTTP_CODE"
echo "Response: $LOGIN_BODY"
echo ""

if [ "$LOGIN_HTTP_CODE" -eq 403 ]; then
  echo -e "${GREEN}✓ PASS - Backend correctly blocks unverified email login${NC}"
  echo ""

  # Check if error message contains EMAIL_NOT_VERIFIED
  if echo "$LOGIN_BODY" | grep -q "EMAIL_NOT_VERIFIED"; then
    echo -e "${GREEN}✓ Error code is correct (EMAIL_NOT_VERIFIED)${NC}"
  else
    echo -e "${YELLOW}⚠ Warning: Error code might not be EMAIL_NOT_VERIFIED${NC}"
  fi

elif [ "$LOGIN_HTTP_CODE" -eq 200 ] || [ "$LOGIN_HTTP_CODE" -eq 201 ]; then
  echo -e "${RED}✗ FAIL - Backend allows unverified email login (SECURITY ISSUE)${NC}"
  echo ""
  echo "Backend returned success when it should have returned 403 Forbidden"
  echo ""

  # Check if user data shows unverified email
  if echo "$LOGIN_BODY" | grep -q '"isEmailVerified":false'; then
    echo -e "${YELLOW}⚠ User data shows isEmailVerified: false${NC}"
    echo "The backend is returning the unverified user data, which is incorrect."
  fi

  echo ""
  echo "REQUIRED FIX:"
  echo "-------------"
  echo "Backend needs to add this check in the login controller:"
  echo ""
  echo "if (user.provider === 'LOCAL' && !user.isEmailVerified) {"
  echo "  throw new ForbiddenError("
  echo "    'EMAIL_NOT_VERIFIED',"
  echo "    'Please verify your email address before logging in'"
  echo "  );"
  echo "}"

else
  echo -e "${YELLOW}⚠ Unexpected HTTP status: $LOGIN_HTTP_CODE${NC}"
  echo "Expected: 403 (Forbidden) or 200 (OK, but incorrect)"
  echo "Got: $LOGIN_HTTP_CODE"
fi

echo ""
echo "=========================================="
echo "TEST 3: Check Email Service"
echo "=========================================="
echo ""
echo "Checking if verification email was sent..."
echo ""
echo -e "${YELLOW}⚠ Manual check required:${NC}"
echo "1. Check email inbox for: $TEST_EMAIL"
echo "2. If no email received, backend email service is not configured"
echo ""
echo "Backend environment variables to check:"
echo "  - EMAIL_SERVICE (should be: brevo, smtp, sendgrid, etc.)"
echo "  - EMAIL_FROM"
echo "  - BREVO_API_KEY (if using Brevo)"
echo "  - FRONTEND_URL (should be: https://spectrity.com)"
echo ""

echo "=========================================="
echo "Summary"
echo "=========================================="
echo ""

if [ "$LOGIN_HTTP_CODE" -eq 403 ]; then
  echo -e "${GREEN}Backend email verification: WORKING ✓${NC}"
  echo ""
  echo "The backend correctly blocks unverified email logins."
  echo "Now check if verification emails are being sent."
else
  echo -e "${RED}Backend email verification: BROKEN ✗${NC}"
  echo ""
  echo "The backend allows unverified users to login, which is a security issue."
  echo ""
  echo "Frontend workaround is in place (AuthContext.tsx checks isEmailVerified),"
  echo "but backend should be fixed to properly enforce email verification."
fi

echo ""
echo "Test completed at $(date)"
echo ""
