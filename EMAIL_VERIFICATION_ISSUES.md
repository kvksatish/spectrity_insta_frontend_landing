# Email Verification Issues - Diagnosis & Fix Plan

## Issues Found

### 1. **Backend Allows Login with Unverified Email** ❌
**Problem:** According to API docs (line 313 in authapis.json), login should return `403 Forbidden` if email is not verified, but it appears the backend is allowing login anyway.

**Expected Behavior:**
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_NOT_VERIFIED",
    "message": "Please verify your email before logging in",
    "statusCode": 403
  }
}
```

**Current Behavior:** Backend returns `200 OK` with user data even if `isEmailVerified: false`

**Backend Fix Needed:**
```typescript
// In login controller - backend needs this check:
if (!user.isEmailVerified) {
  throw new ForbiddenError('EMAIL_NOT_VERIFIED',
    'Please verify your email address before logging in');
}
```

---

### 2. **Frontend Doesn't Check Email Verification Status** ❌
**Problem:** Even if backend allows login, frontend should check `user.isEmailVerified` and redirect to verification page.

**Current Code** (`src/context/AuthContext.tsx:68-75`):
```typescript
const login = async (email: string, password: string, rememberMe = false) => {
  const user = await authApi.login(email, password, rememberMe);
  setUser(user);  // ❌ No check for isEmailVerified!
};
```

**Fix Needed:**
```typescript
const login = async (email: string, password: string, rememberMe = false) => {
  const user = await authApi.login(email, password, rememberMe);

  // Check if email is verified
  if (!user.isEmailVerified) {
    throw new Error(
      'Please verify your email before logging in. Check your inbox for the verification link.'
    );
  }

  setUser(user);
};
```

---

### 3. **No Emails Being Sent** ❌
**Problem:** Verification emails are not being sent after registration.

**Possible Causes:**
1. Backend email service not configured
2. Missing environment variables (SMTP credentials, etc.)
3. Email service failing silently
4. Wrong `FRONTEND_URL` in backend `.env`

**Backend Environment Variables to Check:**
```env
# Email Service Configuration
EMAIL_SERVICE=brevo  # or smtp, sendgrid, etc.
EMAIL_FROM=noreply@spectrity.com
EMAIL_FROM_NAME=Spectrity

# Brevo Configuration (if using Brevo)
BREVO_API_KEY=your_api_key
BREVO_SMTP_KEY=your_smtp_key

# Frontend URL for email links
FRONTEND_URL=https://spectrity.com

# Email Templates
EMAIL_VERIFICATION_TEMPLATE=verify-email
```

**Email Link Format Should Be:**
```
https://spectrity.com/verify-email?token=GENERATED_TOKEN_HERE
```

---

### 4. **Email Verification Page Has No Pre-Check** ❌
**Problem:** `/verify-email` page doesn't check if email is already verified before making API call.

**Current Flow:**
```
User clicks link → Page loads → Calls API → Gets "already verified" error
```

**Better Flow:**
```
User clicks link → Check if logged in → If yes, check isEmailVerified
  → If already verified: Show "already verified" message
  → If not verified: Call API to verify
```

---

## Complete Fix Plan

### Frontend Fixes:

#### 1. Update Auth Context (`src/context/AuthContext.tsx`)
```typescript
const login = async (email: string, password: string, rememberMe = false) => {
  const user = await authApi.login(email, password, rememberMe);

  if (!user.isEmailVerified) {
    throw new Error(
      'Please verify your email before logging in. Check your inbox for the verification link.'
    );
  }

  setUser(user);
};
```

#### 2. Update Verify Email Page (`src/app/verify-email/page.tsx`)
```typescript
// After verification succeeds, fetch fresh user data
const response = await authApi.verifyEmail(token);
setStatus("success");

// If user is logged in, refresh their data
if (hasTokens()) {
  try {
    const freshUser = await authApi.getCurrentUser();
    // User is now verified, redirect to dashboard
    router.push("/dashboard");
  } catch {
    // Not logged in, redirect to login
    router.push("/login");
  }
}
```

#### 3. Add Email Status Check Page (`src/app/verify-email-pending/page.tsx`)
- Already exists ✅
- Shows "check your email" message
- Links to resend verification

---

### Backend Fixes Needed:

#### 1. **Enable Email Verification Check in Login**
```typescript
// src/controllers/auth.controller.ts - loginController
if (!user.isEmailVerified && user.provider === 'LOCAL') {
  throw new ForbiddenError(
    'EMAIL_NOT_VERIFIED',
    'Please verify your email address before logging in. Check your inbox for the verification link.'
  );
}
```

#### 2. **Check Email Service Configuration**
```bash
# SSH into backend server
# Check if email service environment variables are set
printenv | grep -E "EMAIL|BREVO|SMTP|FRONTEND_URL"
```

#### 3. **Test Email Sending**
```bash
# Test email endpoint
curl -X POST https://spectrity.com/api/v1/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<h1>Test</h1>"
  }'
```

#### 4. **Check Email Logs**
```bash
# Check backend logs for email errors
pm2 logs spectrity-backend --lines 100 | grep -i "email\|smtp\|brevo"
```

---

## Testing Checklist

### Test 1: Registration Flow
- [ ] Register with new email
- [ ] Verify email is sent (check inbox/spam)
- [ ] Click verification link
- [ ] See success message
- [ ] Try to login - should work

### Test 2: Login Before Verification
- [ ] Register with new email
- [ ] Try to login immediately (before clicking link)
- [ ] Should see error: "Please verify your email"
- [ ] Should NOT be logged in

### Test 3: Double Verification
- [ ] Register and verify email
- [ ] Click verification link again
- [ ] Should see "Email already verified" or success message
- [ ] Should still be able to login

### Test 4: Expired/Invalid Token
- [ ] Use old/invalid verification token
- [ ] Should see error: "Invalid or expired verification link"
- [ ] Should offer to resend verification email

---

## Quick Diagnosis Commands

### Check if Backend Blocks Unverified Login:
```bash
# 1. Register a user
curl -X POST https://spectrity.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!@#"}'

# 2. Try to login immediately (before verification)
curl -X POST https://spectrity.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!@#"}' \
  -v

# Expected: 403 Forbidden
# Actual: 200 OK (if broken)
```

### Check Email Service Health:
```bash
curl https://spectrity.com/api/health | python3 -m json.tool | grep -A 5 "Email"
```

---

## Priority Order

1. **HIGH** - Fix backend to block unverified email login
2. **HIGH** - Check why emails aren't being sent
3. **MEDIUM** - Add frontend email verification check
4. **LOW** - Improve verify-email page UX

