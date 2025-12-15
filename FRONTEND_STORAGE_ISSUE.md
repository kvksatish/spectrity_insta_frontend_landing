# Frontend Storage Issue - Diagnosis

## Problem

APIs are working fine, but frontend keeps showing "Session expired" after page refresh.

## Root Cause Analysis

### Storage Strategy (CORRECT by design)

```
Access Token:  Stored in MEMORY (JavaScript variable)
   ├─ Security: ✅ Cannot be stolen by XSS
   ├─ Survives refresh: ❌ NO (cleared on page reload)
   └─ This is INTENTIONAL for security

Refresh Token: Stored in localStorage
   ├─ Security: ⚠️  Can be read by JavaScript
   ├─ Survives refresh: ✅ YES
   └─ Used to get new access token on page load
```

### Expected Flow (What SHOULD happen)

```
1. User refreshes page
   ↓
2. Access token lost (was in memory)
   ↓
3. AuthContext.tsx useEffect runs
   ↓
4. Check localStorage for refresh token
   ↓
5. If found → Call POST /v1/auth/refresh
   ↓
6. Backend returns new access token
   ↓
7. Store in memory
   ↓
8. Fetch user data
   ↓
9. ✅ User stays logged in
```

### Actual Flow (What's ACTUALLY happening)

Something is failing in steps 5-8. Possibilities:

**Possibility 1:** Refresh token API call failing
```
initializeAuth() calls refreshToken()
   ↓
POST /v1/auth/refresh fails (401)
   ↓
Tokens cleared
   ↓
User logged out ✗
```

**Possibility 2:** Response format mismatch (MOST LIKELY)
```
Backend returns: { access_token, refresh_token }
Code expects: { accessToken, refreshToken }
   ↓
Extraction fails
   ↓
"Invalid refresh token response format"
   ↓
Tokens cleared
   ↓
User logged out ✗
```

**Possibility 3:** Silent error in initializeAuth
```
Error thrown but caught and logged
   ↓
setUser(null) called
   ↓
User appears logged out
   ↓
But no visible error to user ✗
```

---

## How to Diagnose

### Step 1: Visit Auth Test Page

1. Start dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/auth-test`
3. Click "Run Full Diagnostics"

This will show you:
- ✓ Is refresh token in localStorage?
- ✓ Is access token in memory?
- ✓ Is user state set?
- ✓ Does refresh API call work?

### Step 2: Check Console Logs

Open DevTools Console (F12) and look for `[AUTH]` logs:

**Good (working):**
```
[AUTH] 🚀 Initializing auth...
[AUTH] Refresh token found, attempting to restore session...
[AUTH] 🔄 Attempting to refresh token...
[AUTH] Refresh response: {...}
[AUTH] Extracted tokens: { accessToken: ✓, refreshToken: ✓, format: "snake_case" }
[AUTH] ✅ Tokens refreshed and stored successfully
[AUTH] ✅ User data fetched: user@example.com
```

**Bad (broken):**
```
[AUTH] 🚀 Initializing auth...
[AUTH] Refresh token found, attempting to restore session...
[AUTH] 🔄 Attempting to refresh token...
[AUTH] Extracted tokens: { accessToken: ✗ Missing, refreshToken: ✗ Missing }
[AUTH] ❌ Invalid refresh token response format: {...}
[AUTH] ❌ Session restore failed: Invalid refresh token response format
```

Or:
```
[AUTH] 🚀 Initializing auth...
[AUTH] Refresh token found, attempting to restore session...
[AUTH] ❌ Token refresh failed: Request failed with status code 401
[AUTH] Error details: { "error": "Invalid refresh token" }
[AUTH] ❌ Session restore failed: Request failed with status code 401
```

### Step 3: Test Refresh Token Manually

Use the "Test Refresh Token API" button in the auth test page, or:

1. Get refresh token: `localStorage.getItem('rt')`
2. Test API:
   ```bash
   RT="paste_token_here"

   curl -s -X POST http://localhost:3005/api/v1/auth/refresh \
     -H "Content-Type: application/json" \
     -d "{\"refreshToken\":\"$RT\"}" | python3 -m json.tool
   ```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "access_token": "new_token_here",
    "refresh_token": "new_token_here",
    "expires_at": "2025-12-15T10:00:00Z"
  }
}
```

---

## Current Implementation Status

