import landingPageData from "@/config/landing-page.json";
import themeData from "@/config/theme.json";
import type { LandingPageConfig, ThemeConfig } from "@/types/landing-page";

// Cache to prevent duplicate imports and memory waste
let cachedLandingPageConfig: LandingPageConfig | null = null;
let cachedThemeConfig: ThemeConfig | null = null;

export function getLandingPageConfig(): LandingPageConfig {
  if (!cachedLandingPageConfig) {
    cachedLandingPageConfig = landingPageData as LandingPageConfig;
  }
  return cachedLandingPageConfig;
}

export function getThemeConfig(): ThemeConfig {
  if (!cachedThemeConfig) {
    cachedThemeConfig = themeData as ThemeConfig;
  }
  return cachedThemeConfig;
}
