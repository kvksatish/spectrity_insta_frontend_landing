"use client";

import Link from "next/link";
import { useEffect } from "react";
import { BookDemoForm } from "@/components/BookDemoForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { HeroSection } from "@/types/landing-page";

interface HeroProps {
  config: HeroSection;
}

export function Hero({ config }: HeroProps) {
  // Pause animations when page is not visible to save memory/CPU
  useEffect(() => {
    const handleVisibilityChange = () => {
      const animations = document.querySelectorAll(
        ".animate-pulse, .animate-float",
      );
      if (document.hidden) {
        animations.forEach(
          (el) => ((el as HTMLElement).style.animationPlayState = "paused"),
        );
      } else {
        animations.forEach(
          (el) => ((el as HTMLElement).style.animationPlayState = "running"),
        );
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
  return (
    <section className="py-16 md:py-20 lg:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side - Content */}
          <div className="flex flex-col space-y-6 lg:space-y-8 text-left order-2 lg:order-1">
            {config.badge && (
              <Badge
                variant="secondary"
                className="text-xs font-medium px-3 py-1 rounded-full border border-border/50 w-fit"
              >
                {config.badge}
              </Badge>
            )}
            <div className="space-y-4 lg:space-y-6">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
                {config.heading}{" "}
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {config.subheading}
                </span>
              </h1>
              <p className="max-w-xl text-base text-muted-foreground/80 md:text-lg lg:text-xl leading-relaxed">
                {config.description}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {config.buttons.map((button, index) => {
                // Check if this is the Book Demo button
                if (button.label === "Book Demo") {
                  return (
                    <BookDemoForm key={index}>
                      <Button variant={button.variant} size="lg" className="w-full sm:w-auto">
                        {button.label}
                      </Button>
                    </BookDemoForm>
                  );
                }

                // Regular button with link
                return (
                  <Button
                    key={index}
                    asChild
                    variant={button.variant}
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    <Link href={button.href}>{button.label}</Link>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Right Side - Animation */}
          <div className="relative h-[280px] sm:h-[350px] lg:h-[450px] flex items-center justify-center order-1 lg:order-2">
            <div className="relative w-full h-full">
              {/* Animated gradient orbs */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-56 h-56 sm:w-72 sm:h-72 lg:w-96 lg:h-96">
                  {/* Main orb */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/30 to-primary/20 rounded-full blur-3xl animate-pulse" />

                  {/* Secondary orb */}
                  <div className="absolute top-1/4 right-0 w-36 h-36 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-gradient-to-br from-accent/20 via-accent/30 to-accent/20 rounded-full blur-2xl animate-pulse delay-700" />

                  {/* Tertiary orb */}
                  <div className="absolute bottom-1/4 left-0 w-32 h-32 sm:w-40 sm:h-40 lg:w-52 lg:h-52 bg-gradient-to-br from-secondary/20 via-secondary/30 to-secondary/20 rounded-full blur-2xl animate-pulse delay-1000" />

                  {/* Center icon/graphic */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-2xl bg-background/80 backdrop-blur-sm border border-border/40 shadow-2xl flex items-center justify-center animate-float">
                      <svg
                        className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-primary"
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
