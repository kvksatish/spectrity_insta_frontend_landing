/**
 * API Response Types
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  message: string;
  code: string;
  statusCode?: number;
  details?: Record<string, unknown> | null;
}

/**
 * User Types
 */

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: "USER" | "ADMIN";
  provider: "LOCAL" | "GOOGLE";
  isEmailVerified: boolean;
  isActive: boolean;
  avatarUrl: string | null;
  createdAt: string;
  lastLoginAt: string | null;
}

/**
 * Authentication Types
 */

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface GoogleAuthResponse {
  authUrl: string;
  state: string;
}

/**
 * Session Types
 */

export interface Session {
  id: string;
  userId: string;
  ipAddress: string | null;
  userAgent: string | null;
  deviceInfo: string | null;
  loginProvider: "LOCAL" | "GOOGLE";
  createdAt: string;
  expiresAt: string;
  lastActivityAt: string;
}

/**
 * Password Reset Types
 */

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Email Verification Types
 */

export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}
