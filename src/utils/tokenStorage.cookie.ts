/**
 * Token Storage - HttpOnly Cookie Version
 *
 * This implementation assumes the backend handles token storage via HttpOnly cookies.
 *
 * Security advantages:
 * - Refresh token in HttpOnly cookie (JavaScript cannot access)
 * - Immune to XSS token theft
 * - Browser automatically sends cookies with requests
 * - Backend can invalidate tokens server-side
 *
 * Backend requirements:
 * - Set-Cookie headers with HttpOnly, Secure, SameSite flags
 * - CORS configured with credentials: true
 * - Cookie-parser middleware
 *
 * Usage:
 * 1. Rename this file to tokenStorage.ts
 * 2. Update src/api/client.ts to use withCredentials: true
 * 3. Update backend to send tokens via cookies, not response body
 */

import { secureLog } from './secureLogger';

/**
 * Cookie-based token storage
 *
 * Access token kept in memory for quick validation checks.
 * Refresh token managed entirely by browser via HttpOnly cookies.
 */
class CookieTokenStorage {
  // Access token cached in memory (optional - for quick offline checks)
  private accessTokenCache: string | null = null;
  private accessTokenExpiry: number | null = null;

  /**
   * Set access token in memory (optional caching)
   * The actual access token is in HttpOnly cookie
   */
  setAccessToken(token: string, expiresInSeconds?: number): void {
    this.accessTokenCache = token;

    if (expiresInSeconds) {
      this.accessTokenExpiry = Date.now() + (expiresInSeconds * 1000);
    }

    secureLog.storage('set', 'access_token_cache', true);
  }

  /**
   * Get cached access token
   * Note: The real token is in HttpOnly cookie, this is just for offline checks
   */
  getAccessToken(): string | null {
    // Check if cached token is expired
    if (this.accessTokenExpiry && Date.now() > this.accessTokenExpiry) {
      this.accessTokenCache = null;
      this.accessTokenExpiry = null;
      return null;
    }

    return this.accessTokenCache;
  }

  /**
   * Check if access token exists (from cache)
   * Not 100% accurate since real token is in cookie
   */
  hasAccessToken(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Refresh token is in HttpOnly cookie - we cannot access it
   * This method is kept for API compatibility but returns null
   */
  getRefreshToken(): string | null {
    secureLog.warning('getRefreshToken called but refresh token is in HttpOnly cookie');
    return null;
  }

  /**
   * Check if user likely has a session
   * Since we can't read HttpOnly cookies, we check the cache
   */
  hasSession(): boolean {
    return this.hasAccessToken();
  }

  /**
   * Clear all tokens
   * Note: This only clears the in-memory cache.
   * The actual HttpOnly cookie must be cleared by calling the logout endpoint.
   */
  clearTokens(): void {
    this.accessTokenCache = null;
    this.accessTokenExpiry = null;

    // Also clear any localStorage items from old implementation
    if (typeof window !== 'undefined') {
      localStorage.removeItem('rt');
      localStorage.removeItem('at');
      localStorage.removeItem('user');
    }

    secureLog.storage('clear', 'all_tokens', true);
  }

  /**
   * Set both tokens (called after login/refresh)
   * In cookie implementation, this is mainly for caching
   */
  setTokens(accessToken: string, refreshToken?: string, expiresInSeconds?: number): void {
    this.setAccessToken(accessToken, expiresInSeconds);
    // refreshToken is ignored - it's in HttpOnly cookie
    if (refreshToken) {
      secureLog.info('Refresh token provided but will be ignored (using HttpOnly cookie)');
    }
  }

  /**
   * Check if we have any stored tokens
   * Since refresh token is in HttpOnly cookie (unreadable), we only check access token cache
   */
  hasTokens(): boolean {
    return this.hasAccessToken();
  }
}

// Export singleton instance
export const tokenStorage = new CookieTokenStorage();

/**
 * Migration helper: Clear old localStorage tokens
 * Call this once during the migration from localStorage to cookies
 */
export const clearLegacyTokens = (): void => {
  if (typeof window === 'undefined') return;

  const keysToRemove = ['rt', 'at', 'access_token', 'refresh_token', 'auth_data', 'user'];

  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      secureLog.info(`Cleared legacy token: ${key}`);
    }
  });

  secureLog.success('Legacy token migration complete');
};

/**
 * Example usage in your app:
 *
 * // After login (backend sets cookies automatically)
 * const user = await authApi.login(email, password);
 * // Cookies are set by backend via Set-Cookie headers
 *
 * // Making authenticated requests (cookies sent automatically)
 * const data = await client.get('/api/v1/user/profile');
 * // Browser automatically attaches cookies to request
 *
 * // Logout (must call backend to clear cookies)
 * await authApi.logout();
 * tokenStorage.clearTokens(); // Clear local cache
 */
