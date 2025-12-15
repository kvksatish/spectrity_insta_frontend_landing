import dotenv from "dotenv";
import { z } from "zod";

// Load environment variables from .env file
dotenv.config();

// Hard-coded configuration as fallback alternatives
const HARDCODED_DEFAULTS = {
  NODE_ENV: "production",
  PORT: "3000",
  HOST: "0.0.0.0",
  API_VERSION: "v1",
  NEXT_PUBLIC_API_URL: "https://spectrity.com/api",
  NEXT_PUBLIC_APP_URL: "https://spectrity.com",
  NEXT_PUBLIC_API_TIMEOUT: "30000",
  NEXT_PUBLIC_ENABLE_ANALYTICS: "false",
  NEXT_PUBLIC_ENABLE_DEBUG: "true",
} as const;

// Define the schema for environment variables with hard-coded defaults
const envSchema = z.object({
  // Node environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default(HARDCODED_DEFAULTS.NODE_ENV as "production"),

  // Server configuration
  PORT: z.string().default(HARDCODED_DEFAULTS.PORT).transform(Number),
  HOST: z.string().default(HARDCODED_DEFAULTS.HOST),

  // API configuration
  API_VERSION: z.string().default(HARDCODED_DEFAULTS.API_VERSION),

  // Next.js public environment variables (accessible in browser)
  NEXT_PUBLIC_API_URL: z.string().url().default(HARDCODED_DEFAULTS.NEXT_PUBLIC_API_URL),
  NEXT_PUBLIC_APP_URL: z.string().url().default(HARDCODED_DEFAULTS.NEXT_PUBLIC_APP_URL),
  NEXT_PUBLIC_API_TIMEOUT: z.string().default(HARDCODED_DEFAULTS.NEXT_PUBLIC_API_TIMEOUT).transform(Number),

  // Optional: Analytics and monitoring
  NEXT_PUBLIC_GA_TRACKING_ID: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),

  // Optional: Feature flags
  NEXT_PUBLIC_ENABLE_ANALYTICS: z
    .enum(["true", "false"])
    .default(HARDCODED_DEFAULTS.NEXT_PUBLIC_ENABLE_ANALYTICS)
    .transform((val) => val === "true"),
  NEXT_PUBLIC_ENABLE_DEBUG: z
    .enum(["true", "false"])
    .default(HARDCODED_DEFAULTS.NEXT_PUBLIC_ENABLE_DEBUG)
    .transform((val) => val === "true"),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    const parsed = envSchema.parse(process.env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Invalid environment variables:");
      error.issues.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
      throw new Error("Environment validation failed");
    }
    throw error;
  }
};

// Export validated environment variables
export const env = parseEnv();

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>;

// Helper function to check if we're in production
export const isProduction = () => env.NODE_ENV === "production";

// Helper function to check if we're in development
export const isDevelopment = () => env.NODE_ENV === "development";

// Helper function to check if we're in test
export const isTest = () => env.NODE_ENV === "test";
