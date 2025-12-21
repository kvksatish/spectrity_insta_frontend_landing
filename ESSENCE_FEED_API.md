# Essence Feed API - Response Documentation

## API Endpoint
```
GET /api/v1/posts/essence-feed
```

## Query Parameters
- `page` - Page number (default: 1)
- `limit` - Number of posts per page (default: 10)
- `sortBy` - Sort field (default: created_at)
- `sortOrder` - Sort order: desc/asc (default: desc)

## Example Request
```bash
curl -X GET "http://localhost:3005/api/v1/posts/essence-feed?page=1&limit=10&sortBy=created_at&sortOrder=desc" \
  -H "accept: application/json" \
  -H "Authorization: Bearer <token>"
```

## Response Structure

### Success Response
```json
{
  "success": true,
  "data": [
    {
      "id": "3792540629088140031",
      "short_code": "DShz5vBCPr_",
      "input_url": "https://www.instagram.com/p/DShz5vBCPr_/",
      "post_type": "IMAGE",
      "caption": "Google led global web traffic...",
      "alt_text": "Photo by VALUETAINMENT...",
      "media_items": [
        {
          "url": "https://scontent-lga3-1.cdninstagram.com/...",
          "type": "image",
          "thumbnail_url": "https://..."
        }
      ],
      "owner_id": "3918488862",
      "owner_username": "valuetainment",
      "owner_full_name": "VALUETAINMENT",
      "like_count": 204,
      "comments_count": 6,
      "video_view_count": null,
      "timestamp": "2025-12-21T14:08:26.000Z",
      "is_sponsored": false,
      "music_info": null,

      // AI-Generated Content
      "has_summary": true,
      "summary_status": "COMPLETED",
      "combined_summary": "In July, Google dominated global web traffic...",
      "ai_visual_analysis": "**Mode 1 — Crisp Essence:**...\n\n**Mode 2 — Long Essence:**...",
      "ai_key_moments": null,
      "ai_objects_detected": null,
      "ai_actions": null,

      // Metadata
      "scrape_quality": "HD",
      "urls_valid_until": "2025-12-22T18:00:42.590Z",
      "created_at": "2025-12-21T18:00:43.074Z",
      "updated_at": "2025-12-21T18:01:06.967Z"
    }
  ]
}
```

## Key Fields Explained

### Post Metadata
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Instagram post ID |
| `short_code` | string | Instagram short code (e.g., DShz5vBCPr_) |
| `input_url` | string | Original Instagram URL |
| `post_type` | string | POST type: IMAGE, VIDEO, CAROUSEL, REEL |

### Owner Information
| Field | Type | Description |
|-------|------|-------------|
| `owner_id` | string | Instagram user ID |
| `owner_username` | string | Username (e.g., valuetainment) |
| `owner_full_name` | string | Full display name |

### Content
| Field | Type | Description |
|-------|------|-------------|
| `caption` | string | Post caption text |
| `alt_text` | string | Accessibility description |
| `media_items` | array | Array of media (images/videos) |

### Engagement Metrics
| Field | Type | Description |
|-------|------|-------------|
| `like_count` | number | Number of likes (-1 if hidden) |
| `comments_count` | number | Number of comments |
| `video_view_count` | number\|null | Video views (null for images) |

### AI-Generated Insights ✨
| Field | Type | Description |
|-------|------|-------------|
| `has_summary` | boolean | Whether AI summary is available |
| `summary_status` | string | PENDING, PROCESSING, COMPLETED, FAILED |
| `combined_summary` | string | **AI-generated summary of the post** |
| `ai_visual_analysis` | string | **AI analysis in two modes: Crisp & Long** |
| `ai_key_moments` | string\|null | Key moments (for videos) |
| `ai_objects_detected` | string\|null | Detected objects |
| `ai_actions` | string\|null | Detected actions |

### Other Metadata
| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | string | Post creation timestamp (ISO 8601) |
| `scrape_quality` | string | HD, SD, etc. |
| `urls_valid_until` | string | Media URL expiration time |
| `created_at` | string | When scraped in our DB |
| `updated_at` | string | Last update in our DB |

## AI Visual Analysis Format

The `ai_visual_analysis` field contains two modes of analysis:

### Mode 1 — Crisp Essence
A concise, impactful interpretation capturing the core message and emotional resonance.

**Example:**
```
This image captures the dominance of digital platforms in our lives,
illustrating how the internet shapes our connections and consumption.
It evokes a sense of awe at the sheer scale of engagement, while also
hinting at the power dynamics within the digital landscape.
```

### Mode 2 — Long Essence
A detailed, nuanced analysis exploring cultural, symbolic, and emotional layers.

