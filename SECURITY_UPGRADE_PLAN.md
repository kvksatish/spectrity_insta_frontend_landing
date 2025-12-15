# Token Storage Security Upgrade Plan

## 🚨 Current Vulnerabilities Assessment

### Critical Issues Found in Current Code

| File | Line | Issue | Severity | Impact |
|------|------|-------|----------|--------|
| `src/api/auth.ts` | 222-248 | Debug logs with token info | 🔴 HIGH | Token exposure in console, error trackers |
| `src/api/client.ts` | 103-124 | Logs refresh token presence | 🔴 HIGH | Token metadata exposed |
| `src/utils/tokenStorage.ts` | All | Plaintext localStorage | 🔴 HIGH | XSS vulnerability |
| `src/components/AuthDebug.tsx` | 52-88 | Displays token previews | 🔴 CRITICAL | Full token exposure in UI |
| `test-token-flow.sh` | All | Logs tokens in terminal | 🟡 MEDIUM | Dev environment exposure |
| `TOKEN_FLOW_TRACE.md` | All | Token examples in docs | 🟡 MEDIUM | Documentation exposure |

### Security Score: **3/10** ⚠️

**Why this matters for fintech:**
- Instagram data extraction might include payment info, DMs, business data
- Compromised tokens = unauthorized access to user Instagram accounts
- XSS attacks can steal tokens and impersonate users
- Regulatory compliance issues (GDPR, data protection laws)

---

## 📋 Three-Phase Security Upgrade Plan

### Phase 1: IMMEDIATE (Can implement today - 2 hours)
**Priority:** Remove all token logging and implement basic security

### Phase 2: SHORT-TERM (Backend coordination - 1 week)
**Priority:** Implement HttpOnly cookies with backend team

### Phase 3: LONG-TERM (Enhanced security - 2 weeks)
**Priority:** Add encryption, token binding, security monitoring

---

## 🔥 Phase 1: IMMEDIATE FIXES (Critical)

### Changes Required:

#### 1. Remove ALL Debug Logging with Tokens

**Files to modify:**
- ✅ `src/api/auth.ts` - Remove token logs
- ✅ `src/api/client.ts` - Remove token preview logs
- ✅ `src/components/AuthDebug.tsx` - Remove or disable in production
- ✅ `src/utils/tokenStorage.ts` - Add production-safe logging

**Implementation:**

```typescript
// Create a secure logger utility
// src/utils/secureLogger.ts

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const IS_DEBUG_ENABLED = process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true';

export const secureLog = {
  auth: (message: string, data?: any) => {
    if (IS_PRODUCTION && !IS_DEBUG_ENABLED) return;

    // Never log actual tokens
    const sanitized = sanitizeLogData(data);
    console.log(`[AUTH] ${message}`, sanitized);
  },

  error: (message: string, error: any) => {
    // Only log error messages, not full error objects that might contain tokens
    console.error(`[AUTH ERROR] ${message}`, {
      message: error?.message,
      code: error?.code,
      status: error?.status
    });
  }
};

const sanitizeLogData = (data: any): any => {
  if (!data) return data;

  const sensitive = ['token', 'accessToken', 'refreshToken', 'access_token', 'refresh_token', 'password'];
  const sanitized = { ...data };

  for (const key of Object.keys(sanitized)) {
    if (sensitive.some(s => key.toLowerCase().includes(s))) {
      sanitized[key] = sanitized[key] ? '***REDACTED***' : null;
    }
  }

  return sanitized;
};
```

#### 2. Add Token Expiry Validation

```typescript
// src/utils/tokenStorage.ts - Enhanced version

interface StoredTokenData {
  token: string;
  expiresAt: number;
  storedAt: number;
}

export const tokenStorage = {
  setRefreshToken: (token: string, expiresInDays = 7): void => {
    if (typeof window === "undefined") return;

    const data: StoredTokenData = {
      token,
      expiresAt: Date.now() + (expiresInDays * 24 * 60 * 60 * 1000),
      storedAt: Date.now()
    };

    localStorage.setItem(REFRESH_TOKEN_KEY, JSON.stringify(data));
  },

  getRefreshToken: (): string | null => {
    if (typeof window === "undefined") return null;

    try {
      const raw = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!raw) return null;

      const data: StoredTokenData = JSON.parse(raw);

      // Check expiry
      if (Date.now() > data.expiresAt) {
        secureLog.auth('Refresh token expired, clearing');
        tokenStorage.clearTokens();
        return null;
      }

      return data.token;
    } catch (error) {
      secureLog.error('Failed to parse stored token', error);
      tokenStorage.clearTokens();
      return null;
    }
  }
};
```

