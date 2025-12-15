"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authApi } from "@/api/auth";
import type { Session } from "@/api/types";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { validatePassword, getErrorMessage } from "@/utils/validators";

export default function SettingsPage() {
  const { user, logout, logoutAll } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const sessionsData = await authApi.getSessions();
      setSessions(sessionsData);
    } catch (error) {
      console.error("Failed to load sessions:", error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await authApi.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    // Validate passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    // Validate password strength
    const passwordValidationError = validatePassword(passwordForm.newPassword);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    setPasswordLoading(true);

    try {
      await authApi.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
      );
      setPasswordSuccess(true);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Password change logs out all sessions - redirect to login
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: unknown) {
      setPasswordError(getErrorMessage(err));
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    setLogoutAllLoading(true);
    try {
      await logoutAll();
    } catch (error) {
      console.error("Logout all failed:", error);
    } finally {
      setLogoutAllLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  return (
    <ProtectedRoute>
      <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account settings and security
          </p>
        </div>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Email
                </Label>
                <p className="mt-1">{user?.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Role
                </Label>
                <p className="mt-1">{user?.role}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  First Name
                </Label>
                <p className="mt-1">{user?.firstName || "Not set"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Last Name
                </Label>
                <p className="mt-1">{user?.lastName || "Not set"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Provider
                </Label>
                <p className="mt-1">{user?.provider}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Email Verified
                </Label>
                <p className="mt-1">
                  {user?.isEmailVerified ? (
                    <span className="text-green-600 dark:text-green-400">
                      ✓ Verified
                    </span>
                  ) : (
                    <span className="text-yellow-600 dark:text-yellow-400">
                      Pending
                    </span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password (only for LOCAL provider) */}
        {user?.provider === "LOCAL" && (
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password. This will log you out of all devices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {passwordSuccess && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Password changed successfully. Redirecting to login...
                  </p>
                </div>
              )}

              {passwordError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {passwordError}
                  </p>
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    required
                    disabled={passwordLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    required
                    disabled={passwordLoading}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Must be 8+ characters with uppercase, number, and special character
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    required
                    disabled={passwordLoading}
                  />
                </div>

                <Button type="submit" disabled={passwordLoading}>
                  {passwordLoading ? "Updating..." : "Change Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Active Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>
              Manage devices where you're logged in
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingSessions ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mx-auto" />
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                No active sessions
              </p>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{session.deviceInfo}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {session.ipAddress} • {session.loginProvider}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Last active: {formatDate(session.lastActivityAt)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSession(session.id)}
                    >
                      Revoke
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 space-y-2">
              <Button
                variant="destructive"
                onClick={handleLogoutAll}
                className="w-full"
                disabled={logoutAllLoading || logoutLoading}
              >
                {logoutAllLoading ? "Logging out..." : "Log Out All Devices"}
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full"
                disabled={logoutLoading || logoutAllLoading}
              >
                {logoutLoading ? "Logging out..." : "Log Out Current Device"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
