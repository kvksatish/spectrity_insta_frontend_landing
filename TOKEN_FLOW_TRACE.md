# Complete Token Flow Trace - Diagnostic Guide

This document traces **every step** of the token flow to help identify exactly where it's breaking.

---

## 🔐 Flow 1: LOGIN - User Clicks "Sign In"

### Step 1: User Submits Login Form
**File:** `src/app/login/page.tsx:33-56`

```
User fills form:
├─ Email: user@example.com
├─ Password: ••••••••
└─ Remember Me: ✓ checked (or unchecked)

User clicks "Sign In" button
└─> handleSubmit() triggered
    └─> await login(email, password, rememberMe)
```

**What to check:**
- ✅ Is the form being submitted?
- ✅ Are email, password, rememberMe values correct?

---

### Step 2: AuthContext.login() Called
**File:** `src/context/AuthContext.tsx:69-85`

```typescript
const login = async (email: string, password: string, rememberMe = false) => {
  const user = await authApi.login(email, password, rememberMe);  // ← Goes to Step 3

  // Check if email is verified
  if (user.provider === "LOCAL" && !user.isEmailVerified) {
    throw new Error("Please verify your email...");
  }

  setUser(user);  // ← Updates context with user data
};
```

**What to check:**
- ✅ Is `authApi.login()` being called?
- ✅ Does it throw an error before reaching `setUser()`?

**Console log to add:**
```typescript
console.log("[LOGIN FLOW] Step 2: Calling authApi.login with:", { email, rememberMe });
```

---

### Step 3: API Login Request
**File:** `src/api/auth.ts:34-66`

```typescript
login: async (email: string, password: string, rememberMe = false): Promise<User> => {
  // 3A: Send HTTP POST request
  const response = await client.post<ApiResponse<LoginResponse>>(
    "/v1/auth/login",
    { email, password, rememberMe }
  );

  // 3B: Extract response data
  const data = response.data.data;
  if (!data) throw new Error("Invalid response from server");

  // 3C: Handle both snake_case and camelCase
  const rawData = data as any;
  const accessToken = rawData.accessToken || rawData.access_token;
  const refreshToken = rawData.refreshToken || rawData.refresh_token;
  const user = rawData.user;

  if (!accessToken || !refreshToken || !user) {
    throw new Error("Invalid login response format");
  }

  // 3D: Store tokens (Goes to Step 4)
  tokenStorage.setTokens(accessToken, refreshToken);

  // 3E: Transform and return user
  return transformUser(user as any);
}
```

**What to check:**
- ✅ **CRITICAL:** Does `response.data.data` exist?
- ✅ **CRITICAL:** Does it contain `accessToken` or `access_token`?
- ✅ **CRITICAL:** Does it contain `refreshToken` or `refresh_token`?

**Console logs to add:**
```typescript
console.log("[LOGIN FLOW] Step 3A: Sending POST to /v1/auth/login");
console.log("[LOGIN FLOW] Step 3B: Full response:", response.data);
console.log("[LOGIN FLOW] Step 3C: Extracted data:", {
  hasAccessToken: !!accessToken,
  hasRefreshToken: !!refreshToken,
  hasUser: !!user,
  accessTokenFormat: rawData.access_token ? 'snake_case' : 'camelCase',
});
```

**🚨 MOST LIKELY FAILURE POINT 🚨**
If backend returns wrong format, tokens won't be found and error is thrown here.

---

### Step 4: Token Storage
**File:** `src/utils/tokenStorage.ts:51-56`

```typescript
setTokens: (accessToken: string, refreshToken: string): void => {
  // 4A: Store access token in memory (RAM)
  inMemoryAccessToken = accessToken;

  // 4B: Store refresh token in localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);  // REFRESH_TOKEN_KEY = "rt"
  }
}
```

