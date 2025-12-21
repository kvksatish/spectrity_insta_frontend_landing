"use client";

/**
 * Protected Route Component
 * Redirects unauthenticated users to login
 * Optionally requires email verification
 */

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requireVerified?: boolean;
}

export function ProtectedRoute({
  children,
  requireVerified = true,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // Not authenticated - redirect to login
    if (!user) {
      // Store the current path to redirect back after login
      const returnUrl = encodeURIComponent(pathname);
      router.push(`/login?returnUrl=${returnUrl}`);
      return;
    }

    // Authenticated but email not verified
    if (requireVerified && !user.isEmailVerified) {
      router.push("/verify-email-pending");
      return;
    }
  }, [user, loading, requireVerified, router, pathname]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated or not verified - don't render children
  // (useEffect will handle redirect)
  if (!user || (requireVerified && !user.isEmailVerified)) {
    return null;
  }

  // Authenticated and verified (or verification not required)
  return <>{children}</>;
}

/**
 * Guest Route Component
 * Redirects authenticated users away from auth pages (login, register)
 */
interface GuestRouteProps {
  children: ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (user) {
      // User is logged in, redirect to essence
      router.push("/spectrity/essence");
    }
  }, [user, loading, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Authenticated - don't render children (useEffect will handle redirect)
  if (user) {
    return null;
  }

  // Not authenticated - render auth pages
  return <>{children}</>;
}
