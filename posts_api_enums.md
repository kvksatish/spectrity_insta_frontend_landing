# GET /posts API - All Filter Enums & Options

**Endpoint:** `GET /api/v1/posts`
**Authentication:** Required (JWT Bearer token)

---

## 📊 **All Available Enums**

### **1. sortBy (Sort Field)**

```typescript
enum SortBy {
  'created_at'        // When post was added to database
  'updated_at'        // Last update timestamp
  'timestamp'         // Post creation time on Instagram
  'like_count'        // Number of likes
  'comments_count'    // Number of comments
  'video_view_count'  // Video views (for videos/reels)
}

Default: 'created_at'
```

**Example:**

```bash
?sortBy=like_count
?sortBy=timestamp
```

---

### **2. sortOrder (Sort Direction)**

```typescript
enum SortOrder {
  'asc'   // Ascending (oldest/lowest first)
  'desc'  // Descending (newest/highest first)
}

Default: 'desc'
```

**Example:**

```bash
?sortOrder=asc
?sortOrder=desc
```

---

### **3. post_type (Instagram Content Type)**

```typescript
enum PostType {
  'IMAGE'     // Single image post
  'VIDEO'     // Single video post
  'CAROUSEL'  // Multiple images/videos (swipeable)
  'REEL'      // Short-form video (Instagram Reels)
}
```

**Example:**

```bash
?post_type=IMAGE
?post_type=REEL
?post_type=CAROUSEL
```

---

### **4. summary_status (AI Processing Status)**

```typescript
enum SummaryStatus {
  'NONE'        // No AI summary requested
  'GENERATING'  // AI summary in progress
  'COMPLETED'   // AI summary finished
  'FAILED'      // AI summary generation failed
}
```

**Example:**

```bash
?summary_status=COMPLETED
?summary_status=GENERATING
```

---

### **5. scrape_quality (Media Quality)**

```typescript
enum ScrapeQuality {
  'HD'      // High definition media
  'SD'      // Standard definition media
  'FAILED'  // Scraping failed
}
```

**Example:**

```bash
?scrape_quality=HD
?scrape_quality=SD
```

---

### **6. has_summary (Boolean as String)**

```typescript
enum HasSummary {
  'true'   // Posts with AI summary
  'false'  // Posts without AI summary
}

Note: Must be string 'true' or 'false', not boolean
```

**Example:**

```bash
?has_summary=true
?has_summary=false
```

---

### **7. is_sponsored (Boolean as String)**

```typescript
enum IsSponsored {
  'true'   // Sponsored/promoted posts
  'false'  // Organic posts
}
```

**Example:**

```bash
?is_sponsored=true
?is_sponsored=false
```

---

### **8. is_hidden (Boolean as String)**

```typescript
enum IsHidden {
  'true'   // Hidden posts
  'false'  // Visible posts
}
```

**Example:**

```bash
?is_hidden=false
```

---

### **9. is_deleted_by_meta (Boolean as String)**

```typescript
enum IsDeletedByMeta {
  'true'   // Posts deleted by Instagram/Meta
  'false'  // Active posts
}
```

**Example:**

```bash
?is_deleted_by_meta=false
```

---

## 📋 **Complete Filter Reference**

### **Pagination**

| Parameter | Type   | Min | Max | Default | Description      |
| --------- | ------ | --- | --- | ------- | ---------------- |
| `page`    | number | 1   | ∞   | 1       | Page number      |
| `limit`   | number | 1   | 100 | 10      | Results per page |

**Example:**

```bash
?page=2&limit=20
```

---

### **Sorting**

| Parameter   | Type | Enum Values                                                                     | Default    | Description      |
| ----------- | ---- | ------------------------------------------------------------------------------- | ---------- | ---------------- |
| `sortBy`    | enum | created_at, updated_at, timestamp, like_count, comments_count, video_view_count | created_at | Field to sort by |
| `sortOrder` | enum | asc, desc                                                                       | desc       | Sort direction   |

