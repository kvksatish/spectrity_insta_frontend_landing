# Share Target Flow - User Experience Documentation

This document describes what users see when they share an Instagram link to the PWA.

## Share Flow Sequence

### 1. User Shares Instagram Link
User clicks "Share" on Instagram → Selects your PWA from share menu

### 2. Loading State (Processing)
```
┌───────────────────────────────────────┐
│                                       │
│         📷 Instagram Icon             │
│         🔄 Spinning Loader            │
│                                       │
│   Scraping Instagram Post...          │
│                                       │
│   Please wait while we extract        │
│   the post data                       │
│                                       │
└───────────────────────────────────────┘
```

**Duration**: 5-15 seconds (depending on Apify scraping speed)

---

### 3. Success State (Post Displayed)
```
┌─────────────────────────────────────────────┐
│  ✅ Post Scraped Successfully!              │
│  Your Instagram post has been extracted     │
│                                             │
│  ┌─────────────────────────────────────┐  │
│  │  👤 valuetainment          ⋮        │  │
│  ├─────────────────────────────────────┤  │
│  │                                     │  │
│  │         [Post Image]                │  │
│  │                                     │  │
│  ├─────────────────────────────────────┤  │
│  │  ❤️ 💬 ➤               🔖          │  │
│  │                                     │  │
│  │  204 likes                          │  │
│  │                                     │  │
│  │  valuetainment Google led global    │  │
│  │  web traffic in July with 16.2      │  │
│  │  billion visits...                  │  │
│  │                                     │  │
│  │  View all 6 comments                │  │
│  │                                     │  │
│  │  JUST NOW                           │  │
│  └─────────────────────────────────────┘  │
│                                             │
│  ┌──────────────┐  ┌──────────────────┐   │
│  │ Go to        │  │ Share Another    │   │
│  │ Dashboard    │  │                  │   │
│  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────┘
```

**Features**:
- Full Instagram post display with image
- Username and avatar
- Like and comment counts
- Full caption text
- Interactive buttons (like, comment, share, save)
- Timestamp
- Action buttons: "Go to Dashboard" and "Share Another"

---

### 4. Error State (Something Went Wrong)

#### Example 1: Authentication Error
```
┌───────────────────────────────────────┐
│                                       │
│         📷 Instagram Icon             │
│         ⚠️  Alert Icon                │
│                                       │
│   Oops! Something went wrong          │
│                                       │
│   Invalid or expired token            │
│                                       │
│   ┌─────────────────────────────┐   │
│   │ Error Code: AUTH_ERROR      │   │
│   │ Status: 401                 │   │
│   └─────────────────────────────┘   │
│                                       │
│   ┌──────────┐  ┌──────────────┐   │
│   │ Go Back  │  │  Try Again   │   │
│   └──────────┘  └──────────────┘   │
│                                       │
└───────────────────────────────────────┘
```

#### Example 2: Scraper Error (Private/Deleted Post)
```
┌───────────────────────────────────────┐
│                                       │
│         📷 Instagram Icon             │
│         ⚠️  Alert Icon                │
│                                       │
│   Oops! Something went wrong          │
│                                       │
│   Failed to extract media from post.  │
│   Post may be private, deleted, or    │
│   in an unsupported format.           │
│                                       │
│   ┌─────────────────────────────┐   │
│   │ Error Code: SCRAPER_ERROR   │   │
│   │ Status: 500                 │   │
│   └─────────────────────────────┘   │
│                                       │
│   ┌──────────┐  ┌──────────────┐   │
│   │ Go Back  │  │  Try Again   │   │
│   └──────────┘  └──────────────┘   │
│                                       │
└───────────────────────────────────────┘
```

#### Example 3: Network Error
```
┌───────────────────────────────────────┐
│                                       │
│         📷 Instagram Icon             │
│         ⚠️  Alert Icon                │
│                                       │
│   Oops! Something went wrong          │
│                                       │
│   Network error. Please check your    │
│   connection and try again.           │
│                                       │
│   ┌─────────────────────────────┐   │
│   │ Error Code: NETWORK_ERROR   │   │
│   │ Status: 0                   │   │
│   └─────────────────────────────┘   │
│                                       │
│   ┌──────────┐  ┌──────────────┐   │
│   │ Go Back  │  │  Try Again   │   │
│   └──────────┘  └──────────────┘   │
│                                       │
└───────────────────────────────────────┘
```

---

## Backend API Response → Frontend Display Mapping

