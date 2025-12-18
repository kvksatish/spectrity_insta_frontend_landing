# Development Tokens Guide

## Purpose

This feature allows you to bypass the login flow during local development by using hardcoded authentication tokens from your `.env` file.

**Benefits:**
- 🚀 No need to login every time you refresh the page
- ⚡ Faster development workflow
- 🔄 Persist authentication across dev server restarts
- 🧪 Easy testing of authenticated features

## Security Warning ⚠️

**IMPORTANT:**
- These tokens grant FULL ACCESS to your account
- NEVER commit real tokens to git
- ONLY use in local development (tokens from .env are never sent to production)
- Tokens expire based on your backend settings (usually 7 days for refresh tokens)

The tokens are prefixed with `NEXT_PUBLIC_` only to make them available in the browser during development. In production builds, you should NOT set these variables.

## How to Use

### Method 1: Using the Token Extractor Tool (Recommended)

1. **Login once** to your app (locally or on the deployed site)
   ```bash
   npm run dev
   # Open http://localhost:3000/login
   # Login with your credentials
   ```

2. **Open the token extractor tool**
   - Navigate to `http://localhost:3000/get-dev-tokens.html`
   - Or open the HTML file directly in your browser

3. **Extract tokens**
   - Click "Extract Tokens from localStorage"
   - Your access token (AT) and refresh token (RT) will be displayed

4. **Copy to .env**
   - Click "Copy Complete .env Format" button
   - Open your `.env` file
   - Find these lines (near the bottom):
     ```env
     # NEXT_PUBLIC_DEV_ACCESS_TOKEN=your_access_token_here
     # NEXT_PUBLIC_DEV_REFRESH_TOKEN=your_refresh_token_here
     ```
   - Uncomment them (remove the `#`)
   - Paste the tokens you copied
   - Save the file

5. **Restart dev server**
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

6. **Done!** Your app will now use these tokens automatically

### Method 2: Manual Extraction

1. **Login to your app**

2. **Open browser DevTools**
   - Press F12 or right-click → Inspect
   - Go to the "Console" tab

3. **Extract tokens manually**
   ```javascript
   // Copy these commands one by one
   console.log('Access Token:', localStorage.getItem('at'));
   console.log('Refresh Token:', localStorage.getItem('rt'));
   ```

4. **Copy tokens to .env**
   - Copy the printed tokens
   - Add them to your `.env` file:
     ```env
     NEXT_PUBLIC_DEV_ACCESS_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     NEXT_PUBLIC_DEV_REFRESH_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```

5. **Restart dev server**

## How It Works

When development tokens are set in `.env`:

1. `tokenStorage.getAccessToken()` returns the dev token instead of checking localStorage
2. `tokenStorage.getRefreshToken()` returns the dev token instead of checking localStorage
3. `tokenStorage.hasTokens()` always returns `true`

This bypasses the entire login flow and makes the app think you're already authenticated.

## Example .env

```env
# Node Environment
NODE_ENV=development

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Local Testing Tokens (Development Only)
NEXT_PUBLIC_DEV_ACCESS_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTYiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE2ODk1MjAwMDAsImV4cCI6MTY4OTUyMDkwMH0.xyz
NEXT_PUBLIC_DEV_REFRESH_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTYiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTY4OTUyMDAwMCwiZXhwIjoxNjg5NjA2NDAwfQ.abc
```

## Console Output

When dev tokens are active, you'll see these logs in the browser console:

```
[DEV MODE] Using dev access token from .env
[DEV MODE] Using dev refresh token from .env
```

This confirms the tokens are being used.

## Disabling Dev Tokens

To disable and go back to normal login flow:

1. **Comment out the tokens** in `.env`:
   ```env
   # NEXT_PUBLIC_DEV_ACCESS_TOKEN=...
   # NEXT_PUBLIC_DEV_REFRESH_TOKEN=...
   ```

2. **Restart dev server**

3. **Clear localStorage** (optional but recommended):
   - Open DevTools → Console
   - Run: `localStorage.clear()`

## Token Expiry

- **Access tokens** expire after ~15 minutes (configured in backend)
- **Refresh tokens** expire after ~7 days (configured in backend)

When tokens expire:
- The automatic token refresh mechanism will kick in
- If refresh token is expired, you'll need to get new tokens (login again)

## Troubleshooting

### "Still redirecting to login page"

**Cause:** Tokens might be expired or invalid

**Solution:**
1. Login again to get fresh tokens
2. Extract new tokens using the tool
3. Update your `.env` file
4. Restart dev server

### "Console shows 401 errors"

**Cause:** Access token is expired

**Solution:**
- The app should automatically refresh using the refresh token
- If it doesn't work, your refresh token might be expired
- Get new tokens by logging in again

### "Dev tokens not working"

**Checklist:**
- [ ] Did you uncomment the lines in `.env`?
- [ ] Did you restart the dev server after changing `.env`?
- [ ] Is `NODE_ENV=development` in your `.env`?
- [ ] Are the tokens valid (not expired)?
- [ ] Did you paste the complete token (no truncation)?

## Best Practices

1. **Rotate tokens regularly**
   - Get fresh tokens every few days
   - Don't use expired tokens

2. **One token set per developer**
   - Each team member should use their own tokens
   - Don't share tokens between developers

3. **Clean up when done**
   - Remove tokens from `.env` when not actively developing
   - Or keep them commented out

4. **Use different accounts for dev/prod**
   - Don't use production user tokens in development
   - Create a test account for development

## Production Safety

The dev token feature is automatically disabled in production because:

1. The check includes `process.env.NODE_ENV === "development"`
2. Environment variables in `.env` are not deployed to production
3. Even if accidentally set, the check prevents them from being used

## Files Modified

- `.env` - Added dev token variables
- `.env.example` - Added documentation for dev tokens
- `src/utils/tokenStorage.ts` - Added dev token logic
- `get-dev-tokens.html` - Token extractor tool
- `DEV_TOKENS_GUIDE.md` - This guide

## Related Documentation

- [Authentication Guide](./AUTH_INTEGRATION_COMPLETE.md)
- [Token Refresh Flow](./REFRESH_TOKEN_FLOW.md)
- [Environment Setup](./ENV_SETUP.md)
