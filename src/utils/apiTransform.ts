/**
 * API Response Transformation Utilities
 * Converts between backend snake_case and frontend camelCase
 */

import type { User, Session } from "@/api/types";

/**
 * Backend User Response (snake_case from API)
 */
interface BackendUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: "USER" | "ADMIN";
  provider: "LOCAL" | "GOOGLE";
  google_id?: string | null;
  avatar_url: string | null;
  is_email_verified: boolean;
  is_active: boolean;
  last_login_at: string | null;
  last_login_ip?: string | null;
  last_login_provider?: "LOCAL" | "GOOGLE" | null;
  password_changed_at?: string | null;
  failed_login_attempts?: number;
  lockout_until?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Backend Session Response (snake_case from API)
 */
interface BackendSession {
  id: string;
  user_id: string;
  ip_address: string | null;
  user_agent: string | null;
  device_info: string | null;
  login_provider: "LOCAL" | "GOOGLE";
  created_at: string;
  expires_at: string;
  last_activity_at: string;
}

/**
 * Transform backend user response to frontend User type
 */
export function transformUser(backendUser: BackendUser): User {
  return {
    id: backendUser.id,
    email: backendUser.email,
    firstName: backendUser.first_name,
    lastName: backendUser.last_name,
    role: backendUser.role,
    provider: backendUser.provider,
    isEmailVerified: backendUser.is_email_verified,
    isActive: backendUser.is_active,
    avatarUrl: backendUser.avatar_url,
    createdAt: backendUser.created_at,
    lastLoginAt: backendUser.last_login_at,
  };
}

/**
 * Transform backend session response to frontend Session type
 */
export function transformSession(backendSession: BackendSession): Session {
  return {
    id: backendSession.id,
    userId: backendSession.user_id,
    ipAddress: backendSession.ip_address,
    userAgent: backendSession.user_agent,
    deviceInfo: backendSession.device_info,
    loginProvider: backendSession.login_provider,
    createdAt: backendSession.created_at,
    expiresAt: backendSession.expires_at,
    lastActivityAt: backendSession.last_activity_at,
  };
}

/**
 * Transform array of backend users
 */
export function transformUsers(backendUsers: BackendUser[]): User[] {
  return backendUsers.map(transformUser);
}

/**
 * Transform array of backend sessions
 */
export function transformSessions(backendSessions: BackendSession[]): Session[] {
  return backendSessions.map(transformSession);
}
