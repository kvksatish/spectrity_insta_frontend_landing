import apiClient from "./client";

// TypeScript types matching the API
export type PostType = "IMAGE" | "VIDEO" | "CAROUSEL" | "REEL";
export type SummaryStatus = "NONE" | "GENERATING" | "COMPLETED" | "FAILED";
export type ScrapeQuality = "HD" | "SD" | "FAILED";
export type SortBy =
  | "created_at"
  | "updated_at"
  | "timestamp"
  | "like_count"
  | "comments_count"
  | "video_view_count";
export type SortOrder = "asc" | "desc";

export interface GetPostsQuery {
  // Pagination
  page?: number;
  limit?: number;

  // Sorting
  sortBy?: SortBy;
  sortOrder?: SortOrder;

  // Content filters
  post_type?: PostType;
  type?: string;

  // Owner filters
  owner_username?: string;
  owner_id?: string;
  short_code?: string;

  // AI filters
  has_summary?: "true" | "false";
  summary_status?: SummaryStatus;

  // Boolean filters
  is_sponsored?: "true" | "false";
  is_hidden?: "true" | "false";
  is_deleted_by_meta?: "true" | "false";

  // Quality
  scrape_quality?: ScrapeQuality;

  // Engagement
  min_likes?: number;
  max_likes?: number;
  min_comments?: number;
  max_comments?: number;
  min_views?: number;
  max_views?: number;

  // Date range
  from_date?: string; // ISO 8601
  to_date?: string; // ISO 8601

  // Search
  search?: string;
}

export interface MediaItem {
  url: string;
  type: "image" | "video";
  thumbnail_url: string;
}

export interface Post {
  id: string;
  short_code: string;
  input_url: string;
  post_type: PostType;
  caption: string;
  alt_text: string | null;
  media_items: MediaItem[];
  owner_id: string;
  owner_username: string;
  owner_full_name: string;
  like_count: number;
  comments_count: number;
  video_view_count: number | null;
  timestamp: string;
  is_sponsored: boolean;
  music_info: any;
  has_summary: boolean;
  summary_status: SummaryStatus;
  combined_summary: string | null;
  ai_visual_analysis: string | null;
  scrape_quality: ScrapeQuality;
  urls_valid_until: string;
  created_at: string;
  updated_at: string;
  type: string;
  is_hidden: boolean;
  is_deleted_by_meta: boolean;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface GetPostsResponse {
  success: boolean;
  data: Post[];
  pagination: Pagination;
  filters: Record<string, any>;
}

/**
 * Fetch posts from the API with optional filters
 */
export async function getPosts(
  query: GetPostsQuery = {}
): Promise<GetPostsResponse> {
  const params = new URLSearchParams();

  // Add all query parameters
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });

  const response = await apiClient.get<GetPostsResponse>(
    `/v1/posts?${params.toString()}`
  );
  return response.data;
}
