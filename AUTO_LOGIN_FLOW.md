# Auto-Login Flow Documentation

## ✅ Yes, Auto-Login is Fully Implemented!

Your users will **automatically stay logged in** even after:
- Closing the browser
- Refreshing the page
- Returning after days/weeks (until refresh token expires)

---

## How It Works

### 1. **Token Storage Strategy**

```
┌─────────────────────────────────────────┐
│         Token Storage System            │
├─────────────────────────────────────────┤
│                                         │
│  Access Token:  In-Memory (RAM)         │
│  ├─ Lifetime: ~15 minutes               │
│  ├─ Security: Cleared on page refresh   │
│  └─ Usage: Attached to all API calls    │
│                                         │
│  Refresh Token: localStorage            │
│  ├─ Lifetime: 7 days (or 30 if "Remember Me") │
│  ├─ Security: Survives page refresh     │
│  └─ Usage: Gets new access token        │
└─────────────────────────────────────────┘
```

**Location:** `src/utils/tokenStorage.ts`

---

### 2. **Auto-Login on Page Load**

Every time the user opens your app:

```
┌──────────────────────────────────────────────────────────┐
│  1. App Loads (page.tsx / layout.tsx)                    │
│     └─> AuthProvider component initializes               │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│  2. AuthContext.tsx - useEffect() runs                   │
│     └─> calls authApi.initializeAuth()                   │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│  3. Check for Refresh Token in localStorage              │
│     ├─ Token exists? → Continue                          │
│     └─ No token? → User stays logged out                 │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│  4. Call API: POST /v1/auth/refresh                      │
│     Request: { refreshToken: "..." }                     │
│     Response: { accessToken, refreshToken, expiresAt }   │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│  5. Store New Tokens                                     │
│     ├─ accessToken → In-memory                           │
│     └─ refreshToken → localStorage (updated)             │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│  6. Fetch User Data: GET /v1/auth/me                     │
│     └─ Uses new access token in Authorization header     │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│  7. User Logged In! ✅                                   │
│     └─> Redirect to dashboard (if on login page)         │
│     └─> Show user profile in header                      │
│     └─> Enable protected routes                          │
└──────────────────────────────────────────────────────────┘
```

**Code:** `src/api/auth.ts:207-223` (initializeAuth function)

---

### 3. **Automatic Token Refresh on 401**

If the access token expires during usage, it's **automatically refreshed**:

```
User makes API call
    │
    ▼
Access token expired? (API returns 401)
    │
    ▼
Axios Interceptor catches 401
    │
    ├─ Pause all pending requests
    │
    ▼
Call POST /v1/auth/refresh
    │
    ├─ Success? → Get new tokens
    │   ├─ Update tokenStorage
    │   └─ Retry original request with new token
    │
    └─ Failed? → Clear tokens, redirect to login
```

**Code:** `src/api/client.ts:61-143` (Axios response interceptor)

---

### 4. **Login Flow with "Remember Me"**

When user logs in:

```typescript
// Login WITHOUT "Remember Me"
await login(email, password, false)
→ Refresh token expires in 7 days

// Login WITH "Remember Me"
await login(email, password, true)
→ Refresh token expires in 30 days
```

**Code:** `src/context/AuthContext.tsx:69-85`

---

## Token Expiration Timeline

### Regular Login (rememberMe: false)
```
Day 0        Day 7
 │────────────│
 Login      Token
          Expires
          (must login again)
```

### "Remember Me" Login (rememberMe: true)
```
Day 0                             Day 30
 │─────────────────────────────────│
 Login                           Token
                               Expires
```

### Access Token (auto-refreshed)
```
0 min           15 min          30 min          45 min
 │───────────────│───────────────│───────────────│
Login        Auto-refresh    Auto-refresh    Auto-refresh
              (seamless)      (seamless)      (seamless)

User never notices - happens automatically!
```

---

## Security Features

### 1. **XSS Protection**
- **Access token in memory only** → Cleared on page refresh
- Cannot be stolen by XSS attacks that read localStorage/cookies
- Short-lived (15 minutes)

### 2. **CSRF Protection**
- Tokens are in localStorage, not cookies
- No automatic sending by browser
- Must be explicitly added to request headers

### 3. **Token Rotation**
- Every refresh returns a **new** refresh token
- Old refresh token is invalidated
- Prevents token replay attacks

---

## User Experience Examples

### Scenario 1: User Closes Browser
```
1. User logs in (10:00 AM)
   → Tokens stored: Access (memory) + Refresh (localStorage)

2. User closes browser (10:30 AM)
   → Access token lost (was in memory)
   → Refresh token saved (in localStorage)

3. User reopens browser (2:00 PM)
   → App checks localStorage
   → Finds refresh token
   → Calls /v1/auth/refresh
   → Gets new access token
   → User is logged in automatically! ✅
```