**Example:**
```
The graphic presents a striking portrayal of the most visited websites
in the U.S. for July 2025, revealing an intricate web of digital influence
that permeates our daily lives. At the center, Google stands as a colossal
figure, symbolizing not just a search engine but an omnipresent force that
shapes knowledge, culture, and our very understanding of the world...
```

## Sample Posts from Feed

### Post 1: Tech & Web Traffic
- **Username**: @valuetainment
- **Type**: IMAGE
- **Likes**: 204
- **AI Summary**: "Google dominated global web traffic with 16.2 billion visits, nearly tripling YouTube's numbers..."

### Post 2: Wealth Inequality
- **Username**: @groww_official
- **Type**: IMAGE
- **Likes**: 1,227
- **AI Summary**: "U.S. billionaires possess more wealth than the combined billionaire populations of the next ten countries..."

### Post 3: IPO History
- **Username**: @ceosofbharat
- **Type**: IMAGE
- **AI Summary**: "Landmark IPOs that have reshaped global markets and exemplified investor confidence..."

### Post 4: Google's Venture Portfolio
- **Username**: @hedgefundinvestor
- **Type**: IMAGE
- **Likes**: 589
- **AI Summary**: "Google's quiet dominance through strategic venture investments in Waymo, Anthropic, SpaceX..."

### Post 5: Optimism vs Pessimism
- **Username**: @entrepreneursonig
- **Type**: IMAGE
- **Likes**: 2,214
- **AI Summary**: "Optimism drives innovation and action, while pessimism focuses on risks..."

### Post 6: Gemini vs ChatGPT
- **Username**: @carbonfinance
- **Type**: IMAGE
- **Likes**: 2,645
- **AI Summary**: "Google's Gemini chatbot is outpacing ChatGPT in download growth and user engagement..."

## Frontend Integration Plan

### 1. Create API Client Function
```typescript
// src/api/posts.api.ts

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
  owner_username: string;
  owner_full_name: string;
  like_count: number;
  comments_count: number;
  timestamp: string;
  has_summary: boolean;
  summary_status: string;
  combined_summary?: string;
  ai_visual_analysis?: string;
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
}

export const getEssenceFeed = async (
  page: number = 1,
  limit: number = 10
): Promise<EssenceFeedResponse> => {
  const response = await client.get<EssenceFeedResponse>(
    `/v1/posts/essence-feed?page=${page}&limit=${limit}&sortBy=created_at&sortOrder=desc`
  );
  return response.data;
};
```

### 2. Transform to Instagram Post Format
```typescript
const transformEssencePost = (post: EssenceFeedPost) => ({
  id: post.id,
  username: post.owner_username,
  userAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${post.owner_username}`,
  postImage: post.media_items[0]?.url,
  caption: post.caption,
  likes: post.like_count,
  comments: post.comments_count,
  timestamp: formatTimestamp(post.timestamp),
  isLiked: false,
  isSaved: false,
  aiSummary: post.combined_summary,
  aiAnalysis: post.ai_visual_analysis,
});
```

### 3. Update Dashboard Page
```typescript
// src/app/dashboard/page.tsx

export default function DashboardPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadEssenceFeed();
  }, [page]);

  const loadEssenceFeed = async () => {
    setLoading(true);
    try {
      const response = await getEssenceFeed(page, 10);
      const transformedPosts = response.data.map(transformEssencePost);
      setPosts(transformedPosts);
    } catch (error) {
      console.error('Failed to load essence feed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container max-w-2xl mx-auto px-0 md:px-4">
        {loading ? (
          <LoadingSpinner />
        ) : (
          posts.map((post) => (
            <InstagramPost key={post.id} {...post} />
          ))
        )}
      </div>
    </ProtectedRoute>
  );
}
```

## Key Features to Implement

1. **AI Summary Display** - Show combined_summary in expandable section
2. **AI Analysis Toggle** - Mode 1 (Crisp) vs Mode 2 (Long) toggle
3. **Infinite Scroll** - Load more posts as user scrolls
4. **Pull to Refresh** - Refresh feed on pull down
5. **Post Type Badges** - Show IMAGE/VIDEO/REEL badges
6. **Timestamp Formatting** - "2 hours ago", "Yesterday", etc.
7. **Error Handling** - Graceful fallbacks for missing data
8. **Loading States** - Skeleton loaders while fetching

## Error Handling

Same error structure as scraping API:
```json
{
  "success": false,
  "error": {
    "code": "AUTH_ERROR",
    "message": "Invalid or expired token",
    "statusCode": 401
  }
}
```

## Notes

- Media URLs expire after 24-48 hours (check `urls_valid_until`)
- `like_count` of -1 means likes are hidden by the poster
- `summary_status` of PENDING means AI is still processing
- All posts include AI-generated content when `has_summary: true`