#### 3. Disable AuthDebug in Production

```typescript
// src/components/AuthDebug.tsx - Add production check

export function AuthDebug() {
  // Never show in production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  // Only show if explicitly enabled
  if (process.env.NEXT_PUBLIC_DEBUG_AUTH !== 'true') {
    return null;
  }

  // Rest of component...
}
```

#### 4. Add Cross-Tab Logout Sync

```typescript
// src/context/AuthContext.tsx - Add to AuthProvider

useEffect(() => {
  // Sync logout across tabs
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'rt' && e.newValue === null) {
      // Another tab logged out
      setUser(null);
      router.push('/login?reason=logged-out-elsewhere');
    }
  };

  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, []);
```

---

## 🔐 Phase 2: HttpOnly Cookies (Recommended)

### Decision Matrix

| Factor | Your Situation | Recommendation |
|--------|----------------|----------------|
| Backend Control | You have backend access | ✅ Use HttpOnly Cookies |
| Same Domain | Frontend & Backend on same domain? | If YES: ✅ Cookies, If NO: Consider |
| Mobile App Planned | Building mobile app? | If YES: 🟡 Hybrid approach |
| Fintech/Security Critical | Yes (Instagram + payments) | ✅ Strongly recommend cookies |

### Implementation Plan

#### Backend Changes (Required)

**File: Backend auth controller**

```typescript
// Backend: POST /api/v1/auth/login
async login(req, res) {
  const { email, password, rememberMe } = req.body;

  // ... authenticate user ...

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Set HttpOnly cookies
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/'
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
    path: '/api/v1/auth' // Only sent to auth endpoints
  });

  // Response contains NO tokens
  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        // ... other user fields
      }
    }
  });
}

// Backend: POST /api/v1/auth/refresh
async refresh(req, res) {
  // Read refresh token from cookie (NOT request body)
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'No refresh token' });
  }

  // ... validate and generate new tokens ...

  // Set new cookies
  res.cookie('accessToken', newAccessToken, { /* same options */ });
  res.cookie('refreshToken', newRefreshToken, { /* same options */ });

  res.json({
    success: true,
    data: { user }
  });
}

// Backend: POST /api/v1/auth/logout
async logout(req, res) {
  // Clear cookies
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.json({ success: true });
}

// Backend: CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL, // 'http://localhost:3000'
  credentials: true // CRITICAL for cookies
}));

// Backend: Cookie parser middleware
app.use(cookieParser());
```

#### Frontend Changes

**File: `src/api/client.ts`**

```typescript
const client = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // ← ADD THIS: Sends cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Remove request interceptor - no need to manually attach tokens
// Cookies are sent automatically!

// Keep response interceptor for 401 handling
client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Just call refresh - cookies handled automatically
      try {
        await axios.post(`${API_BASE_URL}/v1/auth/refresh`, {}, {
          withCredentials: true
        });

        // Retry original request
        return client(error.config!);
      } catch {
        // Refresh failed - redirect to login
        window.location.href = '/login?session=expired';
      }
    }
    return Promise.reject(error);
  }
);
```

**File: `src/utils/tokenStorage.ts` (Cookie version)**

```typescript
// Simplified - no localStorage needed!

export const tokenStorage = {
  // Access token still in memory for quick checks
  private accessTokenCache: string | null = null;

  // No getRefreshToken - browser handles it via cookies

  clearTokens: (): void => {
    tokenStorage.accessTokenCache = null;
    // Actual cookie clearing happens on backend
  },

  hasSession: async (): Promise<boolean> => {
    // Check by trying to get current user
    try {
      await authApi.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }
};
```

