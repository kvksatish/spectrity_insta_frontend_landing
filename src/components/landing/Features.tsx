"use client";

import type { LucideIcon } from "lucide-react";
// @ts-expect-error - lucide icons don't have individual type exports
import Activity from "lucide-react/dist/esm/icons/activity";
// @ts-expect-error - lucide icons don't have individual type exports
import Brain from "lucide-react/dist/esm/icons/brain";
// @ts-expect-error - lucide icons don't have individual type exports
import Code from "lucide-react/dist/esm/icons/code";
// @ts-expect-error - lucide icons don't have individual type exports
import Shield from "lucide-react/dist/esm/icons/shield";
// @ts-expect-error - lucide icons don't have individual type exports
import Users from "lucide-react/dist/esm/icons/users";
// @ts-expect-error - lucide icons don't have individual type exports
import Zap from "lucide-react/dist/esm/icons/zap";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { FeaturesSection } from "@/types/landing-page";

interface FeaturesProps {
  config: FeaturesSection;
}

const iconMap: Record<string, LucideIcon> = {
  brain: Brain,
  activity: Activity,
  shield: Shield,
  zap: Zap,
  users: Users,
  code: Code,
};

export function Features({ config }: FeaturesProps) {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-12 md:mb-16">
          {config.badge && (
            <Badge
              variant="secondary"
              className="text-xs font-medium px-3 py-1 rounded-full border border-border/50"
            >
              {config.badge}
            </Badge>
          )}
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl max-w-3xl">
            {config.heading}
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground/80 sm:text-base md:text-lg">
            {config.description}
          </p>
        </div>
        <div className="grid gap-6 md:gap-8 md:grid-cols-2 max-w-7xl mx-auto">
          {config.features.map((feature, index) => {
            const Icon = iconMap[feature.icon] || Brain;
            return (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl md:rounded-3xl border border-border/40 bg-background/50 backdrop-blur shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
              >
                {/* Image Background */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted/50">
                  {feature.image ? (
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5">
                      <Icon className="w-12 h-12 sm:w-16 sm:h-16 text-primary/30" />
                    </div>
                  )}

                  {/* Gradient Overlay - More visible on mobile, intensifies on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent opacity-70 md:opacity-60 group-hover:opacity-90 transition-opacity duration-500" />

                  {/* Icon Badge - Top Right - Visible on mobile, animated on desktop hover */}
                  <div className="absolute top-4 right-4 sm:top-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-background/80 backdrop-blur-sm border border-border/40 flex items-center justify-center shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                  </div>
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 md:p-10 transition-all duration-500">
                  <div className="space-y-2 sm:space-y-3 transform transition-transform duration-500 md:group-hover:-translate-y-3">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-sm sm:text-base md:text-lg text-foreground/70 leading-relaxed opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 md:delay-100 max-w-2xl">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
