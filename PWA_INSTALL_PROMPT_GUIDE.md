# PWA Install Prompt - Complete Guide

## 📱 When Does the Install Prompt Appear?

The PWA install prompt (`PWAInstallPrompt` component) appears when **ALL** of the following conditions are met:

---

## ✅ Required Conditions

### 1. **Browser Support**
- ✅ Chrome (Desktop & Mobile)
- ✅ Edge (Desktop & Mobile)
- ✅ Samsung Internet
- ✅ Opera
- ❌ Safari (iOS/macOS) - Does not support `beforeinstallprompt` event
- ❌ Firefox - Limited support

### 2. **App Not Already Installed**
The component checks if the app is already running in standalone mode:

```typescript
// Line 24-30 in PWAInstallPrompt.tsx
if (
  window.matchMedia("(display-mode: standalone)").matches ||
  (window.navigator as any).standalone === true
) {
  setIsInstalled(true);
  return; // Don't show prompt
}
```

**Detection Methods:**
- `(display-mode: standalone)` - Detects Android/Chrome/Edge installed apps
- `navigator.standalone` - Detects iOS installed apps

### 3. **User Hasn't Dismissed Recently**
The prompt respects user preferences:

```typescript
// Line 33-42 in PWAInstallPrompt.tsx
const dismissed = localStorage.getItem("pwa-install-dismissed");
if (dismissed) {
  const dismissedDate = new Date(dismissed);
  const daysSinceDismissed =
    (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
  // Don't show again for 7 days
  if (daysSinceDismissed < 7) {
    return;
  }
}
```

**Dismissal Logic:**
- If user clicks "Not now" or X button
- Stored in `localStorage` with key `pwa-install-dismissed`
- Prompt won't show again for **7 days**
- After 7 days, prompt reappears

### 4. **3-Second Delay After Page Load**
The prompt doesn't appear immediately to avoid annoying users:

```typescript
// Line 49-52 in PWAInstallPrompt.tsx
setTimeout(() => {
  setShowPrompt(true);
}, 3000); // 3 second delay
```

**Timing:**
- User lands on page
- Waits 3 seconds
- Prompt slides in from bottom

### 5. **HTTPS or Localhost**
PWAs require secure contexts:
- ✅ `https://` - Production
- ✅ `http://localhost` - Development
- ❌ `http://` - Blocked (except localhost)

### 6. **Service Worker Requirements Met**
The browser's `beforeinstallprompt` event only fires when:
- Valid `manifest.json` exists
- Service worker registered successfully
- App meets PWA installability criteria

---

## ⚠️ Why You Don't See It in Development

### Current Configuration

In `next.config.ts` (line 44):

```typescript
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // ← PWA disabled in dev
  register: true,
  cacheOnFrontEndNav: true,
  // ...
});
```

**What This Means:**
- ❌ Service worker is NOT registered in development
- ❌ `beforeinstallprompt` event never fires
- ❌ Install prompt never appears
- ✅ Faster development reload times
- ✅ No caching interference during development

---

## 🎯 How to Test the Install Prompt

### **Option 1: Production Build (Recommended)**

```bash
# Build for production
npm run build

# Start production server
npm start
```

Then:
1. Open `http://localhost:3000` (or whatever port)
2. Wait 3 seconds
3. Install prompt should appear (if browser supports it)

---

### **Option 2: Enable PWA in Development**

Modify `next.config.ts`:

```typescript
const withPWA = withPWAInit({
  dest: "public",
  disable: false, // ← Enable PWA in development
  register: true,
  // ...
});
```

**Pros:**
- ✅ Test install prompt immediately
- ✅ See service worker behavior

**Cons:**
- ⚠️ Aggressive caching can interfere with hot reload
- ⚠️ May need to unregister service worker frequently
- ⚠️ Slower development experience

---

### **Option 3: Chrome DevTools Manual Trigger**

1. Open Chrome DevTools (F12)
2. Go to **Application** tab
3. Click **Manifest** in left sidebar
4. Click **"Add to Home Screen"** button

**This bypasses the automatic prompt but tests installation.**

---

### **Option 4: Lighthouse PWA Audit**

1. Open Chrome DevTools
2. Go to **Lighthouse** tab
3. Select **Progressive Web App**
4. Click **Generate report**

**Shows PWA installability criteria and what's missing.**

---

## 📋 Browser Install Criteria

The `beforeinstallprompt` event fires when the browser determines the app is installable. Different browsers have different criteria:

### Chrome/Edge Requirements:
- ✅ Served over HTTPS (or localhost)
- ✅ Valid `manifest.json` with:
  - `name` or `short_name`
  - `icons` (including 192x192 and 512x512)
  - `start_url`
  - `display` set to `standalone`, `fullscreen`, or `minimal-ui`
- ✅ Service worker registered
- ✅ User has visited the site at least once before

### Additional Chrome Heuristics:
- User has engaged with the site (clicks, scrolls, etc.)
- User hasn't dismissed install prompt recently
- User hasn't already installed the app

