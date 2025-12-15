"use client";

/**
 * Authentication Context
 * Provides global authentication state and methods
 */

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { authApi } from "@/api/auth";
import type { RegisterRequest, User } from "@/api/types";
import {
  generateOAuthState,
  storeOAuthState,
} from "@/utils/oauthState";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await authApi.initializeAuth();
        setUser(user);
      } catch (error) {
        console.error("Auth initialization failed:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Cross-tab logout detection
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Detect when refresh token is removed in another tab
      if (e.key === 'rt' && e.oldValue && !e.newValue) {
        console.log('[AUTH] Logout detected in another tab');
        setUser(null);
        // Optional: Show notification
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login?reason=logged-out-elsewhere';
        }
      }

      // Detect when refresh token is added in another tab (login)
      if (e.key === 'rt' && !e.oldValue && e.newValue) {
        console.log('[AUTH] Login detected in another tab');
        // Optionally reload user data
        authApi.initializeAuth().then(user => {
          if (user) setUser(user);
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  /**
   * Login with email and password
   * Throws error if email is not verified
   */
  const login = async (
    email: string,
    password: string,
    rememberMe = false,
  ): Promise<void> => {
    const user = await authApi.login(email, password, rememberMe);

    // Check if email is verified (for LOCAL provider only)
    // Google OAuth users are automatically verified
    if (user.provider === "LOCAL" && !user.isEmailVerified) {
      throw new Error(
        "Please verify your email before logging in. Check your inbox for the verification link.",
      );
    }

    setUser(user);
  };

  /**
   * Register a new user
   * Note: User will need to verify email before logging in
   */
  const register = async (data: RegisterRequest): Promise<void> => {
    await authApi.register(data);
    // Don't set user - they need to verify email first
  };

  /**
   * Initiate Google OAuth login
   * Redirects to Google consent screen
   * Generates and stores state parameter for CSRF protection
   */
  const loginWithGoogle = async (): Promise<void> => {
    // Generate and store state for CSRF protection
    const state = generateOAuthState();
    storeOAuthState(state);

    // Get OAuth URL from backend
    const authUrl = await authApi.getGoogleAuthUrl();

    // TODO: Pass state parameter to backend once it supports it
    // The backend should include this state in the OAuth flow and return it in the callback
    // For now, we just validate that OAuth was initiated from our site

    window.location.href = authUrl;
  };

  /**
   * Logout from current session
   */
  const logout = async (): Promise<void> => {
    await authApi.logout();
    setUser(null);
  };

  /**
   * Logout from all devices/sessions
   */
  const logoutAll = async (): Promise<void> => {
    await authApi.logoutAll();
    setUser(null);
  };

  /**
   * Update user data in context
   * Useful after profile updates or email verification
   */
  const updateUser = (updatedUser: User): void => {
    setUser(updatedUser);
  };

  /**
   * Refresh user data from server
   */
  const refreshUser = async (): Promise<void> => {
    try {
      const freshUser = await authApi.getCurrentUser();
      setUser(freshUser);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      // Don't clear user on refresh failure - might be temporary network issue
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    logoutAll,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 * Must be used within AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
