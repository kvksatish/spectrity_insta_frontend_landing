import type { LandingPageConfig, ThemeConfig } from "@/types/landing-page";
import landingPageData from "@/config/landing-page.json";
import themeData from "@/config/theme.json";

export function getLandingPageConfig(): LandingPageConfig {
  return landingPageData as LandingPageConfig;
}

export function getThemeConfig(): ThemeConfig {
  return themeData as ThemeConfig;
}
