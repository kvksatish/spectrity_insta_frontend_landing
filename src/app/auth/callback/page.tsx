"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { authApi } from "@/api/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { tokenStorage } from "@/utils/tokenStorage";
import { getErrorMessage } from "@/utils/validators";

function AuthCallbackContent() {
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { updateUser } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double execution in React Strict Mode
    if (hasProcessed.current) {
      return;
    }

    const handleCallback = async () => {
      const accessToken = searchParams.get("accessToken");
      const refreshToken = searchParams.get("refreshToken");
      const expiresAt = searchParams.get("expiresAt");
      const errorParam = searchParams.get("error");

      // Handle error responses from backend
      if (errorParam) {
        const errorMessages: Record<string, string> = {
          auth_failed: "Google authentication failed. Please try again.",
          missing_code: "Invalid authentication response from Google.",
          missing_state: "Security validation failed. Please try again.",
          server_error: "Server error occurred. Please try again later.",
        };
        setError(errorMessages[errorParam] || decodeURIComponent(errorParam));
        return;
      }

      if (!accessToken || !refreshToken) {
        setError("Missing authentication tokens");
        return;
      }

      try {
        // Mark as processed before async operations
        hasProcessed.current = true;

        // Store tokens
        tokenStorage.setTokens(accessToken, refreshToken);

        // Get user data
        const user = await authApi.getCurrentUser();
        updateUser(user);

        // Redirect to dashboard
        router.push("/dashboard");
      } catch (err: unknown) {
        setError(getErrorMessage(err));
        tokenStorage.clearTokens();
        hasProcessed.current = false; // Allow retry on error
      }
    };

    handleCallback();
  }, [searchParams, router, updateUser]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">
              Authentication Failed
            </CardTitle>
            <CardDescription>Unable to complete sign in</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
            <Button asChild className="w-full">
              <Link href="/login">Back to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Completing Sign In...</CardTitle>
          <CardDescription>Please wait</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Authenticating your account
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
