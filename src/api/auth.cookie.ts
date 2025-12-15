/**
 * Authentication API - HttpOnly Cookie Version
 *
 * Simplified authentication flow for cookie-based auth:
 * - No token extraction from response body
 * - No manual token storage
 * - Backend sets cookies automatically
 * - Frontend just handles user data
 *
 * Usage:
 * 1. Ensure backend returns user data in response body
 * 2. Ensure backend sets tokens via Set-Cookie headers
 * 3. Rename this file to auth.ts
 */

import { transformUser, transformSessions } from "@/utils/apiTransform";
import { secureLog } from "@/utils/secureLogger";
import { tokenStorage } from "@/utils/tokenStorage";
import client from "./client";
import type {
  ApiResponse,
  GoogleAuthResponse,
  RegisterRequest,
  Session,
  User,
} from "./types";

export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<ApiResponse<User>> => {
    secureLog.auth('Registering new user');
    const response = await client.post<ApiResponse<User>>(
      "/v1/auth/register",
      data,
    );
    return response.data;
  },

  /**
   * Login with email and password
   * Backend sets access token and refresh token via HttpOnly cookies
   */
  login: async (
    email: string,
    password: string,
    rememberMe = false,
  ): Promise<User> => {
    secureLog.auth('Logging in', { email, rememberMe });

    const response = await client.post<ApiResponse<{ user: User }>>(
      "/v1/auth/login",
      { email, password, rememberMe },
    );

    const data = response.data.data;
    if (!data?.user) {
      secureLog.error('Invalid login response', new Error('No user data'));
      throw new Error("Invalid response from server");
    }

    // Transform snake_case to camelCase
    const user = transformUser(data.user as any);

    // Check if email is verified (for LOCAL provider only)
    if (user.provider === "LOCAL" && !user.isEmailVerified) {
      throw new Error(
        "Please verify your email before logging in. Check your inbox for the verification link.",
      );
    }

    // Note: Tokens are set by backend via Set-Cookie headers
    // We don't need to manually store them!
    secureLog.success('Login successful', {
      email: user.email,
      provider: user.provider
    });

    return user;
  },

  /**
   * Get Google OAuth authorization URL
   */
  getGoogleAuthUrl: async (): Promise<string> => {
    secureLog.auth('Getting Google OAuth URL');
    const response =
      await client.get<ApiResponse<GoogleAuthResponse>>("/v1/auth/google");
    const data = response.data.data;
    if (!data) throw new Error("Invalid response from server");
    return data.authUrl;
  },

  /**
   * Get current authenticated user
   * Uses access token from HttpOnly cookie automatically
   */
  getCurrentUser: async (): Promise<User> => {
    secureLog.auth('Fetching current user');
    const response = await client.get<ApiResponse<User>>("/v1/auth/me");
    const data = response.data.data;
    if (!data) {
      secureLog.error('No user data in response', new Error('Invalid response'));
      throw new Error("Invalid response from server");
    }

    const user = transformUser(data as any);
    secureLog.success('User data fetched', { email: user.email });
    return user;
  },

  /**
   * Logout from current session
   * Backend clears HttpOnly cookies
   */
  logout: async (): Promise<void> => {
    secureLog.auth('Logging out');
    try {
      // Call backend to clear cookies
      await client.post("/v1/auth/logout");
      secureLog.success('Logout successful');
    } catch (error) {
      secureLog.error('Logout API call failed', error);
      // Continue with local cleanup even if API fails
    } finally {
      // Clear any cached tokens
      tokenStorage.clearTokens();
    }
  },

  /**
   * Logout from all devices/sessions
   */
  logoutAll: async (): Promise<void> => {
    secureLog.auth('Logging out from all devices');
    await client.post("/v1/auth/logout-all");
    tokenStorage.clearTokens();
    secureLog.success('Logged out from all devices');
  },

  /**
   * Verify email with token
   */
  verifyEmail: async (token: string): Promise<ApiResponse> => {
    secureLog.auth('Verifying email');
    const response = await client.post<ApiResponse>("/v1/auth/verify-email", {
      token,
    });
    return response.data;
  },

  /**
   * Resend verification email
   */
  resendVerification: async (email: string): Promise<ApiResponse> => {
    secureLog.auth('Resending verification email', { email });
    const response = await client.post<ApiResponse>(
      "/v1/auth/resend-verification",
      { email },
    );
    return response.data;
  },

  /**
   * Request password reset email
   */
  forgotPassword: async (email: string): Promise<ApiResponse> => {
    secureLog.auth('Requesting password reset', { email });
    const response = await client.post<ApiResponse>("/v1/auth/forgot-password", {
      email,
    });
    return response.data;
  },

  /**
   * Reset password with token
   */
  resetPassword: async (
    token: string,
    password: string,
  ): Promise<ApiResponse> => {
    secureLog.auth('Resetting password');
    const response = await client.post<ApiResponse>("/v1/auth/reset-password", {
      token,
      password,
    });
    return response.data;
  },

  /**
   * Change password (authenticated)
   * Note: This invalidates all sessions
   */
  changePassword: async (
    currentPassword: string,
    newPassword: string,
  ): Promise<ApiResponse> => {
    secureLog.auth('Changing password');
    const response = await client.post<ApiResponse>("/v1/auth/change-password", {
      currentPassword,
      newPassword,
    });

    // All sessions are invalidated after password change
    tokenStorage.clearTokens();
    secureLog.warning('All sessions invalidated after password change');

    return response.data;
  },

  /**
   * Get all active sessions
   */
  getSessions: async (): Promise<Session[]> => {
    secureLog.auth('Fetching active sessions');
    const response = await client.get<ApiResponse<Session[]>>("/v1/auth/sessions");
    const data = response.data.data;
    if (!data) throw new Error("Invalid response from server");
    return transformSessions(data as any);
  },

  /**
   * Delete a specific session
   */
  deleteSession: async (sessionId: string): Promise<ApiResponse> => {
    secureLog.auth('Deleting session', { sessionId });
    const response = await client.delete<ApiResponse>(
      `/v1/auth/sessions/${sessionId}`,
    );
    return response.data;
  },

  /**
   * Refresh access token
   * Simplified - no parameters needed, backend reads from HttpOnly cookie
   */
  refreshToken: async (): Promise<void> => {
    secureLog.auth('Refreshing tokens');

    // No body needed - refresh token is in HttpOnly cookie
    // Backend reads it, validates, and sets new cookies
    await client.post("/v1/auth/refresh");

    secureLog.success('Tokens refreshed');
  },

  /**
   * Initialize authentication on app load
   * Simplified - just try to get current user
   * If cookies are valid, this will succeed
   */
  initializeAuth: async (): Promise<User | null> => {
    secureLog.auth('Initializing authentication...');

    try {
      // Simply try to fetch current user
      // If valid session cookies exist, this will succeed
      const user = await authApi.getCurrentUser();

      secureLog.success('Session restored', { email: user.email });
      return user;
    } catch (error: any) {
      // No valid session
      secureLog.auth('No valid session found');
      return null;
    }
  },
};

/**
 * Expected backend response formats:
 *
 * ✅ Login response:
 * {
 *   "success": true,
 *   "data": {
 *     "user": {
 *       "id": "123",
 *       "email": "user@example.com",
 *       "is_email_verified": true,
 *       ...
 *     }
 *   }
 * }
 *
 * + Set-Cookie headers:
 * Set-Cookie: accessToken=eyJhbG...; HttpOnly; Secure; SameSite=Strict; Max-Age=900
 * Set-Cookie: refreshToken=eyJhbG...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
 *
 * ✅ Get current user response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "123",
 *     "email": "user@example.com",
 *     ...
 *   }
 * }
 *
 * ✅ Refresh response:
 * {
 *   "success": true,
 *   "data": {
 *     "user": { ... }  // Optional
 *   }
 * }
 *
 * + New Set-Cookie headers with rotated tokens
 */
