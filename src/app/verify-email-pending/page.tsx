"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

export default function VerifyEmailPendingPage() {
  const { user, logout } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Email Verification Required</CardTitle>
          <CardDescription>
            Please verify your email to continue
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              We've sent a verification email to <strong>{user?.email}</strong>.
              Please check your inbox and click the verification link to
              activate your account.
            </p>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="mb-2">Didn't receive the email?</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Check your spam/junk folder</li>
              <li>Make sure you entered the correct email address</li>
              <li>Wait a few minutes and check again</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/resend-verification">Resend Verification Email</Link>
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => logout()}
            >
              Sign Out
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Once verified, you'll be able to access all features
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
