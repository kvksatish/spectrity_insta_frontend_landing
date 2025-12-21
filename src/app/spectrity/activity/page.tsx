"use client";

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default function ActivityPage() {
  return (
    <ProtectedRoute>
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="flex items-center gap-3 mb-8">
          <Bell className="w-8 h-8" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Activity</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View your notifications and activity
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest notifications and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Bell className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No notifications yet
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  You'll see updates about your Instagram analyses here
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