**Example:**

```bash
?sortBy=like_count&sortOrder=desc
```

---

### **Content Type Filters**

| Parameter   | Type   | Enum Values                  | Description                      |
| ----------- | ------ | ---------------------------- | -------------------------------- |
| `post_type` | enum   | IMAGE, VIDEO, CAROUSEL, REEL | Filter by Instagram content type |
| `type`      | string | (any string)                 | Filter by custom type            |

**Example:**

```bash
?post_type=REEL
```

---

### **Owner Filters**

| Parameter        | Type   | Description                                 |
| ---------------- | ------ | ------------------------------------------- |
| `owner_username` | string | Filter by Instagram username (e.g., "nike") |
| `owner_id`       | string | Filter by Instagram user ID                 |
| `short_code`     | string | Get specific post by Instagram short code   |

**Example:**

```bash
?owner_username=nike
?short_code=DD0nzyDSsHK
```

---

### **AI/Summary Filters**

| Parameter        | Type | Enum Values                         | Description                   |
| ---------------- | ---- | ----------------------------------- | ----------------------------- |
| `has_summary`    | enum | true, false                         | Posts with/without AI summary |
| `summary_status` | enum | NONE, GENERATING, COMPLETED, FAILED | AI processing status          |

**Example:**

```bash
?has_summary=true&summary_status=COMPLETED
```

---

### **Quality Filter**

| Parameter        | Type | Enum Values    | Description         |
| ---------------- | ---- | -------------- | ------------------- |
| `scrape_quality` | enum | HD, SD, FAILED | Media quality level |

**Example:**

```bash
?scrape_quality=HD
```

---

### **Boolean Filters**

| Parameter            | Type | Enum Values | Description                |
| -------------------- | ---- | ----------- | -------------------------- |
| `is_sponsored`       | enum | true, false | Sponsored posts            |
| `is_hidden`          | enum | true, false | Hidden posts               |
| `is_deleted_by_meta` | enum | true, false | Posts deleted by Instagram |

**Example:**

```bash
?is_sponsored=false&is_hidden=false&is_deleted_by_meta=false
```

---

### **Engagement Range Filters**

| Parameter      | Type   | Min | Description           |
| -------------- | ------ | --- | --------------------- |
| `min_likes`    | number | 0   | Minimum like count    |
| `max_likes`    | number | 0   | Maximum like count    |
| `min_comments` | number | 0   | Minimum comment count |
| `max_comments` | number | 0   | Maximum comment count |
| `min_views`    | number | 0   | Minimum video views   |
| `max_views`    | number | 0   | Maximum video views   |

**Example:**

```bash
?min_likes=1000&max_likes=50000
?min_views=10000
```

---

### **Date Range Filters**

| Parameter   | Type   | Format   | Description            |
| ----------- | ------ | -------- | ---------------------- |
| `from_date` | string | ISO 8601 | Posts after this date  |
| `to_date`   | string | ISO 8601 | Posts before this date |

**ISO 8601 Format:** `YYYY-MM-DDTHH:mm:ss.sssZ`

**Example:**

```bash
?from_date=2025-12-01T00:00:00Z&to_date=2025-12-21T23:59:59Z
```

---

### **Search Filter**

| Parameter | Type   | Description                                             |
| --------- | ------ | ------------------------------------------------------- |
| `search`  | string | Search in caption and owner username (case-insensitive) |

**Example:**

```bash
?search=christmas
?search=nike
```

---

## 🔥 **Real-World Examples**

### **Example 1: Top Performing Reels**

```bash
GET /api/v1/posts?post_type=REEL&min_views=100000&sortBy=video_view_count&sortOrder=desc&limit=20
```

### **Example 2: Recent High-Engagement Images**

```bash
GET /api/v1/posts?post_type=IMAGE&min_likes=1000&from_date=2025-12-15T00:00:00Z&sortBy=like_count&sortOrder=desc
```

### **Example 3: Posts with AI Summaries**