### Success Response
**API Response**:
```json
{
  "success": true,
  "message": "Post scraped successfully",
  "data": {
    "id": "3792540629088140031",
    "shortCode": "DShz5vBCPr_",
    "url": "https://www.instagram.com/p/DShz5vBCPr_/",
    "postType": "IMAGE",
    "ownerUsername": "valuetainment",
    "ownerProfilePicUrl": "https://...",
    "caption": "Google led global web traffic...",
    "likeCount": 204,
    "commentsCount": 6,
    "mediaItems": [{
      "url": "https://scontent-lga3-1.cdninstagram.com/...",
      "type": "image"
    }]
  }
}
```

**Frontend Transformation** (`src/app/share/page.tsx:52-64`):
```javascript
const transformedPost = {
  id: post.id || post.shortCode,              // "3792540629088140031"
  username: post.ownerUsername,                // "valuetainment"
  userAvatar: post.ownerProfilePicUrl,         // Avatar URL
  postImage: post.mediaItems?.[0]?.url,        // First media item
  caption: post.caption || '',                 // Full caption
  likes: post.likeCount || 0,                  // 204
  comments: post.commentsCount || 0,           // 6
  timestamp: 'Just now',                       // Static for now
  isLiked: false,                              // Default state
  isSaved: false,                              // Default state
};
```

### Error Response
**API Response**:
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

**Frontend State** (`src/app/share/page.tsx:70-74`):
```javascript
setErrorMessage(response.error?.message);  // Display message
setErrorCode(response.error?.code);        // "SCRAPER_ERROR"
setErrorStatusCode(response.error?.statusCode);  // 500
setStatus("error");                        // Show error UI
```

---

## User Actions After Share

### On Success:
1. **Go to Dashboard** → Navigates to `/dashboard` (Essence feed)
2. **Share Another** → Reloads page to share another post

### On Error:
1. **Go Back** → Returns to `/dashboard`
2. **Try Again** → Reloads page to retry with same/different link

---

## Technical Implementation

### Share Target Configuration (`public/manifest.json`)
```json
{
  "share_target": {
    "action": "/share",
    "method": "GET",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url"
    }
  }
}
```

### URL Parameters Received
When user shares `https://www.instagram.com/p/DShz5vBCPr_/`:
```
/share?url=https://www.instagram.com/p/DShz5vBCPr_/
```

### Component Flow
```
SharePage (Suspense wrapper)
  └─ ShareContent
      ├─ useEffect → processSharedContent()
      │   ├─ Get URL from searchParams
      │   ├─ Call scrapeInstagramPost()
      │   └─ Transform response data
      │
      ├─ Success State
      │   └─ InstagramPost component
      │
      └─ Error/Loading State
          └─ Card with status message
```

---

## Testing the Share Flow

### Method 1: Manual URL Test
1. Open browser to: `http://localhost:3001/share?url=https://www.instagram.com/p/DShz5vBCPr_/`
2. Watch loading state → Success/Error display

### Method 2: Via Web Share API (Mobile/PWA)
1. Install PWA on mobile device
2. Open Instagram post
3. Click "Share" → Select your PWA
4. Observe flow: Loading → Post Display

### Method 3: Via Share Button in App
1. Create share button in any page:
```javascript
const handleShare = async () => {
  if (navigator.share) {
    await navigator.share({
      url: 'https://www.instagram.com/p/DShz5vBCPr_/'
    });
  }
};
```

---

## Related Files

- **Share Handler**: `/src/app/share/page.tsx`
- **Post Component**: `/src/components/InstagramPost.tsx`
- **API Client**: `/src/api/posts.api.ts`
- **Manifest**: `/public/manifest.json`

---

## Example Test URLs

### Valid Posts (Should Succeed)
- `https://www.instagram.com/p/DSfTDUGDrwE/` - groww_official post
- `https://www.instagram.com/p/DShz5vBCPr_/` - valuetainment post

### Invalid Posts (Should Error)
- `https://www.instagram.com/p/INVALID123/` - Invalid shortcode
- `https://www.instagram.com/p/PrivatePost/` - Private post (if exists)

### Invalid URLs (Should Validate on Frontend)
- `https://twitter.com/post/123` - Wrong domain
- `https://example.com` - Not Instagram
- Empty/malformed URLs

---

## Performance Notes

- **Scraping Time**: 5-15 seconds (Apify processing)
- **Caching**: Backend caches scraped posts (subsequent scrapes are instant)
- **Image Loading**: Uses Next.js Image optimization
- **Mobile Experience**: Optimized for mobile share sheets
- **Offline**: Service worker caches static assets (not dynamic scraping)
