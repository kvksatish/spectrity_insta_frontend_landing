# Posts Feed Feature - Complete Documentation

## 📋 Overview

The Posts Feed is a comprehensive Instagram posts viewing interface with AI-powered insights. It displays posts with AI-generated summaries prominently, followed by collapsible post details.

---

## 🎯 Features

### 1. **AI Summary First Approach**
- ✅ AI-generated summaries displayed **first and expanded** by default
- ✅ Combined summary with visual analysis
- ✅ Prominent display with gradient background
- ✅ Post metadata (username, type, date, engagement)

### 2. **Collapsible Post Details**
- ✅ Post details in an **accordion/dropdown** below the summary
- ✅ Media gallery with images
- ✅ Full caption text
- ✅ Engagement stats (likes, comments, views)
- ✅ Quality badges and metadata
- ✅ Direct link to Instagram post

### 3. **Advanced Filtering**
- ✅ **Search**: Caption and username search
- ✅ **Sorting**: 6 sort options (date, likes, comments, views, etc.)
- ✅ **Content Type**: IMAGE, VIDEO, CAROUSEL, REEL
- ✅ **AI Summary**: Filter by presence and status
- ✅ **Quality**: HD, SD, FAILED
- ✅ **Sponsored**: Filter sponsored/organic posts
- ✅ **Engagement Range**: Min/max likes, comments, views
- ✅ **Username**: Filter by Instagram username

### 4. **Pagination**
- ✅ Page navigation with previous/next buttons
- ✅ Page number selection
- ✅ Results count and page info
- ✅ Automatic scroll to top on page change

---

## 📁 File Structure

```
src/
├── api/
│   └── posts.ts                        # API client and TypeScript types
├── components/
│   ├── posts/
│   │   ├── PostsFeed.tsx               # Main feed component
│   │   ├── AISummaryCard.tsx           # AI summary display (top)
│   │   ├── PostDetailsAccordion.tsx    # Collapsible post details
│   │   └── PostsFilters.tsx            # Filter sidebar
│   └── ui/
│       └── alert.tsx                   # Alert component
└── app/
    └── posts/
        └── page.tsx                    # Posts page route
```

---

## 🔧 Components

### 1. **PostsFeed** (`src/components/posts/PostsFeed.tsx`)

**Main orchestrator component that:**
- Manages filters state
- Fetches posts from API
- Handles pagination
- Displays loading/error/empty states
- Renders AI summaries and post details

**State:**
```typescript
const [posts, setPosts] = useState<Post[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [filters, setFilters] = useState<GetPostsQuery>({
  page: 1,
  limit: 10,
  sortBy: "created_at",
  sortOrder: "desc",
});
```

**Layout:**
```
┌─────────────────────────────────────────┐
│  Filters Sidebar  │  Main Feed          │
│  (1 col)          │  (3 cols)           │
│                   │                     │
│  - Search         │  - Loading/Error    │
│  - Sort           │  - Posts List       │
│  - Filters        │  - Pagination       │
└─────────────────────────────────────────┘
```

---

### 2. **AISummaryCard** (`src/components/posts/AISummaryCard.tsx`)

**Displays AI-generated summary prominently:**

**Features:**
- ✨ Gradient background (primary/5)
- ✨ Sparkles icon header
- ✨ Summary status badge
- ✨ Combined summary text
- ✨ Visual analysis section (if available)
- ✨ Post metadata footer

**Visual:**
```
┌────────────────────────────────────┐
│ ✨ AI Summary         [COMPLETED] │
│ Generated insights                 │
│                                    │
│ [AI-generated summary text...]     │
│                                    │
│ ─────────────────────────────────  │
│ 🧠 Visual Analysis                 │
│ [Visual analysis text...]          │
│                                    │
│ ─────────────────────────────────  │
│ @username • IMAGE • Dec 20, 2025   │
│ • 1,227 likes                      │
└────────────────────────────────────┘
```

---

### 3. **PostDetailsAccordion** (`src/components/posts/PostDetailsAccordion.tsx`)

**Collapsible post details:**

**Header (Always Visible):**
- User avatar circle
- Full name and username
- Post type badge
- Chevron icon (indicates expanded/collapsed)

