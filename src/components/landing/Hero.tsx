"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { HeroSection } from "@/types/landing-page";

interface HeroProps {
  config: HeroSection;
}

export function Hero({ config }: HeroProps) {
  return (
    <section className="py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Content */}
          <div className="flex flex-col space-y-6 text-left">
            {config.badge && (
              <Badge variant="secondary" className="text-xs font-medium px-2.5 py-0.5 rounded-full border border-border/50 w-fit">
                {config.badge}
              </Badge>
            )}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl leading-tight">
                {config.heading}{" "}
                <span className="text-primary">{config.subheading}</span>
              </h1>
              <p className="max-w-xl text-sm text-muted-foreground/80 md:text-base leading-relaxed">
                {config.description}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              {config.buttons.map((button, index) => (
                <Button
                  key={index}
                  asChild
                  variant={button.variant}
                  size="default"
                >
                  <Link href={button.href}>{button.label}</Link>
                </Button>
              ))}
            </div>
          </div>

          {/* Right Side - Animation */}
          <div className="relative lg:h-[400px] flex items-center justify-center">
            <div className="relative w-full h-full">
              {/* Animated gradient orbs */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-64 h-64 lg:w-80 lg:h-80">
                  {/* Main orb */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/30 to-primary/20 rounded-full blur-3xl animate-pulse" />

                  {/* Secondary orb */}
                  <div className="absolute top-1/4 right-0 w-48 h-48 bg-gradient-to-br from-accent/20 via-accent/30 to-accent/20 rounded-full blur-2xl animate-pulse delay-700" />

                  {/* Tertiary orb */}
                  <div className="absolute bottom-1/4 left-0 w-40 h-40 bg-gradient-to-br from-secondary/20 via-secondary/30 to-secondary/20 rounded-full blur-2xl animate-pulse delay-1000" />

                  {/* Center icon/graphic */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-2xl bg-background/80 backdrop-blur-sm border border-border/40 shadow-2xl flex items-center justify-center animate-float">
                      <svg
                        className="w-16 h-16 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
