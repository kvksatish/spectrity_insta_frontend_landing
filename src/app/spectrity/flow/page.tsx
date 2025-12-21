"use client";

// Force dynamic rendering (required for client-side API calls)
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AISummaryCard } from "@/components/posts/AISummaryCard";
import { PostDetailsAccordion } from "@/components/posts/PostDetailsAccordion";
import { PostsFilters } from "@/components/posts/PostsFilters";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Waves, Filter, ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { getPosts, type GetPostsQuery, type Post } from "@/api/posts";

export default function FlowPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<GetPostsQuery>({
    page: 1,
    limit: 10,
    sortBy: "created_at",
    sortOrder: "desc",
    // Note: has_summary filter removed - backend validation issue
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Fetch posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getPosts(filters);
        setPosts(response.data);
        setPagination(response.pagination);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || "Failed to fetch posts");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [filters]);

  const handleFiltersChange = (newFilters: Partial<GetPostsQuery>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      sortBy: "created_at",
      sortOrder: "desc",
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <ProtectedRoute>
      <div className="container max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Waves className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Flow</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                AI-powered Instagram insights feed
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>

        {/* Layout: Filters Sidebar + Main Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-4">
                <PostsFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onReset={handleResetFilters}
                />
              </div>
            </aside>
          )}

          {/* Main Feed */}
          <main className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
            {/* Posts Count & Pagination Info */}
            {!loading && !error && posts.length > 0 && (
              <div className="flex items-center justify-between mb-6 text-sm text-muted-foreground">
                <span>
                  Showing {posts.length} of {pagination.totalCount} post{pagination.totalCount !== 1 ? 's' : ''}
                </span>
                <span>
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">Loading posts...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Empty State */}
            {!loading && !error && posts.length === 0 && (
              <div className="text-center py-20">
                <p className="text-lg font-medium text-muted-foreground mb-2">No posts found</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your filters or check back later
                </p>
              </div>
            )}

            {/* Posts List */}
            {!loading && !error && posts.length > 0 && (
              <div className="space-y-6">
                {posts.map((post) => (
                  <div key={post.id} className="space-y-3">
                    {/* AI Summary First (Always Expanded) */}
                    <AISummaryCard post={post} />

                    {/* Post Details Below (Collapsible) */}
                    <PostDetailsAccordion post={post} />
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {!loading && !error && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8 mt-8 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground px-4">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}

            {/* End of Feed Indicator */}
            {!loading && !error && posts.length > 0 && !pagination.hasNextPage && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="text-sm">You're all caught up! ✨</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
