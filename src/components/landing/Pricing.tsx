"use client";

// @ts-expect-error - lucide icons don't have individual type exports
import Check from "lucide-react/dist/esm/icons/check";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PricingSection } from "@/types/landing-page";

interface PricingProps {
  config: PricingSection;
}

export function Pricing({ config }: PricingProps) {
  return (
    <section className="py-16 md:py-20 lg:py-24">
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
        <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {config.plans.map((plan, index) => (
            <Card
              key={index}
              className={
                plan.highlighted
                  ? "border-primary/50 border-2 shadow-lg bg-background/50 backdrop-blur relative"
                  : "border border-border/40 shadow-sm bg-background/50 backdrop-blur"
              }
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-6 pt-8 md:pb-8">
                <CardTitle className="text-lg sm:text-xl font-semibold">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground/70">
                  {plan.description}
                </CardDescription>
                <div className="mt-4 sm:mt-6">
                  <span className="text-4xl sm:text-5xl font-bold tracking-tight">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-muted-foreground/60 ml-2 text-xs sm:text-sm">
                      / {plan.period}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pb-6 md:pb-8">
                <ul className="space-y-2.5 sm:space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2.5 sm:gap-3">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5 sm:mt-1" />
                      <span className="text-xs sm:text-sm text-foreground/80 leading-snug">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pb-6 md:pb-8">
                <Button
                  asChild
                  variant={plan.highlighted ? "default" : "outline"}
                  className="w-full"
                  size="lg"
                >
                  <Link href={plan.buttonHref}>{plan.buttonText}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
