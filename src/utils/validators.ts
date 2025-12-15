/**
 * Validation utilities
 */

/**
 * Validate password strength
 */
export const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return "Password must contain at least one special character";
  }
  return null;
};

/**
 * Validate that a URL is a safe relative path (prevent open redirect)
 */
export const isValidReturnUrl = (url: string | null): boolean => {
  if (!url) return false;

  // Must start with / and not be a protocol
  if (!url.startsWith("/")) return false;

  // Prevent protocol-relative URLs (//example.com)
  if (url.startsWith("//")) return false;

  // Prevent javascript: or data: URLs
  if (url.toLowerCase().startsWith("javascript:")) return false;
  if (url.toLowerCase().startsWith("data:")) return false;

  return true;
};

/**
 * Extract error message from various error types
 */
export const getErrorMessage = (error: unknown): string => {
  // Axios error
  if (typeof error === "object" && error !== null && "isAxiosError" in error) {
    const axiosError = error as {
      response?: {
        data?: {
          message?: string;
          error?: { message?: string };
        };
      };
      message?: string;
    };

    const responseMessage = axiosError.response?.data?.message;
    const errorMessage = axiosError.response?.data?.error?.message;

    return responseMessage || errorMessage || axiosError.message || "An error occurred";
  }

  // Standard Error
  if (error instanceof Error) {
    return error.message;
  }

  // String error
  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred";
};