**What to check:**
- ✅ Is `window` defined? (should be, since we're in browser)
- ✅ **CRITICAL:** Is `localStorage.setItem("rt", refreshToken)` being called?

**Console logs to add:**
```typescript
console.log("[LOGIN FLOW] Step 4: Storing tokens");
console.log("[LOGIN FLOW] Access token (first 30 chars):", accessToken.substring(0, 30));
console.log("[LOGIN FLOW] Refresh token (first 30 chars):", refreshToken.substring(0, 30));

localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

console.log("[LOGIN FLOW] ✅ Tokens stored successfully");
console.log("[LOGIN FLOW] Verify storage:", {
  rt: localStorage.getItem("rt")?.substring(0, 30)
});
```

**Manual verification:**
Open DevTools Console and run:
```javascript
localStorage.getItem("rt")
```
Should return a JWT token string.

---

### Step 5: Login Complete - User Redirected
**File:** `src/app/login/page.tsx:41-50`

```
Login successful
├─> setUser(user) updates AuthContext
└─> router.push("/dashboard")
    └─> User redirected to dashboard
```

**What to check:**
- ✅ Is user redirected to dashboard?
- ✅ Is user data visible in dashboard?

---

## 🔄 Flow 2: AUTO-LOGIN - User Refreshes Page or Returns Later

### Step 1: App Initializes
**File:** `src/app/layout.tsx` → wraps app with `<AuthProvider>`

```
User opens app / refreshes page
└─> Next.js renders layout.tsx
    └─> <AuthProvider> component mounts
        └─> useEffect() runs (Step 2)
```

---

### Step 2: AuthContext Initialization
**File:** `src/context/AuthContext.tsx:49-63`

```typescript
useEffect(() => {
  const initAuth = async () => {
    try {
      const user = await authApi.initializeAuth();  // ← Goes to Step 3
      setUser(user);  // ← User logged in!
    } catch (error) {
      console.error("Auth initialization failed:", error);
      setUser(null);  // ← User stays logged out
    } finally {
      setLoading(false);
    }
  };

  initAuth();
}, []);
```

**What to check:**
- ✅ Is `initAuth()` being called?
- ✅ Does it throw an error?
- ✅ Is `setUser()` called with user data or null?

**Console log to add:**
```typescript
console.log("[AUTO-LOGIN] Step 2: Starting auth initialization");
```

---

### Step 3: Initialize Auth - Check for Refresh Token
**File:** `src/api/auth.ts:221-249`

```typescript
initializeAuth: async (): Promise<User | null> => {
  console.log("[AUTH] 🚀 Initializing auth...");

  // 3A: Check localStorage for refresh token
  const refreshToken = tokenStorage.getRefreshToken();

  if (!refreshToken) {
    console.log("[AUTH] No refresh token found - user not logged in");  // ← YOU ARE SEEING THIS!
    return null;
  }

  console.log("[AUTH] Refresh token found, attempting to restore session...");

  try {
    // 3B: Refresh access token (Goes to Step 4)
    const tokenData = await authApi.refreshToken(refreshToken);
    tokenStorage.setTokens(tokenData.accessToken, tokenData.refreshToken);
    console.log("[AUTH] ✅ Tokens refreshed successfully");

    // 3C: Get current user
    const user = await authApi.getCurrentUser();
    console.log("[AUTH] ✅ User data fetched:", user.email);
    return user;
  } catch (error: any) {
    console.error("[AUTH] ❌ Session restore failed:", error.message);
    tokenStorage.clearTokens();
    return null;
  }
}
```

**🚨 YOU ARE FAILING AT STEP 3A 🚨**
The error `"No refresh token found - user not logged in"` means:
- `tokenStorage.getRefreshToken()` returns `null`
- Which means `localStorage.getItem("rt")` returns `null`
- Which means the token was NEVER stored after login!

**What to check:**
```typescript
// Add this at the very start:
console.log("[AUTO-LOGIN] Step 3A: Checking for refresh token");
const refreshToken = tokenStorage.getRefreshToken();
console.log("[AUTO-LOGIN] Step 3A: Result:", {
  found: !!refreshToken,
  value: refreshToken ? refreshToken.substring(0, 30) + "..." : null,
  localStorage_rt: typeof window !== 'undefined' ? localStorage.getItem("rt") : 'N/A'
});
```

---

### Step 4: Token Refresh API Call
**File:** `src/api/auth.ts:201-215`

```typescript
refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
  const response = await client.post<ApiResponse<any>>(
    "/v1/auth/refresh",
    { refreshToken }
  );
  const data = response.data.data;
  if (!data) throw new Error("Invalid response from server");

  return {
    accessToken: data.accessToken || data.access_token,
    refreshToken: data.refreshToken || data.refresh_token,
    expiresAt: data.expiresAt || data.expires_at,
  };
}
```

**This step is NEVER reached** because Step 3A fails first.

---

## 🔄 Flow 3: TOKEN REFRESH - Access Token Expires (401 Error)

### Step 1: API Request Gets 401
**File:** `src/api/client.ts:61-168`

When any API call returns 401, the axios interceptor catches it.

```
User makes API call (e.g., GET /v1/user/profile)
└─> API returns 401 Unauthorized (access token expired)
    └─> Axios response interceptor catches error
        └─> Attempts automatic token refresh
```

**What to check:**
- ✅ Is the interceptor being triggered?
- ✅ Does `tokenStorage.getRefreshToken()` find a token?

**This also fails at the same point** - no refresh token in localStorage!

---

## 🎯 ROOT CAUSE ANALYSIS

### The Problem Chain

```
❌ SYMPTOM:
Auto-login fails with "No refresh token found"

↓

❌ IMMEDIATE CAUSE:
localStorage.getItem("rt") returns null

↓

❌ ROOT CAUSE (one of these):

Option A: Backend NOT sending refresh_token in login response
├─ Response might be: { success: true, data: { user: {...} } }
├─ Missing: access_token and refresh_token fields
└─ Frontend throws error before storing tokens

Option B: Backend sending tokens with wrong field names
├─ Response might use: { data: { token: "...", refresh: "..." } }
├─ Frontend looks for: accessToken/access_token and refreshToken/refresh_token
└─ Frontend can't find them, throws error

Option C: Backend sending tokens in HTTP-only cookies
├─ Tokens are set as: Set-Cookie: refreshToken=...;HttpOnly
├─ Frontend JavaScript cannot read HttpOnly cookies
└─ localStorage.setItem() never called

Option D: CORS/Network error during login
├─ Login request fails silently
├─ No response received
└─ Tokens never extracted

Option E: Frontend client not configured for credentials
├─ Backend sends tokens in cookies
├─ Frontend axios client doesn't send withCredentials: true
└─ Cookies not saved by browser
```

---

## 🔬 DIAGNOSTIC TESTS

### Test 1: Check Browser Console After Login

**Action:** Login normally, then immediately run in Console:

```javascript
// Check localStorage
console.log("Refresh token in localStorage:", localStorage.getItem("rt"));

// Check all localStorage keys
console.log("All localStorage keys:", Object.keys(localStorage));

// Check if tokenStorage is accessible
console.log("Token storage state:", {
  hasRefreshToken: localStorage.getItem("rt") !== null,
  hasUser: localStorage.getItem("user") !== null
});
```

**Expected Result:**
```
Refresh token in localStorage: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**If null:** Tokens are NOT being stored during login.

---

### Test 2: Check Network Tab During Login

**Action:**
1. Open DevTools → Network tab
2. Click "Sign In"
3. Find the `POST /v1/auth/login` request
4. Check the Response

**Expected Response Format:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "expires_at": "2025-12-15T...",
    "user": {
      "id": "123",
      "email": "user@example.com",
      ...
    }
  }
}
```

**🚨 If you don't see `access_token` and `refresh_token` in the response:**
→ **BACKEND PROBLEM:** Backend is not sending tokens!

**🚨 If response has `token` instead of `access_token`:**
→ **FIELD NAME MISMATCH:** Backend uses different field names.

**🚨 If response is just `{ success: true }`:**
→ **BACKEND SENDS COOKIES:** Tokens might be in `Set-Cookie` headers.

---

### Test 3: Check Response Headers for Cookies

**Action:**
1. After login, in Network tab, select the login request
2. Go to "Response Headers"
3. Look for `Set-Cookie` headers

**If you see:**
```
Set-Cookie: refreshToken=eyJhbGc...;HttpOnly;Secure;SameSite=Strict
Set-Cookie: accessToken=eyJhbGc...;HttpOnly;Secure;SameSite=Strict
```

**→ BACKEND USES COOKIES, NOT RESPONSE BODY**
Your frontend needs to be updated to use `withCredentials: true`.

---

### Test 4: Manual API Test (Curl)

**Action:** Test backend directly:

```bash
curl -X POST http://localhost:3005/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234",
    "rememberMe": true
  }' \
  -v
```

**Check the output:**
1. **Response body** - Should contain `access_token` and `refresh_token`
2. **Response headers** - Check for `Set-Cookie` headers

---

### Test 5: Add Debug Logging to Login Flow

**Action:** Temporarily add extensive logging:

```typescript
// In src/api/auth.ts, update login function:
login: async (email: string, password: string, rememberMe = false): Promise<User> => {
  console.log("════════════════════════════════════════");
  console.log("[LOGIN DEBUG] 1. Starting login request");
  console.log("[LOGIN DEBUG] Email:", email);
  console.log("[LOGIN DEBUG] Remember me:", rememberMe);

  const response = await client.post<ApiResponse<LoginResponse>>(
    "/v1/auth/login",
    { email, password, rememberMe }
  );

  console.log("[LOGIN DEBUG] 2. Received response");
  console.log("[LOGIN DEBUG] Status:", response.status);
  console.log("[LOGIN DEBUG] Full response data:", JSON.stringify(response.data, null, 2));

  const data = response.data.data;
  console.log("[LOGIN DEBUG] 3. Extracted data:", data);

  if (!data) {
    console.error("[LOGIN DEBUG] ❌ No data field in response!");
    throw new Error("Invalid response from server");
  }

  const rawData = data as any;
  console.log("[LOGIN DEBUG] 4. Raw data keys:", Object.keys(rawData));

  const accessToken = rawData.accessToken || rawData.access_token;
  const refreshToken = rawData.refreshToken || rawData.refresh_token;
  const user = rawData.user;

  console.log("[LOGIN DEBUG] 5. Token extraction results:");
  console.log("  - accessToken found:", !!accessToken);
  console.log("  - refreshToken found:", !!refreshToken);
  console.log("  - user found:", !!user);

  if (accessToken) {
    console.log("  - accessToken preview:", accessToken.substring(0, 50) + "...");
  }
  if (refreshToken) {
    console.log("  - refreshToken preview:", refreshToken.substring(0, 50) + "...");
  }

  if (!accessToken || !refreshToken || !user) {
    console.error("[LOGIN DEBUG] ❌ Missing required fields!");
    console.error("Response structure:", {
      keys: Object.keys(rawData),
      values: rawData
    });
    throw new Error("Invalid login response format");
  }

  console.log("[LOGIN DEBUG] 6. Calling tokenStorage.setTokens()");
  tokenStorage.setTokens(accessToken, refreshToken);

  console.log("[LOGIN DEBUG] 7. Verifying storage:");
  console.log("  - localStorage.rt:", localStorage.getItem("rt")?.substring(0, 50));
  console.log("════════════════════════════════════════");

  return transformUser(user as any);
}
```

**Try logging in and watch the console output.**

---

## 📊 DEBUGGING CHECKLIST

Run through this checklist:

- [ ] **After login, run in Console:** `localStorage.getItem("rt")`
  - [ ] Returns a JWT token string → ✅ Login working
  - [ ] Returns `null` → ❌ Tokens not being stored

- [ ] **Check Network tab login response:**
  - [ ] Has `access_token` field → ✅ Backend sending correct format
  - [ ] Has different field name → ⚠️ Field name mismatch
  - [ ] Missing token fields → ❌ Backend not sending tokens

- [ ] **Check Response Headers:**
  - [ ] No `Set-Cookie` headers → ✅ Using response body (good)
  - [ ] Has `Set-Cookie` headers → ⚠️ Using cookies (needs frontend update)

- [ ] **Check Console logs:**
  - [ ] See `[LOGIN DEBUG]` messages → ✅ Logging working
  - [ ] See token previews → ✅ Tokens extracted
  - [ ] See error before storage → ❌ Extraction failing

- [ ] **After login, check AuthDebug panel:**
  - [ ] Shows refresh token → ✅ Storage working
  - [ ] Shows "None" → ❌ Storage failed

---

## 🎯 NEXT STEPS

1. **Add the debug logging** to `src/api/auth.ts` login function
2. **Clear localStorage:** `localStorage.clear()`
3. **Login again** and watch the console
4. **Share the console output** with me
5. **Share the Network tab response** for the login request

This will tell us **exactly** where it's breaking!

---

## 💡 QUICK FIX IF BACKEND SENDS DIFFERENT FIELD NAMES

If backend sends `{ token, refresh }` instead of `{ access_token, refresh_token }`:

```typescript
// In src/api/auth.ts:52-55, update to:
const accessToken = rawData.accessToken || rawData.access_token || rawData.token;
const refreshToken = rawData.refreshToken || rawData.refresh_token || rawData.refresh;
```

---

## 💡 QUICK FIX IF BACKEND USES COOKIES

If backend sends tokens via HTTP-only cookies:

```typescript
// In src/api/client.ts:13-19, update to:
const client = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,  // ← ADD THIS
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});
```

Then update `tokenStorage.ts` to not store refresh token (browser handles it automatically).
