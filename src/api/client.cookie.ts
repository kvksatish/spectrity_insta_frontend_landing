/**
 * Axios API Client - HttpOnly Cookie Version
 *
 * This version is configured for cookie-based authentication:
 * - withCredentials: true (sends cookies with all requests)
 * - No manual Authorization header (cookies sent automatically)
 * - Simplified refresh logic (backend handles cookie rotation)
 *
 * Backend requirements:
 * - CORS: credentials: true
 * - CORS: origin must match frontend URL (not *)
 * - Set-Cookie headers with HttpOnly, Secure, SameSite
 *
 * Usage:
 * 1. Ensure backend CORS is configured correctly
 * 2. Rename this file to client.ts
 * 3. Test with network tab to see cookies being sent
 */

import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getApiBaseUrl } from "@/lib/env.client";
import { secureLog } from "@/utils/secureLogger";

const API_BASE_URL = getApiBaseUrl();

// Create axios instance with cookie support
const client = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // ← CRITICAL: Enables sending/receiving cookies
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
});

/**
 * Request Interceptor
 *
 * With cookies, we DON'T need to manually attach Authorization headers.
 * The browser automatically sends cookies with each request.
 *
 * Optional: You can still attach a CSRF token header if backend requires it.
 */
client.interceptors.request.use(
  (config) => {
    // Cookies are sent automatically by the browser
    // No need to manually attach tokens!

    // Optional: Add CSRF token if backend requires it
    // const csrfToken = getCsrfToken();
    // if (csrfToken) {
    //   config.headers['X-CSRF-Token'] = csrfToken;
    // }

    secureLog.auth(`Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    secureLog.error('Request interceptor error', error);
    return Promise.reject(error);
  },
);

/**
 * Response Interceptor - Simplified for cookies
 *
 * When a 401 occurs, we just call the refresh endpoint.
 * Backend will:
 * 1. Read refresh token from HttpOnly cookie
 * 2. Validate it
 * 3. Set new access token cookie in response
 * 4. Set new refresh token cookie (token rotation)
 */

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If error is not 401 or no original request, reject immediately
    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    // If already retried, reject to prevent infinite loop
    if (originalRequest._retry) {
      secureLog.error('Token refresh retry failed, redirecting to login', error);

      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login?session=expired';
      }

      return Promise.reject(error);
    }

    // Mark as retried
    originalRequest._retry = true;

    // If already refreshing, wait for existing refresh to complete
    if (isRefreshing && refreshPromise) {
      try {
        await refreshPromise;
        // Retry original request
        return client(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    // Start refresh process
    isRefreshing = true;
    secureLog.auth('Access token expired, refreshing...');

    refreshPromise = (async () => {
      try {
        // Call refresh endpoint
        // Backend reads refresh token from HttpOnly cookie automatically
        // Backend sets new cookies in response
        await axios.post(
          `${API_BASE_URL}/v1/auth/refresh`,
          {}, // Empty body - refresh token is in cookie
          {
            withCredentials: true, // Send cookies
            headers: { "Content-Type": "application/json" },
          }
        );

        secureLog.success('Token refresh successful');
      } catch (refreshError: any) {
        secureLog.error('Token refresh failed', refreshError);

        // Clear any cached tokens
        // Note: HttpOnly cookies must be cleared by backend logout endpoint

        // Redirect to login only if we're in browser context
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          const isAuthPage = ["/login", "/register", "/forgot-password"].includes(
            currentPath,
          );

          if (!isAuthPage) {
            secureLog.info('Redirecting to login (session expired)');
            window.location.href = "/login?session=expired";
          }
        }

        throw refreshError;
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    })();

    try {
      await refreshPromise;
      // Retry original request with new cookies
      return client(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  },
);

/**
 * Helper function to check if user is authenticated
 * Since we can't read HttpOnly cookies, we make a lightweight API call
 */
export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    await client.get('/v1/auth/status'); // Backend should have this endpoint
    return true;
  } catch {
    return false;
  }
};

export default client;

/**
 * Backend requirements checklist:
 *
 * ✅ CORS Configuration:
 * app.use(cors({
 *   origin: 'http://localhost:3000', // Your frontend URL
 *   credentials: true  // REQUIRED for cookies
 * }));
 *
 * ✅ Cookie Parser:
 * app.use(cookieParser());
 *
 * ✅ Login Endpoint:
 * res.cookie('accessToken', token, {
 *   httpOnly: true,
 *   secure: process.env.NODE_ENV === 'production',
 *   sameSite: 'strict',
 *   maxAge: 15 * 60 * 1000
 * });
 *
 * ✅ Refresh Endpoint:
 * const refreshToken = req.cookies.refreshToken;
 * // Validate and set new cookies
 *
 * ✅ Logout Endpoint:
 * res.clearCookie('accessToken');
 * res.clearCookie('refreshToken');
 *
 * ✅ Protected Routes:
 * const token = req.cookies.accessToken;
 * // Validate token
 */
