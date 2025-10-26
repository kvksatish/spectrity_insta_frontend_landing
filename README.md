# Spectrity AI/ML Insights - Landing Page

A JSON-driven landing page built with [Next.js](https://nextjs.org), [Tailwind CSS v4](https://tailwindcss.com), and [shadcn/ui](https://ui.shadcn.com).

## Features

- 🎯 **100% JSON-Driven** - All content controlled via JSON configuration files
- 🎨 **Centralized Theming** - Colors, fonts, and spacing in one place
- 🧩 **shadcn/ui Components** - Beautiful, accessible UI components
- 📱 **Fully Responsive** - Mobile-first design
- ⚡ **Type-Safe** - Full TypeScript support
- 🔧 **Easy to Extend** - Modular section-based architecture

## Getting Started

### Using the Server Script (Recommended)

```bash
# Start the server in background
./server.sh start

# Stop the server
./server.sh stop

# Restart the server
./server.sh restart

# Check server status
./server.sh status

# View live logs
./server.sh logs
```

### Using npm directly

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Editing Content

### Update Landing Page Content
Edit `src/config/landing-page.json` to change:
- Page metadata (title, description, keywords)
- Navigation menu
- All section content (hero, features, pricing, testimonials, CTA, footer)

### Update Theme
Edit `src/config/theme.json` to customize:
- Colors (primary, secondary, accent, background, foreground)
- Fonts (heading, body)
- Spacing and border radius

**No code changes required!** The page automatically reflects your JSON edits.

## Documentation

- **[LANDING_PAGE_GUIDE.md](./LANDING_PAGE_GUIDE.md)** - Complete guide to JSON configuration, sections, and extending the system
- **[SERVER_MANAGEMENT.md](./SERVER_MANAGEMENT.md)** - Server script usage and troubleshooting

## Project Structure

```
src/
├── config/
│   ├── theme.json              # Theme configuration
│   └── landing-page.json       # Page content
├── components/
│   ├── landing/                # Landing page sections
│   │   ├── Navigation.tsx
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── Pricing.tsx
│   │   ├── Testimonials.tsx
│   │   ├── CTA.tsx
│   │   ├── Footer.tsx
│   │   └── LandingPageRenderer.tsx
│   └── ui/                     # shadcn/ui components
├── types/
│   └── landing-page.ts         # TypeScript types
└── lib/
    ├── utils.ts               # Utilities
    └── config-loader.ts       # Config loader
```

## Available Sections

- **Hero** - Main banner with headline, description, and CTA buttons
- **Features** - Grid/list of features with icons
- **Pricing** - Pricing plans with feature lists
- **Testimonials** - Customer testimonials with ratings
- **CTA** - Call-to-action section
- **Footer** - Site footer with links and social media

## Technologies

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
