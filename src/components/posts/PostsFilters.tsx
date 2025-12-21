"use client";

import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { GetPostsQuery, PostType, SummaryStatus, ScrapeQuality, SortBy, SortOrder } from "@/api/posts";

interface PostsFiltersProps {
  filters: GetPostsQuery;
  onFiltersChange: (filters: GetPostsQuery) => void;
  onReset: () => void;
}

export function PostsFilters({ filters, onFiltersChange, onReset }: PostsFiltersProps) {
  const updateFilter = (key: keyof GetPostsQuery, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === "" ? undefined : value,
    });
  };

  const activeFilterCount = Object.keys(filters).filter(
    (key) => key !== "page" && key !== "limit" && filters[key as keyof GetPostsQuery] !== undefined
  ).length;

  return (
    <Card className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary">{activeFilterCount}</Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-xs"
          >
            <X className="w-4 h-4 mr-1" />
            Reset All
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search" className="text-sm font-medium">
          Search
        </Label>
        <Input
          id="search"
          type="text"
          placeholder="Search caption or username..."
          value={filters.search || ""}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="text-sm"
        />
      </div>

      {/* Sorting */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sortBy" className="text-sm font-medium">
            Sort By
          </Label>
          <select
            id="sortBy"
            value={filters.sortBy || "created_at"}
            onChange={(e) => updateFilter("sortBy", e.target.value as SortBy)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="created_at">Date Added</option>
            <option value="timestamp">Post Date</option>
            <option value="like_count">Likes</option>
            <option value="comments_count">Comments</option>
            <option value="video_view_count">Views</option>
            <option value="updated_at">Last Updated</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sortOrder" className="text-sm font-medium">
            Order
          </Label>
          <select
            id="sortOrder"
            value={filters.sortOrder || "desc"}
            onChange={(e) => updateFilter("sortOrder", e.target.value as SortOrder)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Post Type */}
      <div className="space-y-2">
        <Label htmlFor="post_type" className="text-sm font-medium">
          Content Type
        </Label>
        <select
          id="post_type"
          value={filters.post_type || ""}
          onChange={(e) => updateFilter("post_type", e.target.value as PostType)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All Types</option>
          <option value="IMAGE">Images</option>
          <option value="VIDEO">Videos</option>
          <option value="CAROUSEL">Carousels</option>
          <option value="REEL">Reels</option>
        </select>
      </div>

      {/* AI Summary Filters */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="has_summary" className="text-sm font-medium">
            AI Summary
          </Label>
          <select
            id="has_summary"
            value={filters.has_summary || ""}
            onChange={(e) => updateFilter("has_summary", e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">All Posts</option>
            <option value="true">With Summary</option>
            <option value="false">Without Summary</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="summary_status" className="text-sm font-medium">
            Summary Status
          </Label>
          <select
            id="summary_status"
            value={filters.summary_status || ""}
            onChange={(e) => updateFilter("summary_status", e.target.value as SummaryStatus)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">All Status</option>
            <option value="COMPLETED">Completed</option>
            <option value="GENERATING">Generating</option>
            <option value="FAILED">Failed</option>
            <option value="NONE">None</option>
          </select>
        </div>
      </div>

      {/* Quality & Sponsored */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="scrape_quality" className="text-sm font-medium">
            Media Quality
          </Label>
          <select
            id="scrape_quality"
            value={filters.scrape_quality || ""}
            onChange={(e) => updateFilter("scrape_quality", e.target.value as ScrapeQuality)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">All Quality</option>
            <option value="HD">HD</option>
            <option value="SD">SD</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="is_sponsored" className="text-sm font-medium">
            Sponsored
          </Label>
          <select
            id="is_sponsored"
            value={filters.is_sponsored || ""}
            onChange={(e) => updateFilter("is_sponsored", e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">All Posts</option>
            <option value="false">Organic Only</option>
            <option value="true">Sponsored Only</option>
          </select>
        </div>
      </div>

      {/* Engagement Filters */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Engagement Range</Label>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="min_likes" className="text-xs text-muted-foreground">
              Min Likes
            </Label>
            <Input
              id="min_likes"
              type="number"
              min="0"
              placeholder="0"
              value={filters.min_likes || ""}
              onChange={(e) => updateFilter("min_likes", e.target.value ? parseInt(e.target.value) : undefined)}
              className="text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_likes" className="text-xs text-muted-foreground">
              Max Likes
            </Label>
            <Input
              id="max_likes"
              type="number"
              min="0"
              placeholder="∞"
              value={filters.max_likes || ""}
              onChange={(e) => updateFilter("max_likes", e.target.value ? parseInt(e.target.value) : undefined)}
              className="text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="min_comments" className="text-xs text-muted-foreground">
              Min Comments
            </Label>
            <Input
              id="min_comments"
              type="number"
              min="0"
              placeholder="0"
              value={filters.min_comments || ""}
              onChange={(e) => updateFilter("min_comments", e.target.value ? parseInt(e.target.value) : undefined)}
              className="text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_comments" className="text-xs text-muted-foreground">
              Max Comments
            </Label>
            <Input
              id="max_comments"
              type="number"
              min="0"
              placeholder="∞"
              value={filters.max_comments || ""}
              onChange={(e) => updateFilter("max_comments", e.target.value ? parseInt(e.target.value) : undefined)}
              className="text-sm"
            />
          </div>
        </div>
      </div>

      {/* Owner Filter */}
      <div className="space-y-2">
        <Label htmlFor="owner_username" className="text-sm font-medium">
          Instagram Username
        </Label>
        <Input
          id="owner_username"
          type="text"
          placeholder="e.g., nike, groww_official"
          value={filters.owner_username || ""}
          onChange={(e) => updateFilter("owner_username", e.target.value)}
          className="text-sm"
        />
      </div>
    </Card>
  );
}
