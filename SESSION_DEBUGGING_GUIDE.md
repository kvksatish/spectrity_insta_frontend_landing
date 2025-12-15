# Session Debugging Guide

## How to Debug "Session Expired" Issue

### Step 1: Open Debug Tool

1. Make sure dev server is running: `npm run dev`
2. Open in browser: `file:///Users/satish/Desktop/insta_extract/spectrity_insta_frontend/debug-session.html`
3. Open Chrome DevTools (F12) → Console tab

### Step 2: Test Login

1. In the debug tool, enter your email and password
2. Click "Login"
3. Watch the Console for `[AUTH]` logs

**Expected behavior:**
```
[AUTH] Response should show either:
✓ accessToken, refreshToken (camelCase) - CORRECT
⚠️  access_token, refresh_token (snake_case) - WRONG FORMAT
```

### Step 3: Test Refresh Token

1. Click "Refresh Token" button
2. Watch Console logs

**Expected behavior:**
```
[AUTH] 🔄 Attempting to refresh token...
[AUTH] Refresh token exists: ✓
[AUTH] Refresh response: { success: true, data: {...} }
[AUTH] Extracted tokens: {
  accessToken: ✓ Present,
  refreshToken: ✓ Present,
  format: "snake_case" or "camelCase"
}
[AUTH] ✅ Tokens refreshed and stored successfully
```

**If you see:**
```
[AUTH] ❌ Invalid refresh token response format
```
This means backend is returning unexpected format!

---

## When Refresh Token is Used

### 1. **On Page Load/Refresh**

Every time you load the app:

```
Page loads
    ↓
AuthContext useEffect runs
    ↓
authApi.initializeAuth() called
    ↓
Check localStorage for refresh token
    ↓
If found → Call POST /v1/auth/refresh
    ↓
Get new access token
    ↓
Fetch user data with new access token
    ↓
✅ User logged in automatically
```

**Console logs to watch:**
```
[AUTH] 🚀 Initializing auth...
[AUTH] Refresh token found, attempting to restore session...
[AUTH] ✅ Tokens refreshed successfully
[AUTH] ✅ User data fetched: user@example.com
```

---

### 2. **When Access Token Expires (401 Error)**

When you make an API call and access token is expired:

```
User clicks button → API call
    ↓
Access token expired → Backend returns 401
    ↓
Axios interceptor catches 401
    ↓
Automatically calls POST /v1/auth/refresh
    ↓
Gets new access token
    ↓
Retries original API call
    ↓
✅ Request succeeds
```

**Console logs to watch:**
```
[AUTH] 🔄 Attempting to refresh token...
[AUTH] Refresh token exists: ✓
[AUTH] Refresh response: {...}
[AUTH] ✅ Tokens refreshed and stored successfully
```

---

## Common Issues

### Issue 1: "Session expired" immediately after page refresh

**Symptom:** Login works, but refreshing page logs you out

**Diagnosis:**
1. Open DevTools → Console
2. Refresh page
3. Look for these logs:

```
[AUTH] 🚀 Initializing auth...
[AUTH] No refresh token found - user not logged in
```

**Cause:** Refresh token not being stored in localStorage

**Fix needed:**
- Check if `tokenStorage.setTokens()` is being called after login
- Check browser localStorage: `localStorage.getItem('rt')`

---

### Issue 2: Refresh token call fails with 401

**Symptom:**
```
[AUTH] ❌ Token refresh failed: Request failed with status code 401
```

**Cause:** Refresh token is expired or invalid

**Check:**
1. How old is the refresh token?
   - Regular login: 7 days
   - "Remember me": 30 days
2. Was password changed? (invalidates all tokens)
3. Was "logout all" used? (invalidates all tokens)

---

### Issue 3: Backend returns wrong format

**Symptom:**
```
[AUTH] Extracted tokens: {
  accessToken: ✗ Missing,
  refreshToken: ✗ Missing,
  format: "snake_case"
}
[AUTH] ❌ Invalid refresh token response format
```

**Cause:** Backend returns `access_token` but code expects `accessToken`

**Current Fix:** Code now handles BOTH formats (v0.5.4)

**Backend should be fixed to return camelCase as per documentation**

---

## Testing Checklist

