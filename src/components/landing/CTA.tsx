"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { CTASection } from "@/types/landing-page";

interface CTAProps {
  config: CTASection;
}

export function CTA({ config }: CTAProps) {
  return (
    <section className="py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-6 rounded-3xl border border-border/40 bg-muted/40 backdrop-blur p-8 md:p-12 shadow-sm max-w-4xl mx-auto">
          <div className="space-y-4 max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              {config.heading}
            </h2>
            <p className="text-base text-muted-foreground/80 md:text-lg leading-relaxed">
              {config.description}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {config.buttons.map((button, index) => (
              <Button
                key={index}
                asChild
                variant={button.variant}
                size="lg"
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
