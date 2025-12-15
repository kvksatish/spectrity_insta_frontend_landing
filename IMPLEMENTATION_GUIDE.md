# Security Implementation Guide

## 🎯 Quick Start - Choose Your Implementation

You now have **3 security implementations** to choose from:

| Implementation | Security | Complexity | Best For |
|----------------|----------|------------|----------|
| **HttpOnly Cookies** | ⭐⭐⭐⭐⭐ | Medium | Web apps with backend control |
| **Encrypted localStorage** | ⭐⭐⭐ | High | Mobile/hybrid apps, no backend changes |
| **Current (Plaintext)** | ⭐ | Low | Development only - NOT for production |

---

## 🚀 Implementation Steps

### Option 1: HttpOnly Cookies (RECOMMENDED)

**Security Score:** 9/10 ✅
**Timeline:** 1 week with backend coordination

#### Step 1: Backend Changes (Backend Team)

```typescript
// Backend: Install dependencies
npm install cookie-parser

// Backend: Configure CORS
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL, // 'http://localhost:3000'
  credentials: true  // REQUIRED for cookies
}));

// Backend: Add cookie parser
import cookieParser from 'cookie-parser';
app.use(cookieParser());

// Backend: Update login endpoint
app.post('/api/v1/auth/login', async (req, res) => {
  const { email, password, rememberMe } = req.body;

  // ... authenticate user ...

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Set HttpOnly cookies
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/'
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
    path: '/api/v1/auth'
  });

  // Response body - NO tokens, just user data
  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        // ... other fields
      }
    }
  });
});

// Backend: Update refresh endpoint
app.post('/api/v1/auth/refresh', async (req, res) => {
  // Read refresh token from cookie (NOT request body)
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'No refresh token' });
  }

  // Validate and generate new tokens
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  // Set new cookies (token rotation)
  res.cookie('accessToken', newAccessToken, { /* same options */ });
  res.cookie('refreshToken', newRefreshToken, { /* same options */ });

  res.json({ success: true, data: { user } });
});

// Backend: Update logout endpoint
app.post('/api/v1/auth/logout', (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ success: true });
});
```

#### Step 2: Frontend Changes (Your Team)

```bash
# 1. Backup current files
cp src/api/client.ts src/api/client.backup.ts
cp src/api/auth.ts src/api/auth.backup.ts
cp src/utils/tokenStorage.ts src/utils/tokenStorage.backup.ts

# 2. Replace with cookie versions
mv src/api/client.cookie.ts src/api/client.ts
mv src/api/auth.cookie.ts src/api/auth.ts
mv src/utils/tokenStorage.cookie.ts src/utils/tokenStorage.ts

# 3. Test locally
npm run dev
```

#### Step 3: Testing

**Checklist:**
- [ ] Login works
- [ ] Check DevTools → Application → Cookies
  - [ ] `accessToken` cookie exists with HttpOnly flag
  - [ ] `refreshToken` cookie exists with HttpOnly flag
- [ ] Page refresh keeps user logged in
- [ ] Token refresh works automatically on 401
- [ ] Logout clears cookies
- [ ] No tokens visible in Network tab response bodies
- [ ] No tokens in console logs

#### Step 4: Deployment

1. **Deploy backend first** (with cookie support)
2. **Test in staging**
3. **Deploy frontend** (with cookie-based client)
4. **Monitor logs** for any auth failures

---

### Option 2: Encrypted localStorage

**Security Score:** 6/10 ⚠️
**Timeline:** 2-3 days (no backend changes)

Use this if:
- Backend team can't implement cookies
- Building mobile/hybrid app
- Need quick solution without backend coordination

#### Implementation:

```bash
# Replace tokenStorage with encrypted version
mv src/utils/tokenStorage.ts src/utils/tokenStorage.backup.ts
mv src/utils/tokenStorage.encrypted.ts src/utils/tokenStorage.ts

# No other changes needed!
```

#### Update auth.ts for async token retrieval:

