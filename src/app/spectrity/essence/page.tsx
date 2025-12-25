"use client";

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { InstagramPost } from "@/components/InstagramPost";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getEssenceFeed, type EssenceFeedPost } from "@/api/posts.api";

// Helper to format timestamp
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// Transform essence post to Instagram post format
function transformPost(post: EssenceFeedPost) {
  return {
    id: post.id,
    username: post.owner_username,
    userAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${post.owner_username}`,
    postImage: post.media_items[0]?.url || '',
    caption: post.caption,
    likes: post.like_count === -1 ? 0 : post.like_count,
    comments: post.comments_count,
    timestamp: formatTimestamp(post.timestamp),
    isLiked: false,
    isSaved: false,
    aiSummary: post.combined_summary,
    aiAnalysis: post.ai_visual_analysis,
    shortCode: post.short_code, // Pass shortCode for Instagram linking
  };
}

export default function DashboardPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Fetch essence feed
  useEffect(() => {
    loadEssenceFeed();
  }, [page]);

  const loadEssenceFeed = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getEssenceFeed(page, 10);

      if (response.success && response.data) {
        const transformedPosts = response.data.map(transformPost);
        setPosts(transformedPosts);
      } else {
        setError(response.error?.message || 'Failed to load essence feed');
      }
    } catch (err: any) {
      console.error('[DASHBOARD] Error loading essence feed:', err);
      setError(err.message || 'An error occurred while loading posts');
    } finally {
      setLoading(false);
    }
  };


  return (
    <ProtectedRoute>
      {/* Header - only visible on desktop */}
      <div className="hidden md:block sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6" />
            <h1 className="text-xl font-bold">Essence</h1>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <h1 className="text-lg font-bold">Essence</h1>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="container max-w-2xl mx-auto px-0 md:px-4 pb-20">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading essence feed...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="px-4">
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-12 px-4">
            <p className="text-muted-foreground mb-2">No posts in your essence feed yet</p>
            <p className="text-sm text-muted-foreground">
              Scrape some Instagram posts above to get started!
            </p>
          </div>
        )}

        {/* Posts Feed */}
        {!loading && !error && posts.length > 0 && (
          <>
            {posts.map((post) => (
              <InstagramPost key={post.id} {...post} />
            ))}

            {/* End of Feed */}
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 px-4">
              <p className="text-sm">You're all caught up! ✨</p>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
