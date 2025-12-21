"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { CTASection } from "@/types/landing-page";

interface CTAProps {
  config: CTASection;
}

export function CTA({ config }: CTAProps) {
  return (
    <section className="py-16 md:py-20 lg:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-6 md:space-y-8 rounded-2xl md:rounded-3xl border border-border/40 bg-muted/40 backdrop-blur p-6 sm:p-8 md:p-12 lg:p-16 shadow-sm max-w-4xl mx-auto">
          <div className="space-y-3 sm:space-y-4 max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
              {config.heading}
            </h2>
            <p className="text-sm text-muted-foreground/80 sm:text-base md:text-lg leading-relaxed">
              {config.description}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {config.buttons.map((button, index) => (
              <Button
                key={index}
                asChild
                variant={button.variant}
                size="lg"
                className="w-full sm:w-auto"
              >
                <Link href={button.href}>{button.label}</Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
