/**
 * Client-side environment configuration
 * Only NEXT_PUBLIC_ variables are available in the browser
 * Hard-coded fallbacks are used when environment variables are not available
 */

// Hard-coded configuration as fallback
const HARDCODED_CONFIG = {
  apiUrl: "https://spectrity.com/api",
  appUrl: "https://spectrity.com",
  apiTimeout: 30000,
  enableAnalytics: false,
  enableDebug: true,
} as const;

export const clientEnv = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || HARDCODED_CONFIG.apiUrl,
  appUrl: process.env.NEXT_PUBLIC_APP_URL || HARDCODED_CONFIG.appUrl,
  apiTimeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || HARDCODED_CONFIG.apiTimeout,
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true" || HARDCODED_CONFIG.enableAnalytics,
  enableDebug: process.env.NEXT_PUBLIC_ENABLE_DEBUG === "true" || HARDCODED_CONFIG.enableDebug,
} as const;

// Helper to get API base URL
// Returns base URL (e.g., https://spectrity.com/api)
// Note: /v1 prefix is added by individual API endpoint calls
export const getApiBaseUrl = () => {
  return clientEnv.apiUrl;
};

// Validate that required environment variables are set
if (typeof window !== "undefined") {
  if (!clientEnv.apiUrl) {
    console.error("Missing NEXT_PUBLIC_API_URL environment variable");
  }
}