### Test 1: Fresh Login
- [ ] Login with email/password
- [ ] Check Console: Should see tokens stored
- [ ] Check localStorage: `rt` key should exist
- [ ] Refresh page
- [ ] Should stay logged in (no redirect to login)

### Test 2: Page Refresh (Auto-login)
- [ ] Login to app
- [ ] Note the time
- [ ] Close browser completely
- [ ] Wait 1 minute
- [ ] Reopen browser and go to app
- [ ] Console should show:
  ```
  [AUTH] 🚀 Initializing auth...
  [AUTH] Refresh token found, attempting to restore session...
  [AUTH] ✅ Tokens refreshed successfully
  [AUTH] ✅ User data fetched: user@example.com
  ```
- [ ] Should be logged in automatically

### Test 3: Token Expiration (15 min)
- [ ] Login to app
- [ ] Wait 16 minutes (or manually expire token)
- [ ] Make an API call (navigate to settings, etc.)
- [ ] Console should show:
  ```
  [AUTH] 🔄 Attempting to refresh token...
  [AUTH] ✅ Tokens refreshed and stored successfully
  ```
- [ ] Page should load normally (no "session expired")

### Test 4: Expired Refresh Token
- [ ] Get a refresh token that's 8+ days old
- [ ] Try to use it
- [ ] Console should show:
  ```
  [AUTH] ❌ Token refresh failed: Request failed with status code 401
  [AUTH] Redirecting to login (session expired)
  ```
- [ ] Should be redirected to login page

---

## How to Check Current Session State

### In Browser Console:

```javascript
// Check refresh token
console.log("Refresh Token:", localStorage.getItem('rt'));

// Check if refresh token exists
console.log("Has refresh token:", !!localStorage.getItem('rt'));

// Decode JWT to see expiration (if not encrypted)
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

const rt = localStorage.getItem('rt');
if (rt) {
  const decoded = parseJwt(rt);
  console.log("Token payload:", decoded);
  console.log("Expires at:", new Date(decoded.exp * 1000));
  console.log("Time until expiry:", new Date(decoded.exp * 1000) - new Date());
}
```

---

## API Endpoint Testing

### Test Refresh Endpoint Manually:

```bash
# Get your refresh token from localStorage
RT="your_refresh_token_here"

# Test refresh endpoint
curl -s -X POST http://localhost:3005/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$RT\"}" | python3 -m json.tool

# Expected response (snake_case):
{
  "success": true,
  "data": {
    "access_token": "...",
    "refresh_token": "...",
    "expires_at": "..."
  }
}

# Or (camelCase):
{
  "success": true,
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "expiresAt": "..."
  }
}
```

---

## Current Implementation (v0.5.4)

### Handles BOTH formats:

**src/api/client.ts (lines 115-125):**
```typescript
const responseData = data.data;
const accessToken = responseData.accessToken || responseData.access_token;
const newRefreshToken = responseData.refreshToken || responseData.refresh_token;

if (!accessToken || !newRefreshToken) {
  throw new Error("Invalid refresh token response format");
}
```

This means it will work whether backend sends:
- ✓ `accessToken` (camelCase)
- ✓ `access_token` (snake_case)

---

## Next Steps

1. **Open debug tool and test refresh token**
   - `file:///Users/satish/Desktop/insta_extract/spectrity_insta_frontend/debug-session.html`

2. **Login to your app with DevTools Console open**
   - Watch for `[AUTH]` logs

3. **Refresh the page**
   - Should see auto-login happening
   - Should NOT see "session expired"

4. **If still getting "session expired", share these logs:**
   - All `[AUTH]` logs from Console
   - Response from "Test Refresh Token" button in debug tool
   - Value of `localStorage.getItem('rt')` (first 50 chars)

---

## Summary of Changes (v0.5.4)

✅ Added detailed console logging for debugging
✅ Handle both snake_case AND camelCase token responses
✅ Better error messages showing exact failure point
✅ Debug tool to test API endpoints manually

**The refresh token IS being used:**
- On every page load (initializeAuth)
- On every 401 error (axios interceptor)

If it's still not working, the issue is likely:
1. Backend returning 401 when refreshing (token expired)
2. Backend returning unexpected response format
3. Refresh token not being stored correctly

Use the debug tool and console logs to identify which!
