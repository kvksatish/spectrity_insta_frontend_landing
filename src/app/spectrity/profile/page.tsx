"use client";

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

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
import { User, Settings, LogOut } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="flex items-center gap-3 mb-8">
          <User className="w-8 h-8" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Profile</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your account and preferences
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                  {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="font-semibold text-lg">
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.firstName || "User"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Account Status
                  </span>
                  <span className="text-sm font-medium">
                    {user?.isEmailVerified ? (
                      <span className="text-green-600 dark:text-green-400">
                        ✓ Verified
                      </span>
                    ) : (
                      <span className="text-yellow-600 dark:text-yellow-400">
                        Pending Verification
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Role
                  </span>
                  <span className="text-sm font-medium">{user?.role}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Sign-in Method
                  </span>
                  <span className="text-sm font-medium">{user?.provider}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Manage your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                asChild
                variant="outline"
                className="w-full justify-start"
              >
                <Link href="/settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Account Settings
                </Link>
              </Button>
              {user?.provider === "LOCAL" && (
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Link href="/settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Change Password
                  </Link>
                </Button>
              )}
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={() => logout()}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </CardContent>
          </Card>

          {!user?.isEmailVerified && (
            <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
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
                      Verify Your Email
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
      </div>
    </ProtectedRoute>
  );
}
