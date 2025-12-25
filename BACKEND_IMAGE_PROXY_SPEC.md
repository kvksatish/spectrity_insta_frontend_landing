# Backend Image Proxy Specification

**Issue:** Instagram CDN images are blocked by CORS when loaded directly in the browser
**Solution:** Backend must proxy images through its own domain
**Priority:** HIGH - Share feature is non-functional without this

---

## Problem Summary

### Current Behavior (Broken)
1. Backend scrapes Instagram post and returns CDN URL:
   ```
   https://scontent-phx1-1.cdninstagram.com/v/t51.2885-15/590285380_18030454178751439_8288881115197549330_n.jpg?...
   ```

2. Frontend tries to display image:
   ```html
   <img src="https://scontent-phx1-1.cdninstagram.com/..." />
   ```

3. Browser blocks with CORS error:
   ```
   ERR_BLOCKED_BY_RESPONSE.NotSameOrigin
   ```

4. **Result:** User sees post data (username, caption, likes) but NO IMAGE ❌

### Why This Happens
- Instagram's CDN has strict CORS policies
- Browser blocks cross-origin image requests from `cdninstagram.com`
- Server-side requests work fine (no CORS enforcement)
- Frontend cannot load images directly

---

## Solution: Image Proxy Endpoint

### Endpoint Specification

**URL:** `GET /api/v1/media-proxy`
**Authentication:** Not required (public endpoint)
**Rate Limiting:** Recommended (prevent abuse)

### Request Parameters

| Parameter | Type   | Required | Description                          |
|-----------|--------|----------|--------------------------------------|
| `url`     | string | Yes      | Encoded Instagram CDN URL to proxy   |

**Example Request:**
```
GET /api/v1/media-proxy?url=https%3A%2F%2Fscontent-phx1-1.cdninstagram.com%2Fv%2Ft51.2885-15%2F590285380_18030454178751439_8288881115197549330_n.jpg%3F...
```

### Response

**Success (200 OK):**
```
Content-Type: image/jpeg (or image/png, etc.)
Cache-Control: public, max-age=86400
Access-Control-Allow-Origin: *
Content-Length: <size>

[Binary image data]
```

**Error Responses:**

**400 Bad Request:**
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Invalid or missing URL parameter"
}
```

**403 Forbidden:**
```json
{
  "statusCode": 403,
  "error": "Forbidden",
  "message": "URL must be from Instagram CDN (cdninstagram.com)"
}
```

**500 Internal Server Error:**
```json
{
  "statusCode": 500,
  "error": "Internal Server Error",
  "message": "Failed to fetch image from Instagram"
}
```

---

## Implementation Requirements

### 1. Security Validations

**CRITICAL:** Validate URLs to prevent proxy abuse

```javascript
// Only allow Instagram CDN URLs
const isValidInstagramUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.hostname.includes('cdninstagram.com');
  } catch {
    return false;
  }
};

if (!isValidInstagramUrl(url)) {
  return res.status(403).json({
    error: 'Forbidden',
    message: 'URL must be from Instagram CDN'
  });
}
```

### 2. Caching Strategy

**Recommended:** Cache images to reduce Instagram API load

- **In-memory cache** for frequently accessed images
- **TTL:** 24 hours (Instagram URLs expire)
- **Storage:** Optional - save to S3/CloudStorage for longer retention

**Example with Node.js:**
```javascript
const NodeCache = require('node-cache');
const imageCache = new NodeCache({
  stdTTL: 86400, // 24 hours
  checkperiod: 3600 // Check for expired keys every hour
});

// Check cache first
const cached = imageCache.get(url);
if (cached) {
  res.set('Content-Type', cached.contentType);
  res.set('X-Cache', 'HIT');
  return res.send(cached.buffer);
}
```

### 3. Error Handling

- **Timeout:** Set 30-second timeout for Instagram requests
- **Retry Logic:** Retry once if Instagram request fails
- **Fallback:** Return placeholder image on repeated failures (optional)

### 4. Headers to Set

```javascript
res.set({
  'Content-Type': instagramResponse.headers.get('content-type'),
  'Cache-Control': 'public, max-age=86400',
  'Access-Control-Allow-Origin': '*',
  'X-Content-Type-Options': 'nosniff',
});
```

---

## Example Implementation (Node.js/Express)

```javascript
const express = require('express');
const fetch = require('node-fetch');
const NodeCache = require('node-cache');

const app = express();
const imageCache = new NodeCache({ stdTTL: 86400 });

app.get('/api/v1/media-proxy', async (req, res) => {
  const { url } = req.query;

  // Validate URL parameter
  if (!url) {
    return res.status(400).json({
      statusCode: 400,
      error: 'Bad Request',
      message: 'URL parameter is required'
    });
  }

  // Validate it's an Instagram URL
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('cdninstagram.com')) {
      return res.status(403).json({
        statusCode: 403,
        error: 'Forbidden',
        message: 'URL must be from Instagram CDN (cdninstagram.com)'
      });
    }
  } catch (error) {
    return res.status(400).json({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Invalid URL format'
    });
  }

  // Check cache
  const cached = imageCache.get(url);
  if (cached) {
    res.set('Content-Type', cached.contentType);
    res.set('Cache-Control', 'public, max-age=86400');
    res.set('Access-Control-Allow-Origin', '*');
    res.set('X-Cache', 'HIT');
    return res.send(cached.buffer);
  }

  // Fetch from Instagram
  try {
    const response = await fetch(url, {
      timeout: 30000, // 30 second timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Instagram CDN returned ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    const buffer = await response.buffer();

    // Cache the image
    imageCache.set(url, { buffer, contentType });

    // Return image
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=86400');
    res.set('Access-Control-Allow-Origin', '*');
    res.set('X-Cache', 'MISS');
    res.send(buffer);

  } catch (error) {
    console.error('[MEDIA-PROXY] Error:', error.message);
    res.status(500).json({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Failed to fetch image from Instagram'
    });
  }
});

