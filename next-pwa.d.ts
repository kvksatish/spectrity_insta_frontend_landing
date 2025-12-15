declare module "next-pwa" {
  import { NextConfig } from "next";

  interface PWAConfig {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    scope?: string;
    sw?: string;
    runtimeCaching?: RuntimeCaching[];
    skipWaiting?: boolean;
    [key: string]: any;
  }

  interface RuntimeCaching {
    urlPattern: RegExp | string | ((context: { url: URL }) => boolean);
    handler: string;
    options?: {
      cacheName?: string;
      expiration?: {
        maxEntries?: number;
        maxAgeSeconds?: number;
      };
      rangeRequests?: boolean;
      [key: string]: any;
    };
  }

  function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;

  export default withPWA;
}