---

## 🎨 Install Prompt UI

### Visual Design

The prompt appears as a card at the bottom of the screen:

```
┌─────────────────────────────────────────┐
│ [S]  Install Spectrity App         [X] │
│      Install our app for quick access   │
│                                          │
│      [Install]  [Not now]               │
│      ─────────────────────────────       │
│      • Works offline                    │
│      • Faster loading                   │
│      • Home screen access               │
└─────────────────────────────────────────┘
```

### Features:
- Gradient app icon with "S"
- Clear call-to-action buttons
- Dismissible (X button or "Not now")
- Benefits list (offline, faster, home screen)
- Responsive (full-width on mobile, card on desktop)
- Smooth slide-in animation from bottom

---

## 🔄 User Flow

### Happy Path:

1. **User visits site** (on supported browser, HTTPS)
2. **Browser detects PWA criteria met**
3. **`beforeinstallprompt` event fires**
4. **Component waits 3 seconds**
5. **Prompt slides in from bottom**
6. **User clicks "Install"**
7. **Native browser install dialog appears**
8. **User confirms installation**
9. **App installed to home screen**
10. **`appinstalled` event fires**
11. **Prompt disappears and won't show again**

### User Dismisses:

1. **User clicks "Not now" or X**
2. **Prompt disappears**
3. **Timestamp stored in `localStorage`**
4. **Prompt won't show again for 7 days**

### Already Installed:

1. **User opens installed app**
2. **Component detects standalone mode**
3. **Prompt never appears**

---

## 📁 Related Files

### Component Implementation:
- **`src/components/PWAInstallPrompt.tsx`** - Main install prompt component

### Configuration:
- **`next.config.ts`** - PWA configuration (lines 42-143)
- **`public/manifest.json`** - PWA manifest file

### Integration:
- **`src/app/layout.tsx`** - PWA prompt included in layout (line 60)
- **`src/app/page.tsx`** - Landing page with InstallPrompt

### Icons:
- **`public/icons/icon-*.png`** - PWA app icons (72x72 to 512x512)

---

## 🐛 Troubleshooting

### "I don't see the install prompt"

**Check:**
1. ✅ Using Chrome/Edge (not Safari/Firefox)
2. ✅ Running on HTTPS or localhost
3. ✅ PWA enabled in config (`disable: false` for dev or use production build)
4. ✅ Waited at least 3 seconds after page load
5. ✅ Haven't dismissed in last 7 days (clear localStorage)
6. ✅ App not already installed (check display mode)
7. ✅ Check browser console for service worker errors

**Clear Dismissal:**
```javascript
// In browser console:
localStorage.removeItem('pwa-install-dismissed');
location.reload();
```

### "Service worker not registering"

**Check:**
1. PWA not disabled in `next.config.ts`
2. Running production build (not dev mode)
3. Check `/sw.js` exists in public folder after build
4. Check DevTools → Application → Service Workers

### "beforeinstallprompt never fires"

**Check:**
1. All manifest.json fields are valid
2. Icons exist and are correct sizes
3. Service worker registered successfully
4. Using a supported browser
5. Not already in standalone mode
6. Visit Lighthouse → PWA audit for details

---

## 🚀 Production Deployment

When deploying to production, the install prompt will work automatically if:

1. ✅ Deployed to HTTPS domain
2. ✅ `disable: process.env.NODE_ENV === "development"` in config
3. ✅ All PWA assets built correctly
4. ✅ Manifest and icons accessible

**No code changes needed** - it just works in production!

---

## 📊 Install Prompt Behavior Matrix

| Condition | Development | Production |
|-----------|-------------|------------|
| PWA Enabled | ❌ Disabled by default | ✅ Enabled |
| Service Worker | ❌ Not registered | ✅ Registered |
| `beforeinstallprompt` | ❌ Never fires | ✅ Fires when criteria met |
| Install Prompt UI | ❌ Never shows | ✅ Shows after 3s |
| Install Functionality | ❌ Not available | ✅ Fully functional |

---

## 🎯 Summary

**The install prompt appears:**
- ✅ In **production** builds automatically
- ✅ On **Chrome/Edge** browsers
- ✅ After **3 seconds** on the page
- ✅ If **not installed** already
- ✅ If **not dismissed** in last 7 days
- ✅ When **PWA criteria** are met

**To test right now:**
```bash
npm run build
npm start
# Open http://localhost:3000
# Wait 3 seconds
```

**Quick test in development:**
Change `disable: false` in `next.config.ts` and restart dev server.

---

## 📖 References

- [PWA Install Prompt Documentation](https://web.dev/customize-install/)
- [beforeinstallprompt Event](https://developer.mozilla.org/en-US/docs/Web/API/BeforeInstallPromptEvent)
- [Web App Manifest](https://web.dev/add-manifest/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

**Last Updated:** 2025-12-21
**Status:** ✅ Fully Implemented and Working
