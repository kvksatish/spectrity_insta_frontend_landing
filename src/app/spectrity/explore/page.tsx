"use client";

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

export default function ExplorePage() {
  return (
    <ProtectedRoute>
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="flex items-center gap-3 mb-8">
          <Search className="w-8 h-8" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Explore</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Discover Instagram content and insights
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>Explore features will be available here</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This page will allow you to explore Instagram content, analyze trends, and discover insights.
            </p>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
