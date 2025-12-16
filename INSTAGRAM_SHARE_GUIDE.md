# Instagram Link Sharing Guide

## Overview

This app can receive Instagram links shared directly from the Instagram mobile app or any other app that supports sharing URLs. When a user shares an Instagram post, reel, or story, the app will capture and process that link.

## How It Works

### 1. Web Share Target API

The app registers itself as a share target through the PWA manifest (`public/manifest.json`):

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

### 2. Share Handler Page

When a link is shared, the app opens `/share` page which:
- Extracts the Instagram URL from query parameters
- Parses and validates the URL
- Identifies the content type (post, reel, TV, story, profile)
- Redirects to dashboard with the parsed data

## Supported Instagram URL Formats

### Posts
- `https://www.instagram.com/p/POST_ID/`
- `https://instagram.com/p/POST_ID/`
- `https://instagr.am/p/POST_ID/`

### Reels
- `https://www.instagram.com/reel/REEL_ID/`
- `https://www.instagram.com/reels/REEL_ID/`

### IGTV
- `https://www.instagram.com/tv/TV_ID/`

### Stories
- `https://www.instagram.com/stories/USERNAME/STORY_ID/`

### Profiles
- `https://www.instagram.com/USERNAME/`

## Usage Flow

### From Instagram Mobile App

1. **User opens Instagram app**
2. **User finds a post/reel they want to share**
3. **User taps the share button (paper plane icon)**
4. **User selects "Spectrity" from share sheet**
5. **App opens automatically to /share page**
6. **App processes the link and shows progress**
7. **User is redirected to dashboard with link data**

### From Browser or Other Apps

1. **User copies Instagram link**
2. **User opens share menu (or manually navigates to app)**
3. **User shares link to Spectrity app**
4. **Rest of flow same as above**

## Testing Locally

### Prerequisites
- App must be installed as PWA (Add to Home Screen)
- Must be served over HTTPS (or localhost for development)
- Browser must support Web Share Target API (Chrome, Edge, Safari on mobile)

### Test Steps

1. **Build and serve the app**:
   ```bash
   npm run build
   npm start
   ```

2. **Install as PWA**:
   - Open app in mobile browser
   - Tap "Add to Home Screen"
   - Confirm installation

3. **Test sharing**:
   - Open Instagram app
   - Find any post/reel
   - Tap share button
   - Look for "Spectrity" in share options
   - Select it and verify link is captured

## Development Testing

For development without Instagram app:

```javascript
// Navigate to this URL in your app:
http://localhost:3000/share?url=https://www.instagram.com/p/ABC123/

// Or test with different content types:
http://localhost:3000/share?url=https://www.instagram.com/reel/XYZ789/
http://localhost:3000/share?url=https://www.instagram.com/stories/username/123456/
```

## Instagram Link Parsing Utility

The app includes a comprehensive utility (`src/utils/instagramLinks.ts`) with functions:

### `parseInstagramUrl(url: string): ParsedInstagramLink`
Parses any Instagram URL and returns structured data:
```typescript
{
  type: "post" | "reel" | "tv" | "story" | "profile" | "unknown",
  id: string,
  username?: string,
  url: string,
  isValid: boolean
}
```

### `isInstagramUrl(url: string): boolean`
Validates if a URL is from Instagram domain.

### `extractInstagramId(url: string): string | null`
Extracts just the content ID from URL.

### `normalizeInstagramUrl(url: string): string`
Converts any Instagram URL to standard format.

### `getContentTypeLabel(type: string): string`
Returns human-readable content type label.

### `extractInstagramUrlsFromText(text: string): string[]`
Finds all Instagram URLs in a block of text.

## Example Usage in Code

```typescript
import { parseInstagramUrl, getContentTypeLabel } from '@/utils/instagramLinks';

// Parse a shared link
const link = "https://www.instagram.com/p/ABC123/";
const parsed = parseInstagramUrl(link);

if (parsed.isValid) {
  console.log(getContentTypeLabel(parsed.type)); // "Instagram Post"
  console.log(parsed.id); // "ABC123"

  // Send to backend for processing
  await fetch('/api/instagram/process', {
    method: 'POST',
    body: JSON.stringify({
      url: parsed.url,
      type: parsed.type,
      id: parsed.id
    })
  });
}
```

## Backend Integration

To process shared links on the backend:

1. **Add API endpoint** (`/api/instagram/process`)
2. **Receive parsed link data**:
   ```typescript
   {
     url: string,
     type: "post" | "reel" | "tv" | "story",
     id: string
   }
   ```
3. **Fetch Instagram content** (using Instagram API or web scraping)
4. **Store in database**
5. **Return processed data to frontend**

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome Android | ✅ Full | Native support |
| Safari iOS | ✅ Full | Requires PWA install |
| Edge Android | ✅ Full | Native support |
| Firefox Android | ⚠️ Partial | Limited support |
| Desktop browsers | ❌ No | Web Share Target is mobile-only |

## Security Considerations

1. **URL Validation**: Always validate URLs before processing
2. **Domain Check**: Only accept instagram.com and instagr.am domains
3. **Input Sanitization**: Sanitize all user input before sending to backend
4. **Rate Limiting**: Implement rate limits on share endpoint
5. **Authentication**: Require user login before processing shared links

## Troubleshooting

### App doesn't appear in share sheet
- Ensure app is installed as PWA (Add to Home Screen)
- Check manifest.json is served with correct MIME type
- Verify HTTPS is being used (or localhost for dev)
- Clear browser cache and reinstall PWA

### Link not being captured
- Check browser console for errors
- Verify query parameters in URL bar
- Test with manual URL: `/share?url=INSTAGRAM_URL`

### Invalid link format error
- Check if Instagram URL format is supported
- Look at console logs for parsing errors
- Test URL with `parseInstagramUrl()` utility

## Next Steps

1. ✅ Implement share target in manifest
2. ✅ Create share handler page
3. ✅ Add Instagram URL parsing utilities
4. ⏳ Add backend API endpoint for processing
5. ⏳ Implement Instagram data fetching
6. ⏳ Add error handling and retry logic
7. ⏳ Add analytics tracking for shared links
8. ⏳ Optimize for offline capability

## Resources

- [Web Share Target API](https://web.dev/web-share-target/)
- [PWA Manifest Documentation](https://web.dev/add-manifest/)
- [Instagram URL Patterns](https://www.instagram.com/developer/)
