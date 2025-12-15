# Environment Configuration Setup

This document explains how to set up and use environment variables in the Spectrity Instagram Frontend application.

## Quick Start

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Update the values** in `.env` to match your environment (development, staging, or production)

3. **Start the application:**
   ```bash
   npm run dev
   ```

## Environment Variables Overview

### Core Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `NODE_ENV` | enum | `development` | Application environment: `development`, `production`, or `test` |
| `PORT` | number | `3808` | Port on which the Next.js server runs |
| `HOST` | string | `0.0.0.0` | Host address for the server |
| `API_VERSION` | string | `v1` | API version for backend communication |

### Public Environment Variables

These variables are prefixed with `NEXT_PUBLIC_` and are **exposed to the browser**. Never put sensitive information in these variables.

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL | Optional | Backend API base URL (e.g., `http://localhost:5000/api`) |
| `NEXT_PUBLIC_APP_URL` | URL | Yes | Frontend application URL (e.g., `http://localhost:3808`) |
| `NEXT_PUBLIC_API_TIMEOUT` | number | No | API request timeout in milliseconds (default: 30000) |

### Analytics & Monitoring (Optional)

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `NEXT_PUBLIC_GA_TRACKING_ID` | string | No | Google Analytics tracking ID |
| `NEXT_PUBLIC_SENTRY_DSN` | string | No | Sentry DSN for error tracking |

### Feature Flags (Optional)

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | boolean | `false` | Enable/disable analytics tracking |
| `NEXT_PUBLIC_ENABLE_DEBUG` | boolean | `true` | Enable/disable debug mode |

## Environment-Specific Configuration

### Development Environment

```env
NODE_ENV=development
PORT=3808
HOST=0.0.0.0
API_VERSION=v1

NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3808
NEXT_PUBLIC_API_TIMEOUT=30000

NEXT_PUBLIC_ENABLE_DEBUG=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

### Production Environment

```env
NODE_ENV=production
PORT=3808
HOST=0.0.0.0
API_VERSION=v1

NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_API_TIMEOUT=30000

# Add your analytics IDs
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

NEXT_PUBLIC_ENABLE_DEBUG=false
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

## Usage in Code

### Using the Environment Config Module

The recommended way to access environment variables is through the centralized config module:

```typescript
import { env, isProduction, isDevelopment } from '@/lib/env.config';

// Access validated environment variables
const apiUrl = env.NEXT_PUBLIC_API_URL;
const port = env.PORT;

// Use helper functions
if (isProduction()) {
  // Production-specific code
}

if (isDevelopment()) {
  console.log('Debug info:', env);
}
```

### Using in Client Components

For client-side components, you can directly access `NEXT_PUBLIC_*` variables:

```typescript
'use client';

export function MyComponent() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const apiTimeout = Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000;

  // Use the variables
}
```

### Example: API Call with Environment Variables

```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const apiTimeout = Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000;

const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), apiTimeout);

try {
  const response = await fetch(`${apiUrl}/endpoint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (!response.ok) throw new Error('Request failed');
  return await response.json();
} catch (error) {
  if (error instanceof Error && error.name === 'AbortError') {
    console.error('Request timed out');
  } else {
    console.error('Request error:', error);
  }
}
```

## Validation

The application uses **Zod** for runtime validation of environment variables. The validation schema is defined in `src/lib/env.config.ts`.

### Validation Features:

- ✅ Type-safe environment variables
- ✅ Automatic type coercion (strings to numbers/booleans)
- ✅ Required vs optional variable enforcement
- ✅ URL format validation
- ✅ Enum validation for specific values
- ✅ Helpful error messages on startup

### Testing Validation

To test if your environment configuration is valid:

```bash
npx tsx --eval "import('./src/lib/env.config.ts').then(m => console.log('✅ Valid!', m.env))"
```

## Security Best Practices

### ⚠️ Important Security Notes:

1. **Never commit `.env` files** to version control
   - The `.gitignore` is configured to exclude `.env` files
   - Only `.env.example` should be committed

2. **Never put sensitive data in `NEXT_PUBLIC_*` variables**
   - These are exposed to the browser
   - Anyone can view them in the client-side code

3. **Use separate `.env` files for each environment**
   - `.env.development`
   - `.env.production`
   - `.env.test`

4. **Rotate credentials regularly**
   - API keys
   - Analytics IDs
   - Authentication tokens

5. **Use secrets management in production**
   - Use services like AWS Secrets Manager, HashiCorp Vault, or Vercel Environment Variables
   - Never hardcode secrets in the codebase

## Troubleshooting

### Environment variables not loading

1. **Check file location**: Ensure `.env` is in the project root
2. **Restart dev server**: Changes require a server restart
3. **Check variable names**: Must start with `NEXT_PUBLIC_` for client-side access
4. **Run validation**: Use the test command above to check for errors

### Type errors

If you get TypeScript errors related to environment variables:

```bash
npm run build
```

This will run the validation and show detailed error messages.

### Variables undefined in browser

- Only `NEXT_PUBLIC_*` variables are available in the browser
- Server-only variables (without `NEXT_PUBLIC_`) are only accessible in server components and API routes

## Additional Resources

- [Next.js Environment Variables Documentation](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Zod Documentation](https://zod.dev/)
- [dotenv Documentation](https://github.com/motdotla/dotenv)

## Support

If you encounter issues with environment configuration:

1. Check this documentation
2. Verify your `.env` file syntax
3. Run the validation test
4. Check the application logs for specific error messages