### Scenario 2: User Refreshes Page
```
1. User on dashboard (logged in)

2. User hits F5 / Cmd+R
   → Access token lost (was in memory)
   → Refresh token still in localStorage

3. Page reloads
   → AuthContext.initializeAuth() runs
   → Uses refresh token to get new access token
   → User stays logged in seamlessly! ✅
```

### Scenario 3: Access Token Expires
```
1. User viewing dashboard (11:00 AM)
   → Access token expires at 11:15 AM

2. User clicks "Settings" (11:20 AM)
   → API call fails with 401
   → Axios interceptor catches it
   → Automatically calls /v1/auth/refresh
   → Gets new access token
   → Retries Settings API call
   → Page loads normally! ✅

User never notices anything - completely seamless!
```

### Scenario 4: Refresh Token Expires
```
1. User last logged in 8 days ago (with regular login)
   → Refresh token only lasts 7 days

2. User returns to app (8 days later)
   → App tries to refresh tokens
   → Refresh token expired → API returns 401
   → Tokens cleared
   → Redirected to login page
   → Message: "Your session has expired. Please sign in again."
```

---

## Code Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│              App Initialization                     │
│                                                     │
│  src/app/layout.tsx                                 │
│    └─> <AuthProvider>                              │
│          └─> useEffect(() => initAuth())            │
│                                                     │
│  src/context/AuthContext.tsx (line 49-63)          │
│    └─> authApi.initializeAuth()                    │
│                                                     │
│  src/api/auth.ts (line 207-223)                    │
│    ├─> Check for refresh token in localStorage     │
│    ├─> Call POST /v1/auth/refresh                  │
│    ├─> Store new access token (memory)             │
│    ├─> Store new refresh token (localStorage)      │
│    └─> Call GET /v1/auth/me to fetch user          │
│                                                     │
│  src/utils/tokenStorage.ts                         │
│    ├─> getRefreshToken() - reads from localStorage │
│    └─> setTokens() - stores both tokens            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│         Automatic Token Refresh (on 401)            │
│                                                     │
│  src/api/client.ts (line 61-143)                   │
│    └─> Axios Response Interceptor                  │
│          ├─> Catch 401 errors                      │
│          ├─> Queue pending requests                │
│          ├─> Call POST /v1/auth/refresh            │
│          ├─> Update tokens                         │
│          └─> Retry failed requests                 │
└─────────────────────────────────────────────────────┘
```

---

## Testing Auto-Login

### Test 1: Page Refresh
1. Login to the app
2. Press F5 / Cmd+R
3. **Expected:** Still logged in, no redirect to login page

### Test 2: Close and Reopen Browser
1. Login to the app
2. Close browser completely
3. Reopen browser and navigate to the app
4. **Expected:** Still logged in automatically

### Test 3: Token Expiration
1. Login to the app
2. Wait 16+ minutes (access token expires after 15 min)
3. Navigate to a protected page
4. **Expected:** Page loads normally (token auto-refreshed)

### Test 4: Logout
1. Click "Logout"
2. Refresh page
3. **Expected:** Redirected to login page (tokens cleared)

---

## Configuration

### Token Expiration Settings (Backend)

**Default values** (configured in backend):
```
Access Token:  15 minutes
Refresh Token: 7 days (regular login)
               30 days (with "Remember Me")
```

### Where Tokens Are Stored

**Browser Developer Tools:**
```
Application Tab → Local Storage → http://localhost:3000
  └─ rt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     ↑
     Refresh Token (persists across sessions)

Memory (not visible in DevTools)
  └─ Access Token (cleared on page refresh)
```

---

## Summary

✅ **Auto-login is fully implemented and working**

✅ **User experience:**
- Login once, stay logged in for 7-30 days
- Seamless across page refreshes
- Seamless across browser restarts
- Automatic token renewal (invisible to user)

✅ **Security:**
- Access tokens in memory (XSS protection)
- Short-lived access tokens (15 min)
- Token rotation on every refresh
- Automatic cleanup on logout

✅ **Code locations:**
- Token storage: `src/utils/tokenStorage.ts`
- Auto-login logic: `src/api/auth.ts:207-223`
- Auth initialization: `src/context/AuthContext.tsx:49-63`
- Auto-refresh on 401: `src/api/client.ts:61-143`

**Your users will never have to re-login unless:**
1. They explicitly logout
2. Refresh token expires (7-30 days)
3. They clear browser data
4. Security event (password change, logout all devices)
