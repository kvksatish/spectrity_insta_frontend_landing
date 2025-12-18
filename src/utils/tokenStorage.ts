/**
 * Token storage utility
 *
 * Storage strategy:
 * - Access token: Stored in localStorage AND cached in memory (survives page refreshes)
 * - Refresh token: Stored in localStorage (survives page refreshes)
 *
 * Both tokens persist across page refreshes and browser restarts for seamless auto-login.
 * Tokens are cleared on explicit logout or when refresh token expires.
 *
 * Development Mode:
 * - If NEXT_PUBLIC_DEV_ACCESS_TOKEN and NEXT_PUBLIC_DEV_REFRESH_TOKEN are set in .env,
 *   they will be used for local testing (bypasses login flow)
 */

const ACCESS_TOKEN_KEY = "at";
const REFRESH_TOKEN_KEY = "rt";

// Development tokens from .env (for local testing)
const DEV_ACCESS_TOKEN = process.env.NEXT_PUBLIC_DEV_ACCESS_TOKEN;
const DEV_REFRESH_TOKEN = process.env.NEXT_PUBLIC_DEV_REFRESH_TOKEN;

// In-memory storage for access token (cleared on page refresh)
let inMemoryAccessToken: string | null = null;

// Check if we should use dev tokens
const shouldUseDevTokens = (): boolean => {
  return !!(DEV_ACCESS_TOKEN && DEV_REFRESH_TOKEN && process.env.NODE_ENV === "development");
};

export const tokenStorage = {
  /**
   * Get access token from localStorage (fallback to memory)
   */
  getAccessToken: (): string | null => {
    // Development mode: use hardcoded token if available
    if (shouldUseDevTokens()) {
      console.log("[DEV MODE] Using dev access token from .env");
      return DEV_ACCESS_TOKEN!;
    }

    // Try memory first (for same-session performance)
    if (inMemoryAccessToken) return inMemoryAccessToken;

    // Fall back to localStorage (for page refreshes)
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (stored) {
        inMemoryAccessToken = stored; // Cache it
        return stored;
      }
    }

    return null;
  },

  /**
   * Set access token in memory AND localStorage
   */
  setAccessToken: (token: string): void => {
    inMemoryAccessToken = token;
    if (typeof window !== "undefined") {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
  },

  /**
   * Get refresh token from localStorage
   */
  getRefreshToken: (): string | null => {
    // Development mode: use hardcoded token if available
    if (shouldUseDevTokens()) {
      console.log("[DEV MODE] Using dev refresh token from .env");
      return DEV_REFRESH_TOKEN!;
    }

    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Set refresh token in localStorage
   */
  setRefreshToken: (token: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  /**
   * Set both tokens (convenience method)
   */
  setTokens: (accessToken: string, refreshToken: string): void => {
    inMemoryAccessToken = accessToken;
    if (typeof window !== "undefined") {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken); // ← STORE ACCESS TOKEN TOO!
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },

  /**
   * Clear all tokens (on logout)
   */
  clearTokens: (): void => {
    inMemoryAccessToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem(ACCESS_TOKEN_KEY); // ← CLEAR ACCESS TOKEN TOO!
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem("user"); // Clear cached user data too
    }
  },

  /**
   * Check if user has any tokens (useful for initial auth check)
   */
  hasTokens: (): boolean => {
    // Development mode: always return true if dev tokens are set
    if (shouldUseDevTokens()) {
      return true;
    }

    if (typeof window === "undefined") return false;
    return !!localStorage.getItem(REFRESH_TOKEN_KEY);
  },
};
