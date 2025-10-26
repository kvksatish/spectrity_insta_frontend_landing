"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { FAQSection } from "@/types/landing-page";
import { ChevronDown } from "lucide-react";

interface FAQProps {
  config: FAQSection;
}

export function FAQ({ config }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-16">
          {config.badge && (
            <Badge variant="secondary" className="text-xs font-medium px-3 py-1 rounded-full border border-border/50">
              {config.badge}
            </Badge>
          )}
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl max-w-3xl">
            {config.heading}
          </h2>
          {config.description && (
            <p className="max-w-2xl text-base text-muted-foreground/80 md:text-lg">
              {config.description}
            </p>
          )}
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {config.faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-border/40 rounded-2xl bg-background/50 backdrop-blur overflow-hidden transition-all duration-300 hover:border-border/60"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left transition-colors"
              >
                <span className="text-lg font-semibold tracking-tight pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-5 pt-0">
                  <p className="text-muted-foreground/80 leading-relaxed">
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
