"use client";

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PostsFeed } from "@/components/posts/PostsFeed";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function PostsPage() {
  return (
    <ProtectedRoute>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Posts Feed</h1>
                <p className="text-sm text-muted-foreground">
                  AI-powered Instagram insights
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/essence">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Essence
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="container mx-auto px-4 py-6">
        <PostsFeed />
      </div>
    </ProtectedRoute>
  );
}
