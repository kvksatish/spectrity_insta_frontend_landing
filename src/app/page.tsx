import { Navigation } from "@/components/landing/Navigation";
import { LandingPageRenderer } from "@/components/landing/LandingPageRenderer";
import { getLandingPageConfig } from "@/lib/config-loader";

export default function Home() {
  const config = getLandingPageConfig();

  return (
    <div className="min-h-screen">
      <Navigation config={config.navigation} />
      <LandingPageRenderer sections={config.sections} />
    </div>
  );
}
