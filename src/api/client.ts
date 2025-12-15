/**
 * Axios API client with smart interceptors
 * Handles authentication, token refresh, and request/response processing
 */

import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getApiBaseUrl } from "@/lib/env.client";
import { tokenStorage } from "@/utils/tokenStorage";

const API_BASE_URL = getApiBaseUrl();

// Create axios instance with base configuration
const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
});

/**
 * Request Interceptor - Attach access token to all requests
 */
client.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Response Interceptor - Handle token refresh on 401 errors
 */

// Queue to hold requests while token is being refreshed
interface FailedRequest {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

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
      return Promise.reject(error);
    }

    // If token refresh is in progress, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(client(originalRequest));
          },
          reject,
        });
      });
    }

    // Mark request as retried and start refresh process
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = tokenStorage.getRefreshToken();

      if (!refreshToken) {
        console.error("[AUTH] No refresh token available in localStorage");
        throw new Error("No refresh token available");
      }

      console.log("[AUTH] 🔄 Attempting to refresh token...");
      console.log("[AUTH] Refresh token exists:", refreshToken ? "✓" : "✗");

      // Call refresh endpoint (without Authorization header)
      const { data } = await axios.post(
        `${API_BASE_URL}/v1/auth/refresh`,
        { refreshToken },
        { headers: { "Content-Type": "application/json" } },
      );

      console.log("[AUTH] Refresh response:", data);

      // Backend returns snake_case, handle both formats for compatibility
      const responseData = data.data;
      const accessToken = responseData.accessToken || responseData.access_token;
      const newRefreshToken = responseData.refreshToken || responseData.refresh_token;

      console.log("[AUTH] Extracted tokens:", {
        accessToken: accessToken ? "✓ Present" : "✗ Missing",
        refreshToken: newRefreshToken ? "✓ Present" : "✗ Missing",
        format: responseData.access_token ? "snake_case" : "camelCase"
      });

      if (!accessToken || !newRefreshToken) {
        console.error("[AUTH] ❌ Invalid refresh token response format:", responseData);
        throw new Error("Invalid refresh token response format");
      }

      // Store new tokens
      tokenStorage.setTokens(accessToken, newRefreshToken);
      console.log("[AUTH] ✅ Tokens refreshed and stored successfully");

      // Process queued requests with new token
      processQueue(null, accessToken);

      // Retry original request with new token
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return client(originalRequest);
    } catch (refreshError: any) {
      // Refresh failed - clear tokens and redirect to login
      console.error("[AUTH] ❌ Token refresh failed:", refreshError.message);
      console.error("[AUTH] Error details:", refreshError.response?.data || refreshError);

      processQueue(refreshError as Error, null);
      tokenStorage.clearTokens();

      // Only redirect if we're in the browser
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        const isAuthPage = ["/login", "/register", "/forgot-password"].includes(
          currentPath,
        );

        // Don't redirect if already on auth page
        if (!isAuthPage) {
          console.log("[AUTH] Redirecting to login (session expired)");
          window.location.href = "/login?session=expired";
        }
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default client;