**File: `src/api/auth.ts`**

```typescript
export const authApi = {
  login: async (email: string, password: string, rememberMe = false): Promise<User> => {
    const response = await client.post<ApiResponse<{ user: User }>>(
      "/v1/auth/login",
      { email, password, rememberMe }
    );

    const data = response.data.data;
    if (!data?.user) throw new Error("Invalid response from server");

    // No token storage - cookies set by backend!
    return transformUser(data.user as any);
  },

  initializeAuth: async (): Promise<User | null> => {
    secureLog.auth('Initializing auth...');

    try {
      // No need to check localStorage - just try to get user
      // If cookies are valid, this will succeed
      const user = await authApi.getCurrentUser();
      secureLog.auth('User session restored');
      return user;
    } catch (error: any) {
      secureLog.auth('No valid session found');
      return null;
    }
  },

  refreshToken: async (): Promise<void> => {
    // No parameters needed - cookies sent automatically
    await client.post("/v1/auth/refresh");
    // New cookies set automatically by backend
  },
};
```

### Migration Path (Cookie Approach)

**Step 1:** Backend team implements cookie-based auth (1-2 days)
**Step 2:** Update frontend axios client with `withCredentials: true` (30 minutes)
**Step 3:** Update tokenStorage to remove localStorage logic (1 hour)
**Step 4:** Update authApi to not expect tokens in response body (1 hour)
**Step 5:** Test thoroughly (1 day)
**Step 6:** Deploy backend first, then frontend

---

## 🔒 Phase 3: Enhanced Security (Long-term)

### If Sticking with localStorage (Not Recommended but Necessary for Some Cases)

#### Implement Encryption

```typescript
// src/utils/encryptedStorage.ts

class EncryptedTokenStorage {
  private readonly STORAGE_KEY = 'auth_data';
  private readonly KEY_STORAGE = 'enc_key';
  private accessToken: string | null = null;

  private async getEncryptionKey(): Promise<CryptoKey> {
    const existingKey = sessionStorage.getItem(this.KEY_STORAGE);

    if (existingKey) {
      const keyData = JSON.parse(existingKey);
      return await crypto.subtle.importKey(
        'jwk',
        keyData,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
    }

    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    const exportedKey = await crypto.subtle.exportKey('jwk', key);
    sessionStorage.setItem(this.KEY_STORAGE, JSON.stringify(exportedKey));

    return key;
  }

  private async encrypt(data: string): Promise<string> {
    const key = await this.getEncryptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(data);

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedData
    );

    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  private async decrypt(encryptedData: string): Promise<string> {
    const key = await this.getEncryptionKey();
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    return new TextDecoder().decode(decrypted);
  }

  async setTokens(
    accessToken: string,
    refreshToken: string,
    expiresInSeconds: number
  ): Promise<void> {
    this.accessToken = accessToken;

    const data = JSON.stringify({
      rt: refreshToken,
      exp: Date.now() + (expiresInSeconds * 1000),
      stored: Date.now()
    });

    const encrypted = await this.encrypt(data);
    localStorage.setItem(this.STORAGE_KEY, encrypted);
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      const encrypted = localStorage.getItem(this.STORAGE_KEY);
      if (!encrypted) return null;

      const decrypted = await this.decrypt(encrypted);
      const data = JSON.parse(decrypted);

      if (data.exp && Date.now() > data.exp) {
        this.clearTokens();
        return null;
      }

      return data.rt;
    } catch (error) {
      // Decryption failed - possibly tampered
      this.clearTokens();
      return null;
    }
  }

  clearTokens(): void {
    this.accessToken = null;
    localStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.KEY_STORAGE);
  }
}

export const encryptedTokenStorage = new EncryptedTokenStorage();
```

#### Additional Security Measures