### ✅ Fixed in v0.5.4

1. **Handle both snake_case AND camelCase** (`src/api/client.ts:115-125`)
   ```typescript
   const accessToken = responseData.accessToken || responseData.access_token;
   const newRefreshToken = responseData.refreshToken || responseData.refresh_token;
   ```

2. **Added detailed logging** (all auth operations log to console)

3. **Better error messages** (shows exact failure point)

### ✅ Working Components

1. **Token Storage** (`src/utils/tokenStorage.ts`)
   - ✓ Stores refresh token in localStorage
   - ✓ Stores access token in memory
   - ✓ Persists across page refreshes

2. **Auth Initialization** (`src/context/AuthContext.tsx:49-63`)
   - ✓ Runs on every page load
   - ✓ Checks for refresh token
   - ✓ Calls initializeAuth()

3. **Refresh Token API** (`src/api/auth.ts:221-249`)
   - ✓ Calls backend refresh endpoint
   - ✓ Transforms response
   - ✓ Stores new tokens

4. **Auto-Refresh on 401** (`src/api/client.ts:95-166`)
   - ✓ Catches 401 errors
   - ✓ Automatically refreshes
   - ✓ Retries failed request

---

## Testing Tools Created

### 1. Auth Test Page
**URL:** `http://localhost:3000/auth-test`

Features:
- Shows current auth state (loading, user, tokens)
- "Run Diagnostics" button to test everything
- Tests refresh token API directly
- Shows exact error messages

### 2. Auth Debug Panel
**Component:** `src/components/AuthDebug.tsx`

Features:
- Floating panel showing live auth state
- Captures [AUTH] logs in real-time
- "Test Refresh Token API" button
- Shows token presence/absence

Add to any page:
```typescript
import { AuthDebug } from "@/components/AuthDebug";

export default function Page() {
  return (
    <>
      {/* Your page content */}
      <AuthDebug />  {/* Add this */}
    </>
  );
}
```

### 3. Storage Test Page
**File:** `test-storage.html`

Tests:
- localStorage read/write
- Token persistence
- Storage availability

### 4. Session Debug Tool
**File:** `debug-session.html`

Tests:
- Login API
- Refresh API
- Get user API
- Shows response formats

---

## Next Steps to Fix

### 1. Test Current Implementation

Visit `http://localhost:3000/auth-test` and:
1. Login
2. Run diagnostics
3. Share the output

### 2. Check Console Logs

1. Login
2. Refresh page (F5)
3. Look for `[AUTH]` logs
4. Share any errors

### 3. Verify API Response Format

If refresh is failing, check what backend actually returns:

```bash
# Get your refresh token
RT=$(node -p "localStorage.getItem('rt')")

# Test refresh endpoint
curl -X POST http://localhost:3005/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$RT\"}"
```

Share the response!

---

## Common Issues & Solutions

### Issue: "No refresh token found"

**Symptom:**
```
[AUTH] No refresh token found - user not logged in
```

**Cause:** Refresh token not being saved after login

**Check:**
```javascript
localStorage.getItem('rt')  // Should not be null
```

**Fix:** Verify login response actually contains tokens

---

### Issue: "Invalid refresh token response format"

**Symptom:**
```
[AUTH] ❌ Invalid refresh token response format
[AUTH] Extracted tokens: { accessToken: ✗, refreshToken: ✗ }
```

**Cause:** Backend response doesn't have expected fields

**Already Fixed:** v0.5.4 handles both formats

**If still failing:** Backend might be returning completely different structure

---

### Issue: "Token refresh failed: 401"

**Symptom:**
```
[AUTH] ❌ Token refresh failed: Request failed with status code 401
```

**Cause:** Refresh token is expired or invalid

**Check:**
1. How old is the token? (7-30 days max)
2. Was password changed? (invalidates all tokens)
3. Was "logout all" used? (invalidates all tokens)

**Solution:** User must login again (token is genuinely expired)

---

## Summary

**Storage is working correctly** - access token in memory, refresh token in localStorage.

**The issue is likely:**
1. Refresh API call is failing (401)
2. Response format mismatch (even after v0.5.4 fix)
3. Silent error in initializeAuth

**To identify which:**
1. Visit `http://localhost:3000/auth-test`
2. Run diagnostics
3. Check Console logs
4. Share the output

The logs will show EXACTLY where it's failing!