**Content (Collapsible):**
- Media gallery (images/videos)
- Full caption
- Engagement stats (likes, comments, views)
- Quality badges
- "View on Instagram" button

**Collapsed:**
```
┌────────────────────────────────────┐
│ [A] John Doe          [IMAGE]  ▼  │
│     @johndoe                       │
└────────────────────────────────────┘
```

**Expanded:**
```
┌────────────────────────────────────┐
│ [A] John Doe          [IMAGE]  ▲  │
│     @johndoe                       │
├────────────────────────────────────┤
│ [Post Image]                       │
│                                    │
│ Caption:                           │
│ Amazing sunset at the beach! 🌅   │
│                                    │
│ ❤️ 1,234    💬 56    👁️ —         │
│                                    │
│ [Quality: HD] [AI Analyzed]       │
│                                    │
│ [View on Instagram →]              │
└────────────────────────────────────┘
```

---

### 4. **PostsFilters** (`src/components/posts/PostsFilters.tsx`)

**Comprehensive filter sidebar:**

**Sections:**
1. **Search** - Text input for caption/username
2. **Sorting** - Sort by + order dropdowns
3. **Content Type** - Post type selector
4. **AI Summary** - Has summary + status
5. **Quality & Sponsored** - Quality level + sponsored filter
6. **Engagement Range** - Min/max likes, comments
7. **Username** - Instagram username filter

**Features:**
- Active filter count badge
- Reset all button
- Real-time filter updates

---

## 🔌 API Integration

### **API Client** (`src/api/posts.ts`)

**TypeScript Types:**
```typescript
export type PostType = "IMAGE" | "VIDEO" | "CAROUSEL" | "REEL";
export type SummaryStatus = "NONE" | "GENERATING" | "COMPLETED" | "FAILED";
export type ScrapeQuality = "HD" | "SD" | "FAILED";
export type SortBy = "created_at" | "updated_at" | "timestamp" |
                     "like_count" | "comments_count" | "video_view_count";
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
```

**API Function:**
```typescript
export async function getPosts(
  query: GetPostsQuery = {}
): Promise<GetPostsResponse> {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });

  const response = await apiClient.get<GetPostsResponse>(
    `/posts?${params.toString()}`
  );
  return response.data;
}
```

---

## 🚀 Usage

### **Accessing the Posts Feed**

**Route:** `/posts`

**Authentication:** Required (JWT Bearer token)

**Navigation:**
```typescript
// From any component
import { useRouter } from 'next/navigation';

const router = useRouter();
router.push('/posts');
```

---

### **Example User Flow**

1. **User logs in** → Dashboard
2. **Navigates to `/posts`**
3. **Sees posts feed** with AI summaries first
4. **Can filter by:**
   - Post type (Images only)
   - Has AI summary (true)
   - Min likes (1000)
5. **Clicks post accordion** to see full details
6. **Views media and engagement stats**
7. **Clicks "View on Instagram"** to open original post

---

## 📊 Data Flow

```
User Interaction
     ↓
Filter Update
     ↓
Query Parameters
     ↓
API Request (GET /api/v1/posts?...)
     ↓
Backend Processing
     ↓
JSON Response
     ↓
Posts State Update
     ↓
UI Re-render
     ↓
Display Results
```

---

## 🎨 Design Patterns

### **1. AI Summary First**
```
┌─────────────────────────────────┐
│ ✨ AI Summary (Expanded)        │ ← Always visible
│ [Summary text...]               │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│ 🔽 Post Details (Collapsed)     │ ← Click to expand
└─────────────────────────────────┘
```

### **2. Progressive Disclosure**
- Show AI summary immediately (high value)
- Hide detailed post info in accordion (on-demand)
- User can expand if they want more details

### **3. Filter-First Approach**
- Filters in sticky sidebar (desktop)
- Always accessible
- Real-time updates

---

## 🔐 Authentication

**Posts feed requires authentication:**

```typescript
export default function PostsPage() {
  return (
    <ProtectedRoute>
      <PostsFeed />
    </ProtectedRoute>
  );
}
```

**API calls automatically include JWT:**
```typescript
// From src/api/client.ts
const response = await apiClient.get('/posts');
// Automatically adds: Authorization: Bearer <token>
```

---

## 🎯 Filter Examples