```typescript
// src/api/auth.ts

initializeAuth: async (): Promise<User | null> => {
  secureLog.auth('Initializing auth...');

  // Note: getRefreshToken is now async
  const refreshToken = await tokenStorage.getRefreshToken();

  if (!refreshToken) {
    secureLog.auth('No refresh token found');
    return null;
  }

  try {
    const tokenData = await authApi.refreshToken(refreshToken);
    await tokenStorage.setTokens(tokenData.accessToken, tokenData.refreshToken);
    const user = await authApi.getCurrentUser();
    secureLog.success('User session restored');
    return user;
  } catch (error: any) {
    secureLog.error('Session restore failed', error);
    tokenStorage.clearTokens();
    return null;
  }
}
```

#### Setup monitoring:

```typescript
// src/app/layout.tsx

import { setupStorageMonitoring } from '@/utils/tokenStorage';

export default function RootLayout() {
  useEffect(() => {
    // Setup security monitoring
    setupStorageMonitoring();
  }, []);

  // ... rest of layout
}
```

---

### Option 3: Fix Current Implementation (Temporary)

**Security Score:** 3/10 ⚠️
**Timeline:** 2 hours
**Use for:** Development only, not production

If you need to keep the current approach temporarily:

#### Add secure logging:

```typescript
// In all auth files, replace console.log with secureLog

// ❌ Remove this
console.log('[AUTH] Token:', token.substring(0, 50));

// ✅ Replace with this
import { secureLog } from '@/utils/secureLogger';
secureLog.checkToken('refresh', token);
```

#### Disable AuthDebug in production:

```typescript
// src/components/AuthDebug.tsx

export function AuthDebug() {
  // Never show in production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  if (process.env.NEXT_PUBLIC_DEBUG_AUTH !== 'true') {
    return null;
  }

  // ... rest of component
}
```

#### Add token expiry:

```typescript
// src/utils/tokenStorage.ts

interface TokenData {
  token: string;
  expiresAt: number;
}

setRefreshToken: (token: string, expiresInDays = 7): void => {
  const data: TokenData = {
    token,
    expiresAt: Date.now() + (expiresInDays * 24 * 60 * 60 * 1000)
  };
  localStorage.setItem(REFRESH_TOKEN_KEY, JSON.stringify(data));
},

getRefreshToken: (): string | null => {
  const raw = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!raw) return null;

  try {
    const data: TokenData = JSON.parse(raw);
    if (Date.now() > data.expiresAt) {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      return null;
    }
    return data.token;
  } catch {
    return null;
  }
}
```

---

## 🔍 How to Identify Your Backend Issue

Before implementing, run the diagnostic script to see what your backend is currently doing:

```bash
./test-token-flow.sh
```

### Interpreting Results:

#### Scenario A: Backend sends tokens in response body ✅

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "user": { ... }
  }
}
```

**Solution:** Your backend is ready! The current code should work. The issue is likely:
- Token storage failing silently
- Expiry handling
- CORS issues

**Fix:** Use Option 3 (fix current implementation)

#### Scenario B: Backend uses cookies 🍪

```
Set-Cookie: refreshToken=eyJhbGc...; HttpOnly; Secure
```

**Solution:** Backend is already secure! Frontend needs updating.

**Fix:** Use Option 1 (HttpOnly cookies implementation)

#### Scenario C: Backend sends wrong format ❌

```json
{
  "token": "eyJhbGc...",
  "refresh": "eyJhbGc...",
  "user": { ... }
}
```

**Solution:** Field name mismatch.

**Fix:** Update `src/api/auth.ts`:
```typescript
const accessToken = rawData.accessToken || rawData.access_token || rawData.token;
const refreshToken = rawData.refreshToken || rawData.refresh_token || rawData.refresh;
```

#### Scenario D: Backend sends nothing ⚠️

```json
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
```

**Solution:** Backend not sending tokens at all!

**Fix:**
1. Ask backend team to add tokens to response
2. OR implement HttpOnly cookies (better security anyway)

---

## 📊 Comparison Matrix

| Feature | Current | Encrypted | HttpOnly Cookies |
|---------|---------|-----------|------------------|
| XSS Protection | ❌ None | 🟡 Partial | ✅ Full |
| CSRF Protection | ✅ Yes | ✅ Yes | 🟡 Needs token |
| Persistence | ✅ Yes | ✅ Yes | ✅ Yes |
| Mobile Support | ✅ Easy | ✅ Easy | ⚠️ Complex |
| Backend Changes | ❌ None | ❌ None | ✅ Required |
| Debugging | ✅ Easy | 🟡 Medium | ⚠️ Hard |
| Regulatory Compliance | ❌ Risky | 🟡 OK | ✅ Good |

---

## 🧪 Testing Your Implementation

### Test 1: Login Flow

```javascript
// Browser console after login
localStorage.getItem('rt') // Should return token (encrypted) or null (cookies)

