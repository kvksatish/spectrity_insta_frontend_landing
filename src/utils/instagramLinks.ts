/**
 * Instagram Link Utilities
 * Handles parsing and validation of Instagram URLs
 */

export type InstagramContentType = "post" | "reel" | "tv" | "story" | "profile" | "unknown";

export interface ParsedInstagramLink {
  type: InstagramContentType;
  id: string;
  username?: string;
  url: string;
  isValid: boolean;
}

/**
 * Supported Instagram URL patterns:
 * - Posts: https://www.instagram.com/p/POST_ID/
 * - Reels: https://www.instagram.com/reel/REEL_ID/ or /reels/REEL_ID/
 * - TV: https://www.instagram.com/tv/TV_ID/
 * - Stories: https://www.instagram.com/stories/USERNAME/STORY_ID/
 * - Profile: https://www.instagram.com/USERNAME/
 *
 * Short URLs:
 * - https://instagr.am/p/POST_ID/
 */

/**
 * Parse Instagram URL and extract metadata
 */
export function parseInstagramUrl(url: string): ParsedInstagramLink {
  // Normalize URL
  let normalizedUrl = url.trim();

  // Remove any whitespace or line breaks
  normalizedUrl = normalizedUrl.replace(/\s+/g, "");

  // Add https:// if missing
  if (!normalizedUrl.startsWith("http")) {
    normalizedUrl = "https://" + normalizedUrl;
  }

  try {
    const urlObj = new URL(normalizedUrl);
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname;

    // Check if it's an Instagram domain
    const isInstagram =
      hostname.includes("instagram.com") ||
      hostname.includes("instagr.am");

    if (!isInstagram) {
      return {
        type: "unknown",
        id: "",
        url: normalizedUrl,
        isValid: false,
      };
    }

    // Extract content ID and type from path

    // Post: /p/POST_ID/
    const postMatch = pathname.match(/\/p\/([a-zA-Z0-9_-]+)/);
    if (postMatch) {
      return {
        type: "post",
        id: postMatch[1],
        url: normalizedUrl,
        isValid: true,
      };
    }

    // Reel: /reel/REEL_ID/ or /reels/REEL_ID/
    const reelMatch = pathname.match(/\/reels?\/([a-zA-Z0-9_-]+)/);
    if (reelMatch) {
      return {
        type: "reel",
        id: reelMatch[1],
        url: normalizedUrl,
        isValid: true,
      };
    }

    // TV: /tv/TV_ID/
    const tvMatch = pathname.match(/\/tv\/([a-zA-Z0-9_-]+)/);
    if (tvMatch) {
      return {
        type: "tv",
        id: tvMatch[1],
        url: normalizedUrl,
        isValid: true,
      };
    }

    // Story: /stories/USERNAME/STORY_ID/
    const storyMatch = pathname.match(/\/stories\/([a-zA-Z0-9._]+)\/([a-zA-Z0-9_-]+)/);
    if (storyMatch) {
      return {
        type: "story",
        id: storyMatch[2],
        username: storyMatch[1],
        url: normalizedUrl,
        isValid: true,
      };
    }

    // Profile: /USERNAME/ (but not other types)
    const profileMatch = pathname.match(/^\/([a-zA-Z0-9._]+)\/?$/);
    if (profileMatch && !["p", "reel", "reels", "tv", "stories"].includes(profileMatch[1])) {
      return {
        type: "profile",
        id: profileMatch[1],
        username: profileMatch[1],
        url: normalizedUrl,
        isValid: true,
      };
    }

    // If no specific type found
    return {
      type: "unknown",
      id: "",
      url: normalizedUrl,
      isValid: false,
    };
  } catch (error) {
    console.error("[Instagram] URL parsing failed:", error);
    return {
      type: "unknown",
      id: "",
      url: normalizedUrl,
      isValid: false,
    };
  }
}

/**
 * Validate if a URL is an Instagram link
 */
export function isInstagramUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    return hostname.includes("instagram.com") || hostname.includes("instagr.am");
  } catch {
    return false;
  }
}

/**
 * Extract Instagram content ID from URL
 */
export function extractInstagramId(url: string): string | null {
  const parsed = parseInstagramUrl(url);
  return parsed.isValid ? parsed.id : null;
}

/**
 * Normalize Instagram URL to standard format
 */
export function normalizeInstagramUrl(url: string): string {
  const parsed = parseInstagramUrl(url);

  if (!parsed.isValid) {
    return url;
  }

  // Convert to standard format
  switch (parsed.type) {
    case "post":
      return `https://www.instagram.com/p/${parsed.id}/`;
    case "reel":
      return `https://www.instagram.com/reel/${parsed.id}/`;
    case "tv":
      return `https://www.instagram.com/tv/${parsed.id}/`;
    case "story":
      return `https://www.instagram.com/stories/${parsed.username}/${parsed.id}/`;
    case "profile":
      return `https://www.instagram.com/${parsed.username}/`;
    default:
      return url;
  }
}

/**
 * Get a human-readable description of the content type
 */
export function getContentTypeLabel(type: InstagramContentType): string {
  const labels: Record<InstagramContentType, string> = {
    post: "Instagram Post",
    reel: "Instagram Reel",
    tv: "Instagram TV",
    story: "Instagram Story",
    profile: "Instagram Profile",
    unknown: "Instagram Content",
  };
  return labels[type];
}

/**
 * Validate multiple Instagram URLs
 */
export function validateInstagramUrls(urls: string[]): ParsedInstagramLink[] {
  return urls.map(parseInstagramUrl).filter(link => link.isValid);
}

/**
 * Extract all Instagram URLs from text
 */
export function extractInstagramUrlsFromText(text: string): string[] {
  const urlRegex = /https?:\/\/(www\.)?(instagram\.com|instagr\.am)\/[^\s]+/g;
  const matches = text.match(urlRegex);
  return matches || [];
}