```bash
GET /api/v1/posts?has_summary=true&summary_status=COMPLETED&limit=50
```

### **Example 4: Specific User's Content**

```bash
GET /api/v1/posts?owner_username=nike&post_type=CAROUSEL&sortBy=timestamp&sortOrder=desc
```

### **Example 5: Quality Content Search**

```bash
GET /api/v1/posts?scrape_quality=HD&min_likes=500&is_sponsored=false&limit=25
```

### **Example 6: Recent Viral Posts**

```bash
GET /api/v1/posts?min_likes=10000&min_comments=500&from_date=2025-12-20T00:00:00Z&sortBy=like_count&sortOrder=desc
```

### **Example 7: Text Search**

```bash
GET /api/v1/posts?search=holiday&post_type=IMAGE&min_likes=100
```

### **Example 8: Date Range with Engagement**

```bash
GET /api/v1/posts?from_date=2025-12-01T00:00:00Z&to_date=2025-12-21T23:59:59Z&min_likes=1000&post_type=REEL
```

---

## 🔒 **Important Notes**

### **Boolean Values**

All boolean filters must be passed as **strings** `"true"` or `"false"`:

- ✅ Correct: `?has_summary=true`
- ❌ Wrong: `?has_summary=1` or `?has_summary=True`

### **Date Format**

Dates must be in **ISO 8601** format:

- ✅ Correct: `?from_date=2025-12-21T10:00:00Z`
- ❌ Wrong: `?from_date=2025-12-21` or `?from_date=12/21/2025`

### **Enum Values**

Enum values are **case-sensitive**:

- ✅ Correct: `?post_type=IMAGE`
- ❌ Wrong: `?post_type=image` or `?post_type=Image`

### **Authentication**

All requests require JWT authentication:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3005/api/v1/posts?page=1&limit=10"
```

---

## 📝 **TypeScript Types**

```typescript
// Query parameters interface
interface GetPostsQuery {
  // Pagination
  page?: number; // 1-∞, default: 1
  limit?: number; // 1-100, default: 10

  // Sorting
  sortBy?:
    | "created_at"
    | "updated_at"
    | "timestamp"
    | "like_count"
    | "comments_count"
    | "video_view_count";
  sortOrder?: "asc" | "desc";

  // Content filters
  post_type?: "IMAGE" | "VIDEO" | "CAROUSEL" | "REEL";
  type?: string;

  // Owner filters
  owner_username?: string;
  owner_id?: string;
  short_code?: string;

  // AI filters
  has_summary?: "true" | "false";
  summary_status?: "NONE" | "GENERATING" | "COMPLETED" | "FAILED";

  // Boolean filters
  is_sponsored?: "true" | "false";
  is_hidden?: "true" | "false";
  is_deleted_by_meta?: "true" | "false";

  // Quality
  scrape_quality?: "HD" | "SD" | "FAILED";

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

---

## 🎯 **Quick Reference Table**

| Filter Type      | Parameters                                  | Enum/Type                                    |
| ---------------- | ------------------------------------------- | -------------------------------------------- |
| **Pagination**   | page, limit                                 | number                                       |
| **Sorting**      | sortBy, sortOrder                           | enum                                         |
| **Content Type** | post_type                                   | IMAGE, VIDEO, CAROUSEL, REEL                 |
| **Owner**        | owner_username, owner_id                    | string                                       |
| **AI Summary**   | has_summary, summary_status                 | true/false, NONE/GENERATING/COMPLETED/FAILED |
| **Quality**      | scrape_quality                              | HD, SD, FAILED                               |
| **Booleans**     | is_sponsored, is_hidden, is_deleted_by_meta | true, false                                  |
| **Engagement**   | min/max likes/comments/views                | number                                       |
| **Date Range**   | from_date, to_date                          | ISO 8601 string                              |
| **Search**       | search                                      | string                                       |

---

**Last Updated:** 2025-12-21
**API Version:** v1
**Base URL:** `http://localhost:3005/api/v1`
