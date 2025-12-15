/**
 * Secure Logging Utility
 *
 * Prevents accidental token leakage in logs by:
 * 1. Automatically sanitizing sensitive data
 * 2. Disabling verbose logs in production
 * 3. Providing safe alternatives for debugging
 *
 * Usage:
 * import { secureLog } from '@/utils/secureLogger';
 *
 * secureLog.auth('User logged in', { email: user.email });
 * secureLog.error('Login failed', error);
 */

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const IS_DEBUG_ENABLED = process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true';

// Sensitive field names that should never be logged
const SENSITIVE_FIELDS = [
  'token',
  'accesstoken',
  'refreshtoken',
  'access_token',
  'refresh_token',
  'password',
  'secret',
  'authorization',
  'cookie',
  'session',
  'apikey',
  'api_key',
];

/**
 * Check if a key name indicates sensitive data
 */
const isSensitiveKey = (key: string): boolean => {
  const lowerKey = key.toLowerCase();
  return SENSITIVE_FIELDS.some(sensitive => lowerKey.includes(sensitive));
};

/**
 * Recursively sanitize an object by redacting sensitive fields
 */
const sanitizeData = (data: any, depth = 0): any => {
  // Prevent infinite recursion
  if (depth > 5) return '[Max Depth Reached]';

  if (data === null || data === undefined) {
    return data;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item, depth + 1));
  }

  // Handle objects
  if (typeof data === 'object') {
    const sanitized: any = {};

    for (const [key, value] of Object.entries(data)) {
      if (isSensitiveKey(key)) {
        // Redact sensitive fields
        if (typeof value === 'string' && value.length > 0) {
          sanitized[key] = '***REDACTED***';
        } else {
          sanitized[key] = value ? '***REDACTED***' : null;
        }
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeData(value, depth + 1);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  // Primitive values
  return data;
};

/**
 * Format log message with timestamp and prefix
 */
const formatMessage = (prefix: string, message: string): string => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${prefix}] ${message}`;
};

/**
 * Secure logger for authentication flows
 */
export const secureLog = {
  /**
   * Log authentication-related events
   * Automatically sanitizes sensitive data
   * Disabled in production unless DEBUG flag is set
   */
  auth: (message: string, data?: any): void => {
    // Skip in production unless debug is explicitly enabled
    if (IS_PRODUCTION && !IS_DEBUG_ENABLED) return;

    const sanitized = data ? sanitizeData(data) : undefined;
    console.log(formatMessage('AUTH', message), sanitized);
  },

  /**
   * Log successful operations
   */
  success: (message: string, data?: any): void => {
    if (IS_PRODUCTION && !IS_DEBUG_ENABLED) return;

    const sanitized = data ? sanitizeData(data) : undefined;
    console.log(formatMessage('AUTH ✓', message), sanitized);
  },

  /**
   * Log warnings (always shown, even in production)
   */
  warning: (message: string, data?: any): void => {
    const sanitized = data ? sanitizeData(data) : undefined;
    console.warn(formatMessage('AUTH ⚠', message), sanitized);
  },

  /**
   * Log errors (always shown, but sanitized)
   */
  error: (message: string, error: any): void => {
    // Only log safe error properties
    const safeError = {
      message: error?.message,
      code: error?.code,
      status: error?.status,
      statusText: error?.statusText,
      name: error?.name,
    };

    console.error(formatMessage('AUTH ✗', message), safeError);
  },

  /**
   * Log info messages (development only)
   */
  info: (message: string, data?: any): void => {
    if (IS_PRODUCTION && !IS_DEBUG_ENABLED) return;

    const sanitized = data ? sanitizeData(data) : undefined;
    console.info(formatMessage('AUTH ℹ', message), sanitized);
  },

  /**
   * Check if a token exists without logging its value
   * Safe way to debug token presence
   */
  checkToken: (name: string, token: string | null | undefined): void => {
    if (IS_PRODUCTION && !IS_DEBUG_ENABLED) return;

    const status = token ? {
      exists: true,
      length: token.length,
      prefix: token.substring(0, 4),
      type: token.startsWith('eyJ') ? 'JWT' : 'Unknown'
    } : {
      exists: false
    };

    console.log(formatMessage('AUTH', `Token "${name}"`), status);
  },

  /**
   * Log token storage operations safely
   */
  storage: (operation: 'set' | 'get' | 'remove' | 'clear', key: string, success: boolean): void => {
    if (IS_PRODUCTION && !IS_DEBUG_ENABLED) return;

    console.log(formatMessage('STORAGE', `${operation.toUpperCase()} ${key}`), {
      success,
      operation
    });
  },
};

/**
 * Production-safe logger for general use
 * Can be used throughout the app for non-auth logging
 */
export const logger = {
  debug: (message: string, data?: any): void => {
    if (IS_PRODUCTION) return;
    console.log(formatMessage('DEBUG', message), data);
  },

  info: (message: string, data?: any): void => {
    console.info(formatMessage('INFO', message), data);
  },

  warn: (message: string, data?: any): void => {
    console.warn(formatMessage('WARN', message), data);
  },

  error: (message: string, error: any): void => {
    console.error(formatMessage('ERROR', message), {
      message: error?.message,
      code: error?.code,
      name: error?.name,
    });
  },
};

/**
 * Utility to check if debug mode is enabled
 */
export const isDebugEnabled = (): boolean => {
  return !IS_PRODUCTION || IS_DEBUG_ENABLED;
};

/**
 * Example usage:
 *
 * // ✅ GOOD - Safe logging
 * secureLog.auth('Login successful', { email: user.email });
 * secureLog.checkToken('refresh', refreshToken);
 * secureLog.storage('set', 'rt', true);
 *
 * // ❌ BAD - Never do this
 * console.log('Token:', token);
 * console.log('Refresh token:', refreshToken.substring(0, 50));
 */
