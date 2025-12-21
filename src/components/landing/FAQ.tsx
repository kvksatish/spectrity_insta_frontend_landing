"use client";

// @ts-expect-error - lucide icons don't have individual type exports
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { FAQSection } from "@/types/landing-page";

interface FAQProps {
  config: FAQSection;
}

export function FAQ({ config }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
          {config.description && (
            <p className="max-w-2xl text-sm text-muted-foreground/80 sm:text-base md:text-lg">
              {config.description}
            </p>
          )}
        </div>

        <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
          {config.faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-border/40 rounded-xl sm:rounded-2xl bg-background/50 backdrop-blur overflow-hidden transition-all duration-300 hover:border-border/60"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-4 py-4 sm:px-6 sm:py-5 flex items-center justify-between text-left transition-colors"
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="text-sm sm:text-base md:text-lg font-semibold tracking-tight pr-3 sm:pr-4 leading-snug">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                id={`faq-answer-${index}`}
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-4 pb-4 pt-0 sm:px-6 sm:pb-5">
                  <p className="text-xs sm:text-sm text-muted-foreground/80 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
