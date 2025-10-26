"use client";

import type { Section } from "@/types/landing-page";
import { Hero } from "./Hero";
import { DashboardPreview } from "./DashboardPreview";
import { Features } from "./Features";
import { Pricing } from "./Pricing";
import { Testimonials } from "./Testimonials";
import { CTA } from "./CTA";
import { FAQ } from "./FAQ";
import { Footer } from "./Footer";

interface LandingPageRendererProps {
  sections: Section[];
}

export function LandingPageRenderer({ sections }: LandingPageRendererProps) {
  return (
    <>
      {sections.map((section, index) => {
        switch (section.type) {
          case "hero":
            return <Hero key={index} config={section} />;
          case "dashboard":
            return <DashboardPreview key={index} config={section} />;
          case "features":
            return <Features key={index} config={section} />;
          case "pricing":
            return <Pricing key={index} config={section} />;
          case "testimonials":
            return <Testimonials key={index} config={section} />;
          case "cta":
            return <CTA key={index} config={section} />;
          case "faq":
            return <FAQ key={index} config={section} />;
          case "footer":
            return <Footer key={index} config={section} />;
          default:
            return null;
        }
      })}
    </>
  );
}
