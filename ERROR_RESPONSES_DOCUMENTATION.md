# Instagram Scraper API - Error Response Documentation

This document details all possible error responses from the Instagram scraping backend API and how they are displayed in the frontend.

## Test Credentials
- **Email**: satish@kvatron.com
- **Password**: TestPassword123!

## API Endpoint
```
POST /api/v1/posts/scrape
```

## Success Response

### Example: Valid Instagram Post
```json
{
  "success": true,
  "message": "Post retrieved from cache",
  "data": {
    "id": "3791833201887853572",
    "shortCode": "DSfTDUGDrwE",
    "url": "https://www.instagram.com/p/DSfTDUGDrwE/",
    "postType": "IMAGE",
    "mediaItems": [{
      "url": "https://scontent-sea5-1.cdninstagram.com/...",
      "type": "image",
      "thumbnail_url": "https://scontent-sea5-1.cdninstagram.com/..."
    }],
    "caption": "U.S. billionaires hold more wealth...",
    "ownerUsername": "groww_official",
    "likeCount": 1227,
    "commentsCount": 4
  }
}
```

## Error Responses

### 1. Authentication Error (Invalid/Expired Token)

**HTTP Status**: 401 Unauthorized

**Response**:
```json
{
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

**Frontend Display**:
- Error Message: "Invalid or expired token"
- Error Code: `AUTH_ERROR`
- HTTP Status: 401

**How to trigger**: Send request without token or with invalid token

---

### 2. Validation Error (Invalid URL Format)

**HTTP Status**: 400 Bad Request

**Response**:
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "url: Must be a valid Instagram URL"
}
```

**Frontend Display**:
- Error Message: "url: Must be a valid Instagram URL"
- Error Code: `API_ERROR`
- HTTP Status: 400

**How to trigger**: Send non-Instagram URL (e.g., `https://invalid-url.com`)

---

### 3. Scraper Error (Private/Deleted/Invalid Post)

**HTTP Status**: 500 Internal Server Error

**Response**:
```json
{
  "success": false,
  "error": {
    "code": "SCRAPER_ERROR",
    "message": "Failed to extract media from post. Post may be private, deleted, or in an unsupported format.",
    "statusCode": 500
  }
}
```

**Frontend Display**:
- Error Message: "Failed to extract media from post. Post may be private, deleted, or in an unsupported format."
- Error Code: `SCRAPER_ERROR`
- HTTP Status: 500

**How to trigger**: Try to scrape a private, deleted, or invalid Instagram post (e.g., `https://www.instagram.com/p/INVALID123/`)

---

### 4. Network Error (Frontend)

**Response**: No response from server

**Frontend Display**:
- Error Message: "Network error. Please check your connection and try again."
- Error Code: `NETWORK_ERROR`
- HTTP Status: 0

**How to trigger**: Server is down or network connectivity issues

---

### 5. Client-Side Validation Error (Frontend)

**Response**: Not sent to server

**Frontend Display**:
- Error Message: "Please enter a valid Instagram post or reel URL (e.g., https://www.instagram.com/p/ABC123/)"
- Error Code: `VALIDATION_ERROR`
- HTTP Status: None

**How to trigger**: Enter invalid URL in frontend input field

---

## Frontend Error Display Implementation

### Share Page (`/share`)
When an error occurs during Instagram post scraping via share target:

```
┌─────────────────────────────────────┐
│  🔴  Oops! Something went wrong     │
│                                     │
│  [User-friendly error message]      │
│                                     │
│  ┌─────────────────────────────┐  │
│  │ Error Code: SCRAPER_ERROR   │  │
│  │ Status: 500                 │  │
│  └─────────────────────────────┘  │
│                                     │
│  [Go Back]  [Try Again]            │
└─────────────────────────────────────┘
```

### InstagramScraper Component
When an error occurs in the scraper input:

```
┌────────────────────────────────────────┐
│  [Instagram URL Input]  [Scrape]       │
│                                        │
│  ┌────────────────────────────────┐  │
│  │ ⚠ [Error message from server]  │  │
│  │                                │  │
│  │ Error Code: SCRAPER_ERROR      │  │
│  │ HTTP Status: 500               │  │
│  └────────────────────────────────┘  │
└────────────────────────────────────────┘
```

## Error Code Types

| Error Code | Source | Description |
|------------|--------|-------------|
| `SCRAPER_ERROR` | Backend | Instagram scraping failed (private/deleted/invalid post) |
| `AUTH_ERROR` | Backend | Authentication failed (invalid/expired token) |
| `API_ERROR` | Backend | General API error (validation, bad request) |
| `NETWORK_ERROR` | Frontend | Network connectivity issues |
| `VALIDATION_ERROR` | Frontend | Client-side validation failed |
| `CLIENT_ERROR` | Frontend | Unexpected client-side error |

## Testing Scenarios

### Test 1: Successful Scraping
```bash
# Login and get token
curl -X POST http://localhost:3005/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"satish@kvatron.com","password":"TestPassword123!"}'

# Scrape valid post
curl -X POST http://localhost:3005/api/v1/posts/scrape \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{"url":"https://www.instagram.com/p/DSfTDUGDrwE/"}'
```

### Test 2: Authentication Error
```bash
curl -X POST http://localhost:3005/api/v1/posts/scrape \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer invalid_token" \
  -d '{"url":"https://www.instagram.com/p/DSfTDUGDrwE/"}'
```

### Test 3: Invalid URL Format
```bash
curl -X POST http://localhost:3005/api/v1/posts/scrape \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{"url":"https://invalid-url.com"}'
```

### Test 4: Private/Invalid Post
```bash
curl -X POST http://localhost:3005/api/v1/posts/scrape \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{"url":"https://www.instagram.com/p/INVALID123/"}'
```

## Implementation Details

### API Error Handler (`src/api/posts.api.ts`)
```typescript
export const scrapeInstagramPost = async (url: string): Promise<ScrapePostResponse> => {
  try {
    const response = await client.post<ScrapePostResponse>('/v1/posts/scrape', { url });
    return response.data;
  } catch (error: any) {
    // Preserve error details from backend
    if (error.response?.data) {
      return {
        success: false,
        error: {
          code: error.response.data.error?.code || 'API_ERROR',
          message: error.response.data.error?.message || error.response.data.message,
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
```

### Error Display Component
```typescript
{error && (
  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200">
    <p className="text-sm text-red-600">{error}</p>
    {errorCode && (
      <div className="space-y-1">
        <p className="text-xs font-mono">Error Code: {errorCode}</p>
        {errorStatusCode && (
          <p className="text-xs font-mono">HTTP Status: {errorStatusCode}</p>
        )}
      </div>
    )}
  </div>
)}
```

## Related Files

- `/src/api/posts.api.ts` - API client with error handling
- `/src/app/share/page.tsx` - Share target error display
- `/src/components/InstagramScraper.tsx` - Scraper component error display

## Notes

- All errors are logged to console for debugging
- Error codes are displayed in monospace font for technical clarity
- User-friendly messages are shown first, technical details below
- HTTP status codes are preserved from backend responses
- Network errors (statusCode: 0) indicate connectivity issues
