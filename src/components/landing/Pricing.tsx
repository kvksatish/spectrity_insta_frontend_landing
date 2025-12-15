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
    <section className="py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-16">
          {config.badge && (
            <Badge
              variant="secondary"
              className="text-xs font-medium px-3 py-1 rounded-full border border-border/50"
            >
              {config.badge}
            </Badge>
          )}
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl max-w-3xl">
            {config.heading}
          </h2>
          <p className="max-w-2xl text-base text-muted-foreground/80 md:text-lg">
            {config.description}
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {config.plans.map((plan, index) => (
            <Card
              key={index}
              className={
                plan.highlighted
                  ? "border-primary/50 border-2 shadow-md bg-background/50 backdrop-blur"
                  : "border border-border/40 shadow-sm bg-background/50 backdrop-blur"
              }
            >
              <CardHeader className="pb-8 pt-8">
                <CardTitle className="text-xl font-semibold">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground/70">
                  {plan.description}
                </CardDescription>
                <div className="mt-6">
                  <span className="text-5xl font-bold tracking-tight">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-muted-foreground/60 ml-2 text-sm">
                      / {plan.period}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pb-8">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-1" />
                      <span className="text-sm text-foreground/80">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pb-8">
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