// Check cookies (DevTools → Application → Cookies)
// Should see accessToken and refreshToken with HttpOnly flag
```

### Test 2: Page Refresh

1. Login
2. Press F5
3. Should stay logged in
4. Check console for `[AUTH] Session restored`

### Test 3: Token Expiry

1. Login
2. Wait 16 minutes
3. Make API call
4. Should auto-refresh silently
5. No redirect to login

### Test 4: Logout Sync

1. Login in Tab 1
2. Open Tab 2
3. Logout in Tab 1
4. Tab 2 should detect and redirect to login

### Test 5: Security

```javascript
// None of these should expose tokens
console.log(...) // Check all console output
localStorage // Check storage in DevTools
Network tab // Check response bodies
```

---

## 🚨 Pre-Production Checklist

- [ ] Remove ALL debug logging with tokens
- [ ] Disable AuthDebug component in production
- [ ] Remove test scripts from production build
- [ ] Enable HTTPS (required for Secure cookies)
- [ ] Configure proper CORS origins
- [ ] Test on staging environment
- [ ] Run security audit
- [ ] Document which approach you chose
- [ ] Train team on new auth flow
- [ ] Set up error monitoring

---

## 📞 Need Help?

### Common Issues:

**Issue:** "No refresh token found" error

**Solutions:**
1. Run `./test-token-flow.sh` to see what backend sends
2. Check Network tab for login response
3. Verify tokens in DevTools → Application
4. Check CORS configuration

**Issue:** User logged out on page refresh

**Solutions:**
1. Check if tokens are stored (localStorage or cookies)
2. Verify `initializeAuth()` is being called
3. Check browser console for errors
4. Ensure `withCredentials: true` if using cookies

**Issue:** Infinite redirect loop

**Solutions:**
1. Check ProtectedRoute logic
2. Verify token refresh isn't failing silently
3. Check if login endpoint is protected
4. Clear all tokens and localStorage

---

## 📚 Additional Resources

- [OWASP Auth Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [MDN Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [MDN HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)

---

## 🎯 Recommended Timeline

### Week 1: Analysis & Planning
- [ ] Run diagnostic tests
- [ ] Meet with backend team
- [ ] Choose implementation approach
- [ ] Review security plan

### Week 2: Implementation
- [ ] Backend implements cookies (if chosen)
- [ ] Frontend updates files
- [ ] Local testing
- [ ] Code review

### Week 3: Testing & Staging
- [ ] Deploy to staging
- [ ] Integration testing
- [ ] Security audit
- [ ] Performance testing

### Week 4: Production
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Monitor logs
- [ ] User acceptance testing

---

**Need to decide which approach to use?** Answer these questions:

1. Can you modify the backend? → YES: HttpOnly Cookies, NO: Encrypted localStorage
2. Building a mobile app? → YES: Encrypted localStorage, NO: HttpOnly Cookies
3. Need it done today? → Temporary: Fix current, Permanent: Schedule proper fix
4. Fintech/high security? → MUST use HttpOnly Cookies

**Ready to implement?** Choose your option above and follow the step-by-step guide!
