"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { TestimonialsSection } from "@/types/landing-page";
import { Star } from "lucide-react";

interface TestimonialsProps {
  config: TestimonialsSection;
}

export function Testimonials({ config }: TestimonialsProps) {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-16">
          {config.badge && (
            <Badge variant="secondary" className="text-xs font-medium px-3 py-1 rounded-full border border-border/50">{config.badge}</Badge>
          )}
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl max-w-3xl">
            {config.heading}
          </h2>
          <p className="max-w-2xl text-base text-muted-foreground/80 md:text-lg">
            {config.description}
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {config.testimonials.map((testimonial, index) => {
            // Memoize star array to prevent re-creation on every render
            const stars = useMemo(
              () => Array.from({ length: testimonial.rating || 0 }, (_, i) => i),
              [testimonial.rating]
            );

            return (
              <Card key={index} className="border border-border/40 shadow-sm bg-background/50 backdrop-blur">
                <CardContent className="pt-8 pb-6 px-6 space-y-4">
                  {testimonial.rating && (
                    <div className="flex gap-0.5">
                      {stars.map((i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-primary/80 text-primary/80"
                        />
                      ))}
                    </div>
                  )}
                <p className="text-sm text-foreground/70 leading-relaxed">
                  &quot;{testimonial.content}&quot;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="font-semibold text-sm">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
