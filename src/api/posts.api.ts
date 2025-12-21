/**
 * Instagram Post Scraping API
 */

import client from './client';

export interface ScrapePostRequest {
  url: string;
}

export interface ScrapePostResponse {
  success: boolean;
  message?: string;
  data?: any; // Instagram post data from backend
  error?: {
    code?: string;
    message?: string;
    statusCode?: number;
  };
}

export interface EssenceFeedPost {
  id: string;
  short_code: string;
  input_url: string;
  post_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'REEL';
  caption: string;
  alt_text: string;
  media_items: {
    url: string;
    type: string;
    thumbnail_url: string;
  }[];
  owner_id: string;
  owner_username: string;
  owner_full_name: string;
  like_count: number;
  comments_count: number;
  video_view_count?: number | null;
  timestamp: string;
  has_summary: boolean;
  summary_status: string;
  combined_summary?: string;
  ai_visual_analysis?: string;
  ai_key_moments?: string | null;
  ai_objects_detected?: string | null;
  ai_actions?: string | null;
  scrape_quality: string;
  urls_valid_until: string;
  created_at: string;
  updated_at: string;
}

export interface EssenceFeedResponse {
  success: boolean;
  data: EssenceFeedPost[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: {
    code?: string;
    message?: string;
    statusCode?: number;
  };
}

/**
 * Scrape an Instagram post by URL
 * @param url - Instagram post URL (e.g., https://www.instagram.com/p/ABC123/)
 * @returns Scraped post data
 */
export const scrapeInstagramPost = async (url: string): Promise<ScrapePostResponse> => {
  try {
    const response = await client.post<ScrapePostResponse>('/v1/posts/scrape', {
      url,
    });

    return response.data;
  } catch (error: any) {
    console.error('[POSTS API] Error scraping Instagram post:', error);

    // Handle API errors and preserve error details
    if (error.response?.data) {
      // Return error response structure from backend
      return {
        success: false,
        error: {
          code: error.response.data.error?.code || 'API_ERROR',
          message: error.response.data.error?.message || error.response.data.message || 'Failed to scrape Instagram post',
          statusCode: error.response.status,
        },
      };
    }

    // Network error
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection and try again.',
        statusCode: 0,
      },
    };
  }
};

/**
 * Get essence feed - Instagram posts with AI-generated summaries
 * @param page - Page number (default: 1)
 * @param limit - Number of posts per page (default: 10)
 * @returns Essence feed posts with AI insights
 */
export const getEssenceFeed = async (
  page: number = 1,
  limit: number = 10
): Promise<EssenceFeedResponse> => {
  try {
    const response = await client.get<EssenceFeedResponse>(
      `/v1/posts/essence-feed?page=${page}&limit=${limit}&sortBy=created_at&sortOrder=desc`
    );

    return response.data;
  } catch (error: any) {
    console.error('[POSTS API] Error fetching essence feed:', error);

    // Handle API errors and preserve error details
    if (error.response?.data) {
      return {
        success: false,
        data: [],
        error: {
          code: error.response.data.error?.code || 'API_ERROR',
          message: error.response.data.error?.message || error.response.data.message || 'Failed to fetch essence feed',
          statusCode: error.response.status,
        },
      };
    }

    // Network error
    return {
      success: false,
      data: [],
      error: {
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection and try again.',
        statusCode: 0,
      },
    };
  }
};
