"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LandingPageRenderer } from "@/components/landing/LandingPageRenderer";
import { Navigation } from "@/components/landing/Navigation";
import { InstallPrompt } from "@/components/InstallPrompt";
import { getLandingPageConfig } from "@/lib/config-loader";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const config = getLandingPageConfig();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect authenticated users to essence
    if (!loading && user) {
      router.push("/spectrity/essence");
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100" />
      </div>
    );
  }

  // Don't render landing page if user is authenticated (redirect in progress)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navigation config={config.navigation} />
      <LandingPageRenderer sections={config.sections} />
      <InstallPrompt />
    </div>
  );
}