module.exports = app;
```

---

## Integration with Scrape Endpoint

### Option A: Return Proxied URLs (RECOMMENDED)

**Update `/api/v1/posts/scrape` response:**

```javascript
// After scraping Instagram post
const scrapedData = {
  mediaItems: post.mediaItems.map(item => ({
    url: `https://spectrity.com/api/v1/media-proxy?url=${encodeURIComponent(item.url)}`,
    originalUrl: item.url, // Keep original for reference
    type: item.type,
    thumbnail_url: item.thumbnail_url
      ? `https://spectrity.com/api/v1/media-proxy?url=${encodeURIComponent(item.thumbnail_url)}`
      : null
  })),
  ownerProfilePicUrl: post.ownerProfilePicUrl
    ? `https://spectrity.com/api/v1/media-proxy?url=${encodeURIComponent(post.ownerProfilePicUrl)}`
    : null,
  // ... rest of the fields
};
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "mediaItems": [{
      "url": "https://spectrity.com/api/v1/media-proxy?url=https%3A%2F%2Fscontent-phx1-1.cdninstagram.com%2F...",
      "originalUrl": "https://scontent-phx1-1.cdninstagram.com/...",
      "type": "image"
    }],
    "ownerProfilePicUrl": "https://spectrity.com/api/v1/media-proxy?url=https%3A%2F%2Fscontent-lga3-1.cdninstagram.com%2F..."
  }
}
```

### Option B: Keep Original URLs (Frontend Proxies)

Frontend would need to manually proxy URLs:
```typescript
const proxyUrl = (url: string) => {
  return `${API_BASE_URL}/v1/media-proxy?url=${encodeURIComponent(url)}`;
};
```

**❌ Not Recommended** - adds complexity to frontend

---

## Testing

### Test Cases

**1. Valid Instagram Image:**
```bash
curl "http://localhost:3005/api/v1/media-proxy?url=https%3A%2F%2Fscontent-phx1-1.cdninstagram.com%2Fv%2Ft51.2885-15%2F590285380_18030454178751439_8288881115197549330_n.jpg%3F..."
# Should return image binary data
```

**2. Invalid URL (Not Instagram):**
```bash
curl "http://localhost:3005/api/v1/media-proxy?url=https://example.com/image.jpg"
# Should return 403 Forbidden
```

**3. Missing URL Parameter:**
```bash
curl "http://localhost:3005/api/v1/media-proxy"
# Should return 400 Bad Request
```

**4. Cache Hit:**
```bash
# First request
curl "http://localhost:3005/api/v1/media-proxy?url=..." -I
# X-Cache: MISS

# Second request (immediate)
curl "http://localhost:3005/api/v1/media-proxy?url=..." -I
# X-Cache: HIT
```

---

## Performance Considerations

### Metrics to Monitor
- **Cache Hit Rate:** Should be >70% for popular posts
- **Response Time:** <500ms for cached, <2s for uncached
- **Error Rate:** <1% for valid Instagram URLs
- **Storage:** Monitor cache size if using persistent storage

### Optimization Tips
1. **Enable compression** for images >100KB
2. **Use CDN** in front of proxy endpoint
3. **Implement rate limiting** per IP address
4. **Set up monitoring** for Instagram CDN availability

---

## Timeline & Priority

**Priority:** 🔴 HIGH - Share feature is currently broken
**Estimated Effort:** 4-6 hours
**Blockers:** None

### Tasks
- [ ] Implement `/api/v1/media-proxy` endpoint
- [ ] Add URL validation and security checks
- [ ] Implement caching mechanism
- [ ] Update scrape endpoint to return proxied URLs
- [ ] Add error handling and logging
- [ ] Write unit tests
- [ ] Deploy to staging environment
- [ ] Test with frontend
- [ ] Deploy to production

---

## Questions & Clarifications

1. **Q:** Should we cache images permanently or with TTL?
   **A:** Use 24-hour TTL (Instagram URLs expire anyway)

2. **Q:** What about profile pictures?
   **A:** Yes, proxy those too using the same endpoint

3. **Q:** Should the endpoint require authentication?
   **A:** No, make it public (images are already public on Instagram)

4. **Q:** What if Instagram blocks our requests?
   **A:** Implement retry logic + rotate User-Agent headers

---

## Related Documentation

- **Frontend Issue:** CORS errors in browser console
- **Error Logs:** `ERR_BLOCKED_BY_RESPONSE.NotSameOrigin`
- **Affected Files:**
  - Frontend: `src/app/share/page.tsx`
  - Frontend: `src/components/InstagramPost.tsx`

---

**Last Updated:** 2025-12-22
**Status:** 🔴 Backend Implementation Required
**Owner:** Backend Team
