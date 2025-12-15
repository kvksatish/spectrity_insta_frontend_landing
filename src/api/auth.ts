/**
 * Authentication API functions
 * All authentication-related API calls
 */

import { tokenStorage } from "@/utils/tokenStorage";
import { transformUser, transformSessions } from "@/utils/apiTransform";
import client from "./client";
import type {
  ApiResponse,
  GoogleAuthResponse,
  LoginResponse,
  RefreshTokenResponse,
  RegisterRequest,
  Session,
  User,
} from "./types";

export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<ApiResponse<User>> => {
    const response = await client.post<ApiResponse<User>>(
      "/v1/auth/register",
      data,
    );
    return response.data;
  },

  /**
   * Login with email and password
   */
  login: async (
    email: string,
    password: string,
    rememberMe = false,
  ): Promise<User> => {
    console.log("[AUTH DEBUG] 1. Starting login request");
    console.log("[AUTH DEBUG] Email:", email);
    console.log("[AUTH DEBUG] Remember me:", rememberMe);

    const response = await client.post<ApiResponse<LoginResponse>>(
      "/v1/auth/login",
      {
        email,
        password,
        rememberMe,
      },
    );

    console.log("[AUTH DEBUG] 2. Response received");
    console.log("[AUTH DEBUG] Status:", response.status);
    console.log("[AUTH DEBUG] Full response.data:", response.data);

    const data = response.data.data;
    console.log("[AUTH DEBUG] 3. Extracted data field:", data);

    if (!data) {
      console.error("[AUTH DEBUG] ❌ No data field in response!");
      throw new Error("Invalid response from server");
    }

    // Backend may return snake_case or camelCase, handle both
    const rawData = data as any;
    console.log("[AUTH DEBUG] 4. Raw data keys:", Object.keys(rawData));

    const accessToken = rawData.accessToken || rawData.access_token;
    const refreshToken = rawData.refreshToken || rawData.refresh_token;
    const user = rawData.user;

    console.log("[AUTH DEBUG] 5. Token extraction:");
    console.log("  - accessToken found:", !!accessToken, accessToken ? `(${accessToken.length} chars)` : "");
    console.log("  - refreshToken found:", !!refreshToken, refreshToken ? `(${refreshToken.length} chars)` : "");
    console.log("  - user found:", !!user);

    if (!accessToken || !refreshToken || !user) {
      console.error("[AUTH DEBUG] ❌ Missing required fields!");
      console.error("[AUTH DEBUG] Raw data structure:", rawData);
      throw new Error("Invalid login response format");
    }

    console.log("[AUTH DEBUG] 6. Storing tokens...");
    // Store tokens securely
    tokenStorage.setTokens(accessToken, refreshToken);

    console.log("[AUTH DEBUG] 7. Verifying storage...");
    const storedToken = tokenStorage.getRefreshToken();
    console.log("[AUTH DEBUG] Stored refresh token:", storedToken ? `✓ (${storedToken.length} chars)` : "✗ NOT STORED!");

    console.log("[AUTH DEBUG] 8. Transforming user data...");
    // Transform snake_case to camelCase
    const transformedUser = transformUser(user as any);
    console.log("[AUTH DEBUG] ✅ Login complete! User email:", transformedUser.email);

    return transformedUser;
  },

  /**
   * Get Google OAuth authorization URL
   */
  getGoogleAuthUrl: async (): Promise<string> => {
    const response =
      await client.get<ApiResponse<GoogleAuthResponse>>("/v1/auth/google");
    const data = response.data.data;
    if (!data) throw new Error("Invalid response from server");
    return data.authUrl;
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await client.get<ApiResponse<User>>("/v1/auth/me");
    const data = response.data.data;
    if (!data) throw new Error("Invalid response from server");
    // Transform snake_case to camelCase
    return transformUser(data as any);
  },

  /**
   * Logout from current session
   */
  logout: async (): Promise<void> => {
    try {
      await client.post("/v1/auth/logout");
    } finally {
      // Always clear tokens, even if API call fails
      tokenStorage.clearTokens();
    }
  },

  /**
   * Logout from all devices/sessions
   */
  logoutAll: async (): Promise<void> => {
    await client.post("/v1/auth/logout-all");
    tokenStorage.clearTokens();
  },

  /**
   * Verify email with token
   */
  verifyEmail: async (token: string): Promise<ApiResponse> => {
    const response = await client.post<ApiResponse>("/v1/auth/verify-email", {
      token,
    });
    return response.data;
  },

  /**
   * Resend verification email
   */
  resendVerification: async (email: string): Promise<ApiResponse> => {
    const response = await client.post<ApiResponse>(
      "/v1/auth/resend-verification",
      {
        email,
      },
    );
    return response.data;
  },

  /**
   * Request password reset email
   */
  forgotPassword: async (email: string): Promise<ApiResponse> => {
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
    const response = await client.post<ApiResponse>("/v1/auth/change-password", {
      currentPassword,
      newPassword,
    });

    // All sessions are invalidated after password change
    tokenStorage.clearTokens();

    return response.data;
  },

  /**
   * Get all active sessions
   */
  getSessions: async (): Promise<Session[]> => {
    const response = await client.get<ApiResponse<Session[]>>("/v1/auth/sessions");
    const data = response.data.data;
    if (!data) throw new Error("Invalid response from server");
    // Transform snake_case to camelCase
    return transformSessions(data as any);
  },

  /**
   * Delete a specific session
   */
  deleteSession: async (sessionId: string): Promise<ApiResponse> => {
    const response = await client.delete<ApiResponse>(
      `/v1/auth/sessions/${sessionId}`,
    );
    return response.data;
  },

  /**
   * Refresh access token
   * This is called automatically by the API client interceptor
   */
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await client.post<ApiResponse<any>>(
      "/v1/auth/refresh",
      { refreshToken },
    );
    const data = response.data.data;
    if (!data) throw new Error("Invalid response from server");

    // Backend returns snake_case, transform to camelCase
    return {
      accessToken: data.accessToken || data.access_token,
      refreshToken: data.refreshToken || data.refresh_token,
      expiresAt: data.expiresAt || data.expires_at,
    };
  },

  /**
   * Initialize authentication on app load
   * Simply tries to fetch user data - if token is expired, the interceptor handles refresh automatically
   */
  initializeAuth: async (): Promise<User | null> => {
    console.log("[AUTH] 🚀 Initializing auth...");

    const refreshToken = tokenStorage.getRefreshToken();

    if (!refreshToken) {
      console.log("[AUTH] No refresh token found - user not logged in");
      return null;
    }

    console.log("[AUTH] Tokens found, fetching user data...");

    try {
      // Simply fetch user data
      // If access token is expired, the axios interceptor will automatically:
      // 1. Catch the 401 error
      // 2. Call /v1/auth/refresh
      // 3. Store new tokens
      // 4. Retry this request
      const user = await authApi.getCurrentUser();
      console.log("[AUTH] ✅ User data fetched:", user.email);
      return user;
    } catch (error: any) {
      // If this fails, it means even the refresh token is invalid
      // The interceptor already cleared tokens and redirected to login
      console.error("[AUTH] ❌ Session restore failed:", error.message);
      return null;
    }
  },
};
