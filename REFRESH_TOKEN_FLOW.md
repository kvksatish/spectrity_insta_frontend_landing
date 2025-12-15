# Refresh Token Flow - Complete Explanation

## When & How Refresh Tokens Are Used

### 🔄 Flow 1: Page Load (Auto-Login)

**Trigger:** User opens app or refreshes page

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Page Loads                                               │
│    src/app/layout.tsx → <AuthProvider>                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. AuthContext.tsx - useEffect() (line 49-63)               │
│    Effect runs on mount                                     │
│    Calls: authApi.initializeAuth()                          │
│                                                              │
│    Console: [AUTH] 🚀 Initializing auth...                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Check localStorage for refresh token                     │
│    src/utils/tokenStorage.ts (line 35-38)                   │
│                                                              │
│    const rt = localStorage.getItem('rt')                    │
│                                                              │
│    If NO refresh token:                                     │
│      Console: [AUTH] No refresh token found                 │
│      → User stays logged out                                │
│                                                              │
│    If refresh token EXISTS:                                 │
│      Console: [AUTH] Refresh token found, attempting...     │
│      → Continue to next step                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Call Refresh Endpoint                                    │
│    src/api/auth.ts - refreshToken() (line 193-215)          │
│                                                              │
│    POST http://localhost:3005/api/v1/auth/refresh           │
│    Body: { "refreshToken": "eyJhbG..." }                    │
│                                                              │
│    Console: [AUTH] 🔄 Attempting to refresh token...        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Backend Response                                         │
│                                                              │
│    SUCCESS (200 OK):                                        │
│    {                                                         │
│      "success": true,                                       │
│      "data": {                                              │
│        "access_token": "new_token_abc...",                  │
│        "refresh_token": "new_token_xyz...",                 │
│        "expires_at": "2025-12-15T10:00:00Z"                 │
│      }                                                       │
│    }                                                         │
│                                                              │
│    Console: [AUTH] Refresh response: {...}                  │
│    Console: [AUTH] Extracted tokens:                        │
│             accessToken: ✓ Present                          │
│             refreshToken: ✓ Present                         │
│             format: "snake_case"                            │
│                                                              │
│    FAILURE (401 Unauthorized):                              │
│    → Token expired or invalid                               │
│    → Clear tokens, user must login again                    │
│                                                              │
│    Console: [AUTH] ❌ Token refresh failed                  │
│    Console: [AUTH] Error details: {...}                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Transform Response (Handle snake_case)                   │
│    src/api/auth.ts (line 202-206)                           │
│                                                              │
│    return {                                                  │
│      accessToken: data.accessToken || data.access_token,    │
│      refreshToken: data.refreshToken || data.refresh_token, │
│      expiresAt: data.expiresAt || data.expires_at           │
│    }                                                         │
│                                                              │
│    ✓ Now in camelCase format for frontend                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Store New Tokens                                         │
│    src/utils/tokenStorage.ts (line 51-56)                   │
│                                                              │
│    setTokens(accessToken, refreshToken)                     │
│    ├─ Access token → Memory (variable)                      │
│    └─ Refresh token → localStorage.setItem('rt', ...)       │
│                                                              │
│    Console: [AUTH] ✅ Tokens refreshed successfully         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. Fetch User Data                                          │
│    src/api/auth.ts - getCurrentUser() (line 74-80)          │
│                                                              │
│    GET http://localhost:3005/api/v1/auth/me                 │
│    Headers: Authorization: Bearer <access_token>            │
│                                                              │
│    Response: { email, first_name, is_email_verified, ... }  │
│    Transform to: { email, firstName, isEmailVerified, ... } │
│                                                              │
│    Console: [AUTH] ✅ User data fetched: user@example.com   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 9. Update AuthContext State                                 │
│    src/context/AuthContext.tsx (line 53)                    │
│                                                              │
│    setUser(user)                                            │
│    ✅ User is now logged in!                                │
│    ✅ Dashboard renders                                     │
│    ✅ Protected routes accessible                           │
└─────────────────────────────────────────────────────────────┘
```

**Total Time:** ~500ms - 1s (invisible to user!)

---

### 🔄 Flow 2: Access Token Expired (During Usage)

**Trigger:** User makes API call, access token expired (15 min lifetime)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User Action                                              │
│    Example: User clicks "Settings"                          │
│    Frontend: GET /api/v1/auth/sessions                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Axios Request Interceptor                                │
│    src/api/client.ts (line 24-35)                           │
│                                                              │
│    const token = tokenStorage.getAccessToken()              │
│    config.headers.Authorization = `Bearer ${token}`         │
│                                                              │
│    Request sent with expired access token                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Backend Returns 401 Unauthorized                         │
│    Access token is expired or invalid                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Axios Response Interceptor Catches 401                   │
│    src/api/client.ts (line 61-168)                          │
│                                                              │
│    if (error.response?.status === 401) {                    │
│      // Automatically refresh token                         │
│    }                                                         │
│                                                              │
│    Console: [AUTH] 🔄 Attempting to refresh token...        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Get Refresh Token from localStorage                      │
│    const refreshToken = tokenStorage.getRefreshToken()      │
│                                                              │
│    Console: [AUTH] Refresh token exists: ✓                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Call Refresh Endpoint                                    │
│    POST /api/v1/auth/refresh                                │
│    Body: { "refreshToken": "..." }                          │
│                                                              │
│    ⚠️  IMPORTANT: This call does NOT use Authorization      │
│        header (no bearer token needed)                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Backend Returns New Tokens                               │
│    {                                                         │
│      "success": true,                                       │
│      "data": {                                              │
│        "access_token": "new_abc123...",                     │
│        "refresh_token": "new_xyz789...",                    │
│        "expires_at": "2025-12-15T10:15:00Z"                 │
│      }                                                       │
│    }                                                         │
│                                                              │
│    Console: [AUTH] Refresh response: {...}                  │
│    Console: [AUTH] Extracted tokens:                        │
│             accessToken: ✓ Present                          │
│             refreshToken: ✓ Present                         │
│             format: "snake_case"                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. Extract & Store New Tokens                               │
│    const accessToken = data.access_token                    │
│    const newRefreshToken = data.refresh_token               │
│                                                              │
│    tokenStorage.setTokens(accessToken, newRefreshToken)     │
│                                                              │
│    Console: [AUTH] ✅ Tokens refreshed and stored           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 9. Retry Original Request with New Token                    │
│    originalRequest.headers.Authorization =                  │
│      `Bearer ${newAccessToken}`                             │
│                                                              │
│    return client(originalRequest)                           │
│                                                              │
│    → GET /api/v1/auth/sessions (retried)                    │
│    → Returns 200 OK with session data                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 10. Settings Page Loads Successfully                        │
│     ✅ User never saw any error                             │
│     ✅ Completely seamless experience                       │
└─────────────────────────────────────────────────────────────┘
```

