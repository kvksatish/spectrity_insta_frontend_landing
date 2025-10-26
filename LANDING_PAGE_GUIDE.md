# JSON-Driven Landing Page Guide

This landing page is fully controlled by JSON configuration files, making it easy to update content without touching the code.

## 🎯 Overview

The entire landing page is driven by two main JSON files:
- **`src/config/theme.json`** - Controls colors, fonts, spacing, and visual theme
- **`src/config/landing-page.json`** - Controls all page content, sections, and structure

## 📁 Project Structure

```
src/
├── config/
│   ├── theme.json              # Theme configuration
│   └── landing-page.json       # Page content and structure
├── components/
│   ├── landing/
│   │   ├── Navigation.tsx      # Navigation bar component
│   │   ├── Hero.tsx           # Hero section
│   │   ├── Features.tsx       # Features section
│   │   ├── Pricing.tsx        # Pricing section
│   │   ├── Testimonials.tsx   # Testimonials section
│   │   ├── CTA.tsx            # Call-to-action section
│   │   ├── Footer.tsx         # Footer section
│   │   └── LandingPageRenderer.tsx  # Main renderer
│   └── ui/                    # shadcn/ui components
├── types/
│   └── landing-page.ts        # TypeScript type definitions
└── lib/
    ├── utils.ts              # Utility functions
    └── config-loader.ts      # Config loading logic
```

## 🎨 Theme Configuration

Edit `src/config/theme.json` to customize the visual appearance:

```json
{
  "colors": {
    "primary": "oklch(0.205 0 0)",
    "secondary": "oklch(0.97 0 0)",
    "accent": "oklch(0.646 0.222 41.116)",
    "background": "oklch(1 0 0)",
    "foreground": "oklch(0.145 0 0)"
  },
  "fonts": {
    "heading": "var(--font-geist-sans)",
    "body": "var(--font-geist-sans)"
  },
  "spacing": {
    "section": "py-16 md:py-24 lg:py-32",
    "container": "container mx-auto px-4 md:px-6"
  },
  "borderRadius": "0.625rem"
}
```

### Customizing Colors
Colors use the OKLCH format which provides better color consistency. You can:
1. Use an OKLCH color picker online
2. Convert from HEX/RGB to OKLCH
3. Modify the CSS variables in `src/app/globals.css` for more granular control

## 📄 Landing Page Configuration

Edit `src/config/landing-page.json` to update all content:

### Metadata
Controls SEO metadata:
```json
{
  "metadata": {
    "title": "Your Site Title",
    "description": "Your site description for SEO",
    "keywords": ["keyword1", "keyword2"]
  }
}
```

### Navigation
Configure the header navigation:
```json
{
  "navigation": {
    "logo": { "text": "Your Brand" },
    "items": [
      { "label": "Features", "href": "#features" },
      { "label": "Pricing", "href": "#pricing" }
    ],
    "cta": {
      "label": "Get Started",
      "href": "#get-started"
    }
  }
}
```

### Available Section Types

#### 1. Hero Section
```json
{
  "type": "hero",
  "badge": "Optional badge text",
  "heading": "Main heading",
  "subheading": "Highlighted subheading",
  "description": "Detailed description",
  "buttons": [
    {
      "label": "Button text",
      "href": "#link",
      "variant": "default"
    }
  ]
}
```

**Button variants**: `default`, `outline`, `secondary`, `ghost`

#### 2. Features Section
```json
{
  "type": "features",
  "badge": "Features",
  "heading": "Section heading",
  "description": "Section description",
  "layout": "grid",
  "features": [
    {
      "icon": "brain",
      "title": "Feature title",
      "description": "Feature description"
    }
  ]
}
```

**Available icons**: `brain`, `activity`, `shield`, `zap`, `users`, `code`

To add more icons, edit `src/components/landing/Features.tsx` and add them to the `iconMap`.

#### 3. Pricing Section
```json
{
  "type": "pricing",
  "badge": "Pricing",
  "heading": "Section heading",
  "description": "Section description",
  "plans": [
    {
      "name": "Plan Name",
      "price": "$29",
      "period": "per month",
      "description": "Plan description",
      "features": ["Feature 1", "Feature 2"],
      "highlighted": true,
      "buttonText": "Get Started",
      "buttonHref": "#signup"
    }
  ]
}
```

Set `highlighted: true` to emphasize a plan with a border and shadow.