### **Example 1: High-Engagement Images**
```typescript
{
  post_type: "IMAGE",
  min_likes: 1000,
  sortBy: "like_count",
  sortOrder: "desc"
}
```

### **Example 2: Posts with AI Summaries**
```typescript
{
  has_summary: "true",
  summary_status: "COMPLETED",
  sortBy: "created_at",
  sortOrder: "desc"
}
```

### **Example 3: Specific User's Reels**
```typescript
{
  owner_username: "nike",
  post_type: "REEL",
  sortBy: "timestamp",
  sortOrder: "desc"
}
```

---

## ⚡ Performance Considerations

### **1. Pagination**
- Default: 10 posts per page
- Max: 100 posts per page
- Prevents overloading UI

### **2. Image Optimization**
- Using Next.js `<Image>` component
- `unoptimized` for CDN URLs
- Lazy loading images

### **3. State Management**
- Filters stored in component state
- API calls only on filter change
- Debouncing not needed (manual filter changes)

---

## 🐛 Error Handling

### **API Errors**
```typescript
try {
  const response = await getPosts(filters);
  setPosts(response.data);
} catch (err: any) {
  setError(
    err.response?.data?.message ||
    err.message ||
    "Failed to fetch posts. Please try again."
  );
}
```

**Error Display:**
```
┌─────────────────────────────────┐
│ ⚠️ Failed to fetch posts.       │
│    Please try again.            │
└─────────────────────────────────┘
```

### **Empty States**
```
┌─────────────────────────────────┐
│ No posts found matching your    │
│ filters.                        │
│                                 │
│ [Reset Filters]                 │
└─────────────────────────────────┘
```

---

## 📱 Responsive Design

### **Desktop (lg+)**
```
┌────────┬─────────────────┐
│Filters │ Posts Feed      │
│(Sticky)│ - Summary       │
│        │ - Details       │
│        │ - Pagination    │
└────────┴─────────────────┘
```

### **Mobile (<lg)**
```
┌─────────────────┐
│ Filters         │
│ (Full Width)    │
├─────────────────┤
│ Posts Feed      │
│ - Summary       │
│ - Details       │
│ - Pagination    │
└─────────────────┘
```

---

## 🔮 Future Enhancements

### **Planned Features:**
1. ✨ Date range picker for `from_date` / `to_date`
2. ✨ Video playback in post details
3. ✨ Carousel media navigation
4. ✨ Export filtered posts to CSV/JSON
5. ✨ Bookmark/save favorite posts
6. ✨ Share AI summaries
7. ✨ Bulk actions (hide, delete, etc.)

---

## 📚 Related Documentation

- **API Enums:** `posts_api_enums.md`
- **Authentication:** `FRONTEND_AUTH_API_GUIDE.md`
- **PWA Setup:** `PWA_SETUP.md`
- **Horizontal Overflow Fix:** `HORIZONTAL_OVERFLOW_FIX.md`

---

## 🎓 Testing

### **Manual Testing Checklist:**

**✅ Filters:**
- [ ] Search works (caption/username)
- [ ] Sort by each field (created_at, likes, comments, etc.)
- [ ] Sort order (asc/desc) works
- [ ] Post type filter works
- [ ] AI summary filter works
- [ ] Quality filter works
- [ ] Engagement range filters work
- [ ] Username filter works
- [ ] Reset filters works

**✅ Display:**
- [ ] AI summary shown first
- [ ] Post details collapsible
- [ ] Media images load
- [ ] Engagement stats correct
- [ ] Instagram link works

**✅ Pagination:**
- [ ] Next/Previous buttons work
- [ ] Page numbers work
- [ ] Scroll to top on page change
- [ ] Results count accurate

**✅ States:**
- [ ] Loading state shows
- [ ] Error state shows
- [ ] Empty state shows
- [ ] Filters persist during pagination

---

## 🚀 Quick Start

**1. Start the dev server:**
```bash
npm run dev
```

**2. Login with credentials:**
```
Email: satish@kvatron.com
Password: TestPassword123!
```

**3. Navigate to:**
```
http://localhost:3000/posts
```

**4. Test filters:**
- Try filtering by "AI Summary: With Summary"
- Sort by "Likes" descending
- Search for a username

---

**Last Updated:** 2025-12-21
**Version:** 1.0.0
**Status:** ✅ Fully Implemented
