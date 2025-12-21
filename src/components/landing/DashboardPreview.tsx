"use client";

import Image from "next/image";
import type { DashboardPreviewSection } from "@/types/landing-page";

interface DashboardPreviewProps {
  config: DashboardPreviewSection;
}

export function DashboardPreview({ config }: DashboardPreviewProps) {
  return (
    <section className="py-12 md:py-16 lg:py-20 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="relative max-w-6xl mx-auto group cursor-pointer overflow-hidden">
          <div className="relative rounded-2xl border border-border/40 bg-background/50 backdrop-blur p-2 shadow-2xl shadow-primary/5 transition-all duration-500 group-hover:shadow-3xl group-hover:shadow-primary/10 group-hover:border-primary/30">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted/50">
              {config.image ? (
                <Image
                  src={config.image}
                  alt={config.alt || "Product Dashboard"}
                  fill
                  className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center transition-transform duration-700 ease-out group-hover:scale-105">
                  <div className="text-center space-y-4 p-8">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center transition-all duration-500 group-hover:bg-primary/20 group-hover:scale-110">
                      <svg
                        className="w-8 h-8 text-primary transition-transform duration-500 group-hover:rotate-12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-muted-foreground/70 transition-colors duration-500 group-hover:text-muted-foreground">
                      Dashboard Preview
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Decorative gradient blur */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 blur-3xl opacity-50 transition-opacity duration-500 group-hover:opacity-70" />
        </div>
      </div>
    </section>
  );
}