#### 4. Testimonials Section
```json
{
  "type": "testimonials",
  "badge": "Testimonials",
  "heading": "Section heading",
  "description": "Section description",
  "testimonials": [
    {
      "name": "Customer Name",
      "role": "Job Title",
      "company": "Company Name",
      "content": "Testimonial content",
      "rating": 5
    }
  ]
}
```

#### 5. CTA Section
```json
{
  "type": "cta",
  "heading": "Call to action heading",
  "description": "Description text",
  "buttons": [
    {
      "label": "Button text",
      "href": "#link",
      "variant": "default"
    }
  ]
}
```

#### 6. Footer Section
```json
{
  "type": "footer",
  "logo": { "text": "Your Brand" },
  "description": "Brief company description",
  "columns": [
    {
      "title": "Column Title",
      "links": [
        { "label": "Link text", "href": "#link" }
      ]
    }
  ],
  "socialLinks": [
    { "platform": "Twitter", "href": "https://twitter.com", "icon": "twitter" }
  ],
  "copyright": "© 2025 Your Company. All rights reserved."
}
```

**Available social icons**: `twitter`, `linkedin`, `github`

## 🎯 Section Order

Sections are rendered in the order they appear in the `sections` array in `landing-page.json`. Simply reorder the array to change the page layout.

## 🚀 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🎨 Adding New shadcn/ui Components

```bash
npx shadcn@latest add [component-name]
```

Example:
```bash
npx shadcn@latest add dialog tabs accordion
```

## 🔧 Extending the System

### Adding a New Section Type

1. **Define TypeScript type** in `src/types/landing-page.ts`:
```typescript
export interface NewSection {
  type: "newsection";
  title: string;
  // ... other fields
}
```

2. **Add to Section union type**:
```typescript
export type Section =
  | HeroSection
  | FeaturesSection
  | NewSection  // Add here
  // ...
```

3. **Create component** in `src/components/landing/NewSection.tsx`:
```typescript
export function NewSection({ config }: { config: NewSection }) {
  return <section>{/* Your JSX */}</section>;
}
```

4. **Update renderer** in `src/components/landing/LandingPageRenderer.tsx`:
```typescript
switch (section.type) {
  case "newsection":
    return <NewSection key={index} config={section} />;
  // ... other cases
}
```

5. **Add to JSON** in `src/config/landing-page.json`:
```json
{
  "sections": [
    {
      "type": "newsection",
      "title": "Your content"
    }
  ]
}
```

### Adding More Icons

Edit `src/components/landing/Features.tsx`:
```typescript
import { Brain, Activity, NewIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  brain: Brain,
  activity: Activity,
  newicon: NewIcon,  // Add here
};
```

Browse available icons at: https://lucide.dev/icons/

## 📱 Responsive Design

All components are fully responsive using Tailwind CSS breakpoints:
- `sm:` - 640px and up
- `md:` - 768px and up
- `lg:` - 1024px and up
- `xl:` - 1280px and up

## 🎨 Styling Guidelines

The project uses:
- **Tailwind CSS v4** for utility-first styling
- **shadcn/ui** for pre-built, customizable components
- **CSS variables** for theming (defined in `globals.css`)
- **OKLCH color space** for better color consistency

## 🔍 Type Safety

All JSON configurations are fully typed with TypeScript. If you make changes to the JSON structure, update the types in `src/types/landing-page.ts` to maintain type safety.

## 📝 Best Practices

1. **Always validate JSON** before committing changes
2. **Keep sections modular** - each section should be independent
3. **Use semantic HTML** - maintained by the components
4. **Optimize images** - compress and use modern formats (WebP, AVIF)
5. **Test responsiveness** - check all breakpoints
6. **Maintain accessibility** - components include ARIA labels where needed

## 🐛 Troubleshooting

### Build Errors
- Run `npm run build` to check for type errors
- Ensure all JSON files are valid (use a JSON validator)
- Check that all required fields in types are present in JSON

### Style Not Applying
- Clear `.next` cache: `rm -rf .next`
- Rebuild: `npm run build`
- Check Tailwind class names are correct

### Icons Not Showing
- Verify icon name exists in `iconMap`
- Check icon is imported from `lucide-react`

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Lucide Icons](https://lucide.dev/icons/)
- [OKLCH Color Picker](https://oklch.com/)

## 🤝 Contributing

When making changes:
1. Update TypeScript types if needed
2. Update this documentation
3. Test all changes locally
4. Run the build to ensure no errors

---

Built with ❤️ using Next.js 15, Tailwind CSS v4, and shadcn/ui
