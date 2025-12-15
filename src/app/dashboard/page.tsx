"use client";

import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back{user?.firstName ? `, ${user.firstName}` : ""}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              This is your protected dashboard
            </p>
          </div>
          <div className="flex gap-4">
            <Button asChild variant="outline">
              <Link href="/settings">Settings</Link>
            </Button>
            <Button variant="destructive" onClick={() => logout()}>
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Email:
                </span>
                <span className="text-sm font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Role:
                </span>
                <span className="text-sm font-medium">{user?.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Provider:
                </span>
                <span className="text-sm font-medium">{user?.provider}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Verified:
                </span>
                <span className="text-sm font-medium">
                  {user?.isEmailVerified ? (
                    <span className="text-green-600 dark:text-green-400">
                      ✓ Yes
                    </span>
                  ) : (
                    <span className="text-yellow-600 dark:text-yellow-400">
                      Pending
                    </span>
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                asChild
                variant="outline"
                className="w-full justify-start"
              >
                <Link href="/settings">Manage Account</Link>
              </Button>
              {user?.provider === "LOCAL" && (
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Link href="/settings">Change Password</Link>
                </Button>
              )}
              <Button
                asChild
                variant="outline"
                className="w-full justify-start"
              >
                <Link href="/settings">View Sessions</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integration Info</CardTitle>
              <CardDescription>API integration details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This dashboard demonstrates a fully integrated authentication
                system with:
              </p>
              <ul className="text-sm space-y-1 ml-4 list-disc text-gray-600 dark:text-gray-400">
                <li>JWT token management</li>
                <li>Automatic token refresh</li>
                <li>Protected routes</li>
                <li>Session management</li>
                <li>Google OAuth integration</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {!user?.isEmailVerified && (
          <Card className="mt-6 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <svg
                  className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-200">
                    Email Verification Pending
                  </h3>
                  <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                    Please verify your email address to unlock all features.
                  </p>
                  <Button asChild variant="outline" className="mt-4" size="sm">
                    <Link href="/resend-verification">
                      Resend Verification Email
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
}