```typescript
// src/utils/securityMonitoring.ts

// 1. Detect token tampering
export const setupSecurityMonitoring = () => {
  // Monitor for suspicious localStorage changes
  window.addEventListener('storage', (e) => {
    if (e.key === 'rt' || e.key === 'auth_data') {
      if (e.oldValue && !e.newValue) {
        // Token removed - possible attack
        console.warn('[SECURITY] Token removed from storage');
        window.dispatchEvent(new CustomEvent('security:token-removed'));
      }
    }
  });

  // Monitor for multiple failed refresh attempts
  let refreshFailCount = 0;
  window.addEventListener('auth:refresh-failed', () => {
    refreshFailCount++;
    if (refreshFailCount > 3) {
      console.warn('[SECURITY] Multiple refresh failures detected');
      // Force logout
      window.dispatchEvent(new CustomEvent('auth:force-logout'));
    }
  });
};

// 2. Token rotation - implement in backend
// Every refresh should return a NEW refresh token and invalidate the old one

// 3. Device fingerprinting (optional, privacy concerns)
const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
};

// Send device ID with auth requests for backend to track sessions
```

---

## 📊 Recommended Approach for Your Project

### Given Your Context:
- ✅ Fintech application (high security needs)
- ✅ Instagram data extraction (sensitive user data)
- ✅ You control the backend
- ✅ Same-origin deployment likely

### **Recommendation: HttpOnly Cookies (Phase 2)**

**Timeline:**
- **Week 1:** Implement Phase 1 (remove logs, add validation) - 1 day
- **Week 2:** Coordinate with backend for cookie implementation - 3 days
- **Week 3:** Frontend migration to cookie-based auth - 2 days
- **Week 4:** Testing and deployment - 2 days

**Total: 8 days development time**

---

## 🎯 Action Plan - Starting Today

### Today (2 hours):
1. ✅ Create `src/utils/secureLogger.ts`
2. ✅ Replace all console.log in auth files with secureLog
3. ✅ Add production check to AuthDebug component
4. ✅ Add token expiry validation to tokenStorage
5. ✅ Add cross-tab logout sync
6. ✅ Test that auth still works

### This Week:
1. Meet with backend team about HttpOnly cookie implementation
2. Review backend auth endpoints
3. Plan migration strategy
4. Set up staging environment for testing

### Next Week:
1. Backend implements cookie-based auth
2. Frontend updates client configuration
3. Update tokenStorage to cookie version
4. Integration testing

### Week 3:
1. Deploy to staging
2. Security audit
3. Deploy to production (backend first, then frontend)

---

## 🧪 Testing Checklist

Before deploying security changes:

- [ ] Login flow works
- [ ] Auto-login works after page refresh
- [ ] Token refresh works on 401
- [ ] Logout clears all tokens/cookies
- [ ] Cross-tab logout sync works
- [ ] No tokens visible in console logs
- [ ] No tokens visible in network tab response bodies
- [ ] HttpOnly cookies set correctly (check DevTools → Application → Cookies)
- [ ] Cookies sent with API requests
- [ ] Session expires correctly
- [ ] Remember Me works correctly

---

## 📝 Checklist Summary

### Phase 1 (Immediate - Critical):
- [ ] Remove all token logging from codebase
- [ ] Create secureLogger utility
- [ ] Add token expiry validation
- [ ] Disable AuthDebug in production
- [ ] Add cross-tab logout sync
- [ ] Remove token display from test tools in production

### Phase 2 (Short-term - Recommended):
- [ ] Backend: Implement HttpOnly cookie auth
- [ ] Backend: Update CORS for credentials
- [ ] Frontend: Add withCredentials to axios
- [ ] Frontend: Remove localStorage token storage
- [ ] Frontend: Update auth initialization logic
- [ ] Test migration thoroughly

### Phase 3 (Long-term - If not using cookies):
- [ ] Implement token encryption
- [ ] Add security monitoring
- [ ] Implement token rotation
- [ ] Add device fingerprinting (if needed)
- [ ] Set up security alerts

---

## 💡 Questions to Answer Before Implementation

1. **Can backend team implement HttpOnly cookies?** (Yes/No/Timeline?)
2. **Are frontend and backend on same domain?** (e.g., both on `example.com`)
3. **Will you build a mobile app?** (Mobile apps can't use cookies easily)
4. **What's your deployment timeline?** (When can you ship this?)
5. **Do you have a staging environment?** (Essential for testing auth changes)

Let me know the answers and I'll help you implement the best solution for your specific situation!