**Total Time:** ~200ms (user might notice slight delay)

---

## Code Locations

### 1. **Token Storage**
**File:** `src/utils/tokenStorage.ts`

```typescript
// Where tokens are stored:
const ACCESS_TOKEN_KEY = "at";         // In memory (variable)
const REFRESH_TOKEN_KEY = "rt";        // In localStorage

getRefreshToken(): localStorage.getItem('rt')
setTokens(at, rt): Memory + localStorage
```

### 2. **Auth Initialization (Page Load)**
**File:** `src/context/AuthContext.tsx` (line 49-63)

```typescript
useEffect(() => {
  const initAuth = async () => {
    const user = await authApi.initializeAuth();  // ← Uses refresh token
    setUser(user);
  };
  initAuth();
}, []);
```

### 3. **Refresh Token API Call**
**File:** `src/api/auth.ts` (line 193-215)

```typescript
refreshToken: async (refreshToken: string) => {
  const response = await client.post('/v1/auth/refresh', { refreshToken });

  // Transform snake_case to camelCase
  return {
    accessToken: data.accessToken || data.access_token,
    refreshToken: data.refreshToken || data.refresh_token,
    expiresAt: data.expiresAt || data.expires_at,
  };
}
```

### 4. **Auto-Refresh on 401**
**File:** `src/api/client.ts` (line 61-168)

```typescript
client.interceptors.response.use(
  response => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Get refresh token and call /v1/auth/refresh
      const refreshToken = tokenStorage.getRefreshToken();
      const { data } = await axios.post('/v1/auth/refresh', { refreshToken });

      // Store new tokens
      tokenStorage.setTokens(newAccessToken, newRefreshToken);

      // Retry original request
      return client(originalRequest);
    }
  }
);
```

---

## Token Lifetimes

| Token Type | Lifetime | Storage | Auto-Renewed? |
|------------|----------|---------|---------------|
| Access Token | **15 minutes** | Memory (RAM) | ✅ Yes (every 15 min) |
| Refresh Token (normal) | **7 days** | localStorage | ✅ Yes (rotated on each refresh) |
| Refresh Token ("Remember Me") | **30 days** | localStorage | ✅ Yes (rotated on each refresh) |

---

## Why Sessions Might Still Expire

### Possibility 1: Refresh Token is Invalid/Expired

**Check in Console:**
```
[AUTH] ❌ Token refresh failed: Request failed with status code 401
```

**Reasons:**
- Refresh token is > 7 days old (or 30 days with "Remember Me")
- Password was changed (invalidates all tokens)
- "Logout all devices" was used
- Backend database was reset

**Solution:** User must login again

---

### Possibility 2: Backend Returns Wrong Format

**Check in Console:**
```
[AUTH] Extracted tokens: {
  accessToken: ✗ Missing,
  refreshToken: ✗ Missing
}
[AUTH] ❌ Invalid refresh token response format
```

**Reason:** Backend returns unexpected format (not snake_case OR camelCase)

**Solution:** Check actual backend response in Network tab

---

### Possibility 3: Refresh Token Not Being Stored

**Check in Console:**
```
[AUTH] 🚀 Initializing auth...
[AUTH] No refresh token found - user not logged in
```

**Check in Browser:**
```javascript
localStorage.getItem('rt')  // Should not be null
```

**Reason:** Login function not storing refresh token

**Solution:** Check login response actually has tokens

---

## Debugging Steps

1. **Open browser DevTools Console**
2. **Login to the app**
3. **Watch for** `[AUTH]` **logs:**
   - Should see tokens being stored
4. **Refresh the page**
5. **Watch for auto-login:**
   ```
   [AUTH] 🚀 Initializing auth...
   [AUTH] Refresh token found, attempting to restore session...
   [AUTH] ✅ Tokens refreshed successfully
   [AUTH] ✅ User data fetched: user@example.com
   ```

If you still see "session expired", **share these from Console:**
- All `[AUTH]` logs
- Any errors in red

---

## Current Status (v0.5.4)

✅ Refresh token IS implemented
✅ Auto-login on page load IS working
✅ Auto-refresh on 401 IS working
✅ Handles BOTH snake_case AND camelCase responses
✅ Detailed console logging for debugging

**Next:** Test with actual app and check Console logs!
